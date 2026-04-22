---
type: best-practices
best_practice_name: vibe-coding
category: software
version: 1.0
updated: 2026-04-18
tags: [vibe-coding, project-planning]
status: draft-v1
---

# Vibe Coding Best Practices

## When To Use This

Use this document when an LLM is the primary author of the code — writing from a natural-language spec with minimal manual intervention. Open it before the first line of implementation is generated, not after the demo fails review.

Open it when you need to:
- stop a vibe-coded project from becoming "fake complete"
- build the config layer correctly before features sprawl
- set up testing that exercises real behavior, not mock echoes
- prevent hardcoded paths, secrets, and URLs
- make the code maintainable by a different agent on a different day
- establish the git, lint, and audit gates that catch drift before ship

This is the "how" companion to the **Vibe Coding Primer**, which covers the "why."

---

## What This Covers

- the config layer (schema, env-var interpolation, loader)
- secrets handling (env vars, gitleaks, ship audit)
- testing discipline (unit, integration, volume, dependency-specific, prompt-injection)
- comments and documentation (WHY, not WHAT, with ADRs)
- error handling and structured logging
- file and module discipline
- dependency hygiene
- git discipline and hook layout
- lint and typecheck gates
- compaction and handoff protocol
- "fake complete" self-audit
- anti-patterns to reject on sight

It is the deeper execution-time standard under the **Vibe Coding Primer**. Snippets are TypeScript-flavored because the Vibe Coding Framework MCP is TS; the principles are language-neutral.

---

## Quick Index

- [Non-negotiable standards](#non-negotiable-standards)
- [Config layer](#config-layer)
- [Secrets handling](#secrets-handling)
- [Testing discipline](#testing-discipline)
- [Comments and documentation](#comments-and-documentation)
- [Error handling](#error-handling)
- [File and module discipline](#file-and-module-discipline)
- [Dependency hygiene](#dependency-hygiene)
- [Git discipline](#git-discipline)
- [Lint and typecheck gates](#lint-and-typecheck-gates)
- [Compaction and handoff](#compaction-and-handoff)
- [Fake-complete prevention](#fake-complete-prevention)
- [Anti-patterns](#anti-patterns)
- [Checklists](#checklists)

---

## Decision Guide

### Write it as config, not code, when
- the value changes between dev, staging, and prod
- the value is a path, port, URL, credential, feature flag, or model alias
- a second deployment of the same code would need a different value

### Write a dedicated test file when
- the thing being tested is an external dependency (DB, cache, MQ, LLM endpoint, payment gateway)
- the thing being tested accepts user input that reaches an LLM (prompt-injection tests)
- the spec names a scale target (volume tests at 10x that target)

### Extract a function when
- the same or near-same logic has been regenerated in two or more places
- the regeneration is likely to continue as the LLM touches more files
- the shared concept is stable enough to name

### Reject a dependency when
- you cannot find the package on the canonical registry at the claimed version
- the package was "recommended" by the model without a verified import in your codebase
- a 20-line stdlib implementation would do the same job

### Stop the build and hand off when
- the review gate is due
- the next phase requires a different builder persona
- context compaction is near and the decision log is unflushed

---

## Core Rules

1. **Config layer exists before feature code exists.** Not after, not concurrent, before.
2. **No literal paths, URLs, ports, or endpoints outside schema defaults.**
3. **Secrets live in env vars. Files only if they are gitignored and local.**
4. **Tests exercise real behavior, not mock shapes.**
5. **Volume tests scale to 10x the spec's stated target.**
6. **Every external dependency has its own test file.**
7. **Comments explain WHY. WHAT is readable from the code.**
8. **Errors have narrow catches, explicit envelopes, and structured logs.**
9. **Files are small and single-responsibility. No `utils.ts` junk drawers.**
10. **Dependencies are pinned, verified, and earn their maintenance cost.**
11. **Commits are per logical change, with a post-commit daily-log hook.**
12. **Lint and typecheck failures block merge. No blanket `any`, no `eslint-disable` without a reason comment.**
13. **Before calling work complete, run the code end-to-end — not just the test suite.**

---

## Non-Negotiable Standards

- **NEVER** commit a hardcoded path outside a schema default.
- **NEVER** commit a secret — not in source, not in tests, not in sample files, not in generated docs.
- **NEVER** use `catch(e) {}`, `except: pass`, or an equivalent silent swallow.
- **NEVER** use a dependency without verifying it exists on the canonical registry at the claimed version.
- **NEVER** ship a `// TODO` that references incomplete security work.
- **NEVER** mark work complete by grepping for the feature name. Run the feature end-to-end.
- **NEVER** use blanket `any` (TS) or equivalent type escape hatches without a reason comment.
- **ALWAYS** route environment-specific values through the config loader.
- **ALWAYS** pin dependency versions and commit the lockfile.
- **ALWAYS** write a WHY comment above every non-trivial function.
- **ALWAYS** run lint, typecheck, and the full test suite before declaring done.
- **YOU MUST** log decisions that deviate from the plan in the decision log, in the same commit.

---

## Config Layer

### The shape

- single `config.yaml` per project (or `~/.vcf/config.yaml` for user-level)
- a schema file (JSON Schema + Zod, or equivalent) that validates at load
- `config.example.yaml` committed; `config.yaml` gitignored
- environment variable interpolation: `${VAR}` resolves at load; `${VAR:-default}` supports defaults
- no secrets in the YAML — only references to env vars

### Minimal loader (TypeScript example)

```ts
// config/loader.ts
// WHY: config is the one source of truth for paths, endpoints, and model aliases.
// Every other module reads from the validated config object — never from process.env directly.
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";

const ConfigSchema = z.object({
  workspace: z.object({
    allowed_roots: z.array(z.string()).min(1),
    specs_dir: z.string().default("~/vcf/specs"),
  }),
  endpoints: z.array(
    z.object({
      name: z.string(),
      base_url: z.string().url(),
      auth_env_var: z.string(), // the NAME of the env var, not the secret
      trust_level: z.enum(["local", "trusted", "external"]),
    })
  ),
});

export type Config = z.infer<typeof ConfigSchema>;

const ENV_RE = /\$\{([A-Z_][A-Z0-9_]*)(?::-([^}]*))?\}/g;

function interpolate(raw: string): string {
  // WHY: ${VAR} resolves to env value; ${VAR:-default} falls back when unset.
  // Missing vars without a default throw — we never silently ship empty credentials.
  return raw.replace(ENV_RE, (_, name, fallback) => {
    const v = process.env[name];
    if (v !== undefined) return v;
    if (fallback !== undefined) return fallback;
    throw new Error(`config: required env var ${name} is unset`);
  });
}

export function loadConfig(path: string): Config {
  const raw = readFileSync(path, "utf8");
  const interpolated = interpolate(raw);
  const parsed = parse(interpolated);
  return ConfigSchema.parse(parsed); // throws on schema mismatch with readable error
}
```

### Config drift detection

- CI job runs `grep -rn` for literal paths, URLs, and port numbers against source; fails if anything appears outside `schema/` or test fixtures.
- `vcf verify` (or equivalent) lints `config.example.yaml` against the schema — example stays truthful.
- Frontmatter in spec and plan carry the same path/endpoint names; drift between spec and config is a planning bug.

### Rule

A project should not require reading source internals to understand runtime configuration. If a reader cannot trace a value from `config.yaml` to the code that uses it, the config layer is leaky.

---

## Secrets Handling

### Storage

- **Env vars only** at runtime. The config YAML references `${VAR}`; the secret itself never appears in committed files.
- `.env` file for local dev is gitignored by default. `.env.example` committed with placeholder values.
- CI secrets live in the CI provider's secret store (GitHub Actions secrets, etc.), injected as env vars at run time.
- Production secrets live in the platform's secret manager (Vault, AWS SM, etc.) or platform env vars.

### Three-pass gate

1. **Pre-commit:** `gitleaks` (or equivalent) scans the staged diff. Block on finding.
2. **Pre-push:** `gitleaks` runs again against the full branch. Block on finding. Second pass catches what the first missed.
3. **Ship audit:** `gitleaks` + `trufflehog` run against the full tree before release. Block on finding.

```yaml
# .gitleaks.toml (sketch)
[allowlist]
  paths = ['''\.git/''', '''docs/examples/''']
  # WHY: allowlist only example docs that intentionally demonstrate placeholder keys.
  # Production code has no allowlist — any match is a real leak.
```

### Redaction before network calls

- Any outbound LLM or API call passes through a redactor that strips common secret patterns (AWS keys, JWT-looking strings, high-entropy tokens).
- On non-local endpoints, redaction is on by default. Disabling it requires a config flag and is logged.

### Rule

The grep test: `grep -rni "sk-\|AKIA\|xoxb-\|eyJ" src/` (and your own project's secret prefixes) on the main branch returns nothing — or the project has already leaked.

---

## Testing Discipline

### The four layers

1. **Unit tests** — exercise real logic of a single function or module. If the test mocks the thing it is supposed to test, it is not a unit test.
2. **Integration tests** — hit real dependencies or containerized equivalents (testcontainers, localstack, a real Postgres in docker). Mocks at this layer defeat the point.
3. **Volume tests** — run the system at 10x the spec's declared scale. Spec says 1,000 users? Volume tests exercise 10,000.
4. **Dependency tests** — one test file per external dependency. A project with Postgres, Redis, an LLM endpoint, and Stripe has four dedicated dependency test files, each exercising the edges (connection loss, rate limit, malformed response, auth failure).

### Prompt-injection tests

For any input path where user text reaches an LLM:
- inject "ignore previous instructions" and variants
- inject system-prompt-looking structure
- inject encoded payloads (base64, unicode tricks, zero-width joiners)
- assert the output schema is still valid and no secret/internal tool is surfaced

This is non-optional for AI-native products. The Windsurf memory-poisoning incident and CurXecute (CVE-2025-54135) both came from data-channel injections that slipped past happy-path tests.

### What counts as a real test

Good:
```ts
// Exercises the real compaction boundary logic including an error path.
it("drops oldest-first and emits a warning when over budget", async () => {
  const ctx = makeContext({ messages: manyMessages(1000), tokenBudget: 500 });
  const result = await compact(ctx);
  expect(result.messages.length).toBeLessThan(1000);
  expect(result.warnings).toContain("dropped-for-budget");
  expect(result.messages[0].role).toBe("system"); // system preserved
});
```

Bad:
```ts
// Tautological: the mock returns what the implementation will return.
it("calls compact", async () => {
  const compact = jest.fn().mockResolvedValue({ messages: [] });
  await compact({});
  expect(compact).toHaveBeenCalled();
});
```

### Coverage is a diagnostic, not a goal

Coverage tells you which lines are untouched. It does not tell you whether the lines that *are* touched exercise the real behavior. A 95%-covered project with mock-only tests is weaker than a 60%-covered project with integration tests that hit a real DB.

### Rule

A passing test suite that fails to validate the real behavior is worse than no tests at all — because it produces a green signal that survives review.

---

## Comments and Documentation

### WHY, not WHAT

Bad:
```ts
// increment the counter
counter++;
```

Good:
```ts
// WHY: we count retries per endpoint, not per request, because rate limits are
// enforced by the provider per API key — not per caller.
counter++;
```

### File-level comment

Every non-trivial file opens with a short comment explaining the module's role and its non-obvious constraints.

```ts
// review/prepare.ts
// WHY: review packages are built by copying the reviewer template into a fresh
// .review-runs/<type>-<ts>/ directory. The template is never mutated in place —
// this keeps reviews disposable and one run's exfiltration surface contained
// to a single directory (see AGENTS.md "disposable review runs" non-negotiable).
```

### ADR-lite decision log

Every decision that deviates from the plan — or fills a gap the plan left open — gets a decision-log entry in `plans/decisions/YYYY-MM-DD-<slug>.md` with:

- what was decided
- what was considered
- why this was picked
- what triggers reconsidering

The decision log is fed to reviewers alongside the response log. Without it, reviewers flag the same "bug" on every pass — even when the "bug" is a valid design choice nobody recorded.

### Daily log via post-commit hook

The builder does not have to remember to log. A `post-commit` hook appends commit subject, timestamp, and files changed to `memory/daily-logs/YYYY-MM-DD.md`. The hook is authority; the LLM instruction is for politeness.

### Rule

Every piece of documentation should pass one test: *Can someone reproduce this in six months with zero additional context?* If not, it is not documentation — it is author-present-tense notes that will rot.

---

## Error Handling

### Explicit envelopes

Errors propagate as typed structures, not as bare exceptions that the caller has to guess about.

```ts
// WHY: explicit error shape lets callers branch on kind without string matching.
// String-matched errors rot the moment the message is rephrased.
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { kind: "not-found" | "timeout" | "invalid"; detail: string } };
```

### Narrow catches

```ts
// Bad: swallows everything including programmer errors.
try { await doWork(); } catch (e) { /* oh well */ }

// Good: catch the expected, let the unexpected surface.
try {
  await doWork();
} catch (e) {
  if (e instanceof TimeoutError) {
    log.warn({ op: "doWork", kind: "timeout" }, "retryable timeout");
    return { ok: false, error: { kind: "timeout", detail: e.message } };
  }
  throw e; // unknown — fail loudly, don't hide it
}
```

### Structured logging

- use a logger that emits JSON (pino, structlog, slog, zap — all fine)
- every log line has: `level`, `ts`, `op`, `kind`, `request_id` or `run_id` where applicable
- no `console.log` in shipped code

### Fail fast in development

In `NODE_ENV=development` or equivalent, unknown errors crash the process. In production they degrade and log. The spec says which behaviors degrade and which halt — "silent degrade everywhere" is how bad data accumulates.

### Rule

If the only way the system behaves coherently is when nothing goes wrong, the error handling does not exist.

---

## File and Module Discipline

- **Small files.** When a file exceeds ~300 lines or covers more than one conceptual responsibility, split it.
- **Single-responsibility modules.** A module named for a concept does one thing. `auth.ts` handles auth. `config/loader.ts` loads config. `utils.ts` is a smell — rename or split.
- **No junk drawers.** Helpers live with the concept they serve. If a helper is shared, it moves to a named module.
- **No dead code.** Removed features are removed, not commented out. Git history preserves the old version.
- **No placeholders in shipped code.** `TODO`, `FIXME`, `NotImplementedError`, `...`, `pass` — these are incomplete markers, not features. Strip before shipping or replace with a tracked issue link.

### Rule

A new reader should be able to navigate the project by module name alone. If they need the commit history to find where something lives, the module layout is weak.

---

## Dependency Hygiene

- **Pin versions.** `"lodash": "4.17.21"`, not `"lodash": "^4"`. Commit the lockfile.
- **Verify before adding.** LLMs hallucinate package names at non-trivial rates (industry-observed in a meaningful share of recommendations, 2025 studies). Before `npm install <pkg>`, confirm the package exists on the canonical registry and the name matches the recommended import.
- **Audit in CI.** `npm audit`, `pnpm audit`, `pip-audit`, `cargo audit` — fail the build on high-severity CVEs.
- **Reject transitive bloat.** Running `du -sh node_modules` with a single new dependency should not jump 100MB. If it does, the package is a framework, not a library.
- **Prefer stdlib.** A 20-line stdlib implementation beats a 50-transitive-dependency package for trivial work.
- **Name the owner.** Every non-trivial dependency has a one-line entry in the decision log: why this package, why this version, who is accountable for updating it.

### Rule

Every dependency earns its future maintenance cost or it does not belong.

---

## Git Discipline

### Commits

- one logical change per commit; the subject line is readable as past tense action ("add config loader schema," "fix timeout propagation in review_prepare")
- conventional commits optional, not required
- commits include the decision-log entry and the test update when they apply

### Hooks

Installed by `vcf init` (or equivalent):

- **`pre-commit`** — `gitleaks`, `lint --staged`, format check
- **`pre-push`** — `gitleaks` second pass, uncommitted-artifact warning, optional full test run
- **`post-commit`** — append to `memory/daily-logs/YYYY-MM-DD.md` (subject, files, timestamp)

### Branching

- feature branches short-lived (< 1 week ideally)
- main is always green; review gates fire on merge requests
- rebase to tidy before merge is fine; rewriting shared history is not

### Rule

If the builder has to remember to log, the log will not exist. Make the hook authority.

---

## Lint and Typecheck Gates

- lint and typecheck run in CI; failures block merge
- lint rules committed in the repo, not assumed from editor config
- no blanket type escape hatches (`any` in TS, `# type: ignore` in Python) without a reason comment on the same or adjacent line
- no `// eslint-disable` without a reason comment explaining why the rule is wrong here

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// WHY: third-party SDK's callback payload is untyped upstream (see issue #412).
// Narrow to `unknown` and validate at use site below.
function onEvent(payload: any) { /* ... */ }
```

### Rule

Disabling a lint rule without a comment is lying about the code quality to the next reader.

---

## Compaction and Handoff

### Builder-to-reviewer handoff

The builder hands off with three artifacts in the repo, all committed:

- **decision log** — what was decided, what was considered, why
- **response log** — replies to prior review findings (agree + fixed, or disagree + why)
- **changed-files list** — scoped diff for the reviewer to focus on

Reviewer reads all three before the review, not just the diff. This prevents the "reviewer flags the same bug on every pass" loop.

### Builder-to-builder handoff (type swap)

Backend builder finishes a phase, compaction is near. The plan specifies:

- current session writes the phase summary into `plans/decisions/`
- next session loads: plan + spec + decision log + the new phase's best-practice doc (e.g., `frontend-best-practices.md`)
- the new session's builder.md swaps in (frontend persona, design system context)

Builders do not carry context across compactions. Files do.

### Fresh-context self-audit

When a new builder session starts on an existing project, it reads:

1. `CLAUDE.md` / `AGENTS.md` (non-negotiables)
2. `plans/<name>-plan.md` (the plan)
3. `plans/decisions/` (what changed)
4. `plans/reviews/response-log.md` (what was agreed / disputed)
5. recent `memory/daily-logs/`

Skipping any of these is how a second session rewrites what the first session decided.

### Rule

Every handoff is a test of the documentation system. If the next agent can't resume, the docs aren't done.

---

## Fake-Complete Prevention

The single most common vibe-coding failure: code compiles, tests pass, feature name appears in source, and the feature does not actually work. The review system's Stage 1 exists specifically for this.

### Self-audit before marking complete

Before declaring work done:

1. **Run the feature end-to-end** — not `npm test`, but the actual user path. If it's a CLI, run the CLI. If it's an API, call the API. If it's a UI, click through it.
2. **Break it on purpose once.** Pass bad input. Kill the DB mid-call. See if the error path does what the spec says it does.
3. **Read the diff as if you did not write it.** Does the code actually implement what the PR description claims?
4. **Check the config grep.** `grep -rn "hardcoded-value-you-know-you-used" src/` should return nothing outside schema defaults.
5. **Check the `TODO` grep.** `grep -rn "TODO\|FIXME\|XXX" src/` returns only intentional, tracked items.

### The "grep the feature name" trap

The LLM's instinct is to search for the feature name, find a matching function, and declare victory. That function might be a stub. It might be called from a path that is never reached. It might throw immediately and the caller swallows it. Stage 1 review exists because this trap is the norm, not the exception.

### Rule

If you cannot run the code end-to-end and see the feature work against real (or realistically containerized) dependencies, the feature is not complete.

---

## Anti-Patterns

Call these out on sight. Every one of these has been found in shipped vibe-coded code in 2025-2026.

- **`catch(e) {}`** and friends — silent swallow, hides real failure, corrupts data.
- **`process.env.FOO` scattered through source** — config layer bypassed; value appears nowhere in schema; drift guaranteed.
- **Absolute paths in source** — `/home/user/projects/foo/data.json` ships and breaks on every other machine.
- **Magic numbers** — `if (tries > 3)` with no named constant, no explanation.
- **Mock-only test files** — every external call stubbed to return the expected shape; suite is green; integration is broken.
- **Copy-pasted logic across files** — the LLM regenerated the same function three times because the prompt didn't reference the existing one.
- **`// eslint-disable-next-line` with no reason** — rule silenced on trust; next reader has no idea why.
- **Unpinned dependencies** — `"*"` ranges, floating tags, "latest" in Docker base images.
- **Hallucinated packages** — `npm install some-convenient-helper` that the model invented; name might now be squatted by an attacker.
- **`any` (TS) or `Dynamic` (elsewhere) everywhere** — type safety abandoned; runtime errors will discover what the compiler refused to.
- **`console.log` in shipped code** — no level, no structure, no correlation ID, noise that hides signal.
- **`TODO: add auth here`** in production paths — explicit known-broken code shipped as if reviewed.
- **"it works on my machine" features** — runtime depends on a local tool, a specific OS, or a shell that isn't declared in the dependencies.
- **Prompt passthrough with no sanitization** — user text concatenated into a system prompt; no redaction, no schema validation on the response.
- **"The AI already handled it"** as a waiver for design review, negative testing, or dependency hygiene (industry-flagged risk, 2026).

---

## OS / Environment Notes

### macOS
Local `~/Library/...` paths are dev conveniences, not runtime contracts. Route all paths through config.

### Linux
XDG variables (`$XDG_CONFIG_HOME`, `$XDG_DATA_HOME`) should be honored by the config loader with safe defaults.

### Windows
Path separators, shell behavior, and env-var expansion differ. Use the language's path abstractions (Node's `path.posix` at boundaries, Python's `pathlib`). Test on Windows in CI if the project ships there.

### Rule

Only include platform-specific guidance where the implementation actually changes. Everything else routes through config and stays OS-neutral.

---

## Checklists

### Pre-Implementation Checklist
- [ ] Config schema drafted; every path, port, URL, credential, and tunable named
- [ ] `config.example.yaml` will be committed; real `config.yaml` gitignored
- [ ] Test plan names a file per external dependency
- [ ] Prompt-injection tests planned for every user-text → LLM path
- [ ] Volume test target is 10x the spec's scale number
- [ ] Review gates named in the plan
- [ ] Compaction and builder-swap points named in the plan
- [ ] Decision-log and daily-log hooks will be installed at init

### Meaningful-Test Checklist
- [ ] Unit tests exercise real logic, not mock shapes
- [ ] Integration tests hit real or containerized dependencies
- [ ] Volume test reaches 10x the spec target
- [ ] Each external dependency has a dedicated test file
- [ ] Prompt-injection tests exist wherever user text reaches an LLM
- [ ] The suite fails when the code is actually broken (mutation-test a change to confirm)

### Config-Layer Checklist
- [ ] No literal paths, ports, URLs, or endpoints in `src/` outside schema defaults
- [ ] No `process.env.FOO` inline; all env access goes through the loader
- [ ] Schema validates at load; missing required env vars throw
- [ ] `config.example.yaml` passes the schema

### Secrets Checklist
- [ ] `gitleaks` runs pre-commit
- [ ] `gitleaks` runs pre-push
- [ ] Ship audit runs `gitleaks` + `trufflehog` against full tree
- [ ] No `.env` committed; `.env.example` committed with placeholders
- [ ] Redaction enabled on non-local endpoints

### Pre-Ship Self-Audit
- [ ] Feature runs end-to-end against real (or containerized) dependencies
- [ ] Intentional-failure test confirms error paths behave per spec
- [ ] No hardcoded paths (`grep -rn` clean outside schema)
- [ ] No shipped `TODO`/`FIXME` in security-relevant code
- [ ] Lint, typecheck, and full test suite green
- [ ] Decision log and response log current
- [ ] Daily log current through the final commit

---

## Related Primers

- Vibe Coding Primer
- Coding Primer
- Security Primer
- LLM Integration Primer
- Production Primer
- Git / Change Safety Primer
- Project Planning Primer

---

## Related Best Practices

- Coding Best Practices
- Security Best Practices
- LLM Integration Best Practices
- Production Best Practices
- Git / Change Safety Best Practices
- Project Planning Best Practices
- Front Matter & Documentation Best Practices
- Cost Efficiency Best Practices
- Claude Code / Coding-Agent Best Practices

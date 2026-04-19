---
type: best-practices
best_practice_name: mcp
category: ai
version: 2.0
updated: 2026-04-18
status: draft-v2
---

# MCP Best Practices

## When To Use This

Use this document when building, packaging, or maintaining a Model Context Protocol (MCP) server — especially one that will ship on npm, be consumed by more than one client, and expose a non-trivial tool surface.

Open it when you need to:
- shape a tool schema (inputs, outputs, error envelope)
- wire stdio or Streamable HTTP transport correctly
- implement progress, cancellation, or streaming
- design audit, redaction, and scope enforcement
- publish to npm with provenance and a `.mcp.json`-ready binary
- write parity tests across clients
- version a breaking change without stranding users

This is the execution-time reference under the **MCP Primer**. The primer answers "what and why"; this doc answers "how."

---

## Target Versions (as of 2026-04-18)

- Protocol spec: **2025-11-25** (current). Older: 2025-03-26, 2024-11-05.
- Transports: **stdio** (default for local) and **Streamable HTTP** (remote). HTTP+SSE is deprecated.
- TypeScript SDK: **`@modelcontextprotocol/sdk` 1.x** (1.29 at time of writing). v2 is pre-alpha; stay on 1.x for production. v1.x receives fixes for at least 6 months after v2 ships.
- Node: **≥ 20 LTS**. Use ESM (`"type": "module"`).
- Schema: Standard Schema compatible (Zod v4, Valibot, ArkType). Zod v4 is the default recommendation.

Pin these. Re-review on each protocol spec release.

---

## What This Covers

- TypeScript project shape, packaging, and npm publish
- Tool, resource, and prompt schema patterns
- Output contract and error envelope
- JSON-RPC error semantics (throw vs. structured error)
- Progress, cancellation, streaming
- Logging, audit, and secret redaction
- Security: path scoping, symlink resolution, env interpolation, endpoint trust
- Testing: unit, integration, client-parity
- Client wiring: `.mcp.json`, stdio vs. Streamable HTTP
- Versioning and breaking-change discipline
- Performance, indexes, lazy loading
- Observability in stdio mode (without breaking the protocol)
- Anti-patterns

---

## Quick Index

- [Project shape and packaging](#project-shape-and-packaging)
- [Tool schema patterns](#tool-schema-patterns)
- [Output contract and error envelope](#output-contract-and-error-envelope)
- [JSON-RPC error semantics](#json-rpc-error-semantics)
- [Resources and prompts](#resources-and-prompts)
- [Progress, cancellation, streaming](#progress-cancellation-streaming)
- [Security and scope enforcement](#security-and-scope-enforcement)
- [Logging, audit, redaction](#logging-audit-redaction)
- [Testing](#testing)
- [Client wiring and transport](#client-wiring-and-transport)
- [Versioning and breaking changes](#versioning-and-breaking-changes)
- [Performance and lazy loading](#performance-and-lazy-loading)
- [Observability in stdio mode](#observability-in-stdio-mode)
- [Anti-patterns](#anti-patterns)
- [Checklists](#checklists)

---

## Project Shape and Packaging

A typical MCP server on npm looks like:

```
@vendor/mcp-thing/
  package.json
  tsconfig.json
  tsup.config.ts
  src/
    index.ts            # CLI entry (parses --scope etc, launches server)
    server.ts           # createServer() — transport-agnostic
    tools/*.ts          # one tool per file
    resources/*.ts
    prompts/*.ts
    schema/*.ts         # zod schemas shared server-wide
    util/
      audit.ts
      paths.ts          # allowed-root + symlink resolution
      redact.ts
  dist/                 # built output — never ship raw TS
  test/
```

`package.json` essentials:

```json
{
  "name": "@vendor/mcp-thing",
  "type": "module",
  "engines": { "node": ">=20" },
  "bin": {
    "mcp-thing": "dist/index.js"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": "./dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "zod": "^4.0.0"
  },
  "publishConfig": { "access": "public", "provenance": true }
}
```

Guidelines:

- Ship **built JS only**. No TS, no source maps in the published tarball unless you explicitly want them.
- Dual bins in one package are fine (e.g. `cli` and `cli-mcp`). Keep the server binary minimal — parse args, start transport, exit on signal.
- Use `tsup` or equivalent for ESM output; keep a CJS fallback only if a known consumer needs it.
- Publish with `--provenance` once the package has a GitHub Actions release pipeline.
- `npx -y @vendor/mcp-thing` must work — users configure `.mcp.json` to invoke via npx before global install.

---

## Tool Schema Patterns

Use Zod (or another Standard Schema library) for every tool's input. Enforce strictness.

```ts
import { z } from "zod";

const IdeaCaptureInput = z.object({
  content: z.string().min(1).max(10_000),
  context: z.string().max(2_000).optional(),
  tags: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).max(16).default([]),
  expand: z.boolean().default(false),
}).strict();
```

Rules:

- **`.strict()` by default.** Reject unknown fields — they usually signal client/server drift.
- **Enums over free strings** for anything with a fixed vocabulary (review types, scopes, build targets).
- **Discriminated unions** for tools that have genuinely different modes. Do not overload a single flat schema with mutually-exclusive flags.
- **Length caps on every string** and size caps on every array. Unbounded inputs are a DoS surface.
- **Normalize at boundary.** Lowercase tags, trim strings, resolve paths once — never twice later.
- **No secrets in the schema.** API keys live in env/config, never as a tool input.
- **Descriptions are LLM-facing documentation.** Make them specific: "Write a captured idea to `<ideas-dir>/YYYY-MM-DD-<slug>.md`. Returns `{paths, summary}`; pass `expand=true` to include the written content." Short and concrete.

Tool naming:
- `noun_verb` (e.g. `idea_capture`, `review_prepare`, `ship_audit`). Consistent across the server.
- Scope tools aggressively — a tool that does three distinct things is three tools.

---

## Output Contract and Error Envelope

Adopt a project-wide default shape. For VCF-MCP this is:

```ts
type DefaultOutput = {
  ok: true;
  paths: string[];          // absolute paths to written/touched artifacts
  summary: string;          // one paragraph, model-readable
  expand_hint?: string;     // how to re-call with expand=true
  content?: unknown;        // only when expand=true
};

type ErrorOutput = {
  ok: false;
  code: string;             // stable machine code (e.g. "E_SCOPE_DENIED")
  message: string;          // human-readable
  detail?: unknown;         // structured detail, redacted
  retryable: boolean;
};
```

Rules:

- **`paths + summary` by default; `content` only when `expand=true`.** This is the token-economy lever.
- **Stable error codes.** Clients branch on code, not on prose.
- **`retryable: boolean`** tells the caller whether to try again without user intervention.
- **Never return secrets, full env, or raw stack traces** in outputs. Redact before serialization.
- **Large content via resources, not tool results.** If a "content" is > a few KB, write it to a file or expose it as a resource URI; return the URI in `paths`.

Pattern for returning:

```ts
return {
  content: [{ type: "text", text: JSON.stringify({
    ok: true,
    paths: [writtenPath],
    summary: `Captured idea "${slug}" with ${tags.length} tags.`,
    expand_hint: "Re-call with expand=true to include the written content.",
  })}],
};
```

(The SDK's `content` array is the wire format; your structured payload is one `text` element inside it.)

---

## JSON-RPC Error Semantics

MCP rides JSON-RPC 2.0. The SDK maps thrown errors to JSON-RPC error responses.

Use structured errors (the `ErrorOutput` envelope above) for **domain errors** — validation, scope violations, "not found," expected failure modes. Return them inside a normal tool result with `ok: false`. The LLM can read and act on them.

**Throw** only for **protocol-level errors** — malformed JSON-RPC, internal bug, transport failure. These become JSON-RPC error responses with standard codes (`-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32603` internal error). The LLM will not see rich detail for these.

Rule of thumb: if the model could usefully recover, return `ok: false`. If the model can do nothing, throw.

Never throw raw `Error` with a message that includes user input or secrets. Wrap:

```ts
class McpError extends Error {
  constructor(public code: string, public safeDetail?: unknown, cause?: unknown) {
    super(code);
    this.cause = cause;
  }
}
```

---

## Resources and Prompts

**Resources** are the right primitive when the client should be able to *read* something by URI (a file, a KB entry, a rendered config). Implement `resources/list` (cheap — metadata only) and `resources/read` (lazy — only when requested). Do not return resource content in `resources/list`.

```ts
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: primers.map(p => ({
    uri: `vcf://primer/${p.name}`,
    name: p.name,
    mimeType: "text/markdown",
    description: p.summary,   // one line
  })),
}));
```

Resource URIs should be deterministic and addressable. `vcf://primer/skill-creation` beats `file:///tmp/abc123.md`.

**Prompts** are user-invoked, not model-invoked. Use them when the user should consciously select a workflow recipe (e.g. "draft a changelog from commits since last tag"). Keep the argument surface small; the prompt expands into a full message sequence the client feeds to its model.

If you find yourself putting action logic in a prompt or exposing data via a tool, you probably picked the wrong primitive.

---

## Progress, Cancellation, Streaming

The SDK supports progress notifications and request cancellation. Use them for anything that takes more than ~1 second.

```ts
server.tool("test_execute", TestExecuteInput, async (args, { signal, sendNotification }) => {
  for (const step of plan(args)) {
    if (signal.aborted) throw new McpError("E_CANCELED");
    await sendNotification({
      method: "notifications/progress",
      params: { progressToken: args._meta?.progressToken, progress: step.index, total: step.total },
    });
    await step.run();
  }
});
```

Rules:

- **Honor `signal.aborted`.** A tool that cannot be canceled is a tool that hangs the client.
- **Emit progress in large steps**, not on every line of output. Each notification is a wire message.
- **Streaming content**: for long outputs, either write to a file and return the path, or emit progress notifications with partial summaries. Do not stream megabytes of text through notification payloads.

---

## Security and Scope Enforcement

This is where MCP servers get owned. Design the boundary once; enforce it on every entry point.

### Path scoping

```ts
import { realpath } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";

export async function assertInsideAllowedRoot(p: string, allowed: string[]) {
  if (!isAbsolute(p)) throw new McpError("E_PATH_NOT_ABSOLUTE");
  const real = await realpath(resolve(p));   // resolves symlinks
  const hit = allowed.map(a => resolve(a)).find(root => {
    const rel = relative(root, real);
    return rel && !rel.startsWith("..") && !isAbsolute(rel);
  });
  if (!hit) throw new McpError("E_SCOPE_DENIED", { path: p });
  return real;
}
```

- **Always resolve symlinks** before the check (the official filesystem server's 2026 `EscapeRoute` CVE was exactly this missing step).
- **Reject `..` and non-absolute paths** early.
- **`allowed_roots` comes from config**, validated at boot. Never from a tool argument.

### Env interpolation for config

```ts
function interpolate(value: string): string {
  return value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_, name) => {
    const v = process.env[name];
    if (v === undefined) throw new McpError("E_CONFIG_MISSING_ENV", { name });
    return v;
  });
}
```

- Secrets live in env vars, never in the YAML.
- Interpolate at load time; log which vars were missing with the var name, **not the value**.

### Endpoint trust levels

Config categorizes endpoints as `local`, `trusted`, or `public`. Tools that handle sensitive payloads (auth-module review, secrets handling) pin to `local` or `trusted`. The server refuses to route them to `public`.

### Redact before network

Before any outbound LLM call, run a redaction pass for known secret patterns (AWS keys, JWT shapes, private keys, `.env`-style values). On by default for `public` endpoints; configurable for `trusted`.

### Untrusted data

Content fetched from third-party sources (issues, PRs, support tickets, web pages) is **data**, not instructions. When the server re-feeds that content to an LLM, mark it as untrusted in the prompt envelope. The 2025 GitHub-issue prompt-injection and Supabase support-ticket incidents both came from this gap.

### No ambient network

The server talks only to endpoints in config. No telemetry. No auto-update. No "check for a new primer pack" at boot. If you need phone-home, it's opt-in and documented.

### Destructive-action gating

Tools like `ship_release`, `file_delete`, `repo_force_push` must return a *plan* first, and require a second confirmed call (explicit `confirm_token` passed back from the plan) to execute. The model calling `ship_release` should never be enough.

---

## Logging, Audit, Redaction

**Every tool call is an audit event.** For VCF-MCP:

```ts
await audit.append({
  ts: Date.now(),
  tool: name,
  scope: scope,            // "global" | "project"
  project_root: project,
  client_id: clientInfo.name,
  inputs_hash: sha256(redact(args)),
  outputs_hash: sha256(redact(result)),
  endpoint: endpointUsed,  // if any
});
```

Rules:

- **Append-only.** Audit rows are never mutated or deleted via MCP.
- **Hash inputs and outputs** rather than storing them in full. Store full payloads only behind an explicit `--full-audit` flag and an access-controlled location.
- **Never log secrets.** Redact values of any config field marked `secret: true`. Redact before hashing if the hash itself would leak structure of the secret.
- **Operator-queryable.** CLI command (`vcf admin audit`) can filter by tool, project, time range, endpoint.

---

## Testing

Three layers:

**Unit** — test each tool handler with the SDK's in-memory transport. No child process, no filesystem unless the tool's contract is filesystem.

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

test("idea_capture writes and returns path", async () => {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "test", version: "0" }, { capabilities: {} });
  await client.connect(b);
  const result = await client.callTool({ name: "idea_capture", arguments: { content: "hi" }});
  // assert shape, paths, no secret leakage
});
```

**Integration** — spawn the real built binary, wire a real MCP client, run a scripted scenario end-to-end. Catches packaging mistakes (missing file in `"files"`, bad bin path, ESM/CJS confusion).

**Client parity** — same scenario run against Claude Code (headless), Codex CLI, Gemini CLI. Assert the sequence of tool calls and final artifact state is identical. This is the test that prevents client-specific drift.

Additional:
- **Schema tests.** Fuzz invalid inputs; confirm every one is rejected with a stable error code.
- **Scope tests.** Assert a path outside `allowed_roots` is rejected even via symlink, even with `..`, even URL-encoded.
- **Audit tests.** After a run, audit rows match expected tool sequence.
- **Cancellation tests.** Kick off a long tool, cancel, assert the tool stopped and the audit row marks it canceled.

---

## Client Wiring and Transport

### stdio

Launch via the client's `.mcp.json`:

```json
{
  "mcpServers": {
    "vcf": {
      "command": "npx",
      "args": ["-y", "@vcf/cli", "mcp", "--scope", "project"],
      "env": { "VCF_CONFIG": "${HOME}/.vcf/config.yaml" }
    }
  }
}
```

- Arguments should be explicit and static. Do not generate them dynamically per-session.
- `env` values support `${VAR}` substitution in most clients; keep secrets there.
- After global install, replace `npx -y @vcf/cli` with the installed binary name.
- Global vs. project `.mcp.json`: document both. `vcf init` should auto-write the project-level file.

### Streamable HTTP

- Single MCP endpoint path (e.g. `POST /mcp`). Implement session handling per spec.
- Auth: OAuth 2.1 is the emerging standard. **Do not** roll your own.
- Never bind `0.0.0.0` without auth. The 2025 `NeighborJack` cluster of incidents was all variants of this.
- Rate-limit per session.
- Idempotency keys on destructive tools.

Pick one transport per MVP. Supporting both doubles testing surface and is rarely needed on day one.

---

## Versioning and Breaking Changes

Your server's tool surface is a public contract as soon as one user depends on it.

- **Server semver.** Breaking tool-schema changes = major bump. New optional fields = minor. Bug fixes = patch.
- **Peer deps.** If you ship a content package (e.g. `@vcf/kb`) alongside the server, use a `peerDependencies` **range** so they can upgrade independently within a compatible band.
- **Deprecation path.** Mark a tool `deprecated: true` in its description for one minor version before removing it. Log a warning (to stderr) when called.
- **Schema evolution.** Add new fields as optional with sensible defaults. Never rename a field — add the new one and accept both for one major version.
- **Pin the MCP SDK.** A minor SDK bump has broken transports in the past; test before upgrading.

---

## Performance and Lazy Loading

- **Do not read large files at boot.** Scan directories for metadata; read content on demand.
- **SQLite index over filesystem walks.** Frontmatter, mtimes, tags go in the index; queries hit the index; files are the source of truth but not the query path.
- **`better-sqlite3` indexes** on every column used in a WHERE clause. Profile with `EXPLAIN QUERY PLAN`.
- **Cheap `list`, lazy `read`.** Both for resources and for tool outputs.
- **Bound every loop.** Directory walks, reindex runs, and search tools all need a max result count with an `expand=true` escape hatch.
- **No model calls at startup.** The server boots offline.

---

## Observability in stdio Mode

**Never write to stdout in stdio mode.** Stdout is the JSON-RPC channel; one stray byte breaks the protocol. All logs, warnings, progress prints go to **stderr**.

```ts
const log = (level: "info" | "warn" | "error", msg: string, extra?: object) => {
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }) + "\n");
};
```

- Structured (JSON lines) logs make client-side debugging cheap.
- Use `notifications/message` (MCP protocol-level logging) for messages that should surface in the client UI; use stderr for everything the operator wants during local debugging.
- Metrics optional — if added, expose them via a sidecar endpoint or a separate CLI subcommand, not as an MCP tool.

---

## Anti-patterns

Call these out explicitly. Do not ship them.

- **Tools that auto-execute destructive work** without a plan/confirm split.
- **Tools that return tens of thousands of tokens by default.** The reason `expand=true` exists.
- **Server-side natural-language trigger detection.** The server does not match "capture this idea." The client skill does and calls `idea_capture`.
- **Client-specific branching** inside tools (`if clientInfo.name === "claude-code"`). Push it out to skill packs.
- **Mutable templates.** Reviewer / planner templates edited in place. Copy to disposable workspaces.
- **Hidden state.** Tools that silently update config/SQLite without returning what changed.
- **Stdout logging in stdio.** Breaks the transport. Non-recoverable.
- **Unbounded symlink following.** CVE class.
- **Secrets in tool inputs or outputs.** Always via env.
- **Binding `0.0.0.0` with no auth.** The `NeighborJack` family.
- **Feeding untrusted third-party content to an LLM** as if it were instructions. Prompt-injection exfiltration.
- **Ambient network access.** No telemetry. No auto-update. Config-declared endpoints only.
- **No audit.** If you can't reconstruct who called what against which endpoint, you don't have a server, you have a liability.

---

## Checklists

### Tool-Definition Checklist
- [ ] Input schema is `.strict()` with caps on every string/array
- [ ] Description is specific, model-readable, < 80 words
- [ ] Output follows project's `{ok, paths, summary}` contract
- [ ] `expand=true` path documented and tested
- [ ] Error envelope uses stable codes
- [ ] Cancellation honored via `signal`
- [ ] No secrets in inputs, outputs, or logs

### Security Checklist
- [ ] All paths resolved via `realpath` and re-validated against `allowed_roots`
- [ ] `..`, non-absolute, URL-encoded escapes all rejected
- [ ] Secrets come from env only; interpolation fails loud with var name
- [ ] Endpoint trust levels enforced per tool
- [ ] Redaction runs before any outbound LLM call
- [ ] Destructive tools require plan + confirm
- [ ] No `0.0.0.0` bind without auth (HTTP transport)
- [ ] Untrusted third-party content is marked untrusted in any re-prompting

### Packaging Checklist
- [ ] `"type": "module"`, `engines.node >= 20`
- [ ] `dist/` built, raw TS excluded from the tarball
- [ ] `bin` paths point to built files
- [ ] `"files"` whitelist set (no stray config/secrets shipped)
- [ ] `--provenance` on publish
- [ ] `npx -y` invocation tested end-to-end
- [ ] SDK version pinned

### Testing Checklist
- [ ] Unit tests via in-memory transport cover every tool
- [ ] Integration test spawns the real binary
- [ ] Client-parity test runs the same scenario on at least two clients
- [ ] Schema fuzz rejects every invalid shape with a stable code
- [ ] Scope test proves symlink/`..`/URL-encoding escapes are all denied
- [ ] Audit rows match expected tool sequence after a scripted run
- [ ] Cancellation test proves long tools stop on signal

### Observability Checklist
- [ ] Logs go to stderr in stdio mode; stdout is strictly JSON-RPC
- [ ] Audit is append-only, inputs/outputs hashed, secrets redacted first
- [ ] CLI surface exists for querying audit
- [ ] `notifications/message` used for client-surfaced messages; stderr for operator debug

### Versioning Checklist
- [ ] Server semver documented in README
- [ ] Deprecation path (one minor with `deprecated: true`) before any tool removal
- [ ] Peer deps between split packages use a compatible range
- [ ] MCP spec version and SDK version both called out in release notes

---

## OS / Environment Notes

- **Windows paths.** Normalize at boundaries with `path.posix`. Test on Windows CI. Reject backslash-tricks in scope checks.
- **Symlinks on macOS** are cheap; on Windows require elevated mode for some types. Don't assume creation succeeds.
- **Node versions.** `>=20` gives you native ESM and AbortSignal; older Node breaks in subtle ways.
- **npx cache.** On first use, `npx -y` can be slow; document a global-install fallback for users who need fast cold starts.

---

## Related Primers

- MCP Primer
- LLM Integration Primer
- Automated Agents Primer
- Skill Creation Primer

---

## Related Best Practices

- LLM Integration Best Practices
- Security Best Practices
- Library / SDK Best Practices
- Integration Boundary Best Practices
- Admin & Operator Best Practices
- Versioning & Migration Best Practices
- Prompt & Model Economics Best Practices

---
type: best-practices
best_practice_name: skill-creation
category: tools
version: 1.0
updated: 2026-03-17
tags: [claude-code, skill-authoring]
status: draft-v1
---

# Skill Creation Best Practices

## When To Use This

Use this document before creating a new skill, during skill refinement, during skill review or audit, or whenever skill structure, instructions, boundaries, state handling, and lifecycle discipline need to be made explicit.

Open it when you need to:
- author a new SKILL.md
- improve an existing skill's instructions or structure
- review a skill for quality, completeness, or safety
- audit skill configs, state files, or artifact contracts
- publish or distribute a skill package

This document is the deeper execution-time standard under the **Skill Creation Primer**.

---

## What This Covers

- SKILL.md quality (frontmatter, instructions, boundaries)
- failure handling and error reporting
- install shape and bootstrap design
- configuration discipline
- state management and artifact contracts
- workspace hygiene
- context window discipline
- clean execution environments
- optional feature design
- versioning and lifecycle
- review and quality assurance
- publishing and distribution

---

## Decision Guide

### Break a skill into sub-skills when
- SKILL.md exceeds 5K tokens
- the skill has multiple distinct responsibilities
- trigger matching becomes ambiguous
- different roles need different subsets of the capability

### Move content to supporting files when
- detailed examples bloat the body
- reference material is only needed for specific steps
- deterministic logic belongs in a script
- schemas or templates define output format

### Use a disposable execution root when
- the workflow must stay clean and repeatable
- caller context must not leak into the work
- concurrent runs must be safe

### Treat a config field as REQUIRED when
- the skill cannot function without it
- leaving it empty causes silent failure

### Treat a config field as DEFERRABLE when
- the skill works without it
- it can be provided later at first use

---

## Core Rules

1. **Explicit contracts for every skill.** Inputs, outputs, state changes, failure paths, recovery paths — all defined.
2. **Boundaries are mandatory.** Every SKILL.md states what it does and does not do.
3. **Failure handling for every step that can fail.**
4. **The install shape must match the runtime shape.**
5. **Central config is the source of truth.** Skill configs are reference copies.
6. **State files are updated before destructive operations.**
7. **Manifests are core artifacts** that drive build alignment and review drift detection.
8. **Review what is real.** Never comment on files you did not read.
9. **Workspace hygiene is enforced, not hoped for.**
10. **The quality bar is predictability,** not "works."

---

## Common Failure Patterns

- SKILL.md body exceeds 5K tokens with no supporting files
- Boundaries section missing or vague
- Failure handling only for the happy path
- Description doesn't match actual behavior
- Referenced files that don't exist
- Config fields required but never validated
- State files left ambiguous after failure
- Promising resume/restart that isn't implemented

---

## Non-Negotiable Standards

- **NEVER** ship a SKILL.md without a boundaries section
- **NEVER** leave failure handling undefined for steps that touch state or files
- **NEVER** duplicate central config values into skill configs without marking them as reference copies
- **NEVER** mutate a read-only template during execution
- **NEVER** let caller identity leak into isolated execution environments without explicit intent
- **ALWAYS** define inputs (required vs optional) before the procedure
- **ALWAYS** define expected output format for every artifact the skill produces
- **ALWAYS** include install-instructions.md with auto-install path + maintainer fallback
- **ALWAYS** validate required config fields before marking setup complete
- **YOU MUST** read the actual file before commenting on it in review

---

## SKILL.md Quality

### Frontmatter

The `description` field is the discovery mechanism — write it for agent activation, not human browsing.

❌ `"Helps manage projects"`
✅ `"Assign a new project to the first empty PM slot. Provisions a complete PM workspace from templates."`

Include:
- what the skill does (action)
- when to use it (trigger context)
- third-person active verbs

### Instructions

Use numbered steps. Each step should be independently verifiable — the agent should be able to confirm it completed before moving on.

```markdown
## Step 3 — Find the first empty PM slot
Use the three-source truth pattern:
- Team Lead config
- Team Lead registry
- PM workspace AGENTS state

If a slot is drifted: report it, skip it, continue.
If no safe empty slot exists: stop.
```

Rules:
- Define inputs before the procedure
- Define outputs explicitly
- Substeps when a step has parts (6a, 6b, 6c)
- Max nesting: 2 levels
- Verification checklist at the end of multi-step procedures

### Boundaries

Use the Always / Ask First / Never framework:

```markdown
## Boundaries
- ✅ Always back up AGENTS.md before a mode swap
- ⚠️ Confirm before writing config.yaml
- 🚫 Never modify the review-system/ template directly
- This skill is Team Lead only
- This skill does not handle project planning
```

---

## Failure Handling

### Failure Paths

For every step that can fail, define one of:
- **Stop immediately** — halt, report, preserve state
- **Warn and continue** — log the issue, proceed with remaining steps
- **Skip and report** — skip the failed item, continue, summarize at end

For multi-step operations, define partial-failure behavior:

```markdown
### Partial failure handling

If provisioning fails partway through:
1. Stop immediately. Do not continue to later steps.
2. Report exactly which step failed and what succeeded before it.
3. Do not update tracking. The slot must not be marked active.
4. Leave the partial workspace for inspection.
```

Do not promise resume/restart unless the mechanism is implemented.

### Error Reporting

Report:
- What failed AND what succeeded before it
- Specific paths or values that caused the failure
- Concrete suggested next steps (not "fix the issue")

---

## Install and Root Shape

### Package Layout

The package should be usable immediately after unzip or clone:

```
workspace-root/          ← runtime root files here
├── AGENTS.md            ← agent wakes up from this
├── BOOTSTRAP.md         ← self-installer
├── config.yaml          ← central config
├── skills/              ← all skills
├── project-manager/     ← PM template
└── review-system/       ← review template
```

Not this:
```
package-root/
└── team-lead/           ← user must manually copy into root
    ├── AGENTS.md
    └── config.yaml
```

### Bootstrap Pattern

When a skill system requires environment-specific configuration:

1. **Detect** what you can automatically
2. **Ask** only for what you can't detect
3. **Summarize** before writing — show exactly what will be saved
4. **Confirm** before saving — no writes until user approves
5. **Validate** all required fields before marking complete
6. **Smoke test** after writing — verify paths, templates, access

---

## Configuration

### Central vs. Skill Config

Central config is the source of truth for shared values:

```yaml
# skill config.yaml
# NOTE: Model aliases should be read from the central config.yaml
# at workspace root — not from this file. These are reference defaults.
models:
  aliases:
    opus: anthropic/claude-opus-4-6   # reference only
```

Use skill-level configs only for settings that genuinely belong to that skill alone (e.g., publish scope defaults, review artifact paths).

### Field Annotations

Every field should be annotated:

```yaml
agent_id: ""           # [REQUIRED] The agent's identifier
archive_root: ""       # [REQUIRED] Where archives are stored
channel_id: ""         # [DEFERRABLE] Can be provided at project creation
pm_pattern: "workspace-{agent_id}"  # [DEFAULT] Override if needed
shared_root: ""        # [REQUIRED IF mode=shared]
```

---

## State Management and Artifact Discipline

### State Files

Use YAML for durable state that must survive context resets:

```yaml
# build-state.yaml
active_plan: "plans/my-project-plan.md"
current_phase: "phase-2"
status: in-progress
previous_agents_backup: ".pm-system/runtime/AGENTS.pre-build.md"
```

Rules:
- Define who owns each state file (who writes, who reads)
- Initialize with clear "empty/pending" values
- Update state BEFORE destructive operations or context resets
- Never rely on conversation memory for state that matters

### Artifact Contracts

Define the expected output for every artifact:
- Use schemas for structured output (YAML schemas for YAML artifacts)
- Provide templates for complex formats
- Provide examples showing expected output
- When YAML sidecars and markdown prose both exist, YAML is authoritative

### Manifests

A manifest is a contract, not a planning note. It should answer:

| Question | Example |
|----------|---------|
| What are we building? | "An interactive bootstrap self-installer for VCF" |
| What is in scope? | "Config writing, smoke test, environment detection" |
| What is out of scope? | "CI/CD integration, multi-platform testing" |
| What counts as done? | "Bootstrap produces a validated config.yaml with zero manual editing" |
| What must not drift? | "The three-step install promise: unzip, say hi, bootstrap" |
| What should reviewers check? | "Config validation catches all required fields" |

---

## Workspace Hygiene

Define canonical homes and enforce them in root instructions:

| Content type | Location | Example |
|-------------|----------|---------|
| Planning artifacts | `plans/` | charter, plan, todo, manifest |
| Supporting docs | `docs/` | design notes, research, architecture |
| Runtime state | root or `.pm-system/` | build-state.yaml, active-mode.yaml |
| Review artifacts | `Reviews/` | stage reports, remediation ledgers |
| Disposable work | `.review-runs/` | per-run review copies |
| Skills | `skills/` | skill directories |

Root should contain only: identity files, state files, framework infrastructure.
When in doubt, put it in `docs/`.

---

## Context Window Discipline

### Token Budget

| Level | Budget | Content |
|-------|--------|---------|
| Frontmatter | ~100 tokens | Always loaded — name, description, triggers |
| SKILL.md body | <5K tokens | Core procedure, inputs/outputs, boundaries |
| Supporting files | On demand | Examples, schemas, templates, scripts |

### What to Cut

- Generic knowledge the agent already has (how git works, how to read a file)
- Verbose explanations where a short example would suffice
- Duplicated content available in other loaded files
- Historical context irrelevant to current execution

### What Goes Where

| Content | SKILL.md | Supporting file |
|---------|----------|----------------|
| Core procedure | ✓ | |
| Inputs/outputs | ✓ | |
| Boundaries | ✓ | |
| Detailed examples | | examples/ |
| Output schemas | | schemas/ |
| Output templates | | templates/ |
| Background docs | | docs/ |
| Deterministic logic | | scripts/ |

---

## Clean Execution Environments

### Disposable Roots

When a workflow must stay clean:

1. Copy the template into a disposable directory (e.g., `.review-runs/<run-id>/`)
2. Execute entirely within the copy
3. Harvest outputs back to the canonical location
4. Clean up the copy after successful harvest
5. Preserve the copy on failure (it's the only evidence)

The template is **never** written to. This enables concurrent runs and prevents state accumulation.

### Identity Separation

When launching isolated work:
- Load the correct identity overlay explicitly
- Pass a scoped payload — don't rely on ambient context
- The caller's identity must not leak into the isolated session

---

## Optional Features

### Design Pattern

```
Gate 1: "Do you want this feature?" (cheap yes/no)
  ├── No  → skip entirely, zero overhead
  └── Yes → Gate 2: detect capabilities
              ├── Tool missing → warn, allow skip, record state
              ├── Auth missing → prompt, allow defer
              └── All ready → proceed
```

Rules:
- Never block required functionality on optional features
- Record capability state in config so downstream skills don't re-detect
- Handle the "not available" case explicitly in every optional path

---

## Versioning and Lifecycle

### When to Version
- Behavior changes that affect users → bump version, document in RELEASE-NOTES
- New config fields → add with defaults so existing configs keep working
- Removed behavior → migration guidance required

### Deprecation
- Mark in frontmatter: `status: deprecated`
- Document what replaces it
- Keep functional for at least one version cycle before removal

### Backward Compatibility
- Add new config fields with defaults (existing configs work)
- Add new optional steps (existing workflows work)
- Never rename or remove fields without migration guidance

---

## Review and Quality Assurance

### Self-Review

Before submitting a skill:
- Read the SKILL.md as if you've never seen the project
- Verify every referenced file exists
- Walk through each step with a real scenario
- Check that failure handling covers every fallible step
- Confirm the description matches actual behavior

### Staged Review

Review through multiple lenses:
- **Instruction quality:** clear, ordered, independently verifiable steps?
- **Boundary enforcement:** scope correctly limited?
- **Artifact discipline:** outputs match claims?
- **Failure handling:** every fallible step covered?
- **Path integrity:** all references resolve?

Findings should be:
- Precise — "Step 4 has no failure handling" not "could be improved"
- Grounded — based on the actual file, not memory or assumption
- Scoped — differentiate blocking vs. improvement vs. inherent-to-design

### Common Findings

- Missing failure handling for a step that touches state
- Boundaries section missing or using vague language
- Description that doesn't match the procedure
- Referenced files that don't exist in the package
- Config fields marked required but never validated
- State files left ambiguous after failure paths

---

## Publishing and Distribution

### Pre-Publish

Before publishing a skill or skill package:
- Verify frontmatter is correct (name, description, triggers)
- Verify all referenced files exist
- Verify config has no author-specific values
- Include install-instructions.md with auto-install + maintainer fallback
- Include README.md for human readers
- Verify no secrets, credentials, or sensitive paths in any file
- Generate checksums (SHA256SUMS)

### Release Branches

For public publication, use a release-branch model:
1. Create `release/<version>` from the working branch
2. Remove internal docs on the release branch
3. Commit, push the release branch
4. Switch back to the working branch

The working branch is never modified. Internal docs stay available for development.

---

## Anti-Patterns

**Kitchen Sink** — Everything in one massive SKILL.md.
*Fix:* Use three-level loading. Move detail to supporting files.

**Vague Boundary** — "Be careful" instead of explicit limits.
*Fix:* Always / Ask First / Never framework.

**Happy Path Only** — No failure handling.
*Fix:* Define failure behavior for every step that touches state or external resources.

**Stale Reference** — Docs that were accurate when written but never updated.
*Fix:* Review references during every skill update.

**Implicit Dependency** — Assuming files or tools exist without checking.
*Fix:* Check prerequisites explicitly at the start of execution.

**Config Drift** — Multiple configs with overlapping fields drifting out of sync.
*Fix:* Single source of truth. Skill configs marked as reference copies.

**Scope Creep** — Gradually adding features until the skill does too much.
*Fix:* Split into focused sub-skills when scope exceeds original design.

**Assumed Context** — Reviewing or acting on files that weren't actually read.
*Fix:* Only "read and verified" drives conclusions.

---

## Checklists

### Pre-Creation Checklist
- [ ] Skill's single job is defined
- [ ] Boundaries are clear (what it does AND does not do)
- [ ] Inputs and outputs are defined
- [ ] Failure modes are identified
- [ ] State reads/writes are mapped
- [ ] Target user/role is identified
- [ ] Token budget is feasible (<5K for SKILL.md body)

### Pre-Publish Checklist
- [ ] SKILL.md has correct frontmatter
- [ ] All referenced files exist
- [ ] Config has no author-specific values
- [ ] Install-instructions.md present with auto + fallback paths
- [ ] README.md describes the skill
- [ ] No secrets or sensitive paths
- [ ] License is clear
- [ ] Checksums generated

### Skill Review Checklist
- [ ] Description matches actual behavior
- [ ] Every step is independently verifiable
- [ ] Boundaries section is present and explicit
- [ ] Failure handling covers every fallible step
- [ ] All referenced files exist
- [ ] Config fields are annotated and validated
- [ ] State files have clear ownership
- [ ] Artifact output format is defined
- [ ] Token budget is reasonable
- [ ] No stale references

---

## Related Primers

- Skill Creation Primer
- Coding Primer
- Security Primer
- Production Primer
- Project Planning Primer

---

## Related Best Practices

- Coding Best Practices
- Security Best Practices
- Production Best Practices
- Install / Uninstall Best Practices
- Project Planning Best Practices
- Front Matter & Documentation Best Practices

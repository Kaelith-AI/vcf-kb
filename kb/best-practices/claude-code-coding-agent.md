---
type: best-practices
best_practice_name: claude-code-coding-agent
category: ai
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Claude Code / Coding-Agent Best Practices

> Naming note: this document covers coding-agent delegation patterns broadly, with Claude Code as the immediate anchor/example context.

## When To Use This

Use this document when repo work is being delegated to coding agents, when agent-driven multi-file changes are being planned, or when reviewability, rollback, and task quality need stronger structure.

Open it when you need to:
- scope coding-agent tasks precisely
- package repo context and constraints cleanly
- checkpoint before larger agent runs
- define review and acceptance standards for agent-generated diffs
- protect high-risk code areas from weak delegation
- structure iterative agent remediation loops safely

This is the deeper execution-time reference under the **Claude Code Agents Primer**.

---

## What This Covers

This document covers:
- task scoping and success criteria
- repo context, conventions, and constraints
- checkpointing and rollback before runs
- reviewing and accepting agent-generated diffs
- high-risk area handling
- iterative delegation and remediation loops
- handoff and artifact expectations

---

## Quick Index

- [Task scoping and success criteria](#task-scoping-and-success-criteria)
- [Repo context conventions and constraints](#repo-context-conventions-and-constraints)
- [Checkpointing and rollback before runs](#checkpointing-and-rollback-before-runs)
- [Reviewing and accepting agent-generated diffs](#reviewing-and-accepting-agent-generated-diffs)
- [High-risk area handling](#high-risk-area-handling)
- [Iterative delegation and remediation loops](#iterative-delegation-and-remediation-loops)
- [Handoff and artifact expectations](#handoff-and-artifact-expectations)
- [Checklists](#checklists)

---

## Decision Guide

### Delegate to a coding agent when
- the task is well bounded
- the repo context is legible enough to package clearly
- review cost remains lower than manual execution cost
- rollback and acceptance criteria are defined

### Avoid or split the run when
- the task is “fix everything” broad
- architecture, identity, and conventions are still unsettled
- the agent would need to guess too much context
- one run would mix too many categories of change

### Increase review intensity when
- the run touches auth, secrets, infra, migrations, public APIs, or deployment/runtime logic
- the diff is broad even if the task looked narrow
- the output feels plausible but evidence is thin

---

## Core Rules

1. **Coding-agent tasks should be explicitly scoped.**

2. **Repo-specific context and constraints should be supplied, not assumed.**

3. **Rollback points should exist before larger runs.**

4. **Reviewability matters more than raw diff volume.**

5. **Agents should not silently redefine architecture or conventions.**

6. **High-risk code areas deserve tighter oversight.**

7. **Acceptance criteria should be explicit before the run starts.**

8. **Iterative safe delegation beats one giant speculative pass.**

9. **Artifacts and summaries should make the run understandable afterward.**

10. **A strong coding agent still needs strong task design.**

---

## Common Failure Patterns

- vague “fix the repo” tasks
- weak repo context causing invented conventions or incorrect assumptions
- giant diffs accepted because they look productive
- no checkpoint before risky or broad edits
- feature, refactor, docs, and config mixed in one uncontrolled run
- under-reviewing security, production, or public-interface changes
- treating coding-agent success as equivalent to product-quality success

---

## Task Scoping and Success Criteria

A coding-agent task should have a clear boundary.

### Good task posture
- one coherent objective
- in-scope and out-of-scope are visible
- touched files or areas are predictable enough
- success criteria exist before the run

### Rule
If the task cannot be described clearly without broad ambiguity, it is not ready to delegate as one run.

---

## Repo Context, Conventions, and Constraints

Agents need the repo context that humans hold implicitly.

### Good context packaging
- project purpose and current goal
- local conventions and patterns
- safety constraints
- key files or docs to anchor the run
- disallowed or high-risk areas

### Rule
An agent should not have to invent repo identity or conventions from noise.

---

## Checkpointing and Rollback Before Runs

Larger agent runs deserve pre-run safety.

### Good posture
- checkpoint before broad edits
- isolate risky work from routine work
- know how to discard or split a bad run
- do not start a large run from a chaotic working state

### Rule
If you cannot roll back comfortably, the run is too risky for its current scope.

---

## Reviewing and Accepting Agent-Generated Diffs

Review is where trust is earned.

### Good review posture
- inspect whether the diff matches the requested task
- confirm the agent did not broaden scope quietly
- verify behavior, not just formatting or plausibility
- reject mixed or under-explained changes even if they look impressive

### Rule
A plausible diff is not automatically a trustworthy diff.

---

## High-Risk Area Handling

Some code areas should never be delegated casually.

### High-risk areas
- auth and permissions
- secrets/config handling
- deployment/runtime infra
- migrations and durable-state changes
- public APIs/contracts
- moderation/safety boundaries

### Rule
If a run touches these areas, tighten scope, checkpoints, and review expectations immediately.

---

## Iterative Delegation and Remediation Loops

Coding agents work best in controlled loops.

### Good loop posture
- one phase at a time
- review after each meaningful chunk
- refine scope based on what was learned
- prefer multiple trustworthy passes over one giant speculative rewrite

### Rule
Iteration is not inefficiency when it reduces trust and rollback risk.

---

## Handoff and Artifact Expectations

Agent runs should leave enough evidence for continuation.

### Useful artifacts
- concise summary of what changed
- blockers or uncertainties
- files touched / areas affected
- explicit notes on where review should focus

### Rule
If another agent cannot pick up where the run ended, the delegation workflow is incomplete.

---

## OS / Environment Notes

### macOS
Local-dev convenience should not justify unsafe delegation or weak validation of cross-platform/runtime consequences.

### Linux
Service/runtime/deployment changes often require stronger post-run review because operational risk is higher.

### Windows
Platform-specific build/path/install behavior may need explicit constraints in the coding-agent brief.

---

## Checklists

### Coding-Agent Task Checklist
- [ ] Task scope is clear
- [ ] Success criteria exist
- [ ] In-scope and out-of-scope are visible
- [ ] The run is bounded enough to review comfortably

### Pre-Run Checkpoint Checklist
- [ ] Rollback point exists
- [ ] High-risk areas are identified
- [ ] Context/constraints are packaged cleanly
- [ ] The repo is not in a chaotic working state

### Agent-Diff Review Checklist
- [ ] The diff matches the task requested
- [ ] Scope did not silently expand
- [ ] Behavior and risk are reviewed, not just surface plausibility
- [ ] Mixed or under-explained changes are rejected if needed

### High-Risk Delegation Checklist
- [ ] Auth/secrets/infra/migrations/public contracts were flagged explicitly
- [ ] Review intensity matches the risk
- [ ] Acceptance criteria stayed strict
- [ ] Rollback remains practical

---

## Related Primers

- Claude Code Agents Primer
- Coding Primer
- Git / Change Safety Primer
- Automated Agents Primer
- Project Planning Primer

---

## Related Best Practices

- Coding Best Practices
- Git / Change Safety Best Practices
- Automated Agents Best Practices
- Security Best Practices
- Production Best Practices

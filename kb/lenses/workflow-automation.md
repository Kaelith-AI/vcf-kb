---
type: review-lens
lens_name: workflow-automation
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Workflow & Automation Reliability Lens

## Lens Purpose

This lens intensifies review for workflow correctness, automation reliability, trigger hygiene, and orchestration safety in systems that depend on:
- scheduled jobs
- webhooks
- event-driven flows
- multi-step business automation
- internal agent pipelines
- orchestration tools
- integration chains across services
- background workers and async processes

It exists because many systems do not fail inside a single function or endpoint.
They fail in the spaces between steps:
- the trigger fires twice
- the second step never runs
- context becomes stale
- retries duplicate side effects
- failures disappear into queues, automations, or orchestration platforms

This is not generic ops advice.
It is a practical review overlay for **whether workflows and automations do the right thing, in the right order, under real trigger and failure conditions**.

---

## Why This Lens Exists

Kaelith builds a lot of workflow-shaped systems.

That includes:
- agent chains
- Discord and messaging automations
- cron-driven behavior
- webhook-triggered processes
- orchestration across services and tools
- internal operational flows where the “product” is really the workflow itself

Vibe-coded automation is especially risky because it often:
- looks coherent in the builder’s head
- passes basic happy-path testing
- assumes event order and single execution
- trusts upstream context too casually
- hides failure inside automation platforms or worker queues

The standard stage system covers code quality, security, and production readiness.
What it does not isolate cleanly is this question:

> If this system is really a chain of steps, triggers, and automations, does that chain execute reliably and safely when the real world becomes asynchronous, duplicated, delayed, stale, or partially broken?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether workflow triggers are clean, bounded, and non-duplicative
2. Whether steps execute in the right order with the right inputs
3. Whether retries, replays, and concurrent runs are safe
4. Whether workflow failures are visible, recoverable, and not silently destructive
5. Whether automation ownership and lifecycle are controlled enough for the workflow to remain trustworthy over time

If the reviewer cannot explain what happens when the workflow fires twice, runs late, receives stale input, or partially fails, this lens should produce serious findings.

---

## Applies To

This lens is most useful for:
- automation-heavy systems
- internal toolchains
- background worker pipelines
- event/webhook-driven products
- integration choreography
- multi-step agent workflows
- scheduled sync/import/export jobs
- operational processes implemented as code/config/workflow nodes

It may be applied to:
- **Code review** to intensify orchestration correctness and workflow edge-case scrutiny
- **Production review** to assess live workflow behavior, observability, and recoverability

It is not primarily a security lens, though it often surfaces issues that should be handed off to security review.

---

## Core Review Rule

Do not confuse successful first execution with reliable automation.

A workflow does **not** get reliability credit because:
- it worked once in testing
- the happy path is visually clear in the automation builder
- each step looks individually correct
- there is retry somewhere
- the orchestration platform says the run completed

The reviewer must ask what happens when:
- the trigger duplicates
- the dependency is slow
- one step partially fails
- data is stale or malformed
- the workflow overlaps with itself
- an operator needs to recover it under pressure

---

## What This Lens Should Emphasize

### 1. Trigger Hygiene & Exclusivity
Reviewer should intensify attention on:
- whether exactly the intended trigger(s) are active
- duplicate trigger sources for the same workflow
- test vs live trigger separation
- trigger specificity and false-fire risk
- whether trigger origin is bounded and understandable

### Example failure patterns
- workflow triggered by both cron and webhook for the same business event
- test trigger logic accidentally active in production-like contexts
- trigger filters too broad, causing surprise executions

---

### 2. Idempotency & Duplicate Safety
Reviewer should intensify attention on:
- whether state-mutating steps are safe to run twice
- deduplication keys or replay protection
- duplicate messaging/notification risk
- whether retries can create user-visible or business-visible duplication

### Example failure patterns
- retry sends duplicate email, bill, or record creation
- event replay causes repeated state mutation with no dedupe logic
- workflow assumes “exactly once” delivery without enforcement

---

### 3. Failure Visibility & Loudness
Reviewer should intensify attention on:
- whether partial failure is surfaced or hidden
- silent continuation after failed intermediate step
- operator visibility into failed runs
- whether automation tools report “success” when only part of the chain succeeded

### Example failure patterns
- step 3 fails, but workflow status looks successful enough to casual observers
- failed side effects vanish into retries or logs no one checks
- workflow ends early with no meaningful escalation or signal

---

### 4. Retry, Replay & Dead-Letter Semantics
Reviewer should intensify attention on:
- retry caps and backoff behavior
- dead-letter handling for irrecoverable failures
- replay safety and operator re-run behavior
- whether retries distinguish transient from terminal failures
- whether failed items can be reprocessed without rebuilding them manually

### Example failure patterns
- infinite retry storms
- dead-letter queue exists but is unmonitored or undocumented
- manual replay duplicates destructive actions because workflow is not replay-safe

---

### 5. Context Integrity Across Steps
Reviewer should intensify attention on:
- validation of data handed from one step to the next
- stale context in long-running or AI-mediated workflows
- schema drift across automation steps
- whether each step is operating on current, trustworthy state
- whether prior-run residue can contaminate later runs

### Example failure patterns
- downstream step assumes upstream output shape without verification
- stale agent context reused after the underlying source of truth changed
- one failed branch leaves partial context that later step treats as valid

---

### 6. Concurrency & Overlap Safety
Reviewer should intensify attention on:
- overlapping cron/job runs
- duplicate webhook deliveries arriving while the original is still executing
- races on shared state or external resources
- whether a workflow assumes serial execution when the platform is actually concurrent

### Example failure patterns
- long-running job overlaps with next scheduled run and duplicates work
- two concurrent runs both update the same record without coordination
- background step depends on ordering that the platform does not guarantee

---

### 7. Branch Completeness & Decision Transparency
Reviewer should intensify attention on:
- unhandled conditions in branch logic
- silent fallthrough/default behavior
- whether decision paths are auditable enough to understand why the workflow chose a route
- AI-mediated decisions that are not logged or explained well enough for operators

### Example failure patterns
- workflow reaches an unhandled condition and stops quietly
- default path executes destructive behavior because the intended branch condition failed unexpectedly
- AI agent makes routing decision with no durable rationale or traceability

---

### 8. External Dependency Coupling
Reviewer should intensify attention on:
- timeout and failure handling around external APIs and services
- whether one slow dependency stalls the whole workflow
- brittle assumptions about third-party availability or response ordering
- whether coupling between automation steps and vendors is stronger than necessary

### Example failure patterns
- upstream API hangs and blocks the whole chain indefinitely
- workflow assumes third-party service ordering or timing it does not control
- one brittle dependency failure cascades through unrelated workflow steps

---

### 9. Observability & Auditability of Workflow Behavior
Reviewer should intensify attention on:
- per-run visibility
- step-level logs or state transitions
- traceability of what happened in a particular run
- metrics and alerts specific to workflow health
- whether operators can reconstruct failure without reverse-engineering the automation platform

### Example failure patterns
- no one can tell which step failed for a specific run
- workflow platform logs exist, but not in a durable/operator-friendly way
- dead-letter growth or repeated failure patterns remain invisible

---

### 10. Recovery, Manual Intervention & Reversibility
Reviewer should intensify attention on:
- whether operators have a credible recovery path
- manual replay or intervention safety
- reversibility of destructive or high-impact steps
- dry-run or preview support where warranted
- whether recovery relies on tribal knowledge rather than durable procedures

### Example failure patterns
- failed workflow requires manual DB edits because no supported recovery path exists
- “rerun from here” causes duplicate side effects
- human intervention path exists only in the original builder’s memory

---

### 11. Scope Creep & Permission Drift in Automation
Reviewer should intensify attention on:
- whether the workflow’s authority has grown without review
- shared credentials across unrelated automations
- newly added steps inheriting broader permissions than needed
- agent/sub-agent workflows accumulating capabilities over time

### Example failure patterns
- one automation gains access to more systems because it was easiest to reuse an existing token
- background workflow now controls multiple unrelated side effects without clear reason
- automation boundary has expanded beyond its original safe scope unnoticed

---

### 12. Automation Lifecycle & Ownership
Reviewer should intensify attention on:
- named ownership for active automations
- retired/deprecated automations still running
- review cadence for aging workflow logic
- whether “temporary” automations became durable production dependencies
- whether automation drift is being managed or merely tolerated

### Example failure patterns
- deprecated job still fires because it was never disabled in the platform
- no one clearly owns a critical automation chain
- workflow still active long after its surrounding business process changed

---

## What This Lens Should Not Duplicate

This lens should not become a substitute for security, performance, or general observability review.

Avoid using it to re-run:
- hardcoded secret and credential scanning → Secrets & Trust Boundaries / Security 6
- full SLO/SLI and resilience architecture review → Production 6
- generic observability stack review → Production 3
- prompt injection/tool security review → AI Systems / Security stages
- dependency vulnerability review → Code 5 / Security 5
- generic auth implementation review → Security stages

Instead, this lens should focus on **workflow behavior across triggers, steps, retries, overlap, failure, and recovery**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Workflow & Automation Reliability Lens Summary
- Overall workflow reliability posture:
- Highest-risk automation failure mode:
- Most concerning trigger or replay issue:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Trigger hygiene & exclusivity | PASS / NEEDS_WORK / BLOCK | ... |
| Idempotency & duplicate safety | PASS / NEEDS_WORK / BLOCK | ... |
| Failure visibility | PASS / NEEDS_WORK / BLOCK | ... |
| Retry/replay/dead-letter semantics | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Context integrity across steps | PASS / NEEDS_WORK / BLOCK | ... |
| Concurrency & overlap safety | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Branch completeness & decision transparency | PASS / NEEDS_WORK / BLOCK | ... |
| External dependency coupling | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Observability & auditability | PASS / NEEDS_WORK / BLOCK | ... |
| Recovery/manual intervention | PASS / NEEDS_WORK / BLOCK | ... |
| Scope creep & permission drift | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Automation lifecycle & ownership | PASS / NEEDS_WORK / BLOCK | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Workflow or automation:
- Evidence:
- Failure mode:
- Why it matters:
- Fix direction:

### Workflow Lens Blockers
- Blocking workflow/automation issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- duplicate execution, replay, or partial failure can create serious business or user harm
- workflow behavior is too opaque to recover safely
- trigger, concurrency, or retry behavior is dangerous enough that normal operation is untrustworthy
- the automation system is likely to behave unpredictably under ordinary real-world conditions

### NEEDS_WORK-level lens findings
Use when:
- the workflow is directionally sound but fragile under duplicate, stale, or delayed conditions
- observability, replay safety, or recovery posture are incomplete
- the automation can work, but not yet with strong operational confidence

### PASS-level lens findings
Use when:
- trigger, execution, retry, failure, and recovery behavior are bounded and understandable
- the reviewer can explain how the workflow behaves under duplicate, delayed, stale, or failed execution conditions with reasonable confidence
- operators would have enough visibility and control to trust the automation in scope

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- webhook + cron double-firing the same workflow
- duplicate side effects from retries or replays
- silent partial completion reported as success
- stale context handed across long-running workflow steps
- overlapping runs corrupting or duplicating shared work
- branch logic with no safe default or no visibility into why a route was chosen
- third-party dependency delay freezing the whole automation chain
- no durable per-run trail for operators to reconstruct failures
- manual recovery steps that duplicate destructive actions
- “temporary” workflow logic becoming an unowned production dependency

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **AI Systems** when workflows involve model-driven routing or agent orchestration
- **Secrets & Trust Boundaries** when automation scope and permissions are widening unsafely
- **Defect Discovery** when workflow fragility is caused by subtle behavioral defects
- **Production stages** where automation reliability affects resilience, supportability, and release confidence

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this workflow or automation is triggered, how it behaves when steps duplicate, overlap, fail, or replay, and why its execution, visibility, and recovery posture are trustworthy enough for the scope in which it operates.

If that statement cannot be made honestly, this lens should produce serious findings.

---
type: review-lens
lens_name: resilience-degraded-modes
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Resilience & Degraded Modes Lens

## Lens Purpose

This lens intensifies review for timeout handling, retry safety, fallback honesty, partial-outage behavior, degraded-state trustworthiness, and whether the product remains dependable when dependencies become slow, partial, or unavailable.

It exists because many vibe-coded systems are built around the happy path:
- the dependency responds
- the queue drains
- the model answers
- the cache is fresh
- the network is fine
- the service shuts down cleanly

Real systems spend meaningful time in partial failure.

This is not a generic infrastructure-resilience review.
It is a practical review overlay for **whether the code and product behavior degrade safely, honestly, and recoverably when the world is only half working**.

---

## Why This Lens Exists

Vibe-coded systems are structurally optimistic.

LLMs reliably produce:
- outbound calls with no timeout
- retry logic that is missing, unsafe, or infinite
- fallback paths that silently serve stale or partial data as if it were current
- async branches that log errors and continue without a real degraded-mode plan
- interfaces that spin forever or quietly flatten partial failure into misleading success

Kaelith’s work amplifies this because it often depends on:
- AI providers
- third-party APIs
- background queues
- workflow automation
- dashboards and internal tools
- client-facing systems where trust collapses quickly under partial failure

Existing review stages catch adjacent concerns, but not this exact one:

> When dependencies become slow, partial, rate-limited, stale, or broken, does the system fail safely and transparently—or does it become misleading, stuck, or operationally dangerous?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the system has explicit and bounded timeout, retry, and shutdown behavior
2. Whether degraded paths are safe rather than silent, misleading, or storm-inducing
3. Whether fallback behavior is honest about freshness and completeness
4. Whether queues, workflows, and AI calls remain trustworthy under slowness and partial failure
5. Whether the product preserves operator and user trust when dependencies misbehave

If the reviewer cannot explain what happens when the system is slow, partial, or broken, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- API-driven products
- AI-native systems
- queue- or job-based architectures
- workflow automation
- dashboards and data-heavy interfaces
- services with external dependencies
- client-facing apps where partial failure affects trust directly

It may be applied to:
- **Code review** to scrutinize failure-handling implementation directly
- **Production review** to assess degraded-mode readiness under real operating conditions

This lens is not primarily an infrastructure architecture lens or a UX copy lens.

---

## Core Review Rule

Do not confuse eventual success on the happy path with resilience.

A system does **not** get degraded-mode credit because:
- the dependency usually responds quickly
- a retry exists somewhere
- the queue normally stays small
- the dashboard loads during demos
- logs contain some errors
- the fallback returns something

The reviewer must ask what happens when:
- dependencies time out
- requests partially succeed
- retries overlap
- queues fill or slow down
- AI streams fail mid-response
- stale data is all the system has
- the service is asked to shut down while work is in flight

---

## What This Lens Should Emphasize

### 1. Timeout Coverage
Reviewer should intensify attention on:
- outbound HTTP/API/database/queue/model calls without explicit timeouts
- hung operations waiting indefinitely
- whether long-running work has bounded execution time
- whether timeout behavior is deliberate rather than inherited accidentally

### Example failure patterns
- external fetch waits forever with no timeout or cancellation
- job worker hangs on a dependency call and starves the queue
- AI request stays “loading” with no bounded timeout path

---

### 2. Retry Logic Safety
Reviewer should intensify attention on:
- retry caps
- backoff and jitter
- retrying only retryable conditions
- avoiding infinite loops or retry storms
- whether retry logic preserves system safety rather than amplifying failure

### Example failure patterns
- retry loop hammers a degraded dependency without limit
- client retries 4xx conditions that will never succeed
- multiple layers retry the same failure and compound load

---

### 3. Circuit Breaking & Fast-Fail Behavior
Reviewer should intensify attention on:
- whether the system fails fast once a dependency is clearly degraded
- isolation of slow or broken downstreams
- preventing cascading latency and resource exhaustion
- whether callers are protected from waiting behind known failure

### Example failure patterns
- one slow upstream causes thread, worker, or connection buildup everywhere else
- dependency known to be unhealthy still receives full request volume
- system keeps waiting on hopeless calls instead of degrading intentionally

---

### 4. Queue, Backpressure & Load-Shedding Behavior
Reviewer should intensify attention on:
- queue growth handling
- producer/consumer imbalance
- dead-letter behavior
- concurrency caps
- what the system does when work arrives faster than it can process safely

### Example failure patterns
- backlog grows with no operator visibility or load-shedding plan
- failed jobs are retried endlessly without dead-letter routing
- queue consumer slowdown silently propagates stale or duplicated work

---

### 5. Partial Data Honesty
Reviewer should intensify attention on:
- partial responses treated as complete
- missing fields or degraded dependencies collapsing into fake “success” states
- whether the system distinguishes unavailable data from zero/empty data
- whether users and operators are told when only part of the truth is available

### Example failure patterns
- dashboard renders partial data as if complete
- API omits fields under failure and the product interprets them as real zero values
- degraded result is shown with no indication that upstream data is incomplete

---

### 6. Fallback Strategy & Honesty
Reviewer should intensify attention on:
- cached or alternate-path fallbacks
- whether fallback data is labeled stale, degraded, or partial
- whether fallback preserves trust or quietly lies
- whether fallback paths are real rather than decorative

### Example failure patterns
- system serves stale cache as if current with no freshness indicator
- fallback path returns generic data that looks authoritative but is incomplete
- feature silently disables itself with no visible degraded-mode explanation

---

### 7. Error Propagation & Surface Discipline
Reviewer should intensify attention on:
- whether the right audience sees the right failure signal
- swallowed async errors
- generic error flattening that destroys diagnosability
- operator vs user distinction in degraded states
- whether error handling produces silence, confusion, or actionable insight

### Example failure patterns
- background error is logged nowhere meaningful and disappears
- user gets generic success-like response while internal operation actually failed
- operator cannot distinguish degraded mode from normal low activity

---

### 8. Idempotency Under Retry & Replay
Reviewer should intensify attention on:
- whether retried operations are safe to repeat
- duplicate side effects under retry or replay
- provider calls requiring idempotency keys
- whether resilience behavior introduces integrity damage

### Example failure patterns
- retry sends duplicate email, charge, or mutation
- replay of queued work repeats destructive side effects
- webhook retry path assumes first execution never partially succeeded

---

### 9. Dependency Health Visibility
Reviewer should intensify attention on:
- whether the system can tell when key dependencies are unhealthy
- liveness vs readiness distinctions where relevant
- per-dependency visibility
- whether startup or runtime health checks reflect real downstream availability

### Example failure patterns
- health endpoint stays green while required upstream is down
- service claims readiness before critical dependency is reachable
- operators have no quick way to tell which downstream is the cause of degraded behavior

---

### 10. AI Inference Degraded Behavior
Reviewer should intensify attention on:
- model timeouts, rate limits, refusals, malformed outputs, and mid-stream failures
- fallback-model or degraded-AI behavior where relevant
- whether AI failures surface honestly
- whether partial generation is recognized as partial rather than final truth

### Example failure patterns
- streaming output fails midway and UI treats the truncated answer as complete
- AI rate-limit path causes endless spinner or silent failure
- malformed structured output breaks downstream logic with no degraded response plan

---

### 11. Stale State & Freshness Signaling
Reviewer should intensify attention on:
- last-refreshed indicators
- staleness metadata
- dashboards and caches that silently age
- whether old data is distinguishable from new data during degraded periods

### Example failure patterns
- dashboard keeps showing old numbers with no freshness cue after refresh failures
- cache survives dependency outage but users cannot tell it is outdated
- system continues serving last known state with no degraded-mode boundary

---

### 12. Graceful Shutdown & In-Flight Work Handling
Reviewer should intensify attention on:
- SIGTERM/shutdown handling
- draining requests, jobs, and connections
- preserving or safely abandoning in-flight work
- whether deploy/restart events create avoidable loss or corruption

### Example failure patterns
- service exits immediately and drops in-flight requests or jobs
- queue consumer restarts mid-job with no safe handoff or replay protection
- deploys create repeated partial failures because shutdown is abrupt

---

## What This Lens Should Not Duplicate

This lens should not become a full infrastructure, observability, or UX-writing review.

Avoid using it to re-run:
- SLO/SLA definitions, error budgets, and reliability governance → Production reliability stages
- infrastructure redundancy, DR, and multi-region architecture → Production architecture/DR stages
- monitoring dashboard design and alert thresholds → Production observability stages
- workflow topology and orchestration ownership → Workflow & Automation Reliability
- wording quality of error and loading messages → UX & Interaction Clarity
- rate limiting as a pure abuse/security control → Security stages

Instead, this lens should focus on **implemented degraded-mode behavior in code and runtime flows**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Resilience & Degraded Modes Lens Summary
- Overall resilience posture under degradation:
- Highest-risk partial-failure behavior:
- Most serious timeout/retry/fallback concern:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Timeout coverage | PASS / NEEDS_WORK / BLOCK | ... |
| Retry logic safety | PASS / NEEDS_WORK / BLOCK | ... |
| Circuit breaking & fast-fail behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Queue / backpressure / load-shedding behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Partial data honesty | PASS / NEEDS_WORK / BLOCK | ... |
| Fallback strategy & honesty | PASS / NEEDS_WORK / BLOCK | ... |
| Error propagation & surface discipline | PASS / NEEDS_WORK / BLOCK | ... |
| Idempotency under retry & replay | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Dependency health visibility | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| AI inference degraded behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Stale state & freshness signaling | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Graceful shutdown & in-flight work handling | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### Degraded-Mode Snapshot
| Dependency / Path | Failure Mode | Current Behavior | Trust Risk |
|---|---|---|---|
| ... | ... | ... | LOW / MED / HIGH |

### High-Signal Findings
For each significant finding:
- Finding:
- Dependency / workflow / path:
- Evidence:
- Failure mode:
- User/operator impact:
- Fix direction:

### Resilience Lens Blockers
- Blocking degraded-mode issues:
- Operational limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- degraded behavior is likely to create serious user, financial, or operational harm
- timeouts, retries, queues, or shutdown behavior can cause cascading failure, silent corruption, or serious trust damage
- fallback paths materially misrepresent freshness or completeness
- the product becomes dangerously misleading when dependencies are partial or broken

### NEEDS_WORK-level lens findings
Use when:
- degraded paths exist but are fragile, under-signaled, or only partially bounded
- the system can recover, but not yet with strong trust or operational confidence
- fallback and retry behavior are directionally sound but insufficiently safe or transparent

### PASS-level lens findings
Use when:
- the reviewer can explain how the system behaves under slow, partial, rate-limited, or unavailable dependency conditions
- timeout, retry, fallback, and shutdown behavior are bounded enough for scope
- degraded mode remains honest enough that users and operators are not misled about what still works

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- outbound calls with no explicit timeout
- infinite or storm-inducing retry loops
- queues that grow silently or replay destructively
- partial data treated as full truth
- stale cache used as current truth with no signal
- health checks that stay green while critical dependencies are down
- AI streaming or structured-output failures treated as normal completion
- deploy/restart behavior that drops in-flight work abruptly
- degraded behavior that looks like success rather than visible limitation

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Workflow & Automation Reliability** when automation failures are caused by degraded dependencies
- **State & Data Integrity** when retries, stale reads, or partial failure create lasting state corruption
- **UX & Interaction Clarity** when degraded mode must remain honest to users
- **Production stages** where resilience implementation and operational readiness meet

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this system behaves when key dependencies are slow, partial, stale, rate-limited, or unavailable, and I can explain why its timeout, retry, fallback, and shutdown behavior remain safe and honest enough for the intended scope.

If that statement cannot be made honestly, this lens should produce meaningful findings.

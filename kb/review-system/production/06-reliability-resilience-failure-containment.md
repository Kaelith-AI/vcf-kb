---
type: review-stage
review_type: production
stage: 6
stage_name: "Reliability Resilience Failure Containment"
version: 1.0
updated: 2026-04-18
---
# Production Stage 6 — Reliability, Resilience & Failure Containment

## Stage Metadata
- **Review type:** Production
- **Stage number:** 6
- **Stage name:** Reliability, Resilience & Failure Containment
- **Purpose in review flow:** Verify that partial failures are bounded, observable, and contained rather than turning into cascading outages or silent corruption
- **Default weight:** High
- **Required reviewer posture:** Failure-minded, containment-focused, skeptical of happy-path resilience claims
- **Lens interaction:** Lenses may intensify certain failure modes, but all reviews must evaluate bounded failure behavior, degraded mode safety, and recovery realism
- **Depends on:** Production Stages 2–5, Security Stage 7 runtime-exposure findings, Security Stage 9 release-security constraints where relevant, and Code Stage 4 failure-handling context
- **Feeds into:** Production Stages 7, 8, and 9
- **Security/Production handoff:** Carry forward cascade risks, retry/fallback hazards, restart/idempotency concerns, and dependency-failure weaknesses that affect final readiness and incident handling

---

## Why This Stage Exists

Production systems are judged by how they fail, not only by how they succeed.

Vibe-coded projects often overfit to success-path behavior and leave resilience weak through patterns like:
- retries without bounds or jitter
- no circuit breaking or workload isolation
- silent exception swallowing in worker paths
- fallback behavior that returns stale or wrong results as if they were valid
- restart flows that duplicate destructive actions
- no clear visibility into dead-letter, retry, or degradation states

These systems may look healthy until one dependency slows down, then fail in cascades.

This stage asks:

> When something breaks, does the system degrade safely and predictably — or does it spread failure, lose trust, or corrupt state in ways operators cannot contain?

### Boundary clarification
- **Production Stage 5** asks whether releases, rollbacks, and recovery procedures are controlled.
- **Production Stage 6** asks whether the live system behaves safely under dependency failure, restart, overload, and degraded conditions.

Stage 6 is not another release-process review. It is the runtime containment review.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether dependency failures are handled predictably
2. Whether retries, timeouts, and fallbacks are safe and bounded
3. Whether failure in one path can be isolated from unrelated work
4. Whether degraded mode preserves correctness and data integrity
5. Whether the service can restart or recover without hidden duplication, corruption, or loss

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Reliability/resilience posture summary**
2. **Dependency failure-handling findings**
3. **Cascade/containment findings**
4. **Degraded-mode and recovery findings**
5. **Failure observability findings**
6. **Key resilience risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- external dependency call paths and wrappers
- timeout/retry/backoff/circuit-breaker settings
- queue/worker retry and dead-letter handling
- exception handling and failure logging paths
- fallback and degraded-mode code paths
- restart/recovery logic and comments around failure assumptions

---

## Core Review Rule

Do not reward optimistic resilience language.

A project does **not** get resilience credit because:
- retries exist somewhere
- docs claim “auto-recovers”
- a queue or worker exists
- there is a fallback path
- restart usually works in local testing

The reviewer must evaluate whether failure is actually bounded, visible, and safe in production conditions.

---

# Review Procedure

## Step 1 — Review Dependency Failure Handling

Determine whether external failure is handled with clear bounds.

### Check
- [ ] External calls have timeout boundaries
- [ ] Retries are bounded and use sensible backoff/jitter where relevant
- [ ] Failure responses distinguish retryable from non-retryable cases where possible
- [ ] Model/AI provider outage scenarios have defined fallback behavior where applicable
- [ ] Dependency failure does not silently corrupt core service state

### Common failure patterns
- retry loops with no cap
- dependency slowness blocking request/worker paths indefinitely
- treating all provider failures as equivalent without safe fallback classification

---

## Step 2 — Review Cascade Prevention

Determine whether one failure can consume the whole system.

### Check
- [ ] Circuit breaking, shedding, or equivalent containment exists where needed
- [ ] One failing integration does not block unrelated critical paths
- [ ] Resource exhaustion from one path does not starve all paths
- [ ] Reviewer flags thundering-herd or retry-storm patterns
- [ ] Shared worker pools/queues are not hidden cascade amplifiers

### Example — Incorrect
- one slow dependency consumes the entire worker pool, starving unrelated critical work

Why it fails:
- containment boundary is weak
- local failure becomes systemic outage

---

## Step 3 — Review Failure Isolation

Determine whether failures stay within their proper boundary.

### Check
- [ ] Worker/job failures are isolated and visible
- [ ] Message/job loss behavior is explicit (retry, DLQ, discard-with-signal, etc.)
- [ ] Tenant/user-specific failure does not leak or propagate across boundaries
- [ ] Shared mutable state risks are bounded in failure paths
- [ ] Background and async failures do not quietly disappear

### Example — Incorrect
```javascript
try {
  await processJob(job)
} catch (e) {}
```
Why it fails:
- failure invisible
- no retry or DLQ outcome

### Example — Better
```javascript
try {
  await processJob(job)
} catch (e) {
  logger.error({ jobId: job.id, err: e.message }, 'job failed')
  await moveToDeadLetter(job)
}
```
Why it passes:
- failure is visible and recoverable

---

## Step 4 — Review Degraded Mode Behavior

Determine whether fallback behavior remains safe.

### Check
- [ ] Degraded behavior is defined for major dependency outage scenarios
- [ ] Fallback paths are safe and explicit, not silently wrong
- [ ] Critical paths prioritize correctness/safety over false-success output
- [ ] Reviewer challenges “temporary fallback” patterns that create permanent fragility
- [ ] AI/provider fallbacks do not materially misrepresent result quality or trust guarantees

### Common failure patterns
- stale data returned without signal as if fully current
- alternate provider/model used with materially different behavior but no explicit boundary
- fallback path skips validation or auth “to keep service alive”

---

## Step 5 — Review Recovery & Restart Safety

Determine whether interruption and recovery are survivable.

### Check
- [ ] Service restart behavior is compatible with state and in-flight work expectations
- [ ] Recovery does not duplicate destructive actions without idempotency controls
- [ ] Crash recovery assumptions are visible enough to evaluate
- [ ] Error and retry observability is good enough to detect resilience failures
- [ ] Reviewer can explain what happens to in-flight work after crash/restart

### Example — Incorrect
```python
while True:
    try:
        return call_upstream()
    except Exception:
        pass
```
Why it fails:
- no timeout, no backoff, no cap, no explicit failure outcome

### Example — Better
```python
for attempt in range(MAX_RETRIES):
    try:
        return call_upstream(timeout=5)
    except TransientError:
        sleep(backoff_with_jitter(attempt))
raise UpstreamUnavailable()
```
Why it passes:
- bounded retry with explicit exhaustion path

---

## Step 6 — Review Design / Risk Comments as Evidence

Resilience comments may explain intent, but they do not prove containment.

### Check
- [ ] Reliability comments are validated against actual behavior
- [ ] “Should recover automatically” claims are checked against code/config evidence
- [ ] Reviewer surfaces contradictions between resilience claims and implementation
- [ ] Comment-level optimism does not override failure-path evidence

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 7:** operator burden created by resilience gaps and manual recovery steps
- **Production 8:** restart/recovery assumptions affecting durable-state safety
- **Production 9:** resilience and containment realism affecting final production readiness judgment
- **Security 9:** failure and degraded-mode behavior that materially changes security/trust posture under outage conditions

### Required handoff block
- **Carry-forward concerns:**
  - Dependency-failure boundedness:
  - Cascade / retry-storm risk:
  - Failure-isolation weakness:
  - Degraded-mode correctness risk:
  - Restart / idempotency / recovery risk:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize provider outage fallback behavior, model-quality degradation, and AI-path retry amplification
- **bug-hunt lens:** emphasize silent-failure sinks and correctness loss during degraded mode
- **platform lens:** emphasize deployment/runtime-specific failure boundaries and restart semantics
- **credentials lens:** emphasize outage paths that widen sensitive logging or bypass auth/config protections

---

## Severity / Gating Model

### PASS
Use PASS when:
- major failure paths are bounded and observable
- containment mechanisms are credible for service scope
- reviewer can justify reliability confidence under realistic partial-failure scenarios

### NEEDS_WORK
Use NEEDS_WORK when:
- resilience posture exists but key containment or recovery gaps remain
- risks are meaningful but can be bounded with targeted fixes

### BLOCK
Use BLOCK when:
- failure handling is unsafe enough to create high likelihood of cascading outage or hidden data-integrity failure
- resilience claims are materially contradicted by implementation
- critical paths lack bounded failure behavior
- later production readiness would depend on happy-path resilience illusion rather than actual containment

---

## Escalation Guidance

Escalate or explicitly flag when:
- retries are aggressive enough to amplify outages
- failure in one dependency can starve unrelated service paths
- degraded mode returns misleadingly confident results
- restart/recovery can replay destructive work without clear safeguards

If the service is likely to implode unpredictably under ordinary partial failure, use **BLOCK**.

---

## Required Report Format

### 1. Reliability / Resilience Posture Summary
- Major failure scenarios reviewed:
- Overall containment confidence:
- Biggest resilience gaps:

### 2. Dependency Failure-Handling Findings
- Timeout/retry/backoff quality:
- Failure classification quality:
- Provider/dependency outage handling:

### 3. Cascade / Containment Findings
- Shared-resource starvation risks:
- Circuit-breaking / shedding quality:
- Thundering-herd or retry-storm concerns:

### 4. Degraded-Mode & Recovery Findings
- Fallback correctness:
- Restart/crash recovery quality:
- Idempotency / duplication concerns:

### 5. Failure Observability Findings
- Visible failure signal quality:
- Hidden/silent failure concerns:
- Diagnostic confidence during incidents:

### 6. Key Resilience Risks
- Blocking risks:
- Bounded risks:
- Confidence limitations:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- accept retries as resilience without checking bounds and side effects
- treat fallback existence as proof of safe degraded mode
- ignore worker/background failure paths because the main request path is stable
- let “auto-recover” language override evidence from timeout/restart behavior
- move on when failure isolation is still fuzzy

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand how this service behaves when dependencies fail, work is interrupted, or load shifts under stress, and its retries, fallbacks, and recovery behavior are bounded enough that failure remains visible and contained rather than cascading unpredictably.

If that statement cannot be made honestly, this stage should not pass.

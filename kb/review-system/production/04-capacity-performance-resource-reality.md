---
type: review-stage
review_type: production
stage: 4
stage_name: "Capacity Performance Resource Reality"
version: 1.0
updated: 2026-04-18
---
# Production Stage 4 — Capacity, Performance & Resource Reality

## Stage Metadata
- **Review type:** Production
- **Stage number:** 4
- **Stage name:** Capacity, Performance & Resource Reality
- **Purpose in review flow:** Verify that the service can handle its expected workload without collapsing under predictable resource pressure
- **Default weight:** High
- **Required reviewer posture:** Resource-bounded, skeptical of benchmark theater and demo-only confidence
- **Lens interaction:** Lenses may intensify focus on specific bottlenecks, but all reviews must evaluate bounded-resource behavior and overload realism
- **Depends on:** Production Stage 1 workload intent, Production Stage 2 architecture/state shape, Production Stage 3 observability evidence, and Code Stage 4 correctness/failure behavior where relevant
- **Feeds into:** Production Stages 5, 6, and 9
- **Security/Production handoff:** Carry forward overload, bottleneck, timeout, and resource-exhaustion risks that affect release safety and resilience under stress or abuse

---

## Why This Stage Exists

A service that works in demo traffic may still collapse quickly in real operation.

Vibe-coded systems often optimize for functional correctness on happy-path requests while missing production-bounding controls such as:
- connection pooling
- query/result limits
- queue and worker bounds
- timeout and retry discipline
- memory growth limits
- token and cost constraints for AI-backed flows

These gaps often stay hidden until the system sees sustained or adversarial load.

This stage asks:

> Can this service handle the workload it claims to support, and if not, does it fail in a bounded, understandable way rather than melting down unpredictably?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What workload the service is expected to handle
2. Whether major resources are bounded and controlled
3. Whether obvious performance hotspots and bottlenecks are understood
4. Whether overload behavior is explicit and survivable
5. Whether performance/capacity claims are evidence-aligned rather than aspirational

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Capacity/performance posture summary**
2. **Resource-boundary findings**
3. **Hotspot/bottleneck findings**
4. **Overload/degradation findings**
5. **Evidence-vs-claim gaps**
6. **Key capacity risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- DB/query access patterns
- connection pool and worker/thread/task config
- queue/cache limits and lifecycle logic
- payload size handling and pagination/batching controls
- timeout/retry settings on external dependencies
- comments/docs claiming scale/performance behavior
- benchmark/load-test notes where present
- AI/model usage limits and token/cost controls where relevant

---

## Core Review Rule

Do not reward performance claims because the current demo is fast.

A project does **not** get capacity credit because:
- it feels responsive during small local tests
- a benchmark number appears in docs without context
- async/concurrency libraries are present
- a queue exists but is unbounded
- AI/model features work once on short prompts

The reviewer must judge whether resource consumption remains bounded as workload grows or dependencies slow down.

---

# Review Procedure

## Step 1 — Review Resource Bounds & Limits

Determine whether critical resources are bounded intentionally.

### Check
- [ ] Connection pools have explicit size/timeout bounds where relevant
- [ ] Queues/buffers are bounded or visibly controlled
- [ ] Worker/task/thread concurrency is intentionally constrained
- [ ] Input and payload size limits exist where needed
- [ ] AI/model-backed systems have token budgets, per-request limits, and cost visibility where applicable

### Common failure patterns
- per-request connection creation without pooling
- unbounded async task creation
- request paths that accept arbitrarily large payloads
- model requests with effectively unlimited prompt or output growth

---

## Step 2 — Review Workload Assumption Alignment

Determine whether implementation fits the claimed usage profile.

### Check
- [ ] Expected traffic/workload assumptions are at least minimally explicit
- [ ] Implementation approach matches those assumptions
- [ ] Endpoints/jobs avoid unbounded result or processing behavior
- [ ] Batch sizes and polling intervals are tunable where relevant
- [ ] Reviewer flags mismatch between claimed scale and actual control mechanisms

### Reviewer questions
- What load does the service seem to believe it will see?
- Would the current implementation survive that load shape?
- Are there places where one large request or backlog could dominate the system?

---

## Step 3 — Review Hotspots & Bottleneck Risk

Determine whether the obvious expensive paths are understood or bounded.

### Check
- [ ] Obvious N+1/query explosion patterns are identified
- [ ] Blocking I/O on critical async paths is not ignored
- [ ] Expensive operations are isolated, rate-limited, or offloaded where needed
- [ ] Single-threaded chokepoints in hot paths are surfaced
- [ ] Reviewer distinguishes tolerated bottlenecks from invisible ones

### Example — Incorrect
```python
users = db.query(User).all()
```
Why it fails:
- unbounded data pull in request path
- likely to degrade sharply as data grows

### Example — Better
```python
users = db.query(User).limit(page_size).offset(offset).all()
```
Why it passes:
- result size bounded and controllable

---

## Step 4 — Review Cache, State & Memory Reality

Determine whether internal resource growth stays controlled over time.

### Check
- [ ] Caches have TTL/eviction strategy where appropriate
- [ ] In-memory state growth is bounded and monitored enough to reason about
- [ ] Per-request/per-job state does not accumulate indefinitely
- [ ] Reviewer challenges optimistic memory assumptions unsupported by controls
- [ ] Restart behavior does not hide memory/state leak symptoms that would recur in production

### Common failure patterns
- cache with no eviction plan
- worker state accumulating across jobs indefinitely
- memory-heavy response assembly for unbounded datasets

---

## Step 5 — Review Overload & Degradation Behavior

Determine whether the service fails safely when stressed.

### Check
- [ ] Service has a credible response to overload (shed load, 429/503, queue policy, backpressure)
- [ ] External dependency slowness has timeout boundaries
- [ ] AI/model API usage is bounded and cost-observable where applicable
- [ ] Overload behavior does not silently corrupt or lose critical state without visibility
- [ ] Retry and fallback behavior do not amplify overload by default

### Example — Incorrect
```javascript
await fetch(externalUrl)
```
Why it fails:
- dependency latency can block request/worker path indefinitely

### Example — Better
```javascript
await fetch(externalUrl, { signal: AbortSignal.timeout(5000) })
```
Why it passes:
- dependency slowness has bounded impact

---

## Step 6 — Review Design / Risk Comments as Evidence

Performance comments may explain intent, but they do not prove capacity posture.

### Check
- [ ] “Should scale” comments are checked against actual controls
- [ ] Temporary performance shortcuts are surfaced as operational debt
- [ ] Reviewer calls out mismatch between confidence language and observed capacity posture
- [ ] Benchmark or optimization claims do not override bounded-resource analysis

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 5:** release strategy and rollout safety constraints shaped by capacity limits
- **Production 6:** overload/failure behavior affecting resilience and containment
- **Production 9:** capacity realism and resource-boundary confidence affecting final production readiness judgment
- **Security 9:** resource-exhaustion or abuse-amplification risks that materially affect release posture

### Required handoff block
- **Carry-forward concerns:**
  - Resource-boundary weakness:
  - Bottleneck / hotspot risk:
  - Overload / timeout weakness:
  - Memory/cache growth risk:
  - AI/provider cost or token-boundary risk:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize model latency, token growth, fallback loops, provider rate limits, and runaway cost paths
- **bug-hunt lens:** emphasize hidden bottlenecks and unsafe overload behavior likely to produce incidents
- **platform lens:** emphasize environment-specific resource ceilings and deployment-model-specific contention
- **credentials lens:** emphasize overload paths that could expand sensitive logging or failure leakage under stress

---

## Severity / Gating Model

### PASS
Use PASS when:
- key resources are bounded and critical bottlenecks are understood
- overload and degradation behavior are credible for the service scope
- reviewer can justify performance/capacity confidence from evidence

### NEEDS_WORK
Use NEEDS_WORK when:
- capacity posture is partially credible but has important bottlenecks or control gaps
- risks are material but can be bounded with targeted remediation

### BLOCK
Use BLOCK when:
- major capacity risks are obvious and unbounded
- overload behavior is unsafe enough to make production operation irresponsible
- critical dependency/resource paths have no practical failure bounds
- later production readiness would rely on benchmark theater rather than bounded-resource reality

---

## Escalation Guidance

Escalate or explicitly flag when:
- workload assumptions are implicit but ambitious
- unbounded queries/tasks/memory growth are visible in key paths
- timeouts and backpressure are missing on dependency-heavy flows
- AI/provider usage could create runaway latency or cost without strong controls

If predictable workload or dependency pressure would cause uncontrolled degradation, use **BLOCK**.

---

## Required Report Format

### 1. Capacity / Performance Posture Summary
- Expected workload profile:
- Overall bounded-resource confidence:
- Biggest scaling concerns:

### 2. Resource-Boundary Findings
- Connection/concurrency limits:
- Queue/buffer/payload bounds:
- Token/cost bounds where relevant:

### 3. Hotspot / Bottleneck Findings
- Query/path bottlenecks:
- Single-threaded or blocking chokepoints:
- Visibility into hotspot impact:

### 4. Overload / Degradation Findings
- Timeout/backpressure quality:
- Load-shedding or throttling behavior:
- Unsafe degradation patterns:

### 5. Evidence-vs-Claim Gaps
- Scale/performance claims:
- Missing controls or proof:
- Confidence reductions:

### 6. Key Capacity Risks
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
- confuse “fast in dev” with capacity readiness
- reward async or queue use without checking bounds
- ignore unbounded queries, payloads, or task creation because tests pass
- accept performance claims without relating them to actual workload assumptions
- optimize for micro-benchmarks while missing system-level overload behavior

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what workload this service is expected to handle, its critical resources are bounded enough to avoid predictable collapse, and when pressure increases it will degrade in a controlled and understandable way rather than failing chaotically.

If that statement cannot be made honestly, this stage should not pass.

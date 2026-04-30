---
type: review-stage
review_type: vibe
stage: 8
title: "Behavioral Assumptions & Runtime Claims"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 8 — Behavioral Assumptions & Runtime Claims

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 8
- **Stage name:** Behavioral Assumptions & Runtime Claims
- **Purpose in review flow:** Determine whether the LLM's implementation rests on unverified assumptions about runtime behavior, production conditions, or system state — assumptions that appear correct from static analysis but fail in actual operation
- **Default weight:** High
- **Required reviewer posture:** Production-minded, skeptical of anything that only the runtime can verify. The question is not "does this code look correct?" but "what assumptions is this code making about conditions it cannot see?"
- **Lens interaction:** Production and reliability lenses intensify this stage directly; security lenses intensify scrutiny of trust assumptions; all lenses require at minimum that runtime assumptions be explicitly named
- **Depends on:** Vibe Stages 2 (factual claims), 5 (self-flagging), 6 (pattern fit); Code Stages 4 and 6 (implementation correctness, platform compatibility)
- **Feeds into:** Vibe Stage 9 (trust calibration for release); Production Stages 4 and 6; Security review for trust boundary assumptions

---

## Why This Stage Exists

A language model generating code cannot run that code. It cannot observe the production database, the network latency, the actual user behavior, the memory pressure, the background jobs that are running, or the edge cases that real traffic produces.

This creates a category of failure that is invisible in static review but predictable in production: **the implementation is correct under the conditions the LLM assumed, but those conditions are not the conditions that exist**.

The LLM's assumptions about runtime behavior come from three sources:
1. **Training data patterns** — the typical behavior of systems like this one in typical configurations
2. **The visible codebase** — what the LLM can see in the files it was given
3. **Explicit statements in the request** — facts the operator told the LLM

What the LLM cannot observe:
- The actual state of the production database (record counts, data quality, referential integrity)
- The actual behavior of external services under real load (timeout rates, error rates, API deprecations)
- The configuration of infrastructure the LLM was not shown (load balancers, connection pools, CDN behavior)
- The behavior of concurrent processes the LLM was not told about
- The actual performance characteristics of the system under real traffic

When the LLM writes code that assumes a certain runtime reality, and that reality does not hold, the result is a class of failure that:
- Cannot be caught by the tests the LLM wrote (the tests were written under the same assumptions)
- May not appear in staging (if staging also reflects the assumed conditions)
- Appears in production when the assumed conditions are violated

This is a distinct and important class from Stage 2's hallucinated APIs (static wrong) — Stage 8 concerns claims about *dynamic behavior* (correct-looking code that fails under real conditions).

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What assumptions the implementation makes about runtime state** — database contents, service availability, data shape, resource limits
2. **Which assumptions are verified by the codebase** — the code checks them before relying on them
3. **Which assumptions are unverified** — the code relies on them without checking
4. **What happens if an unverified assumption fails** — is failure visible, silent, or destructive?
5. **Whether the LLM's claims about production behavior** — performance, concurrency, reliability — can be supported from the code
6. **What the operator must verify before shipping** that the LLM could not verify from code alone

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Runtime assumption inventory** — every identifiable assumption about runtime conditions
2. **Verified vs unverified assumption assessment** — per assumption
3. **Failure mode analysis** — what happens if each unverified assumption fails
4. **Performance and scalability claim assessment** — are LLM performance claims supportable?
5. **Concurrency and state consistency assessment** — does the code behave correctly under concurrent access?
6. **External service reliability assessment** — does the code handle external service degradation?
7. **Pre-ship verification requirements** — what the operator must verify before deploying
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect:
- The implementation code, especially for implicit assumptions about input shape, database state, service availability
- Error handling around external calls: does it handle degradation, or only happy-path responses?
- Concurrency controls: are there locks, transactions, or CAS operations where concurrent modification is possible?
- Resource bounds: are there limits on collection sizes, timeouts on external calls, bounds on retry behavior?
- The LLM's prose explanations of performance, reliability, or scalability characteristics
- The test suite: are tests verifying behavior under realistic conditions, or just ideal conditions?

---

## Core Review Rule

**An assumption is not a fact.**

The LLM cannot verify runtime conditions from source code. Any claim the LLM makes about how the system will behave in production is based on inference, not observation.

The reviewer must:
1. Identify what assumptions the code makes
2. Determine whether the code validates those assumptions before relying on them
3. Assess what happens if the assumptions are wrong

---

# Review Procedure

## Step 1 — Inventory Runtime Assumptions

Identify every assumption the implementation makes about conditions it cannot observe from the code.

### Assumption categories

**Data state assumptions:**
- "The user record always has a non-null `email` field"
- "The order's `items` array always has at least one item"
- "Foreign key references always resolve to existing records"
- "The `status` field always has one of the documented values"

**Service availability assumptions:**
- "The payment service always responds within the timeout"
- "The authentication service is always available"
- "The object storage bucket always accepts writes"

**Configuration assumptions:**
- "The database connection pool has enough capacity for concurrent requests"
- "The JWT secret is set in the environment"
- "The feature flag is in the expected state"

**Performance assumptions:**
- "This query returns results in < 100ms at production data volumes"
- "This list can be processed in memory without exceeding the memory limit"
- "This operation can be batched at the expected request rate"

**Concurrency assumptions:**
- "Only one process will modify this record at a time"
- "The operation is idempotent enough that duplicate processing is acceptable"
- "The distributed lock will be held long enough to complete the operation"

### Check
- [ ] All significant assumptions are listed
- [ ] Each assumption is categorized by type
- [ ] The reviewer notes what would need to be true for the assumption to hold

---

## Step 2 — Assess Which Assumptions Are Verified

For each assumption, determine whether the code validates it before relying on it.

### Validation approaches (from most to least safe)
1. **Code validates and rejects:** `if (!order.items?.length) throw new ValidationError('Order must have items')`
2. **Code validates and handles gracefully:** `if (!email) { logger.warn('User has no email', { userId }); return null; }`
3. **Type system asserts:** TypeScript types show the field is non-null; the code cannot compile with the unsafe access
4. **Infrastructure guarantees:** Database constraint prevents the null case at the DB level — code does not need to recheck
5. **Assumption documented but unchecked:** Comment says "email is always present at this point" without validation
6. **Assumption silent:** No documentation, no validation, no type assertion

Categories 1–4 are validated (with varying robustness). Categories 5–6 are unverified.

### Check per assumption
- [ ] Is there code that validates this assumption before the code relies on it?
- [ ] If there is no validation, is there a runtime guarantee (DB constraint, type system, infrastructure guarantee) that makes validation unnecessary?
- [ ] If neither: is the assumption documented at least?
- [ ] If neither validation nor documentation: this is a silent unverified assumption

### Silent assumption risk amplifiers
- The assumption concerns data shape that has changed before (schema migrations, API version changes)
- The assumption concerns external service behavior that the LLM has no visibility into
- The assumption concerns resource limits that may be exceeded under production load

---

## Step 3 — Analyze Failure Modes for Unverified Assumptions

For each unverified assumption, assess the consequence of failure.

### Failure mode classification
- **Hard crash with clear error:** assumption fails; code throws or panics; error is logged; request fails loudly — visible, recoverable, not destructive
- **Silent wrong behavior:** assumption fails; code continues with wrong data; result is wrong but no error is emitted — insidious, hard to detect, may corrupt data
- **Data corruption:** assumption fails; code writes wrong data to the database or external system — potentially irreversible
- **Security failure:** assumption fails; code skips an auth check or allows an unauthorized action — may be silently exploitable
- **Cascading failure:** assumption fails; one service starts failing; dependent services fail; system-wide degradation — operational emergency

### The silent-wrong-behavior risk
This is the most dangerous failure mode for assumptions in LLM-generated code. Hard crashes are painful but visible. Silent wrong behavior persists undetected until data is badly corrupted or security is compromised.

### Check per unverified assumption
- [ ] What does the code do if this assumption is wrong?
- [ ] Is the failure hard (crash/error) or soft (silent wrong behavior)?
- [ ] If soft failure: what is the blast radius over time?
- [ ] Would monitoring or logging catch the failure quickly?

### Example — Silent assumption with silent failure mode
**Code:**
```python
def apply_discount(order):
    # Apply the user's preferred discount tier
    discount = user_service.get_user(order.user_id).discount_tier
    return order.total * (1 - discount.rate)
```

**Assumption:** `get_user(user_id)` returns a user with a `discount_tier` attribute that has a `rate` attribute.

**Failure mode if user is not found:** `AttributeError: 'NoneType' object has no attribute 'discount_tier'` — hard crash.

**Failure mode if user exists but has no discount tier:** Depends on whether `discount_tier` defaults to something or is None — may be silent null reference, may crash.

**Failure mode if `rate` is outside [0,1]:** Order total could be negative or absurdly large — silent wrong behavior with financial impact.

---

## Step 4 — Assess Performance and Scalability Claims

Determine whether any performance claims the LLM made about the implementation are supportable.

### Performance claims to assess
- "This query is O(n log n)" — verify against the actual query and index structure
- "This operation completes in < 100ms at expected load" — verify if benchmarks exist, or flag as unverified
- "This approach scales horizontally" — verify the state management assumptions required
- "This won't impact database performance" — assess the query load and whether existing indexes support it
- "This can be processed in a single pass" — verify that memory and timing assumptions hold at expected volume

### Check
- [ ] All performance claims in LLM prose or comments are identified
- [ ] Each claim is assessed against what can be verified from the code
- [ ] Claims that require runtime validation are flagged explicitly as requiring staging/load verification before production

### Common unverifiable performance claims in LLM output
- "This query will be fast because of the index on `user_id`" — requires verifying the index exists and is being used
- "This should handle the expected 1000 requests/second" — requires actual load testing; cannot be verified statically
- "Memory usage will be minimal because we're streaming" — requires verifying the streaming implementation is correct and the buffer sizes are reasonable

---

## Step 5 — Assess Concurrency and State Consistency

Determine whether the implementation behaves correctly when multiple processes or requests are accessing the same state concurrently.

### Concurrency risk surfaces
- State reads followed by conditional writes (read-modify-write cycles without locks)
- Caches that can be stale in multi-instance deployments
- Distributed state that requires consensus (distributed locks, coordination)
- Event processing that may be duplicated (at-least-once delivery)
- Resource pools that may be exhausted under concurrent access

### Check
- [ ] Read-modify-write patterns are identified and assessed for race conditions
- [ ] Cache invalidation behavior in multi-instance deployment is assessed
- [ ] Idempotency of operations that may be executed multiple times is verified
- [ ] Lock acquisition patterns are assessed for deadlock risk
- [ ] The code's concurrency model matches the system's actual deployment model

### Example — Implicit concurrency assumption
```typescript
async function reserveTicket(eventId: string, userId: string) {
  const remaining = await tickets.countRemaining(eventId)
  if (remaining > 0) {
    await tickets.createReservation(eventId, userId)
  }
}
```

**Assumption:** No other reservation will be created between `countRemaining` and `createReservation`.

**Reality:** Under concurrent load, multiple requests may all see `remaining > 0` and all create a reservation, resulting in over-booking.

**Assessment:** Silent data integrity failure. No crash; just wrong behavior under concurrent load.

---

## Step 6 — Assess External Service Reliability Assumptions

Determine whether the code handles external service degradation realistically.

### External service failure modes
- **Timeout:** the service is slow or unresponsive; the call hangs
- **Error response:** the service returns a non-success response
- **Partial data:** the service returns a truncated or malformed response
- **Rate limiting:** the service rejects the call due to rate limits
- **Unavailability:** the service is completely unreachable

### Check per external call
- [ ] Timeouts are set on all external calls
- [ ] Non-success responses are handled (not just success responses)
- [ ] Retry behavior (if present) is bounded and uses appropriate backoff
- [ ] The caller's behavior when the service is unavailable is explicit — not just unhandled exception propagation
- [ ] Rate-limit responses are handled specifically, not treated as generic errors

### Example — Optimistic external call
```javascript
const user = await authService.getUser(token)
// Assumes getUser succeeds; no error handling
await processUserRequest(user)
```

**What the LLM assumed:** `authService.getUser` always returns a valid user for a valid token.

**Reality:** The auth service may timeout, return a 503, return a 401 for an expired token, or return a user object missing expected fields.

**Assessment:** If any of these conditions occur, `user` is undefined or the wrong shape, and `processUserRequest` will fail in ways that may not produce a useful error.

---

## Step 7 — Build Pre-Ship Verification Requirements

Produce a concrete list of things the operator must verify before shipping.

These are items the LLM could not verify from code alone, but that must be true for the implementation to be correct in production.

### Format
Each pre-ship verification requirement should state:
- **What to verify:** specific question or check
- **Why it matters:** what assumption is being validated
- **How to verify:** suggested mechanism (query the database, run a load test, check the staging environment)
- **Severity if wrong:** what breaks if this assumption is violated

### Example pre-ship verifications
- "Verify that the `users.discount_tier_id` column is NOT NULL with a database check — the code assumes this is always set" (data state assumption)
- "Run the migration against a production-scale data copy and verify it completes within the maintenance window" (performance assumption)
- "Load test the `/checkout` endpoint at 2× expected peak load to verify the reservation system does not over-book" (concurrency assumption)
- "Verify the payment service's current rate limits allow the expected request volume" (external service assumption)

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Vibe 9:** unverified runtime assumptions with high-consequence failure modes are release-confidence reducers; the operator must know what they are accepting
- **Production Stage 4:** performance and scalability assumptions that need load testing before release
- **Production Stage 6:** resilience and failure-handling gaps that affect operational reliability
- **Security review:** trust assumptions that may create exploitable behavior if wrong (especially around auth, data access)

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Critical unverified assumptions:
  - Silent failure mode risks:
  - Concurrency risks:
  - External service fragility:
  - Pre-ship verification requirements:
  - Release confidence impact:

---

## Lens Interaction Guidance

Examples:
- **reliability lens:** all failure modes must be assessed for system-level impact; cascading failures need explicit identification
- **data-integrity lens:** data state assumptions and write-path correctness under concurrent access are primary concerns
- **high-availability lens:** external service assumptions need explicit circuit breaker, fallback, or degraded-mode assessments
- **security lens:** trust assumptions (auth service availability, token validity, permission checks) require explicit failure-mode analysis

---

## Severity / Gating Model

### PASS
Use PASS when:
- critical assumptions are validated by the code or by documented infrastructure guarantees
- unverified assumptions are low-consequence or explicitly documented
- performance claims are appropriately hedged
- external service failure modes are handled or explicitly bounded
- pre-ship verification requirements are bounded and actionable

### NEEDS_WORK
Use NEEDS_WORK when:
- some significant assumptions are unverified but failure modes are visible (hard crash, not silent)
- performance claims are overconfident but the behavior is correct
- external service handling is incomplete but the primary failure modes are caught
- concurrency risks are low-frequency and bounded in consequence

### BLOCK
Use BLOCK when:
- critical-path assumptions are unverified with silent wrong-behavior failure modes
- data corruption is the consequence of an unverified assumption failing
- security-relevant trust assumptions are unverified and could be exploited
- concurrency failure modes would cause data integrity violations in production
- the LLM's performance claims would cause the system to fail under expected production load

---

## Escalation Guidance

Escalate or explicitly flag when:
- unverified trust/auth assumptions may create exploitable behavior → Security review must assess
- data consistency assumptions may cause silent data corruption → Production Stage 6 and data integrity review
- performance claims need empirical validation before the release scope is defensible → require staging validation before Stage 9 PASS

---

## Required Report Format

### 1. Runtime Assumption Inventory
| Assumption | Type | Verified? | Verification Method |
|---|---|---|---|
| user always has discount_tier | Data state | No | None |
| auth service responds in < 200ms | Service availability | No | No timeout set |

### 2. Verified vs Unverified Assumption Summary
- Verified assumptions (count):
- Unverified assumptions (count, classified by type):
- Silent failure mode risks among unverified:

### 3. Failure Mode Analysis
| Assumption | If It Fails | Failure Mode | Blast Radius |
|---|---|---|---|
| user.discount_tier exists | AttributeError or wrong result | Hard crash or silent wrong | Single request or financial impact |

### 4. Performance and Scalability Claims
- Claims made:
- Supportable from code:
- Require validation:

### 5. Concurrency and State Consistency Findings
- Race condition risks:
- Idempotency concerns:
- Multi-instance behavior:

### 6. External Service Reliability Findings
- External calls present:
- Timeout handling:
- Non-success handling:
- Rate-limit handling:

### 7. Pre-Ship Verification Requirements
| What to Verify | Why | How | Severity If Wrong |
|---|---|---|---|
| `users.discount_tier_id` is NOT NULL | Silent wrong behavior on checkout | DB query | Financial impact |

### 8. Carry-Forward Concerns
- Critical unverified assumptions:
- Silent failure mode risks:
- Concurrency risks:
- External service fragility:
- Pre-ship verification requirements:
- Release confidence impact:

### 9. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- treat "the code is internally consistent" as evidence that runtime assumptions are valid
- accept performance claims without asking what they are based on
- ignore concurrency risks because the happy path is correct
- treat external service calls as safe because error handling compiles
- allow silent wrong-behavior failure modes through on "it will probably work"

---

## Final Standard

A change passes this stage only if the reviewer can say:

> I identified the implementation's key assumptions about runtime conditions. The critical-path assumptions are either validated by the code or by documented infrastructure guarantees. The unverified assumptions have visible (not silent) failure modes for the most consequential cases. I can state what the operator must verify before shipping, and why.

If that statement cannot be made honestly, this stage should not pass.

---
type: review-stage
review_type: code
stage: 4
stage_name: "Implementation Correctness Failure Handling"
version: 1.0
updated: 2026-04-18
---
# Code Stage 4 — Implementation Correctness & Failure Handling

## Stage Metadata
- **Review type:** Code
- **Stage number:** 4
- **Stage name:** Implementation Correctness & Failure Handling
- **Purpose in review flow:** Determine whether the code actually behaves correctly, especially outside the happy path
- **Default weight:** High
- **Required reviewer posture:** Behavior-focused, adversarial toward plausible-looking logic
- **Lens interaction:** Lenses may intensify focus on certain classes of failure, but this stage always reviews whether the implementation actually works correctly in context
- **Depends on:** Code Stage 1 truth/scope, Code Stage 2 architecture coherence, Code Stage 3 verification confidence
- **Feeds into:** Code Stage 9, Security Stage 4, Production Stages 4 and 6
- **Security/Production handoff:** Record where correctness problems create exploitable security risk, unsafe retries, data corruption risk, or unreliable operational behavior

---

## Why This Stage Exists

This stage exists because code that looks correct is often not correct.

Vibe-coded projects are especially vulnerable here because models optimize for:
- plausible syntax
- common patterns
- satisfying the prompt
- happy-path examples

They do **not** reliably optimize for:
- complete branch logic
- correct error propagation
- edge-case handling
- state consistency under failure
- correct assumptions about APIs and library behavior

This stage is where the reviewer asks:

> Does this code actually do what it appears to do?

That question must be answered from behavior and logic, not from comments, naming, or confidence language.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether critical code paths are materially correct
2. Whether error handling is credible and explicit
3. Whether library and API usage is semantically correct
4. Whether edge cases and failure conditions are handled sensibly
5. Whether comments claiming correctness or safety are actually earned

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Core logic assessment**
2. **Failure-handling assessment**
3. **External API/library usage findings**
4. **Edge-case and state-safety findings**
5. **Design/risk comments worth carrying forward**
6. **Key correctness risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- core business logic files
- failure/exception handling blocks
- API/DB/filesystem/network call sites
- stateful flows (create/update/delete, retries, sessions, transactions)
- representative tests for critical logic if available
- TODO/HACK-style comments in logic-heavy areas
- comments claiming validation, correctness, robustness, or safety

---

## Core Review Rule

Do not confuse **plausibility** with **correctness**.

A function may:
- have a good name
- contain familiar syntax
- use real libraries
- be covered by shallow tests
- include comments claiming correctness

…and still be wrong in important ways.

---

# Review Procedure

## Step 1 — Review Core Logic Correctness

Determine whether the main logic does what it claims to do.

### Check
- [ ] Functions do what their names/docs imply
- [ ] Conditionals appear complete enough to support real behavior
- [ ] Comparisons, calculations, and defaults look materially correct
- [ ] Core workflows terminate in the expected business outcome
- [ ] Important branches are not missing or inverted

### Reviewer questions
- If this function were wrong, how would I know?
- Does the logic implement the stated business rule or only resemble it?
- Are there obvious inverted conditions, wrong defaults, or off-by-one patterns?

### Common failure patterns
- inverted boolean logic
- default values that hide invalid states
- branch missing for common failure case
- edge conditions ignored because examples never used them

---

## Step 2 — Review External API / Library Usage

Determine whether the code uses real APIs correctly.

### Check
- [ ] Methods and attributes are real for the claimed library/API
- [ ] Async/sync behavior is used correctly
- [ ] Return values are interpreted correctly
- [ ] Deprecated or invented APIs are not present in critical paths
- [ ] Reviewer checks both API existence and API semantics

### Important distinction
There are two different failure modes here:

1. **Hallucinated API usage** — method/attribute does not exist
2. **Hallucinated API semantics** — method exists, but code assumes the wrong behavior

### Example — Hallucinated API usage
**Incorrect**
```python
resp = requests.get(url)
data = resp.json_body
```
Why it fails:
- invented attribute

**Correct**
```python
resp = requests.get(url)
resp.raise_for_status()
data = resp.json()
```

### Example — Hallucinated API semantics
**Incorrect**
```javascript
await Promise.all(tasks.map(runTask))
// assumes tasks ran sequentially in order
```
Why it fails:
- real API, wrong assumption about semantics

**Correct**
```javascript
for (const task of tasks) {
  await runTask(task)
}
```
Why it passes:
- ordering expectation matches implementation behavior

---

## Step 3 — Review Failure Handling

Determine whether the code behaves credibly under failure.

### Check
- [ ] External failures are handled at sensible boundaries
- [ ] Important errors are surfaced, logged, or propagated
- [ ] Silent swallowing is absent or clearly justified and bounded
- [ ] Retry/fallback behavior is explicit and sensible
- [ ] Failures do not obviously leave ambiguous partial state

### Common failure patterns
- empty catch/except blocks
- return `None` / `undefined` after meaningful failure with no context
- failure converted to success-looking output
- retries without bounds or error classification

### Example — Incorrect
```js
async function loadUser(id) {
  try {
    return await db.users.find(id)
  } catch (e) {}
}
```
Why it fails:
- failure hidden
- caller gets misleading behavior

### Example — Correct
```js
async function loadUser(id) {
  try {
    return await db.users.find(id)
  } catch (e) {
    logger.error('loadUser failed', { id, error: e.message })
    throw new AppError('USER_LOAD_FAILED', { cause: e })
  }
}
```

---

## Step 4 — Review Edge Cases & Boundary Conditions

Determine whether unusual but realistic inputs and states are handled.

### Check
- [ ] Empty/null/undefined/None cases are handled where relevant
- [ ] Invalid or malformed inputs do not break core behavior unexpectedly
- [ ] Boundary values are not obviously mishandled
- [ ] Timing/async/concurrency assumptions are not naively optimistic
- [ ] Timeouts and unavailable dependencies are considered where relevant

### Example — Incorrect
```python
def average(nums):
    return sum(nums) / len(nums)
```
Why it fails:
- crashes on empty list

### Example — Correct
```python
def average(nums):
    if not nums:
        return 0.0
    return sum(nums) / len(nums)
```

---

## Step 5 — Review State, Side Effects, and Resource Safety

Determine whether stateful behavior remains trustworthy.

### Check
- [ ] Shared mutable state is controlled or localized
- [ ] Functions do not unexpectedly mutate caller-owned data without reason
- [ ] Update flows appear internally consistent
- [ ] Files/handles/sockets/transactions are managed safely enough
- [ ] Failure paths do not obviously leak or corrupt state

### Common failure patterns
- accidental mutation of caller-provided object
- file/socket left open in error path
- transaction updates partially applied with unclear rollback behavior
- retry/failure path duplicating destructive action

---

## Step 6 — Distinguish Code Correctness from Security Exploitability

This stage must maintain a useful boundary with Security Review.

### Rule
- **Code Stage 4** evaluates correctness and failure handling: does it work right?
- **Security Stage 4** evaluates exploitability and defensive coding: can it be attacked or abused?

### Example
- Incorrect retry semantics or wrong timeout behavior belongs here.
- Whether a code path is exploitable by injection or privilege abuse belongs primarily in Security Stage 4.

If a correctness problem clearly creates a security issue, record it as a handoff, not as a reason to collapse the stage boundary.

---

## Step 7 — Review Design / Risk Comments as Evidence

Comments may explain intent, but they do not prove correctness.

### Check
- [ ] Comments claiming correctness or safety are verified against code
- [ ] TODOs acknowledging missing logic are treated as open problems
- [ ] Reviewer records where implementation contradicts comment-level confidence

### Example — Incorrect
```ts
// SQL injection protected here
const q = "SELECT * FROM users WHERE id = " + userId
```
Why it fails:
- comment contradicted by implementation

### Example — Useful but not decisive
```ts
// We handle provider outages by returning cached status for up to 5 minutes
```
Reviewer must verify whether that fallback actually exists and behaves as claimed.

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Code 9:** unresolved correctness risk affecting release confidence
- **Security 4:** correctness issues that create exploitability or unsafe trust boundaries
- **Production 4 / 6:** logic/failure patterns that affect performance or resilience

### Required handoff block
- **Carry-forward concerns:**
  - Correctness confidence:
  - Failure-handling risk:
  - Security exploitability handoff:
  - Production resilience handoff:

---

## Lens Interaction Guidance

Examples:
- **bug-hunt lens:** intensify branch, edge-case, and silent-failure scrutiny
- **credentials lens:** emphasize auth/session and secret-handling correctness on real paths
- **llm-focused lens:** emphasize hallucinated APIs, semantic misunderstandings, and comment-vs-code contradictions
- **platform lens:** emphasize environment-specific failure behavior and resource handling

---

## Severity / Gating Model

### PASS
Use PASS when:
- critical logic paths appear materially correct
- failure behavior is explicit and credible
- major library/API usage appears both syntactically and semantically correct
- edge-case handling is appropriate to project maturity

### NEEDS_WORK
Use NEEDS_WORK when:
- core behavior mostly works but meaningful gaps remain in edge cases or failure handling
- correctness quality is uneven but not fundamentally broken
- some risky assumptions remain insufficiently validated

### BLOCK
Use BLOCK when:
- core logic is materially wrong
- major failure paths are missing or dangerously mishandled
- library/API misuse in critical paths undermines trust in core behavior
- implementation contradictions are severe enough that later stages would rely on false confidence

---

## Escalation Guidance

Escalate or explicitly flag for stronger scrutiny when:
- weak verification from Stage 3 makes correctness findings lower confidence
- correctness issues affect auth, state integrity, or data exposure → Security 4
- correctness issues create retry storms, corruption risk, or failure cascades → Production 4 / 6

If correctness of a primary feature path cannot be trusted, later stages should not proceed casually.

---

## Required Report Format

### 1. Core Logic Assessment
- Key paths reviewed:
- Main logic findings:
- Confidence in correctness:

### 2. Failure Handling Assessment
- Major failure points:
- Error propagation/logging quality:
- Silent-failure concerns:

### 3. External API / Library Findings
- Hallucinated API usage:
- Hallucinated API semantics:
- Other misuse concerns:

### 4. Edge-Case / State-Safety Findings
- Boundary conditions:
- State mutation/resource concerns:
- Retry/fallback risks:

### 5. Design / Risk Comments Worth Carrying Forward
- Comment:
- Verified / contradicted / unclear:
- Carry-forward note:

### 6. Carry-Forward Concerns
- Code release confidence:
- Security exploitability handoff:
- Production resilience handoff:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- trust naming/comments over actual branch behavior
- assume a real API call is being used correctly just because the method exists
- ignore error paths because the happy path works
- confuse test existence with correctness proof
- collapse the distinction between correctness review and security exploitability review

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I inspected the critical logic paths, the code appears to do what it claims to do, its failure behavior is credible, and its use of dependencies and APIs is correct enough that later release/security/production judgments can rely on it.

If that statement cannot be made honestly, this stage should not pass.

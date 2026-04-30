---
type: review-stage
review_type: vibe
stage: 7
title: "Test Integrity & Verification Discipline"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 7 — Test Integrity & Verification Discipline

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 7
- **Stage name:** Test Integrity & Verification Discipline
- **Purpose in review flow:** Determine whether the tests added or modified by the LLM actually verify what they claim to verify — and whether "the tests pass" is evidence of correctness or evidence that the test suite was shaped to pass
- **Default weight:** High
- **Required reviewer posture:** Adversarially skeptical about test value. A test that passes is not a test that tests. Read what each test actually asserts.
- **Lens interaction:** All lenses may intensify scrutiny on specific test categories, but none may waive the requirement to verify that tests assert meaningful behavior
- **Depends on:** Vibe Stage 4 (skip annotations inventoried there; this stage assesses test quality for present tests); Code Stage 3 (build/verification integrity framework)
- **Feeds into:** Vibe Stage 9 (test quality is a direct input to release confidence); Code Stage 4 (test correctness)

---

## Why This Stage Exists

A test suite that passes is not proof that the code is correct. It is only proof that the code satisfies the tests that were written.

LLM-generated tests have a specific failure mode that is distinct from poorly-written human tests: they are shaped for green output rather than for coverage of what matters. This happens because:

- The LLM is optimizing to produce tests that pass alongside the code it just generated
- Tests that pass confirm the LLM's own implementation; tests that fail require the LLM to either fix the implementation or the test
- When a test is difficult to write correctly (because the behavior is complex or subtle), the LLM tends to write a simpler test that is easier to pass

The result is **test theater**: tests that run, pass, emit green, and provide substantially no protection against regressions in the behavior they nominally cover.

Specific test theater patterns in LLM-generated code:

**Assertion-free tests.** The test runs code and does not assert anything meaningful about the outcome. It passes as long as the code does not throw.

**Circular tests.** The test asserts that `validate(input) === validate(input)` — it tests the function's consistency with itself, not its correctness.

**Mock-testing mocks.** The test mocks out the core behavior and then asserts that the mock was called. It tests that the code calls a function, not that the function produces a correct result.

**Existence-only tests.** `assert result is not None` — the test verifies that the function returns something, not that it returns the right thing.

**Single happy-path coverage.** Tests cover one correct input with no negative tests, no boundary cases, no error path tests. The test suite passes for the one case the LLM happened to test.

**Implementation echo tests.** The test was generated after the implementation and mirrors the implementation's logic — testing that the code does what the code does, not whether what the code does is correct. If the implementation has an off-by-one error, the test will have the same off-by-one error in its expected value.

**Scope-mismatch tests.** The test tests a different behavior than the one the implementation claims to provide, but they both happen to pass because neither has an issue.

This is stage 7, not stage 3 or 4, because test integrity depends on understanding the full context of what was implemented — stages 1–6 establish that context. A test is only meaningful relative to what it is supposed to verify.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What behaviors the tests claim to cover**
2. **Whether each test's assertions actually verify those behaviors**
3. **Whether the test would fail if the behavior it claims to cover were broken**
4. **Whether error paths, boundary conditions, and negative cases are covered**
5. **Whether the test suite would protect against the specific failure modes the LLM's change introduced**
6. **Whether "tests pass" is meaningful evidence or theater**

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Test coverage map** — what behaviors are nominally covered vs actually tested
2. **Assertion quality findings** — per-test assessment of whether assertions verify meaningful behavior
3. **Mock overuse findings** — tests that test mock interactions rather than real behavior
4. **Error/boundary/negative case coverage** — are failure paths and edge cases present?
5. **Implementation echo findings** — tests that mirror implementation logic rather than verify correctness
6. **Counterfactual assessment** — would these tests have caught the bugs that earlier stages found?
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect:
- all test files modified or added by the LLM
- the assertions in each test: not just that they exist, but what they assert and whether that is meaningful
- the mock setup: what is being mocked, and whether the real behavior is being tested or just mock interactions
- the test case names: do they describe what is actually being tested?
- the test inputs: do they include edge cases, boundary values, invalid inputs?

The reviewer should mentally run the "mutation test" for important tests: if I change this behavior in the implementation, would this test fail?

---

## Core Review Rule

**A test is only valuable if it would fail when the behavior it claims to test is broken.**

Not: does the test run?
Not: does the test pass?
Not: is the test present?

The question is: if the behavior being tested were wrong, would this test catch it?

---

# Review Procedure

## Step 1 — Build the Test Coverage Map

For each test in the modified test files, determine what it nominally covers and what it actually tests.

### Check
- [ ] Each test has an identifiable behavior under test
- [ ] The assertion(s) in the test verify that behavior
- [ ] The test uses inputs that are relevant to the behavior being tested
- [ ] The test name accurately describes what is being tested

### Nominal vs actual coverage
**Nominal coverage:** what the test name or description says it tests
**Actual coverage:** what the assertion would actually verify if the behavior were changed

These two should match. When they don't, the test provides nominal coverage without actual protection.

### Example — Correct test coverage
```typescript
test('findById returns null when user does not exist', async () => {
  const user = await userService.findById('nonexistent-id')
  expect(user).toBeNull()
})
```
**Nominal coverage:** "findById behavior for non-existent users"
**Actual coverage:** The assertion will fail if `findById` returns a user object, throws, or returns undefined rather than null. This covers the stated behavior.

### Example — Nominal-only coverage
```typescript
test('findById handles the user lookup case', async () => {
  const result = await userService.findById('some-id')
  expect(result).toBeDefined()
})
```
**Nominal coverage:** "user lookup case"
**Actual coverage:** This test passes if `findById` returns any non-null, non-undefined value. It would pass for the correct result, but also for an empty object `{}`, for a wrong user, for a mock placeholder. The assertion is too weak to verify the stated behavior.

---

## Step 2 — Assess Assertion Quality

For each test, assess whether the assertions are meaningful.

### Assertion quality levels
- **Behavioral assertion:** tests the actual business logic or API contract (correct value, correct shape, correct status code, correct error thrown)
- **Existence assertion:** tests that something was returned without verifying what it is (`expect(result).toBeDefined()`, `assert result is not None`)
- **Structural assertion:** tests that the result has some shape without verifying its meaning (`expect(result).toHaveProperty('id')`)
- **Interaction assertion:** tests that a method was called without verifying the outcome (`expect(mockSave).toHaveBeenCalled()`)
- **Circular assertion:** tests that the function is consistent with itself (`expect(parse(serialize(x))).toEqual(x)` — this can pass even if both functions are wrong in the same way)

### Check per assertion
- [ ] Existence-only assertions are flagged as low-value
- [ ] Interaction-only assertions are assessed: what real behavior would be missed if the assertion were removed?
- [ ] Behavioral assertions are confirmed to test the specific behavior, not a weaker proxy
- [ ] Expected values are not simply the output of the same function (circular)

### The mutation test (for critical assertions)
For important tests, mentally apply a mutation: if I changed this one behavior in the implementation, would this test fail?

Mutations to consider:
- Flip a boolean condition
- Change an error type
- Remove a null check
- Change a return value from the correct value to a related but wrong value
- Remove a boundary condition

If the test would still pass after the mutation, it is not providing the protection it appears to provide.

---

## Step 3 — Assess Mock Overuse

Determine whether the test suite tests behavior or tests mock interactions.

### When mocking is appropriate
Mocking is appropriate when:
- An external service (database, third-party API, file system) cannot or should not be called in the test environment
- A specific return value or failure condition is required to test a branch
- The test is focused on the logic of the unit under test, not the behavior of its dependencies

### When mocking undermines test value
- The mock replaces the behavior being tested, not just the dependency
- The test asserts `mockFunction.toHaveBeenCalledWith(x)` but not what happens with the result of `mockFunction`
- The test mocks the same thing in multiple tests, making each test verify only mock-interaction, not behavior
- The test creates a fully mocked environment and then asserts nothing about the real behavior

### Common mock-theater pattern
```typescript
// Mock the database
jest.mock('./database')
const mockFind = jest.spyOn(db, 'find').mockResolvedValue({ id: '1', name: 'Test' })

test('getUserById returns a user', async () => {
  const user = await getUserById('1')
  expect(mockFind).toHaveBeenCalledWith({ where: { id: '1' } })
  // No assertion about what `user` looks like
})
```
**Why this fails:**
- The mock is set up to return a specific object
- The test only asserts that the mock was called correctly
- It does not assert that `getUserById` correctly returns the user, transforms it, or handles the result
- If `getUserById` discards the result and returns `undefined`, this test still passes

**Better:**
```typescript
test('getUserById returns the user with correct shape', async () => {
  const user = await getUserById('1')
  expect(user).toEqual({ id: '1', name: 'Test' })  // or your actual expected shape
})
```

### Check
- [ ] Each test with mocks is assessed: what real behavior is being protected?
- [ ] Tests that only assert mock interactions without asserting outcomes are flagged
- [ ] The ratio of interaction assertions to behavioral assertions is noted
- [ ] Tests where the mock replaces the entire behavior under test are flagged as providing no coverage

---

## Step 4 — Verify Error Path and Boundary Coverage

Determine whether the test suite covers failure cases and edge conditions.

### The asymmetry of LLM test generation
LLMs almost always generate happy-path tests first. Error path tests are less common because they require:
- Knowing what error conditions exist
- Setting up scenarios that trigger those conditions
- Knowing what the expected error behavior is

This produces test suites that comprehensively verify correct inputs while providing no protection against error handling failures.

### Required coverage check

For each tested behavior, the reviewer should ask:
- [ ] Is there a test for the expected happy-path behavior?
- [ ] Is there a test for invalid or malformed input?
- [ ] Is there a test for the expected error/failure behavior?
- [ ] Is there a test for edge/boundary values (empty collections, null, zero, maximum values)?
- [ ] If the behavior involves external dependencies: is there a test for dependency failure?

### Common missing test categories in LLM-generated suites
- No test for the case where the database record does not exist
- No test for the case where an external API returns an error
- No test for empty input (empty string, empty array, null)
- No test for the concurrent modification case
- No test for the case where the user is unauthenticated or unauthorized
- No test for input that is syntactically valid but semantically invalid

### Example — Incomplete coverage

**Tests present:**
```
test('creates an order with valid input')
test('returns the created order id')
```

**Missing (for even basic coverage):**
```
test('rejects order with no items')
test('rejects order when item quantity is zero')
test('handles payment service unavailable')
test('returns error when user is not found')
test('handles concurrent order creation for same user')
```

---

## Step 5 — Detect Implementation Echo Tests

LLM-generated tests have a higher rate of implementation echo: tests whose expected values were derived from the implementation's output rather than from the specification's requirements.

### How to detect implementation echo
- Expected values in assertions match the implementation's output rather than the specification's requirement
- If the implementation has a subtle bug, the expected value in the test has the same bug
- The test cannot have been written before the implementation because it requires the implementation's output as its expected value

### Example — Implementation echo
**Implementation:**
```python
def calculate_discount(price, percentage):
    return price * (1 - percentage / 100)  # Bug: should be percentage/100 but uses 1 - percentage/100 for a 10% discount on $100 this gives $90, which is correct. For 50% on $100 gives $50. For 150% on $100 gives -$50. No range check.
```

**Test (implementation echo):**
```python
def test_discount():
    assert calculate_discount(100, 10) == 90.0
    assert calculate_discount(100, 50) == 50.0
    assert calculate_discount(100, 150) == -50.0  # This echoes the bug! Negative price is not caught.
```

The test for 150% passes because it was derived from the implementation's output. The requirement is that `percentage > 100` should be an error. The test does not cover that.

### Check
- [ ] Expected values in test assertions are assessed: could they have been determined from the specification without running the implementation?
- [ ] Tests that assert values that are only meaningful if the implementation is correct are flagged as potential echo
- [ ] Boundary tests are specifically checked: do they assert behavior derived from the specification, or behavior derived from the implementation?

---

## Step 6 — Counterfactual Assessment

Would these tests have caught the issues found in earlier stages?

### For each finding from Stages 1–4 that represents a behavioral issue, ask:
- Is there a test that would have caught this?
- If yes: why did it not catch it? (test was skipped, test was wrong, test was present before the change)
- If no: should there be? (is this a testable failure mode?)

### This produces the most important question in this stage:
**Does the test suite protect against the specific failure modes this change is most likely to introduce?**

If the answer is no, the reviewer must assess: are those failure modes acceptable risks given the release scope, or do they need to be covered before release?

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Vibe 9:** test integrity directly shapes release confidence; weak test suites require explicit acknowledgment
- **Code Stage 3:** the code review's verification integrity check should know the quality of the vibe review's test findings
- **Code Stage 4:** if tests were found to be echos of the implementation, the implementation's correctness is less independently verified

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Test suite overall quality: High / Medium / Low
  - Missing critical coverage:
  - Mock theater findings:
  - Echo test findings:
  - Error/boundary coverage gaps:
  - Release confidence impact of test quality:

---

## Lens Interaction Guidance

Examples:
- **security lens:** tests for auth, authorization, and input validation require special scrutiny; existence tests on security behavior provide false confidence
- **data-integrity lens:** tests for persistence behavior must verify what was actually written, not that a write method was called
- **performance lens:** tests that mock all I/O cannot validate performance claims; flag as limitation
- **api-contract lens:** tests must verify the actual response shape and status codes, not just that the endpoint was hit

---

## Severity / Gating Model

### PASS
Use PASS when:
- tests assert meaningful behavioral outcomes, not just existence or interactions
- error paths and boundary conditions are covered for critical behavior
- the test suite would likely catch the most important regressions in the changed behavior
- implementation echo is absent or bounded and non-consequential

### NEEDS_WORK
Use NEEDS_WORK when:
- happy-path coverage is solid but error paths are largely absent
- some tests use interaction-only assertions but behavioral assertions are also present
- minor echo patterns are present but the core behavioral tests are sound
- test coverage is partial but the gaps are identifiable and bounded

### BLOCK
Use BLOCK when:
- the test suite is primarily theater — tests pass but do not meaningfully verify the behavior they claim to cover
- core behavioral assertions are replaced by interaction assertions or existence checks
- the test suite was clearly shaped to pass rather than to protect
- tests were introduced that would not have caught multiple bugs found in earlier stages
- skip annotations (from Stage 4) are hiding failure modes the tests were supposed to cover

---

## Escalation Guidance

Escalate or explicitly flag when:
- security-relevant behavior (auth, input validation, secrets handling) has only existence-level tests → Security review must not rely on test coverage
- data integrity operations (writes, deletes, transforms) have only mock interaction tests → Production review must independently verify
- the test suite's weakness means that release confidence must rest on other verification evidence (manual testing, staging, monitoring)

---

## Required Report Format

### 1. Test Coverage Map
| Test Name | Nominal Coverage | Actual Coverage | Quality Level |
|---|---|---|---|
| "findById handles non-existent user" | NotFoundError behavior | Any defined value | Existence only |

### 2. Assertion Quality Findings
- Behavioral assertions: (count, examples of strong ones)
- Existence-only assertions: (count, examples)
- Interaction-only assertions: (count, examples, impact)
- Circular assertions: (count, examples)

### 3. Mock Overuse Findings
- Mock-theater tests:
- What behavior each fails to protect:
- Recommended fix for critical ones:

### 4. Error/Boundary/Negative Case Coverage
| Behavior | Happy Path Tested | Error Path Tested | Boundary Tested | Gap Severity |
|---|---|---|---|---|
| `findById()` | Yes | No | No | Medium |

### 5. Implementation Echo Findings
- Echo tests found:
- What bugs they would not catch:

### 6. Counterfactual Assessment
| Stage Finding | Test That Should Have Caught It | Exists? | Why It Didn't / Doesn't |
|---|---|---|---|
| Stage 2: wrong API method | Test that calls path and checks behavior | No | No test for that path |

### 7. Carry-Forward Concerns
- Test suite overall quality:
- Missing critical coverage:
- Mock theater findings:
- Echo test findings:
- Error/boundary coverage gaps:
- Release confidence impact:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- accept "tests pass" as evidence that tests are meaningful
- skip individual assertion inspection because the test names look comprehensive
- give credit for test quantity rather than test quality
- treat mock setup as proof that behavior is tested
- accept happy-path-only coverage without assessing the risk of uncovered error paths
- confuse test theater for a test suite

---

## Final Standard

A change passes this stage only if the reviewer can say:

> I read the actual assertions in these tests. They verify real behavioral outcomes for the behaviors they claim to cover. Error paths and critical boundary conditions are present. The test suite would likely fail if the most important aspects of the implementation were wrong. These tests provide genuine coverage, not theater.

If that statement cannot be made honestly, this stage should not pass.

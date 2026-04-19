---
type: review-lens
lens_name: defect-discovery
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Defect Discovery Lens

## Lens Purpose

This lens intensifies review for behavioral defects: logic that runs, looks plausible, and may even pass shallow tests, but still produces the wrong outcome.

It is especially useful for:
- vibe-coded applications
- workflow automation
- AI-native products
- integration-heavy systems
- internal tools
- client-facing products where incorrect behavior can quietly damage trust

This is not a generic QA checklist and not a replacement for the normal stage system.
It is an adversarial correctness overlay focused on **finding defects that ordinary stage review may not surface explicitly enough**.

---

## Why This Lens Exists

Vibe-coded systems produce a distinctive class of defects.

They often do not fail by crashing immediately.
They fail by:
- returning plausible but wrong results
- implementing only the happy path
- swallowing failures silently
- handling async work incorrectly
- drifting from intended business logic
- leaving placeholders or partial implementations in live paths
- assuming upstream data contracts that are only usually true

The standard stages already check architecture, verification, security, operations, and release posture.
What they do not do as aggressively is ask:

> Does this system actually behave correctly across the real conditions it will face?

This lens exists to pressure-test that question.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether important behavior is materially correct rather than merely plausible
2. Whether edge cases, error paths, and async paths are handled completely enough
3. Whether the code contains stubs, placeholders, or hollow logic in live flows
4. Whether return values, mutations, retries, and state transitions behave consistently
5. Whether integration assumptions are explicit enough to avoid quiet breakage

If the reviewer cannot explain what the code does on non-happy paths, this lens should produce serious findings.

---

## Applies To

This lens is most useful for:
- business logic-heavy code
- async workflow systems
- API integrations
- stateful automation
- AI-assisted or AI-generated implementations
- systems where wrong output is more likely than total failure

It may be applied to:
- **Code review** to intensify logic-correctness and failure-path scrutiny
- **Security review** when exploitability depends on behavioral defects or weak error-path correctness
- **Production review** when subtle correctness defects create operational or user-trust damage under real workloads

---

## Core Review Rule

Do not confuse plausibility with correctness.

A project does **not** get credit because:
- the code looks idiomatic
- the tests are green
- the function names sound right
- the happy path works in a demo
- the implementation is complete enough to look finished

The reviewer must test the behavior mentally and structurally against:
- edge inputs
- partial failure
- async timing
- repeated execution
- real-world data variation

---

## What This Lens Should Emphasize

### 1. Silent Failure Absorption
Reviewer should intensify attention on:
- empty `catch` / `except` blocks
- failure paths that return success-shaped values
- error swallowing without logging or surfacing
- async/background paths where failures disappear silently

### Example failure patterns
- exception caught and ignored with no operator signal
- failure converted into empty result that downstream code treats as valid
- background task errors dropped entirely

---

### 2. Business Logic Correctness
Reviewer should intensify attention on:
- whether the code implements the intended business rule
- ordering mistakes in calculations or state transitions
- inverted conditionals
- wrong default assumptions that produce believable but incorrect output

### Example failure patterns
- discount/tax/order logic executed in the wrong sequence
- authorization-like business rules applied to the wrong field or state
- result appears reasonable but violates actual business intent

---

### 3. Async & Concurrency Behavior
Reviewer should intensify attention on:
- missing `await`
- fire-and-forget tasks in important paths
- promise chains without rejection handling
- race-prone state updates
- workflow steps whose ordering assumptions are not enforced

### Example failure patterns
- async call launched but result never awaited before response is returned
- duplicate side effects from parallel execution assumptions
- event processing order matters, but code treats it as harmlessly concurrent

---

### 4. Stub, Placeholder & Hollow Logic Detection
Reviewer should intensify attention on:
- TODO-backed live logic
- hardcoded success responses
- partial implementations masquerading as complete features
- scaffolding that still sits in real execution paths

### Example failure patterns
- function logs the action and always returns success
- placeholder branch used in production path because tests never reached deeper logic
- “temporary” stub survives into real workflow execution

---

### 5. Input Boundary & Edge-Case Handling
Reviewer should intensify attention on:
- empty/null/missing values
- zero/negative/small/large boundary cases
- malformed but non-malicious inputs
- partial object/data assumptions
- whether code only handles the training-example shape of the data

### Example failure patterns
- empty array or zero value breaks a calculation path
- optional fields assumed present because examples always included them
- unexpected but ordinary upstream variation produces incorrect behavior

---

### 6. Data Mutation & Side-Effect Leakage
Reviewer should intensify attention on:
- mutation of caller-owned objects/data
- helper functions with hidden side effects
- shared mutable state altered in convenience utilities
- state changes that are not obvious from naming or call structure

### Example failure patterns
- “format” helper mutates the original object
- utility function writes to global/shared state unexpectedly
- caller assumes pure transform but receives modified shared data

---

### 7. Error-Path Completeness
Reviewer should intensify attention on:
- whether important failure modes have explicit handling at all
- parsing, network, file, and dependency failures
- fallback behavior after partial failure
- whether the code distinguishes retryable from terminal conditions

### Example failure patterns
- success path fully implemented, failure path effectively undefined
- parse/network failure collapses into generic wrong-state behavior
- retry happens where failure should terminate, or vice versa

---

### 8. State Machine Integrity
Reviewer should intensify attention on:
- valid vs invalid state transitions
- repeated transitions
- missing terminal states
- states with no recovery or exit path
- workflow automation whose actual state graph is incomplete

### Example failure patterns
- item can enter “completed” twice and duplicate side effects
- stuck intermediate states with no timeout or escape path
- transitions exist for expected states but not for real edge-state combinations

---

### 9. Return-Value Contract Consistency
Reviewer should intensify attention on:
- inconsistent return types across similar failure modes
- callers not handling all possible return shapes
- `null` / `undefined` / empty-object ambiguity
- mismatch between typed contract and runtime behavior

### Example failure patterns
- one path throws, another returns `null`, another returns `{ ok: false }` for the same condition
- caller assumes object always returned and fails indirectly later

---

### 10. Dead-Branch & Reachability Illusions
Reviewer should intensify attention on:
- branches that look meaningful but are unreachable
- condition trees with contradictory logic
- defensive branches copied in but never actually triggerable
- behavior coverage that appears broader than it is

### Example failure patterns
- mathematically impossible branch remains as fake coverage
- fallback logic exists only cosmetically because the condition cannot occur as written

---

### 11. Integration Assumption Drift
Reviewer should intensify attention on:
- assumptions about upstream/downstream response shapes
- ordering assumptions in integration workflows
- implicit schema expectations not validated at runtime
- “works with current API” logic that is brittle under ordinary change

### Example failure patterns
- external API response fields assumed stable without checks
- result order assumed meaningful when provider does not guarantee ordering
- integration code breaks quietly when optional field is missing or renamed

---

### 12. Retry & Idempotency Defects
Reviewer should intensify attention on:
- repeated execution of non-idempotent operations within a function, endpoint, or single execution path
- retries on state-changing operations without safeguards
- duplicate notifications, writes, or charges caused by local code-path behavior
- whether a unit of work is safe when called twice by accident

Workflow-level replay, duplicate triggers, and multi-step orchestration idempotency belong primarily to the Workflow & Automation Reliability lens.

### Example failure patterns
- retry logic inside one endpoint duplicates record creation or billing action
- “at least once” handling is assumed safe though the local side effect is destructive or irreversible
- a function or job handler produces user-visible duplicates when invoked twice with the same input

---

## What This Lens Should Not Duplicate

This lens should not become a generic everything pass.

Avoid using it to re-run:
- injection/security vulnerability review → Security 4
- secret exposure review → Secrets & Trust Boundaries / Security 6
- dependency vulnerability review → Code 5 / Security 5
- style/readability cleanup review → Code Health & Simplification
- platform/infrastructure performance review → Production 4 / Security 8
- generic test-coverage metrics → Code 3
- workflow-level replay safety, duplicate triggers, and orchestration idempotency → Workflow & Automation Reliability

Instead, this lens should focus on **behavioral correctness defects**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Defect Discovery Lens Summary
- Overall defect-risk posture:
- Highest-risk behavioral defect:
- Most uncertain execution path:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Silent failure absorption | PASS / NEEDS_WORK / BLOCK | ... |
| Business logic correctness | PASS / NEEDS_WORK / BLOCK | ... |
| Async & concurrency behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Stub / placeholder detection | PASS / NEEDS_WORK / BLOCK | ... |
| Input boundary handling | PASS / NEEDS_WORK / BLOCK | ... |
| Data mutation / side effects | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Error-path completeness | PASS / NEEDS_WORK / BLOCK | ... |
| State machine integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Return-value contracts | PASS / NEEDS_WORK / BLOCK | ... |
| Dead-branch illusions | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Integration assumption drift | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Retry & idempotency defects | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Defect class:
- Evidence:
- Observed behavior:
- Expected behavior:
- Trigger condition:
- Fix direction:

### Defect Lens Blockers
- Blocking defects:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- a defect is likely to produce materially wrong behavior in ordinary use
- silent failure or incorrect state change undermines trust in a core path
- retry/idempotency or integration drift can create serious downstream harm
- stage-level confidence would be misleading unless the defect is fixed

### NEEDS_WORK-level lens findings
Use when:
- the code is directionally sound but contains meaningful behavioral fragility
- edge-case or async defects are present but bounded and fixable
- important paths are correct enough to proceed cautiously, not confidently

### PASS-level lens findings
Use when:
- the reviewer can explain key behavior on happy and non-happy paths with confidence
- no major plausible-but-wrong behavior remains in core flows
- async, state, and retry behavior are bounded enough for the assessed scope

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- “complete” functions that always return success
- swallowed exceptions in live paths
- missing awaits that create inconsistent or lost side effects
- branch logic that looks right but implements the wrong business rule
- edge inputs that break ordinary workflows
- helper functions mutating caller-owned objects unexpectedly
- workflow states with no valid recovery/exit path
- inconsistent return shapes that create downstream silent defects
- integration code assuming a provider/API will always answer in the same shape
- retries that duplicate destructive or user-visible actions

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **AI Systems** for AI-specific correctness and non-deterministic behavior
- **Code Health & Simplification** when defects are amplified by structural mess or duplication
- **Workflow & Automation Reliability** when subtle defects affect business process orchestration
- **UX & Interaction Clarity** when behavioral defects surface through confusing or misleading product behavior

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I examined the system as if it were trying to be wrong in subtle ways, and I can explain how important paths behave across failure, async timing, edge inputs, and repeated execution without relying on surface plausibility alone.

If that statement cannot be made honestly, this lens should produce serious findings.

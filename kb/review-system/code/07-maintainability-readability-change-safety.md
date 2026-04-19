---
type: review-stage
review_type: code
stage: 7
stage_name: "Maintainability Readability Change Safety"
version: 1.0
updated: 2026-04-18
---
# Code Stage 7 — Maintainability, Readability & Change Safety

## Stage Metadata
- **Review type:** Code
- **Stage number:** 7
- **Stage name:** Maintainability, Readability & Change Safety
- **Purpose in review flow:** Determine whether humans can understand, modify, and extend the codebase safely without introducing avoidable regressions
- **Default weight:** High
- **Required reviewer posture:** Practical, clarity-focused, skeptical of code that works only for its original author
- **Lens interaction:** Lenses may shift attention to specific maintainability hazards, but this stage always evaluates whether the code can survive future change
- **Depends on:** Code Stage 1 reviewability baseline, Code Stage 2 architecture coherence, Code Stage 4 implementation complexity findings
- **Feeds into:** Code Stage 9, Production Stage 7, Security Stage 9
- **Security/Production handoff:** Record maintainability debt, bus-factor risk, and human-supportability issues that will affect operational ownership and security remediation realism

---

## Why This Stage Exists

A project that works today can still be unsafe to own tomorrow.

Vibe-coded projects often optimize for immediate completion rather than durable maintainability. Common failure modes include:
- giant functions that technically work but are painful to reason about
- names that sound impressive but hide side effects or true behavior
- repetitive logic with subtle drift between copies
- comments describing what the model meant rather than what the code now does
- scattered inline constants, config branches, and toggles
- code structure that only makes sense if you remember the prompt history that created it

This stage asks:

> Can a competent maintainer safely understand and change this codebase without heroic effort?

If the answer is no, then “it works” is not enough.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the code is readable enough for a competent maintainer to understand
2. Whether modules/functions are cohesive enough to change safely
3. Whether duplication and abstraction are balanced rather than drifting into chaos or ceremony
4. Whether comments and naming help understanding instead of corrupting it
5. Whether future changes appear localized or explosively risky

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Maintainability summary**
2. **Naming/readability findings**
3. **Decomposition/coupling findings**
4. **Duplication/abstraction findings**
5. **Comment quality / design-rationale findings**
6. **Change-safety and bus-factor findings**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- representative core modules and large files
- naming patterns for functions, variables, classes, and booleans
- comments, TODO/HACK-style notes, and commented-out code
- repeated logic blocks and abstraction boundaries
- import graph / coupling indicators where practical
- tests as maintenance aids, not just correctness checks
- code areas with non-obvious trade-offs or branching complexity

---

## Core Review Rule

This is **not** a style-policing stage.

The reviewer is not here to enforce personal formatting taste.
The reviewer is here to determine whether the code can be safely understood and changed.

Readable code with a few stylistic quirks can pass.
Pretty code that hides coupling, duplication, or intent confusion should not.

---

# Review Procedure

## Step 1 — Review Naming & Intent Clarity

Determine whether names help the reader understand behavior.

### Check
- [ ] Functions, classes, and variables are named for intent rather than vague implementation detail
- [ ] Naming does not materially mislead about behavior or side effects
- [ ] Boolean naming is understandable and not confusingly double-negative
- [ ] Important domain concepts use reasonably consistent names across files

### Reviewer questions
- If I read this name without the body, what behavior would I expect?
- Does the implementation match that expectation?
- Are key concepts named consistently enough to reduce mental overhead?

### Example — Incorrect
```python
def validate_user(user):
    save_to_db(user)
    send_email(user)
    return True
```
Why it fails:
- name promises validation only
- side effects hidden

### Example — Better
```python
def create_user_account(user):
    validate_user(user)
    save_to_db(user)
    send_welcome_email(user)
```
Why it passes:
- name better matches behavior

---

## Step 2 — Review Cohesion & Decomposition

Determine whether functions/files do one main job or are overloaded.

### Check
- [ ] Functions do one main job or a tightly related set of jobs
- [ ] God functions/modules are identified and flagged
- [ ] Files/modules have clear responsibility boundaries
- [ ] Related behavior is grouped coherently rather than scattered arbitrarily

### Reviewer questions
- Is this file/function responsible for too much?
- If I change one concern here, what unrelated concerns might break?
- Is behavior grouped in a way a new maintainer can follow?

### Common failure patterns
- one route handler performing validation, persistence, auth branching, formatting, retries, and notification
- giant service files acting as system-wide dumping grounds
- feature behavior scattered across multiple unrelated helpers and config branches

---

## Step 3 — Review Control-Flow Readability

Determine whether the code is understandable enough to modify safely.

### Check
- [ ] Nesting depth and branching complexity remain understandable
- [ ] Guard clauses are used where they improve clarity
- [ ] Async/callback/promise flow is readable enough to reason about
- [ ] The code avoids unnecessarily tricky condition chains

### Example — Incorrect
```javascript
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.status !== 'cancelled') {
          // core logic buried here
        }
      }
    }
  }
}
```

### Example — Better
```javascript
function processOrder(order) {
  if (!order || !order.items?.length) return;
  if (order.status === 'cancelled') return;
  // core logic here
}
```

The reviewer should care less about style purity than about whether the execution path remains legible.

---

## Step 4 — Review Duplication vs Abstraction Quality

Determine whether the codebase repeats logic dangerously or abstracts prematurely.

### Check
- [ ] Repeated logic is not drifting across multiple files or functions
- [ ] Shared abstractions exist where repetition is meaningful
- [ ] The code is not over-abstracted into ceremony without benefit
- [ ] Inline constants/numbers are not spread across critical logic paths

### Reviewer questions
- Is this repetition acceptable, or already drifting?
- Was this abstraction introduced because it helps, or because it sounds architectural?
- Would a future change require editing the same rule in multiple places?

### Example — Incorrect
```python
if user.role == "admin":
    ...
# elsewhere
if user.role == "Admin":
    ...
```
Why it fails:
- drift and inconsistency create bug/change risk

### Example — Better
```python
class UserRole:
    ADMIN = "admin"
```
used consistently.

---

## Step 5 — Review Comment Quality & Design Rationale

Comments matter here, but only when they improve understanding.

### Check
- [ ] Comments explain *why* where code is non-obvious
- [ ] Comments are not stale or contradicted by implementation
- [ ] Commented-out dead code is absent or minimal
- [ ] Design/risk comments exist near intentionally unusual choices
- [ ] Reviewer challenges comments that excuse avoidable complexity without justification

### Example — Low-value comment
```python
# increment counter by 1
counter += 1
```
Why it fails:
- noise, not reasoning

### Example — Useful comment
```python
# Counter is 1-indexed because downstream pagination API rejects page 0
counter += 1
```
Why it passes:
- explains a non-obvious constraint

### Important rule
Comments are evidence of rationale, not waivers for bad structure.

---

## Step 6 — Review Change Safety & Coupling

Determine whether likely changes appear containable.

### Check
- [ ] Likely changes seem localized rather than explosively cross-cutting
- [ ] Side effects are controlled or explicit
- [ ] Important state mutation is understandable and not hidden across many files
- [ ] Feature toggles/config switches are not scattered dangerously
- [ ] Hidden coupling is surfaced where changing one module likely breaks many others

### Reviewer questions
- If I changed this feature next week, where else would I be afraid to touch?
- Does the code signal its side effects clearly?
- Is regression risk local or systemic by default?

---

## Step 7 — Review Bus Factor & Tacit Context Risk

This step is especially important for vibe-coded projects.

### Check
- [ ] Someone other than the original builder could plausibly extend the code safely
- [ ] Setup rituals and context-dependent assumptions are surfaced where needed
- [ ] Hidden project history is not required to understand core flows
- [ ] Commit-message-only or tribal-history knowledge is not quietly necessary for safe changes

### Common failure patterns
- only the original prompter knows why three parallel modules exist
- comments assume internal context not captured in repo
- safe modification depends on remembering which generated file should never be edited directly

---

## Step 8 — Review Tests as Maintenance Support

Tests are part of maintainability when they help future change.

### Check
- [ ] Tests are named clearly enough to support change
- [ ] Tests help explain intended behavior rather than obscure it
- [ ] Tests are not so brittle or opaque that they increase fear of refactoring

This is not a re-run of Stage 3. The question here is whether the tests help a maintainer move safely.

---

## Step 9 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Code 9:** maintainability debt and bus-factor risk must influence release confidence
- **Production 7:** human supportability, ops ownership, and on-call change safety
- **Security 9:** maintainability issues that make remediation, patching, or ownership of security debt unrealistic

### Required handoff block
- **Carry-forward concerns:**
  - Readability/understandability:
  - Coupling/change risk:
  - Duplication/drift risk:
  - Bus-factor / tacit-knowledge risk:
  - Operational ownership impact:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny of long generated files, repetitive abstractions, prompt-history-only structure, and low-signal naming
- **code-cleaner lens:** push harder on duplication, readability, and unnecessary complexity
- **bug-hunt lens:** emphasize maintainability hazards likely to hide future defects
- **platform lens:** emphasize scattered environment-specific branches that make safe change harder

---

## Severity / Gating Model

### PASS
Use PASS when:
- code is readable enough for a competent maintainer to work safely
- responsibilities and abstractions are mostly coherent
- comments and naming support understanding
- maintainability debt remains manageable for project maturity

### NEEDS_WORK
Use NEEDS_WORK when:
- code is understandable but brittle, repetitive, or harder to change than it should be
- readability and maintainability issues are meaningful but not catastrophic
- future work would be risky without cleanup

### BLOCK
Use BLOCK when:
- maintainability is so poor that safe change is unrealistic
- hidden coupling or unreadable structure materially undermines trust in future modifications
- stale/misleading comments are likely to cause serious misunderstanding in critical paths
- only the original builder could plausibly modify the project safely

---

## Escalation Guidance

Escalate or explicitly flag when:
- code is technically functional but practically unownable
- bus-factor risk is severe enough to threaten operation or remediation
- hidden coupling means small fixes are likely to create broad regressions
- maintainability debt undermines security patching or on-call safety → Security 9 / Production 7

If the codebase is so brittle or opaque that responsible ownership is unrealistic, use **BLOCK** rather than treating maintainability as cosmetic debt.

---

## Required Report Format

### 1. Maintainability Summary
- Overall readability:
- Ease of understanding core flows:
- Confidence in safe change:

### 2. Naming / Readability Findings
- Strong clarity patterns:
- Misleading names:
- Control-flow readability issues:

### 3. Decomposition / Coupling Findings
- God functions/modules:
- Responsibility-boundary issues:
- Hidden coupling risks:

### 4. Duplication / Abstraction Findings
- Drift-prone repetition:
- Useful shared abstractions:
- Over-abstraction concerns:

### 5. Comment Quality / Design-Rationale Findings
- Helpful rationale comments:
- Stale or misleading comments:
- Commented-out code concerns:

### 6. Change-Safety / Bus-Factor Findings
- Local vs cross-cutting change risk:
- Tacit-context dependency:
- Ownership/supportability implications:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- confuse formatting preferences with maintainability reality
- reward verbose naming that still misleads about behavior
- treat comments as proof that the code is understandable
- ignore bus-factor risk because the current author understands it
- let Stage 9 inherit maintainability debt without explicit ownership impact notes

---

## Final Standard

A project passes this stage only if the reviewer can say:

> A competent maintainer could understand this codebase, change it without heroic effort, and rely on its naming, structure, comments, and tests enough to avoid disproportionate regression risk.

If that statement cannot be made honestly, this stage should not pass.

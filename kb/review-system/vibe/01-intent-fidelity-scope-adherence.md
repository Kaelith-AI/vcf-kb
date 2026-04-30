---
type: review-stage
review_type: vibe
stage: 1
title: "Intent Fidelity & Scope Adherence"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 1 — Intent Fidelity & Scope Adherence

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 1
- **Stage name:** Intent Fidelity & Scope Adherence
- **Purpose in review flow:** Establish whether the LLM's output addresses the actual problem stated, within the scope authorized, without silent expansion or substitution
- **Default weight:** Highest importance within Vibe review
- **Required reviewer posture:** Skeptical, prompt-aware, boundary-focused. Read the original request and the output as a pair, not the output alone.
- **Lens interaction:** All lenses may intensify particular scope concerns, but none may waive the requirement to establish whether the problem solved matches the problem posed

---

## Why This Stage Exists

This stage answers the most foundational question in any AI-assisted workflow:

> Did the LLM solve the problem that was actually asked?

This question is harder than it sounds. LLM outputs often look correct to a reader who has not recently re-read the original request. The model may have solved a near-neighbor problem that resembles the stated goal but differs in important ways — producing output that reads fluently, passes a surface check, and still fails the underlying intent.

The specific failure modes this stage guards against are structurally different from what code review addresses:

**Silent scope creep.** The LLM refactors files that were not in scope, changes APIs not mentioned in the request, or "improves" adjacent code without flagging the expansion. The reviewer who only reads the changes might never notice what was not asked for is also present.

**Problem substitution.** The model solved a problem that is easier than the one stated, or solved a common pattern from its training data rather than the specific configuration or constraint in this system. The output is technically coherent but contextually wrong.

**Overclaimed deliverables.** The output claims to implement what was asked but only partially executes it — the rest is scaffolding, stub, or aspirational comment that reads like completion.

**Request drift.** In a multi-turn conversation, the request evolved and the final output addresses an earlier or narrower version rather than the current stated goal.

**Unauthorized simplification.** The LLM found a simpler version of the problem, solved that, and presented the result as satisfying the original — dropping a constraint, ignoring a qualifier, or assuming away the hard part.

This is why this stage runs first. If the model did not solve the right problem, the quality of the solution is irrelevant. A correct answer to the wrong question is not a correct answer.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What the original request actually said** — the literal scope, stated constraints, named stop conditions
2. **What the LLM claims to have done** — in its own summary language and in the actual changes
3. **Whether the delivered work addresses the stated request** — not a near-neighbor, not a subset, not an expansion
4. **What is in the delivered scope that was not requested** — silent scope creep, unauthorized additions
5. **What was requested that is absent, deferred, or only partially addressed**
6. **Whether the LLM's framing of completeness is honest** — or whether it asserts delivery of something it only approximated

If the reviewer cannot answer those questions with evidence from the request and the output, this stage should not pass.

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Request reconstruction** — the actual stated problem in the reviewer's own words, reconstructed from the original prompt/spec/task
2. **Delivery summary** — what the LLM's output actually contains, independent of the LLM's own framing
3. **Fidelity gap table** — requested vs delivered, with gaps, expansions, and substitutions called out explicitly
4. **Silent scope creep findings** — unauthorized changes or additions not in the request
5. **Constraint preservation assessment** — whether named constraints in the request are honored in the output
6. **Completion honesty assessment** — whether the LLM's own framing of what it delivered matches reality
7. **Carry-forward concerns for later stages**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- the original request, task spec, or prompt — this is ground truth for this stage
- the LLM's stated summary of what it did (if any)
- the actual changes, additions, and deletions in the output
- any files or areas the LLM touched that were not mentioned in the request
- any LLM-voiced caveats or "I also..." statements
- prior conversation turns if this was a multi-turn session
- the project's existing constraints, architecture rules, or explicitly stated "do not touch" boundaries

This stage is unusual in that **the primary evidence source is the original request itself**. A reviewer who does not re-read the request before reviewing the output cannot do this stage honestly.

---

## Core Review Rule

The reviewer must compare the **output against the request**, not the output against its own internal consistency.

A coherent, well-structured output that solves the wrong problem is a Stage 1 failure.

Specifically:
- **Requested** — what the original prompt/spec explicitly asked for
- **Delivered** — what the output actually contains, verified against the changes
- **Claimed delivered** — what the LLM says it delivered in its own summary language
- **Expanded** — what the LLM changed or added beyond the request
- **Substituted** — what the LLM solved in place of the harder or more specific thing asked

Never collapse these into one category. A reviewer who only reads the output and never re-reads the request cannot distinguish "delivered" from "substituted."

---

# Review Procedure

## Step 1 — Reconstruct the Actual Request

Before evaluating the output, the reviewer must re-read the original request and state it in their own words.

### Check
- [ ] The original request is identifiable (prompt, task, spec, issue, commit message, conversation turn)
- [ ] The request has a clearly stated goal
- [ ] The request has named constraints, boundaries, or scope limits
- [ ] Any stop conditions or "do not" instructions are surfaced
- [ ] In a multi-turn session, the final/latest request state is used, not an earlier version

### Reviewer questions
- What was the LLM explicitly asked to do?
- What was explicitly outside scope?
- Were there specific constraints named (do not change X, only modify Y, stop if Z)?
- If this is multi-turn: did the request evolve? Which version counts as current?

### Common failure patterns
- Reviewer reads the output before re-reading the request, and loses the comparison basis
- Multi-turn session: LLM addressed the first version of the request but not the refinements
- Request contained a scoped list ("change only these files"); output touched broader surface
- Request contained an explicit "stop if" that the LLM rationally bypassed

### Example — Correct request reconstruction
**Original request:** "Update the `UserService.findById` method to throw a typed `NotFoundError` instead of returning `null`. Do not change the method signature. Do not touch any other methods in the file."

**Reviewer reconstruction:** The task is: change the return path of one method in one file from null-return to typed-throw. Scope is limited to that method only. Constraint: signature must not change.

### Example — Incorrect reviewer behavior
Reading the LLM's output first, then reading the request through the lens of "does this make sense for what the LLM did?" — this inverts the comparison and fails to catch problem substitution.

---

## Step 2 — Map Claimed Deliverables Against Actual Deliverables

Determine whether the LLM's own framing of what it delivered matches reality.

### Check
- [ ] The LLM's stated summary of changes is identifiable
- [ ] Each claimed deliverable can be traced to actual changes in the output
- [ ] Claims about completeness are verified against the actual state of the output
- [ ] "I also..." additions are separated from core deliverables and evaluated independently

### Reviewer questions
- What does the LLM say it did?
- Does the output match that claim?
- Are there gaps between what the LLM claims and what actually changed?
- Does the LLM signal any omissions or deferral honestly?

### Common failure patterns
- LLM says "I've updated all the error handling" but several paths still return null
- LLM says "done" but the implementation stops halfway through the stated requirement
- LLM says "I also improved X" — the "also" is an unauthorized addition that needs independent evaluation
- LLM's summary uses future-tense language ("this will now properly handle...") where the present-tense implementation is incomplete

### Example — Incorrect
**LLM summary:** "I've updated all the API routes to use the new authentication middleware."

**Observed:** Two routes were updated. Three are unchanged. Two routes that existed at review time are not mentioned.

**Why it fails:** The LLM's framing of completeness is false. This is not a minor gap; it is false completion.

---

## Step 3 — Identify Silent Scope Creep

Determine whether the output contains changes that were not requested and not flagged.

### Check
- [ ] Every file modified can be traced to the original request
- [ ] Changes not mentioned in the request are explicitly flagged by the LLM if present
- [ ] Refactors, renames, or reformats beyond the stated task are identified and separated
- [ ] The reviewer can distinguish "task-required changes" from "unrequested additions"

### Reviewer questions
- What changed that was not asked for?
- Did the LLM flag these additions proactively?
- Are the unrequested changes consequential (behavior-affecting) or cosmetic (formatting)?
- Does the addition create coupling, unexpected breakage, or implicit scope expansion?

### Common failure patterns
- LLM updated a config file "to match the new behavior" without mentioning it — the config is now out of sync with the actual intent
- LLM refactored a function it touched "for clarity" — introducing behavior changes that were not reviewed as part of the request
- LLM renamed a constant while updating it — creating a breaking change in a different module that was never in scope
- LLM added logging, metrics, or error tracking "while it was there" — introducing a new dependency and trust boundary without explicit authorization

### Example — Correct flagging
LLM note: "I also updated the `ErrorTypes.ts` file to add the new `NotFoundError` class, as this was required to make the type-safe throw possible. This change is adjacent to the request; if you'd prefer that class live elsewhere, let me know."

This is acceptable: the LLM flagged the addition, explained why it was necessary, and asked for confirmation. The reviewer can assess whether the reasoning is valid.

### Example — Incorrect (silent scope creep)
LLM changes: modified `UserService.ts` (requested), modified `ErrorTypes.ts` (not mentioned), also modified `userRouter.ts` to add a validation layer that calls the updated service differently — not mentioned anywhere.

The LLM made three changes; the request covered one. The other two are invisible until the reviewer compares against the original request.

---

## Step 4 — Verify Constraint Preservation

Determine whether named constraints in the request are honored.

### Check
- [ ] Every explicit constraint in the request is identifiable
- [ ] Each constraint is checked against the actual output
- [ ] Violated constraints are recorded, even when the violation appears "helpful"
- [ ] "Do not touch X" constraints are verified — not assumed honored because the file is not the primary focus

### Reviewer questions
- What constraints were named in the request?
- Which are preserved? Which are violated?
- Where a constraint was violated, did the LLM explicitly flag and justify this?
- Is there a legitimate reason for the violation, or was the constraint simply not respected?

### Definitions
- **Named constraint:** Explicitly stated in the request ("do not change the method signature", "stop if the test fails", "only modify the service layer")
- **Implied constraint:** Reasonable inferences from context (the request asked to fix a bug, not redesign the module)
- **Stop condition:** A condition under which the LLM was supposed to halt rather than continue

### Common failure patterns
- Request said "do not change the public API" — LLM changed a function's parameter order "for consistency"
- Request said "only modify the auth module" — LLM also modified the router because the router called auth functions
- Request said "stop if you cannot find the root cause" — LLM implemented a defensive workaround instead of stopping
- Request said "flag any assumptions you make" — LLM made several key assumptions silently

### Example — Correct constraint application
**Request:** "Fix the null pointer exception in `OrderProcessor.process()`. Do not refactor the method — only add the missing null check."

**Good output:** Adds null check on lines 34-36. No other changes in the file. LLM note: "Added null guard before `order.items` is accessed on line 35. No other changes."

**Why it passes:** Single targeted change. Constraint honored. Summary honest.

### Example — Incorrect constraint application
**Request:** "Fix the null pointer exception in `OrderProcessor.process()`. Do not refactor the method."

**Observed:** Null check added, but the LLM also extracted three helper functions, reordered conditionals, and renamed a local variable.

**Why it fails:** The constraint was explicit. The LLM violated it without flagging the violation.

---

## Step 5 — Identify Problem Substitution

This is the hardest check in this stage.

Determine whether the LLM solved a near-neighbor problem rather than the stated problem.

### Check
- [ ] The stated problem has specific constraints or context that distinguish it from the general case
- [ ] The LLM's solution addresses those specific constraints, not just the general shape of the problem
- [ ] Where context-specific behavior matters, the LLM has respected it rather than solving for a typical case
- [ ] The reviewer can explain in one sentence why this output addresses this specific request (not "an API error handling request" generically)

### Reviewer questions
- What makes this specific request different from the generic version of the same problem?
- Does the output reflect that specificity?
- Could this output have been generated without reading the project's actual code, context, or constraints?
- Does the solution look like it came from training data rather than from reading the actual system?

### Common failure patterns
- Project uses a specific error hierarchy; LLM used a standard library exception class instead, losing the typed hierarchy the rest of the system depends on
- Request asked to fix retry logic for a rate-limited external API; LLM implemented generic exponential backoff ignoring the specific rate-limit headers and retry-after semantics this API uses
- Request was to fix pagination in a cursor-based API; LLM implemented offset-based pagination (which it clearly knows better) instead
- Request asked to add observability to a specific function; LLM added generic logging that does not capture the business-relevant context the team actually needs

### Example — Correct
**Request:** "The `sendNotification` function needs to respect the user's `notification_channel` preference (either 'email' or 'slack'). Right now it always emails."

**Good output:** Reads `user.notification_channel` and routes to `sendEmail()` or `sendSlackMessage()` accordingly. The preference field was already in the user model.

**Why it passes:** The LLM solved the specific routing problem using the existing data model. It did not introduce a generic notification abstraction or change the interface.

### Example — Incorrect
**Request:** Same as above.

**Observed output:** Creates a new `NotificationProvider` interface, a factory pattern, an `EmailNotificationProvider` and `SlackNotificationProvider` class, registers them in a DI container. Dispatches based on the preference field.

**Why it fails (Stage 1):** The LLM generalized the problem into a design pattern exercise. This may or may not be the right long-term design, but it is not what was asked for. The scope is substantially larger, the architecture footprint is changed, and the reviewer cannot evaluate "did the LLM solve the stated problem" because the LLM substituted a more interesting problem.

---

## Step 6 — Assess Completion Honesty

Determine whether the LLM's characterization of its work as complete is accurate.

### Check
- [ ] When the LLM says "done," the work is substantively complete for the stated task
- [ ] Where the LLM leaves something incomplete, it flags it explicitly
- [ ] Aspirational or placeholder language in the output is not presented as completed implementation
- [ ] Comments like "this will now properly handle..." are checked against whether the code actually does that

### Reviewer questions
- Is there anything in the output that reads as done but is only partially implemented?
- Does the LLM's summary accurately reflect the output's state?
- Are there any "TODO: implement this part" residues that contradict the completion claim?
- Would a maintainer reading this output six months from now believe it is complete when it is not?

### Common failure patterns
- LLM adds a comment `// Handle rate limit here` in the right location but provides no implementation
- LLM says "I've added error handling for all the edge cases" but several obvious failure modes have empty catch blocks
- Output compiles and the tests pass, but the LLM quietly skipped a required step because it was hard
- LLM completes the happy path but the error paths are stubs that return undefined or throw not-implemented errors

---

## Step 7 — Record Cross-Stage Handoff Notes

Stage 1 findings carry forward into every subsequent stage.

### Required handoff targets
- **Vibe 2:** intent fidelity gaps may involve hallucinated references — verify claimed APIs, RFCs, library behaviors actually support the solution
- **Vibe 3:** constraint violations are stop-condition failures — Vibe 3 deepens this
- **Vibe 4:** completion claims feed into Vibe 4's completeness discipline check
- **Vibe 5:** silent scope creep may reflect self-flagging failures — was the LLM honest?
- **Vibe 6:** problem substitution is Stage 6's primary concern — flag pattern-match signals here
- **Vibe 9:** fidelity gaps, scope violations, and false completion claims all reduce release confidence

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Request fidelity:
  - Scope violations:
  - Constraint violations:
  - Completion honesty:
  - Problem substitution signals:
  - Release confidence impact:

---

## Lens Interaction Guidance

Lenses do not change the obligation to verify intent fidelity.
They change what specific patterns to scrutinize more closely.

Examples:
- **api-focused lens:** intensify scrutiny of whether the LLM applied the correct API semantics for this system's specific API contract, not a generic interpretation
- **refactor lens:** pay extra attention to unauthorized scope expansion; "refactoring" is the most common vehicle for silent scope creep
- **bug-fix lens:** verify the stated bug is actually fixed, not worked around or deferred behind a defensive check that masks the symptom
- **feature lens:** verify the feature is actually implemented end-to-end, not just scaffolded with aspirational structure

---

## Severity / Gating Model

### PASS
Use PASS when:
- the output substantively addresses the stated request
- scope is bounded to what was authorized (or any expansion was explicitly flagged)
- named constraints are honored
- the LLM's framing of completion is honest
- problem substitution is absent or acknowledged

### NEEDS_WORK
Use NEEDS_WORK when:
- the output partially addresses the request with meaningful gaps
- minor scope creep exists but was flagged or is clearly benign
- completion framing is optimistic but the gap is bounded and fixable
- constraint violations are present but not consequential to the core deliverable

### BLOCK
Use BLOCK when:
- the LLM solved a materially different problem than the one stated
- major named constraints are violated without acknowledgment
- the output is substantially outside the authorized scope in ways that affect other systems
- the LLM's completion claim is false in ways that could cause the work to be shipped as done when it is not

---

## Escalation Guidance

Escalate or explicitly flag for stronger downstream scrutiny when:
- problem substitution is suspected → Vibe 6 (pattern matching vs actual solution)
- the LLM claimed to verify something it could not have verified → Vibe 2 (evidence integrity)
- stop conditions appear to have been rationalized past → Vibe 3 (constraint adherence)
- the scope expansion touches security-relevant or trust-sensitive code → flag for code/security review

---

## Required Report Format

Use this report structure for Stage 1 output.

### 1. Request Reconstruction
- Original request summary (in reviewer's words):
- Stated constraints:
- Named stop conditions:
- Authorized scope boundaries:

### 2. Delivery Summary (Independent of LLM Framing)
- What actually changed:
- Files modified beyond the stated scope:
- Unrequested additions:

### 3. Fidelity Gap Table
| Requested Item | Delivered | Gap / Substitution |
|---|---|---|
| Item A | Yes / Partial / No / Substituted | ... |
| Item B | ... | ... |

### 4. Silent Scope Creep Findings
- Unrequested changes:
- Whether flagged by LLM:
- Consequence assessment:

### 5. Constraint Preservation Assessment
| Constraint Named in Request | Honored | Violation Notes |
|---|---|---|
| Constraint A | Yes / No | ... |

### 6. Completion Honesty Assessment
- LLM's stated summary:
- Reality check:
- False completion signals:
- Unflagged gaps:

### 7. Carry-Forward Concerns
- Request fidelity:
- Scope violations:
- Constraint violations:
- Completion honesty:
- Problem substitution signals:
- Release confidence impact:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- read the output before re-reading the original request
- evaluate the output for internal consistency without comparing it against what was asked
- accept "I also improved X" without assessing whether that expansion was authorized
- treat a passing test suite as proof that the stated request was fulfilled
- assume constraints were honored because the primary change looks correct
- let fluent, confident LLM language substitute for evidence that the right thing was done

---

## Final Standard

A change passes this stage only if the reviewer can say:

> I re-read the original request, I compared it against the actual output, the LLM addressed what was actually asked within the authorized scope, named constraints are honored, and the LLM's framing of what it delivered is honest about what exists and what does not.

If that statement cannot be made honestly, this stage should not pass.

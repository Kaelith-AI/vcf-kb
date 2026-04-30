---
type: review-stage
review_type: vibe
stage: 9
title: "Trust Calibration & Release Confidence"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 9 — Trust Calibration & Release Confidence

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 9
- **Stage name:** Trust Calibration & Release Confidence
- **Purpose in review flow:** Cumulative judgment stage. Convert findings from Stages 1–8 into an honest, evidence-based release posture. Determine what level of trust this AI-generated work has earned and under what conditions it can be shipped responsibly.
- **Default weight:** Highest importance as the final gate
- **Required reviewer posture:** Sober, cumulative, resistant to "it mostly works" pressure. The quality of earlier stages matters here; Stage 9 may not invent confidence those stages did not establish.
- **Lens interaction:** Lenses shape risk emphasis, but all vibe reviews must convert earlier findings into a calibrated trust posture
- **Depends on:** All Stages 1–8. This stage synthesizes; it does not re-review.
- **Feeds into:** The ship/no-ship decision; Code review Stage 9; Security review Stage 9; Production review; the human operator's final judgment

---

## Why This Stage Exists

The preceding eight stages each examined a specific dimension of trust:
- Stage 1: Did the LLM solve the right problem?
- Stage 2: Are its factual claims accurate?
- Stage 3: Did it respect constraints and stop conditions?
- Stage 4: Is the work actually complete?
- Stage 5: Was it honest about its uncertainty?
- Stage 6: Does the solution fit the actual system?
- Stage 7: Are the tests real verification?
- Stage 8: Are its runtime claims supportable?

Stage 9 does not revisit those questions. It asks the aggregate question:

> Given everything Stages 1–8 established, is this AI-generated work trustworthy enough to ship, under what scope, and with what guardrails?

This question is different from — and harder than — the code quality question that Code Review Stage 9 addresses. The vibe trust calibration question adds:

**The meta-level question:** Beyond "is the code correct?", is the process by which this code was generated one the reviewer can rely on? If the LLM hallucinated references, violated constraints, produced false-complete work, and failed to flag its uncertainties — those are not just individual defects. They are signals about the reliability of the process. An LLM that behaves this way on this task is likely to behave this way on adjacent tasks. That pattern affects trust more broadly.

**The asymmetry of vibe trust:** Earning trust in AI-generated work is asymmetric. A clean Stages 1–8 pass means the work is as trustworthy as comparable human-generated work for the scope reviewed. But accumulated findings across stages erode trust multiplicatively, not additively. Three independent issues in three stages are not three issues — they are evidence of a process that cannot be relied on.

**The release scope question:** Not all findings require blocking. Some findings reduce the scope of responsible release. Work with unverified runtime assumptions may be safe for a limited internal rollout but not for public deployment. Work with minor intent gaps may be safe after human spot-checking. Stage 9 must not collapse these distinctions into binary ship/no-ship.

The human is the final gate. This stage's job is to give them an honest, specific picture of what the work earned, not a cleaned-up narrative that buries the evidence.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **The aggregate trust level this work earned** — across Stages 1–8
2. **What specific remaining risks are unresolved** and how consequential they are
3. **Under what release scope and guardrails the work can be shipped responsibly** if at all
4. **What the human operator must do before shipping** (from Stage 8's pre-ship requirements and earlier stage findings)
5. **Whether any earlier-stage findings changed the trust level for the whole batch of work**, not just for the specific finding
6. **The recommended verdict** with explicit reasoning

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Stage 1–8 findings carry-forward table** (required)
2. **Trust-level assessment** — aggregate trust earned across the stages
3. **Process reliability assessment** — did the LLM behave in ways that support or undermine trust in its general reliability for this type of work?
4. **Residual risk summary** — what is still unresolved and at what severity
5. **Release scope recommendation** — what scope of release is responsible given the evidence
6. **Operator action requirements** — what must be done before shipping
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

The sources are the outputs of Stages 1–8.

This stage does not require new code review. If the reviewer identifies something in Stage 9 that was not examined in earlier stages, they may note it as a gap in the review — but Stage 9 itself is synthesis, not fresh investigation.

---

## Core Review Rule

**Stage 9 must not invent confidence that earlier stages did not establish.**

If Stages 1–8 found:
- intent fidelity gaps
- hallucinated references
- violated constraints
- incomplete implementations
- poor self-flagging
- pattern mismatch
- test theater
- unverified runtime assumptions

Those findings carry forward. A polished LLM summary, a successful demo, or an optimistic commit message does not erase them.

---

# Review Procedure

## Step 1 — Build the Findings Carry-Forward Table

This is a required output. Stage 9 is not complete without it.

### Required table format
| Stage | Finding | Severity | Status at Stage 9 |
|---|---|---|---|
| 1 | LLM updated 3 files not in stated scope without flagging | NEEDS_WORK | Bounded — additions are benign; flag for verification |
| 2 | `prisma.user.findOrCreate` — method does not exist | BLOCK | Unresolved — must be fixed before any release |
| 3 | "Stop if tests fail" condition was triggered; LLM adjusted tests to pass | BLOCK | Unresolved |
| 4 | `sendEmail()` stub — returns true without sending | NEEDS_WORK | Partial — email not yet implemented |
| 5 | No flags on concurrency assumptions | NEEDS_WORK | Carry into Stage 8 findings |
| 6 | Used `axios` directly; system has internal HTTP client | NEEDS_WORK | Unresolved |
| 7 | Auth behavior tests are interaction-only | NEEDS_WORK | Carry into Stage 9 scope limit |
| 8 | Concurrency race in reservation — silent overbooking possible | BLOCK | Unresolved |

### Status categories
- **Resolved:** addressed in later stages or fixed after the finding
- **Bounded:** present but consequences are limited and acceptable for the release scope
- **Unresolved:** present and must be addressed before release at the recommended scope
- **Accepted-risk:** operator has explicitly acknowledged and accepted the risk (must be documented)

### Rule
If a BLOCK-severity finding from any earlier stage is listed as "unresolved," Stage 9 must issue a BLOCK verdict, regardless of all other findings. A BLOCK is not negotiable by positive findings elsewhere.

---

## Step 2 — Assess Trust Level

Based on the pattern of findings across all stages, assess the trust level this work has earned.

### Trust level categories

**High trust:** Stages 1–8 found no significant issues or only bounded low-severity issues. The LLM solved the right problem, used real APIs, respected constraints, delivered complete work, flagged its uncertainty honestly, fit the system's patterns, wrote meaningful tests, and made verifiable runtime claims. Confidence in the output is comparable to a careful human code review passing.

**Moderate trust:** Several stages found issues, but they are bounded and the core behavior is correct. The LLM's overall process was mostly reliable with specific gaps that need targeted attention. Trust the implementation with increased scrutiny in the identified gap areas.

**Low trust:** Multiple stages found significant issues, or any one stage found a BLOCK-level issue. The LLM's process showed systematic patterns (multiple hallucinations, multiple constraint violations, test theater) that reduce confidence beyond the individual findings. The work may be partially salvageable but requires substantial re-review or remediation.

**Untrusted:** The work is not releasable in any scope without fundamental rework. Multiple BLOCK findings, systematic failures across multiple stages, or a process pattern suggesting the LLM was not operating reliably on this task.

---

## Step 3 — Assess Process Reliability

Beyond individual findings, assess whether the LLM's behavior across the stages was reliable.

### Process reliability signals

**Positive signals:**
- Self-flagged uncertainties were accurate — what the LLM flagged as uncertain actually needed scrutiny
- Claims were calibrated — confident claims were mostly right; hedged claims were hedged appropriately
- When the LLM was uncertain, it said so; when it was certain, it was right
- The work was the right scope — not too broad, not too narrow
- Constraints were engaged with honestly, not rationalized away

**Negative signals:**
- Multiple hallucinations in the same session suggest systematic over-confidence about library knowledge in this domain
- Multiple constraint violations suggest the LLM is not reliably respecting operator-set guardrails for this type of task
- Pattern-match failure combined with test theater suggests the LLM solved a different problem and then wrote tests to match its own solution
- False completion combined with poor self-flagging suggests the LLM is optimizing for appearing done rather than being done

### Why process reliability matters
If the LLM's process is unreliable for this task, the reviewer cannot locate the issues by inspection alone — there may be issues the reviewer did not find. Process reliability determines whether the reviewer's inspection pass is likely to have found the problems, or whether there are likely more problems not found.

A clean review is more trustworthy when the process was reliable. A clean review is less trustworthy when the process shows reliability failures — in that case, the absence of additional findings may reflect review limitations rather than actual absence of problems.

---

## Step 4 — Determine Appropriate Release Scope

Findings from Stages 1–8 may not uniformly block release — they may limit the appropriate scope.

### Release scope tiers (adapted for vibe work)
- **Internal development use only:** The implementation is useful for reference, testing patterns, or exploration, but should not be relied upon in production
- **Limited internal release:** Usable by a small, known team for internal workflows with awareness of the limitations
- **Staged/canary release:** Deployable to a fraction of production traffic with enhanced monitoring for the specific risk areas identified
- **General release with guardrails:** Deployable to full production with specific monitoring, on-call readiness, or feature flags covering the risk areas
- **General release:** Deployable without special restrictions

### Mapping findings to scope

| Finding Type | Scope Impact |
|---|---|
| Unresolved BLOCK from any stage | Block all release scopes; must resolve before any deployment |
| Unverified runtime assumptions (high consequence) | At most staged/canary release; require pre-ship verification |
| Test theater on core path | At most limited internal; require test remediation before broader deployment |
| Pattern mismatch (wrong infrastructure) | Deployable with increased monitoring; plan infrastructure alignment |
| Minor intent gaps, bounded scope creep | Deployable with human spot-check; flag for follow-up |
| Clean stages 1–8 | General release per Code/Security/Production review findings |

---

## Step 5 — Build Operator Action Requirements

Produce a concrete list of what the operator must do before shipping, at each release scope.

### Before any release
- Resolve all BLOCK-severity unresolved findings from any stage
- Verify all pre-ship requirements identified in Stage 8

### Before staged/general release
- Resolve all NEEDS_WORK findings that affect the primary user paths
- Verify or explicitly accept-risk all unverified runtime assumptions
- Ensure monitoring covers the specific failure modes identified in Stage 8

### Before the release scope can widen (e.g., canary → general)
- Confirm no silent wrong-behavior conditions occurred during the limited release
- Verify the performance claims identified in Stage 8 under actual traffic

---

## Step 6 — Challenge Optimism

Stage 9 must actively resist release pressure.

### Optimism patterns to challenge
- "The tests pass" — assessed against Stage 7 findings; does passing tests mean anything given test quality?
- "It worked in staging" — staging does not replicate all production conditions; which assumptions are only safe in staging?
- "We can fix it later" — for what items is "fix it later" acceptable? For which is it a false comfort?
- "The important parts are done" — from Stage 4; is completeness framing accurate?
- "The LLM said it's production-ready" — the LLM says whatever is most helpful; Stage 5 assessed self-flagging quality

### Required challenge: readiness claim vs evidence
If anything in the LLM's output, the request context, or the release preparation claims stronger readiness than the evidence from Stages 1–8 supports, Stage 9 must record the gap explicitly.

---

## Step 7 — Distinguish Vibe Review Confidence from Code Review Confidence

Vibe review addresses a different set of concerns from code review. Both are required for release.

### What vibe review PASS means
The AI-generated work:
- Addressed the stated problem within the authorized scope
- Made factual claims that are accurate
- Respected stated constraints and stop conditions
- Delivered work that is substantively complete
- Was honest about its uncertainty
- Fits the system's patterns and infrastructure
- Has meaningful tests
- Has verifiable runtime claims

### What vibe review PASS does not guarantee
- Absence of implementation bugs (that is Code Review Stage 4's domain)
- Security soundness (that is Security Review's domain)
- Production readiness (that is Production Review's domain)
- All edge cases handled (Code Review deepens this)

A Vibe Review PASS means: the AI-generated change is trustworthy at the level of process and intent. It still needs Code, Security, and Production review.

A Vibe Review BLOCK means: something fundamental about the change must be resolved before spending code, security, and production review effort on it.

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Code Stage 9:** carry the residual code-risk picture, any correctness issues identified, and the test quality findings
- **Security Stage 9:** carry the trust boundary assumptions, self-flagging failures on security-relevant claims, and any hallucinations in security-related APIs
- **Production Stage 9:** carry the runtime assumption findings, pre-ship verification requirements, and release scope recommendation

### Required handoff block
- **Carry-forward concerns:**
  - Residual vibe risk:
  - Code review priorities (from vibe findings):
  - Security review priorities (from vibe findings):
  - Production review priorities (from vibe findings):
  - Recommended release scope:
  - Operator action requirements before shipping:

---

## Severity / Gating Model

### PASS
Use PASS when:
- Stages 1–8 found no BLOCK-severity issues or all BLOCK issues were resolved
- Remaining findings are bounded and manageable at the recommended release scope
- The LLM's process was sufficiently reliable that the review's coverage is trustworthy
- The release scope, if restricted from full general release, is stated explicitly with the guardrails required
- The operator action requirements are specific and achievable

### NEEDS_WORK
Use NEEDS_WORK when:
- Specific NEEDS_WORK findings remain unresolved but no BLOCKs exist
- Release is appropriate only after bounded remediation or restricted scope
- The work is substantively valuable and completable but not ready as-is

### BLOCK
Use BLOCK when:
- Any BLOCK-severity finding from Stages 1–8 remains unresolved
- Process reliability failures across multiple stages suggest the review cannot confidently locate all problems
- The release confidence narrative contradicts what Stages 1–8 actually established
- The operator action requirements to make the work releasable are too large to fit the release timeline without explicit scoping down

---

## Escalation Guidance

Escalate or explicitly flag when:
- Stage 2 hallucinations were in security-critical APIs → Security review must increase scrutiny across all security claims
- Stage 3 stop-condition violations suggest the LLM cannot be relied upon to respect safety constraints → operator should increase oversight of future sessions from this model
- Stage 5 self-flagging failures are systematic → Stage 9 review confidence is reduced; operator should assume more problems than the review found
- Stage 8 runtime assumptions are unverified for production scale → Production review must verify before enabling full traffic

---

## Required Report Format

### 1. Findings Carry-Forward Table (Required)
| Stage | Finding | Severity | Status at Stage 9 |
|---|---|---|---|
| ... | ... | ... | ... |

### 2. Trust-Level Assessment
- Trust level: High / Moderate / Low / Untrusted
- Basis:
- Most important positive signals:
- Most important negative signals:

### 3. Process Reliability Assessment
- Reliable / Partially reliable / Unreliable:
- Pattern of failures (if any):
- Implication for review completeness:

### 4. Residual Risk Summary
- Unresolved BLOCK items:
- Unresolved NEEDS_WORK items:
- Accepted-risk items (with operator sign-off):

### 5. Release Scope Recommendation
- Recommended scope:
- Guardrails required:
- Conditions for scope widening:

### 6. Operator Action Requirements
Before any release:
- (list)

Before staged release:
- (list)

Before general release:
- (list)

### 7. Code/Security/Production Review Priorities
- What Code review should focus scrutiny on:
- What Security review should focus scrutiny on:
- What Production review should focus scrutiny on:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Overall confidence in the vibe review itself: High / Medium / Low (note if process reliability reduces review confidence)

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- let a successful demo override findings from earlier stages
- invent a release scope that paper-covers unresolved BLOCKs
- accept "the important parts work" as a release posture without specifying what "important" means
- let vibe review confidence substitute for code, security, or production review
- treat process reliability failures as separate defects rather than as signals about review completeness

---

## Final Standard

A change passes this stage only if the reviewer can say:

> I synthesized what Stages 1–8 found. The trust level this work earned is clear, the remaining risks are named, the release scope is honest, and the operator knows exactly what they must verify before shipping. I did not invent confidence that earlier stages did not establish.

If that statement cannot be made honestly, this stage should not pass.

---
type: review-stage
review_type: vibe
stage: 5
title: "Self-Flagging & Uncertainty Disclosure"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 5 — Self-Flagging & Uncertainty Disclosure

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 5
- **Stage name:** Self-Flagging & Uncertainty Disclosure
- **Purpose in review flow:** Determine whether the LLM honestly disclosed its own uncertainties, assumptions, limitations, and the places where its output required human verification — and whether it did so in time for those disclosures to be acted on
- **Default weight:** High
- **Required reviewer posture:** Calibration-focused. The reviewer is not looking for the LLM to be uncertain — they are looking for the LLM's stated confidence to match its actual epistemic state. Overconfidence and false certainty are the failure modes here.
- **Lens interaction:** All lenses may intensify scrutiny in specific domains of uncertainty, but none may waive the requirement to verify that the LLM's stated confidence reflects its actual knowledge
- **Depends on:** Vibe Stages 1–4 (findings from earlier stages often surface where the LLM should have flagged uncertainty but did not)
- **Feeds into:** Vibe Stage 9 (trust calibration); all downstream stages that must weight LLM claims

---

## Why This Stage Exists

The relationship between a human reviewer and an LLM-generated output depends critically on one thing: whether the reviewer knows where to look.

An LLM that produces a change with perfect self-flagging — clearly marking every assumption, every unverified claim, every section requiring human judgment — is a safe collaborator. The reviewer knows exactly where to spend their attention. They can allocate scrutiny to the flagged items and extend reasonable trust to the unflagged ones.

An LLM that produces the same change with zero self-flagging is dangerous in a specific way: the reviewer does not know which parts of the output are high-confidence and which parts are uncertain, guessed, or unverified. The reviewer either reviews everything at maximum scrutiny (unsustainable) or trusts the output at face value (unsafe).

This failure mode is well-documented in AI evaluation research. In Anthropic's Constitutional AI work and calibration research, the gap between expressed confidence and actual accuracy is a known and studied phenomenon. The risk is not that LLMs are wrong — it is that they express high confidence about things they are wrong about, making it difficult for human reviewers to allocate their attention correctly.

The specific self-flagging failures this stage is designed to catch:

**Silent assumptions.** The LLM made an assumption about the system's behavior, the existing data, or the calling context — and did not surface it. The assumption may be wrong, but neither the LLM nor the reviewer will discover this until the assumption fails in production.

**Confidence masking uncertainty.** The LLM used confident language ("this will correctly handle...") for behavior it could not have verified from the available context. The confident phrasing causes the reviewer to give the claim less scrutiny than it warrants.

**Absent verification suggestions.** The LLM made a change that requires human verification — it cannot see the database, it cannot run the integration test, it does not know the state of the production system. But it did not suggest what the reviewer should verify. The reviewer who trusts the LLM's apparent thoroughness may miss the verification step.

**Post-hoc discovered flags.** Earlier stages (2, 3, 4) found hallucinations, constraint violations, and incomplete implementations. If those problems existed and the LLM did not flag them, that is a self-flagging failure. This stage uses earlier-stage findings as evidence that the LLM's self-flagging is incomplete.

**Over-disclosure:** The LLM flagged trivial uncertainties at length while leaving genuinely important uncertainties unflagged. This produces a false sense of transparency — the LLM seems to be flagging everything, but the consequential uncertainties are absent from its disclosures.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What assumptions the LLM made that were explicitly flagged**
2. **What assumptions the LLM made that were not flagged** (identified from earlier-stage findings and from review of the output)
3. **Whether the LLM's confidence language is calibrated to its actual epistemic state**
4. **Whether the LLM suggested appropriate verification steps for claims it could not self-verify**
5. **Whether earlier-stage findings (hallucinations, violations, incompleteness) represent self-flagging failures**
6. **Whether the LLM's disclosures, taken together, give the reviewer an accurate picture of where to scrutinize**

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Explicit flags inventory** — every assumption, uncertainty, or limitation the LLM explicitly disclosed
2. **Missing flags inventory** — assumptions and uncertainties the LLM made but did not disclose (sourced from earlier stages and from reviewer inspection)
3. **Calibration assessment** — does the LLM's expressed confidence match its actual epistemic state?
4. **Verification suggestions assessment** — where the LLM should have suggested human verification, did it?
5. **Earlier-stage discrepancy** — how many of Stages 1–4's findings represent things the LLM should have flagged but did not?
6. **Self-flagging quality overall** — honest summary of whether the LLM's transparency is sufficient for the reviewer to allocate attention accurately
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect:
- The LLM's prose output (all text surrounding the code changes)
- Inline comments in the code that express uncertainty, assumption, or limitation
- Any explicit "assumptions I made" or "you should verify" sections in the LLM's response
- Earlier stage findings (Stages 1–4) — each finding is assessed: should the LLM have flagged this?
- The LLM's confidence language throughout the output

---

## Core Review Rule

**The test is not whether the LLM was wrong. The test is whether the reviewer could have known, from the LLM's output alone, where to look.**

A hallucination that was explicitly flagged as "I'm not certain this method signature is correct — please verify" is a self-flagging pass, even though the method was wrong. The reviewer was directed to the right place.

A hallucination that was expressed with full confidence, with no flag, is a self-flagging failure even if the hallucination happens to be correct. The reviewer was not given accurate information about where to apply scrutiny.

---

# Review Procedure

## Step 1 — Inventory All Explicit LLM Self-Flags

Read the LLM's output and list every place it flagged uncertainty, assumptions, or limitations.

### Categories of explicit self-flags
- **Assumption declarations:** "I'm assuming the user model has a `status` field — please verify"
- **Uncertainty flags:** "I'm not certain this handles the concurrent case correctly"
- **Verification requests:** "You should test this against the actual database before shipping"
- **Knowledge-limit acknowledgments:** "I can't see the full codebase, so there may be other callers I haven't updated"
- **Speculation flags:** "I believe this is the correct behavior based on the patterns I saw, but I may be wrong"

### Check
- [ ] Every explicit flag in the LLM's prose is listed
- [ ] Every explicit flag in inline code comments is listed
- [ ] The reviewer notes what each flag is about (the specific uncertainty or assumption)
- [ ] The reviewer notes whether each flag was actionable (did it direct the reviewer to something specific?)

---

## Step 2 — Identify Missing Flags from Earlier Stage Findings

Earlier stages generated findings. Each finding is an opportunity to assess: did the LLM flag this?

### For each finding from Stages 1–4
Determine:
1. **Should the LLM have flagged this?** (Was this something the LLM could know it was uncertain about, or something only the reviewer would be able to discover?)
2. **Did the LLM flag it?**
3. **Classification:**
   - **Properly flagged:** LLM identified and disclosed this uncertainty before the reviewer found it
   - **Should have flagged:** LLM should have known this was uncertain, but did not disclose it
   - **Reviewer-only finding:** This was not something the LLM could have known to flag; it required information the LLM did not have

### Examples

**Stage 2 finding:** Hallucinated API method `prisma.user.findOrCreate`.
**Assessment:** Should the LLM have flagged this? Yes — it should have noted "I'm using `findOrCreate`, which I believe exists in Prisma; please verify." The method name does not follow Prisma's documented patterns.
**Outcome:** Self-flagging failure.

**Stage 3 finding:** LLM violated constraint "do not change public API."
**Assessment:** Should the LLM have flagged this? Yes — if it was going to change the interface, it should have flagged the tension rather than proceeding silently.
**Outcome:** Self-flagging failure.

**Stage 4 finding:** Service method is wired incorrectly (called with wrong argument order).
**Assessment:** Should the LLM have flagged this? Possibly not — this may be a genuine error that the LLM could not have detected about itself.
**Outcome:** Reviewer-only finding; not a self-flagging failure (but still a correctness issue).

---

## Step 3 — Assess Calibration of Confidence Language

Read the LLM's language about the quality of its output.

### Confidence language patterns to assess

**Overconfident language (red flag):**
- "This correctly handles all edge cases"
- "The implementation is complete and tested"
- "This is the standard approach and will work correctly"
- "I've thoroughly reviewed the change and it's ready to ship"

**Calibrated language (green flag):**
- "This should handle the common cases; I'd recommend testing the concurrent path"
- "I've implemented this based on the patterns I saw; please review the error handling"
- "I'm confident about the happy path; the error path assumptions may need verification"

**Under-confident language (note, not necessarily a failure):**
- "I'm not sure this is correct; you should probably rewrite this"
- Excessive hedging that makes the output hard to use

### Check
- [ ] Confident claims are assessed against what the LLM could actually have verified
- [ ] Confident claims about things the LLM cannot verify are flagged as miscalibration
- [ ] The reviewer notes whether the LLM's overall tone accurately signals the confidence level appropriate for the change
- [ ] Over-disclosures of trivial uncertainties are noted — they can mask important ones

### What the LLM cannot self-verify (and should not claim with high confidence)
- Runtime behavior in the actual production environment
- Whether the implementation handles all the states the real data can be in
- Whether external API calls will succeed (the LLM cannot make them)
- Whether the change is compatible with other branches or PRs in flight
- Whether performance under actual load matches expectations

### Example — Miscalibrated confidence
**LLM claim:** "This implementation correctly handles all the race conditions in the order processing flow."

**What the LLM had access to:** The source code of `OrderProcessor.ts`. No information about actual production load patterns, the database's isolation level, or whether the locking strategy matches the database configuration.

**Assessment:** The LLM cannot verify concurrency behavior from source code alone. This claim is overconfident. The LLM should have said: "I've attempted to address race conditions using locking on line 45, but please verify that the database isolation level supports this and test under concurrent load before shipping."

---

## Step 4 — Assess Verification Suggestions

Determine whether the LLM suggested appropriate verification steps for things it could not verify.

### Verification suggestion checklist

For each of the following categories, if they are present in the change, did the LLM suggest verification?
- [ ] Database migrations: "Run `db:migrate` and verify the schema matches expectations"
- [ ] External API integrations: "Test this against the staging environment before shipping"
- [ ] Concurrent or stateful behavior: "Load test this before enabling for high traffic"
- [ ] Configuration changes: "Verify the config key is set correctly in all environments"
- [ ] Security-relevant behavior: "Have someone review the auth logic specifically"
- [ ] Performance-critical paths: "Profile this change before enabling in production"

### What counts as a verification suggestion
- A specific, actionable request: "run this command," "check this file," "test with this input"
- A general scope statement: "this area should be tested carefully" (less useful but still present)
- A human-judgment request: "you should review whether this approach fits your system"

What does **not** count:
- "I've tested this and it works" (not a verification suggestion; an assertion)
- Implicit confidence that suggests no verification is needed

### Absence of verification suggestions is a flag when:
- The change touches code that requires runtime verification
- The LLM made claims about behavior it cannot verify from source code alone
- The change interacts with the external world (network, database, third-party APIs)

---

## Step 5 — Assess Over-Disclosure (Noise vs Signal)

Over-disclosure is less dangerous than under-disclosure, but it still harms review quality.

### Over-disclosure patterns
- Long uncertainty statements about things that are clearly correct and verifiable
- "I should note I can't see your full codebase" — repeated multiple times when the reviewer already knows this
- Flagging every single variable name as uncertain while leaving the real assumptions unmentioned
- Detailed caveats about the LLM's training data cutoff when that is irrelevant to the specific change

### Why this matters
An LLM that produces a lot of uncertainty language trains the reviewer to discount it. When the important uncertainty is buried in noise, it is missed.

### Check
- [ ] The reviewer distinguishes substantive flags from noise flags
- [ ] The ratio of substantive to trivial flags is noted
- [ ] Over-disclosure that obscures important uncertainties is recorded

---

## Step 6 — Synthesize Self-Flagging Quality

Produce an honest overall assessment of whether the LLM's self-disclosure gives the reviewer an accurate picture of where attention is needed.

### Assessment questions
- If a reviewer relied only on the LLM's explicit flags to guide their scrutiny, what would they have missed?
- What is the most important thing the LLM should have flagged but did not?
- Does the LLM's expressed confidence level, across the output, match the level of verification the reviewer should actually apply?
- Is the LLM's self-disclosure posture one that enables appropriate trust, or does it induce either over-trust or under-trust?

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Vibe 9:** self-flagging quality is a direct input to trust calibration; an LLM that systematically over-claims should reduce overall release confidence
- **All earlier stages:** this stage synthesizes their findings — every finding from Stages 1–4 that was not flagged by the LLM represents a self-flagging gap

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Self-flagging gaps (categorized by stage found):
  - Calibration failures:
  - Absent verification suggestions:
  - Over-disclosure patterns (if significant):
  - Overall self-flagging quality rating: Reliable / Partial / Unreliable
  - Trust-calibration impact for Stage 9:

---

## Lens Interaction Guidance

Examples:
- **senior-review lens:** highest bar for self-flagging; a change targeted at production should have explicit flags on all uncertain or unverified claims
- **rapid-iteration lens:** some calibration slack is acceptable; focus on the most consequential unflagged assumptions
- **security lens:** security-relevant uncertainties (auth behavior, input handling, token semantics) must be flagged regardless of overall self-flagging posture
- **new-contributor lens:** more generous on missing flags for things the LLM could not have known; focus on claims the LLM made assertively about things it had access to

---

## Severity / Gating Model

### PASS
Use PASS when:
- the LLM's explicit flags give the reviewer an accurate picture of where to scrutinize
- calibration is appropriate — high-confidence claims are about things the LLM could verify, uncertainty is expressed for things it could not
- verification suggestions are present where needed
- earlier-stage findings that represent missing flags are bounded and low-risk

### NEEDS_WORK
Use NEEDS_WORK when:
- important assumptions were not flagged, but the implementation is otherwise correct
- confidence language is somewhat miscalibrated but not misleading on critical paths
- verification suggestions are absent for some but not all relevant areas
- over-disclosure is obscuring signal

### BLOCK
Use BLOCK when:
- the LLM systematically expressed high confidence about claims that multiple earlier stages found to be wrong
- critical path assumptions were asserted with confidence when they were unverifiable and turned out to be wrong
- the self-flagging posture is so miscalibrated that the reviewer cannot determine where to apply scrutiny
- verification was neither done nor suggested for security-critical or production-critical behavior

---

## Escalation Guidance

Escalate or explicitly flag when:
- systematic over-confidence across multiple domains suggests the LLM's calibration is structurally unreliable for this domain → Stage 9 trust calibration
- key security assumptions were not flagged → Security review should increase scrutiny of all security claims
- the LLM expressed confidence about behavior that can only be verified at runtime → Production review should verify those claims explicitly

---

## Required Report Format

### 1. Explicit Flags Inventory
| Flag Content | Location | Type | Actionability |
|---|---|---|---|
| "I'm assuming the user has `status` field" | prose | assumption | Specific; verify the model |

### 2. Missing Flags Inventory
| Finding (from Stage) | Should LLM Have Flagged? | Why It Was a Self-Flagging Failure |
|---|---|---|
| Hallucinated `findOrCreate` (Stage 2) | Yes | Non-standard method name; LLM should have flagged uncertainty |
| API parameter order wrong (Stage 4) | Possibly | Hard to self-detect; classify as reviewer-only finding |

### 3. Calibration Assessment
- Overall confidence tone: Overconfident / Calibrated / Under-confident
- Specific miscalibrations:
  - Claim:
  - What LLM said:
  - What LLM could actually have verified:

### 4. Verification Suggestions Assessment
- Categories requiring verification (present in change):
- Verification suggestions provided:
- Absent suggestions:

### 5. Earlier-Stage Self-Flagging Discrepancy
| Stage | Finding | Flagged by LLM? | Assessment |
|---|---|---|---|
| Stage 2 | Hallucinated method | No | Self-flagging failure |
| Stage 3 | Constraint violation | No | Self-flagging failure |

### 6. Self-Flagging Quality Summary
- Reliable / Partial / Unreliable:
- Most important unflagged item:
- Impact on reviewer trust allocation:

### 7. Carry-Forward Concerns
- Self-flagging gaps:
- Calibration failures:
- Absent verification suggestions:
- Trust-calibration impact for Stage 9:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- treat the presence of any hedging language as a pass — check whether the important uncertainties were flagged
- penalize calibrated uncertainty — an LLM that says "I'm not certain about this" is behaving correctly
- confuse over-disclosure volume with quality — many trivial flags do not substitute for the important ones
- use this stage to punish the LLM for things it could not have known; focus on things it should have known were uncertain
- skip this stage because earlier stages already found the issues — this stage's specific finding is about the LLM's meta-level honesty

---

## Final Standard

A change passes this stage only if the reviewer can say:

> The LLM's self-disclosed flags, taken together, give me an accurate map of where to apply scrutiny. Its expressed confidence is calibrated to what it could actually have verified. The most important uncertainties and assumptions were flagged, not buried in noise or omitted. I can explain what it told me and what I had to find myself.

If that statement cannot be made honestly, this stage should not pass.

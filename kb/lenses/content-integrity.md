---
type: review-lens
lens_name: content-integrity
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Content Quality & Information Integrity Lens

## Lens Purpose

This lens intensifies review for factual accuracy, instructional correctness, internal consistency, and information quality in product-facing content.

It exists because many vibe-coded systems generate not only code, but also the explanatory layer around the code:
- help text
- tooltips
- onboarding copy
- error messages
- settings descriptions
- inline docs
- READMEs
- runbooks
- release notes
- AI-generated explanations and summaries

A system can be:
- functionally correct
- operationally sound
- visually polished

…and still mislead users and operators because its content is stale, fabricated, contradictory, or simply wrong.

This is not a generic writing-quality review.
It is a practical review overlay for **whether the information the product presents is accurate enough to be trusted and followed**.

---

## Why This Lens Exists

Kaelith builds vibe-coded systems where AI frequently generates both implementation and explanation.
That creates a distinctive risk:

> the code works, but the product lies.

Common patterns include:
- onboarding flows that teach the wrong workflow
- tooltips or settings text describing behavior that no longer exists
- error messages prescribing the wrong fix
- docs that reference removed parameters, endpoints, or flags
- AI-generated explanations that sound authoritative but are not grounded in actual system behavior
- notification and release-note copy that misstates what changed or what happened

Existing lenses catch adjacent problems:
- **UX & Interaction Clarity** asks whether information is understandable
- **Legal, Policy & Claims Integrity** asks whether external promises and policy claims are truthful
- **AI Systems** asks whether the model behavior and AI architecture are sound

This lens asks a different question:

> Is the content itself factually correct, internally consistent, and safe to rely on?

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether product-facing explanations match real behavior
2. Whether instructions and remediation guidance are correct when followed literally
3. Whether documentation and help content have drifted from the implementation
4. Whether AI-generated or generated-at-build-time content includes fabricated or unverifiable claims
5. Whether users or operators would be misled by stale, contradictory, or hallucinated information

If the reviewer cannot explain why a person should trust the information surfaces they are given, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- websites and product surfaces with explanatory copy
- onboarding and help flows
- settings pages and tooltips
- internal admin tools and operator guides
- docs-heavy developer products
- AI-native products that expose generated explanations or summaries
- release notes, changelogs, notification templates, and operational runbooks

It may be applied to:
- **Code review** when inline docs, UI copy, generated content, and instructions may diverge from implementation
- **Production review** when live product, support, and operational surfaces need to be trustworthy

This lens is not primarily a security or legal lens.

---

## Core Review Rule

Do not confuse polished wording with truthful information.

A product does **not** get information-integrity credit because:
- the copy sounds professional
- the docs are long
- the help center exists
- the UI has tooltips everywhere
- the release notes look complete
- the AI explanation sounds confident

The reviewer must ask whether the information is:
- correct
- current
- internally consistent
- actionable when followed
- honest about uncertainty or limitation

---

## What This Lens Should Emphasize

### 1. Factual Accuracy of Product-Facing Explanations
Reviewer should intensify attention on:
- whether labels, helper text, and inline explanations match actual behavior
- descriptive copy around settings, features, and outputs
- whether the system says it does something it no longer does or never did

### Example failure patterns
- setting description says data syncs automatically, but sync is manual or partial
- tooltip explains a feature using behavior from an older implementation
- confirmation message claims success for the wrong action or result

---

### 2. Instructional Correctness
Reviewer should intensify attention on:
- onboarding steps
- setup instructions
- wizard guidance
- remediation steps in help flows
- whether instructions work when followed literally and in order

### Example failure patterns
- onboarding references a button or step that was renamed or removed
- instructions omit a prerequisite and therefore fail for normal users
- guided workflow teaches a path that no longer matches the product

---

### 3. Error Message Accuracy & Remediation Validity
Reviewer should intensify attention on:
- whether the error described is the one that actually occurred
- whether the recommended next step is valid
- whether fallback/error copy explains the right failure class
- AI-generated error or support text that hallucinates causes or solutions

### Example failure patterns
- error tells the user to retry when the issue requires configuration change
- validation message points to the wrong field or condition
- failure branch emits success-shaped or misleading explanatory copy

---

### 4. Documentation Drift Between Code and Docs
Reviewer should intensify attention on:
- README accuracy
- docstrings and inline docs
- API docs and parameter descriptions
- operator guides and runbooks
- whether documented behavior matches the current implementation

### Example failure patterns
- docstring lists a parameter or return value that no longer exists
- README setup steps depend on deprecated commands or paths
- runbook describes services, endpoints, or flags removed in recent changes

---

### 5. Hallucinated References & Fabricated Content
Reviewer should intensify attention on:
- references to nonexistent endpoints, commands, settings, integrations, or features
- AI-generated “filler certainty” around unsupported specifics
- whether content makes factual claims that cannot be verified in the system

### Example failure patterns
- docs mention a config key or API route that is not implemented
- onboarding or marketing surfaces name integrations that are only aspirational
- generated support text invents technical details or constraints

---

### 6. Internal Terminology Consistency
Reviewer should intensify attention on:
- the same feature or concept being named differently across surfaces
- contradictory definitions of product concepts
- mixed wording from different AI-generation sessions
- whether terminology drift creates factual or procedural confusion

### Example failure patterns
- one screen says “workspace,” another says “project,” and docs say “team” for the same object
- notification and UI describe the same state transition differently
- admin docs and customer-facing docs disagree about what a feature actually does

---

### 7. Temporal Accuracy & Staleness
Reviewer should intensify attention on:
- versioned or time-sensitive content
- pricing, availability, integration, and rollout notes
- stale roadmap or launch-state wording
- whether “current” content is obviously tied to an older system state

### Example failure patterns
- release notes list features that were reverted or never shipped
- docs still describe beta behavior as current production behavior
- support copy references an old version, limit, or integration status

---

### 8. Changelog & Release Note Integrity
Reviewer should intensify attention on:
- whether change summaries reflect real shipped changes
- omitted breaking changes
- fabricated or overstated improvements
- whether generated release communication is traceable to actual implementation deltas

### Example failure patterns
- changelog claims bug fixes or enhancements not present in the release
- breaking behavior changed silently with no documentation update
- AI-generated release notes summarize work that happened in a different branch or never landed

---

### 9. AI Output Explanation Accuracy
Reviewer should intensify attention on:
- generated summaries, explanations, reasoning blurbs, and confidence framing
- whether AI-generated explanations overstate certainty
- whether product text misrepresents how an AI answer was derived or how trustworthy it is
- whether explanatory wrappers around AI output are themselves misleading

### Example failure patterns
- product presents a generated explanation as if it were verified ground truth
- AI output is framed as authoritative despite degraded or partial generation conditions
- help text says the model “analyzes” or “verifies” something it only predicts heuristically

---

### 10. Notification & Communication Copy Accuracy
Reviewer should intensify attention on:
- outbound email copy
- push/in-app notifications
- alerts and confirmations
- whether communications describe the triggering event, consequence, and next step correctly

### Example failure patterns
- notification says an action completed when it only queued
- email tells users a record was deleted when it was archived
- alert text references the wrong object, time, or consequence

---

### 11. Empty State & Placeholder Content Integrity
Reviewer should intensify attention on:
- placeholder strings and debug text
- empty-state promises about what will appear later
- template or generated filler surviving into real surfaces
- whether empty-state or placeholder content teaches the wrong expectation

### Example failure patterns
- “Coming soon,” “TODO,” or stock filler remains in production-like surfaces
- empty state promises automation or syncing that does not actually happen
- debug labels or generated prose leak into user-facing areas

---

### 12. Internal Tool & Runbook Information Quality
Reviewer should intensify attention on:
- operational instructions for staff or agents
- admin guidance
- troubleshooting playbooks
- whether internal information surfaces are current enough for safe use under pressure

### Example failure patterns
- runbook references services, commands, or dashboards that no longer exist
- internal guide gives outdated recovery steps that worsen an incident
- operator documentation assumes invisible tribal knowledge rather than current system truth

---

## What This Lens Should Not Duplicate

This lens should not become a catch-all copy, UX, legal, or AI review.

Avoid using it to re-run:
- readability, wording clarity, and information architecture → UX & Interaction Clarity
- marketing superlatives, guarantees, compliance language, and public trust claims → Legal, Policy & Claims Integrity
- prompt design, model behavior, output safety, or AI architecture → AI Systems
- privacy exposure or rights analysis → Privacy, Data Rights & Consent
- alt text, ARIA labels, or screen-reader quality review → Accessibility
- tone/brand/style review or SEO review

Instead, this lens should focus on **truthfulness and reliability of information surfaces**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Content Quality & Information Integrity Lens Summary
- Overall information-integrity posture:
- Most serious misleading content surface:
- Highest-risk stale or fabricated reference:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Factual accuracy of product-facing explanations | PASS / NEEDS_WORK / BLOCK | ... |
| Instructional correctness | PASS / NEEDS_WORK / BLOCK | ... |
| Error message accuracy & remediation validity | PASS / NEEDS_WORK / BLOCK | ... |
| Documentation drift between code and docs | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Hallucinated references & fabricated content | PASS / NEEDS_WORK / BLOCK | ... |
| Internal terminology consistency | PASS / NEEDS_WORK / BLOCK | ... |
| Temporal accuracy & staleness | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Changelog & release note integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| AI output explanation accuracy | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Notification & communication copy accuracy | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Empty state & placeholder content integrity | PASS / NEEDS_WORK / BLOCK | ... |
| Internal tool & runbook information quality | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### Hallucination Risk Items
For each significant unverifiable or false reference:
- Reference:
- Location:
- Verification attempt:
- Status: UNVERIFIED / CONFIRMED_FALSE / NEEDS_HUMAN_CHECK
- Fix direction:

### High-Signal Findings
For each significant finding:
- Finding:
- Surface / file / screen:
- Quoted content:
- Actual behavior or verified reality:
- Why it misleads:
- Fix direction:

### Content Lens Blockers
- Blocking misinformation issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- content is materially false in a way likely to cause wrong user or operator action
- instructional or remediation content can cause operational or customer harm if followed
- the product presents fabricated features, commands, or capabilities as real
- AI-generated explanations create serious false confidence about behavior or outcome

### NEEDS_WORK-level lens findings
Use when:
- content is directionally right but stale, inconsistent, or partially misleading
- docs or product surfaces have drifted enough to create friction or confusion
- information quality is workable but not trustworthy enough for confident use

### PASS-level lens findings
Use when:
- the reviewer can explain why key information surfaces are accurate enough to follow safely
- docs, help, and product-facing explanations align with current behavior credibly
- no major fabricated, stale, or contradictory content remains in important flows

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- ghost parameters, deprecated commands, and hallucinated endpoints in docs
- onboarding steps that point to removed or renamed UI paths
- inverted or misleading error/success messages
- AI-generated explanations framed as verified truth when they are not
- release notes or changelogs claiming changes that never shipped
- internal runbooks referencing dead services or outdated dashboards
- placeholder or generated filler surviving into user-facing or operator-facing surfaces
- the same feature described inconsistently across product, docs, and notifications

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **UX & Interaction Clarity** to separate whether information is understandable from whether it is true
- **Legal, Policy & Claims Integrity** when factual content approaches external promises or compliance claims
- **AI Systems** when products expose generated explanations, summaries, or reasoning
- **Workflow & Automation Reliability** when notification or runbook content misrepresents workflow behavior

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand which information surfaces users and operators are being asked to trust, and I can explain why those explanations, instructions, docs, and generated summaries are factually correct, current enough, and safe to rely on.

If that statement cannot be made honestly, this lens should produce meaningful findings.

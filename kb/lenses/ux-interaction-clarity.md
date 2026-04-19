---
type: review-lens
lens_name: ux-interaction-clarity
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# UX & Interaction Clarity Lens

## Lens Purpose

This lens intensifies review for interaction clarity, user feedback quality, flow coherence, and human-comprehensible behavior in:
- websites
- apps
- dashboards
- onboarding flows
- internal tools
- workflow UIs
- AI-native interfaces
- client-facing experiences where the interaction model is part of the product itself

It exists because many systems can be:
- correct in code
- secure enough in structure
- operational in production

…and still be confusing, misleading, or frustrating for actual humans.

This is not generic product-design fluff.
It is a practical review overlay for **whether users can understand what the product is doing, what they can do next, and what went wrong when something fails**.

---

## Why This Lens Exists

Vibe-coded systems often produce interaction quality that is plausible but weak.

Common patterns include:
- flows that technically work but offer no useful feedback
- inconsistent naming and action patterns across different screens or tools
- forms that submit but explain errors poorly
- empty states and edge states that were never designed
- AI-generated UI assembled from multiple sessions, each with different assumptions about language, buttons, navigation, and expectations
- asynchronous and AI-driven behavior that leaves users wondering whether anything is happening at all

No standard review stage is primarily responsible for that human layer.

This lens exists to ask:

> Does this product make sense to the people using it, especially when they are uncertain, new, interrupted, or encountering failure?

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether important flows communicate state and next steps clearly
2. Whether errors, waiting states, and empty states are understandable
3. Whether interaction vocabulary and patterns are consistent enough to reduce confusion
4. Whether AI-native or asynchronous behavior is visible and interpretable to users
5. Whether the product can be used without relying on author intent, hidden context, or lucky guesswork

If the reviewer cannot explain how a user would understand what the system is doing across success, waiting, failure, and ambiguity, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- user-facing websites and applications
- internal tools used by teams
- workflow UIs and dashboards
- onboarding and conversion flows
- multi-step processes
- AI assistants and chat/product experiences with async or streaming behavior

It may be applied to:
- **Code review** to intensify scrutiny on interaction logic, rendered states, and user-facing flows
- **Production review** to assess the truthfulness and clarity of live interaction behavior under real conditions

This lens is not primarily a security lens.

---

## Core Review Rule

Do not confuse “it works” with “it communicates.”

A product does **not** get UX clarity credit because:
- the main click path succeeds in a demo
- the interface looks polished
- a component library is in use
- there is a spinner somewhere
- the original builder understands what the flow is supposed to mean

The reviewer must ask whether a normal user can:
- tell what is happening
- understand what actions mean
- recover from failure
- distinguish success, waiting, limitation, and error honestly

---

## What This Lens Should Emphasize

### 1. Feedback & System Status
Reviewer should intensify attention on:
- save/send/run/publish feedback
- loading and progress states
- async operation visibility
- whether users can tell when the system is waiting, working, finished, or stuck

### Example failure patterns
- user clicks save and sees no confirmation or visible change
- AI request takes several seconds with no clear “thinking” or “working” state
- long-running workflow appears frozen because no status is surfaced

---

### 2. Error Communication
Reviewer should intensify attention on:
- whether errors are understandable to users rather than only developers
- whether the message explains what happened and what to do next
- whether system failures and user-correctable failures are distinguished
- whether partial failure is explained honestly

### Example failure patterns
- raw status code or exception text shown to users
- generic “Something went wrong” with no recovery path
- failure appears as blank or stalled UI rather than an explicit error state

---

### 3. Destructive Action Safeguards
Reviewer should intensify attention on:
- confirmation patterns for destructive or irreversible actions
- whether the system distinguishes low-risk and high-risk actions clearly
- undo/recovery affordances where appropriate
- clarity of labels like delete, archive, revoke, publish, send, reset

### Example failure patterns
- one-click destructive actions with no confirmation
- vague action labels hiding irreversible consequences
- destructive operation triggered from visually minor or ambiguous UI affordance

---

### 4. Interaction Vocabulary Consistency
Reviewer should intensify attention on:
- consistent verbs, labels, and action semantics
- whether the same action is described differently across screens
- whether adjacent components use conflicting mental models
- AI-generated wording drift across the product

### Example failure patterns
- “Save”, “Apply”, and “Update” used for the same operation in different areas
- one screen uses “archive” while another uses “deactivate” for the same behavior
- multi-session generation created inconsistent product language

---

### 5. Empty, Edge & First-Run States
Reviewer should intensify attention on:
- new-user empty states
- zero-result views
- unavailable/disabled-feature states
- first-run onboarding clarity
- what the user sees when the data they expect does not exist yet

### Example failure patterns
- empty table renders as a blank shell with no explanation
- first-time user lands in a feature with no guidance on what to do next
- feature-flagged-off state appears as a broken or blank page instead of a clear limitation message

---

### 6. Form Validation & Input UX
Reviewer should intensify attention on:
- required-field clarity
- when validation happens and how it is explained
- field-level attribution of errors
- whether submit behavior is predictable
- whether users can understand how to correct a failed form

### Example failure patterns
- submit allowed with empty required fields and errors appear too late or unclearly
- failed field not identified precisely
- validation message written in technical terms instead of user-facing language

---

### 7. Navigation Clarity & Escape Paths
Reviewer should intensify attention on:
- orientation cues
- obvious return/back/cancel paths
- breadcrumb or active-nav clarity where appropriate
- whether users can escape secondary flows, modals, and deeper states predictably
- whether navigation creates dead ends

### Example failure patterns
- modal or subflow has no obvious way back
- page hierarchy unclear after deep linking
- user enters a state and cannot tell how to return to a safe default context

---

### 8. Mobile & Viewport Behavior
Reviewer should intensify attention on:
- mobile interaction layout
- overflow and clipping
- touch-target usability
- whether critical actions disappear or become awkward in smaller viewports
- whether the interaction model survives device changes reasonably

### Example failure patterns
- modal actions below the fold on small screens with no visible indication
- fixed elements covering critical content or buttons
- touch interaction feels crowded or ambiguous

---

### 9. Interaction Continuity Across Dynamic States
Reviewer should intensify attention on:
- focus placement after actions, errors, dialogs, or route changes
- whether dynamic updates preserve user orientation
- whether interaction continuity holds across async and changing states
- whether users remain grounded after content shifts, modal transitions, or inline state changes

Formal keyboard traversal, ARIA keyboard patterns, and focus-trap correctness belong primarily to the Accessibility lens.

### Example failure patterns
- dialog closes and the user is left in an unclear interaction state
- after action completion, focus lands somewhere arbitrary and breaks flow continuity
- dynamic updates make the user lose track of where they are or what changed

---

### 10. Placeholder & Incomplete UX Hygiene
Reviewer should intensify attention on:
- placeholder text surviving into production-like output
- labels like “Untitled”, “TODO”, “Label here”, “Coming soon” without clear scope or meaning
- unfinished copy or generated filler in user-facing surfaces
- ambiguous draft UI elements that make the product feel incomplete or misleading

### Example failure patterns
- placeholder labels visible in real screens
- generic stock copy masks unimplemented states
- half-finished explanatory text survives because the code worked technically

---

### 11. AI / Async Interaction Patterns
Reviewer should intensify attention on:
- streaming-response clarity
- retry affordances for AI failures
- interruption, cancellation, and partial-result handling
- whether users understand what the model/system is currently doing
- whether model limitations or incomplete output are visible enough to avoid false confidence

### Example failure patterns
- AI response truncates mid-thought with no indication it is incomplete
- user cannot tell whether the system is thinking, timed out, or done
- model-generated answer appears authoritative despite low-confidence or degraded path conditions

---

### 12. Onboarding & Progressive Complexity
Reviewer should intensify attention on:
- whether new users can get started without hidden knowledge
- whether the interface introduces complexity progressively
- whether power-user assumptions dominate first-run experience
- whether workflows assume product familiarity too early

### Example failure patterns
- fresh user lands in a dense control surface with no orientation
- internal tool assumes prior team context not expressed in-product
- feature discoverability depends on already knowing what to click

---

## What This Lens Should Not Duplicate

This lens should not become a catch-all for accessibility, content quality, or engineering correctness.

Avoid using it to re-run:
- formal accessibility review → Accessibility lens
- generic correctness or bug review → Defect Discovery
- security/permission review → Security stages
- copy/brand/marketing truthfulness review → Legal, Policy & Claims Integrity / future brand/content lenses
- raw performance benchmarking → Production 4
- SEO review

Instead, this lens should focus on **interaction clarity and human comprehension**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### UX & Interaction Clarity Lens Summary
- Overall interaction clarity posture:
- Most confusing user-facing behavior:
- Highest-risk trust/friction point:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Feedback & system status | PASS / NEEDS_WORK / BLOCK | ... |
| Error communication | PASS / NEEDS_WORK / BLOCK | ... |
| Destructive action safeguards | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Interaction vocabulary consistency | PASS / NEEDS_WORK / BLOCK | ... |
| Empty/edge/first-run states | PASS / NEEDS_WORK / BLOCK | ... |
| Form validation UX | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Navigation clarity & escape paths | PASS / NEEDS_WORK / BLOCK | ... |
| Mobile & viewport behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Interaction continuity across dynamic states | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Placeholder/incomplete UX hygiene | PASS / NEEDS_WORK / BLOCK | ... |
| AI/async interaction patterns | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Onboarding/progressive complexity | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- User impact:
- Evidence:
- Why it confuses or misleads:
- Fix direction:

### UX Lens Blockers
- Blocking interaction issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- important flows are so confusing or silent that users are likely to make harmful mistakes or abandon the task
- destructive actions lack sufficient clarity or guardrails
- the interface materially misrepresents state, completion, or failure
- AI or async behavior creates false confidence about what the system has actually done

### NEEDS_WORK-level lens findings
Use when:
- flows are workable but create avoidable confusion or trust friction
- edge/empty/failure states are notably weaker than the happy path
- the system is understandable mainly to its builder or power users, not to normal users

### PASS-level lens findings
Use when:
- key flows communicate status, action, and consequence clearly enough
- errors and async states are understandable and recoverable
- the reviewer can explain how users navigate ambiguity without relying on guesswork

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- silent saves and silent submits
- raw or developer-centric error messages
- one-click destructive actions
- inconsistent verbs for the same action
- blank empty states or dead-end feature-flag states
- incomplete or placeholder UI text in real surfaces
- AI interactions with weak or missing “thinking / failed / partial” state feedback
- confusing navigation with no obvious return path
- mobile layouts that technically render but hide decision-critical controls
- first-run experiences that assume insider knowledge

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Accessibility** for the distinction between structural access and broader interaction clarity
- **AI Systems** when model behavior shapes visible user flow or expectation
- **Content Quality & Information Integrity** when the product experience depends heavily on explanatory or generated content
- **Defect Discovery** when interaction confusion may be caused by subtle behavioral defects

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I can explain how a normal user would understand what this system is doing, what actions are available, what errors mean, and what happens next across success, waiting, failure, and ambiguity — without relying on insider context or patient guesswork.

If that statement cannot be made honestly, this lens should produce meaningful findings.

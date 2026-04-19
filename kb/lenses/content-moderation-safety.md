---
type: review-lens
lens_name: content-moderation-safety
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Content Moderation & Safety Lens

## Lens Purpose

This lens intensifies review for user-generated and AI-generated content boundaries, moderation controls, unsafe-output handling, policy enforcement consistency, escalation paths, reviewer/operator safety, and products that need clear community-facing safety boundaries.

It exists because many community-facing and AI-native products can be technically sound while still being unsafe to operate publicly if they lack:
- report/flag mechanisms
- moderation queues
- output filtering
- escalation paths
- operator protection
- consistent policy enforcement
- clear community-safety boundaries

This is not the same as checking whether an AI model is accurate or whether claims are legally compliant.
It is a practical review overlay for **whether unsafe, abusive, or policy-violating content can be prevented, surfaced, reviewed, and handled safely enough for public/community use**.

---

## Why This Lens Exists

Kaelith increasingly expects community-facing products across surfaces like:
- Discord
- Patreon
- Twitter/X and other social platforms
- chat and community features
- AI-generated public content
- client products with UGC or moderation needs

Vibe-coded systems often move quickly on visible community features while leaving moderation and safety boundaries underdesigned.

Common patterns include:
- content surfaces with no report button or moderation queue behind them
- AI output shown publicly with weak or no safety filtering
- moderation decisions made manually with no consistency or auditability
- no escalation path for severe abuse or legal-risk content
- moderators exposed to raw harmful content without shielding or workflow support
- policy behavior implemented ad hoc and left to drift over time

Existing lenses catch adjacent risks but not this exact question:

> If this product is community-facing or content-bearing, can it actually hold a safe boundary around what reaches users and what happens when things go wrong?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether unsafe or policy-violating content has meaningful prevention and moderation controls
2. Whether reporting, review, and escalation paths exist and are complete enough to matter
3. Whether policy enforcement is consistent enough to be trusted
4. Whether AI-generated content is bounded before it reaches public/community surfaces
5. Whether moderators and operators can handle harmful content without unsafe tooling or missing process

If the reviewer cannot explain how harmful or policy-violating content is prevented, surfaced, reviewed, and escalated, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- community-facing products
- products with user-generated content
- AI chat or AI-generated public content
- moderation-heavy internal tools
- comment, forum, messaging, social, or community features
- systems ingesting or redistributing third-party content publicly
- products where public trust depends on clear safety boundaries

It may be applied to:
- **Code review** to scrutinize content-safety enforcement before launch
- **Security review** where abuse-prevention, moderation controls, or unsafe-output handling intersect with trust boundaries
- **Production review** to assess whether live moderation, escalation, and policy operations are supportable

This lens is not a replacement for AI Systems, Privacy, or Legal Claims review.

---

## Core Review Rule

Do not confuse “content feature exists” with “content feature is safe to operate.”

A system does **not** get moderation-readiness credit because:
- it has a chat box or comment form
- a provider has some safety policy upstream
- a report button is visible
- moderators can fix things manually in theory
- a community policy document exists somewhere

The reviewer must ask whether the system can:
- prevent unsafe content from reaching users when possible
- surface risky content quickly when prevention fails
- route reports into real review workflows
- enforce policy consistently enough to be credible
- protect moderators and operators handling harmful material

---

## What This Lens Should Emphasize

### 1. Output Filtering & Unsafe Content Prevention
Reviewer should intensify attention on:
- filtering or gating of AI-generated and user-submitted content before public display
- bypass resistance for obvious evasion patterns
- whether safety enforcement happens at the real delivery boundary rather than only in optimistic UI logic
- default-safe behavior when confidence is low

### Example failure patterns
- unsafe or disallowed content reaches users with no pre-display screening path
- provider refusal or filtering assumptions are treated as sufficient without local boundary controls
- obvious bypass tricks or alternate encodings slip past simplistic filtering

---

### 2. User Reporting & Flagging Surfaces
Reviewer should intensify attention on:
- discoverable report/flag actions on relevant content surfaces
- whether reports actually enter a moderation path
- whether reporting is complete enough to help review instead of performative only
- abuse-resistant reporting flow design

### Example failure patterns
- report button exists but does not create actionable moderation work
- important content surface lacks any user-report path
- reporting flow can be spammed or abused without meaningful friction or triage

---

### 3. Moderation Queue & Review Tooling
Reviewer should intensify attention on:
- moderation backlog visibility
- context available to reviewers
- ability to take common moderation actions efficiently
- whether review tooling supports real operational volume and nuance

### Example failure patterns
- flagged content has no real queue, review state, or triage flow
- moderators cannot see enough context to act consistently
- moderation actions require direct DB or engineering access rather than supported tooling

---

### 4. Policy Enforcement Consistency
Reviewer should intensify attention on:
- whether similar content is likely to be handled similarly
- policy rule explicitness
- versioning or update discipline for safety rules
- ad hoc or inconsistent enforcement paths that undermine trust

### Example failure patterns
- similar violations are treated differently depending on path or operator mood
- safety logic changes over time with no versioning or visibility
- automated and manual enforcement paths disagree materially

---

### 5. Escalation Paths for Severe Content
Reviewer should intensify attention on:
- escalation for threats, self-harm, exploitation, legal-risk content, or other severe categories relevant to scope
- emergency disable or break-glass options
- clear handoff beyond normal moderator authority
- whether severe cases have more than “hope someone notices” as a plan
- whether media-accepting or community-facing products recognize when mandatory-reporting or external legal escalation obligations may apply and route those cases appropriately

### Example failure patterns
- serious harmful content has no escalation path beyond general queue handling
- no emergency containment path exists for rapidly spreading unsafe output
- operators know something is wrong but have no defined next step or authority boundary
- product accepts media or severe-abuse reports but has no path for legally sensitive escalation categories when they arise

---

### 6. AI-Generated Content Boundaries
Reviewer should intensify attention on:
- explicit boundaries on what AI outputs may be shown or amplified
- refusal/fallback handling when the model declines or degrades
- whether AI-generated content is treated as untrusted until bounded appropriately
- moderation or review paths for generated content at scale

### Example failure patterns
- raw model output is published or shown publicly with little safety boundary beyond provider defaults
- refusal or unsafe-output handling exposes confusing or unsafe intermediate behavior
- AI-generated content is assumed safe because it came from a model provider rather than a user

---

### 7. Moderator & Reviewer Safety
Reviewer should intensify attention on:
- shielding, redaction, warnings, or graduated reveal for harmful content
- minimizing unnecessary exposure to severe material
- safe reviewer workflow design
- whether moderation tooling itself becomes a harm vector for staff

A credible pass here usually means severe or graphic material is not shown inline by default and instead uses warning or click-to-reveal patterns with appropriate context.

### Example failure patterns
- moderators are exposed to raw harmful content with no warning or shielding controls
- severe-content workflows assume reviewers can safely inspect everything directly
- operator safety is treated as somebody else’s process problem rather than a product concern

---

### 8. Age-Gating & Audience Segmentation
Reviewer should intensify attention on:
- whether audience-sensitive content has gates or routing boundaries where needed
- enforcement at delivery time, not just profile decoration
- default-safe posture for unknown or mixed audience context
- whether public/community surfaces respect audience segmentation claims

### Example failure patterns
- mature or unsafe content reaches audiences who should have been gated from it
- age- or audience-boundary control exists in UI only and not in actual delivery logic
- unknown-user contexts default to permissive exposure without justification

---

### 9. Submission Abuse & Rate-Limit Boundaries
Reviewer should intensify attention on:
- content submission rate limiting
- anti-spam and abuse dampening
- queue-flood resilience from moderation perspective
- whether the product can be overwhelmed faster than humans can respond

### Example failure patterns
- one actor can flood the product with harmful content faster than moderation can triage it
- report or submission paths lack basic abuse friction
- moderation queue becomes unusable because nothing bounds incoming harm volume

---

### 10. Transparency, Appeals & User Communication
Reviewer should intensify attention on:
- whether users get appropriately bounded feedback about moderation outcomes
- appeals or review-request pathways where relevant
- accessible policy/community-standard communication
- whether moderation behavior is opaque enough to erode trust or create arbitrary-feeling enforcement

### Example failure patterns
- content disappears with no user communication or explanation path
- moderation decision reasons are too vague to be actionable or too detailed to be safe
- policy exists but is not actually surfaced where community behavior is shaped

---

### 11. Cross-Platform & Federated Content Risk
Reviewer should intensify attention on:
- ingestion from third-party/community/federated sources
- whether imported content is treated as untrusted before display or redistribution
- moderation boundaries across Discord, Patreon, Twitter/X, feeds, embeds, or other community surfaces
- whether external content inherits internal safety boundaries or bypasses them

### Example failure patterns
- externally sourced content is displayed publicly without internal moderation screening
- federation or embed paths bypass local safety controls
- moderation assumptions apply only to native content, not imported content streams

---

### 12. Moderation Logging, Auditability & Policy Readiness
Reviewer should intensify attention on:
- logging of moderation actions, reasons, actor, and timing
- retention and export readiness where policy or legal review may later matter
- ability to reconstruct what happened in contested or escalated cases
- whether moderation is operationally accountable rather than ephemeral

### Example failure patterns
- moderation actions leave no durable record of who acted or why
- content incidents cannot be reconstructed after the fact
- audit history is too weak for appeals, legal review, or internal policy governance

---

## What This Lens Should Not Duplicate

This lens should not become a catch-all for AI quality, privacy, or legal review.

Avoid using it to re-run:
- hallucination, bias, and general model-output correctness → AI Systems
- PII handling, consent, minimization, and rights analysis → Privacy, Data Rights & Consent
- secrets, auth flaws, injection, and generic abuse-resistant security controls → Security stages / Secrets & Trust Boundaries
- advertising accuracy and public claims compliance → Legal, Policy & Claims Integrity
- general end-user wording clarity or information architecture → UX & Interaction Clarity
- data schema correctness and storage integrity → State & Data Integrity

Instead, this lens should focus on **content-safety boundaries and moderation operations**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Content Moderation & Safety Lens Summary
- Overall moderation-readiness posture:
- Highest-risk unsafe-content path:
- Most serious escalation or operator-safety gap:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Output filtering & unsafe content prevention | PASS / NEEDS_WORK / BLOCK | ... |
| User reporting & flagging surfaces | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Moderation queue & review tooling | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Policy enforcement consistency | PASS / NEEDS_WORK / BLOCK | ... |
| Escalation paths for severe content | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| AI-generated content boundaries | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Moderator & reviewer safety | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Age-gating & audience segmentation | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Submission abuse & rate-limit boundaries | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Transparency / appeals / user communication | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Cross-platform & federated content risk | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Moderation logging / auditability / policy readiness | PASS / NEEDS_WORK / BLOCK | ... |

### Moderation Architecture Snapshot
| Surface | Content Source | Safety Boundary | Review Path |
|---|---|---|---|
| ... | UGC / AI / imported / mixed | ... | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Surface / policy boundary:
- Evidence:
- Unsafe-content or moderation failure mode:
- Why it matters:
- Fix direction:

### Moderation Lens Blockers
- Blocking community-safety issues:
- Escalation or policy limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- unsafe or policy-violating content can readily reach users with no meaningful boundary
- report/moderation/escalation paths are missing for important community-facing surfaces
- moderator/operator safety is materially compromised by tooling or process gaps
- the product is not credible for public/community use without substantial safety fixes

### NEEDS_WORK-level lens findings
Use when:
- moderation and safety controls exist but are incomplete, inconsistent, or weakly operationalized
- policy enforcement is directionally present but not yet trustworthy at scale
- public/community use is possible, but only with meaningful cleanup before confidence is warranted

### PASS-level lens findings
Use when:
- the reviewer can explain how unsafe content is prevented, surfaced, reviewed, and escalated credibly
- moderation tooling and policy boundaries are coherent enough for the assessed scope
- community-facing behavior does not rely on blind optimism or manual heroics alone

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- report buttons that do not create real moderation work
- AI-generated public content with weak or no safety boundary before display
- no moderator queue or no actionable context for review
- policy logic that drifts or is enforced inconsistently across surfaces
- no escalation path for severe harmful content or rapid unsafe-output incidents
- moderators exposed to raw harmful content without shielding or workflow protection
- imported/federated content bypassing local moderation boundaries
- moderation actions with no durable audit history

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Admin & Operator Experience** when moderator tooling is part of the operational surface
- **AI Systems** when generated content is a major source of moderation risk
- **Legal, Policy & Claims Integrity** when public policy statements about moderation or safety must match reality
- **Resilience & Degraded Modes** when unsafe-output incidents require emergency containment or degraded operation

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this product prevents, surfaces, reviews, and escalates unsafe or policy-violating content across its relevant community and content-bearing surfaces, and I can explain why those boundaries are credible enough for public use.

If that statement cannot be made honestly, this lens should produce meaningful findings.

---
type: review-lens
lens_name: privacy-data-consent
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Privacy, Data Rights & Consent Lens

## Lens Purpose

This lens intensifies review for privacy-respectful product behavior, data-rights realism, and consent integrity in systems that:
- collect user data
- store behavioral or profile data
- use analytics or tracking
- process employee, contractor, or client data internally
- route user/system data to third parties
- use AI providers that receive prompts, documents, or user context
- generate or expose content containing personal or sensitive information

It exists to answer a different question from security review.

Security asks:
> Is the data protected from unauthorized access or abuse?

This lens asks:
> Is the system collecting, using, retaining, disclosing, and deleting data in ways that are proportionate, honest, and respectful of the person the data belongs to?

This is not a vague legal essay and not a full legal audit.
It is a practical review overlay for **reviewable system and product behavior**.

---

## Why This Lens Exists

Vibe-coded systems frequently implement data flows faster than they justify them.

AI-assisted builders readily add:
- extra form fields
- analytics SDKs
- full-body request logging
- conversation persistence
- third-party integrations
- AI provider calls
- user profiling or behavioral inference

…without asking foundational questions such as:
- should we collect this at all?
- does the user know we do?
- can they refuse or revoke it?
- how long do we keep it?
- can we actually delete or export it later?
- are we disclosing third-party sharing honestly?

Without a dedicated lens, many products will pass normal review while still failing basic privacy and data-rights expectations.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the system collects only data it can justify
2. Whether consent is real where consent-sensitive processing exists
3. Whether user/system data shared with third parties is disclosed and bounded honestly
4. Whether retention, access, deletion, and export expectations are implementable in reality
5. Whether AI-native and content-heavy workflows create privacy harms that standard review would underweight

If the reviewer cannot explain what data is collected, why, who receives it, and how rights requests would actually work, this lens should produce serious findings.

---

## Applies To

This lens is most useful for:
- websites and apps with forms, accounts, analytics, or personalization
- AI-native products sending user content to providers
- internal tools handling employee, contractor, or client data
- content systems generating personalized or user-derived output
- products with profile, session, behavioral, or preference storage
- workflows that route data across multiple tools or vendors

It may be applied to:
- **Code review** for collection, storage, retention, disclosure, and deletion behavior in implementation
- **Security review** for obligation-aware trust-boundary analysis and third-party data handling realism
- **Production review** for operational enforcement of deletion, retention, export, and monitoring of privacy-relevant behavior

---

## Core Review Rule

Do not confuse data collection convenience with product legitimacy.

A system does **not** get privacy-respect credit because:
- a privacy policy exists
- a consent banner exists visually
- data is stored securely
- a delete endpoint exists nominally
- the AI feature is hidden behind a friendly UI label
- the data use seems “normal for SaaS” without stronger justification

The reviewer must evaluate whether product behavior actually respects data rights and user expectations.

---

## What This Lens Should Emphasize

### 1. Data Minimization at Collection Points
Reviewer should intensify attention on:
- whether each collected field appears necessary for the stated function
- convenience-driven overcollection
- full-body logging or persistence where narrower capture would suffice
- whether defaults favor minimal collection or “keep everything just in case”

### Example failure patterns
- large intake forms with weak justification for half the fields
- persisting full chat or request bodies when only a small subset is needed
- storing entire user objects client-side for convenience

---

### 2. Consent Architecture Reality
Reviewer should intensify attention on:
- whether consent happens before the relevant processing begins
- whether revocation actually changes behavior
- whether opt-in/opt-out is meaningful or cosmetic
- bundling of unrelated consent decisions into one forced action
- dark-pattern consent design or passive coercion

### Example failure patterns
- analytics or tracking initialize before consent resolves
- checkbox exists but processing proceeds either way
- consent withdrawal changes UI state but not backend behavior

---

### 3. AI / Provider Disclosure & Input Handling
Reviewer should intensify attention on:
- whether users are effectively told when their data goes to external AI providers
- whether prompts/documents are minimized before external submission
- whether provider-bound processing is treated as a real disclosure event
- whether prompt logs, traces, or third-party tooling expand that disclosure further

### Example failure patterns
- user documents sent to model providers without meaningful disclosure
- full prompts and responses retained operationally without clear reason
- AI feature described generically while hiding third-party processing reality

---

### 4. Retention & Deletion Reality
Reviewer should intensify attention on:
- whether retention expectations are visible and enforceable
- whether deletion actually reaches all meaningful stores
- TTL/expiry behavior for sessions, logs, conversations, and analytics
- whether “delete” means hide, detach, or truly remove where expected

### Example failure patterns
- account deletion removes only the main user row
- chat, file, analytics, and third-party traces remain indefinitely
- retention is documented aspirationally but not enforced operationally

---

### 5. Access, Export & Erasure Rights Support
Reviewer should intensify attention on:
- whether the system can realistically export what it stores
- whether a rights request would be complete enough to matter
- whether data is fragmented across systems the delete/export path ignores
- whether rights handling depends on manual heroics with weak coverage

### Example failure patterns
- export endpoint returns profile fields only, ignoring conversation and activity history
- deletion path cannot reach vendor systems or archival stores
- product claims user control but code offers only superficial account removal

---

### 6. Third-Party Sharing & Vendor Visibility
Reviewer should intensify attention on:
- analytics, support, monitoring, payment, CRM, and AI vendor data flows
- whether third-party sharing exceeds what the feature actually requires
- whether vendor relationships are visible enough to reason about user expectation mismatch
- whether hidden syncs or background disclosures exist

### Example failure patterns
- support or analytics tools receive more user context than necessary
- third-party data sharing is technically present but absent from user-facing explanation
- vendor webhooks enrich user records in unexpected ways

---

### 7. Behavioral / Inferred Data Creation
Reviewer should intensify attention on:
- system-created profiles, scores, segments, or inferred preferences
- whether inferred data affects experience or decisions materially
- whether users would reasonably expect such inferences to exist
- whether AI systems are quietly building user models from interaction history

### Example failure patterns
- AI assistant builds preference/profile state from user conversations without disclosure
- behavioral scoring affects experience but is invisible to users
- internal segmentation created casually from observed behavior

---

### 8. Content & Output Privacy Risks
Reviewer should intensify attention on:
- whether generated output can expose personal or sensitive information
- whether personalization can leak one user’s data into another user’s content
- whether AI-generated content can reproduce private details from context or source material
- whether content workflows amplify private data accidentally at scale

### Example failure patterns
- generated emails or pages include unintended personal details
- content pipeline leaks internal or client identifiers into public output
- personalized content overexposes profile or behavior details unnecessarily

---

### 9. Internal Tool Privacy Reality
Reviewer should intensify attention on:
- employee/contractor/client data handled by internal tools
- assumptions that internal use removes privacy obligations
- whether internal surveillance-like features were added casually for convenience
- whether internal systems still need deletion/access/visibility discipline

### Example failure patterns
- productivity or workflow tools collect more staff data than needed
- internal dashboards expose sensitive client/user data broadly
- employee data use has no visible justification or boundaries

---

### 10. Sensitive Categories & Higher-Risk Data Contexts
Reviewer should intensify attention on:
- health, financial, location, biometric, child-related, or other sensitive-category data
- whether the system recognizes that certain fields/actions carry higher expectation and risk
- whether these flows are isolated, disclosed, and handled more carefully
- whether the product is accidentally collecting sensitive data via free-text or AI input paths

### Example failure patterns
- free-text AI intake silently collects sensitive information with no downstream handling plan
- sensitive-category data treated like generic profile metadata
- minors or children are plausible users, but no boundaries or acknowledgments exist

---

## What This Lens Should Not Duplicate

This lens should not collapse into a full security or legal audit.

Avoid treating it as the primary place for:
- encryption-at-rest or in-transit review → Security 3/4
- secret storage and key handling → Security 6 / Secrets lens
- generic auth/session security → Security 3/4
- incident/breach response → Security 7 / Production 6
- whether consent copy, banners, and policy language accurately represent user control → Legal, Policy & Claims Integrity
- backup and disaster recovery → Production 8
- purely legal interpretation of GDPR/CCPA/etc.

Instead, this lens should focus on **behavioral privacy and rights realism**:
- should the data exist?
- does the person know?
- can they control it?
- can the system actually honor that control?

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Privacy, Data Rights & Consent Lens Summary
- Overall privacy-respect posture:
- Highest-risk data-rights gap:
- Most concerning disclosure/consent issue:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Data minimization | PASS / NEEDS_WORK / BLOCK | ... |
| Consent architecture | PASS / NEEDS_WORK / BLOCK | ... |
| AI/provider disclosure | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Retention & deletion | PASS / NEEDS_WORK / BLOCK | ... |
| Access/export/erasure support | PASS / NEEDS_WORK / BLOCK | ... |
| Third-party sharing | PASS / NEEDS_WORK / BLOCK | ... |
| Behavioral/inferred data | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Content/output privacy | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Internal tool privacy | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Sensitive-category handling | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Evidence:
- Why it matters:
- Fix direction:
- Cross-stage handoff:

### Privacy Lens Blockers
- Blocking privacy/data-rights issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- the system materially contradicts basic privacy/consent expectations
- sensitive or user-provided data is being used/disclosed in ways likely to surprise or harm users seriously
- deletion/export/consent behavior is so unrealistic that major trust claims are false in practice
- AI/provider disclosures are materially hidden despite high-sensitivity use

### NEEDS_WORK-level lens findings
Use when:
- privacy posture is directionally decent but meaningful gaps remain
- consent, deletion, sharing, or data minimization behavior is weaker than it should be for the product scope
- user control exists partially but not comprehensively

### PASS-level lens findings
Use when:
- collection and disclosure appear proportionate
- user control claims are meaningfully supported by implementation and operations
- the reviewer can explain how rights, consent, and third-party sharing work without relying on vague policy language alone

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- full request-body logging that captures sensitive user data casually
- analytics/tracking before consent is actually granted
- account deletion that ignores secondary stores and vendors
- AI provider calls treated as invisible implementation detail
- profile or behavioral inference built silently from user interactions
- internal tools collecting staff/client data with weak justification
- generated output leaking personal information from context or personalization logic
- free-text AI flows collecting sensitive data with no retention/deletion plan
- export/delete mechanisms that are too shallow to satisfy the product’s own promises

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **AI Systems** for provider disclosure, prompt-data handling, and AI-generated content risk
- **Secrets & Trust Boundaries** for sensitive data movement through systems and vendors
- **Legal, Policy & Claims Integrity** for mismatch between product behavior and formal claims
- **Content Quality & Information Integrity** when user data appears in generated content or messaging

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand what data the system collects and why, whether users are meaningfully informed and able to control important processing and sharing behavior, and whether deletion, export, retention, and AI/provider disclosure are real product behaviors rather than just policy language.

If that statement cannot be made honestly, this lens should produce serious findings.

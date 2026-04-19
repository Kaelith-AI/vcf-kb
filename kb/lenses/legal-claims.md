---
type: review-lens
lens_name: legal-claims
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Legal, Policy & Claims Integrity Lens

## Lens Purpose

This lens intensifies review for claim accuracy, policy-behavior alignment, and user-facing legal/trust representations in:
- websites
- landing pages
- onboarding flows
- product UIs
- AI-generated or AI-assisted copy
- legal/policy documents included with products
- product messaging about pricing, features, privacy, security, guarantees, certifications, and rights

It exists because products can be technically functional yet still create serious trust, compliance, contractual, or deceptive-representation risk if they say things that are not true, not current, or not actually implemented.

This is not legal advice.
It is a practical review overlay for **whether user-facing claims and policy statements match observable system reality**.

---

## Why This Lens Exists

Vibe-coded systems and AI-generated content create claim risk very quickly.

Common patterns include:
- marketing or UI copy that confidently describes features not fully implemented
- privacy, cookie, and terms documents copied from templates and never reconciled to actual behavior
- AI-generated product descriptions and chatbot responses that overstate capabilities, guarantees, integrations, or compliance posture
- pricing, security, or certification claims made before the underlying business or system evidence exists
- features turned off, removed, or narrowed in code while the external claim survives unchanged

The normal stage system checks correctness, security, and operational readiness.
What it does not explicitly do is ask:

> Does this product honestly represent itself to the people who use it, buy it, depend on it, or contract with it?

This lens exists to make that question visible.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether major product, pricing, privacy, security, and capability claims match actual behavior
2. Whether legal/policy documents are materially coherent with the system that exists today
3. Whether AI-generated or user-facing content is making unsupported assertions
4. Whether certifications, guarantees, rights, and limitations are being represented honestly
5. Whether release or launch would create avoidable claim-integrity risk even if the code technically works

If the reviewer cannot explain why key user-facing claims are defensible, this lens should produce serious findings.

---

## Applies To

This lens is most useful for:
- public websites
- product landing pages
- SaaS onboarding and pricing pages
- privacy/cookie/ToS surfaces
- AI assistants or generated reports making product claims
- client-facing apps and portals
- internal tools that generate external-facing copy or legal/policy materials

It may be applied to:
- **Code review** when implementation and user-facing promises may be diverging
- **Security review** where security/privacy claims materially exceed actual controls
- **Production review** where launch readiness includes external-facing commitments and contractual trust

---

## Core Review Rule

Do not confuse nice copy or complete-looking legal pages with truthful representation.

A system does **not** get claim-integrity credit because:
- a privacy policy exists
- a consent banner exists
- the website uses professional trust language
- compliance badges are displayed
- a chatbot answers confidently about product capabilities
- marketing pages were generated from a polished template

The reviewer must compare what is claimed against what is actually implemented, enabled, documented, or evidenced.

---

## What This Lens Should Emphasize

### 1. Product & Feature Claim Accuracy
Reviewer should intensify attention on:
- claimed capabilities vs actual enabled behavior
- roadmap or future-state features presented as current
- UI or marketing promises that exceed code/config reality
- feature-flagged or partially disabled features still being represented as available

### Example failure patterns
- landing page advertises integrations not actually live
- product UI promises a capability that is only stubbed or internal-only
- AI assistant describes features removed or not yet shipped

---

### 2. AI-Generated Content Assertions
Reviewer should intensify attention on:
- AI-generated product descriptions, chatbot answers, or reports making unsupported factual claims
- confidence language that is not grounded in real system evidence
- generated outputs asserting guarantees, compliance, or capabilities as if verified
- places where AI output can become quasi-official product communication

### Example failure patterns
- chatbot answers “yes” to a compliance question the company cannot substantiate
- generated report states accuracy or confidence numbers not actually computed
- AI content fills gaps with plausible but false product specifics

---

### 3. Legal Document Coherence
Reviewer should intensify attention on:
- privacy policy vs actual data flows
- ToS/service terms vs real product behavior
- cookie policy vs actual tracking behavior
- deletion/retention claims vs implementation reality
- whether template legal text has been tailored meaningfully

### Example failure patterns
- privacy policy claims hard deletion while the system only soft-deletes
- legal docs mention jurisdictions, entities, or obligations not aligned with the actual business/product context
- cookie policy and runtime tracking behavior diverge materially

---

### 4. Consent Representation Integrity
Reviewer should intensify attention on:
- whether consent language accurately describes what the control actually does
- whether opt-in/opt-out wording matches the real scope of the choice
- whether bundled or misleading consent framing overstates user control
- whether banners, toggles, and policy text describe consent consequences honestly

Behavioral analysis of whether consent actually changes processing belongs primarily to the Privacy, Data Rights & Consent lens.

### Example failure patterns
- banner language implies tracking is off until consent, but the control language is materially misleading
- opt-out text suggests broad control while only a narrow subset of processing changes
- consent UI presents a meaningful choice rhetorically while the represented scope is much broader than reality

---

### 5. Pricing, Billing & Guarantee Claims
Reviewer should intensify attention on:
- pricing page claims vs actual entitlement/billing logic
- “free”, “trial”, “money-back”, or “no credit card required” language
- hidden constraints not visible in the claim language
- billing behavior that conflicts with user-facing expectation

### Example failure patterns
- trial advertises no credit card requirement but billing setup says otherwise in practice
- plan features claimed publicly are not enforceable or not actually available
- refund/guarantee copy exceeds the actual process or promise support

---

### 6. Certification, Security & Compliance Badge Claims
Reviewer should intensify attention on:
- displayed or implied badges/certifications
- “enterprise-grade”, “HIPAA-compliant”, “SOC 2”, “GDPR compliant”, “WCAG AA”, etc.
- whether the evidence actually exists and is current
- whether trust-language is stronger than the controls justify

### Example failure patterns
- security marketing claims outrun real audit/control posture
- compliance badge displayed with no current substantiation
- accessibility/security/privacy claims rely on aspiration rather than evidence

---

### 7. Data Handling Representations
Reviewer should intensify attention on:
- promises around residency, sharing, encryption, retention, deletion, or data sales
- whether the system’s real integrations and flows support those promises
- user-facing data-rights language that sounds broader than the implementation
- whether vendor behavior undermines external claims

### Example failure patterns
- “we never share your data” contradicted by actual third-party syncs or providers
- “stored in region X” contradicted by deployed infrastructure/provider choice
- data-rights representation stronger than available export/deletion coverage

---

### 8. Third-Party Integration & Partner Claims
Reviewer should intensify attention on:
- whether claimed integrations are real, current, and working
- whether compatibility statements are true in the supported product scope
- whether partner/vendor naming implies stronger official relationship than exists
- whether integration claims are current or stale leftovers from prior plans

### Example failure patterns
- public page claims integration with major vendor but only mock/demo path exists
- partner logo displayed despite no supported product integration path
- compatibility claim survives after code-level deprecation

---

### 9. User-Generated Content & Liability Framing
Reviewer should intensify attention on:
- whether UGC/moderation/ownership claims are coherent
- moderation promises the product cannot actually uphold
- whether terms around ownership, removal, or reporting are represented realistically
- whether internal content generation could produce externally risky content under company name

### Example failure patterns
- system invites content uploads but has no coherent user-facing ownership/removal posture
- moderation language promises human review or enforcement not operationally present
- generated output published under company authority without appropriate boundary language

---

### 10. IP, Trademark & Source Integrity Risk
Reviewer should intensify attention on:
- AI-generated copy or assets reproducing third-party language or branding too closely
- logos, taglines, or layouts that may create misleading association
- copied terms/policies not tailored to the real business and product context
- whether generated assets appear derivative in legally risky ways

### Example failure patterns
- competitor copy reused nearly verbatim by generated marketing content
- trademark-bearing placeholder asset ships by accident
- legal text copied from another company with only superficial edits

---

### 11. Jurisdiction & Scope of Rights Claims
Reviewer should intensify attention on:
- region-specific promises made globally without qualification
- rights/guarantees that vary by jurisdiction but are presented as universal
- whether the product scope and company context support the geographic breadth of the claim
- whether legal/policy wording is narrower or broader than the real audience served

### Example failure patterns
- broad privacy-rights language applied globally with no operational support
- refund or guarantee promise that conflicts with actual sales region/process reality
- local legal assumptions presented as universal defaults

---

### 12. Deprecation & Change Representation
Reviewer should intensify attention on:
- whether deprecated features are still marketed or documented as current
- whether major limitations or transitional states are disclosed honestly enough
- whether roadmap, beta, experimental, and production-ready states are distinguished properly
- whether stale claims survived after code or config changed

### Example failure patterns
- launch copy still advertises a feature now behind a disabled flag
- experimental AI behavior framed as stable capability
- deprecation underway, but customer-facing surfaces remain silent

---

## What This Lens Should Not Duplicate

This lens should not become a legal department substitute or a re-run of security/compliance implementation review.

Avoid using it to re-run:
- detailed auth/session implementation review → Security stages
- secret storage review → Secrets & Trust Boundaries / Security 6
- accessibility implementation review → Accessibility lens
- raw dataflow architecture review → Security 1/3 and Code 8
- purely technical privacy implementation mechanics and whether consent technically changes processing → Privacy, Data Rights & Consent / Security stages
- generic copyediting or brand voice review beyond claim integrity

Instead, this lens should focus on:
- claim truthfulness
- policy-behavior coherence
- whether user-facing legal/trust language matches reality

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Legal, Policy & Claims Integrity Lens Summary
- Overall claim-integrity posture:
- Most serious unsupported claim:
- Highest-risk policy-behavior mismatch:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Product & feature claim accuracy | PASS / NEEDS_WORK / BLOCK | ... |
| AI-generated content assertions | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Legal document coherence | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Consent gate integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Pricing/billing/guarantee claims | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Certification/security/compliance claims | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Data handling representations | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Third-party integration claims | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| UGC/liability framing | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| IP/trademark/source integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Jurisdiction/scope of rights claims | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Deprecation/change representation | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Claim or policy statement:
- Location:
- Actual observed reality:
- Evidence:
- Why the mismatch matters:
- Fix direction:

### Claims Lens Blockers
- Blocking unsupported claims:
- Required launch-scope corrections:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- major user-facing claims are materially false or misleading
- policies or guarantees contradict actual product behavior in ways likely to create serious trust or liability risk
- launch would expose the company to avoidable deceptive-representation or contractual risk
- AI-generated or automated content is making unsupported high-consequence assertions

### NEEDS_WORK-level lens findings
Use when:
- claims are directionally true but overstated or insufficiently qualified
- legal/policy surfaces need tightening to match actual behavior
- product messaging is ahead of implementation but can be corrected before broader release

### PASS-level lens findings
Use when:
- important external-facing claims are materially defensible
- policy and product behavior align closely enough for the assessed scope
- reviewer can explain why the product is not making promises beyond what it actually supports

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- feature claims surviving after code/config disables the feature
- AI assistant or generated report making unsupported capability/compliance claims
- privacy/cookie/ToS text copied from templates and not reconciled to actual behavior
- pricing and guarantee language that conflicts with real billing logic
- security/compliance badges displayed without evidence
- “we never share/sell data” language contradicted by real integrations or providers
- third-party integration and partner claims that overstate current support
- generated marketing copy reproducing competitor language or branding too closely
- deprecated or beta behavior framed as stable product capability

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Privacy, Data Rights & Consent** for data-rights and disclosure claims
- **AI Systems** when model output or prompts generate user-facing claims
- **Accessibility** where compliance or accessibility claims need evidentiary support
- future content/brand lenses where product trust language and factual integrity overlap

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I can identify the product’s major user-facing promises, policies, and trust claims, explain why they are or are not supported by actual system behavior, and show that launch would not depend on copy, badges, or legal language outrunning reality.

If that statement cannot be made honestly, this lens should produce serious findings.

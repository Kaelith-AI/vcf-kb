---
type: review-lens
lens_name: integration-boundary
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Integration Boundary Lens

## Lens Purpose

This lens intensifies review for API contracts, webhook boundaries, schema drift, external dependency assumptions, callback payload handling, versioning drift, compatibility expectations, and seam quality between systems.

It exists because many vibe-coded systems are defined not by their internal code alone, but by the seams where they meet:
- third-party APIs
- SDKs
- webhooks
- callbacks
- shared databases
- external automation tools
- partner platforms
- provider-specific payloads and version contracts

This is not a generic bug lens.
It is a practical review overlay for **whether the contracts at system boundaries are current, validated, observable, and resilient enough to trust**.

---

## Why This Lens Exists

Kaelith’s systems are integration-heavy by nature.

Vibe-coded projects frequently connect to:
- Stripe
- Discord
- Patreon
- Twitter/X and other social APIs
- AI providers
- Airtable, Notion, Supabase, and similar platforms
- automation and webhook ecosystems

LLMs are especially dangerous at these seams because they often:
- hallucinate endpoint shapes
- assume outdated SDK methods or API versions
- trust payload structure too casually
- bake undocumented provider behavior into the code
- hide integration assumptions in scattered helper logic rather than making them explicit

Existing lenses catch adjacent concerns, but not this exact one:

> Is the contract at the seam between this system and an external system actually valid, current, observable, and robust to drift?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether external interfaces are implemented against real, current contracts rather than guessed ones
2. Whether inbound and outbound payloads are validated and interpreted safely enough
3. Whether versioning, compatibility, and environment assumptions are explicit and supportable
4. Whether the system can detect and survive boundary drift rather than failing silently
5. Whether operators can observe and debug integration seams without blind faith

If the reviewer cannot explain why the seam should still hold after a provider changes shape, version, or behavior, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- API-driven products
- webhook and callback systems
- third-party platform integrations
- automation-heavy workflows crossing tools
- SDK-based client/server integrations
- systems depending on partner, provider, or shared-data contracts
- products with many external service boundaries

It may be applied to:
- **Code review** to scrutinize contract assumptions before release
- **Security review** where webhook validation, token scope, or boundary trust matter materially
- **Production review** to assess whether live integrations are supportable and observable under drift

This lens is not a substitute for full security or workflow review.

---

## Core Review Rule

Do not confuse “integration exists” with “integration contract is trustworthy.”

A system does **not** get seam-quality credit because:
- a test request succeeded once
- the SDK installs cleanly
- the provider docs looked similar to the implementation
- the mock payload matched the handler
- the team has the right API key

The reviewer must ask whether the system survives:
- version drift
- schema drift
- missing or extra fields
- provider-specific error shapes
- staging vs production mismatch
- callback or webhook misconfiguration
- undocumented provider changes and edge cases

---

## What This Lens Should Emphasize

### 1. API Contract Currency
Reviewer should intensify attention on:
- endpoint/method/parameter alignment with real provider contracts
- deprecated or legacy endpoints
- version headers or URL segments
- whether the implementation is clearly anchored to an actual current contract

### Example failure patterns
- code calls an endpoint or method shape no longer supported by the provider
- implementation assumes a legacy field or response structure after an API version change
- integration works only against stale examples or mocks rather than current contracts

---

### 2. Webhook & Callback Payload Validation
Reviewer should intensify attention on:
- schema validation for inbound events
- signature or authenticity verification where applicable
- assumptions about payload completeness and ordering
- safe handling of unknown or changed fields

### Example failure patterns
- webhook handler trusts payload shape without validation
- callback processes fields that may be absent or provider-version dependent
- signed webhook is accepted without verifying authenticity or replay boundaries

---

### 3. Schema Drift & Field-Semantics Risk
Reviewer should intensify attention on:
- external field meaning changes
- optional vs required drift
- shared database or shared-data assumptions between systems
- whether semantic changes can break the integration quietly

### Example failure patterns
- external field changes type or meaning and the code interprets it silently wrong
- two systems agree on field name but not business meaning
- schema drift produces nulls or wrong branching instead of visible failure

---

### 4. Versioning & Compatibility Expectations
Reviewer should intensify attention on:
- explicit API version dependence
- SDK/library version compatibility
- assumptions about backward compatibility
- migration/update plan for external contract changes
- whether compatibility expectations are visible to maintainers and operators

### Example failure patterns
- code calls methods available only in a newer SDK than the pinned one
- integration depends on beta behavior without acknowledging the risk
- provider deprecates a version and the system has no visible compatibility strategy

---

### 5. Error Boundary Completeness at Seams
Reviewer should intensify attention on:
- provider-specific error payload handling
- 401/403/404/409/422/429 and similar boundary conditions
- parsing and surfacing of external failure details
- whether external errors are flattened into misleading generic behavior

### Example failure patterns
- integration only handles success and generic failure, missing key provider error classes
- provider returns structured error details but the system ignores them and becomes opaque
- seam failures are misclassified, causing wrong retry or fallback behavior downstream

---

### 6. Auth Scope & Token Validity at Integration Boundaries
Reviewer should intensify attention on:
- whether the credential used actually matches the operations performed
- token scope, expiry, and refresh assumptions
- least-privilege alignment for external calls
- mismatch between configured auth and actual integration behavior

### Example failure patterns
- token exists but lacks the scope required for the called operation
- refresh/expiry logic is absent even though the provider requires it
- integration uses broader credentials than needed because it was expedient during development

---

### 7. Callback, Redirect & Environment Boundary Integrity
Reviewer should intensify attention on:
- staging vs production base URLs and redirect URIs
- callback endpoint correctness across environments
- webhook destinations and redirect settings that drift by deploy target
- whether environment routing is explicit and safe

### Example failure patterns
- production system points a callback to staging or vice versa
- redirect URI assumptions break OAuth-style flows in one environment
- environment-specific base URL handling is incomplete or brittle

---

### 8. Rate Limit, Quota & Provider Constraint Awareness
Reviewer should intensify attention on:
- rate limits and quotas at the external boundary
- whether integration behavior assumes infinite or high-volume allowance
- batching, pacing, or backoff expectations
- how provider constraints shape compatibility and trust at scale

### Example failure patterns
- integration works in low volume but has no path for rate-limited reality
- provider quota boundaries are ignored until production load reveals them
- code assumes burst behavior the provider explicitly does not support

---

### 9. External Dependency Assumption Audit
Reviewer should intensify attention on:
- hidden assumptions about availability, field ordering, encoding, response timing, or provider behavior
- undocumented seam assumptions living only in code or tribal knowledge
- implicit dependencies on “it always answers this way” logic

### Example failure patterns
- system depends on provider field order or optional-field presence without saying so
- external system behavior is treated as stable fact without contract support
- integration breaks quietly because assumptions were never made explicit enough to test or monitor

---

### 10. Seam Observability
Reviewer should intensify attention on:
- logging and diagnostics at ingress/egress boundaries
- enough visibility to debug integration failures without guesswork
- safe recording of payload context without leaking secrets
- whether operators can tell which seam failed and why

### Example failure patterns
- integration fails but there is no useful trace of request/response context
- operators see generic failure but cannot identify which provider boundary broke
- seam logs are either absent or so unsafe that they cannot be enabled responsibly

---

### 11. Environment-Specific Base URL, Config & Routing Discipline
Reviewer should intensify attention on:
- environment-specific hostnames, paths, IDs, and provider configs
- accidental cross-environment bleed
- whether configuration clearly separates local, staging, and production seam behavior
- hardcoded provider routing assumptions

### Example failure patterns
- local/staging/production integration config is mixed or partially hardcoded
- one deployment environment silently talks to the wrong upstream instance
- provider setup depends on manual environment tweaks not reflected in code or docs

---

### 12. Data Format & Encoding Contracts
Reviewer should intensify attention on:
- JSON vs form-encoded vs multipart assumptions
- date/time, numeric precision, nullability, and absent-field handling
- base64, unicode, and content-type expectations at boundaries
- whether format mismatches are validated or only discovered through production failure

### Example failure patterns
- provider expects one format but integration sends another with accidental success only in testing
- null vs absent vs empty-string handling changes seam semantics
- encoding assumptions break webhook, file, or message processing subtly

---

## What This Lens Should Not Duplicate

This lens should not become a generic workflow, defect, or security pass.

Avoid using it to re-run:
- workflow topology, trigger design, and orchestration behavior → Workflow & Automation Reliability
- generic logic bugs unrelated to external boundaries → Defect Discovery
- secret exposure and credential leakage → Secrets & Trust Boundaries
- secure storage, transport, rotation, and lifecycle handling of credentials → Secrets & Trust Boundaries

This lens covers whether an integration is using a credential with the right scope and fit for the operation being performed, not whether that credential is stored or managed securely.
- legal/commercial permissibility of integrations or public claims about them → Legal, Policy & Claims Integrity
- generic privacy-law analysis of third-party sharing → Privacy, Data Rights & Consent
- dependency CVE review → supply-chain stages

Instead, this lens should focus on **contract quality at the seam**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Integration Boundary Quality Lens Summary
- Overall seam-quality posture:
- Highest-risk integration boundary:
- Most serious drift or compatibility concern:
- Scope notes:

### Integrations Inventoried
| Integration | Type | Direction | Primary Risk |
|---|---|---|---|
| ... | REST / webhook / SDK / DB / queue | inbound / outbound / both | ... |

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| API contract currency | PASS / NEEDS_WORK / BLOCK | ... |
| Webhook & callback payload validation | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Schema drift & field-semantics risk | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Versioning & compatibility expectations | PASS / NEEDS_WORK / BLOCK | ... |
| Error boundary completeness at seams | PASS / NEEDS_WORK / BLOCK | ... |
| Auth scope & token validity at integration boundaries | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Callback / redirect / environment boundary integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Rate limit / quota / provider constraint awareness | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| External dependency assumption audit | PASS / NEEDS_WORK / BLOCK | ... |
| Seam observability | PASS / NEEDS_WORK / BLOCK | ... |
| Environment-specific base URL / config / routing discipline | PASS / NEEDS_WORK / BLOCK | ... |
| Data format & encoding contracts | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Integration / boundary:
- Evidence:
- Failure mode:
- Why it matters:
- Fix direction:

### Integration Lens Blockers
- Blocking seam-quality issues:
- Compatibility limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- an external contract is likely invalid, stale, or dangerously under-validated
- seam failures can cause silent breakage, data loss, auth failure, or major operational damage
- environment routing, callback handling, or version drift makes the integration untrustworthy for release
- operators cannot realistically observe or recover integration failures

### NEEDS_WORK-level lens findings
Use when:
- integrations are directionally sound but fragile under drift, version change, or provider error diversity
- seam assumptions are too implicit or weakly observable
- supportability depends too much on lucky provider stability or maintainer memory

### PASS-level lens findings
Use when:
- the reviewer can explain how important seams are versioned, validated, and monitored
- integration boundaries remain credible under ordinary provider drift and edge conditions
- compatibility and environment assumptions are explicit enough to support confidently

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- hallucinated or deprecated endpoints and SDK methods
- webhook handlers that trust payload shape or authenticity too casually
- provider field/type drift that silently changes system behavior
- OAuth/callback/redirect config bleeding across environments
- provider-specific error shapes ignored or flattened incorrectly
- integration code that assumes field order, availability, or encoding without contract support
- boundary logs too weak to debug the seam, or too unsafe to enable responsibly
- token scope/expiry mismatches that appear only in real provider use

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Workflow & Automation Reliability** when workflows depend on brittle external seams
- **State & Data Integrity** when schema or event drift creates persistent data corruption
- **Resilience & Degraded Modes** when provider failure behavior shapes live product trust
- **Cost Efficiency** when quota, batching, and third-party call patterns affect economic viability
- **Legal, Policy & Claims Integrity** when product surfaces promise integrations or compatibility externally

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand the important seams between this system and the external systems it depends on, and I can explain why their contracts, payloads, versions, environment routing, and observability are trustworthy enough to survive real drift and provider behavior.

If that statement cannot be made honestly, this lens should produce meaningful findings.

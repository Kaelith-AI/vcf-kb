---
type: review-stage
review_type: security
stage: 5
stage_name: "Supply Chain Dependencies Third Party Trust"
version: 1.0
updated: 2026-04-18
---
# Security Stage 5 — Supply Chain, Dependencies & Third-Party Trust

## Stage Metadata
- **Review type:** Security
- **Stage number:** 5
- **Stage name:** Supply Chain, Dependencies & Third-Party Trust
- **Purpose in review flow:** Verify that third-party code, packages, build inputs, and external services are trustworthy enough for the project’s risk level
- **Default weight:** High
- **Required reviewer posture:** Provenance-aware, skeptical of dependency convenience, explicit about external trust assumptions
- **Lens interaction:** Lenses may intensify particular supply-chain concerns, but all reviews must assess package trust, build-time attack surface, and third-party validation realism
- **Depends on:** Security Stage 1 external trust surfaces, Security Stage 2 abuse-path prioritization, Code Stage 5 dependency/provenance findings, and Code Stage 8 third-party disclosure findings where relevant
- **Feeds into:** Security Stages 6 and 9; Production Stages 5 and 9
- **Security/Production handoff:** Carry forward dependency provenance risk, vulnerability exposure, install/build-time trust issues, webhook/callback validation concerns, third-party blast-radius findings, and credential/trust assumptions that should inform later identity and key-management review

---

## Why This Stage Exists

Projects do not only inherit risk from their own code.
They also inherit risk from:
- dependencies
- registries and mirrors
- vendored code
- lifecycle hooks and build steps
- webhook and callback trust relationships
- third-party SDKs and service providers
- model providers whose behavior, format, uptime, or policy assumptions the system depends on

Vibe-coded projects are especially vulnerable here because package choice is often driven by pattern mimicry rather than deliberate trust evaluation. Common failure modes include:
- plausible but wrong package names
- floating versions
- copied examples with bloated dependency trees
- unaudited wrappers around critical services
- third-party integrations trusted more than their inputs deserve

This stage asks:

> Is the project’s external software and service trust surface controlled, reviewable, and defensible?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether dependencies and build inputs are legitimate and controlled
2. Whether known vulnerability and provenance risks are visible and bounded
3. Whether third-party services and callbacks are treated as untrusted until verified
4. Whether dependency choices are proportionate to the problem being solved
5. Whether compromise of a major dependency or integration would have obvious blast radius

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Supply-chain trust summary**
2. **Dependency/provenance findings**
3. **Vulnerability and freshness findings**
4. **Install/build-time trust findings**
5. **Third-party trust and callback findings**
6. **Key supply-chain risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- dependency manifests and lockfiles
- audit output (`npm audit`, `pip-audit`, `cargo audit`, `govulncheck`, etc.) where available
- registry/source references (`.npmrc`, pip config, cargo config, vendored code provenance)
- install/build scripts and package lifecycle hooks
- third-party SDK usage, webhook handlers, and callback validation logic
- comments/docs justifying unusual packages or trust relationships

---

## Core Review Rule

Do not treat third-party code or services as trustworthy because they are popular, familiar, or easy to install.

A dependency or provider does **not** earn trust because:
- the package name looks right
- the example worked
- the SDK is common
- the build passes locally
- the callback comes from a “known integration”

The reviewer must ask whether the project’s external trust surface is:
- legitimate
- controlled
- validated
- bounded in blast radius

---

# Review Procedure

## Step 1 — Review Dependency Inventory & Reproducibility

Determine whether the dependency surface is controlled enough to reason about.

### Check
- [ ] Lockfiles exist where expected and appear in sync with manifests
- [ ] Production dependencies are pinned or tightly constrained enough for reproducibility
- [ ] Direct dependency count is not inflated without justification
- [ ] `latest`, `*`, or similarly uncontrolled production ranges are flagged

### Reviewer questions
- Would a fresh install resemble the reviewed system closely enough?
- Is the dependency tree reasonably bounded for this project’s scope?
- Is dependency sprawl increasing attack surface without clear benefit?

### Example — Incorrect
```json
{
  "dependencies": {
    "axios": "latest"
  }
}
```
Why it fails:
- uncontrolled version drift
- future installs may not match reviewed behavior

### Example — Better
```json
{
  "dependencies": {
    "axios": "1.6.5"
  }
}
```
Why it passes:
- version is bounded and reproducible

---

## Step 2 — Review Package Authenticity & Provenance

Determine whether dependencies come from sources the reviewer can trust proportionately.

### Check
- [ ] Dependencies come from expected registries or explicitly justified sources
- [ ] Non-registry, git-based, local-path, or private URL dependencies are identified and justified
- [ ] Package names do not appear hallucinated, suspiciously typo-prone, or deceptive
- [ ] Vendored code retains enough provenance/version context to review sensibly

### Common failure patterns
- typo-squatted or hallucinated package names
- critical dependency pulled from a random fork without justification
- vendored code with no version, source, or review note

### Example — Incorrect
```json
{
  "dependencies": {
    "critical-lib": "git+https://github.com/random-user/fork.git"
  }
}
```
Why it fails:
- trust and update path unclear
- provenance risk increased without explanation

---

## Step 3 — Review Vulnerability Exposure & Freshness

Determine whether known risk in the dependency surface is visible and handled honestly.

### Check
- [ ] Known critical/high vulnerabilities are surfaced explicitly
- [ ] Vulnerability scans are not suppressed or rendered meaningless
- [ ] Reviewer uses or references concrete tooling/databases where available
- [ ] Stale or abandoned critical dependencies are identified
- [ ] Reviewer distinguishes “stable and quiet” from “unmaintained and risky” where possible

### Minimum expectation
Reviewer should consult concrete vulnerability sources where ecosystem-relevant:
- JavaScript/Node: `npm audit`
- Python: `pip-audit`
- Rust: `cargo audit`
- Go: `govulncheck`
- Cross-ecosystem: OSV, GitHub Advisories, Snyk findings where available

### Guidance
- Record which tools/sources were used and which were unavailable
- Treat scan output as input, not final truth
- Flag when no meaningful scan/advisory check was performed and reduce confidence accordingly

---

## Step 4 — Review Install / Build-Time Attack Surface

Determine whether dependency installation or asset retrieval introduces hidden trust risk.

### Check
- [ ] Dependency lifecycle scripts (`preinstall`, `postinstall`, etc.) are identified when relevant
- [ ] Build or install steps do not fetch arbitrary remote code without review
- [ ] Registry or mirror config does not silently redirect to untrusted sources
- [ ] CDN/browser-delivered assets use integrity controls where appropriate

### Common failure patterns
- postinstall script executes opaque remote behavior
- build step curls arbitrary code during install
- registry config silently points at shadow or internal mirrors with unclear trust controls

---

## Step 5 — Review Third-Party Service Trust & Callback Validation

This stage covers service trust as well as package trust.

### Check
- [ ] External services are not treated as inherently trusted data sources
- [ ] Webhooks/callbacks validate origin/signature where relevant
- [ ] OAuth/OIDC/API client integrations use credible libraries and trust assumptions
- [ ] Model providers are treated as part of the supply chain when system behavior depends on their output/format/rate-limit/pricing stability
- [ ] Third-party inputs are validated before influencing privileged actions

### Example — Incorrect
```python
def verify_webhook(payload, sig_header, secret):
    return sig_header == secret
```
Why it fails:
- presence check is not real signature validation
- spoofed callbacks remain plausible

### Example — Better
```python
def verify_webhook(payload: bytes, sig_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig_header)
```
Why it passes:
- origin validation is structurally stronger

---

## Step 6 — Review Design / Risk Comments as Evidence

Comments can show awareness of supply-chain risk, but they do not neutralize it.

### Check
- [ ] Comments justifying risky dependency choices are treated as evidence, not absolution
- [ ] “Temporary” supply-chain shortcuts are surfaced as debt
- [ ] Reviewer challenges weak rationale for large or risky external trust surfaces

### Example — Weak comment
```js
// Using this package for now
```
Why it fails:
- no scope, rationale, or containment

### Example — Better comment
```js
// Temporary parser dependency because built-in parser fails on multiline quoted fields.
// Isolated to import module only. Planned replacement after internal parser lands.
```
Still subject to review, but meaningfully better.

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 9:** unresolved supply-chain, provider, or callback trust issues affecting release posture
- **Production 5:** reproducibility, artifact, registry, and build trust issues affecting deployability
- **Production 9:** major third-party blast-radius concerns affecting ship/no-ship decisions

### Required handoff block
- **Carry-forward concerns:**
  - Dependency provenance risk:
  - Vulnerability exposure:
  - Install/build-time trust risk:
  - Webhook/callback validation risk:
  - Third-party / model-provider trust risk:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny on model providers as supply-chain dependencies, SDK trust, and provider-driven format/behavior assumptions
- **credentials lens:** emphasize packages and third-party integrations that touch secrets, auth, and key material
- **bug-hunt lens:** emphasize dependency drift and integration overtrust likely to create exploitable runtime defects
- **platform lens:** emphasize registry, packaging, binary, and environment-specific install trust issues

---

## Severity / Gating Model

### PASS
Use PASS when:
- dependencies and third-party trust assumptions are controlled enough for the project’s risk level
- major supply-chain risks are visible and bounded
- reviewer can explain why the external trust surface is acceptable or well-contained

### NEEDS_WORK
Use NEEDS_WORK when:
- dependency hygiene is directionally acceptable but has meaningful gaps
- third-party trust relationships need better validation, documentation, or control
- supply-chain risk is elevated but still bounded and fixable

### BLOCK
Use BLOCK when:
- critical supply-chain trust is unclear or compromised
- major dependencies or callbacks are clearly unsafe or uncontrolled
- high-severity vulnerability/provenance issues materially undermine trust in the system
- later release confidence would depend on unbounded third-party trust

---

## Escalation Guidance

Escalate or explicitly flag when:
- critical packages have unclear provenance or serious unresolved advisories
- install/build flows execute code the team does not appear to understand or control
- third-party callbacks or provider outputs influence privileged actions with weak validation
- model-provider reliance creates meaningful security or availability blast radius that the project understates

If the project’s external trust surface is too uncontrolled to defend confidently, use **BLOCK**.

---

## Required Report Format

### 1. Supply-Chain Trust Summary
- Overall external trust posture:
- Highest-risk external dependencies/services:
- Confidence in provenance control:

### 2. Dependency / Provenance Findings
- Lockfile and version discipline:
- Suspicious or unusual sources:
- Vendored code concerns:

### 3. Vulnerability & Freshness Findings
- Tools/sources consulted:
- Critical/high findings:
- Maintenance/freshness concerns:

### 4. Install / Build-Time Trust Findings
- Lifecycle scripts:
- Remote-fetch behavior:
- Registry / mirror trust concerns:

### 5. Third-Party Trust & Callback Findings
- Webhook/callback validation quality:
- External service trust assumptions:
- Model-provider supply-chain concerns:

### 6. Key Supply-Chain Risks
- Blocking risks:
- Bounded risks:
- Residual blast-radius concerns:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- trust a dependency because it is familiar or popular
- treat scan output as complete truth without relevance triage
- ignore build/install trust surfaces because the app runs after installation
- treat webhook/provider input as trustworthy just because it comes from a known service
- collapse supply-chain review into a single package-audit screenshot

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand the project’s major dependency and third-party trust surfaces, their provenance and vulnerability posture are controlled enough for the system’s risk level, and external services or callbacks are not being trusted beyond what the implementation actually verifies.

If that statement cannot be made honestly, this stage should not pass.

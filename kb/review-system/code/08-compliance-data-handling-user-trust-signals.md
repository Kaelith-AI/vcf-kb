---
type: review-stage
review_type: code
stage: 8
stage_name: "Compliance Data Handling User Trust Signals"
version: 1.0
updated: 2026-04-18
---
# Code Stage 8 — Compliance, Data Handling & User Trust Signals

## Stage Metadata
- **Review type:** Code
- **Stage number:** 8
- **Stage name:** Compliance, Data Handling & User Trust Signals
- **Purpose in review flow:** Determine whether the code handles sensitive data and user-trust concerns in ways that are proportionate, honest, and consistent with likely policy or regulatory expectations
- **Default weight:** High
- **Required reviewer posture:** Privacy-aware, trust-focused, skeptical of convenience-driven overcollection and disclosure
- **Lens interaction:** Security/credentials/LLM-focused lenses intensify this stage strongly, but all code reviews must still verify data handling and trust-signal reality
- **Depends on:** Code Stage 1 scope truth, Code Stage 4 behavior reality, Code Stage 5 third-party/dependency inventory
- **Feeds into:** Code Stage 9, Security Stage 1 and later security data-handling analysis, Production Stages 3 and 8
- **Security/Production handoff:** Record regulatory/trust-boundary signals, retention/deletion concerns, third-party disclosure risks, and model-provider data exposure for deeper downstream review

---

## Why This Stage Exists

A codebase can be functionally correct and still be a trust failure.

Vibe-coded systems often optimize for convenience, visibility, and feature completion rather than restraint. That leads to patterns such as:
- logging too much user data
- returning oversized API payloads by default
- collecting fields with no clear need
- adding analytics or telemetry without meaningful disclosure
- creating indefinite sessions or weak deletion behavior
- sending sensitive context to external AI/model providers without treating it as a serious trust boundary
- claiming privacy/compliance properties in docs or comments that the code does not actually enforce

This stage asks:

> Does the code handle user-affecting data and trust-sensitive behavior in a way that is credible?

This is not a full legal audit.
It is a code-level check that obvious privacy, disclosure, retention, and trust failures are not being mistaken for acceptable implementation.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What sensitive or user-affecting data the code handles
2. Whether that data is collected, stored, returned, and logged appropriately
3. Whether retention, deletion, consent, and disclosure behaviors are credible
4. Whether third-party services or model providers receive data in ways users or policy might not expect
5. Whether code-level trust/privacy claims are actually supported by implementation

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Sensitive-data handling summary**
2. **Data minimization / overexposure findings**
3. **Consent / lifecycle / deletion findings**
4. **Third-party disclosure findings**
5. **Trust-signal contradictions in code or docs**
6. **Security Stage 1 follow-up flags**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- data models / schemas / serializers
- logger calls and error responses
- auth/session/token handling code
- analytics, telemetry, crash reporting, webhook, or third-party SDK usage
- account deletion/export/retention-related code if relevant
- config/docs related to privacy/compliance-sensitive behavior
- code paths sending data to LLM/model providers
- comments/docs claiming encryption, privacy, compliance, consent, or trust guarantees

---

## Core Review Rule

Do not treat privacy/compliance/trust language as proof.

A project does **not** get credit because:
- the README says “privacy-first”
- the UI shows an opt-out toggle
- comments claim data is encrypted or anonymized
- there is a delete endpoint
- there is a model-provider integration hidden behind a generic “AI feature” label

The reviewer must verify what the code actually collects, stores, logs, returns, transmits, and retains.

---

# Review Procedure

## Step 1 — Identify Sensitive & User-Affecting Data Flows

Map the important trust-relevant data handled by the code.

### Check
- [ ] Sensitive or user-identifying data is identifiable in models and flows
- [ ] Reviewer can identify where the project handles PII, secrets-adjacent values, tokens, or high-sensitivity user context
- [ ] Main data-entry, storage, logging, and response paths are understandable enough to review

### Reviewer questions
- What user/system data enters this app?
- Which parts of that data would users reasonably expect to be handled carefully?
- What data would create harm if overexposed or retained casually?

---

## Step 2 — Review Data Minimization & Response Discipline

Determine whether the code collects and returns only what it needs.

### Check
- [ ] Data collected appears proportionate to the stated feature need
- [ ] API responses do not over-return internal or sensitive fields
- [ ] Unused or speculative fields are flagged where visible
- [ ] Convenience-driven overexposure is identified

### Example — Incorrect
```javascript
router.get('/me', (req, res) => {
  res.json(req.user)
})
```
Why it fails:
- may expose internal/sensitive fields by convenience

### Example — Better
```javascript
router.get('/me', (req, res) => {
  const { id, username, display_name, avatar_url } = req.user
  res.json({ id, username, display_name, avatar_url })
})
```
Why it passes:
- returns only what the caller plausibly needs

---

## Step 3 — Review Logging, Errors & Internal Visibility

Determine whether sensitive data is being exposed through operational paths.

### Check
- [ ] Sensitive fields are not casually logged
- [ ] Error messages do not unnecessarily reveal sensitive internals
- [ ] Crash/trace/reporting paths do not obviously ship excessive user data
- [ ] Operational observability is balanced against user trust risk

### Example — Incorrect
```python
logger.info(f"User {user.email} logged in from {request.ip}")
```
Why it fails:
- exposes more identifying information than necessary in logs

### Example — Better
```python
logger.info("User authenticated", extra={"user_id": user.id})
```
Why it passes:
- retains operational value with lower privacy risk

---

## Step 4 — Review Consent, User Control & Trust Expectations

Determine whether trust-relevant user controls affect real behavior.

### Check
- [ ] Analytics or telemetry behavior is visible and not silently contradictory to user expectations
- [ ] Consent-related settings, if claimed, appear on real code paths
- [ ] User control actions (delete, revoke, opt-out, export, etc.) are not fake endpoints or cosmetic gestures
- [ ] Trust-relevant behavior is implemented, not just described in UI/docs/comments

### Common failure patterns
- opt-out toggle exists, backend still sends full event stream
- delete endpoint only soft-hides data while retaining everything indefinitely without disclosure
- “private mode” affects UI only, not logging or provider calls

---

## Step 5 — Review Retention, Session & Lifecycle Behavior

Determine whether user-affecting state has sensible boundaries.

### Check
- [ ] Tokens/sessions have explicit expiry or lifecycle management where appropriate
- [ ] Temporary/cache data does not obviously persist forever without reason
- [ ] Deletion/cleanup paths are at least credible for stated obligations
- [ ] Unbounded retention is surfaced where visible

### Example — Incorrect
```python
token = jwt.encode({"user_id": user.id}, SECRET)
```
Why it fails:
- no lifetime boundary visible

### Example — Better
```python
token = jwt.encode(
    {"user_id": user.id, "exp": datetime.utcnow() + timedelta(hours=24)},
    SECRET,
    algorithm="HS256"
)
```
Why it passes:
- explicit lifecycle boundary

---

## Step 6 — Review Third-Party Sharing & External Visibility

Determine what external systems receive user/system data.

### Check
- [ ] External services receiving user/system data are identifiable
- [ ] Analytics, crash-reporting, webhook, and SDK sends are not obviously excessive
- [ ] Hidden third-party disclosure is flagged
- [ ] Reviewer notes where implementation likely violates reasonable user expectations

### Important LLM / AI rule
For projects using LLM or AI APIs, data sent to model providers must be treated as a **first-class trust boundary**.

The reviewer must check:
- [ ] what user/system/context data flows to model providers
- [ ] whether users would reasonably expect that data to be sent externally
- [ ] whether the product/docs disclose that flow clearly enough
- [ ] whether sensitive or PII-bearing prompts/context are sent without strong justification and disclosure
- [ ] whether visible provider-policy, retention, training, access, or review implications are being ignored in code/design claims

This is one of the most important vibe-code-specific checks in the stage.

---

## Step 7 — Review Trust Signals in Code & Docs

This step checks whether trust language is materially earned.

### Check
- [ ] README/policy/compliance claims do not materially overstate code reality
- [ ] Comments claiming privacy/compliance properties are verified against implementation
- [ ] Reviewer challenges design comments that underplay sensitive-data risk
- [ ] User-facing trust claims are not contradicted by actual handling behavior

### Common failure patterns
- “we never store user prompts” claim contradicted by logs or DB writes
- “delete means delete” claim contradicted by retained copies/caches
- “encrypted” claim present, but code only base64-encodes or stores plaintext in practice

---

## Step 8 — Create the Regulatory Bridge to Security Review

This is not a full legal or regulatory audit. It is a **flagging stage** for deeper downstream assessment.

### Check
The reviewer should explicitly label visible indicators that require **Security Stage 1 — Security Scope, Trust Boundaries & Obligations** follow-up, including:
- [ ] data residency / localization implications
- [ ] consent-sensitive processing
- [ ] retention / deletion obligations
- [ ] cross-border transfer implications
- [ ] sensitive-category handling (health, financial, biometric, children’s data, employee data, etc.)

### Output rule
These should be reported as:
> **Flag for Security Stage 1 follow-up**

not as if Code Review has conclusively resolved the legal/security obligation itself.

---

## Step 9 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Code 9:** trust/compliance risks must shape release confidence directly
- **Security 1:** regulatory/trust-boundary implications, model-provider data exposure, consent and residency signals
- **Production 3:** telemetry/logging trust issues affecting operational evidence
- **Production 8:** retention/deletion/lifecycle concerns affecting durable storage and recovery

### Required handoff block
- **Carry-forward concerns:**
  - Sensitive-data exposure:
  - Overcollection/overreturn risk:
  - Consent/control realism:
  - Retention/deletion concern:
  - Third-party / model-provider disclosure:
  - Security Stage 1 follow-up flags:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny on prompts/context sent to model providers, generated privacy claims, and hidden telemetry
- **credentials lens:** emphasize secret-adjacent leakage, retention, and external disclosure paths
- **bug-hunt lens:** emphasize privacy bugs hidden in serializers, logs, and convenience responses
- **platform lens:** emphasize region/runtime-dependent data handling and environment-specific logging behavior

---

## Severity / Gating Model

### PASS
Use PASS when:
- data handling appears proportionate and controlled for project maturity
- major trust-relevant claims are supported by implementation
- no major privacy/compliance signal failures are visible in code behavior

### NEEDS_WORK
Use NEEDS_WORK when:
- data handling is mostly workable but includes meaningful overexposure, weak lifecycle controls, or disclosure gaps
- trust signals are inconsistent or under-implemented
- Security Stage 1 follow-up is clearly needed before broader confidence

### BLOCK
Use BLOCK when:
- sensitive data handling is materially unsafe
- code contradicts major privacy/trust/compliance claims
- hidden disclosure to third parties or model providers creates serious user-trust risk
- user-affecting trust failures are severe enough that shipping would be irresponsible

---

## Escalation Guidance

Escalate or explicitly flag when:
- the code materially contradicts major privacy, consent, retention, or disclosure expectations
- users would likely be surprised by what data is being logged or sent externally
- LLM/model-provider sends involve sensitive context without strong justification/disclosure
- visible regulatory implications are present but unacknowledged → Security Stage 1

If trust failure is serious enough that release would be irresponsible even before deeper Security Review, use **BLOCK**.

---

## Required Report Format

### 1. Sensitive-Data Handling Summary
- Sensitive data identified:
- Main trust-relevant flows:
- Overall handling confidence:

### 2. Data Minimization / Overexposure Findings
- Over-collected fields:
- Over-returned data:
- Convenience-driven exposure concerns:

### 3. Consent / Lifecycle / Deletion Findings
- Consent behavior realism:
- Token/session lifecycle findings:
- Retention/deletion concerns:

### 4. Third-Party Disclosure Findings
- External services receiving data:
- Model-provider data flows:
- Unexpected disclosure risks:

### 5. Trust-Signal Contradictions
- Claims supported by code:
- Claims contradicted by code:
- Comments/docs overstating safety:

### 6. Security Stage 1 Follow-Up Flags
- Data residency/localization:
- Consent-sensitive processing:
- Retention/deletion obligations:
- Cross-border transfer implications:
- Sensitive-category handling:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- treat trust language as evidence without checking code paths
- ignore logs/serializers because the app “mostly works”
- assume an opt-out or delete feature is real because the endpoint exists
- treat model-provider calls as ordinary implementation detail rather than a trust boundary
- turn this stage into a vague legal essay disconnected from code evidence

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what sensitive and trust-relevant data this code handles, its collection/storage/logging/disclosure behavior is broadly proportionate and honest, and any meaningful regulatory or privacy implications have been surfaced clearly enough for downstream security and release judgment.

If that statement cannot be made honestly, this stage should not pass.

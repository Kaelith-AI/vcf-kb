---
type: review-stage
review_type: security
stage: 6
stage_name: "Secrets Config Identity Key Management"
version: 1.0
updated: 2026-04-18
---
# Security Stage 6 — Secrets, Config, Identity & Key Management

## Stage Metadata
- **Review type:** Security
- **Stage number:** 6
- **Stage name:** Secrets, Config, Identity & Key Management
- **Purpose in review flow:** Verify that credentials, sensitive configuration, identity controls, and keys are handled in a way that limits exposure and supports rotation, revocation, and least privilege
- **Default weight:** Highest practical scrutiny area for many projects
- **Required reviewer posture:** Highly skeptical, exposure-focused, intolerant of demo-convenience shortcuts in production paths
- **Lens interaction:** All lenses may sharpen specific secret or identity risks, but no lens may relax least-privilege, exposure, or rotation expectations
- **Depends on:** Security Stage 1 asset/trust-boundary map, Security Stage 3 auth boundary findings, Security Stage 4 secure-coding findings, and Code Stage 8 sensitive-data handling context where relevant
- **Feeds into:** Security Stage 9, Production Stages 5, 8, and 9
- **Security/Production handoff:** Carry forward secret exposure, identity-scope weaknesses, revocation/rotation brittleness, and deploy-time credential risks that affect release and recovery posture

---

## Why This Stage Exists

This is one of the most failure-prone areas in AI-generated systems.

Vibe-coded projects routinely:
- hardcode keys to make demos work
- leak secrets into logs or examples
- treat admin-scoped credentials as general-purpose convenience tokens
- blur dev/prod config boundaries
- skip revocation and rotation thinking entirely
- assume auth-related comments are enough to explain identity posture

A project should be assumed unsafe here until evidence proves otherwise.

This stage asks:

> Are secrets, identity-bearing values, and sensitive configuration actually contained in a way that supports least privilege, safe operation, and emergency response?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether secrets are present anywhere they should not be
2. Whether configuration is loaded and validated safely across environments
3. Whether credentials and identities are scoped narrowly enough
4. Whether keys/tokens can be rotated or revoked without chaos
5. Whether auth-related comments and assumptions are supported by real controls

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Secret exposure summary**
2. **Config/environment safety findings**
3. **Logging/transport hygiene findings**
4. **Identity scope and key-management findings**
5. **Rotation/revocation readiness findings**
6. **Model-provider credential/control findings**
7. **Carry-forward auth/credential risks**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- source files for hardcoded keys/tokens/passwords
- `.env.example`, config templates, `.gitignore`, and local setup docs
- logging statements and debug output
- CI/CD config and secret injection patterns
- auth/session/token middleware
- key/credential usage in service-to-service or third-party flows
- comments/docs about temporary secrets, local overrides, or auth assumptions

---

## Core Review Rule

Do not treat externalized configuration as automatically safe.

A project does **not** get credit because:
- secrets are in environment variables somewhere
- there is a `.env.example`
- auth tokens exist
- the app “only uses this admin key in development”
- comments say secret handling will be cleaned up later

The reviewer must check where secrets actually appear, how identities are scoped, and whether the system could survive rotation, revocation, or incident response without breaking down.

---

# Review Procedure

## Step 1 — Review Hardcoded Secret Exposure

Determine whether secrets appear directly in source or adjacent artifacts.

### Check
- [ ] No obvious secrets, passwords, keys, or tokens are hardcoded in source
- [ ] Test fixtures/examples do not contain real-looking secrets without clear harmlessness
- [ ] Comments do not leak sensitive values or operational shortcuts
- [ ] Reviewer notes when git-history scanning should be required because indicators of past leakage exist

### Example — Incorrect
```python
DB_PASSWORD = "hunter2"
```
Why it fails:
- secret exposure is direct
- rotation and containment posture are poor

### Example — Better
```python
DB_PASSWORD = os.environ.get("DB_PASSWORD")
if not DB_PASSWORD:
    raise RuntimeError("DB_PASSWORD not set")
```
Why it passes:
- secret source is externalized
- missing config fails clearly

---

## Step 2 — Review Environment & Config Safety

Determine whether sensitive configuration is loaded and validated safely.

### Check
- [ ] Sensitive configuration loads from appropriate environment or secret sources
- [ ] Missing critical config fails clearly rather than degrading insecurely
- [ ] `.env` patterns do not blur template/example files with real secrets
- [ ] Dev/prod branching does not silently disable important controls
- [ ] Environment-specific differences are explicit enough to review

### Common failure patterns
- `.env.example` contains real or semi-real secrets
- production security depends on fragile environment branching
- missing config falls back to unsafe defaults
- local override path accidentally survives into shared deployment flows

---

## Step 3 — Review Logging & Secret Transport Hygiene

Determine whether sensitive values leak through runtime handling.

### Check
- [ ] Secrets are not logged directly or indirectly via full config/request dumps
- [ ] Sensitive values are not passed via insecure channels like URLs or process args without strong reason
- [ ] Error handling does not expose auth headers, tokens, or private material
- [ ] Debug tooling does not quietly expand secret exposure

### Example — Incorrect
```javascript
logger.debug('Full request headers', req.headers)
```
Why it fails:
- may leak auth headers or cookies

### Example — Better
```javascript
logger.info('Request received', { method: req.method, path: req.path, userId: req.user?.id })
```
Why it passes:
- preserves operator signal without obvious secret leakage

---

## Step 4 — Review Identity Scope & Credential Blast Radius

Determine whether identities and credentials are narrower than the harm they could cause.

### Check
- [ ] Service credentials are not obviously over-privileged
- [ ] Auth/session identity is verified at the right boundary and cadence
- [ ] Multi-tenant or multi-user identity context is not reused unsafely across requests/tasks
- [ ] Static shared credentials are flagged where short-lived scoped credentials should exist
- [ ] One identity or token is not reused across unrelated trust domains without reason

### Reviewer questions
- If this credential leaked, what could it do?
- Is the system using admin-grade credentials for ordinary behavior?
- Could one tenant/request/user inherit another’s identity context accidentally?

---

## Step 5 — Review Key Lifecycle Management

Determine whether rotation and revocation are possible in reality, not just in theory.

### Check
- [ ] Rotation and revocation appear possible, even if manual
- [ ] Expiry/lifetime boundaries exist where relevant
- [ ] Reviewer flags credential practices that would make emergency response brittle
- [ ] Long-lived credentials are justified where shorter-lived ones are impractical

### Common failure patterns
- one long-lived secret reused everywhere
- tokens with no expiration or revocation story
- no clear way to rotate service credentials without broad outage risk

---

## Step 6 — Review Auth / Identity Comments as Evidence

Identity-related comments may explain intent, but they do not prove safety.

### Check
- [ ] “Temporary” secret shortcuts are treated as debt, not permission slips
- [ ] Comments about safe local-only usage are challenged if code paths can escape local scope
- [ ] Reviewer carries forward unresolved identity or key-management risk explicitly
- [ ] Auth-related comments are checked against real middleware and execution behavior

### Example — Incorrect
```python
# temporary admin token for local testing only
ADMIN_TOKEN = "abc123"
```
Why it fails:
- shortcut is structurally unsafe whether or not the comment sounds temporary

---

## Step 7 — Review Model Provider Credentials & Data-in-Transit Control

This step is required for AI-enabled systems.

### Check
- [ ] Model-provider API keys are scoped to least privilege and segregated by environment/project where feasible
- [ ] Provider credentials are not reused broadly across unrelated systems without clear justification
- [ ] Requests to model providers use secure transport and avoid leaking sensitive payloads through logs/proxies/debug traces
- [ ] Reviewer identifies whether provider-bound data controls (redaction/minimization policies, routing controls, residency constraints) are visible and effective

### Common failure patterns
- one provider key shared across many unrelated systems and environments
- provider requests logged in full with prompt payloads and auth headers
- sensitive prompts routed externally without clear minimization or control

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 9:** unresolved secret exposure, identity scope, or key-management risks affecting release posture
- **Production 5:** deploy-time secret injection and runtime config risks
- **Production 8:** recovery/rotation/revocation brittleness affecting incident response and restoration
- **Production 9:** credential blast-radius concerns affecting go/no-go decisions

### Required handoff block
- **Carry-forward concerns:**
  - Hardcoded or leaked secret risk:
  - Config safety and environment drift:
  - Logging/transport exposure risk:
  - Identity scope / over-privilege risk:
  - Rotation/revocation brittleness:
  - Model-provider credential/control risk:

---

## Lens Interaction Guidance

Examples:
- **credentials lens:** primary intensifier here; emphasize leakage, scope, blast radius, and rotation realism
- **llm-focused lens:** emphasize provider credentials, prompt transport, and external model-bound data controls
- **bug-hunt lens:** emphasize hidden secret leakage through logs, errors, and helper code
- **platform lens:** emphasize environment-specific config drift and deploy-time secret injection safety

---

## Severity / Gating Model

### PASS
Use PASS when:
- secret/config/identity handling is controlled enough for the project’s maturity
- no obvious credential-catastrophe paths remain
- reviewer can explain why secrets and identity-bearing material are reasonably contained

### NEEDS_WORK
Use NEEDS_WORK when:
- major secret-handling basics exist but important gaps remain
- credential scope, rotation, or config safety are weaker than they should be
- risks are real but bounded and fixable before release

### BLOCK
Use BLOCK when:
- secrets are exposed directly in source, logs, or runtime behavior
- identity/credential handling is materially unsafe
- key/config posture would make secure deployment irresponsible
- emergency response would be implausibly brittle because credential practices are too weak

---

## Escalation Guidance

Escalate or explicitly flag when:
- hardcoded secrets or leaked auth material are found
- credentials appear much broader than the system’s actual needs
- token/session/key lifetime posture would make revocation chaotic
- model-provider credentials or prompt transport controls are weaker than the project’s trust obligations require

If credential handling would make secure deployment or safe incident response unrealistic, use **BLOCK**.

---

## Required Report Format

### 1. Secret Exposure Summary
- Hardcoded or embedded secret findings:
- Example/template leakage concerns:
- Exposure confidence:

### 2. Config / Environment Safety Findings
- Secret loading model:
- Unsafe defaults or branching:
- Environment drift concerns:

### 3. Logging / Transport Hygiene Findings
- Logging leakage concerns:
- Token/header/url/process-arg exposure:
- Debug-path expansion risk:

### 4. Identity Scope & Key-Management Findings
- Credential privilege scope:
- Tenant/request identity isolation:
- Identity-boundary concerns:

### 5. Rotation / Revocation Readiness Findings
- Expiry/lifetime posture:
- Rotation realism:
- Incident-response brittleness:

### 6. Model-Provider Credential / Control Findings
- Provider credential segregation:
- Prompt/data transport exposure concerns:
- Residency/minimization/control notes:

### 7. Carry-Forward Auth / Credential Risks
- Blocking risks:
- Bounded risks:
- Recovery/response implications:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- assume environment variables automatically solve secret hygiene
- ignore logs, templates, and examples while looking only for obvious constants
- treat broad credentials as acceptable because they are operationally convenient
- accept “temporary” secret shortcuts without bounding and follow-up
- forget that rotation/revocation realism matters as much as initial containment

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand where the system’s secrets and identity-bearing values live, they are not obviously exposed or over-scoped, and the project could realistically rotate, revoke, and contain them without collapsing under incident pressure.

If that statement cannot be made honestly, this stage should not pass.

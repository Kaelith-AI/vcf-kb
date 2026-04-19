---
type: review-stage
review_type: security
stage: 1
stage_name: "Security Scope Trust Boundaries Obligations"
version: 1.0
updated: 2026-04-18
---
# Security Stage 1 — Security Scope, Trust Boundaries & Obligations

## Stage Metadata
- **Review type:** Security
- **Stage number:** 1
- **Stage name:** Security Scope, Trust Boundaries & Obligations
- **Purpose in review flow:** Define what must be protected, where trust begins and ends, and what obligations apply before deeper security review starts
- **Default weight:** Highest importance within Security review
- **Required reviewer posture:** Boundary-mapping, assumption-challenging, explicit about uncertainty
- **Lens interaction:** All lenses may intensify certain trust boundaries or obligation areas, but no lens may bypass explicit scope establishment
- **Depends on:** Code Stage 8 trust/compliance/data-handling findings when available; Stage 1 may still run independently if Code Review has not been completed
- **Feeds into:** All later Security stages, especially Security 2 and Security 3; Production Stages 3 and 8 where trust boundaries affect telemetry, storage, and recovery
- **Security/Production handoff:** Carry forward identified assets, trust zones, actor classes, obligation signals, and explicit follow-up flags for later adversarial and operational review

---

## Why This Stage Exists

Security review fails when the reviewer does not know what the system is actually protecting.

Before evaluating threat models, secure coding, supply chain, infrastructure, or release posture, the reviewer must establish:
- what assets and data types exist
- what actors and systems interact with them
- where trust boundaries are crossed
- what obligations appear to apply
- what assumptions and invariants the system is quietly relying on

If those things are unclear, later security stages become guesswork.

This is especially important for vibe-coded projects because they often have **implicit security scope**. Common patterns include:
- sensitive data handled without being inventoried
- model providers used without being treated as external trust boundaries
- prompts, logs, env vars, and webhooks quietly becoming security-sensitive surfaces
- compliance-sensitive behavior postponed rather than modeled
- comments describing a trust model that was never fully implemented

This stage forces the project to name what it actually touches and who it actually trusts.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What important assets, data types, and sensitive actions exist
2. What actors and systems interact with the project
3. Where the trust boundaries are
4. What security/privacy/compliance obligations are visible from the system’s behavior
5. What assumptions and invariants later security review will rely on

If the reviewer cannot explain what must be protected and where trust begins and ends, this stage should not pass.

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Security scope summary**
2. **Asset/data inventory summary**
3. **Trust boundary summary**
4. **Actor/privilege summary**
5. **Obligation/compliance signal summary**
6. **Assumption and invariant findings**
7. **Security Stage 1 follow-up flags for later stages**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

### Receives from Code Review
If Code Review has already been run, use **Code Stage 8** as explicit intake context:
- data types and sensitive-data flows flagged by Code Stage 8
- regulatory signals flagged for follow-up (residency, consent, retention, cross-border transfer, sensitive categories)
- user-trust concerns surfaced in code behavior (disclosure gaps, telemetry surprises, weak consent enforcement)

### Inspect direct evidence
Inspect at minimum:
- README, architecture docs, security notes, privacy notes
- route definitions, CLI interfaces, webhook handlers, file inputs, job runners
- config and env templates
- data models, storage layers, session/token handling
- third-party integration code
- comments/docs describing security assumptions or constraints

---

## Core Review Rule

Do not start by asking whether the system is secure.
Start by asking:

> What are the assets, trust boundaries, and obligations that security review is actually about?

A project does **not** get scope clarity credit because:
- it says “we take security seriously”
- it has an `auth/` folder
- it uses a model provider behind a generic “AI feature” label
- it stores logs without classifying what may appear in them
- it says “handles user data” with no further precision

The reviewer must make the system’s trust model explicit enough that later stages can test it.

---

# Review Procedure

## Step 1 — Build the Asset & Data Inventory

Identify what needs protection.

### Check
- [ ] Sensitive assets are identifiable (PII, credentials, tokens, prompts, logs, config, model context, files, internal state)
- [ ] Storage locations are identifiable (DB, cache, disk, memory, external service)
- [ ] External integrations are enumerated
- [ ] Entry points are identifiable and bounded
- [ ] Sensitive actions are recognizable as distinct from ordinary app behavior

### Reviewer questions
- What data or capabilities would create harm if exposed, modified, or misused?
- Where does that data live?
- Which actions are privileged, destructive, or trust-sensitive?

### Common failure patterns
- prompts treated as harmless text when they contain user or internal context
- logs treated as operational detail when they may contain secrets or PII
- file uploads/downloads not considered part of the sensitive surface
- tokens/sessions/config treated as plumbing rather than assets

---

## Step 2 — Map Actors, Roles & Privilege Levels

Identify who interacts with the system and with what authority.

### Check
- [ ] Major actor classes are distinguishable
- [ ] Anonymous, authenticated, privileged, operator, and external-system roles are not collapsed together
- [ ] Model providers and AI services are treated as explicit external actors where applicable
- [ ] Human users, agents, tools, webhooks, and background workers are separated where they have different trust levels

### Reviewer questions
- Who can send input into the system?
- Who can invoke sensitive actions?
- Which actors are partially trusted, not fully trusted?
- Are any actors implicitly trusted without justification?

### Common failure patterns
- “user” treated as one class despite major privilege differences
- operators/admins and automation jobs sharing the same capabilities without distinction
- model output treated as if it came from a trusted internal actor

---

## Step 3 — Map Trust Boundaries Explicitly

This is the heart of the stage.

### Check
- [ ] Major trust zones are identifiable
- [ ] Boundary crossings (network, file, subprocess, model call, webhook, tool call, external API, queue) are named explicitly
- [ ] Reviewer can describe which side of each boundary is trusted, semi-trusted, or untrusted
- [ ] Trust is not granted implicitly where mediation or validation is required

### Important rule
Model providers and agent/tool boundaries are first-class trust boundaries where applicable.

### Example — Incorrect
```python
result = run_agent(user_message)
execute_tool(result["tool"], result["args"])
```
Why it fails:
- model output crosses directly into tool execution
- trust boundary is real but unmodeled

### Example — Better
```python
result = run_agent(user_message)
tool_call = validate_tool_call(result)
if tool_call.tool not in ALLOWED_TOOLS:
    raise PermissionError("Tool not permitted")
execute_tool(tool_call.tool, tool_call.args)
```
Why it passes:
- trust boundary is explicit
- mediation exists

---

## Step 4 — Identify Security Assumptions & Invariants

Determine what the system is relying on to stay safe.

### Check
- [ ] Key trust assumptions are explicit enough to review
- [ ] Core invariants are identifiable (for example: untrusted input must not reach shell execution directly)
- [ ] Assumptions are not hidden only in comments, naming, or author memory
- [ ] Reviewer challenges assumptions unsupported by implementation reality

### Reviewer questions
- What must always remain true for this system to stay safe?
- What does the design appear to assume about users, operators, providers, or inputs?
- Are those assumptions enforced, or merely hoped for?

### Common failure patterns
- assumes internal endpoints are unreachable without proving network isolation
- assumes model output will be benign or well-formed
- assumes only trusted operators can trigger a privileged path that is actually broadly reachable

---

## Step 5 — Identify Obligations & Regulatory Signals

This stage is not a legal ruling. It is an obligation-visibility stage.

### Check
- [ ] Applicable privacy/security obligations are identified where visible
- [ ] Data residency, retention, consent, or audit expectations are noted if relevant
- [ ] Logging/traceability obligations are surfaced when the system handles sensitive actions/data
- [ ] Reviewer distinguishes code-level evidence from legal certainty

### Important rule
The reviewer should surface obligation signals strongly enough that later Security and Production review cannot miss them, even if exact legal scope is not fully resolved here.

---

## Step 6 — Review Model Provider Data Handling Scope

This is mandatory for AI-enabled systems.

### Check
- [ ] Reviewer identifies which model providers receive project data
- [ ] Data types sent to providers are classified (user content, metadata, PII/sensitive fields, internal context, logs)
- [ ] Provider-retention and processing assumptions are identified where visible
- [ ] Data residency/jurisdiction implications of provider use are surfaced
- [ ] Provider ToS/policy compatibility concerns are flagged when project obligations appear stricter than provider defaults

### Common failure patterns
- prompt context containing sensitive user data sent externally without being named as a trust boundary
- provider treated as an implementation detail rather than a third-party trust dependency
- no distinction between local model use and external-hosted provider use

---

## Step 7 — Review Security Comments / Docs as Evidence

Security comments may help explain intent, but they do not establish scope truth by themselves.

### Check
- [ ] Security comments are treated as evidence, not proof
- [ ] Comments that downplay risk without visible controls are challenged
- [ ] Missing or stale assumption docs are surfaced as security risk
- [ ] Reviewer records when comments imply a trust model that the code/system does not clearly support

### Example — Incorrect
```js
// Internal-only endpoint
app.post('/internal/reindex', handler)
```
with no actual auth or network gating.

Why it fails:
- comment claims a trust boundary
- no evidence that the boundary is real

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 2:** attacker model, trust-boundary map, and high-value asset inventory
- **Security 3:** boundary claims that must be tested for real enforcement
- **Security 4:** sensitive-code-path and invariant context for secure-coding review
- **Security 5:** third-party/provider trust assumptions and external dependency surfaces
- **Production 3 / 8:** telemetry, retention, storage, and recovery concerns shaped by trust boundaries

### Required handoff block
- **Carry-forward concerns:**
  - High-value assets:
  - Major trust boundaries:
  - Actor/privilege concerns:
  - Obligation/regulatory signals:
  - Model-provider trust boundary:
  - Assumptions requiring later verification:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny of model providers, prompt/context handling, agent/tool boundaries, and externalized reasoning surfaces
- **credentials lens:** emphasize secrets, key material, tokens, and config exposure as core assets
- **bug-hunt lens:** emphasize scope blind spots likely to hide serious security failure modes
- **platform lens:** emphasize environment-specific trust boundaries, file/system/process crossings, and host-level assumptions

---

## Severity / Gating Model

### PASS
Use PASS when:
- important assets, actors, and trust boundaries are identifiable
- obligations are visible enough for deeper security review to proceed
- security assumptions are explicit enough to test in later stages

### NEEDS_WORK
Use NEEDS_WORK when:
- scope and trust model are partially visible but incomplete
- obligations are plausible but under-documented
- key assumptions exist but need clearer evidence and boundary definition

### BLOCK
Use BLOCK when:
- security scope is too unclear to support meaningful review
- major trust boundaries are unmodeled
- sensitive assets or actor classes are so poorly defined that downstream stages would be misleading
- later security review would mostly be guesswork because scope truth is missing

---

## Escalation Guidance

Escalate or explicitly flag when:
- model-provider use is treated casually despite sensitive data involvement
- trust boundaries are implied but not described anywhere explicit
- Code Stage 8 surfaced major trust/regulatory signals that remain unresolved here
- later stages would inherit fake confidence because asset scope or actor trust is underspecified

If the reviewer cannot state clearly what the system is protecting and who it trusts, use **BLOCK** rather than proceeding with a vague security narrative.

---

## Required Report Format

### 1. Security Scope Summary
- System purpose in security terms:
- Highest-value assets:
- Main entry points:

### 2. Asset / Data Inventory Summary
- Sensitive data types:
- Storage locations:
- Sensitive actions:

### 3. Trust Boundary Summary
- Major trust zones:
- Boundary crossings:
- Untrusted / semi-trusted / trusted distinctions:

### 4. Actor / Privilege Summary
- Actor classes:
- Privilege tiers:
- Implicit-trust concerns:

### 5. Obligation / Compliance Signal Summary
- Privacy/security obligation signals:
- Residency/retention/consent/audit implications:
- Confidence in scope clarity:

### 6. Assumption & Invariant Findings
- Key assumptions:
- Core invariants:
- Weak or unsupported assumptions:

### 7. Security Stage 1 Follow-Up Flags
- Model-provider data handling:
- Trust-boundary follow-up:
- Regulatory/obligation follow-up:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- start threat modeling before naming what is actually in scope
- treat “user data” as an adequate asset classification
- ignore model/provider/tool boundaries because they feel application-specific
- let comments or policy language substitute for a trust-boundary map
- proceed casually when the system’s sensitive surfaces are still fuzzy

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what this system must protect, who and what interacts with it, where its trust boundaries are, what obligations appear to apply, and what assumptions later security review will rely on.

If that statement cannot be made honestly, this stage should not pass.

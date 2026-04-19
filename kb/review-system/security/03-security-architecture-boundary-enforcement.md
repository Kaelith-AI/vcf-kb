---
type: review-stage
review_type: security
stage: 3
stage_name: "Security Architecture Boundary Enforcement"
version: 1.0
updated: 2026-04-18
---
# Security Stage 3 — Security Architecture & Boundary Enforcement

## Stage Metadata
- **Review type:** Security
- **Stage number:** 3
- **Stage name:** Security Architecture & Boundary Enforcement
- **Purpose in review flow:** Verify that the system’s security-relevant architecture actually enforces the trust model and threat mitigations identified earlier
- **Default weight:** High
- **Required reviewer posture:** Enforcement-focused, adversarial, skeptical of diagram-only security claims
- **Lens interaction:** Lenses may intensify specific boundary concerns, but all reviews must verify enforcement on real execution paths
- **Depends on:** Security Stage 1 trust-boundary map, Security Stage 2 abuse-path findings, and Code Stage 2 architectural coherence findings where available
- **Feeds into:** Security Stage 4, Security Stage 9, Production Stage 2, and Production Stage 9
- **Security/Production handoff:** Carry forward boundary weaknesses, auth/authz enforcement gaps, tool/agent containment failures, and deployment-boundary contradictions for later implementation and release review

---

## Why This Stage Exists

A system can have security-shaped architecture without real security enforcement.

This stage exists because many projects — especially vibe-coded ones — contain things like:
- auth modules that exist but are not wired into real paths
- admin/user separation claimed but not enforced everywhere
- tool permissions described but not validated
- segmentation visible in diagrams but absent in runtime behavior
- comments describing safe boundaries while code quietly bypasses them

This stage asks:

> Are the claimed security boundaries real in implementation, or are they mostly narrative?

This is where security design must become real enforcement.

### Boundary clarification
- **Code Stage 2** establishes whether architectural boundaries exist and are coherent.
- **Security Stage 3** verifies whether those boundaries are enforced under adversarial conditions.

A project can pass Code Stage 2 and still fail here if its boundaries are structurally weak against attack.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the claimed security boundaries are real in implementation
2. Whether privileged actions are actually gated by authentication, authorization, and scope checks
3. Whether trust zones are isolated enough to limit abuse
4. Whether sensitive integrations and data flows are mediated rather than directly exposed
5. Whether security design comments/docs reflect real enforcement rather than aspirational architecture

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Security architecture summary**
2. **Authn/authz enforcement findings**
3. **Boundary-enforcement findings**
4. **Tool/agent/data boundary findings**
5. **Diagram/comment vs implementation contradictions**
6. **Bypass/fallback risk findings**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- authn/authz middleware, decorators, guards, policy checks
- route and handler wiring for privileged endpoints/actions
- tool invocation paths and permission checks
- model/provider integration boundaries
- config and secret access boundaries
- network/service boundary code where visible
- architecture/security docs and comments describing intended controls

---

## Core Review Rule

Do not reward a project for describing strong boundaries.
Reward it only for **enforcing** them.

A system does **not** get boundary-enforcement credit because:
- there is an `auth/` package
- there is a role enum
- comments say an endpoint is internal-only
- docs describe admin-only flows
- a tool policy exists in prose but not in the live execution path

The reviewer must verify that real requests, actions, agent outputs, and integration calls actually hit those controls.

---

# Review Procedure

## Step 1 — Review Authentication & Authorization Enforcement

Determine whether privileged behavior is really gated.

### Check
- [ ] Authentication mechanism is real and consistently applied where needed
- [ ] Authorization checks exist for privileged actions, not just authentication presence
- [ ] Default posture is deny-with-explicit-grant rather than allow-with-restrictions layered later
- [ ] Role/scope boundaries are enforced on code paths that matter
- [ ] Missing or inconsistent checks are surfaced explicitly

### Example — Incorrect
```python
# auth.py verifies JWTs
@app.route('/admin/delete-user')
def delete_user():
    return do_delete()
```
Why it fails:
- auth exists somewhere, but the privileged path is not actually gated

### Example — Better
```python
@app.route('/admin/delete-user')
@require_auth
@require_scope('admin:users:delete')
def delete_user():
    return do_delete()
```
Why it passes:
- privileged action is bound to explicit authn/authz controls

---

## Step 2 — Review Boundary Reality vs Documentation

Determine whether the trust zones claimed by docs/comments are materially true.

### Check
- [ ] Security architecture claims in docs/comments match implementation reality
- [ ] Claimed trust zones are reflected in actual code/config boundaries
- [ ] Reviewer identifies diagram-only or comment-only boundaries with no enforcement
- [ ] “Protected”, “internal”, or “admin-only” paths are tested against actual gating logic

### Common failure patterns
- diagram shows a private service boundary, but public code path reaches it directly
- “internal-only” endpoint exposed without real network or auth restriction
- trust-zone separation described in docs but bypassed in convenience paths

---

## Step 3 — Review Tool / Agent / Action Containment

This is especially important for AI-native systems.

### Check
- [ ] Tool calls are allowlisted, validated, or scoped appropriately
- [ ] Agent/sub-agent actions do not silently inherit excessive authority
- [ ] Sensitive actions require explicit gating, not just caller goodwill
- [ ] Untrusted outputs do not cross into privileged actions without mediation

### Example — Incorrect
```python
execute_tool(request.json['tool'], request.json['args'])
```
Why it fails:
- caller chooses arbitrary action boundary with no mediation

### Example — Better
```python
tool = validate_tool_name(request.json['tool'])
if tool not in USER_ALLOWED_TOOLS:
    raise PermissionError('tool not allowed')
execute_tool(tool, validate_args(tool, request.json['args']))
```
Why it passes:
- tool boundary is explicit and enforced

---

## Step 4 — Review Data & Integration Boundary Enforcement

Determine whether sensitive data and external integrations are mediated appropriately.

### Check
- [ ] Sensitive data paths are separated or mediated appropriately
- [ ] External integrations do not receive more privilege/data than required
- [ ] Secrets/config access is bounded and not broadly exposed to unrelated code paths
- [ ] Unsafe direct crossing between trust zones is identified

### Reviewer questions
- Are integrations acting as bounded adapters, or as broad trust tunnels?
- Can sensitive data move from untrusted to privileged zones without strong mediation?
- Are config/secrets reachable by more code than necessary?

---

## Step 5 — Review Fallbacks, Bypasses & Weak Links

This step catches the holes that often matter most.

### Check
- [ ] Debug, bypass, fallback, or admin shortcut paths are identified and assessed
- [ ] Temporary exceptions do not silently become permanent boundary holes
- [ ] Error paths do not accidentally bypass security checks
- [ ] Reviewer challenges design comments that justify weak boundaries without strong containment

### Common failure patterns
- maintenance path bypasses auth because it is “internal only”
- debug route or seed/admin helper remains reachable in deployed code
- fallback path skips the more restrictive permission check used on the primary path

---

## Step 6 — Review Security Comments / Risk Notes as Evidence

Security comments may explain intended design, but they do not prove enforcement.

### Check
- [ ] Comments describing protection are verified against live code paths
- [ ] Boundary comments contradicted by implementation are recorded explicitly
- [ ] Reviewer distinguishes between helpful rationale and false safety language

### Example — Incorrect
```js
// internal-only endpoint
app.post('/internal/reindex', handler)
```
with no actual auth or network gating.

Why it fails:
- comment claims protection
- implementation does not enforce it

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 4:** code-level exploit paths enabled by weak boundary enforcement
- **Security 9:** unresolved auth/authz and containment risks affecting release posture
- **Production 2:** deployment/state-boundary contradictions
- **Production 9:** residual trust-zone weakness affecting go/no-go decisions

### Required handoff block
- **Carry-forward concerns:**
  - Authn/authz enforcement gaps:
  - Phantom or weak boundaries:
  - Tool/agent containment risk:
  - Data/integration mediation risk:
  - Bypass/fallback concerns:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny on tool/agent containment, provider boundaries, and model-mediated privilege crossing
- **credentials lens:** emphasize secrets/config access boundaries and privileged action gating
- **bug-hunt lens:** emphasize bypasses and inconsistent enforcement between similar paths
- **platform lens:** emphasize host/runtime/network assumptions masquerading as real isolation

---

## Severity / Gating Model

### PASS
Use PASS when:
- important security boundaries are real and visible in implementation
- privileged actions and trust-zone crossings are mediated appropriately
- reviewer can see clear enforcement rather than aspirational architecture language

### NEEDS_WORK
Use NEEDS_WORK when:
- most security architecture is directionally sound but has meaningful gaps or inconsistencies
- some trust-zone or privilege boundaries are weak, partial, or overly broad

### BLOCK
Use BLOCK when:
- critical security boundaries are not actually enforced
- privileged actions or sensitive data paths are easily reachable without proper gating
- architecture claims materially overstate real control enforcement
- later security review would inherit false confidence from phantom segmentation or orphaned auth

---

## Escalation Guidance

Escalate or explicitly flag when:
- auth exists but is missing from real privileged paths
- a claimed boundary exists only in docs, naming, or comments
- tool or agent flows can cross into privileged actions with weak mediation
- deployment/network assumptions are standing in for actual enforcement

If the system’s security boundaries are mostly narrative rather than enforced, use **BLOCK**.

---

## Required Report Format

### 1. Security Architecture Summary
- Claimed trust zones:
- Observed enforcement shape:
- Highest-risk boundaries:

### 2. Authn / Authz Enforcement Findings
- Authentication coverage:
- Authorization granularity:
- Default-deny vs default-allow posture:

### 3. Boundary-Enforcement Findings
- Real enforced boundaries:
- Weak or cosmetic boundaries:
- Diagram/comment-only protections:

### 4. Tool / Agent / Data Boundary Findings
- Tool containment:
- Agent/sub-agent authority boundaries:
- Sensitive data / integration mediation:

### 5. Diagram / Comment vs Implementation Contradictions
- Matching claims:
- Contradicted claims:
- False confidence risks:

### 6. Bypass / Fallback Risk Findings
- Debug or maintenance bypasses:
- Error-path enforcement gaps:
- Temporary-exception debt:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- reward boundary diagrams without verifying live-path enforcement
- confuse authentication presence with authorization sufficiency
- assume internal-only labels create real isolation
- ignore convenience or debug paths because the main path looks secure
- collapse this stage into generic secure-coding review before confirming boundary enforcement

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I can identify the system’s real security boundaries, see that privileged actions and trust-zone crossings are actually mediated on live paths, and trust that its security architecture is enforced in code rather than merely described in docs or comments.

If that statement cannot be made honestly, this stage should not pass.

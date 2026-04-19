---
type: review-stage
review_type: security
stage: 4
stage_name: "Implementation Security Secure Coding Reality"
version: 1.0
updated: 2026-04-18
---
# Security Stage 4 — Implementation Security & Secure Coding Reality

## Stage Metadata
- **Review type:** Security
- **Stage number:** 4
- **Stage name:** Implementation Security & Secure Coding Reality
- **Purpose in review flow:** Verify that the code behaves securely in practice, rather than merely appearing security-aware or passing superficial scanner checks
- **Default weight:** High
- **Required reviewer posture:** Adversarial, code-path-focused, skeptical of security theater
- **Lens interaction:** Lenses may intensify certain exploit classes, but all reviews must evaluate secure behavior on real execution paths
- **Depends on:** Security Stage 2 abuse paths, Security Stage 3 boundary-enforcement findings, Code Stage 4 correctness/failure handling findings, and Code Stage 8 trust/data-handling findings where relevant
- **Feeds into:** Security Stage 9, Production Stages 6 and 9
- **Security/Production handoff:** Carry forward exploitability findings, secure-coding gaps, sensitive code-path risks, and information-leak or unsafe-state concerns that affect release posture and resilience

---

## Why This Stage Exists

Security-aware-looking code is not the same thing as secure code.

Vibe-coded systems often produce implementation that looks plausible in security terms while failing under adversarial use. Common patterns include:
- validation helpers that exist but are never called
- auth checks at outer entry points but not at resource boundaries
- string-built SQL or shell commands copied from weak examples
- weak or cargo-cult cryptography
- friendly but information-leaking errors
- comments claiming sanitization, safety, or known mitigations that the code does not actually implement

A scanner may catch some symptoms. This stage exists to answer the harder question:

> Does the implementation actually enforce secure behavior in context?

This is about security reality in source code and runtime behavior — not simply whether a SAST tool was run.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether untrusted inputs are validated and constrained before dangerous use
2. Whether injection, auth, crypto, deserialization, and state-handling risks are addressed with real secure patterns
3. Whether critical flows enforce authorization at the right granularity
4. Whether errors, state transitions, and resource handling avoid obvious security failure modes
5. Whether comments claiming secure behavior are actually supported by code evidence

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Secure coding summary**
2. **Input / injection findings**
3. **Authn/authz logic findings**
4. **Crypto / token / error-handling findings**
5. **State / file / resource safety findings**
6. **Comment/TODO contradictions in sensitive code**
7. **Key implementation-security risks**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- route handlers, controllers, request parsers, CLI/file/webhook ingress points
- DB query code, shell/process invocation, serialization/deserialization, template/rendering code
- auth middleware and resource access checks
- cryptographic calls and token/session handling logic
- error handlers and security-relevant logs
- file upload, file access, and path handling code
- tests for negative/adversarial behavior where present
- TODO/HACK-style comments in sensitive paths

---

## Core Review Rule

Do not reward security-shaped code.
Reward only code that would likely withstand hostile or malformed input on real paths.

A project does **not** get secure-coding credit because:
- it has validation helpers somewhere in the repo
- it imports crypto libraries
- it uses authentication middleware on some routes
- comments say sanitization or encryption happens
- a scanner report exists with green-looking output

The reviewer must verify whether the dangerous path is actually constrained before the dangerous action occurs.

---

# Review Procedure

## Step 1 — Review Input Validation & Trust Boundaries

Determine whether untrusted input is constrained before dangerous use.

### Check
- [ ] External inputs are validated for type, format, range, and size before dangerous use
- [ ] Validation occurs at the real trust boundary, not only in UI code
- [ ] Allowlisting/strict parsing is preferred over weak denylisting where relevant
- [ ] Data from downstream services, files, env vars, and model outputs is not trusted blindly
- [ ] Validation helpers are actually called on live execution paths

### Common failure patterns
- validation function exists but handler never calls it
- UI validation present, backend trusts incoming data anyway
- model/tool/provider outputs treated as inherently well-formed

---

## Step 2 — Review Injection Resistance & Output Safety

Determine whether untrusted data can reach dangerous interpreters unsafely.

### Check
- [ ] SQL/NoSQL queries do not assemble untrusted input unsafely
- [ ] Shell/process calls avoid interpolation of user-controlled data
- [ ] Templates/renderers encode output appropriately for context
- [ ] Deserialization/XML parsing uses safe patterns and defaults
- [ ] LLM prompt construction does not treat raw user input as trusted instruction where that would create security harm

### Example — Incorrect
```python
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```
Why it fails:
- untrusted input reaches query string directly

### Example — Better
```python
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```
Why it passes:
- query structure and data remain separated

---

## Step 3 — Review Authentication & Authorization Logic Correctness

Determine whether secure access decisions are made at the right granularity.

### Check
- [ ] Authentication is centralized and consistently enforced where required
- [ ] Authorization is checked at resource/action boundaries, not only at outer entry points
- [ ] IDOR-style ownership/resource-scope checks exist where relevant
- [ ] Session and token handling do not leave stale privilege after logout/role change where relevant
- [ ] Privilege escalation via parameter or path manipulation is not obvious in sensitive flows

### Example — Incorrect
```javascript
router.get('/document/:id', requireAuth, async (req, res) => {
  const doc = await Document.findById(req.params.id)
  res.json(doc)
})
```
Why it fails:
- authentication exists
- resource ownership is not checked

### Example — Better
```javascript
router.get('/document/:id', requireAuth, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, ownerId: req.user.id })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})
```
Why it passes:
- access is scoped to the authenticated user’s resource boundary

---

## Step 4 — Review Cryptographic Usage Quality

Determine whether cryptographic behavior is materially sound.

### Check
- [ ] Passwords use adaptive, modern hashing rather than weak general hashing
- [ ] Crypto uses established libraries and safe modes/defaults
- [ ] Security-sensitive randomness uses a CSPRNG
- [ ] Tokens and signatures specify acceptable algorithms rather than relying on unsafe defaults
- [ ] Key/IV/nonce handling is not obviously broken or reused unsafely

### Example — Incorrect
```javascript
const hash = crypto.createHash('md5').update(password).digest('hex')
```
Why it fails:
- weak general hash used for password storage

### Example — Better
```javascript
const hash = await bcrypt.hash(password, 12)
```
Why it passes:
- adaptive password hashing

---

## Step 5 — Review Error Handling & Information Leakage

Determine whether failures expose too much or hide too much.

### Check
- [ ] Error responses do not expose sensitive internals, stack traces, schema details, or secrets
- [ ] Auth-related errors do not create unnecessary account-enumeration signals
- [ ] Security-relevant failures are not silently swallowed
- [ ] Logging preserves useful signal without leaking secrets or sensitive data

### Example — Incorrect
```python
except Exception as e:
    return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500
```
Why it fails:
- leaks internal details to caller

### Example — Better
```python
except Exception:
    logger.error("Internal error", exc_info=True)
    return jsonify({"error": "Internal server error"}), 500
```
Why it passes:
- protects caller-facing surface while preserving operator signal

---

## Step 6 — Review State, Race Conditions & Resource Safety

Determine whether security-sensitive state transitions are stable under real conditions.

### Check
- [ ] Critical state changes do not appear vulnerable to obvious race or TOCTOU issues
- [ ] Shared mutable state is controlled in security-sensitive paths
- [ ] File access and upload handling avoid traversal and trust-of-extension-only mistakes
- [ ] Resource cleanup and lifecycle handling do not create avoidable security problems

### Example — Incorrect
```javascript
const filePath = path.join('/uploads', req.query.file)
res.sendFile(filePath)
```
Why it fails:
- user-controlled path may escape intended directory

### Example — Better
```javascript
const filename = path.basename(req.query.file)
const filePath = path.join('/uploads', filename)
if (!filePath.startsWith('/uploads/')) return res.status(400).send('Invalid')
res.sendFile(filePath)
```
Why it passes:
- path is constrained to intended boundary

---

## Step 7 — Review Security Comments / TODOs as Evidence

Comments may show awareness, but awareness is not secure behavior.

### Check
- [ ] Comments claiming sanitization, auth, or safety are verified against real code paths
- [ ] TODOs like “validate later” or “skip auth for now” are treated as active risk, not mitigation
- [ ] Reviewer calls out security-shaped code that is cosmetically protective only

### Example — Incorrect
```python
# TODO: sanitize this later
run_command(user_input)
```
Why it fails:
- comment acknowledges danger but leaves the path unsafe

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 9:** unresolved code-level exploitability and secure-coding debt affecting release posture
- **Production 6:** state, retry, concurrency, and failure behavior that affect resilience under attack or fault
- **Production 9:** remaining implementation-security risks that affect go/no-go decisions

### Required handoff block
- **Carry-forward concerns:**
  - Injection / unsafe interpreter risk:
  - Auth/resource-scope weaknesses:
  - Crypto/token misuse concerns:
  - Information leakage risk:
  - State/file/resource safety risk:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny of model-output trust, prompt construction, tool argument mediation, and provider-influenced code paths
- **credentials lens:** emphasize token/session handling, key usage, and secret leakage paths
- **bug-hunt lens:** emphasize exploitability hidden inside normal feature flows
- **platform lens:** emphasize file/process/runtime-specific secure-coding pitfalls

---

## Severity / Gating Model

### PASS
Use PASS when:
- secure coding properties are materially visible in the implementation
- no obvious high-severity exploitable code-level issues remain in critical flows
- reviewer can explain why secure behavior is enforced by code, not just implied by comments or tools

### NEEDS_WORK
Use NEEDS_WORK when:
- major secure coding patterns are directionally present but important gaps remain
- issues are meaningful but bounded enough to remediate before release
- code security quality is uneven across critical paths

### BLOCK
Use BLOCK when:
- critical injection, auth, crypto, or information-leak issues are present
- implementation contradictions make major security claims untrustworthy
- obvious exploitable secure-coding failures remain in sensitive paths
- later release/security confidence would depend on security theater rather than secure behavior

---

## Escalation Guidance

Escalate or explicitly flag when:
- auth exists but resource-level authorization is weak
- validation or sanitization exists cosmetically but not on real paths
- crypto choices appear copied rather than understood
- state and file handling create obvious exploit paths or safety failures

If critical sensitive paths remain obviously exploitable, use **BLOCK**.

---

## Required Report Format

### 1. Secure Coding Summary
- Security-critical paths reviewed:
- Overall code-level security posture:
- Highest-risk implementation concerns:

### 2. Input / Injection Findings
- Validation quality:
- Injection surfaces:
- Output-encoding / parsing concerns:

### 3. Authn / Authz Logic Findings
- Authentication behavior:
- Resource/action authorization quality:
- Escalation / IDOR-style risks:

### 4. Crypto / Token / Error-Handling Findings
- Password/token handling:
- Crypto usage quality:
- Information-leak concerns:

### 5. State / File / Resource Safety Findings
- Race / state-transition concerns:
- File handling concerns:
- Cleanup / lifecycle concerns:

### 6. Comment / TODO Contradictions in Sensitive Code
- Comment/TODO:
- Verified / contradicted / unsafe:
- Carry-forward note:

### 7. Key Implementation-Security Risks
- Blocking risks:
- Bounded risks:
- Confidence limitations:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- treat validation helpers as protective if they are not on live paths
- confuse auth at the gate with resource-level authorization
- assume crypto is acceptable because a library is present
- ignore information leakage because the user experience is friendly
- rely on scanner language instead of inspecting sensitive code behavior

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I inspected the sensitive code paths, untrusted inputs are materially constrained before dangerous use, authorization and secure-coding behavior hold on real execution paths, and no obvious high-severity exploit path remains in the implementation.

If that statement cannot be made honestly, this stage should not pass.

---
type: review-stage
review_type: security
stage: 7
stage_name: "Runtime Exposure Observability Defensive Response"
version: 1.0
updated: 2026-04-18
---
# Security Stage 7 — Runtime Exposure, Observability & Defensive Response

## Stage Metadata
- **Review type:** Security
- **Stage number:** 7
- **Stage name:** Runtime Exposure, Observability & Defensive Response
- **Purpose in review flow:** Verify that the running system minimizes attack surface, handles hostile runtime conditions safely, and produces usable defensive signals without creating new exposure
- **Default weight:** High
- **Required reviewer posture:** Runtime-minded, abuse-aware, skeptical of dev-mode defaults and noisy logging theater
- **Lens interaction:** Lenses may intensify certain runtime risks, but all reviews must evaluate exposed behavior, abuse resistance, and defensive signal quality
- **Depends on:** Security Stages 2–4 for abuse paths and enforcement context, Security Stage 6 for secret/logging exposure context, and Code Stage 6 for platform/runtime assumptions
- **Feeds into:** Security Stage 9, Production Stages 3, 6, and 9
- **Security/Production handoff:** Carry forward runtime attack-surface findings, disclosure behavior, observability gaps, and degraded-mode defensive weaknesses that affect detection and launch posture

---

## Why This Stage Exists

A system that looks safe in code can still be unsafe once it is running.

Vibe-coded projects often harden the happy path in development just enough to demo, then leave runtime security weak through patterns like:
- permissive CORS
- exposed debug/admin routes
- verbose stack traces in production
- weak rate limiting or no abuse controls
- logs that are noisy but not actually useful for defense
- crash handling that leaks internals or leaves systems unstable
- fallback modes that quietly bypass important checks under load or failure

This stage asks:

> When the system is actually running and being poked at, does it minimize exposure, resist abuse, and generate useful defensive signal without creating new risk?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What parts of the runtime surface are exposed to attackers or untrusted actors
2. Whether the system reveals too much when errors or failures happen
3. Whether abuse controls like rate limiting and defensive logging are credible
4. Whether the team would have usable signals if the system were attacked
5. Whether runtime fallbacks or debug paths undermine security posture

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Runtime exposure summary**
2. **Error/disclosure findings**
3. **Abuse-resistance findings**
4. **Security observability findings**
5. **Debug/fallback risk findings**
6. **Key runtime risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- route exposure and public/internal endpoint layout
- error handlers and production error responses
- CORS, timeout, and rate-limiting config where visible
- debug/admin/metrics/health endpoints
- security-relevant logging and alert-worthy event patterns
- runtime config toggles and environment-specific guards
- comments/docs around debug mode, temporary runtime shortcuts, or incident handling

Where feasible, perform basic dynamic probing of runtime behavior.

---

## Core Review Rule

Do not infer runtime security from configuration intent alone.

A project does **not** get runtime-safety credit because:
- there is a rate-limit library in the repo
- debug mode is “supposed” to be off
- a metrics endpoint is meant to be internal
- logs are verbose
- an incident response story exists in docs without corresponding runtime signal

The reviewer must assess what the running surface likely exposes and how it behaves under hostile or malformed conditions.

---

# Review Procedure

## Step 1 — Review Runtime Attack Surface

Determine what is exposed when the system is live.

### Check
- [ ] Publicly reachable routes/services appear bounded to actual need
- [ ] Debug, admin, metrics, or maintenance endpoints are identified and protected appropriately
- [ ] Binding, exposure, or network assumptions do not silently widen reachability
- [ ] Runtime toggles do not accidentally expose privileged surfaces

### Common failure patterns
- debug/admin routes reachable in production-like mode
- metrics/health endpoints exposed broadly with sensitive internals
- route exposure broader than intended because ingress assumptions are false

---

## Step 2 — Review Error Handling & Information Disclosure

Determine whether runtime failures reveal too much.

### Check
- [ ] Production error paths do not expose stack traces, secrets, internal paths, or sensitive internals to untrusted callers
- [ ] Error differences do not create unnecessary security oracles where relevant
- [ ] Crash/panic handling appears intentional rather than chaotic
- [ ] Debug verbosity is not accidentally enabled in production-like flows

### Example — Incorrect
```python
app.run(debug=True)
```
Why it fails:
- runtime may expose verbose failure detail in unsafe contexts

### Example — Better
```python
app.run(debug=False)
```
with separate controlled debug tooling only for local development.

---

## Step 3 — Review Abuse Resistance & Defensive Controls

Determine whether hostile usage meets meaningful resistance.

### Check
- [ ] Rate limiting, throttling, or equivalent abuse controls exist where appropriate
- [ ] Expensive or sensitive paths are not trivially abuseable
- [ ] Input validation remains enforced at runtime boundaries
- [ ] If runtime defenses such as WAF/RASP or equivalent exist, their use is reviewed for fit to the actual threat model
- [ ] Fallback behavior under load or dependency failure does not create unsafe shortcuts

### Example — Incorrect
```javascript
app.use(cors({ origin: '*', credentials: true }))
```
Why it fails:
- dangerous wildcard + credentials posture expands abuse surface significantly

### Example — Better
```javascript
app.use(cors({ origin: ['https://app.example.com'], credentials: true }))
```
Why it passes:
- credentialed cross-origin access is constrained to trusted origins

---

## Step 4 — Review Security Observability

Determine whether operators would have usable defensive signal.

### Check
- [ ] Security-relevant events are logged with useful context
- [ ] Logs avoid becoming their own disclosure problem
- [ ] The system would provide at least minimally useful signals for auth abuse, suspicious actions, or repeated failures
- [ ] Reviewer distinguishes noisy logging from actionable security observability

### Example — Incorrect
```python
except Exception:
    return {"error": "failed"}, 500
```
with no internal logging.

Why it fails:
- no usable operator signal

### Example — Better
```python
except Exception as e:
    logger.error('payment processing failed', extra={'order_id': order_id, 'error': str(e)})
    return {'error': 'payment failed'}, 500
```
Why it passes better:
- internal signal exists
- caller-facing response stays controlled

---

## Step 5 — Review Debug / Fallback / Maintenance Risks

Determine whether non-primary runtime paths quietly undermine security.

### Check
- [ ] Debug endpoints, test hooks, and temporary bypasses are identified
- [ ] Maintenance shortcuts are not publicly or broadly reachable
- [ ] Error or degraded-mode paths do not silently skip critical protections
- [ ] Reviewer challenges comments that normalize weak runtime defenses as temporary convenience

### Common failure patterns
- fallback path skips auth or validation “just to keep the service up”
- maintenance endpoint reachable from public interface
- “temporary” runtime shortcut living indefinitely in production-like config

---

## Step 6 — Acknowledge Dynamic Testing (DAST) Evidence

This stage should explicitly record what runtime evidence is dynamic versus static.

### Check
- [ ] Reviewer performs basic DAST where feasible (malformed input probes, error-leak checks, auth edge probing, rate-limit pressure)
- [ ] Reviewer notes whether endpoints were exercised dynamically versus reviewed statically only
- [ ] If full DAST is not feasible, reviewer records the gap and lowers runtime-confidence claims accordingly
- [ ] Runtime verdict explains what dynamic evidence exists and what remains untested

### Important note
Full red-team depth is not required. Even simple runtime probing can catch things static review misses.

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 9:** runtime attack-surface, disclosure, and detection-readiness findings affecting release posture
- **Production 3:** telemetry/logging trade-offs and observability gaps
- **Production 6:** degraded-mode and failure-response behavior affecting resilience under abuse or fault
- **Production 9:** runtime hardening gaps affecting ship/no-ship decisions

### Required handoff block
- **Carry-forward concerns:**
  - Public/runtime exposure risk:
  - Disclosure/oracle risk:
  - Abuse-control weakness:
  - Security observability gap:
  - Debug/fallback defensive weakness:
  - Dynamic-testing confidence gap:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize model-facing runtime surfaces, prompt-ingestion abuse paths, and weak observability around AI actions
- **credentials lens:** emphasize token/header leakage in logs, runtime debug output, and admin endpoint exposure
- **bug-hunt lens:** emphasize malformed-input behavior and degraded-mode shortcuts
- **platform lens:** emphasize runtime binding, CORS, process mode, timeout, and environment-specific exposure defaults

---

## Severity / Gating Model

### PASS
Use PASS when:
- runtime exposure is reasonably bounded
- error handling and observability are security-aware
- abuse controls and defensive signals are credible for the project’s maturity

### NEEDS_WORK
Use NEEDS_WORK when:
- runtime posture is directionally acceptable but has meaningful hardening gaps
- observability or abuse controls are weak enough to raise concern but still fixable

### BLOCK
Use BLOCK when:
- runtime exposure materially contradicts the project’s security posture
- public attack surface, disclosure behavior, or missing abuse controls create clear high-severity risk
- debug/fallback paths leave dangerous protections effectively optional
- the system is likely to fail insecurely under hostile or stressed runtime conditions

---

## Escalation Guidance

Escalate or explicitly flag when:
- production-like paths appear to run in debug-friendly or disclosure-heavy modes
- abuse controls are absent on expensive, sensitive, or public paths
- observability is too weak to detect obvious attack behavior
- fallback/degraded paths quietly override security posture

If the live runtime surface is too exposed or too blind to defend credibly, use **BLOCK**.

---

## Required Report Format

### 1. Runtime Exposure Summary
- Publicly exposed surfaces:
- Internal-only assumptions:
- Highest-risk runtime entry points:

### 2. Error / Disclosure Findings
- Stack trace / internal detail exposure:
- Oracle-style behavior concerns:
- Debug-mode leakage risk:

### 3. Abuse-Resistance Findings
- Rate limiting / throttling posture:
- Expensive/sensitive path protection:
- Unsafe fallback behavior:

### 4. Security Observability Findings
- Useful security signals present:
- Noisy vs actionable logging:
- Detection-readiness confidence:

### 5. Debug / Fallback Risk Findings
- Exposed debug or maintenance paths:
- Degraded-mode security weakness:
- Temporary-runtime-shortcut debt:

### 6. Key Runtime Risks
- Blocking risks:
- Bounded risks:
- Dynamic-confidence limitations:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- assume runtime config intent equals runtime behavior
- treat verbose logs as good observability by default
- ignore debug/maintenance paths because they are not part of the main user flow
- skip DAST acknowledgment entirely when runtime claims matter
- let Stage 9 inherit unsupported assumptions about exposure or detectability

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what the system exposes at runtime, it does not fail by revealing or widening too much, its abuse controls are credible enough for the threat model, and operators would have usable defensive signal if the system were attacked.

If that statement cannot be made honestly, this stage should not pass.

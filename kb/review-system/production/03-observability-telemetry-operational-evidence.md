---
type: review-stage
review_type: production
stage: 3
stage_name: "Observability Telemetry Operational Evidence"
version: 1.0
updated: 2026-04-18
---
# Production Stage 3 — Observability, Telemetry & Operational Evidence

## Stage Metadata
- **Review type:** Production
- **Stage number:** 3
- **Stage name:** Observability, Telemetry & Operational Evidence
- **Purpose in review flow:** Verify that the system produces enough trustworthy operational signal to detect, diagnose, and respond to failures without guessing
- **Default weight:** High
- **Required reviewer posture:** Signal-focused, operationally practical, skeptical of dashboard and logging theater
- **Lens interaction:** Lenses may intensify scrutiny on certain telemetry gaps, but all reviews must assess whether operators would actually have usable evidence during incidents
- **Depends on:** Production Stage 1 service criticality, Security Stage 7 runtime exposure/observability findings, Code Stage 3 verification integrity, and Code Stage 8 logging/trust concerns where relevant
- **Feeds into:** Production Stages 4, 5, 6, and 9
- **Security/Production handoff:** Carry forward observability gaps, misleading health semantics, and telemetry trust issues that affect release, incident response, and operator confidence

---

## Why This Stage Exists

A service is not production-ready if failures turn into mysteries.

Vibe-coded projects frequently produce observability theater such as:
- logs that exist but lack useful context
- dashboards referenced in docs but not backed by real instrumentation
- critical failures swallowed or flattened into generic errors
- health checks that say “OK” while the service is effectively unavailable
- metrics that decorate the repo but do not support operational decisions

This stage asks:

> If this service degrades or fails in production, will operators have trustworthy evidence to detect it, diagnose it, and act responsibly?

### Boundary clarification
- **Production Stage 3** asks whether the service produces usable operational evidence.
- **Production Stage 7** asks whether humans can actually use that evidence, plus docs and procedures, to support the service under pressure.

Stage 3 is about signal quality. Stage 7 is about human supportability.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether operators can detect meaningful failure and degradation quickly
2. Whether logs, metrics, traces, and health signals are sufficient to debug incidents
3. Whether telemetry claims in docs/comments are real in implementation
4. Whether critical paths are instrumented rather than only peripheral flows
5. Whether operational evidence is strong enough for later production gates to rely on it

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Observability posture summary**
2. **Logging findings**
3. **Metrics/tracing findings**
4. **Alertability/actionability findings**
5. **Health-signal truthfulness findings**
6. **Key observability risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- logging code and error-handling paths
- metrics instrumentation points
- tracing setup where present
- alerting config/threshold definitions where present
- runbooks/docs referencing observability artifacts
- health/readiness endpoints and their semantics
- comments/docs claiming monitoring or dashboard coverage

---

## Core Review Rule

Do not reward the **presence** of telemetry artifacts.
Reward their **operational usefulness**.

A project does **not** get observability credit because:
- logs exist
- metrics library is installed
- tracing package is imported
- a dashboard screenshot exists in docs
- a health endpoint always returns OK

The reviewer must judge whether the service would be operable under real failure conditions.

---

# Review Procedure

## Step 1 — Review Logging Quality

Determine whether logs support diagnosis without creating noise or new trust problems.

### Check
- [ ] Logs include enough context (request/job IDs, relevant identifiers, outcome state)
- [ ] Logs avoid leaking secrets/PII while preserving operational value
- [ ] Critical failures are logged explicitly
- [ ] Log levels are used meaningfully
- [ ] Reviewer distinguishes useful context from noisy verbosity

### Example — Incorrect
```python
except Exception:
    logger.error('failed')
```
Why it fails:
- almost no diagnostic context
- low operational value during incidents

### Example — Better
```python
except Exception as e:
    logger.error('payment processing failed', extra={'order_id': order_id, 'error': str(e)})
```
Why it passes:
- preserves useful incident context

---

## Step 2 — Review Metrics Coverage

Determine whether metrics reflect real service health and behavior.

### Check
- [ ] Core service signals are instrumented (throughput, latency, error rates, backlog/saturation where relevant)
- [ ] Metrics align with the service’s operational intent and critical paths
- [ ] Metric types are used sensibly for what is being measured
- [ ] Metrics are not so sparse that incident diagnosis depends on guesswork
- [ ] AI/model-backed services include model latency/error, token/cost, and provider degradation signals where applicable

### Reviewer questions
- If the service slows down or fails partially, would metrics reveal that clearly?
- Are the most important workflows observable, or only the easy ones?
- Do AI/provider-related costs and degradation show up operationally where they matter?

---

## Step 3 — Review Tracing & Correlation

Determine whether operators can follow a request/job across important paths.

### Check
- [ ] Request/job correlation across key paths is possible
- [ ] Cross-component calls are traceable where architecture requires it
- [ ] Correlation IDs propagate through major flows
- [ ] Missing traceability in critical paths is surfaced explicitly

### Common failure patterns
- distributed system with no cross-component correlation
- async job processing that loses request context entirely
- logs/metrics exist, but no way to connect them during incident analysis

---

## Step 4 — Review Alertability & Actionability

Determine whether the service produces signals that lead to action rather than alert fatigue.

### Check
- [ ] Severe failure and degradation have detectable signals
- [ ] Alert thresholds are plausible for the service context
- [ ] Alerts tie back to actionable context/runbook material where possible
- [ ] Alert volume/frequency appears sustainable for the actual operator team size
- [ ] Reviewer flags observability that is technically present but operationally non-actionable

### Common failure patterns
- alerts on everything, leading to permanent tuning-out
- metrics exist, but there is no threshold or operator meaning attached
- runbooks refer to dashboards/signals that do not actually exist

---

## Step 5 — Review Health Semantics & Operational Truthfulness

Determine whether health/readiness signals tell the truth.

### Check
- [ ] Health/readiness endpoints represent real service dependency readiness where needed
- [ ] Monitoring claims in docs are supported by code/config evidence
- [ ] Dashboard/runbook references are real and current enough to trust
- [ ] Reviewer identifies telemetry theater and fake readiness directly

### Example — Incorrect
- readiness returns OK whenever the process is alive, even if DB/queue critical dependencies are unavailable

Why it fails:
- automation and responders receive false confidence

### Example — Better
- readiness reflects whether dependencies required for core service function are actually available

Why it passes:
- operational truth is stronger

---

## Step 6 — Review AI / Model Telemetry

This is required for AI-native services.

### Check
- [ ] Token usage is tracked with enough granularity to understand cost-driving paths
- [ ] Model latency and error rates are visible per provider/model where relevant
- [ ] Prompt/completion logging policy is explicit about retention/redaction
- [ ] Model degradation signals (fallback frequency, abnormal refusal/error shifts, quality drift indicators where available) are considered
- [ ] Cost alerting thresholds exist for abnormal spend or runaway workloads where applicable

### Important rule
For AI-native services, observability that ignores provider latency, token burn, and fallback/degradation behavior is incomplete.

---

## Step 7 — Review Design / Risk Comments as Evidence

Observability comments may explain intent, but they do not create operational signal by themselves.

### Check
- [ ] Comments about telemetry gaps are treated as open risk if unresolved
- [ ] “Will add monitoring later” in critical paths is surfaced explicitly
- [ ] Reviewer challenges observability claims unsupported by implementation
- [ ] Docs/screenshots do not override absent instrumentation

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 4:** telemetry gaps that weaken capacity/performance diagnosis
- **Production 5:** misleading readiness/health signals affecting rollout confidence
- **Production 6:** observability gaps that limit incident containment and resilience
- **Production 9:** operational-evidence weakness affecting final production readiness judgment

### Required handoff block
- **Carry-forward concerns:**
  - Logging/actionability gap:
  - Metrics/tracing gap:
  - Health-signal truthfulness risk:
  - Alert-fatigue / non-actionable-signal risk:
  - AI/model telemetry gap:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize provider/model latency, cost visibility, prompt/logging policy, and weak observability around AI actions
- **credentials lens:** emphasize telemetry that leaks secrets/tokens or hides auth failures
- **bug-hunt lens:** emphasize missing evidence around the most failure-prone paths
- **platform lens:** emphasize runtime/environment-specific health semantics and telemetry wiring

---

## Severity / Gating Model

### PASS
Use PASS when:
- key operational signals are present and usable
- failure/degradation can be detected and investigated with reasonable confidence
- observability claims are materially supported by code/config evidence

### NEEDS_WORK
Use NEEDS_WORK when:
- core telemetry exists but has meaningful actionability or correlation gaps
- observability posture is partial and requires hardening before confidence is credible

### BLOCK
Use BLOCK when:
- critical-path failures cannot be detected or diagnosed with available telemetry
- health/monitoring signals are materially misleading
- operational evidence is too weak for responsible production progression
- later production stages would depend on fake confidence from telemetry theater

---

## Escalation Guidance

Escalate or explicitly flag when:
- health or readiness signals overstate service truth
- logs are noisy yet still fail to support diagnosis
- critical paths have little or no instrumentation
- alerting technically exists but is operationally useless

If failures would become mysteries under real operation, use **BLOCK**.

---

## Required Report Format

### 1. Observability Posture Summary
- Overall telemetry maturity:
- Critical-path coverage confidence:
- Biggest signal gaps:

### 2. Logging Findings
- Useful context present:
- Noise / low-value logging:
- Trust/privacy logging concerns:

### 3. Metrics / Tracing Findings
- Metrics coverage quality:
- Correlation/tracing quality:
- AI/provider telemetry coverage:

### 4. Alertability / Actionability Findings
- Severe-event detection quality:
- Alert threshold/actionability confidence:
- Alert-fatigue concerns:

### 5. Health-Signal Truthfulness Findings
- Liveness vs readiness quality:
- Misleading health signal risks:
- Dashboard/runbook truthfulness:

### 6. Key Observability Risks
- Blocking risks:
- Bounded risks:
- Confidence limitations:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- confuse log volume with observability quality
- trust dashboard or monitoring claims without checking instrumentation
- ignore health endpoints because “they exist”
- skip AI/provider telemetry when those systems materially affect operation
- move on if incident diagnosis would still rely mostly on luck

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I can see enough trustworthy operational signal to detect meaningful failure, diagnose the important paths, distinguish health from false optimism, and support real production decisions without guessing blindly.

If that statement cannot be made honestly, this stage should not pass.

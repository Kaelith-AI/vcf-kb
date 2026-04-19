---
type: review-stage
review_type: production
stage: 1
stage_name: "Service Definition Operational Intent Ownership"
version: 1.0
updated: 2026-04-18
---
# Production Stage 1 — Service Definition, Operational Intent & Ownership

## Stage Metadata
- **Review type:** Production
- **Stage number:** 1
- **Stage name:** Service Definition, Operational Intent & Ownership
- **Purpose in review flow:** Establish what the service is, what production success and failure mean for it, and who is accountable for running and fixing it
- **Default weight:** Highest importance at the start of Production review
- **Required reviewer posture:** Operationally grounded, ownership-conscious, skeptical of vague “production-ready” language
- **Lens interaction:** Lenses may intensify focus on certain operational risks, but no lens may skip explicit service definition, intent, or ownership clarity
- **Depends on:** Security Stage 9 release-security posture when available; Code Stage 1 scope truth and Code Stage 9 release-confidence findings where available
- **Feeds into:** All later Production stages, especially Production 2, 3, 5, and 9
- **Security/Production handoff:** Carry forward security release constraints, operational ownership gaps, dependency criticality, and failure-contract assumptions that later stages must treat as real constraints

---

## Why This Stage Exists

Production review fails when nobody can state what the service is supposed to do, how important it is, or who is responsible when it breaks.

Vibe-coded projects frequently skip operational definition entirely. Common patterns include:
- a useful prototype with no explicit service identity
- a deployment target implied by habit rather than documented reality
- no named owner or escalation path
- unclear distinction between critical functionality and nice-to-have behavior
- no explicit description of degraded mode, failure expectations, or support scope

If those basics are fuzzy, later production review turns into theater.

This stage asks:

> What is this service, what is it expected to do in operation, and who owns the consequences when it fails?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What the service is and what it is for
2. Who owns it operationally
3. What kind of reliability, support, and dependency posture it expects
4. What failure and degraded behavior are considered acceptable
5. Whether the project’s production ambition is honest for its current maturity

If the reviewer cannot explain production success and failure in concrete terms, this stage should not pass.

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Service identity summary**
2. **Operational intent summary**
3. **Ownership/accountability findings**
4. **Failure-contract findings**
5. **Scope/maturity findings**
6. **Key operational-definition risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

### Receives from earlier review
If available, intake:
- **Security Stage 9** final verdict, residual risks, and any conditional release constraints
- **Code Stage 1** scope truth and maturity findings
- **Code Stage 9** release-confidence and scope-narrowing findings

### Inspect direct evidence
Inspect at minimum:
- README and service docs
- architecture or operations notes
- CODEOWNERS, maintainer metadata, or equivalent ownership markers
- entrypoints and run commands
- dependency/integration declarations
- deployment descriptors where present
- comments/docs describing degraded behavior, support, or outage assumptions

---

## Core Review Rule

Do not accept “it runs” as a substitute for service definition.

A project does **not** get production-identity credit because:
- the repo starts successfully
- a demo workflow exists
- there is a deployment config somewhere
- docs describe the technology stack but not the service contract
- “the team” is named without any accountable ownership path

The reviewer must identify the service’s operational contract clearly enough that later stages can test it.

---

# Review Procedure

## Step 1 — Define Service Identity

Determine whether the service has a clear production identity.

### Check
- [ ] Service has a clear name and purpose statement
- [ ] Service type is explicit enough to reason about (API, worker, scheduler, pipeline, agent service, etc.)
- [ ] Primary entry points and interfaces are identifiable
- [ ] Intended audience (internal, external, mixed) is explicit
- [ ] Reviewer can explain what the service does in one or two plain sentences

### Reviewer questions
- What is this service for?
- What kind of system is it operationally?
- Who is expected to depend on it?

### Common failure patterns
- repo describes tools/frameworks instead of service purpose
- worker/scheduler/API boundaries are implied, not stated
- external-facing behavior exists, but docs still read like an internal prototype

---

## Step 2 — Define Operational Intent

Determine what kind of production behavior the service is expected to deliver.

### Check
- [ ] Expected usage pattern and load class are stated at least qualitatively
- [ ] Reliability/availability expectations exist, even if provisional
- [ ] Critical vs optional dependencies are distinguishable
- [ ] Resource cost expectations are at least qualitatively understood
- [ ] Degraded-mode expectations are described where relevant

### Reviewer questions
- What kind of uptime/latency behavior is this service trying to achieve?
- Which dependencies are truly critical?
- What is supposed to happen when a dependency is unavailable?

### Common failure patterns
- no indication whether downtime is acceptable or catastrophic
- all dependencies treated as equally important
- degraded behavior left to runtime improvisation
- hidden expensive external APIs with no operational cost framing

---

## Step 3 — Verify Ownership & Accountability

Determine whether someone is actually responsible for operation and remediation.

### Check
- [ ] Owner (person or team) is identifiable
- [ ] Incident/escalation path exists
- [ ] Responsibility for maintenance and fixes is explicit
- [ ] Ownership signals across docs/config/repo metadata are consistent
- [ ] Reviewer can tell who gets paged, contacted, or blamed when this breaks

### Example — Incorrect
- docs refer vaguely to “the team” with no owner/contact route

### Example — Better
- README, CODEOWNERS, and runbook all point to an explicit owner and escalation path

Why it passes:
- accountability is traceable

---

## Step 4 — Review Failure Contract

Determine whether acceptable failure behavior is understood.

### Check
- [ ] Known failure modes are named or inferable
- [ ] Failure outcomes are bounded (retry, fail closed, partial degradation, queueing, etc.)
- [ ] Data-loss expectations are explicit where relevant
- [ ] Restart/recovery behavior is not left entirely to assumption
- [ ] Reviewer can describe what “bad but acceptable” operation looks like

### Common failure patterns
- service has no documented degraded mode
- restart behavior for stateful paths is assumed rather than described
- “just retry” appears without bound or context
- data-loss expectations are undefined in systems handling important state

---

## Step 5 — Review Scope Boundaries & Maturity Honesty

Determine whether the service is honestly scoped for its current maturity.

### Check
- [ ] Service boundaries (what it owns vs does not own) are explicit enough to review
- [ ] Shared responsibilities with other systems are identified
- [ ] Scope claims are consistent with implementation and deployment reality
- [ ] Reviewer flags overclaimed maturity or support expectations
- [ ] Production ambition is narrower where evidence only supports a limited release scope

### Common failure patterns
- prototype presented as a fully supported service
- shared system responsibilities hidden behind vague architecture language
- service claims broad support despite thin operational evidence

---

## Step 6 — Review Design / Risk Comments as Evidence

Operational comments may provide context, but they do not substitute for explicit service definition.

### Check
- [ ] Operational rationale comments are treated as evidence, not proof
- [ ] “Temporary” operational shortcuts are surfaced as debt/risk
- [ ] Reviewer challenges comments that understate outage or support risk
- [ ] Production expectations are not left scattered across comments only

### Example — Incorrect
```md
# will clean up deploy/ownership later
```
Why it fails:
- acknowledges operational incompleteness without bounding it

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 2:** service boundaries, deployment assumptions, dependency criticality, and state/failure expectations
- **Production 3:** operational evidence requirements implied by service criticality and failure contract
- **Production 5:** release/recovery constraints shaped by ownership and acceptable failure modes
- **Production 9:** scope limits, ownership gaps, and maturity honesty affecting final readiness judgment

### Required handoff block
- **Carry-forward concerns:**
  - Service identity clarity:
  - Ownership/accountability gaps:
  - Dependency criticality:
  - Failure-contract uncertainty:
  - Scope/maturity overclaim risk:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize AI-service operational identity, provider dependence, and ownership of behavior changes caused by prompts/models/tools
- **platform lens:** emphasize deployment-target and environment assumptions embedded in service identity
- **bug-hunt lens:** emphasize unclear failure contracts and support boundaries likely to amplify incidents
- **credentials lens:** emphasize whether ownership includes responsibility for sensitive-data and auth-related operational fallout

---

## Severity / Gating Model

### PASS
Use PASS when:
- service identity, intent, dependencies, and ownership are clear
- failure expectations are explicit enough for downstream production review
- maturity and support claims are honest and evidence-aligned

### NEEDS_WORK
Use NEEDS_WORK when:
- service definition exists but is incomplete or inconsistent
- ownership and failure expectations are partial
- production ambition is ahead of operational evidence

### BLOCK
Use BLOCK when:
- service identity or ownership is unclear
- there is no credible operational intent or failure contract
- reviewers cannot determine what production success/failure means
- later production stages would be mostly guesswork because the service has no operational contract

---

## Escalation Guidance

Escalate or explicitly flag when:
- ownership is phantom or contradictory across sources
- operational ambition clearly exceeds available supportability
- Security Stage 9 imposed constraints that this stage’s service definition ignores
- nobody can explain what degraded-but-acceptable operation means

If the service cannot be defined operationally in concrete terms, use **BLOCK**.

---

## Required Report Format

### 1. Service Identity Summary
- Service name and type:
- Primary purpose:
- Intended audience/users:

### 2. Operational Intent Summary
- Expected usage/load class:
- Reliability/latency expectations:
- Critical dependencies:
- Degraded-mode expectation:

### 3. Ownership / Accountability Findings
- Named owner/team:
- Escalation/contact path:
- Ownership consistency across artifacts:

### 4. Failure-Contract Findings
- Known failure modes:
- Bounded failure behavior:
- Data-loss / restart expectations:

### 5. Scope / Maturity Findings
- Claimed scope:
- Actual supported scope:
- Maturity overclaim risks:

### 6. Key Operational-Definition Risks
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
- confuse framework docs with service definition
- accept anonymous “team ownership” without accountable routing
- ignore degraded-mode expectations because the happy path works
- let broad production claims survive without operational support evidence
- proceed to later production stages when the service itself is still undefined

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what this service is, who owns it, what good and bad operation look like, which dependencies matter most, and what production scope its current maturity honestly supports.

If that statement cannot be made honestly, this stage should not pass.

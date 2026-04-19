---
type: review-stage
review_type: production
stage: 2
stage_name: "Architecture Deployment Model State Boundaries"
version: 1.0
updated: 2026-04-18
---
# Production Stage 2 — Architecture, Deployment Model & State Boundaries

## Stage Metadata
- **Review type:** Production
- **Stage number:** 2
- **Stage name:** Architecture, Deployment Model & State Boundaries
- **Purpose in review flow:** Verify that the system’s deployed shape, component interactions, and state boundaries are operationally coherent and survivable
- **Default weight:** High
- **Required reviewer posture:** State-aware, deployment-conscious, skeptical of architecture theater and single-instance illusions
- **Lens interaction:** Lenses may intensify focus on certain deployment or state risks, but all reviews must verify that architecture claims survive real deployment conditions
- **Depends on:** Production Stage 1 service contract, Code Stage 2 architectural coherence, Security Stage 3 boundary-enforcement findings, and Security Stage 8 deployment-surface findings where available
- **Feeds into:** Production Stages 4, 5, 6, and 9
- **Security/Production handoff:** Carry forward state-boundary weakness, SPOFs, deploy-shape contradictions, and durability risks that affect capacity, recovery, and final readiness

---

## Why This Stage Exists

A codebase can look architecturally coherent while still being operationally fragile.

Vibe-coded systems commonly produce deployment-shape problems such as:
- in-memory queues or caches acting as if they were durable systems
- local-process assumptions hidden inside “scalable” architectures
- deployment configs that contradict the code’s state model
- pseudo-microservice boundaries that are mostly naming, not operational separation
- critical state whose owner, durability, or restart behavior nobody can explain clearly

This stage asks:

> Does the system’s actual deployment shape make operational sense, especially around state, failure boundaries, and multi-instance behavior?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What the core deployed components are and how they interact
2. Whether deployment configuration matches architecture claims
3. Where state lives and whether critical state is durable enough
4. Whether the system can restart, scale, and fail in predictable ways
5. Whether architecture comments/docs reflect operational reality rather than architectural aspiration

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Architecture/deployment summary**
2. **Component/state-boundary findings**
3. **Durability and SPOF findings**
4. **Dataflow and contract-boundary findings**
5. **Scale/fault-behavior findings**
6. **Key architecture/deployment risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- architecture docs/diagrams where present
- service/module layout and entrypoints
- deployment descriptors (Docker, compose, k8s, IaC, service units, etc.)
- storage/migration files
- queue/cache/state management code
- integration clients and communication paths
- config/env loading and environment split patterns

---

## Core Review Rule

Do not judge production architecture by labels alone.

A system does **not** get production-architecture credit because:
- it has multiple folders or services with impressive names
- there is a deployment manifest in the repo
- a diagram shows clean boundaries
- a service claims horizontal scalability
- a queue/cache exists somewhere in the codebase

The reviewer must verify whether the deployed behavior and state model actually support those claims.

---

# Review Procedure

## Step 1 — Review Component & Interaction Clarity

Determine whether the deployed system’s major parts are understandable.

### Check
- [ ] Core components are identifiable and distinct
- [ ] Communication paths (sync/async, API/queue/db) are clear enough to trace
- [ ] External dependencies are mapped to component responsibilities
- [ ] Architecture docs, where present, broadly match observed implementation/deployment shape

### Reviewer questions
- What are the major deployed components?
- Which parts are critical vs peripheral?
- Can the reviewer trace the main production flow through the system?

---

## Step 2 — Review Deployment Model Coherence

Determine whether deployment assumptions are aligned with runtime behavior.

### Check
- [ ] Deployment target and runtime model are explicit and consistent
- [ ] Replica/scaling assumptions do not contradict code behavior
- [ ] Deployment mechanism is reviewable and not dependent on operator memory alone
- [ ] Dev/staging/prod separation exists and is not dangerously blurred
- [ ] Config injection strategy is consistent and reviewable

### Common failure patterns
- app claims multi-instance readiness while relying on local process memory
- deployment steps exist only in shell history or operator habit
- environment separation is mostly naming while behavior forks unsafely

---

## Step 3 — Review State Boundaries & Durability

This is the heart of the stage.

### Check
- [ ] Durable vs ephemeral state is explicitly distinguishable
- [ ] Critical state is not stored only in-process unless that limitation is honest and acceptable for scope
- [ ] State ownership (who writes, reads, migrates, and restores it) is clear
- [ ] Restart behavior for stateful paths is understood
- [ ] Reviewer flags in-process durability illusions directly

### Example — Incorrect
```js
const jobQueue = []
app.post('/enqueue', (req, res) => {
  jobQueue.push(req.body)
  res.json({ queued: true })
})
```
Why it fails:
- queue state dies on restart
- durability assumption is false

### Example — Better
- queue persisted in a durable broker/store with retry and visibility controls

Why it passes:
- state boundary and durability align with operational intent

---

## Step 4 — Review Dataflow & Contract Boundaries

Determine whether end-to-end operational flow is understandable and bounded.

### Check
- [ ] End-to-end flow is traceable through ingress, processing, storage, and egress
- [ ] Async workflows include understandable retry/failure behavior
- [ ] External contracts/interfaces are visible enough to reason about breakage risk
- [ ] Sensitive-data flow boundaries are identifiable where relevant

### Reviewer questions
- Where can data be delayed, dropped, retried, or duplicated?
- Which contracts would break if one component changed unexpectedly?
- Is the operational system understandable as a set of real boundaries, not just source folders?

---

## Step 5 — Review Scale & Fault Characteristics

Determine whether the system is likely to behave predictably under real deployment conditions.

### Check
- [ ] Obvious bottlenecks are identified
- [ ] Single points of failure are identified and justified or bounded
- [ ] Connection/resource lifecycle assumptions support the claimed deployment model
- [ ] Reviewer flags architecture that works only in single-instance/local mode
- [ ] Scaling claims are not accepted without state-model compatibility

### Example — Incorrect
- service claims horizontal scalability
- session state remains local to each instance

Why it fails:
- state model and scaling claim conflict

---

## Step 6 — Review Design / Risk Comments as Evidence

Architecture comments may help explain trade-offs, but they do not prove operational coherence.

### Check
- [ ] Architecture trade-off comments are evaluated against actual behavior
- [ ] “Temporary” in-memory/state shortcuts are surfaced as production risk
- [ ] Reviewer challenges comments that overstate scalability or resilience
- [ ] Diagram/comment confidence does not override deploy/runtime evidence

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 4:** bottlenecks, resource hot spots, and scale assumptions tied to architecture/state shape
- **Production 5:** deployability, migration, and rollback risks shaped by state boundaries
- **Production 6:** resilience limits caused by SPOFs, retry paths, or weak fault isolation
- **Production 9:** architecture/deployment contradictions affecting final readiness judgment

### Required handoff block
- **Carry-forward concerns:**
  - Deploy-shape truth:
  - State durability risk:
  - SPOF / bottleneck risk:
  - Contract-boundary fragility:
  - Single-instance illusion risk:

---

## Lens Interaction Guidance

Examples:
- **platform lens:** emphasize runtime model specifics, filesystem/state assumptions, and deployment-environment constraints
- **llm-focused lens:** emphasize agent-state, prompt-state, provider-bound workflow state, and orchestration assumptions that break under scaling/restart
- **bug-hunt lens:** emphasize state and contract drift likely to cause hidden production defects
- **credentials lens:** emphasize where state and boundary design amplify auth/session or secret-handling risk

---

## Severity / Gating Model

### PASS
Use PASS when:
- architecture, deployment shape, and state boundaries align
- critical state and failure assumptions are explicit and defensible
- reviewer can reason about production behavior with confidence

### NEEDS_WORK
Use NEEDS_WORK when:
- architecture is directionally coherent but has meaningful durability, scale, or fault gaps
- deployment assumptions require tightening before production confidence is credible

### BLOCK
Use BLOCK when:
- state or durability assumptions are materially unsafe
- deployment model and architecture are fundamentally contradictory
- critical SPOFs or state hazards make responsible production operation implausible
- later production review would inherit false confidence from architecture theater or single-instance illusions

---

## Escalation Guidance

Escalate or explicitly flag when:
- critical state is in-process but represented as durable or scalable
- deployment shape materially contradicts architecture claims
- diagrams/docs overstate separation or survivability
- restart/failover behavior for important state is unclear

If the deployed system shape cannot survive its own claimed operating model, use **BLOCK**.

---

## Required Report Format

### 1. Architecture / Deployment Summary
- Major components:
- Deployment model:
- Main interaction paths:

### 2. Component / State-Boundary Findings
- Durable vs ephemeral state:
- State ownership clarity:
- In-process state risks:

### 3. Durability & SPOF Findings
- Critical state survivability:
- Single points of failure:
- Restart/failover concerns:

### 4. Dataflow & Contract-Boundary Findings
- Traceable end-to-end paths:
- Async/retry behavior clarity:
- Interface/contract fragility:

### 5. Scale / Fault-Behavior Findings
- Multi-instance readiness:
- Bottleneck risks:
- Fault-behavior confidence:

### 6. Key Architecture / Deployment Risks
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
- trust diagrams or folder structure over deploy/runtime evidence
- accept “scalable” claims without checking state ownership and durability
- ignore SPOFs because the service works in local mode
- confuse pseudo-service decomposition with real operational separation
- move on when restart and state behavior are still poorly understood

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand how this system is actually deployed, where its important state lives, how its components interact under real runtime conditions, and why its architecture and deployment model can survive restart, scale, and routine failure without contradicting each other.

If that statement cannot be made honestly, this stage should not pass.

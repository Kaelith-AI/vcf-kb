---
type: review-stage
review_type: production
stage: 7
stage_name: "Operational Readiness Human Supportability"
version: 1.0
updated: 2026-04-18
---
# Production Stage 7 — Operational Readiness & Human Supportability

## Stage Metadata
- **Review type:** Production
- **Stage number:** 7
- **Stage name:** Operational Readiness & Human Supportability
- **Purpose in review flow:** Verify that humans other than the original builder can reliably operate, debug, and recover the service under normal and incident conditions
- **Default weight:** High-weight, high-detail stage
- **Required reviewer posture:** Human-centered, documentation-skeptical, intolerant of tribal-knowledge operations
- **Lens interaction:** Lenses may intensify certain support risks, but all reviews must pressure-test whether the service is supportable beyond its original author
- **Depends on:** Production Stages 1, 3, 5, and 6; Code Stage 7 maintainability findings; and Security Stage 9 residual-risk ownership context where relevant
- **Feeds into:** Production Stage 9
- **Security/Production handoff:** Carry forward single-maintainer risk, runbook gaps, diagnosability weaknesses, and unowned operational debt that affect final production readiness

---

## Why This Stage Exists

A service that works but cannot be supported is a delayed outage.

Vibe-coded systems frequently ship with hidden context:
- the builder knows how it works, but the repo does not
- operational steps live in chat history or memory
- docs are generic, stale, or setup-focused rather than operations-focused
- failures require deep source archaeology or the original prompter’s recall

This stage asks:

> Can someone other than the original builder run, debug, and recover this service under pressure without heroic reverse-engineering?

If the answer is no, then the service is not operationally mature enough, even if the code technically runs.

### Boundary clarification
- **Production Stage 3** asks whether the service emits trustworthy logs, metrics, traces, and health signals.
- **Production Stage 7** asks whether humans have the runbooks, escalation paths, context, and supportability needed to use those signals effectively.

Stage 7 is not a duplicate observability review. It is the human-operability check.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether a non-author operator could run and troubleshoot the service
2. Whether procedures are explicit, current, and actionable
3. Whether single-maintainer risk is acceptably bounded
4. Whether incident detection/escalation/recovery steps are usable under pressure
5. Whether operational knowledge is captured in durable artifacts rather than trapped in one person’s head

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Operational readiness summary**
2. **Runbook/escalation findings**
3. **Diagnosability findings**
4. **Single-maintainer risk findings**
5. **Toil/automation findings**
6. **Incident-readiness findings**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- runbooks (`RUNBOOK.md`, `docs/operations*`, incident docs)
- README operational sections
- escalation/on-call/owner metadata
- logs and error output quality
- scheduled jobs/cron/background worker docs
- `.env.example` and config docs
- comments/TODOs regarding manual ops steps or hidden procedures

---

## Core Review Rule

Do not confuse setup documentation with operational readiness.

A project does **not** get supportability credit because:
- the original builder can run it
- a README explains installation
- logs exist somewhere
- incident steps are implied by code comments
- on-call ownership is assumed socially but not recorded operationally

The reviewer must pressure-test whether real humans can support the service without relying on tribal memory.

---

# Review Procedure

## Step 1 — Review Runbook Completeness

Determine whether operators have concrete procedures.

### Check
- [ ] Start/stop/restart procedures are explicit
- [ ] Health-check procedure is documented with expected outcomes
- [ ] Common failure scenarios include concrete recovery actions
- [ ] Required paths, env vars, and commands are specific and runnable
- [ ] Runbook freshness is plausible relative to recent changes

### Example — Incorrect
```markdown
## Ops
Run npm start and check logs if broken.
```
Why it fails:
- non-actionable
- no failure-specific guidance

### Example — Better
```markdown
## Start
1. Verify DB reachable: `pg_isready -h $DB_HOST -p $DB_PORT`
2. Run migrations: `npm run db:migrate`
3. Start service: `npm start`

## Health
`GET /health` should return 200 with dependency checks passing.

## Common failure: Redis connection refused
- Verify REDIS_URL
- Restart Redis
- If unresolved, fail over to queue retry mode
```
Why it passes:
- concrete, actionable, reproducible

---

## Step 2 — Review Ownership & Escalation Clarity

Determine whether humans know who owns operational responsibility.

### Check
- [ ] Operational owner is explicit
- [ ] Escalation path exists and is discoverable
- [ ] Incident communication path is identified
- [ ] Ownership is consistent across docs and repo metadata
- [ ] Reviewer can identify who responds when this breaks after hours or during release

### Common failure patterns
- operational owner named in one doc but nowhere else
- no escalation path for external incidents
- incident handling depends on informal Slack/Discord memory rather than durable routing

---

## Step 3 — Review Diagnosability & Operational Signal

Determine whether an operator can debug the service without reading the whole codebase.

### Check
- [ ] Logs/errors include actionable context
- [ ] No critical silent-failure patterns remain
- [ ] Operators can identify likely failure areas without deep source archaeology
- [ ] Debug/verbose modes are controlled and documented
- [ ] Reviewer flags services whose operation depends on reading prompt-history-only structure

### Reviewer questions
- If an alert fired at 2 AM, could someone unfamiliar with the internals make progress quickly?
- Is the system diagnosable from runbook + telemetry, or only from source spelunking?

---

## Step 4 — Review Single-Maintainer Risk Containment

This is one of the most important checks in the stage.

### Check
- [ ] Service can be operated if primary maintainer is unavailable
- [ ] Undocumented hidden config or steps are surfaced
- [ ] External credentials/access dependencies are documented enough for handoff
- [ ] Reviewer flags operational fragility rooted in one person’s memory
- [ ] Recovery does not depend on access or knowledge held by only one person without backup path

### Common failure patterns
- only one person knows the release sequence
- only one person has the provider/dashboard credentials needed for diagnosis
- only the original prompter understands which generated files are safe to touch during incident response

---

## Step 5 — Review Toil & Automation Readiness

Determine whether operational burden is sustainable.

### Check
- [ ] Recurring manual tasks are documented
- [ ] High-frequency toil items are identified for automation
- [ ] Scheduled/background operational behaviors are visible
- [ ] “Manual for now” tasks include risk acknowledgment and scope bounds
- [ ] Reviewer distinguishes acceptable low-frequency manual work from reliability-threatening toil

### Common failure patterns
- cron/background tasks exist but are undocumented
- critical manual cleanup is required routinely with no owner or procedure
- repetitive human interventions are normalized instead of treated as operational debt

---

## Step 6 — Review Incident Response Basics

Determine whether likely incidents have a usable first response path.

### Check
- [ ] Alert destination exists
- [ ] Severity model or triage language exists, even if lightweight
- [ ] First-response steps for likely incidents are documented
- [ ] Post-incident capture/learning path exists
- [ ] Reviewer can see how incidents would be escalated, stabilized, and learned from

### Common failure patterns
- alerts exist but no one clearly owns them
- incident guidance is generic and not tied to this service
- post-incident learning is implied but not operationalized anywhere

---

## Step 7 — Review Design / Risk Comments as Evidence

Operational comments may explain context, but they do not substitute for support artifacts.

### Check
- [ ] Operational rationale comments are checked against real procedures
- [ ] Comments are not accepted as substitutes for runbook steps
- [ ] Reviewer challenges weak “temporary” operations shortcuts
- [ ] Hidden manual steps surfaced only in comments are treated as supportability risk

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 9:** supportability realism, ownership durability, and unowned operational debt affecting final readiness judgment
- **Security 9:** operational/ownership gaps that weaken patching, incident response, or risk accountability where relevant

### Required handoff block
- **Carry-forward concerns:**
  - Runbook/procedure gap:
  - Ownership/escalation gap:
  - Diagnosability weakness:
  - Single-maintainer / tribal-knowledge risk:
  - Toil / manual-ops burden:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** emphasize whether AI behavior, prompts, tool policies, and provider issues are supportable by humans who did not author them
- **bug-hunt lens:** emphasize hidden operational ambiguity likely to slow incident response
- **platform lens:** emphasize environment-specific runbook drift and operator assumptions
- **credentials lens:** emphasize access/credential dependency bottlenecks in incident response and handoff

---

## Severity / Gating Model

### PASS
Use PASS when:
- operators have clear, usable procedures and signals
- ownership and escalation are explicit
- single-maintainer risk is bounded enough for service scope

### NEEDS_WORK
Use NEEDS_WORK when:
- operations posture is workable but fragile
- key docs, escalation paths, or incident procedures are incomplete
- supportability depends too much on tacit knowledge but can be remediated

### BLOCK
Use BLOCK when:
- service cannot be credibly operated by someone other than the original builder
- runbook/escalation gaps make incident response unsafe
- single-maintainer dependency is acute and unbounded
- later production readiness would rely on tribal memory rather than durable operations knowledge

---

## Escalation Guidance

Escalate or explicitly flag when:
- critical recovery steps live only in one person’s head
- no durable escalation path exists for likely incidents
- diagnosability is so weak that non-authors would be effectively blind
- routine manual toil is high enough to threaten reliable operation

If a competent non-author operator could not safely run and recover the service, use **BLOCK**.

---

## Required Report Format

### 1. Operational Readiness Summary
- Overall supportability level:
- Non-author operability confidence:
- Biggest operational fragilities:

### 2. Runbook / Escalation Findings
- Procedure quality:
- Escalation/contact clarity:
- Freshness/trustworthiness of docs:

### 3. Diagnosability Findings
- Telemetry usefulness for operators:
- Silent-failure concerns:
- Need for source archaeology:

### 4. Single-Maintainer Risk Findings
- Knowledge bottlenecks:
- Access/credential bottlenecks:
- Handoff resilience:

### 5. Toil / Automation Findings
- Recurring manual tasks:
- Automation gaps:
- Sustainability concerns:

### 6. Incident-Readiness Findings
- First-response readiness:
- Severity/triage quality:
- Post-incident learning loop:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- mistake install docs for operating docs
- assume the original builder’s competence solves supportability
- ignore single-maintainer risk because the service is still young
- accept comment-level operations guidance instead of runbook-quality steps
- move on if incident recovery still depends on tribal memory

---

## Final Standard

A project passes this stage only if the reviewer can say:

> Someone other than the original builder could realistically run, debug, and recover this service using durable operational artifacts, clear escalation paths, and sufficient signal — without needing hidden context or heroic guesswork.

If that statement cannot be made honestly, this stage should not pass.

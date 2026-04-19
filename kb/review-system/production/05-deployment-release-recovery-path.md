---
type: review-stage
review_type: production
stage: 5
stage_name: "Deployment Release Recovery Path"
version: 1.0
updated: 2026-04-18
---
# Production Stage 5 — Deployment, Release & Recovery Path

## Stage Metadata
- **Review type:** Production
- **Stage number:** 5
- **Stage name:** Deployment, Release & Recovery Path
- **Purpose in review flow:** Verify that releases are repeatable, controlled, and recoverable without relying on heroics or hidden operator memory
- **Default weight:** High
- **Required reviewer posture:** Change-risk-aware, rollback-conscious, skeptical of one-shot deployment success stories
- **Lens interaction:** Lenses may intensify scrutiny on specific rollout or recovery hazards, but all reviews must evaluate reproducibility, gating, and recovery realism
- **Depends on:** Production Stages 1–4, Code Stage 9 release-confidence findings, Security Stage 9 release-security posture, and Security Stage 8 deployment-trust findings where relevant
- **Feeds into:** Production Stages 6 and 9
- **Security/Production handoff:** Carry forward migration risk, rollback limitations, release-control gaps, and AI-configuration release hazards that affect resilience and final go/no-go judgment

---

## Why This Stage Exists

A service is not production-ready just because it can be deployed once.

Vibe-coded projects often have fragile release posture such as:
- manual “SSH and run commands” deployment
- migrations executed implicitly at startup
- no credible rollback plan
- environment secrets/config patched ad hoc during release
- readiness checks that always say “OK”
- model/provider/prompt/tool-policy changes that alter service behavior without normal release control

The first deploy may work. The second deploy, rollback, or emergency fix is where production reality shows up.

This stage asks:

> Can this service be deployed repeatedly, changed safely, and recovered under pressure without hidden knowledge or wishful thinking?

### Boundary clarification
- **Production Stage 5** asks whether release and rollback mechanics are controlled and repeatable.
- **Production Stage 6** asks whether the running service contains and survives partial failure safely after release.

Stage 5 is about change/recovery process. Stage 6 is about runtime resilience behavior.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the deployment path is repeatable and controlled
2. Whether release prerequisites and checks are explicit
3. Whether schema/data/model/config changes are handled safely
4. Whether rollback and recovery are feasible under pressure
5. Whether release confidence is supported by real mechanisms rather than operator optimism

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Deployment/release posture summary**
2. **Parity/config findings**
3. **Migration/rollback findings**
4. **Health-check/readiness findings**
5. **Release-gating findings**
6. **Key release/recovery risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- deployment scripts/manifests
- CI/CD workflow definitions
- migration files and migration execution path
- config/env management approach
- health/readiness checks used during release
- comments/docs describing rollout and rollback
- AI model/provider/version/prompt/tool-policy artifacts where relevant

---

## Core Review Rule

Do not reward a project for one successful deployment.

A project does **not** get release-readiness credit because:
- someone once launched it manually
- deployment docs exist but depend on hidden operator memory
- health checks always report success
- rollback is “just revert the code” despite schema/state changes
- AI-native behavior changes can be made outside normal release controls

The reviewer must judge whether repeated safe change is actually plausible.

---

# Review Procedure

## Step 1 — Review Deployment Repeatability

Determine whether the deployment path can be repeated without guesswork.

### Check
- [ ] Deployment path is scripted/automated enough to be repeatable
- [ ] Build/deploy inputs are controlled (pinned images/dependencies/artifacts where practical)
- [ ] Runtime config is injected externally rather than hardcoded into artifacts
- [ ] Cold-start deployment is possible without undocumented pre-steps
- [ ] Deployment has evidence of working beyond a one-time first deploy where relevant
- [ ] Releases involving important state changes include pre-deploy backup/restore awareness where appropriate

### Common failure patterns
- deployment depends on copying commands from chat or shell history
- release success depends on one operator’s personal machine state
- first deployment works, but subsequent ones fail due to drift or manual steps

---

## Step 2 — Review Environment Parity & Config Discipline

Determine whether environment differences are controlled rather than accidental.

### Check
- [ ] Environment differences are primarily configuration, not hidden code forks
- [ ] Secrets/config are managed without unsafe shortcuts
- [ ] Config drift risk between dev/staging/prod is visible and bounded
- [ ] Feature flags/config toggles are explicit enough for controlled rollout
- [ ] Reviewer flags release-critical behavior controlled only by tribal knowledge

### Reviewer questions
- What actually changes between environments?
- Could production break because config behavior differs from what dev/testing exercised?
- Are toggles and flags part of release control, or ad hoc patch points?

---

## Step 3 — Review Migration & State-Change Safety

Determine whether changes to data or durable state are survivable.

### Check
- [ ] Migrations are versioned and reviewable
- [ ] Destructive or irreversible changes are explicitly identified
- [ ] Migration timing/order is controlled and does not depend on startup races
- [ ] Backward/forward compatibility assumptions are visible enough to review
- [ ] Reviewer flags schema/data changes that make rollback fiction more likely

### Example — Incorrect
```python
# app startup
alembic.upgrade('head')
```
Why it fails:
- unsafe in multi-instance deployment
- migration timing is coupled to restart/scaling behavior

### Example — Better
- migration executed as a controlled pre-deploy step separate from app startup

Why it passes:
- schema-change order is intentional and reviewable

---

## Step 4 — Review Rollback & Recovery Path

Determine whether the system can recover credibly from a bad release.

### Check
- [ ] Rollback procedure is documented and plausible
- [ ] Recovery path after failed deploy is defined, including schema/data considerations
- [ ] Health checks reflect operational readiness rather than process liveness alone
- [ ] Release strategy (rolling, canary, blue-green, single-shot, etc.) is explicit and appropriate for scope
- [ ] Reviewer can explain what happens if the new release fails 5 minutes after deploy

### Common failure patterns
- rollback means only “git revert” despite irreversible state change
- readiness says healthy while core dependencies are down
- recovery path exists only in optimistic prose

---

## Step 5 — Review Release Gating & Operational Handoff

Determine whether release decisions have meaningful safeguards.

### Check
- [ ] Release gate includes basic readiness checks
- [ ] Post-deploy verification is visible enough to catch immediate regressions
- [ ] Ownership/escalation path exists for release incidents
- [ ] “Ship now, fix later” language in critical release paths is challenged directly
- [ ] Reviewer distinguishes ceremonial gates from evidence-based release control

### Common failure patterns
- deployment auto-promotes without meaningful verification
- release owner is unclear during incidents
- post-deploy validation is assumed rather than executed

---

## Step 6 — Review AI-Native Deployment Artifacts

This is required for AI-native services.

### Check
- [ ] Model version/provider selection is treated as a versioned release-affecting artifact where relevant
- [ ] Prompt templates, system prompts, and agent-behavior configuration are controlled with deployment discipline
- [ ] Tool/permission policies are treated as release-affecting artifacts
- [ ] Reviewer flags AI-native behavior changes that can materially alter service behavior without normal release control

### Important rule
For AI-native systems, changing prompts, models, or tool policies can be a production release even when application code does not change.

---

## Step 7 — Review Design / Risk Comments as Evidence

Release comments may explain intent, but they do not create a safe recovery path.

### Check
- [ ] “Temporary deploy shortcut” comments are treated as debt/risk
- [ ] Comments claiming rollback safety are checked against real mechanisms
- [ ] Reviewer flags confidence claims unsupported by release/recovery evidence
- [ ] Operator-memory-dependent instructions are surfaced as release risk

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 6:** recovery and degraded-mode limits affecting resilience under failure
- **Production 9:** repeatability, rollback, and release-control realism affecting final production readiness judgment
- **Security 9:** release-control weaknesses or rollback gaps that materially affect security release posture

### Required handoff block
- **Carry-forward concerns:**
  - Repeatability / operator-memory risk:
  - Config/parity drift risk:
  - Migration / state-change rollback risk:
  - Readiness / health-signal trust risk:
  - AI-native release-control risk:

---

## Lens Interaction Guidance

Examples:
- **platform lens:** emphasize deployment-model-specific rollout, readiness, and rollback realities
- **llm-focused lens:** emphasize model/prompt/tool-policy drift outside standard release controls
- **bug-hunt lens:** emphasize release paths likely to amplify latent defects into incidents
- **credentials lens:** emphasize deploy-time secret/config changes that widen blast radius during rollout or rollback

---

## Severity / Gating Model

### PASS
Use PASS when:
- deployment path is repeatable and controlled
- migration and rollback risk are bounded and explicit
- release/recovery confidence is backed by real mechanisms and checks

### NEEDS_WORK
Use NEEDS_WORK when:
- release path exists but has meaningful control, parity, or rollback gaps
- risks are fixable but currently too weak for confident deployment

### BLOCK
Use BLOCK when:
- deployment/recovery path is unsafe or undefined for the expected release scope
- migration/rollback posture creates high likelihood of irreversible incident
- release confidence materially exceeds available evidence
- later production readiness would depend on rollback fiction or hidden operator heroics

---

## Escalation Guidance

Escalate or explicitly flag when:
- release depends on undocumented operator steps
- schema/state changes make rollback materially unclear
- readiness checks are misleading enough to cause bad rollout decisions
- AI-native behavior can change materially outside normal release discipline

If a failed release would be hard to contain or reverse under pressure, use **BLOCK**.

---

## Required Report Format

### 1. Deployment / Release Posture Summary
- Release path overview:
- Repeatability confidence:
- Recovery confidence:

### 2. Parity / Config Findings
- Environment drift concerns:
- Config/secret discipline:
- Flag/toggle control quality:

### 3. Migration / Rollback Findings
- Migration safety posture:
- Reversibility / rollback realism:
- State-change hazards:

### 4. Health-Check / Readiness Findings
- Readiness truthfulness:
- Deployment gating quality:
- Misleading signal risks:

### 5. Release-Gating Findings
- Pre/post-deploy checks:
- Ownership/escalation path:
- AI-native release artifacts:

### 6. Key Release / Recovery Risks
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
- accept first-deploy success as evidence of repeatable release safety
- trust rollback claims without checking state and migration consequences
- treat readiness checks as meaningful unless they reflect real service truth
- ignore prompt/model/tool-policy changes in AI-native systems because “code didn’t change”
- let operator heroics masquerade as deployment process

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand how this service is released, how it would be changed again safely, what protects it from bad rollout decisions, and how it would recover if a release goes wrong without relying on undocumented heroics or rollback fiction.

If that statement cannot be made honestly, this stage should not pass.

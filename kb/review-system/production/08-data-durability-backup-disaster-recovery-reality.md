---
type: review-stage
review_type: production
stage: 8
stage_name: "Data Durability Backup Disaster Recovery Reality"
version: 1.0
updated: 2026-04-18
---
# Production Stage 8 — Data Durability, Backup & Disaster Recovery Reality

## Stage Metadata
- **Review type:** Production
- **Stage number:** 8
- **Stage name:** Data Durability, Backup & Disaster Recovery Reality
- **Purpose in review flow:** Verify that critical data can survive likely failure scenarios and be restored within realistic recovery targets
- **Default weight:** High
- **Required reviewer posture:** Durability-focused, restore-skeptical, intolerant of backup theater
- **Lens interaction:** Lenses may intensify particular durability risks, but all reviews must test whether recovery claims are evidence-backed and operationally realistic
- **Depends on:** Production Stages 2, 5, and 6; Security Stage 9 residual risks affecting recovery; Code Stage 8 retention/deletion context where relevant
- **Feeds into:** Production Stage 9
- **Security/Production handoff:** Carry forward durability weaknesses, restore-confidence gaps, RTO/RPO fiction, and recovery-security concerns that affect final production readiness

---

## Why This Stage Exists

Backups do not matter if they cannot be restored.

Vibe-coded projects often have durability theater such as:
- backup jobs configured but never restored from
- critical data mixed with ephemeral state or caches
- no tested path for corruption, deletion, provider outage, or operator error
- RTO/RPO targets that are undefined or impossible
- recovery paths that ignore security realities like key availability or restored-state trust

This stage asks:

> If important data is lost, corrupted, deleted, or made unavailable, can this service actually recover within a believable timeframe and trust boundary?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What data is critical and where it lives
2. Whether critical stores are backed up and monitored appropriately
3. Whether backups can actually be restored
4. Whether recovery targets are defined and realistic
5. Whether likely disaster scenarios have a credible and secure recovery path

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Data durability summary**
2. **Backup coverage findings**
3. **Restore validation findings**
4. **RTO/RPO alignment findings**
5. **Disaster-scenario readiness findings**
6. **Key durability risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- data store inventory docs/config
- backup jobs/config/schedules
- alerting for backup failures
- recovery runbooks and test records
- migration/state durability notes
- comments/docs around retention/deletion/restore assumptions
- security notes about key availability, access control, or restored-state trust

---

## Core Review Rule

Do not reward the existence of backup configuration.
Reward evidence that recovery would actually work.

A project does **not** get durability credit because:
- a backup job exists
- a cloud provider advertises snapshot support
- restore docs were written once
- RTO/RPO values appear in a slide or doc
- comments say the data is “safe by default”

The reviewer must judge recovery reality, not backup symbolism.

---

# Review Procedure

## Step 1 — Review Data Inventory & Criticality

Determine what data actually matters.

### Check
- [ ] Persistent stores are identified and classified (critical, important, ephemeral)
- [ ] Sensitive or regulated data locations are explicit enough to review
- [ ] Ownership of each store is clear enough for recovery accountability
- [ ] Retention and deletion expectations are visible
- [ ] Reviewer can distinguish true source-of-truth data from caches, queues, temp state, and replicas

### Reviewer questions
- What data would materially harm the service or users if lost?
- Where does that data live?
- Which stores are optional versus mission-critical?

---

## Step 2 — Review Backup Coverage & Integrity

Determine whether critical data is actually protected.

### Check
- [ ] Critical stores have backup mechanisms
- [ ] Backup schedule/frequency aligns with data-loss tolerance
- [ ] Backup destination is separated from the primary failure domain appropriately
- [ ] Backup jobs are monitored and failure-alerted
- [ ] Backup completeness/integrity is verified beyond “job succeeded” where possible

### Common failure patterns
- backup job runs but auth expired or uploads fail silently
- backups stored in the same failure domain as the primary system
- backup cadence incompatible with claimed recovery point objective

---

## Step 3 — Review Restore & Recovery Validation

Determine whether backups can actually be turned back into working state.

### Check
- [ ] Restore procedure is documented step-by-step
- [ ] At least one end-to-end restore test exists, or its absence is explicitly flagged
- [ ] Restore validation includes integrity checks
- [ ] Recovery does not rely on production-only assumptions unavailable during a disaster
- [ ] Reviewer lowers confidence sharply when restore confidence is theoretical only

### Example — Incorrect
- daily backup job exists, but no restore test has ever been run

Why it fails:
- recovery capability is assumed, not evidenced

### Example — Better
- monitored backup job plus documented periodic restore test with outcome/time/integrity notes

Why it passes:
- restore reality is evidenced rather than hoped for

---

## Step 4 — Review RTO / RPO Reality

Determine whether recovery targets match actual mechanisms.

### Check
- [ ] RTO and RPO are defined, even if provisional
- [ ] Backup/restore design is compatible with stated targets
- [ ] Reviewer flags targets that are aspirational but unsupported
- [ ] Gap between target and likely reality is made explicit
- [ ] AI/provider-bound state or externalized data dependencies are considered where they affect recovery targets

### Example — Incorrect
- RPO claimed as 5 minutes with once-daily backups

Why it fails:
- objective and mechanism are incompatible

---

## Step 5 — Review Disaster Scenario Coverage

Determine whether likely disaster cases have real recovery paths.

### Check
- [ ] Accidental deletion scenario has a recovery path
- [ ] Corruption scenario has a recovery path
- [ ] Provider/outage scenario has a recovery path where relevant
- [ ] Security incident or ransomware impact on data durability is considered
- [ ] Reviewer flags when one likely disaster mode has no credible documented response

### Common failure patterns
- backup story covers deletion but not corruption
- cloud outage assumed impossible or out of scope without justification
- recovery plan ignores compromise of keys or credentials needed to restore safely

---

## Step 6 — Review Ephemeral vs Durable State Hygiene

Determine whether durability assumptions match actual state behavior.

### Check
- [ ] Critical data is not stored only in ephemeral process memory/cache
- [ ] Message/queue durability expectations are explicit
- [ ] Temporary storage cleanup does not erase required durable state
- [ ] Reviewer challenges misplaced durability assumptions in comments or architecture claims
- [ ] Restart/recovery logic does not quietly rely on ephemeral state surviving

### Common failure patterns
- important workflow state held only in memory
- queue semantics implied durable even though restart drops work
- cache treated as authoritative source during recovery

---

## Step 7 — Review Security Cross-Reference for Recovery

Recovery must preserve trust, not just raw bytes.

### Check
- [ ] Recovery procedures account for security controls, not only data restoration
- [ ] Backup/restore paths do not reintroduce weaker security posture than production
- [ ] Security Stage 9 residual risks affecting durability, key availability, access control, or restored-state trust are cross-referenced explicitly
- [ ] DR confidence is reduced where security residual risks make restored-state safety questionable

### Important rule
A restore path that recreates data but breaks trust boundaries, key management, or access control is not a full recovery path.

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Production 9:** durability confidence, restore realism, and disaster-readiness limits affecting final production readiness judgment
- **Security 9:** recovery-security coupling issues where restored-state safety depends on unresolved security controls

### Required handoff block
- **Carry-forward concerns:**
  - Critical-store coverage gap:
  - Restore-validation weakness:
  - RTO/RPO realism gap:
  - Disaster-scenario blind spot:
  - Recovery-security coupling risk:

---

## Lens Interaction Guidance

Examples:
- **platform lens:** emphasize storage topology, provider-failure domains, and restore environment realism
- **credentials lens:** emphasize key availability, access control, and secure secret handling during restore
- **llm-focused lens:** emphasize recovery of provider-bound artifacts, prompts, vector stores, and model-configuration state where those are operationally critical
- **bug-hunt lens:** emphasize subtle state/durability assumptions likely to fail during real incidents

---

## Severity / Gating Model

### PASS
Use PASS when:
- critical data stores have credible backup and tested restore paths
- RTO/RPO are defined and plausibly achievable
- reviewer can justify durability confidence with concrete evidence

### NEEDS_WORK
Use NEEDS_WORK when:
- baseline backup exists but testing, integrity checks, or target alignment are incomplete
- risks are significant but fixable before broader production confidence

### BLOCK
Use BLOCK when:
- critical data durability is unproven or clearly unsafe
- no credible recovery path exists for likely data-loss scenarios
- backup/restore posture materially contradicts release claims
- later production readiness would depend on backup theater rather than restoration reality

---

## Escalation Guidance

Escalate or explicitly flag when:
- critical stores lack tested restore evidence
- RTO/RPO claims clearly exceed what backup cadence and restore speed can support
- recovery depends on security-sensitive material that may be unavailable or compromised
- provider or infrastructure outages would leave the system with no believable restoration path

If critical data survival is mostly optimism, use **BLOCK**.

---

## Required Report Format

### 1. Data Durability Summary
- Critical data stores:
- Overall backup/restore confidence:
- Biggest recovery uncertainties:

### 2. Backup Coverage Findings
- Covered vs uncovered stores:
- Backup cadence/separation quality:
- Monitoring/integrity-check quality:

### 3. Restore Validation Findings
- Restore procedure quality:
- Evidence of restore testing:
- Integrity-validation quality:

### 4. RTO / RPO Alignment Findings
- Claimed targets:
- Mechanism fit:
- Reality gap:

### 5. Disaster-Scenario Readiness Findings
- Deletion/corruption/provider-outage readiness:
- Security-incident recovery implications:
- Recovery blind spots:

### 6. Key Durability Risks
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
- equate successful backup jobs with proven recovery
- ignore queues/caches/temp state when they are effectively acting as durable systems
- trust RTO/RPO claims without comparing them to actual backup and restore mechanics
- treat restore as complete if security posture after restore is weaker or unclear
- move on when durability confidence is still mostly theoretical

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what data is truly critical, it is backed up and restorable with believable evidence, the recovery targets are grounded in actual mechanisms, and likely disaster scenarios have recovery paths that restore both service function and trust boundaries responsibly.

If that statement cannot be made honestly, this stage should not pass.

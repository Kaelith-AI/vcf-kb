---
type: review-stage
review_type: security
stage: 8
stage_name: "Infrastructure Isolation Deployment Surface"
version: 1.0
updated: 2026-04-18
---
# Security Stage 8 — Infrastructure, Isolation & Deployment Surface

## Stage Metadata
- **Review type:** Security
- **Stage number:** 8
- **Stage name:** Infrastructure, Isolation & Deployment Surface
- **Purpose in review flow:** Verify that deployment infrastructure, runtime isolation, and exposed deployment surface do not quietly undermine the project’s security posture
- **Default weight:** High
- **Required reviewer posture:** Deployment-aware, privilege-conscious, skeptical of convenience defaults and config theater
- **Lens interaction:** Lenses may intensify particular infrastructure risks, but all reviews must assess privilege, exposure, isolation, and deployment trust for the actual runtime model
- **Depends on:** Security Stage 1 trust-boundary map, Security Stage 3 enforcement expectations, Security Stage 5 supply-chain trust findings, Security Stage 6 secret/runtime credential findings, and Code Stage 6 platform/deployment assumptions
- **Feeds into:** Security Stage 9, Production Stages 2, 5, and 9
- **Security/Production handoff:** Carry forward isolation weaknesses, deployment-surface overexposure, secrets-in-artifacts risk, wildcard IAM/role issues, and CI/CD trust gaps affecting final release judgment

---

## Why This Stage Exists

Secure-looking application code can still be deployed in a way that makes compromise easy.

Vibe-coded projects often reach deployment through convenience defaults such as:
- containers running as root
- ports exposed broadly
- base images left unpinned
- secrets baked into images or deploy configs
- CI/CD pipelines made permissive because speed mattered more than isolation
- no real infrastructure-as-code, only shell scripts and memory

These are exactly the conditions that turn an application flaw into a much broader compromise.

This stage asks:

> Does the actual deployment model enforce meaningful isolation, narrow exposure, and controlled runtime trust — or does infrastructure quietly undo the rest of the security story?

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the runtime environment is isolated appropriately for the project’s risk level
2. Whether the exposed deployment surface is narrower than convenience defaults would otherwise make it
3. Whether infra definitions and actual deployment assumptions are aligned
4. Whether secrets and identities are handled safely at deploy time
5. Whether compromise of one process/container/service would be meaningfully contained

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Deployment/infrastructure security summary**
2. **Isolation and privilege findings**
3. **Network exposure findings**
4. **Secrets injection / runtime trust findings**
5. **IaC / IAM / pipeline findings**
6. **Key infrastructure risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- Dockerfiles, compose files, Helm charts, k8s manifests, system/service unit files, serverless configs, Terraform/Pulumi/CloudFormation where present
- CI/CD workflow definitions
- service account / IAM / role bindings where visible
- network/security-group/policy definitions where present
- startup scripts, entrypoints, and base-image references
- deployment docs and comments describing runtime isolation or exceptions

---

## Core Review Rule

Do not assume deployment is someone else’s problem.

A project does **not** get infrastructure-security credit because:
- it has a Dockerfile
- it has a Helm chart
- it deploys on a managed platform
- its docs mention least privilege
- it “only exposes one port” while broad internal trust remains uncontrolled

The reviewer must evaluate the actual deployment shape the project appears to use.

---

# Review Procedure

## Step 1 — Review Process / Container Isolation

Determine whether runtime privilege and isolation match actual need.

### Check
- [ ] Processes or containers do not run with unnecessary privilege
- [ ] Root execution, privileged mode, host namespace sharing, or excessive capabilities are identified and justified if present
- [ ] Filesystem write access is constrained where feasible
- [ ] Runtime hardening profiles or equivalent controls are visible where expected

### Example — Incorrect
- container runs as root with privileged mode enabled and no clear reason

Why it fails:
- compromise blast radius is large
- isolation assumptions are weak by default

### Example — Better
- container runs as non-root, no privileged mode, and only required capabilities remain

Why it passes:
- runtime privilege better matches actual function

---

## Step 2 — Review Network Exposure & Reachability

Determine whether public and internal surfaces are meaningfully separated.

### Check
- [ ] Only necessary ports and services are exposed
- [ ] Public vs internal interfaces are clearly distinguished
- [ ] Debug, admin, metrics, and maintenance surfaces are not broadly reachable without justification
- [ ] Lateral movement is not made trivially easy by flat or overexposed network assumptions

### Common failure patterns
- internal helpers exposed on public ingress
- metrics/admin endpoints reachable from broad networks
- deployment assumes private networking that config does not actually enforce

---

## Step 3 — Review Filesystem / Volume / Host Boundary Safety

Determine whether deploy-time storage and host boundaries are too porous.

### Check
- [ ] Secrets, keys, and certs are not broadly writable or unnecessarily persistent
- [ ] Sensitive mounts are constrained appropriately
- [ ] Host-sensitive paths are not casually bind-mounted into app containers/services
- [ ] Temporary/work directories do not create obvious cross-run data leakage

### Common failure patterns
- host docker socket mounted into app container without strong reason
- broad writable volumes shared across unrelated services
- secrets mounted in ways many processes can read casually

---

## Step 4 — Review Infrastructure-as-Code & Permission Discipline

Determine whether deployment definitions reflect a least-privilege posture.

### Check
- [ ] IaC, where used, reflects actual intended deployment posture
- [ ] IAM/service-account/role permissions are not obviously overbroad
- [ ] Public storage, broad trust policies, or wildcard permissions are surfaced explicitly
- [ ] Reviewer notes whether there is any visible mechanism to detect infrastructure drift away from reviewed configuration
- [ ] Infra comments/docs claiming least privilege or isolation are checked against definitions

### Example — Incorrect
- service role has `*` permissions over broad resources “for now”

Why it fails:
- compromise blast radius is much larger than the app itself

---

## Step 5 — Review Secrets Injection & Runtime Trust

Determine whether deploy-time secret handling widens exposure.

### Check
- [ ] Secrets are injected via appropriate runtime mechanisms, not baked into artifacts
- [ ] Config defaults do not contain real secrets
- [ ] Runtime secret delivery path is visible enough to review
- [ ] Reviewer flags deployment-time trust assumptions that are too broad or too implicit

### Example — Incorrect
```dockerfile
ENV DB_PASSWORD=Sup3rS3cr3t
```
Why it fails:
- secret is embedded in image history and artifact distribution path

### Example — Better
- runtime secret loaded from secret manager or environment injection at deploy time

---

## Step 6 — Review Build / Deploy Pipeline Security

Determine whether the path into production is itself trustworthy.

### Check
- [ ] CI/CD does not expose secrets to untrusted workflows casually
- [ ] Artifact handoff from build to deploy is not obviously tamper-prone
- [ ] Production deployment requires intentional paths, not accidental convenience triggers
- [ ] Base images and build inputs are pinned or controlled well enough for security-review confidence

### Common failure patterns
- untrusted pull-request workflows gaining deploy secrets
- broad branch triggers promoting changes to production automatically without guardrails
- mutable base images undermining artifact trust

---

## Step 7 — Adapt the Review to the Real Deployment Model

Apply the same security questions to whichever runtime model is actually used.

### Reviewer must adapt checks to:
- containerized platforms
- process/service deployments on VMs or bare metal
- serverless functions
- managed PaaS runtimes

### Rule
The exact artifacts differ, but the core question stays the same:
- are privilege, isolation, exposure, and deploy-time trust boundaries actually enforced for the real runtime model?

---

## Step 8 — Review Infrastructure Comments / Risk Notes as Evidence

Infrastructure comments may describe intent, but they do not prove hardening.

### Check
- [ ] Comments justifying privileged deploy shortcuts are treated as debt
- [ ] Reviewer challenges “temporary” infrastructure risk that creates broad compromise potential
- [ ] Claimed deployment isolation is verified against actual config where possible

### Common failure patterns
- comments say container is internal-only while service is published broadly
- docs say least privilege while IAM policy is wildcarded in practice

---

## Step 9 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 9:** unresolved infrastructure and deployment-trust risk affecting release posture
- **Production 2:** state and environment boundary contradictions
- **Production 5:** deployability, artifact trust, and rollout exposure concerns
- **Production 9:** final go/no-go implications of privilege and isolation weakness

### Required handoff block
- **Carry-forward concerns:**
  - Isolation / privilege weakness:
  - Network exposure risk:
  - Host/filesystem boundary risk:
  - Secrets-in-artifacts or runtime secret-delivery risk:
  - IAM / role / pipeline trust risk:

---

## Lens Interaction Guidance

Examples:
- **platform lens:** primary intensifier here; emphasize runtime model specifics, network boundaries, filesystem exposure, and host/container assumptions
- **credentials lens:** emphasize deploy-time secret injection, service-account scope, and artifact secret leakage
- **llm-focused lens:** emphasize agent/tool workloads that may amplify the blast radius of infrastructure over-privilege
- **bug-hunt lens:** emphasize deployment defaults likely to turn modest defects into full compromise

---

## Severity / Gating Model

### PASS
Use PASS when:
- infrastructure and deployment surface are controlled enough for the project’s risk level
- major isolation and privilege assumptions are visible and credible
- reviewer can explain why compromise paths are reasonably contained

### NEEDS_WORK
Use NEEDS_WORK when:
- infrastructure security is directionally workable but has meaningful hardening gaps
- privileges, exposure, or artifact trust are broader than they should be, but still fixable before release

### BLOCK
Use BLOCK when:
- deployment isolation is materially unsafe
- infrastructure exposure or privilege posture creates obvious high-severity compromise paths
- actual deployment shape contradicts claimed security posture in ways that invalidate confidence
- CI/CD or runtime trust boundaries are so weak that shipping would be irresponsible

---

## Escalation Guidance

Escalate or explicitly flag when:
- root/privileged runtime posture appears unnecessary
- wildcard IAM or broad trust policies create outsized blast radius
- secrets are baked into images or deploy artifacts
- real deployment shape differs materially from reviewed docs or IaC

If infrastructure quietly undoes the rest of the security posture, use **BLOCK**.

---

## Required Report Format

### 1. Deployment / Infrastructure Security Summary
- Actual deployment model:
- Highest-risk infrastructure assumptions:
- Overall containment confidence:

### 2. Isolation & Privilege Findings
- Runtime privilege posture:
- Container/process isolation concerns:
- Hardening-control visibility:

### 3. Network Exposure Findings
- Publicly reachable services:
- Internal-vs-public separation quality:
- Lateral-movement concerns:

### 4. Secrets Injection / Runtime Trust Findings
- Secret delivery model:
- Secrets-in-artifacts concerns:
- Deploy-time trust assumptions:

### 5. IaC / IAM / Pipeline Findings
- IaC alignment to reality:
- IAM/service-account posture:
- CI/CD trust and artifact integrity concerns:

### 6. Key Infrastructure Risks
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
- assume managed infrastructure means safe defaults
- ignore deployment config because the code itself looks secure
- treat IaC presence as proof of least privilege
- forget that CI/CD and artifact trust are part of the attack surface
- allow broad infrastructure privilege to hide behind “temporary” comments

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand how this system is actually deployed, its privilege and exposure posture are reasonably bounded for that runtime model, and compromise of one component would be meaningfully contained rather than amplified by careless infrastructure defaults.

If that statement cannot be made honestly, this stage should not pass.

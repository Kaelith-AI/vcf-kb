---
type: review-stage
review_type: code
stage: 6
stage_name: "Platform Environment Compatibility"
version: 1.0
updated: 2026-04-18
---
# Code Stage 6 — Platform & Environment Compatibility

## Stage Metadata
- **Review type:** Code
- **Stage number:** 6
- **Stage name:** Platform & Environment Compatibility
- **Purpose in review flow:** Determine whether the project actually fits the operating environments, runtimes, and deployment contexts it claims to support
- **Default weight:** High
- **Required reviewer posture:** Environment-aware, suspicious of “works on my machine” confidence
- **Lens interaction:** Platform lenses intensify this stage directly; other lenses may emphasize specific compatibility risks but do not reduce the requirement to verify real environment fit
- **Depends on:** Code Stage 1 claimed scope/support boundaries, Code Stage 3 setup/build evidence, Code Stage 5 dependency/runtime expectations
- **Feeds into:** Code Stage 9, Security Stage 8, Production Stages 2 and 5
- **Security/Production handoff:** Record environment-specific permission, exposure, deployment-model, and unsupported-runtime risks for later infrastructure and release review

---

## Why This Stage Exists

This stage exists because compatibility claims are often much weaker than they sound.

Vibe-coded projects frequently inherit environment assumptions from examples, templates, and whichever machine the code happened to be generated and tested on. That produces common failure modes such as:
- POSIX shell assumptions in supposedly cross-platform tooling
- hardcoded paths, usernames, ports, or local directories
- undocumented env vars or background services
- runtime-version drift between docs, scripts, and actual code
- Docker or deployment files that look official but do not reflect how the system truly runs
- container-native claims for software that only works in a manually prepared local setup

This stage answers:

> Does the project actually work in the environments it claims to support?

Not in theory.
Not in template language.
Not on the original builder’s laptop only.
In the environments the project says it supports.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What operating environments and platforms the project claims to support
2. Whether the code, scripts, and runtime assumptions fit those claims
3. Whether config and environment requirements are explicit enough to reproduce behavior
4. Whether platform-specific traps or hidden assumptions are likely to break users or deployers
5. Whether compatibility comments/docs are descriptive of reality rather than aspirational

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Supported-platform claim summary**
2. **Actual compatibility findings**
3. **Environment/config assumption findings**
4. **Runtime/script portability findings**
5. **Container vs bare-metal / deployment-model findings**
6. **Compatibility docs/comments contradiction findings**
7. **Carry-forward deployment/use risks**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- README and docs for platform/support claims
- startup/build/run scripts
- env/config loading logic
- runtime version declarations (`engines`, `.python-version`, Docker base image, toolchain files, etc.)
- filesystem/path handling patterns
- OS-specific subprocess calls, shell usage, permissions, signals, temp-file behavior
- Dockerfiles / compose / deployment scripts where present
- comments or docs discussing compatibility, support, or trade-offs

If practical, spot-check the declared environment path by attempting representative commands or by verifying script plausibility against the claimed runtime.

---

## Core Review Rule

Do not reward a project for being **runnable somewhere**.

This stage is about whether it is runnable in the environments it **claims** to support.

A project does not earn compatibility credit because:
- it works on the author’s machine
- it runs inside one lucky container image
- a README says “cross-platform”
- there is a Dockerfile in the repo
- scripts succeed only after undocumented local rituals

---

# Review Procedure

## Step 1 — Verify Platform & Support Claims

Identify the environments the project explicitly or implicitly claims to support.

### Check
- [ ] Supported operating systems/platforms are explicit enough to verify
- [ ] Runtime/deployment context claims are identifiable
- [ ] Code/scripts do not obviously contradict support claims
- [ ] Limitations are documented where relevant

### Reviewer questions
- What support claim is the project actually making?
- Is it claiming cross-platform use, or only a narrow environment?
- Are support boundaries honest, or inflated by template language?

### Common failure patterns
- README says Windows/macOS/Linux, scripts assume Bash and `/proc`
- app claims “Docker-supported” but depends on manual host setup
- package claims serverless support but assumes local disk persistence and long-lived processes

---

## Step 2 — Review Filesystem & Path Safety

Determine whether filesystem behavior is portable and environment-safe.

### Check
- [ ] Paths are constructed with platform-safe utilities where applicable
- [ ] Hardcoded absolute paths are absent or explicitly justified
- [ ] Case-sensitivity assumptions are not silently unsafe
- [ ] Temp directories, permissions, and file operations are handled sensibly
- [ ] Local machine usernames/home directories are not embedded in runtime logic

### Example — Incorrect
```python
path = "/tmp/" + filename
```
Why it fails:
- assumes POSIX layout
- weak portability and safety

### Example — Better
```python
from pathlib import Path
import tempfile
path = Path(tempfile.gettempdir()) / filename
```
Why it passes:
- uses platform-aware path handling

---

## Step 3 — Review Environment Configuration Integrity

Determine whether critical configuration is explicit and checked early enough.

### Check
- [ ] Required env vars/config values are identifiable
- [ ] Missing critical config fails clearly rather than mysteriously later
- [ ] Defaults are safe and sensible for project scope
- [ ] Hidden local config assumptions are surfaced
- [ ] Setup docs and runtime validation broadly agree

### Reviewer questions
- What config must exist before the app can work?
- Would another operator discover those requirements quickly?
- Are failure modes obvious when config is missing or malformed?

### Example — Incorrect
```js
const apiKey = process.env.API_KEY
startServer()
```
with no validation and no docs.

Why it fails:
- hidden dependency
- delayed, confusing downstream failure likely

### Example — Better
```js
if (!process.env.API_KEY) {
  throw new Error('API_KEY is required')
}
startServer()
```
Why it passes:
- requirement is explicit and early

---

## Step 4 — Review Runtime & Version Compatibility

Determine whether the code actually fits the declared runtime baseline.

### Check
- [ ] Minimum runtime/tool versions are explicit or inferable
- [ ] Code does not rely on newer features than its stated baseline without note
- [ ] Obsolete/deprecated runtime assumptions are visible
- [ ] Container/runtime declarations do not materially drift from code reality

### Reviewer questions
- What runtime version does this code really require?
- Do docs, package metadata, CI, and actual syntax/features agree?
- Is the claimed baseline real or aspirational?

### Example — Incorrect
- `package.json` says Node 16
- code uses features requiring a newer runtime without acknowledgement

### Why it fails
- stated support boundary is false

---

## Step 5 — Review Script & Command Portability

Determine whether startup/build scripts fit the claimed environments.

### Check
- [ ] Shell commands are compatible with claimed environments
- [ ] OS-specific subprocess or permission assumptions are surfaced
- [ ] Build/run scripts do not depend on machine-specific state
- [ ] Containerized and non-containerized workflows are not confused with each other

### Common failure patterns
- `chmod +x`, `/bin/bash`, `sed -i`, or `/proc` in “cross-platform” flows
- script depends on GNU variants not available on the claimed platform
- startup requires a manually started local database/service not documented anywhere

---

## Step 6 — Review Container vs Bare-Metal / Actual Deployment Assumption Match

This step prevents deployment-model theater.

### Check
- [ ] Docker/compose/k8s assumptions are checked against intended real operation
- [ ] Container healthcheck/network/service assumptions are not falsely treated as universal
- [ ] Bare-metal/systemd/manual-host assumptions are surfaced when docs imply container-native operation
- [ ] Deployment artifacts look like actual operating guidance rather than generated ceremony

### Reviewer questions
- How is this software actually expected to run?
- Are the deployment artifacts real, maintained, and aligned to runtime behavior?
- Does the repo imply one deployment model while the code depends on another?

### Common failure patterns
- Dockerfile exists but app only works with host-mounted secrets and hand-created state
- compose file present but stale, incomplete, or not used in practice
- container startup assumes long-lived disk state while docs claim ephemeral/serverless use

---

## Step 7 — Review Compatibility Comments / Docs as Evidence

Compatibility claims in docs and comments are evidence candidates, not proof.

### Check
- [ ] Comments/docs about support are verified against code and scripts
- [ ] Overstated portability claims are recorded explicitly
- [ ] Design comments about environment trade-offs are validated rather than accepted blindly

### Example — Incorrect
- README says “works on Windows, macOS, Linux”
- startup uses Bash, `chmod`, and Linux-only file assumptions

### Example — Better
- docs narrow support honestly: “Linux/macOS supported; Windows requires WSL”

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Code 9:** release confidence must be limited to proven environments only
- **Security 8:** environment-specific permission, exposure, or runtime-boundary concerns
- **Production 2:** deployment/state-boundary contradictions
- **Production 5:** runtime prerequisites, rollout constraints, unsupported-platform risk

### Required handoff block
- **Carry-forward concerns:**
  - Supported environment truth:
  - Hidden config/runtime assumptions:
  - Script portability risk:
  - Deployment-model mismatch:
  - Unsupported-platform release risk:

---

## Lens Interaction Guidance

Examples:
- **platform lens:** primary lens here; emphasize OS-specific paths, shell behavior, permissions, package availability, and runtime assumptions
- **llm-focused lens:** emphasize generic compatibility claims inherited from templates rather than verified support
- **bug-hunt lens:** emphasize environment-specific failure modes that create non-obvious defects
- **credentials lens:** emphasize secret injection, env-var handling, and config exposure behavior across environments

---

## Severity / Gating Model

### PASS
Use PASS when:
- claimed environments are mostly supported by actual code and scripts
- critical config/runtime assumptions are explicit
- deployment-context fit is understandable and mostly honest
- portability limits are documented where needed

### NEEDS_WORK
Use NEEDS_WORK when:
- compatibility is partially true but fragile or under-documented
- support claims are overstated but can be narrowed honestly
- hidden assumptions exist but review can continue with bounded caution

### BLOCK
Use BLOCK when:
- environment/platform claims are materially false
- hidden assumptions make the project effectively unreproducible outside the builder’s machine
- runtime/config/deployment mismatch would predictably break intended use
- later release judgment would rely on false compatibility confidence

---

## Escalation Guidance

Escalate or explicitly flag when:
- support claims are broader than what the code earns
- deployment artifacts appear mostly ceremonial
- hidden environment assumptions create likely operational failure → Production 2 / 5
- permission/runtime assumptions create exposure or hardening concerns → Security 8

If compatibility claims are dangerously false for the intended release scope, use **BLOCK** rather than allowing Stage 9 to inherit fake environment confidence.

---

## Required Report Format

### 1. Supported-Platform Claim Summary
- Claimed environments:
- Claimed runtime/deployment models:
- Confidence in claim accuracy:

### 2. Actual Compatibility Findings
- What appears truly supported:
- What appears unsupported or fragile:
- Major contradiction findings:

### 3. Environment / Config Assumptions
- Required env/config:
- Missing-validation concerns:
- Hidden local-state assumptions:

### 4. Runtime / Script Portability Findings
- Version baseline reality:
- OS/script portability issues:
- Toolchain/runtime drift:

### 5. Deployment-Model Findings
- Container vs bare-metal alignment:
- Deployment artifact realism:
- Runtime-context mismatch:

### 6. Carry-Forward Concerns
- Release-scope limitation:
- Security environment handoff:
- Production deployment handoff:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- confuse “runs locally” with “supported generally”
- trust cross-platform claims without checking scripts and paths
- assume Docker presence means deployment readiness
- ignore runtime-version drift because the code looks modern
- let Stage 9 inherit unsupported-environment claims unchallenged

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand which environments this project truly supports, the code and scripts substantially match those claims, and its runtime/config/deployment assumptions are explicit enough that later release and infrastructure judgments can rely on them.

If that statement cannot be made honestly, this stage should not pass.

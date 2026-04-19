---
type: review-stage
review_type: code
stage: 3
stage_name: "Build Setup Verification Integrity"
version: 1.0
updated: 2026-04-18
---
# Code Stage 3 — Build, Setup & Verification Integrity

## Stage Metadata
- **Review type:** Code
- **Stage number:** 3
- **Stage name:** Build, Setup & Verification Integrity
- **Purpose in review flow:** Determine whether build, setup, lint, tests, and CI signals are trustworthy enough to support later conclusions
- **Default weight:** High
- **Required reviewer posture:** Evidence-driven, skeptical of green checkmarks
- **Lens interaction:** Lenses may shift emphasis (bugs, credentials, platforms, LLM-specific generation artifacts), but may not reduce verification scrutiny
- **Depends on:** Code Stage 1 truth/maturity/reviewability context and Code Stage 2 architecture coherence
- **Feeds into:** Code Stages 4 and 9; Security Stages 4, 5, and 7; Production Stages 3 and 9
- **Security/Production handoff:** Weak verification signals should lower confidence in later security and production claims, even if the code appears plausible

---

## Why This Stage Exists

This stage exists to answer a dangerous question:

> Do the project’s verification signals mean anything?

Vibe-coded projects often generate the appearance of rigor faster than rigor itself. A repository may contain:
- a `tests/` directory full of shallow assertions
- lint scripts that exclude the important code
- CI workflows that run nothing meaningful
- setup instructions that only work on the builder’s machine
- healthily green pipelines that would not catch real regressions

A project that “passes tests” can still be almost unverifiable in any meaningful engineering sense.

This stage is therefore not about whether test commands exist. It is about whether setup/build/verification outputs are **credible evidence**.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the project can be set up and built in a reproducible way
2. Whether the documented workflows correspond to the real workflows
3. Whether lint/type/test/CI signals cover meaningful code paths
4. Whether the test suite would likely catch meaningful regressions
5. Whether green verification signals are evidence or theater

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Setup/build reproducibility summary**
2. **Verification tooling summary**
3. **Test meaningfulness findings**
4. **CI/lint integrity findings**
5. **Hidden local-state / author-machine assumptions**
6. **Verification claims contradicted by evidence**
7. **Carry-forward confidence note for later stages**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- install/setup instructions
- build and run scripts/commands
- lint/typecheck configuration
- test configuration and representative tests
- CI workflow definitions where present
- lockfiles and dependency install paths
- env/config assumptions required for local verification
- comments/docs claiming comprehensive testing or quality gates

If runnable, attempt at least limited validation of:
- install path
- build path
- lint/type path
- test path

If execution is not practical, still inspect scripts/configs for plausibility and coverage.

---

## Core Review Rule

Do not reward the **existence** of verification artifacts.
Reward only their likely **evidentiary value**.

A `tests/` folder is not proof.
A CI badge is not proof.
A lint script is not proof.
A setup guide is not proof.

The reviewer must ask whether these artifacts would likely catch meaningful breakage.

---

# Review Procedure

## Step 1 — Assess Setup Reproducibility

Determine whether another reviewer could plausibly get the project running.

### Check
- [ ] Setup path is documented and plausible
- [ ] Required tools/versions are specified or inferable
- [ ] Dependency install path is complete enough to trust
- [ ] Hidden local prerequisites are not silently assumed
- [ ] Environment variable requirements are visible enough to orient the reviewer

### Reviewer questions
- Could a competent reviewer reproduce the environment?
- Does setup depend on invisible local services, secrets, or machine state?
- Are versions and prerequisites explicit enough to reduce guesswork?

### Common failure patterns
- missing runtime version
- setup depends on private service or local DB not documented
- required `.env` values are absent from docs/examples
- README says `npm start` but actual workflow requires manual migrations and local infra

---

## Step 2 — Review Build / Run Reality

Determine whether build and run claims are credible.

### Check
- [ ] Build command exists if the project claims a build step
- [ ] Run/start path is identifiable
- [ ] Scripts do not obviously point to dead files or placeholder commands
- [ ] Startup path is not dependent on undocumented hacks
- [ ] Cold-start path is at least conceptually reproducible

### Reviewer questions
- If this project claims to run, what does that actually mean?
- Do scripts line up with the repository as it exists now?
- Are there signs of command rot or startup theater?

### Common failure patterns
- script references deleted file
- README and package scripts disagree
- startup path works only after undocumented manual prep
- “build” runs but output is unused or stale

---

## Step 3 — Review Lint / Type / Static Quality Signal Integrity

Determine whether quality tooling covers meaningful code.

### Check
- [ ] Lint/type tools scan the code that matters
- [ ] Important folders are not excluded without reason
- [ ] Suppressions and ignores are bounded and explainable
- [ ] Passing lint does not simply mean rules were disabled or failures ignored

### Reviewer questions
- What code is actually being checked?
- Is this lint/type config protective or decorative?
- Are ignores targeted or blanket escapes?

### Common failure patterns
- lint script excludes `src/` or `test/`
- `|| true` or non-failing quality gates
- typechecking present in claim only, not in CI/scripts
- warnings disabled broadly to keep pipeline green

---

## Step 4 — Review Test Meaningfulness

This is the heart of the stage.

### Check
- [ ] Tests exist for core behavior if the project claims test coverage
- [ ] Assertions are meaningful, not just existence checks
- [ ] Tests do more than import modules or confirm constants
- [ ] Happy-path-only testing is identified where present
- [ ] Invalid input, failure paths, or edge cases appear in at least some meaningful form
- [ ] Reviewer asks: if a bug were introduced in core logic, would the test suite likely detect it?

### Reviewer questions
- Do these tests verify behavior or merely prove symbols exist?
- If I broke a key branch, would a test fail?
- Are the important flows actually covered?
- Are tests shaped for confidence or just for green output?

### Common failure patterns
- `assert login is not None`
- tests for route existence, not route behavior
- no negative cases
- mocks testing mocks
- snapshot-heavy tests with weak behavioral assertions
- tests that never exercise actual integration boundaries

### Example — Correct
```python
def test_login_rejects_invalid_password(client):
    response = client.post('/login', json={'email': 'a@b.com', 'password': 'wrong'})
    assert response.status_code == 401
```
Why it passes:
- exercises real behavior
- checks meaningful outcome
- tests failure path

### Example — Incorrect
```python
def test_login_exists():
    assert login is not None
```
Why it fails:
- almost no evidentiary value

### Example — Cosmetic test confidence
Tests all pass, but they would not fail if:
- core branch condition were inverted
- security validation were removed
- important field were ignored

Reviewer should record this as **cosmetic test confidence**.

---

## Step 5 — Review CI / Automation Signal Integrity

Determine whether automation reflects real verification.

### Check
- [ ] CI actually runs the key checks it claims to run
- [ ] Commands in CI match repo reality
- [ ] Skipped, optional, or no-op steps are visible
- [ ] A green badge would actually mean something to a reviewer

### Reviewer questions
- What does CI really do?
- Is this pipeline validating code or performing theater?
- Are failures allowed to pass silently?

### Common failure patterns
- workflow echoes “tests passed” without running tests
- jobs permanently skipped or optional
- CI checks example packages instead of core code
- green badge retained from stale workflow

---

## Step 6 — Identify Author-Machine and Hidden-State Assumptions

This step focuses on fragile verification conditions.

### Check
- [ ] Hidden local services are surfaced
- [ ] Required env vars/config are discoverable
- [ ] Setup does not depend on historical local state from the original author’s machine
- [ ] Reproducibility risk is explicitly reported where confidence is low

### Common failure patterns
- private keys or credentials expected locally
- hidden background service/process not documented
- tests use local files absent from repo
- command succeeds only because builder has stale generated output or cache

---

## Step 7 — Review Comments / Claims About Verification

Verification claims are evidence candidates, not proof.

### Check
- [ ] Comments/docs claiming “fully tested” are compared to actual suite quality
- [ ] Known limitations are treated as gaps, not proof of rigor
- [ ] Reviewer records where verification confidence is overstated

### Example — Incorrect claim
“Comprehensive test coverage” in README, but test suite only covers initialization and one happy-path route.

### Reviewer action
Record contradiction and lower confidence for later stages.

---

## Step 8 — Record Cross-Stage Handoff Notes

Later stages need to know how much to trust the project’s evidence layer.

### Required handoff targets
- **Code 4:** if test/verification signals are weak, correctness findings require more skepticism
- **Code 9:** release confidence must be reduced if verification is shallow
- **Security 4 / 5 / 7:** security claims resting on weak tests/CI should be treated cautiously
- **Production 3 / 9:** telemetry/release readiness cannot rely on “tested” claims if the suite is weak

### Required handoff block
- **Carry-forward concerns:**
  - Setup reproducibility:
  - Verification confidence:
  - CI integrity:
  - Hidden-state risk:
  - Release confidence impact:

---

## Lens Interaction Guidance

Examples:
- **bug-hunt lens:** intensify scrutiny of whether tests would catch regressions in critical logic
- **credentials lens:** check whether auth/secret paths are meaningfully tested
- **llm-focused lens:** emphasize generated test fluff, mock-heavy suites, and verification theater
- **platform lens:** emphasize whether build/test scripts genuinely support the claimed environment

---

## Severity / Gating Model

### PASS
Use PASS when:
- setup/build path is understandable and credible
- lint/type/test/CI cover meaningful code paths
- green signals appear trustworthy enough for later stages to rely on cautiously

### NEEDS_WORK
Use NEEDS_WORK when:
- project is buildable but verification depth is weak
- CI/tests/lint exist but have meaningful blind spots
- hidden local assumptions remain, but review can still proceed with caution

### BLOCK
Use BLOCK when:
- setup/build path is clearly non-reproducible or misleading
- verification signals are materially deceptive
- project presents itself as validated while evidence is mostly theater
- later stages would rely on false confidence if review continued normally

---

## Escalation Guidance

Escalate confidence concerns aggressively when:
- tests are present but mostly cosmetic
- CI is green but mostly no-op
- setup depends on author-only state
- verification claims are materially false

A severe Stage 3 failure may justify halting deeper code review or proceeding only with explicit low-confidence caveats. If later-stage evidence would mostly depend on untrustworthy verification, use **BLOCK**.

---

## Required Report Format

### 1. Setup / Build Reproducibility Summary
- Setup path credibility:
- Hidden prerequisites:
- Runtime/tool version clarity:

### 2. Verification Tooling Summary
- Lint/type tools:
- Coverage of meaningful code paths:
- Major excludes/suppressions:

### 3. Test Meaningfulness Findings
- Strong tests:
- Weak/cosmetic tests:
- Likelihood suite would catch core regressions:

### 4. CI / Automation Findings
- What CI actually runs:
- Mismatch with claimed checks:
- Green-signal trustworthiness:

### 5. Hidden-State / Author-Machine Risks
- Local-only assumptions:
- Missing env/config/docs:
- Reproducibility confidence:

### 6. Carry-Forward Concerns
- Code correctness confidence:
- Security confidence impact:
- Release confidence impact:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- trust green checks without reading what they do
- reward tests for existing rather than for proving behavior
- confuse documentation of setup with successful reproducibility
- assume CI rigor from badge presence alone
- let weak verification inflate Stage 9 release confidence later

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand how this project is supposed to be built and verified, and the signals it produces are credible enough that later review stages can treat them as evidence rather than decoration.

If that statement cannot be made honestly, this stage should not pass.

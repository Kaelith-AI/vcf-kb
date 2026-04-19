---
type: review-stage
review_type: code
stage: 5
stage_name: "Dependency Supply Chain Generated Artifact Hygiene"
version: 1.0
updated: 2026-04-18
---
# Code Stage 5 — Dependency, Supply Chain & Generated Artifact Hygiene

## Stage Metadata
- **Review type:** Code
- **Stage number:** 5
- **Stage name:** Dependency, Supply Chain & Generated Artifact Hygiene
- **Purpose in review flow:** Determine whether dependencies and generated artifacts are justified, controlled, and structurally trustworthy enough for continued review
- **Default weight:** High
- **Required reviewer posture:** Skeptical of package convenience and generated artifact legitimacy
- **Lens interaction:** Lenses may intensify focus on provider trust, credential handling, bug exposure, or platform-specific packaging issues, but all reviews must verify dependency legitimacy and artifact hygiene
- **Depends on:** Code Stage 1 truth/scope/maturity, Code Stage 2 architecture coherence
- **Feeds into:** Code Stages 6, 8, and 9; Security Stage 5; Production Stages 5 and 9
- **Security/Production handoff:** Record provenance risk, suspicious packages, weak lock discipline, generated artifact drift, and dependency-driven trust/disclosure concerns for later security/release evaluation

---

## Why This Stage Exists

This stage exists because vibe-coded projects accumulate dependency and artifact risk very quickly.

Models often:
- suggest packages by approximate memory rather than verified existence
- add more dependencies than the problem requires
- copy install snippets with floating versions
- leave generated files stale after source changes
- vendor code or clients without provenance context
- treat third-party convenience as free, even when it expands risk dramatically

This stage answers:

> Are the external pieces of this project legitimate, controlled, and justified?

It is still a **Code** stage because the focus here is not yet full vulnerability/CVE analysis. The focus is whether the project’s dependency story is coherent and reviewable.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. Whether the project’s dependencies are real and plausibly justified
2. Whether versions and lock discipline support reproducibility
3. Whether dependency sprawl or duplication is creating unnecessary complexity
4. Whether generated artifacts are synchronized and identifiable
5. Whether visible license/provenance concerns should be handed to later review

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Dependency trust / legitimacy summary**
2. **Version and lockfile reproducibility findings**
3. **Dependency sprawl / duplicate-purpose findings**
4. **Generated artifact hygiene findings**
5. **License / provenance concerns visible at code-review level**
6. **Carry-forward notes for Security/Release**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- dependency manifests
- lockfiles
- vendored code directories / embedded libraries
- generated files (API clients, protobuf stubs, migrations, compiled artifacts if committed)
- regeneration commands and build scripts
- dependency-related comments and docs
- visible package registry or source references where needed

For external/commercial products, spot-check 2–3 dependencies against the actual registry when practical.
For internal tools, trust-but-verify is acceptable unless dependency risk looks unusually high.

---

## Core Review Rule

A dependency does not earn trust because:
- the import works
- the package name sounds legitimate
- the code builds locally
- the generated file exists

The reviewer must distinguish between:
- **dependency exists**
- **dependency is justified**
- **dependency is controlled**
- **dependency is trustworthy enough for current scope**

---

# Review Procedure

## Step 1 — Review Dependency Reality & Legitimacy

### Check
- [ ] Dependencies appear to be real packages/libraries/services
- [ ] Names are not suspiciously typo-prone or hallucinated
- [ ] Declared dependencies match actual imports/use where practical
- [ ] Critical dependencies are visible enough to reason about

### Reviewer questions
- Does this package appear to exist and match what the code expects?
- Is the package name canonical, or suspiciously close to a known one?
- Is the dependency actually used, or cargo-culted into the manifest?

### Common failure patterns
- invented package name
- typo-squatted package name
- copied tutorial dependency never actually used
- duplicate packages serving same purpose with no reason

---

## Step 2 — Review Version Control & Reproducibility

### Check
- [ ] Versions are pinned or tightly constrained enough for reproducibility
- [ ] Lockfile exists where ecosystem expects one
- [ ] Lockfile appears committed and in sync with manifest
- [ ] `latest`, `*`, or similarly uncontrolled versions are flagged

### Reviewer questions
- Would a fresh install today match the reviewed codebase closely enough?
- Are versions drifting without review?
- Does the project’s release confidence depend on lucking into the same dependency tree?

### Example — Incorrect
```txt
requests
flask>=2.0
boto3
```

### Example — Better
```txt
requests==2.31.0
flask==3.0.3
boto3==1.34.69
```

---

## Step 3 — Review Dependency Justification & Sprawl

### Check
- [ ] Major dependencies serve a visible purpose
- [ ] Dependency count is not inflated by unnecessary convenience packages
- [ ] Duplicate-purpose libraries are identified
- [ ] Copied example dependencies not actually needed are flagged

### Reviewer questions
- Is this dependency doing something the project genuinely needs?
- Are there too many packages for a small/simple concern?
- Has the model accumulated packages because each example added one more library?

### Common failure patterns
- small app with large package surface for trivial features
- two validation libraries, two date libraries, two HTTP clients, no reason why
- package chosen because it “looked right” rather than because it fit architecture

---

## Step 4 — Review Provenance & External Trust

### Check
- [ ] Git-based, local-path, private URL, or fork dependencies are identified and justified
- [ ] Vendored code has enough provenance/version context to review sensibly
- [ ] External trust assumptions are explicit enough for later security review
- [ ] Reviewer records suspiciously broad trust in third-party convenience code

### Example — Incorrect
```json
{
  "dependencies": {
    "critical-lib": "git+https://github.com/random-user/fork.git"
  }
}
```
Why it fails:
- trust source unclear
- provenance and maintenance path weak

### Example — Better
- canonical source or explicitly justified fork with scope and rationale documented

---

## Step 5 — Review Generated Artifact Hygiene

### Check
- [ ] Generated files are clearly marked when possible
- [ ] Generated artifacts appear in sync with source definitions/specs
- [ ] Regeneration path exists and is discoverable
- [ ] Stale generated output is not silently treated as source-of-truth

### Common failure patterns
- updated schema/spec with stale generated client
- generated folder committed without regeneration command
- compiled output reviewed as if hand-authored source
- vendored/generated code mixed with application code without boundary

### Example — Incorrect
- API spec updated
- generated client remains stale
- no regeneration note or command

### Example — Better
- generated file references source spec
- regeneration command exists
- output appears aligned to current source

---

## Step 6 — Review License Visibility

At code-review scope, this is a visibility check, not a full legal audit.

### Check
- [ ] Restrictive or incompatible licenses are identified where visible
- [ ] Reviewer flags license-obligation blind spots when dependency choices suggest legal/commercial risk

### Common failure patterns
- package added with strong copyleft implications and no awareness
- vendored code with no license context
- commercial/external-facing project using unclear-license dependencies casually

### Important note
This stage should not attempt to settle legal questions in depth. It should ensure obvious risks are not invisible.

---

## Step 7 — Distinguish Code Dependency Hygiene from Security Supply Chain Review

### Rule
- **Code Stage 5** evaluates dependency legitimacy, justification, reproducibility, and artifact hygiene.
- **Security Stage 5** evaluates CVEs, attack surface, provenance risk, and third-party trust from a security standpoint.

### Example
- “Do we need this dependency, and is it controlled?” belongs here.
- “Does this dependency introduce exploitable vulnerability risk?” belongs primarily in Security Stage 5.

If the reviewer sees likely security supply-chain issues, record them as handoff items.

---

## Step 8 — Review Design / Risk Comments as Evidence

### Check
- [ ] Comments justifying risky dependencies are treated as evidence, not absolution
- [ ] “Temporary” package exceptions are recorded as debt
- [ ] Reviewer challenges weak rationale for risky or bloated dependency choices

### Example — Weak comment
```js
// Using this package for now
```
This is not enough.

### Example — Better comment
```js
// Temporary CSV package because built-in parser fails on multiline quoted fields.
// Isolated to import module only. Planned removal after internal parser lands.
```
Still subject to review, but meaningfully better.

---

## Step 9 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 5:** provenance, package trust, registry/source concerns, possible supply-chain risk
- **Code 9:** dependency/reproducibility concerns affecting release confidence
- **Production 5:** deployment artifacts, generated files, and lock discipline affecting reproducible release

### Required handoff block
- **Carry-forward concerns:**
  - Provenance/supply-chain:
  - Release reproducibility:
  - Generated artifact drift:
  - License visibility:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** intensify scrutiny of invented packages, dependency sprawl, stale generated artifacts, and provider-copied examples
- **credentials lens:** emphasize SDKs or generated clients that touch secrets/auth
- **bug-hunt lens:** emphasize dependency duplication or generated-client drift likely to hide runtime defects
- **platform lens:** emphasize platform-specific packages and environment-bound dependency assumptions

---

## Severity / Gating Model

### PASS
Use PASS when:
- dependencies are real, justified enough, and reproducible enough for scope
- generated artifacts are identifiable and plausibly synchronized
- visible license/provenance concerns are bounded and documented

### NEEDS_WORK
Use NEEDS_WORK when:
- dependency hygiene is directionally acceptable but has meaningful gaps
- sprawl, drift, or weak lock discipline reduce confidence without fully invalidating review
- visible provenance or license issues need clarification before stronger release confidence is warranted

### BLOCK
Use BLOCK when:
- critical dependencies are untrustworthy, invented, dangerously uncontrolled, or fundamentally unreproducible
- generated artifacts are so stale or opaque that later review would be misleading
- dependency story is too chaotic to trust the codebase’s current state

---

## Escalation Guidance

Escalate or explicitly flag for stronger downstream scrutiny when:
- suspicious package provenance or weak lock discipline → Security 5
- generated-client or artifact drift may invalidate integration behavior → Code 4 / Production 5
- dependency choice creates likely license or commercial-distribution concern → Code 9 / production decision-makers

If the dependency story is too unstable to trust the reviewed codebase, use **BLOCK**.

---

## Required Report Format

### 1. Dependency Trust Summary
- Major dependencies:
- Legitimacy/provenance concerns:
- Confidence level:

### 2. Version / Lockfile Findings
- Lockfile status:
- Reproducibility issues:
- Floating version concerns:

### 3. Sprawl / Justification Findings
- Unnecessary dependencies:
- Duplicate-purpose libraries:
- Scope inflation via dependencies:

### 4. Generated Artifact Findings
- Generated code present:
- Drift concerns:
- Regeneration path confidence:

### 5. License / Provenance Visibility Findings
- Visible license risk:
- Vendored code concerns:
- Escalation needs:

### 6. Carry-Forward Concerns
- Security supply-chain handoff:
- Release reproducibility handoff:
- Artifact drift handoff:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- trust a package because the name “looks right”
- assume builds are reproducible because the current install works
- ignore generated code drift because it compiles
- confuse dependency existence with dependency justification
- collapse code-review dependency hygiene into full security supply-chain review prematurely

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand the codebase’s dependency and generated-artifact story, and it is controlled enough that later security, release, and production judgments can rely on it without being undermined by obvious provenance, drift, or reproducibility problems.

If that statement cannot be made honestly, this stage should not pass.

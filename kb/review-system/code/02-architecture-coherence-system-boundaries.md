---
type: review-stage
review_type: code
stage: 2
stage_name: "Architecture Coherence System Boundaries"
version: 1.0
updated: 2026-04-18
---
# Code Stage 2 — Architecture Coherence & System Boundaries

## Stage Metadata
- **Review type:** Code
- **Stage number:** 2
- **Stage name:** Architecture Coherence & System Boundaries
- **Purpose in review flow:** Determine whether the codebase forms a coherent system rather than a pile of plausible-looking parts
- **Default weight:** High
- **Required reviewer posture:** Structural, skeptical, boundary-aware
- **Lens interaction:** All lenses may intensify attention on particular architectural risks, but none change the requirement to verify actual system coherence
- **Depends on:** Code Stage 1 truth-establishment, maturity classification, claimed vs observed scope, ownership/reviewability context
- **Feeds into:** Code Stages 4, 6, 7, and 9; Security Stage 3; Production Stage 2
- **Security/Production handoff:** Record any architecture claims that later security or production review must treat as suspicious, unverified, or structurally weak

---

## Why This Stage Exists

This stage exists to answer a different question from Stage 1.

Stage 1 asks:
> What is this project, really?

Stage 2 asks:
> Does the codebase actually hold together as a system?

A vibe-coded project can pass Stage 1 in the sense that its purpose, scope, and maturity are understandable, while still failing Stage 2 because its parts do not form a coherent architecture.

Common vibe-code failure modes at this stage include:
- folders and modules that imitate architecture without enforcing real boundaries
- “service / controller / model / middleware” labels that are mostly cosmetic
- auth, config, persistence, or queue systems that exist but are not wired into actual flows
- two or three incompatible architectural patterns stitched together by prompting
- duplicated or parallel implementations of the same concern
- diagrams or comments describing an idealized system rather than the real one

This stage protects later review from being fooled by **architecture-shaped code**.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What the major components and subsystems are
2. What boundaries and responsibilities those components appear to have
3. Whether dependency direction and system wiring are coherent
4. Whether major cross-cutting concerns are integrated on real paths
5. Whether architecture claims in docs/comments are actually true in code

If the reviewer cannot explain the system’s major parts and how they fit together, this stage should not pass.

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Architecture summary**
2. **Major component and responsibility map**
3. **Boundary integrity assessment**
4. **Dependency direction / coupling assessment**
5. **Main-flow integration findings**
6. **Documentation/comment vs implementation mismatch findings**
7. **Design rationale comments worth carrying forward**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- architecture docs / README architecture sections if present
- top-level modules/folders and their relationships
- routing/controller/entrypoint code
- service/business logic layer
- persistence/data access layer
- config loading and dependency wiring
- auth/authz enforcement points if relevant to architecture claims
- representative main flows traced from entrypoint to core feature
- comments/docs describing architecture, layering, or trade-offs

Useful tools where practical:
- dependency graph / import graph tools
- grep/search for auth decorators, queue use, config loading, DB access
- quick tracing through 1–2 main user flows

---

## Core Review Rule

Do not judge architecture by naming alone.

A project does **not** get credit for coherent architecture because it contains folders called:
- `services/`
- `controllers/`
- `repositories/`
- `middleware/`
- `workers/`

The reviewer must verify whether those labels correspond to real, enforced boundaries in execution paths.

---

# Review Procedure

## Step 1 — Identify the Major Components

Map the system’s major parts.

### Check
- [ ] Major components or subsystems are identifiable
- [ ] Each component has a describable responsibility
- [ ] Components can be distinguished from utilities, dead code, and scaffolding
- [ ] Architecture docs do not materially invent components that are absent in code

### Reviewer questions
- What are the primary subsystems?
- Which ones are core vs peripheral?
- Can each major component be described in one sentence?
- Are there duplicated components pretending to solve the same problem?

### Common failure patterns
- multiple partially overlapping modules for the same concern
- architectural labels with no real behavioral distinction
- generated code directories that are mostly empty or disconnected

### Example — Correct
- route/controller layer receives requests
- service layer applies domain logic
- repository/data layer handles persistence
- config layer initializes runtime settings

### Example — Incorrect
- routes directly perform DB access, auth checks, formatting, and business rules
- service layer exists in name but is unused decoration

---

## Step 2 — Assess Boundary Integrity

Determine whether component boundaries are real and meaningful.

### Check
- [ ] Responsibilities are separated meaningfully
- [ ] Internal implementation details are not leaked across boundaries unnecessarily
- [ ] Business logic is not smeared across unrelated layers
- [ ] Interfaces or call contracts are understandable enough to reason about

### Reviewer questions
- Where does business logic live?
- Where does persistence live?
- Where does config/auth/session logic live?
- Are boundaries disciplined or porous/arbitrary?

### Common failure patterns
- DB calls in routes/controllers everywhere
- utility modules doing auth, persistence, formatting, and orchestration all at once
- “repository” layer that simply forwards calls with no real role
- config read deep inside business logic in inconsistent ways

### Example — Correct
- request parsing in route/controller
- domain rules in service
- persistence in repository/DAO
- auth and config integrated in predictable boundary locations

### Example — Incorrect
- handler performs validation, SQL, email send, auth branching, retry logic, and response formatting in one function

---

## Step 3 — Review Dependency Direction & Coupling

The reviewer must determine whether dependencies flow in sane directions.

### Check
- [ ] Dependency direction is mostly consistent
- [ ] Circular dependencies are absent or clearly justified
- [ ] Change impact is not explosively cross-cutting by default
- [ ] Shared state and global imports do not create invisible coupling

### Reviewer questions
- Do high-level modules depend on lower-level modules in sane ways?
- Are there circular imports or tangled dependencies?
- Does changing one part require touching many unrelated files?
- Is the codebase structured for safe extension or brittle ripple effects?

### Common failure patterns
- circular import soup
- god module that imports and coordinates everything
- multiple layers depending on each other bidirectionally
- globals/shared mutable state linking unrelated components

### Example — Incorrect
- controller imports repository directly, service imports controller helpers, repository imports config from controller package

### Example — Better
- routes depend on services, services depend on repositories/adapters, lower layers do not depend upward

---

## Step 4 — Trace Main-Flow Integration Reality

The reviewer must verify that major subsystems are actually connected on real execution paths.

### Check
- [ ] Core routes/commands call the systems they claim to use
- [ ] Auth is present on real paths where architecture implies it should be
- [ ] Persistence is real when the project claims saved state
- [ ] External integrations are actually wired, not orphaned adapters
- [ ] Config is loaded and applied before it matters

### Reviewer questions
- Does the primary user flow actually traverse the architecture described?
- Are there key subsystems that exist but never get called?
- Is auth/security merely present in the repo, or on the real path?
- Are integrations part of the actual system or just artifact modules?

### Common failure patterns
- auth module exists but protected routes are not actually protected
- DB layer exists but app still uses in-memory state on real path
- queue worker exists but enqueue path never reaches it
- adapter/client modules exist but main flow bypasses them entirely

### Example — Correct
```python
@app.route('/api/data')
@require_auth
def get_data():
    return service.get_data(current_user.id)
```
Why it passes:
- route, auth, and service boundary are all on the live path

### Example — Incorrect
```python
# auth.py exists somewhere else
@app.route('/api/data')
def get_data():
    return service.get_data()
```
Why it fails:
- security-shaped architecture exists in repo, but not in execution reality

---

## Step 5 — Evaluate Architecture Claims Against Implementation

This step protects against architecture theater.

### Check
- [ ] Architecture docs/comments do not materially overstate system cleanliness or enforcement
- [ ] Stated patterns (MVC, event-driven, hexagonal, etc.) are visible in practice if claimed
- [ ] Major diagrams are not contradicted by code
- [ ] Reviewer records where docs describe an idealized system rather than the actual one

### Reviewer questions
- Are architecture claims descriptive or aspirational?
- Is the repo using the pattern it claims to use?
- Do diagrams/comments match the execution path?
- Are design comments giving insight or hiding drift?

### Common failure patterns
- “hexagonal architecture” claimed, but everything depends on everything
- event-driven system claimed, but real behavior is synchronous and tightly coupled
- comments describing boundaries that code bypasses routinely

### Example — Incorrect
```ts
// Skipping repository layer here for performance
```
used in many unrelated places with no real containment.

### Example — Better
```ts
// Bulk import path bypasses repository because repository is row-oriented.
// This path is isolated to nightly imports only.
```
**Reviewer must still verify** that the path is truly isolated and the rationale is credible.

---

## Step 6 — Distinguish Architecture Coherence from Security Enforcement

This is an important boundary rule for later stages.

### Rule
- **Code Stage 2** asks whether the architecture exists and is coherent.
- **Security Stage 3** asks whether those boundaries are enforced under adversarial conditions.

### Examples
- If auth module is present and on the real request path, that supports Code Stage 2.
- Whether auth defaults deny, scopes are enforced, and bypasses exist is a Security Stage 3 concern.

The reviewer should note handoff items rather than over-solving the next review type prematurely.

---

## Step 7 — Review Design / Risk Comments as Evidence

As with Stage 1, comments are evidence, not waivers.

### Check
- [ ] Architecture rationale comments are identified where material
- [ ] Comments are validated against actual behavior
- [ ] Reviewer records where comments explain a bounded trade-off well
- [ ] Reviewer records where comments normalize contradiction, drift, or avoidable complexity

### Example — Correct use
```ts
// This path bypasses the repository abstraction for bulk writes only.
// Repository is row-oriented and would exceed timeout here.
```
Reviewer must verify:
- is the path really isolated?
- is the trade-off bounded?
- is there evidence this exception is real rather than convenience drift?

### Example — Incorrect use
```ts
// architecture is fine, just faster this way
```
spread across many modules.

Why this fails:
- vague rationale
- no scope containment
- comment attempts to normalize architecture debt without evidence

---

## Step 8 — Record Cross-Stage Handoff Notes

This stage should feed later review rather than ending at architecture aesthetics.

### Required handoff targets
- **Code 4:** suspicious flows where architecture may hide incorrectness or brittle failure behavior
- **Code 6:** architecture assumptions tied to environment/platform behavior
- **Code 7:** coupling, readability, and change-safety risks
- **Security 3:** boundary claims needing adversarial verification
- **Production 2:** deployment/state-boundary contradictions
- **Production 7:** human supportability issues caused by tangled structure

### Required handoff block
- **Carry-forward concerns:**
  - Architecture drift:
  - Boundary weakness:
  - Coupling/change risk:
  - Security handoff:
  - Production/deployment handoff:

---

## Lens Interaction Guidance

Lenses should change emphasis, not the requirement to verify coherence.

Examples:
- **llm-focused lens:** intensify scrutiny of prompt-stitched subsystems, duplicated implementations, generated folder theater, and architecture claims inferred from templates
- **bug-hunt lens:** emphasize fragile boundaries that are likely to hide logic defects
- **credentials lens:** emphasize how auth/config/security-sensitive boundaries are wired
- **platform lens:** emphasize architecture assumptions that only make sense in one runtime environment

---

## Severity / Gating Model

### PASS
Use PASS when:
- major components and boundaries are identifiable
- dependency direction is mostly coherent
- main flows use the architecture they claim to use
- architectural trade-offs are visible and bounded

### NEEDS_WORK
Use NEEDS_WORK when:
- architecture is understandable but uneven or drifted
- some boundaries are porous or duplicated
- docs/comments overstate cleanliness but the system still basically holds together

### BLOCK
Use BLOCK when:
- core architecture is contradictory or incoherent
- major claimed boundaries are false in practice
- system structure is too tangled for reliable downstream review
- main execution flows do not materially match the architecture story

---

## Escalation Guidance

Escalate or explicitly flag for stronger downstream scrutiny when:
- architecture contradictions affect auth/trust boundaries → Security 3
- tangled structure makes behavior hard to reason about → Code 4 / Code 7
- deployment or state assumptions appear structurally wrong → Production 2
- review confidence is lowered because architecture docs are materially false → carry low-confidence note into later stages

If the architecture is so incoherent that later review would mostly be guesswork, use **BLOCK** rather than proceeding with polite caveats.

---

## Required Report Format

### 1. Architecture Summary
- Stated architecture pattern(s):
- Observed system shape:
- Main components:

### 2. Major Components & Responsibilities
| Component | Claimed Role | Observed Role | Boundary Quality |
|---|---|---|---|
| ... | ... | ... | Clear / Weak / Cosmetic |

### 3. Dependency Direction & Coupling Findings
- Circular dependencies:
- God modules:
- Shared-state concerns:
- Change-safety implications:

### 4. Main-Flow Integration Findings
- Primary path traced:
- Auth/config/persistence integration notes:
- Orphaned or fake subsystems:

### 5. Docs / Comments vs Implementation
- Matching claims:
- Contradictions:
- Architecture-theater findings:

### 6. Design / Risk Comments Worth Carrying Forward
- Comment:
- Verified / contradicted / unclear:
- Carry-forward note:

### 7. Carry-Forward Concerns
- Code correctness/failure handling:
- Platform/runtime assumptions:
- Maintainability/change safety:
- Security boundary enforcement:
- Production/deployment/state boundaries:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- reward architecture labels without verifying behavior
- confuse tidy folder names with real boundaries
- let diagrams override execution-path evidence
- overstep into full security enforcement review prematurely
- ignore duplicated or parallel implementations because “the app seems to run”

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I can identify the system’s major components, explain how they interact, see that its key boundaries are real enough to reason about, and trust that its architecture story is substantially true in code rather than only in naming or documentation.

If that statement cannot be made honestly, this stage should not pass.

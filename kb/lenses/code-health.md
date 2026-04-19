---
type: review-lens
lens_name: code-health
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Code Health & Simplification Lens

## Lens Purpose

This lens intensifies review for maintainability, simplification opportunity, structural cleanliness, and long-term survivability of the codebase.

It is meant for systems where the biggest future risk is not only “is this wrong today?” but also:
- can humans safely understand it later?
- will continued vibe-coded iteration make it worse?
- is the code accumulating generated residue, duplicate logic, or architecture theater?
- could this system become dramatically healthier by deleting, consolidating, or simplifying it?

This is not style policing.
It is a practical review overlay for **code health, structural clarity, and simplification leverage**.

---

## Why This Lens Exists

Vibe-coded systems degrade differently from traditionally authored systems.

They often accumulate:
- duplicate modules created by multiple prompting passes
- scaffolded folders that are no longer meaningfully used
- “temporary” flags and config branches that never die
- utility files that absorb unrelated concerns
- comments and code artifacts that reflect prompt history rather than architectural intent
- abstractions added because they sounded right, not because they reduced complexity

The standard stages already check architecture, correctness, security, and production readiness.
What they do not always do is pressure-test a simple question:

> Is this codebase getting healthier as it evolves, or just bigger, noisier, and harder to own?

This lens exists to make that visible and to identify where simplification is both possible and high-value.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the codebase contains meaningful simplification opportunities
2. Whether duplication, scaffolding, and abstraction are serving the system or dragging it down
3. Whether module and file boundaries are clean enough to support ongoing work
4. Whether generated residue and dead structure are inflating complexity artificially
5. Whether the code can remain understandable after more AI-assisted iteration

If the reviewer cannot explain what should be deleted, merged, reduced, or clarified, this lens is not being applied strongly enough.

---

## Applies To

This lens is most useful for:
- fast-moving vibe-coded repositories
- projects with multiple rounds of AI-assisted iteration
- codebases showing duplication or cleanup debt
- internal tools and workflows likely to accrete complexity quickly
- libraries, apps, and services where maintainability is a business concern

It may be applied to:
- **Code review** to intensify cleanup, structural health, and simplification opportunity analysis
- **Security review** when poor structure or residue makes secure ownership and remediation unrealistic
- **Production review** when operational ownership is threatened by complexity, dead scaffolding, or single-maintainer code archaeology

---

## Core Review Rule

Do not confuse amount of code with maturity.

A system does **not** get health credit because:
- it has many layers
- it uses advanced patterns
- it contains a lot of helper files
- it has abstracted everything into reusable shapes
- generated code “looks professional” at a glance

The reviewer must ask whether the current structure reduces complexity or merely redistributes and hides it.

---

## What This Lens Should Emphasize

### 1. Dead Code & Orphaned Scaffolding
Reviewer should intensify attention on:
- unused modules with no live callers
- empty or near-empty directories left from abandoned architecture attempts
- generated scaffolding that was never fully integrated
- dead routes, handlers, workers, or adapters still shaping the repo

### Example failure patterns
- full folder tree exists for a “future architecture” but production uses one bypass file instead
- utility or service files linger with no practical execution path

---

### 2. AI Duplication Patterns
Reviewer should intensify attention on:
- repeated logic implemented separately in multiple places
- near-duplicate functions or modules with subtle drift
- multiple partially-overlapping helpers created by separate prompting sessions
- logic copied instead of consolidated where the duplication now carries risk

### Example failure patterns
- three validation implementations for the same concept across different files
- generated “v2” / “new” / “improved” helpers living alongside originals indefinitely

---

### 3. Module & File Boundary Health
Reviewer should intensify attention on:
- files/modules doing too many unrelated jobs
- inverted or confused dependency boundaries
- organization that reflects prompt sequence rather than system shape
- public/internal boundaries that are too broad or unclear

### Example failure patterns
- one “utils” file imports half the application
- feature code scattered across unrelated modules for historical rather than functional reasons

---

### 4. Function & Scope Complexity
Reviewer should intensify attention on:
- accretion-grown functions
- excessive branching or deep nesting
- too much work performed in one scope
- functions that mix validation, transformation, persistence, side effects, and response formatting

### Example failure patterns
- handler that parses input, performs auth logic, queries DB, sends notifications, and formats output in one body
- function complexity growing from repeated “just add this case” prompting

---

### 5. Prompt Artifact & LLM-Generated Residue
Reviewer should intensify attention on:
- TODO/filler comments that reflect generation history rather than engineering intent
- placeholder names or generic comments surviving into real code
- suspiciously narrative comments that explain what the model tried to do instead of what the code must do
- “just in case” fallback branches or helpers with no clear rationale

### Example failure patterns
- comments like “you may want to adjust this later” in production paths
- code shaped by multiple prompt artifacts rather than intentional design

---

### 6. Naming Consistency & Semantic Clarity
Reviewer should intensify attention on:
- inconsistent naming for the same concept
- generic names that hide responsibility
- multi-model naming drift across modules
- function/class names whose implied role does not match behavior

### Example failure patterns
- same concept called `task`, `job`, `workflow`, and `process` across adjacent modules
- “manager” or “service” names hiding very different kinds of responsibility

---

### 7. Config & Env Health
Reviewer should intensify attention on:
- stale flags and config keys
- undead environment variables no longer used meaningfully
- feature toggles that became permanent architecture clutter
- config branches that preserve abandoned behavior indefinitely

### Example failure patterns
- flag exists to control a feature that no longer has two real code paths
- env vars referenced in docs and templates but ignored by current code

---

### 8. Dependency Weight vs Actual Usage
Reviewer should intensify attention on:
- heavy libraries used for trivial work
- multiple packages providing overlapping functionality
- generated installs that expanded the repo’s complexity without proportional benefit
- abstractions imported because examples used them, not because the project needed them

### Example failure patterns
- large UI/state/helper libraries added for one narrow convenience feature
- multiple small dependencies replacing simple native/platform functionality

---

### 9. Internal API Surface Bloat
Reviewer should intensify attention on:
- over-exported modules
- broad helper surfaces with unclear intended usage
- no distinction between internal-only plumbing and stable interfaces
- public methods/functions that exist only because they were generated, not because callers need them

### Example failure patterns
- module exports everything by default though only one or two functions are legitimate entry points
- internal helpers accidentally become dependency surfaces for the rest of the repo

---

### 10. Dataflow Clarity
Reviewer should intensify attention on:
- hidden side effects across data movement
- unclear ownership of transformed objects or records
- long chains where the source of truth becomes hard to identify
- function boundaries that obscure rather than clarify how data changes

### Example failure patterns
- same object transformed in-place by several helpers with no explicit contract
- data origin becomes hard to identify after multiple convenience wrappers

---

### 11. Comment & Documentation Quality
Reviewer should intensify attention on:
- stale comments
- obvious comments where rationale is needed elsewhere
- absent explanation on non-obvious trade-offs
- docs/comments that lag behind current code because the repo evolved through prompting

### Example failure patterns
- comments describe old behavior no longer implemented
- complex or unusual logic has no explanation while trivial lines do

---

### 12. Test Artifact Hygiene
Reviewer should intensify attention on:
- skipped tests left indefinitely
- fixtures that encode unrealistic or confusing shapes
- tests that increase fear of cleanup because they are opaque or brittle
- test files carrying historical residue from abandoned designs

### Example failure patterns
- dead or skipped tests make the suite look larger but not more protective
- tests duplicate historical scaffolding the application no longer uses

---

## What This Lens Should Not Duplicate

This lens should not become a generic review of all code quality concerns.

Avoid using it to re-run:
- general correctness and failure-path review → Code 4 / Defect Discovery
- dependency vulnerability review → Code 5 / Security 5
- secret exposure review → Secrets & Trust Boundaries / Security 6
- performance benchmarking → Production 4
- formatting/style-only criticism
- baseline architecture coherence review → Code 2

Instead, this lens should focus on **simplification leverage and structural health**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Code Health Lens Summary
- Overall code-health posture:
- Biggest simplification opportunity:
- Most harmful residue/duplication pattern:
- Ownership impact:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Dead code & orphaned scaffolding | PASS / NEEDS_WORK / BLOCK | ... |
| AI duplication patterns | PASS / NEEDS_WORK / BLOCK | ... |
| Module & file boundary health | PASS / NEEDS_WORK / BLOCK | ... |
| Function & scope complexity | PASS / NEEDS_WORK / BLOCK | ... |
| Prompt artifact / generated residue | PASS / NEEDS_WORK / BLOCK | ... |
| Naming consistency & clarity | PASS / NEEDS_WORK / BLOCK | ... |
| Config & env health | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Dependency weight vs actual usage | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Internal API surface bloat | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Dataflow clarity | PASS / NEEDS_WORK / BLOCK | ... |
| Comment/documentation quality | PASS / NEEDS_WORK / BLOCK | ... |
| Test artifact hygiene | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### Simplification Opportunities
| Opportunity | Scope | Risk | Benefit | Suggested Action |
|---|---|---|---|---|
| ... | ... | Low/Med/High | ... | Delete / Merge / Rename / Collapse / Re-scope |

### High-Signal Findings
For each significant finding:
- Finding:
- Why it hurts ownership:
- Evidence:
- Simplification direction:
- Cross-stage handoff:

### Code Health Lens Blockers
- Blocking structure/health issues:
- Simplification prerequisites:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- structure is so bloated, duplicated, or residue-heavy that safe ownership is unrealistic
- meaningful cleanup is required before later work can proceed responsibly
- the codebase is materially harder to reason about because of preventable complexity accumulation

### NEEDS_WORK-level lens findings
Use when:
- the codebase is workable but clearly degrading under accumulated complexity
- simplification opportunities are large enough to matter to future velocity and safety
- health problems are important but still containable

### PASS-level lens findings
Use when:
- the structure is comparatively lean and understandable
- duplication and residue are bounded
- reviewers can identify simplification opportunities without concluding the codebase is unhealthy overall

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- abandoned architectural scaffolding still shaping the repo
- multiple generated implementations of the same idea
- “improved” helper versions piling up without cleanup
- generic utility files becoming dumping grounds
- placeholder comments and narrative residue left by LLM generation
- stale feature flags and env branches cluttering live paths
- over-exported modules with unclear internal/public boundaries
- dataflow so obscured that ownership and safe cleanup become difficult
- test files and fixtures preserving dead historical shapes that no longer reflect current behavior

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Defect Discovery** when duplication and mess are actively hiding behavioral defects
- **Workflow & Automation Reliability** when structural clutter makes automation unsafe to own
- **Project Delivery & Operational Governance** when code health is becoming a delivery and ownership risk
- **Secrets & Trust Boundaries** when residue or dead branches widen trust surface accidentally

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I can identify where this codebase is healthier than it looks, where it is more bloated than it needs to be, and what could be deleted, merged, narrowed, or clarified to materially improve long-term ownership without turning the review into style policing.

If that statement cannot be made honestly, this lens should produce meaningful findings.

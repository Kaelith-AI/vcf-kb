---
type: review-stage
review_type: code
stage: 1
stage_name: "Project Definition Scope Reviewability"
version: 1.0
updated: 2026-04-18
---
# Code Stage 1 — Project Definition, Scope & Reviewability

## Stage Metadata
- **Review type:** Code
- **Stage number:** 1
- **Stage name:** Project Definition, Scope & Reviewability
- **Purpose in review flow:** Truth-establishing gate for the entire code review pass
- **Default weight:** Highest importance within Code review
- **Required reviewer posture:** Skeptical, evidence-driven, explicit about uncertainty
- **Lens interaction:** All lenses may influence emphasis, but no lens may bypass this stage

---

## Why This Stage Exists

This stage exists to answer the most important question in the entire review system:

> What is this project, really?

Before evaluating architecture, testing, correctness, security, maintainability, compliance, or release readiness, the reviewer must establish basic truth about the project:
- what it claims to do
- what it actually appears to do
- what is real versus stubbed, mocked, generated, incomplete, or aspirational
- who owns it
- how mature it actually is
- whether the repository is reviewable enough for deeper stages to mean anything

If this stage is weak, every later stage becomes less trustworthy. A reviewer who does not know what the project actually is cannot reliably judge whether it is good.

This is especially important for vibe-coded projects because AI-generated code often produces:
- convincing READMEs that describe intent rather than reality
- scaffolding that looks like implementation
- placeholder routes and handlers that imply capability without delivering it
- comments that describe what the code “should” do rather than what it does
- mixed levels of completion across the same repo
- apparent polish without operational or architectural substance

**This stage is the anti-hallucination gate.** It prevents the rest of the review from proceeding on false assumptions.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What the project claims to be**
2. **What the project appears to be in code reality**
3. **What is in scope, out of scope, shadow scope, or overclaimed**
4. **What maturity level the project actually fits**
5. **Who owns it and who would maintain/fix it**
6. **Whether the repository is reviewable enough to justify deeper review**

If the reviewer cannot answer those questions confidently, this stage should not pass.

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Project identity summary**
2. **Claimed scope vs observed scope comparison**
3. **Maturity classification using the required rubric below**
4. **Ownership/accountability summary**
5. **Reviewability assessment**
6. **Key truth gaps, shadow scope, and overclaim findings**
7. **Important design/risk comments that should be carried forward**
8. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- `README.md` and top-level docs
- dependency manifests (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, etc.)
- top-level file/folder structure
- entrypoints (`main.*`, `server.*`, `app.*`, CLI bootstraps, routers, handlers)
- representative core modules for each claimed major feature
- config/example env files
- tests only insofar as they help confirm whether claimed functionality is real
- comments that document design choices, risk acceptance, or known incompleteness

Optional but useful if available:
- issue tracker / roadmap docs
- architecture notes
- deployment docs
- git history for mass-generation signals or abrupt scope shifts

---

## Core Review Rule

The reviewer must explicitly distinguish between:
- **Claimed** — what docs/comments/marketing text say
- **Observed** — what code/assets/config suggest
- **Verified** — what the reviewer can support with direct evidence

Never collapse these into one category.

A project may claim a feature, appear to include a feature, and still fail verification if the implementation is stubbed, disconnected, or contradicted elsewhere.

---

# Review Procedure

## Step 1 — Identify the Project’s Stated Identity

Determine what the project says it is.

### Check
- [ ] Project has a clear name
- [ ] Project has a stated purpose
- [ ] Intended audience/users are identifiable
- [ ] Claimed major capabilities are explicit enough to evaluate
- [ ] Declared stack/tooling broadly matches repo reality

### Reviewer questions
- What problem does the project say it solves?
- Who is it for?
- What are the project’s claimed primary functions?
- What platform/runtime/deployment context does it imply?

### Common failure patterns
- README describes a generic template, not the actual project
- README describes ambition, not current functionality
- repo title implies one thing while code clearly does another
- “AI app / platform / framework” language with no concrete scope

### Example — Correct
**Claim:** “Internal webhook dispatcher that receives events and forwards them to configured subscriber endpoints.”

**Good evidence:**
- route definitions for webhook ingestion
- queue/dispatch modules
- config for subscriber endpoints
- docs match code structure

### Example — Incorrect
**Claim:** “Enterprise workflow automation platform.”

**Observed:**
- a single Express server with two CRUD routes and a TODO list

**Why this fails:**
The claim is too broad and unsupported. Reviewer should record substantial overclaim.

---

## Step 2 — Map Claimed Scope Against Observed Scope

Identify whether the project’s documented scope matches what exists.

### Check
- [ ] Major claimed features can be mapped to code locations
- [ ] Claimed features are not merely names, placeholders, or route stubs
- [ ] Undocumented but real functionality is recorded as shadow scope
- [ ] Claimed but unimplemented functionality is recorded as truth gap
- [ ] Mixed completion states are called out explicitly

### Definitions
- **Claimed scope:** functionality the project says exists
- **Observed scope:** functionality code/config/tests suggest may exist
- **Verified scope:** functionality that appears materially implemented
- **Shadow scope:** meaningful functionality present in code but absent from docs
- **Truth gap:** functionality claimed in docs but absent, stubbed, or contradicted in code

### Reviewer questions
- Which claimed features are clearly implemented?
- Which are partially implemented?
- Which are placeholders or aspirations?
- Is there meaningful functionality with no documentation or explanation?

### Common failure patterns
- docs describe 8 features; code implements 3
- routes exist for features whose handlers are empty or return mock data
- generated folders imply capabilities that are not wired into the main flow
- tests confirm existence of symbols rather than behavior

### Example — Correct
**Claim:** “Supports email/password login only.”

**Observed:**
- login route
- password hashing/verification
- JWT/session issuance
- no OAuth or MFA references in code paths

**Result:** claim and observed scope align

### Example — Incorrect
**Claim:** “Supports OAuth, MFA, audit logging, tenant isolation, and full RBAC.”

**Observed:**
- one hard-coded login route
- no OAuth flow
- no MFA code
- no audit event system
- role field present but unused

**Result:** major truth gap; stage likely BLOCK or NEEDS_WORK depending on scope and release posture

---

## Step 3 — Determine What Is Real vs Stubbed vs Aspirational

The reviewer must identify the completion state of major project areas.

### Check
- [ ] Entry points are real and meaningful
- [ ] Core feature handlers contain substantive logic
- [ ] Placeholder methods are identified
- [ ] Mock/demo/sample code is not mistaken for production behavior
- [ ] Generated scaffolding is not credited as completed implementation

### Completion state categories
Use these when summarizing key features/components:
- **Implemented** — materially present and connected
- **Partial** — substantial but incomplete
- **Stubbed** — named but not actually implemented
- **Mocked** — simulated behavior standing in for real behavior
- **Aspirational** — described in docs/comments but not materially present

### Common failure patterns
- `pass`, `return null`, `throw new Error("not implemented")`
- functions with comments claiming complex behavior but empty bodies
- API routes returning static sample payloads presented as working features
- boilerplate CRUD or AI-generated handlers counted as complete domain logic

### Example — Correct
```python
def process_payment(amount):
    raise NotImplementedError("Stripe integration not implemented yet")
```
**Why it is acceptable at this stage:**
It is incomplete, but honest. Reviewer should mark feature as stubbed, not implemented.

### Example — Incorrect
```python
def process_payment(amount):
    # Securely processes card payments with fraud validation
    pass
```
**Why it fails:**
The comment and function name falsely imply real implementation.

---

## Step 4 — Assess Reviewability

The reviewer must decide whether the repo can be meaningfully reviewed.

### Check
- [ ] Core files are present
- [ ] Project structure is navigable enough for deeper review
- [ ] Dependency and setup context is sufficient to orient the reviewer
- [ ] Missing files/docs/config do not make review fundamentally speculative
- [ ] Major ambiguity is explicitly reported

### Reviewer questions
- Can I identify the entrypoints and main subsystems?
- Can I tell which files matter?
- Is configuration/setup understandable enough to support later stages?
- Would later conclusions be evidence-based or mostly guesswork?

### Reviewability failure modes
- repo has many generated files but unclear core execution path
- required config is missing and behavior cannot be inferred
- there is no discernible boundary between core code, dead code, examples, and experiments
- naming and structure are so weak that later stages would be low-confidence theater

### BLOCK rule
If the repo is too incomplete, incoherent, or ambiguous to support meaningful review, use **BLOCK** even if some code exists.

---

## Step 5 — Identify Ownership & Accountability

The reviewer must determine whether a human is accountable for the project.

### Check
- [ ] A responsible owner or team is identifiable
- [ ] Maintenance responsibility is visible or inferable
- [ ] There is some credible path for clarifying ambiguity or fixing defects
- [ ] The project is not effectively “owned by the prompt”

### Reviewer questions
- Who is responsible for this code after the current review?
- Who would fix issues found in later stages?
- Is ownership explicit or only implied?
- Is the codebase effectively abandoned or orphaned?

### Common failure patterns
- no owner anywhere in repo/docs
- ownership only implicit via personal local paths or author email
- project appears to exist only as a generated artifact without operational steward

### Note
Ownership need not be enterprise-grade, but it must be real enough that later findings have somewhere to go.

---

## Step 6 — Classify Project Maturity Using the Required Rubric

The reviewer must classify the project based on evidence, not claims.

### Check
- [ ] A maturity level is selected from the rubric below
- [ ] The classification is justified with evidence
- [ ] Any mismatch between claimed and actual maturity is explicitly reported

### Required Maturity Classification Rubric

| Classification | Definition | Typical Evidence Signals |
|---|---|---|
| **Prototype** | Proof of concept, not intended for real use | demo flows, partial implementation, scaffolding, many stubs, no strong ownership/ops expectations |
| **Internal Tool** | Functional for internal use, limited audience | useful for a known internal workflow, rough edges tolerated, lower polish/support expectations |
| **MVP** | Minimum viable product, early external use acceptable | primary feature path exists, bounded audience, known gaps still present |
| **Operational App** | Actively used, some production expectations | real users/workflows, some support expectations, stronger reliability needs |
| **Production Candidate** | Ready for formal production review | coherent implementation, bounded risk, enough structure to justify full production gating |
| **Mature Production** | Battle-tested, established operational history | sustained real usage, durable ownership, strong operational and quality signals |

### Rules for use
- Choose the **lowest maturity level fully supported by evidence**.
- Do **not** let polished docs or UI inflate the rating.
- If critical features are stubbed, the project should not rate above **Prototype** or **Internal Tool** depending on actual use.
- If ownership, reliability posture, and reviewability are weak, the project should not rate above **MVP** even if much of the feature set exists.

### Example — Incorrect classification
Project claims “production-ready platform,” but:
- critical auth flows incomplete
- ownership unclear
- no clear run/deploy docs
- tests shallow

**Incorrect rating:** Production Candidate

**Better rating:** MVP or Internal Tool, depending on actual use and evidence

---

## Step 7 — Evaluate Design / Risk Comments as Evidence

This project uses a special rule approved during planning:

> Documented design choices, trade-offs, and risk comments are evidence to consider — but never automatic justification.

### Check
- [ ] Design rationale comments are identified where material
- [ ] Comments are compared against actual implementation behavior
- [ ] “Known risk” comments are treated as open risk unless mitigations are visible
- [ ] Reviewer explicitly challenges weak or stale rationale

### Reviewer must do all of the following
1. Note comments that explain **why** a non-obvious choice exists
2. Verify whether the code actually reflects the stated reasoning
3. Record disagreement where the rationale is weak, incomplete, outdated, or inferior to a better approach
4. Carry important design/risk comments forward into later stages if they affect architecture, security, compliance, supportability, or release confidence

### Example — Correct use of comment as evidence
```js
// Rate limiting is enforced at the reverse proxy layer.
// See infra/nginx.conf for active limit_req configuration.
```
**Good reviewer behavior:** inspect infra config and verify

### Example — Incorrect use of comment as justification
```js
// SQL injection prevented here
const q = "SELECT * FROM users WHERE id = " + userId
```
**Correct reviewer response:** comment contradicted by code; record failure

### Important rule
A comment may improve understanding. It does not waive review.

---

## Step 8 — Record Cross-Stage Handoff Notes

This stage should prepare later stages, not operate in isolation.

### Reviewer must carry forward:
- major claimed-vs-observed mismatches → Code 2, Code 4, Code 9
- ownership/accountability concerns → Code 7, Production 1, Production 7, Production 9
- maturity overclaim → Code 9, Production 1, Production 9
- reviewability gaps → all later stages as confidence constraint
- sensitive-data/compliance hints → Code 8 and Security 1
- suspicious architecture or generated scaffolding signals → Code 2, Code 5, Security 3

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Architecture:
  - Verification:
  - Security:
  - Compliance/data:
  - Supportability/ownership:
  - Release confidence:

---

## Lens Interaction Guidance

Lenses do not change the obligation to establish truth.
They only change what the reviewer pays extra attention to.

Examples:
- **llm-focused lens:** increase scrutiny of generated scaffolding, prompt-shaped architecture, aspirational comments, and fake completeness
- **credentials lens:** pay extra attention to claims involving auth, secrets, key handling, and whether they are actually implemented
- **bug-hunt lens:** pay extra attention to scope mismatches hiding broken paths
- **platform lens:** pay extra attention to unsupported claims about OS/runtime behavior already visible at intake

If a lens surfaces a material finding at Stage 1, record it now and carry it forward.

---

## Severity / Gating Model

### PASS
Use PASS when:
- project identity and purpose are understandable
- major claims are materially evidence-backed
- ownership is real enough to support later review
- maturity classification is honest and defensible
- repo is reviewable enough that later stages can proceed meaningfully

### NEEDS_WORK
Use NEEDS_WORK when:
- core identity is understandable, but there are meaningful truth gaps
- docs overstate capability in bounded ways
- ownership or reviewability is partial
- some important areas are stubbed or ambiguous, but the project remains reviewable

### BLOCK
Use BLOCK when:
- reviewer cannot determine what the project actually is
- major claimed capabilities are absent or mostly stubbed
- repo is too incomplete, incoherent, or misleading for deeper review to be meaningful
- project truthfulness is so poor that downstream stages would be low-confidence theater

---

## Escalation Guidance

Escalate or explicitly flag for stronger downstream scrutiny when:
- security/privacy-sensitive behavior is claimed but unclear → escalate into Security 1 / Code 8
- architecture claims materially contradict code → flag for Code 2 and Security 3
- ownership is weak or absent → flag for Production 1 / Production 7 / Production 9
- maturity is overstated relative to evidence → flag for Code 9 / Production 9
- reviewability is impaired → lower confidence for all subsequent stages

---

## Required Report Format

Use this report structure for Stage 1 output.

### 1. Project Identity Summary
- Project name:
- Claimed purpose:
- Intended audience/users:
- Primary entrypoints:
- Declared stack:

### 2. Claimed Scope vs Observed Scope
| Area / Feature | Claimed | Observed | Verified Status |
|---|---|---|---|
| Feature A | ... | ... | Implemented / Partial / Stubbed / Mocked / Aspirational |
| Feature B | ... | ... | ... |

### 3. Shadow Scope
List any meaningful functionality present in code but absent from docs.

### 4. Truth Gaps / Overclaims
List any functionality claimed but absent, stubbed, contradicted, or overstated.

### 5. Ownership & Accountability
- Identified owner/team:
- Maintenance path:
- Confidence in accountability:

### 6. Maturity Classification
- Selected maturity level:
- Evidence supporting it:
- Mismatch with project claims (if any):

### 7. Reviewability Assessment
- Reviewability confidence: High / Medium / Low
- Major blockers to deeper review:
- Missing artifacts/config/docs:

### 8. Design / Risk Comments Worth Carrying Forward
- Comment / rationale:
- Verified / contradicted / unclear:
- Carry-forward note:

### 9. Carry-Forward Concerns
- Architecture:
- Verification:
- Security:
- Compliance/data:
- Supportability/ownership:
- Release confidence:

### 10. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- assume the README is truthful
- count routes, files, or scaffolding as completed features without checking behavior
- confuse “code exists” with “feature exists”
- let polished naming/UI/docs inflate maturity classification
- accept design comments as proof
- proceed casually when the repo is not reviewable

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I understand what this project claims to be, what it actually appears to be, what is incomplete or overstated, who owns it, how mature it really is, and whether the repo is reviewable enough for deeper judgment.

If that statement cannot be made honestly, the stage should not pass.

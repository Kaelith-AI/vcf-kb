---
type: review-stage
review_type: vibe
stage: 6
title: "Solution Fit vs Pattern Matching"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 6 — Solution Fit vs Pattern Matching

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 6
- **Stage name:** Solution Fit vs Pattern Matching
- **Purpose in review flow:** Determine whether the LLM solved the actual problem in this specific system, or whether it recognized a surface pattern and applied a standard template from its training data — potentially solving the wrong problem, in the wrong context, with wrong-fit infrastructure
- **Default weight:** High
- **Required reviewer posture:** Context-aware, system-specific. The reviewer must know enough about the actual system to recognize when a solution is context-appropriate vs generically competent.
- **Lens interaction:** Lenses may direct attention to specific pattern-matching risks in particular domains, but the core question is always: does this solution fit this system, or does it fit a textbook version of a similar system?
- **Depends on:** Vibe Stage 1 (was the right problem stated?), Vibe Stage 2 (are API calls real for this system?), Stage 5 (were pattern-match signals flagged?)
- **Feeds into:** Vibe Stages 8 and 9; Code Stage 2 (architecture coherence) if the pattern-matched solution introduces architecture-level misfit

---

## Why This Stage Exists

Language models are trained on enormous volumes of code. They are very good at recognizing patterns: "this looks like a rate-limiting problem," "this looks like an auth flow," "this looks like a retry with backoff." When they recognize a pattern, they tend to apply the canonical solution for that pattern from their training data.

This produces a failure mode that is unlike most code bugs: **the solution is technically correct for the pattern it is responding to, but wrong for the actual system**.

The LLM may:

**Apply a generic solution to a system-specific constraint.** The system uses cursor-based pagination — the LLM applied offset-based pagination because it is more common in training examples. The code is internally consistent and well-written. It is also fundamentally incompatible with the existing pagination model.

**Use a well-known library where a purpose-built internal tool exists.** The system has an internal HTTP client wrapper that adds authentication, tracing, and retry logic. The LLM added `axios` directly and reimplemented a subset of those concerns, bypassing the established internal infrastructure.

**Apply a heavyweight pattern to a lightweight problem.** The task was to add one configuration option. The LLM introduced a full configuration management system, a config object hierarchy, and a validation layer — because "configuration management" matched a pattern it knows. The result works but creates maintenance overhead and architectural footprint far beyond what the problem required.

**Apply a correct architectural pattern in the wrong layer.** The LLM recognized "we need rate limiting" and added it in the application service layer, following a common tutorial pattern. In this system, rate limiting belongs in the middleware layer or the infrastructure layer. The placement is wrong-fit even though the technique is correct.

**Solve the training example of the problem instead of the system's version.** The system has a custom error hierarchy with domain-specific error codes. The LLM's solution routes through `Error` and its standard subtypes because that is what the examples in training data use — missing the system's actual error taxonomy.

This failure mode matters because pattern-matched solutions often ship without triggering review: they compile, they pass tests, and they look correct to a reviewer who does not know the system well. The wrongness is in the fit, not in the internal correctness.

Research in LLM evaluation (notably benchmarks like SWE-Bench and related work in agentic code generation from Anthropic and DeepMind) shows that model performance on isolated code tasks does not reliably predict performance on system-specific tasks where context breaks the pattern match. This stage is the check for that class of failure.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **What problem the LLM appeared to recognize** (the pattern it responded to)
2. **What the actual problem is** in this specific system's context
3. **Whether the solution fits the actual system** — its architecture, patterns, infrastructure, and constraints
4. **Whether the LLM used the system's established infrastructure** or introduced alternatives
5. **Whether the solution's scope and weight is proportionate** to the problem
6. **Whether the solution bypasses or undermines system-specific invariants** in ways that technically work but contextually wrong

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Pattern recognition assessment** — what pattern the LLM appears to have matched
2. **System-fit analysis** — does the solution fit this specific system's architecture, patterns, and infrastructure
3. **Established-infrastructure adherence** — did the LLM use the system's existing tools or introduce alternatives
4. **Solution weight proportionality** — is the solution scope appropriate to the problem size
5. **Layer placement assessment** — is the solution in the right architectural layer for this system
6. **Context-appropriateness findings** — specific cases where the solution is correct for a textbook context but wrong for this one
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect:
- the existing codebase's patterns for solving similar problems (how does this system do error handling? authentication? pagination? configuration?)
- the existing infrastructure: does the system already have a tool for what the LLM just reinvented?
- the existing architectural layer structure: where does this type of concern live in the system?
- the system's existing conventions: naming, dependency patterns, abstractions
- the LLM's output: does it engage with the existing system or write as if starting fresh?

The reviewer must bring knowledge of the actual system to this stage. If the reviewer does not know the system well enough to assess fit, they should note this as a verification gap and request a domain expert to review.

---

## Core Review Rule

**A solution is not correct just because it is correct in isolation.**

Correctness in this stage is measured against this system, not against a generic version of the problem.

A technically perfect implementation of a pattern-matched solution that is the wrong pattern for the system is a Stage 6 failure.

---

# Review Procedure

## Step 1 — Identify the Problem Pattern the LLM Matched

Determine what the LLM recognized the problem as, independent of what the problem actually is.

### How to identify the matched pattern
- Look at the solution structure: does it match a well-known pattern (retry with backoff, pagination, auth middleware, event bus, repository pattern, rate limiter)?
- Look at the libraries introduced: do they signal a pattern (adding Zod for validation suggests the LLM recognized "input validation"; adding Bull/BullMQ suggests it recognized "job queue")
- Look at the naming: does the code use standard names from a well-known pattern ("Saga", "CQRS", "Mediator") when the system does not use those terms?
- Look at the architecture footprint: is the solution shaped like a tutorial or like an addition to an existing system?

### Check
- [ ] The reviewer can name the pattern the LLM appears to be applying
- [ ] The reviewer can identify whether that pattern is the right one for this problem

### Common pattern-match signals
- LLM introduces a new abstraction layer when the existing architecture already handles this concern
- Solution reads like a standalone example, not like an addition to an existing system
- Solution uses a well-known pattern by name (Repository Pattern, Strategy Pattern, Builder Pattern) when the system does not
- LLM's code ignores the surrounding system's conventions and writes in a different style or structure

---

## Step 2 — Assess Whether the Solution Fits This System's Architecture

Compare the solution's architectural placement against where this type of concern actually lives in the system.

### Check
- [ ] The solution uses the correct layer for this type of concern (middleware layer vs service layer vs infrastructure layer)
- [ ] The solution's dependencies flow in the correct direction for this system
- [ ] The solution does not introduce a parallel abstraction for something the system already has
- [ ] The solution's interfaces are consistent with the system's existing interface conventions

### Architectural layer placement assessment

**Auth/authz:** Where does this system enforce auth? Middleware? Decorators? A gateway? Did the LLM put auth logic in the application layer of a system that uses middleware-based auth?

**Error handling:** Where does this system handle and map errors? Application service? Domain layer? The framework's error handler? Did the LLM introduce a new error handling location inconsistent with where the system already does it?

**Configuration:** How does this system load and access config? Env vars directly? A typed config class? A central config singleton? Did the LLM introduce a different pattern?

**Logging/observability:** Does the system have an established logging interface? Did the LLM use `console.log` directly in a system that has a structured logger?

**Database access:** Does this system use a repository pattern, active record, or direct ORM calls? Did the LLM introduce a different pattern in the solution?

### Example — Layer mismatch
**System pattern:** Rate limiting happens in the NGINX layer and is documented as an infrastructure concern.

**LLM solution:** Added application-level rate limiting in the Express middleware because "rate limiting middleware is standard practice in Node.js applications."

**Assessment:** Technically correct implementation of rate limiting. Wrong layer for this system. Creates dual rate limiting (or conflicting rate limiting) with the infrastructure layer. Pattern match succeeded; system fit failed.

---

## Step 3 — Verify Use of Established System Infrastructure

Determine whether the LLM used what the system already provides.

### What to look for in the existing system
- Internal HTTP clients with built-in auth, tracing, or retry
- Custom loggers with structured output or correlation IDs
- Domain-specific error classes and error handling flows
- Internal validation utilities
- Custom ORM configurations or query builders
- Internal testing utilities or fixture factories
- Feature flag clients or config service clients

### Check
- [ ] The reviewer inventories what internal infrastructure is relevant to the change
- [ ] The LLM's solution uses that infrastructure rather than reinventing it
- [ ] Where the LLM introduced an external library for something the system already handles internally, the reviewer flags the duplication

### Common pattern-match bypass patterns
- Adding `axios` for HTTP when the system has an internal HTTP client
- Adding `winston` for logging when the system has a custom logger
- Adding `joi` or `zod` for validation when the system has validation utilities
- Adding `pino` for structured logging when the system uses a different structured logger
- Adding `dotenv` for config when the system already manages config in a specific way

### Important distinction
Sometimes the LLM introduces a new library because the existing infrastructure genuinely doesn't handle the case. This is different from pattern-match bypass. The reviewer must assess whether the existing infrastructure was adequate or whether there was a genuine gap.

### Example — Correct use of system infrastructure
**System has:** An internal `HttpClient` class with auth injection, retry, and distributed tracing.

**LLM solution:** Uses `HttpClient.post('/api/endpoint', body)` with appropriate options.

**Assessment:** Correct infrastructure use. The LLM recognized the existing pattern.

### Example — Pattern-match bypass
**System has:** The same `HttpClient`.

**LLM solution:** Uses `axios.post('https://api.example.com/endpoint', body, { headers: { Authorization: `Bearer ${token}` } })`.

**Assessment:** Pattern-match bypass. The LLM wrote the generic "make an authenticated HTTP request" pattern instead of using the system's existing abstraction. Auth may not be handled the same way; tracing is missing; retry behavior differs.

---

## Step 4 — Assess Solution Weight Proportionality

Determine whether the solution's scope and complexity is proportionate to the problem.

### Proportionality check
- Is the solution scope (new files, new abstractions, new dependencies) proportionate to the problem?
- Does the solution introduce infrastructure that will need to be maintained beyond the immediate problem?
- Did the LLM "architect up" from a simple change to a more general system?

### Common disproportionate patterns
**Over-engineering small changes:**
- Request: "Add a `description` field to the user model"
- LLM output: Introduces a full field-metadata system with validation, migration management, and a schema registry

**Adding systems for one-off problems:**
- Request: "Parse this JSON configuration file"
- LLM output: Introduces a full configuration management library with schema validation, env var overrides, and a config reload mechanism

**Pattern-driven complexity:**
- Request: "Add retry behavior to this API call"
- LLM output: Implements a full retry abstraction with pluggable backoff strategies, circuit breaker integration, and a configurable retry policy registry — for one call site

### Note
Proportionality judgment requires knowing the system's codebase and maintenance capacity. A large team maintaining a complex system might welcome the general solution. A small system with a single maintainer might be harmed by the added complexity. The reviewer should assess this in context.

---

## Step 5 — Assess Defensive Workaround vs Root-Cause Fix

A specific pattern-matching failure: the LLM recognized "there's a bug" and applied a defensive workaround pattern instead of diagnosing and fixing the root cause.

### Defensive workaround signals
- Adding null checks everywhere instead of finding why null is reaching that point
- Adding a `try/catch` around a failing section instead of understanding and fixing the failure
- Adding a retry loop around an operation that is deterministically failing because of a logic error
- Adding input sanitization on outputs instead of fixing the incorrect input handling

### Check
- [ ] Where the task was to fix a bug, the reviewer verifies the fix addresses the cause, not just the symptom
- [ ] Defensive checks added without understanding the root cause are flagged
- [ ] The LLM's explanation of why its fix works is assessed against the actual failure mode

### Example — Workaround vs fix
**Bug report:** "The order processing crashes when `order.items` is null."

**Workaround (pattern match):** `if (order.items === null) return; // safety check`

**Root cause fix:** Understanding why `order.items` is null — possibly a database query that doesn't return related records — and fixing the query to populate the field correctly.

**Assessment:** The workaround stops the crash. The root cause remains. If `order.items` being null is a data integrity problem, the workaround masks it and allows bad data to silently pass through.

---

## Step 6 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Vibe 8:** pattern-matched solutions often carry incorrect runtime assumptions about how the system actually behaves; Vibe 8 deepens this
- **Code Stage 2:** architectural layer mismatches and parallel abstractions are architecture coherence concerns
- **Vibe 9:** wrong-fit solutions that cannot be easily replaced reduce release confidence and create maintenance debt

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Pattern match identified:
  - System fit assessment:
  - Infrastructure bypass findings:
  - Proportionality concerns:
  - Layer placement findings:
  - Defensive workaround signals:
  - Architecture coherence impact:
  - Release confidence impact:

---

## Lens Interaction Guidance

Examples:
- **legacy-system lens:** pattern-matched solutions are especially dangerous in systems with established conventions; the newer pattern may conflict with existing subsystems the LLM didn't see
- **microservices lens:** pattern matches from monolith patterns (transactions, shared state) may be wrong for a distributed services context
- **embedded/resource-constrained lens:** solutions optimized for cloud-scale patterns may be wrong-fit for resource-constrained environments
- **domain-specific lens:** in finance, healthcare, or other regulated domains, "standard" patterns from general-purpose training data may be wrong for regulatory or compliance reasons

---

## Severity / Gating Model

### PASS
Use PASS when:
- the solution fits the system's architecture and existing patterns
- the LLM used established system infrastructure where it exists
- the solution's scope is proportionate to the problem
- where defensive workarounds exist, they are appropriate and bounded

### NEEDS_WORK
Use NEEDS_WORK when:
- the solution is partially wrong-fit — generally correct but using a different pattern than the system establishes
- the LLM bypassed system infrastructure in bounded ways that are fixable
- disproportionate scope was introduced but the functionality is sound
- defensive workarounds are present but the core behavior is correct

### BLOCK
Use BLOCK when:
- the solution is built on a fundamentally wrong pattern for this system — it technically works but is architecturally incompatible
- the LLM bypassed critical system infrastructure (auth, logging, error handling) in ways that create gaps
- the solution solves a different problem than the one that exists in this system
- wrong-fit infrastructure was introduced at a scale that creates durable maintenance and architectural debt

---

## Escalation Guidance

Escalate or explicitly flag when:
- auth infrastructure was bypassed → Security review
- pattern-matched solution creates architectural drift that affects other teams → Code Stage 2 (architecture coherence)
- defensive workaround masks a data integrity or reliability problem → Production review

---

## Required Report Format

### 1. Pattern Recognition Assessment
- Pattern the LLM appears to have matched:
- Correct pattern for this system:
- Match / Mismatch / Partial:

### 2. System-Fit Analysis
- Architectural layer placement:
- Expected layer for this concern:
- Misfit findings:

### 3. Established Infrastructure Adherence
| System Infrastructure | LLM Used It? | Alternative Introduced? | Impact |
|---|---|---|---|
| Internal HTTP client | No | `axios` | Auth/tracing gap |

### 4. Solution Weight Proportionality
- Problem scope:
- Solution scope:
- Proportionate? Yes / No / Concern:

### 5. Defensive Workaround Assessment
- Workaround signals found:
- Root cause addressed:
- Risk if root cause unresolved:

### 6. Carry-Forward Concerns
- Pattern match identified:
- System fit assessment:
- Infrastructure bypass findings:
- Proportionality concerns:
- Architecture coherence impact:
- Release confidence impact:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- evaluate the solution in isolation without comparing it to the system's existing patterns
- give credit for "technically correct" when the system-fit is wrong
- accept a defensive workaround as a root-cause fix without verifying the root cause was understood
- miss infrastructure bypasses because the alternative implementation "also works"
- mistake over-engineering for thoroughness

---

## Final Standard

A change passes this stage only if the reviewer can say:

> The solution fits this specific system's architecture and patterns, not just a generic version of the problem. The LLM used the system's established infrastructure. The scope is proportionate. If a bug was fixed, the root cause was addressed rather than masked. I can explain why this solution fits here, not just why it is internally correct.

If that statement cannot be made honestly, this stage should not pass.

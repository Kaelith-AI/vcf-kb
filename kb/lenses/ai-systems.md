---
type: review-lens
lens_name: ai-systems
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# AI Systems Lens

## Lens Purpose

This lens intensifies review for systems that use:
- LLMs
- agent/tool orchestration
- RAG pipelines
- model providers
- embeddings/vector stores
- prompt templates
- model-driven workflows
- AI-generated or AI-mediated behavior that materially affects product outcomes

It exists because AI-native systems fail in ways that ordinary code, security, and production review do not fully capture on their own.

This is not a general “AI ethics” lens.
It is a practical review overlay for **AI system behavior, trust boundaries, control mechanisms, and operational reality**.

---

## Why This Lens Exists

Kaelith is building in a vibe-coded, AI-native environment.
That means many projects are not just software that happens to call an API. They are systems whose behavior depends on:
- prompt structure
- model/provider behavior
- tool permissions
- context assembly
- output validation
- non-deterministic responses
- model version drift
- AI-specific cost, latency, and degradation patterns

Without a dedicated lens, these projects can pass ordinary review while still hiding serious AI-specific risks such as:
- prompt injection
- context leakage
- tool misuse
- schema drift between model output and real code expectations
- agent loops with weak termination
- provider/version changes altering product behavior without clear release control
- silent AI degradation with no meaningful observability

This lens exists to make those risks visible.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. What AI components actually exist in the system
2. Whether prompt, context, tool, and provider boundaries are structurally safe enough for the system’s scope
3. Whether AI outputs are validated before driving important behavior
4. Whether the system remains bounded under non-determinism, long context, provider outages, and model drift
5. Whether AI-specific behavior changes are observable, governable, and release-relevant

If the reviewer cannot explain the system’s AI component map and the controls around it, this lens should produce strong caution or blocking findings.

---

## Applies To

This lens is most useful for:
- chat systems
- agentic tools
- AI-powered workflows
- retrieval-augmented systems
- AI-generated content pipelines
- products that route user data to model providers
- systems where prompts/models/tool policies materially affect outcomes

It may be applied to:
- **Code review** to intensify attention on AI-specific implementation and correctness blind spots
- **Security review** to intensify attention on prompt injection, context trust, tool escalation, and provider boundaries
- **Production review** to intensify attention on cost, latency, fallback, observability, and governance of AI behavior in live systems

---

## Core Review Rule

Do not review an AI-enabled system as if the model were just another deterministic library call.

A project does **not** get credit because:
- the AI call “works” once
- the prompt looks plausible
- the model usually returns something useful
- a schema exists somewhere in the codebase
- the provider is popular
- the system passed a demo with a few happy-path prompts

The reviewer must treat the AI layer as a real behavioral system with:
- non-determinism
- trust-boundary complexity
- capability drift
- output uncertainty
- operational cost and degradation behavior

---

## What This Lens Should Emphasize

### 1. AI Component Inventory
Reviewer must first identify:
- model calls
- agent loops
- tool/function-calling paths
- prompt templates
- retrieval/context assembly paths
- embeddings/vector store usage
- provider/model/version selection logic
- fallback models/providers if any

If the reviewer cannot build this inventory, the rest of the lens is incomplete.

---

### 2. Prompt Architecture & Injection Resistance
Reviewer should intensify attention on:
- separation between system instructions, retrieved context, tool output, and user input
- direct prompt injection paths
- indirect injection via documents, URLs, files, or retrieved content
- prompt template variable interpolation that weakens instruction boundaries
- whether the system treats untrusted text as trusted instruction

### Example failure patterns
- user-controlled content inserted into privileged prompt sections
- retrieved docs able to override task instructions
- prompt defenses described in comments but not structurally reinforced elsewhere

---

### 3. Tool & Agent Permission Boundaries
Reviewer should intensify attention on:
- tool allowlists
- argument validation before tool execution
- destructive action confirmation paths
- agent loop step/time limits
- whether model output can directly trigger privileged tools or state changes
- human approval boundaries for high-impact operations

### Example failure patterns
- model chooses arbitrary tool name/args with weak mediation
- agent inherits broader runtime authority than the product story implies
- no cap on steps, retries, or recursive sub-agent behavior

---

### 4. Output Validation & Schema Contract Reality
Reviewer should intensify attention on:
- structured-output enforcement
- downstream code assumptions about model correctness
- malformed JSON / empty response / refusal handling
- schema drift between declared tool/output contract and actual implementation
- whether business logic trusts model output too early

### Example failure patterns
- parsing arbitrary model text as trusted JSON
- model output drives DB writes or state transitions without validation
- code assumes “if the provider returned 200, the answer is usable”

---

### 5. Context Window, Memory & Retrieval Boundaries
Reviewer should intensify attention on:
- explicit truncation behavior
- long-context failure handling
- bounded retrieval sizes
- recency/priority logic in memory assembly
- whether context pruning changes meaning in unsafe ways
- whether one user’s or tenant’s context can bleed into another’s

### Example failure patterns
- silent truncation dropping critical instructions
- unbounded retrieval turning prompt construction into chaos
- chat memory persisting more than the system’s trust model implies

---

### 6. Provider / Model Version Drift & Governance
Reviewer should intensify attention on:
- model/version pinning
- provider fallback behavior
- release control around prompt/model/tool-policy changes
- whether capability assumptions are tied to a specific model class
- whether a silent provider/model swap could change product behavior materially

### Example failure patterns
- alias-based model selection with no behavior review after provider changes
- cost-saving downgrade silently reducing reliability or safety
- prompt tuned to one model but deployed against another with different instruction adherence

---

### 7. AI Data Handling & Provider Trust
Reviewer should intensify attention on:
- what user/system/context data is sent to providers
- whether sensitive context is minimized before external calls
- provider-side trust assumptions
- retention/residency implications where visible
- whether prompt/logging behavior leaks sensitive content operationally

### Example failure patterns
- raw user documents sent to third-party models without meaningful minimization
- provider requests fully logged with prompts and headers
- AI integration treated as an implementation detail rather than a trust boundary

---

### 8. Non-Determinism & Reliability Baseline
Reviewer should intensify attention on:
- temperature/settings appropriateness for the use case
- consistency expectations across repeated runs
- whether the system distinguishes “creative variance” from “unacceptable unreliability”
- retry logic for model failures vs bad content vs refusals
- whether important outputs have acceptance criteria beyond “the model answered”

### Example failure patterns
- deterministic-looking product built on high-variance settings
- retries amplify cost/latency without improving quality
- model refusals treated as ordinary valid business output

---

### 9. AI-Specific Observability & Cost Control
Reviewer should intensify attention on:
- prompt/completion token tracking
- per-model/per-provider latency visibility
- refusal/empty-response/malformed-output telemetry
- fallback frequency tracking
- abnormal cost/spend alerting
- whether operator tooling can diagnose AI degradation separately from generic API errors

### Example failure patterns
- AI path failures hidden inside general 500/error metrics
- no visibility into cost spikes or runaway token use
- fallback model used frequently with no operator awareness

---

### 10. Agentic Termination & Human Oversight
Reviewer should intensify attention on:
- max-step/max-time/max-tool-call boundaries
- interruptibility and containment
- action logging before/after agent execution
- escalation paths when the model is uncertain, looping, or attempting privileged behavior
- whether autonomous behavior remains proportionate to business risk

### Example failure patterns
- agent loops until timeout with no semantic stop condition
- uncertain model output treated as authority rather than escalated for review
- important actions executed without durable traceability

---

## What This Lens Should Not Duplicate

This lens should not re-run the entire standard review system.

Avoid treating it as a replacement for:
- general secret storage review → Security 6
- generic dependency audit → Code 5 / Security 5
- general observability review → Production 3
- generic capacity review → Production 4
- baseline privacy/compliance review → Code 8 / Security 1
- general infra/network hardening → Security 8

Instead, this lens should add the **AI-specific version** of those questions.

Examples:
- not “is there logging?” but “can operators see malformed model output, fallback frequency, and token burn?”
- not “are secrets safe?” but “are provider credentials and prompt payloads contained proportionately?”
- not “is release controlled?” but “do prompt/model/tool-policy changes receive release discipline?”

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### AI Systems Lens Summary
- AI components identified:
- Providers/models in use:
- Highest-risk AI behavior boundary:
- Overall AI-systems posture:

### AI Component Inventory
| Component | Type | Provider | Model/Version | Pinned? | Notes |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Yes/No | ... |

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Prompt architecture & injection | PASS / NEEDS_WORK / BLOCK | ... |
| Tool & agent permissions | PASS / NEEDS_WORK / BLOCK | ... |
| Output validation & schema contracts | PASS / NEEDS_WORK / BLOCK | ... |
| Context window / memory / retrieval | PASS / NEEDS_WORK / BLOCK | ... |
| Provider/model drift & governance | PASS / NEEDS_WORK / BLOCK | ... |
| AI data handling & provider trust | PASS / NEEDS_WORK / BLOCK | ... |
| Non-determinism baseline | PASS / NEEDS_WORK / BLOCK | ... |
| AI observability & cost control | PASS / NEEDS_WORK / BLOCK | ... |
| Agentic termination & oversight | PASS / NEEDS_WORK / BLOCK | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Evidence:
- Risk:
- Fix direction:
- Cross-stage handoff:

### AI Lens Blockers
- Blocking AI-specific issues:
- Issues requiring narrower release scope:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- prompt/context boundaries are materially unsafe
- model output can trigger privileged behavior with weak mediation
- provider/model drift could materially alter product behavior without governance
- AI failure modes are serious enough that ordinary stage confidence would be misleading

### NEEDS_WORK-level lens findings
Use when:
- AI structure exists but key safeguards are partial
- the system is operable but fragile under provider, context, or output-shape variation
- AI-specific observability/governance is meaningfully underdeveloped

### PASS-level lens findings
Use when:
- the AI component map is clear
- the important trust and behavior boundaries are explicit and mediated
- output uncertainty and provider/model variability are accounted for credibly
- AI-specific operational risks are visible and bounded for the assessed scope

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- prompt templates that let user content reshape system-level instruction
- retrieved content that can hijack model behavior
- tool schema/implementation mismatches
- model output trusted without schema or semantic validation
- silent truncation at context limits
- unbounded agent loops
- provider/model swaps that materially change behavior without review
- raw sensitive context shipped to external models without minimization
- AI-specific failures hidden inside generic application telemetry
- fallback models/providers used without visibility or product-quality acknowledgment

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Defect Discovery** for AI-specific logic breakage and edge-case failure
- **Secrets & Trust Boundaries** for provider keys, tool boundaries, and prompt leakage
- **Privacy, Data Rights & Consent** for external model-provider disclosure and prompt-data handling
- **Accessibility** when AI systems generate user-facing content or interfaces dynamically

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand the system’s real AI components, the boundaries around prompts, tools, context, providers, and outputs are explicit enough to reason about, and the project is not relying on vague model optimism where it needs structural control, visibility, and governance.

If that statement cannot be made honestly, this lens should produce serious findings.

---
type: best-practices
best_practice_name: llm-integration
category: ai
version: 2.0
updated: 2026-03-01
tags: [llm, prompt-engineering, tool-use]
status: draft-v2
---

# LLM Integration Best Practices

## When To Use This

Use this document before implementing LLM-backed features, when model output influences user-facing or operational behavior, or when trust, fallback, approval, or data-exposure questions are unclear.

Open it when you need to:
- define the model’s role in the system
- separate deterministic and probabilistic behavior intentionally
- shape prompt/context/retrieval/validation layers together
- design fallback and degraded behavior
- add human review where risk still demands it
- evaluate real model behavior instead of prompt optimism

This v2 version is aligned to the prep-system primer stack and selective-lookup documentation style.

---

## What This Covers

This document covers:
- model role and responsibility definition
- prompt, context, and retrieval composition
- output validation and schema enforcement
- deterministic boundaries and action safety
- fallback, degraded modes, and provider/runtime switching
- trust framing and user expectations
- human review and approval design
- evaluation, monitoring, and regression control

It is the deeper execution-time standard under the **LLM Integration Primer**.

---

## Quick Index

- [Model role and responsibility definition](#model-role-and-responsibility-definition)
- [Prompt context and retrieval composition](#prompt-context-and-retrieval-composition)
- [Output validation and schema enforcement](#output-validation-and-schema-enforcement)
- [Deterministic boundaries and action safety](#deterministic-boundaries-and-action-safety)
- [Fallback degraded modes and provider runtime switching](#fallback-degraded-modes-and-provider-runtime-switching)
- [Trust framing UX and user expectations](#trust-framing-ux-and-user-expectations)
- [Human review and approval design](#human-review-and-approval-design)
- [Evaluation monitoring and regression control](#evaluation-monitoring-and-regression-control)
- [Checklists](#checklists)

---

## Decision Guide

### Use the model in an advisory role when
- human review remains cheap and important
- mistakes would be costly or hard to reverse
- the feature can succeed with recommendations rather than autonomous execution

### Add stronger controls when
- output can change state, permissions, money, or public trust
- the system handles sensitive data
- the model output can trigger tools, workflows, or agents
- user confidence could outrun actual reliability

### Keep a workflow deterministic when
- correctness must be exact
- the action is destructive or high-risk
- legal/compliance/safety boundaries demand precise behavior
- a fixed rule system is simpler and more trustworthy

---

## Core Rules

1. **Define what the model is and is not responsible for.**

2. **Never let probabilistic output silently cross high-risk boundaries.**

3. **Prompt design is only one layer of the system.**

4. **Validation and fallback must be designed explicitly.**

5. **Users must not be misled about certainty or capability.**

6. **Sensitive data exposure must be intentionally controlled.**

7. **Human review still matters for some risk classes.**

8. **Model quality must be evaluated in behavior, not vibes.**

9. **Provider/runtime switching should preserve trust boundaries.**

10. **An AI feature is not trustworthy just because the demo is impressive.**

---

## Common Failure Patterns

- model output treated as authoritative by default
- unclear division between deterministic logic and model judgment
- sensitive context sent to models too casually
- no fallback when the model is wrong, unavailable, or too slow
- prompt wording used as a substitute for system-level controls
- overclaiming confidence, intelligence, or reliability
- human review removed where it still materially matters

---

## Model Role and Responsibility Definition

The model should have a clearly defined job.

### Examples of valid roles
- generation
- summarization
- classification
- extraction
- ranking
- moderation assistance
- planning assistance
- constrained transformation

### Rule
If the model’s role cannot be described clearly, the system boundary is weak.

---

## Prompt, Context, and Retrieval Composition

A prompt is not the whole AI system.

### Good composition posture
- prompt role is clear
- context is intentionally selected
- retrieval is used where grounding matters
- unnecessary context bloat is avoided

### Rule
If the system depends on shoving more text at the model every time something breaks, the architecture is weak.

---

## Output Validation and Schema Enforcement

Model output should be checked before it is trusted.

### Good posture
- parse structured outputs where possible
- validate shape, values, and constraints
- reject or route uncertain outputs appropriately
- avoid raw freeform output for high-risk system actions

### Rule
A model output should earn trust through validation, not tone.

---

## Deterministic Boundaries and Action Safety

Some decisions should remain outside model discretion.

### Usually deterministic boundaries
- permissions and auth
- money/payment state
- destructive actions
- security controls
- critical configuration and durable state changes

### Rule
If the model can do high-risk things without a hard safety boundary, the design is unsafe.

---

## Fallback, Degraded Modes, and Provider/Runtime Switching

AI features need a failure posture.

### Good fallback posture
- the system knows what happens when the model is unavailable
- lower-tier or alternative providers are used intentionally if at all
- degraded behavior still preserves trust and safety
- local vs hosted runtime switching does not silently alter guarantees

### Rule
A feature is not production-ready if its only plan is “the model should work.”

---

## Trust Framing, UX, and User Expectations

Users need honest framing.

### Good trust posture
- distinguish suggestion from fact when appropriate
- communicate limitations without hiding them
- avoid confidence theater
- make approval/review steps visible when relevant

### Rule
If the UX implies certainty the system does not possess, trust debt is accumulating.

---

## Human Review and Approval Design

Some workflows still need humans in the loop.

### Good review posture
- review is applied where risk remains materially high
- humans see enough context to make informed decisions
- approval steps are not token rituals
- the boundary between automation and oversight is explicit

### Rule
Removing human review is only good if the system truly earns that reduction in risk.

---

## Evaluation, Monitoring, and Regression Control

LLM quality should be monitored as system behavior.

### Good evaluation posture
- compare outputs against task-specific expectations
- test failure modes, not just happy-path demos
- monitor drift in real usage
- preserve examples/regression cases when failures appear

### Rule
If evaluation is just “it sounded good when we tried it,” the system is under-validated.

---

## OS / Environment Notes

### macOS
Local experimentation should not define production AI boundaries or support claims.

### Linux
Deployment/runtime topology often affects provider choice, local-model feasibility, and operational controls.

### Windows
Local-model support, installer/runtime complexity, and platform behavior may change which AI stack is practical.

---

## Checklists

### Model-Role Checklist
- [ ] The model’s job is clearly defined
- [ ] Deterministic responsibilities are separated
- [ ] High-risk actions are not delegated casually
- [ ] Role fit matches the actual product need

### Validation / Fallback Checklist
- [ ] Output validation exists where needed
- [ ] Fallback/degraded behavior is defined
- [ ] Provider/runtime switching is intentional
- [ ] Trust guarantees survive model failure paths

### Trust-Framing Checklist
- [ ] UX does not overclaim certainty
- [ ] Users can understand the role of AI in the feature
- [ ] Review/approval is visible where relevant
- [ ] The system does not imply more reliability than it has earned

### AI Feature Readiness Checklist
- [ ] Model role is explicit
- [ ] Safety boundaries are explicit
- [ ] Validation and fallback are implemented
- [ ] Evaluation covers real failure modes

---

## Related Primers

- LLM Integration Primer
- Automated Agents Primer
- RAG Primer
- Ollama Primer
- Content Moderation / Safety Primer

---

## Related Best Practices

- Security Best Practices
- Production Best Practices
- RAG Best Practices
- Automated Agents Best Practices
- Prompt / Model Economics Best Practices

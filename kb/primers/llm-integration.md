---
type: primer
primer_name: llm-integration
category: modifier
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# LLM Integration Primer

## What This Primer Is For

This primer prepares a PM to design AI-native or LLM-enabled systems without making the most common trust, safety, reliability, and product-clarity mistakes.

It is relevant when a project:
- calls LLMs directly
- depends on LLM output for visible behavior
- routes user input into model prompts
- lets models produce actions, recommendations, or content
- mixes deterministic systems with probabilistic output

Its purpose is to stop teams from treating model integration like a normal API integration.

---

## Read This First

An LLM is not just another dependency.

It is a probabilistic subsystem with variable behavior, incomplete reliability, and special safety risk.

The most common early mistake is designing the happy path first and assuming quality can be patched in later.
That fails because LLM systems need explicit thinking about:
- what the model is allowed to do
- what the model is never allowed to do
- what happens when the model is wrong
- what happens when the model is unavailable
- what a human must still review or approve
- how trust is earned instead of implied

If those boundaries are vague, the product will drift into unsafe, brittle, or misleading behavior.

---

## The 5–10 Rules To Not Violate

1. **Never let “AI-powered” replace product definition.**  
   The system still needs clear scope, value, and boundaries.

2. **Assume the model can be wrong in plausible-sounding ways.**  
   Design for error containment, not just nominal success.

3. **Define what must remain deterministic.**  
   Identity, money, permissions, destructive actions, and critical state changes need hard boundaries.

4. **Do not auto-execute high-risk model output without strong controls.**  
   Review, validation, simulation, or approval paths matter.

5. **Graceful degradation is mandatory.**  
   What happens when the model is slow, unavailable, rate-limited, or low-confidence?

6. **Prompting is not the whole system.**  
   Retrieval, guardrails, schemas, validation, fallback logic, and UX framing are all part of quality.

7. **Users must not be misled about certainty or capability.**  
   Confidence theater destroys trust.

8. **Treat model input/output as data boundaries.**  
   Secrets, sensitive context, and unsafe prompt composition need explicit protection.

9. **Monitor real behavior, not just prompt intent.**  
   Evaluate outputs, failure modes, and abuse paths in practice.

10. **Human review remains necessary for some classes of risk.**

---

## Common Early Mistakes

- treating model output as authoritative because it sounds competent
- sending too much sensitive context to the model by default
- letting model-generated content/actions skip validation
- not deciding when fallback behavior should replace model behavior
- relying on prompt wording instead of building system-level controls
- failing to define where humans stay in the loop
- promising reliability or intelligence levels the system cannot consistently deliver

---

## What To Think About Before You Start

### 1. Model role
Ask:
- what is the model actually doing here?
- generation, classification, transformation, ranking, extraction, planning, moderation, or mixed?

### 2. Risk boundary
Ask:
- what could go wrong if the model is wrong?
- what decisions or actions must never be handed over fully?

### 3. Fallback behavior
Ask:
- what happens if the model is unavailable, too slow, too costly, or low-confidence?
- can the product still function at a degraded level?

### 4. Data exposure
Ask:
- what user/system data enters prompts or retrieval?
- what must be excluded, minimized, masked, or protected?

### 5. Trust design
Ask:
- how will users understand the limits of the AI behavior?
- where is review, confirmation, or explanation necessary?

---

## When To Open The Best-Practice Docs

Open deeper AI guidance when you begin:
- prompt/system design
- schema validation and output constraints
- agent/action execution design
- moderation or safety boundaries
- provider selection and fallback architecture
- evaluation and regression testing

This primer should establish the mindset.
The deeper docs should define the implementation standards.

---

## Related Best Practices

Primary follow-up docs:
- LLM Integration Best Practices
- Security Best Practices
- Production Best Practices
- Content Moderation & Safety Best Practices *(when relevant)*
- Automated Agents Best Practices

---

## Quick Routing Guide

This primer is strongly recommended whenever the project has modifier:
- `ai-native`

It is also important when:
- a non-AI product adds model-backed features
- agentic behavior is being considered
- AI output can reach users, data, or operational systems

This primer often pairs with:
- Security
- Production
- Content Moderation / Safety
- Automated Agents

---

## Final Standard

Before building LLM-dependent behavior, you should be able to say:

> I know what the model is responsible for, what boundaries contain its errors, what happens when it fails, what data it sees, and where human review or deterministic controls must remain in place.

If you cannot say that honestly, the AI integration is not ready.

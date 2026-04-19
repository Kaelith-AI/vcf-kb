---
type: best-practices
best_practice_name: named-actions-pattern
category: ai
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Named Actions Pattern Best Practices

## When To Use This

Use this document when commands, workflows, or agent actions are being designed, when one route is doing too many unrelated jobs, or when permissions, reuse, and auditability depend on clearer operational boundaries.

Open it when you need to:
- define action contracts explicitly
- split vague workflows into real operational units
- align permissions and safety to action boundaries
- make action inputs, outputs, and artifacts predictable
- improve composition and reuse across humans, agents, and automations
- keep action catalogs understandable over time

This is the deeper execution-time reference under the **Named Actions Pattern Primer**.

---

## What This Covers

This document covers:
- action identity and naming
- scope and boundary design
- inputs, outputs, and artifacts
- permission and safety alignment
- composition and orchestration patterns
- catalog hygiene and lifecycle management
- auditability and operator clarity

---

## Quick Index

- [Action identity and naming](#action-identity-and-naming)
- [Scope and boundary design](#scope-and-boundary-design)
- [Inputs outputs and artifacts](#inputs-outputs-and-artifacts)
- [Permission and safety alignment](#permission-and-safety-alignment)
- [Composition and orchestration patterns](#composition-and-orchestration-patterns)
- [Catalog hygiene and lifecycle management](#catalog-hygiene-and-lifecycle-management)
- [Auditability and operator clarity](#auditability-and-operator-clarity)
- [Checklists](#checklists)

---

## Decision Guide

### Make something a named action when
- it is a repeatable operational unit
- it needs stable permissions, logging, or routing
- multiple humans/agents/automations may invoke it
- vague prompt behavior is becoming hard to reason about

### Keep it as a looser interaction when
- it is truly exploratory and not a repeatable system behavior yet
- formalization would create ceremony without operational gain
- no stable contract exists yet

### Split one action into several when
- it hides multiple unrelated behaviors
- permissions differ materially across sub-actions
- outputs or artifacts differ enough to confuse operators
- audit trails become vague because the action is overloaded

---

## Core Rules

1. **Actions should map to real operational units.**

2. **Action boundaries should be explicit.**

3. **Inputs, outputs, and artifacts should be legible.**

4. **Permissions should attach cleanly to actions.**

5. **Action names should help predict behavior.**

6. **Named actions should reduce ambiguity, not add ceremony.**

7. **Failure states should be part of the action contract.**

8. **Composition should stay understandable as the catalog grows.**

9. **Action catalogs should be curated, not allowed to sprawl.**

10. **A named action is a contract, not just a label.**

---

## Common Failure Patterns

- one broad action doing too many unrelated things
- vague action names that do not predict behavior
- action contracts with unclear inputs or outputs
- permission-sensitive and safe behavior mixed together
- prompt-only behavior used where a structured interface is needed
- too many tiny actions with no real operational distinction
- catalogs that only make sense to the original designer

---

## Action Identity and Naming

A named action should represent a meaningful job.

### Good naming behavior
- describes what the action actually does
- distinguishes it from adjacent actions clearly
- helps a human or agent predict outcome and risk

### Rule
If two different readers would infer two different jobs from the same action name, the name is weak.

---

## Scope and Boundary Design

Scope defines what the action includes and excludes.

### Good boundary posture
- one action = one coherent responsibility
- neighboring actions are distinct on purpose
- boundary-crossing behavior is not hidden inside vague wording

### Rule
If the action cannot be explained cleanly without “and also” branching everywhere, it is overloaded.

---

## Inputs, Outputs, and Artifacts

Actions should be operationally legible.

### Good contract posture
- required inputs are explicit
- outputs or side effects are clear
- persistent artifacts/logs/summaries are defined where needed
- the caller can know what success/failure looks like

### Rule
A reusable action should not require hidden context to understand what it takes or what it produces.

---

## Permission and Safety Alignment

Permissions should align to action boundaries, not to vague intentions.

### Good posture
- high-risk actions have distinct permission treatment
- safe and dangerous behavior are not casually bundled together
- approval or review fits the action’s real impact

### Rule
If an action boundary is vague, its permission model will also be vague.

---

## Composition and Orchestration Patterns

Named actions should help composition, not block it.

### Good composition posture
- actions can chain predictably
- outputs/artifacts support reuse
- orchestration logic is easier because action units are stable
- humans and agents can invoke the same action meaningfully when appropriate

### Rule
A good action system makes bigger workflows clearer, not more opaque.

---

## Catalog Hygiene and Lifecycle Management

Action catalogs need curation.

### Good hygiene
- remove or consolidate duplicates
- clarify names as the system grows
- avoid adding a new action when a better refinement of an existing one would work
- mark deprecated or replaced actions clearly

### Rule
Action sprawl becomes routing debt quickly.

---

## Auditability and Operator Clarity

Operators should be able to understand what action happened.

### Good posture
- action names appear in logs/reports/history clearly
- artifacts and side effects are attributable to the action
- failures are distinguishable per action
- permission/use history can be interpreted after the fact

### Rule
If actions are too vague to audit cleanly, they are too vague to trust operationally.

---

## OS / Environment Notes

This topic is mostly cross-environment.
Only add platform-specific notes where runtime/tooling differences materially affect action execution, permissions, or operator support.

---

## Checklists

### Action-Contract Checklist
- [ ] The action maps to one coherent operational unit
- [ ] Inputs/outputs/artifacts are explicit
- [ ] Success and failure are understandable
- [ ] The action is not just a vague label

### Action-Boundary Checklist
- [ ] Scope and exclusions are clear
- [ ] Neighboring actions are distinct on purpose
- [ ] Dangerous behavior is not hidden inside safe behavior
- [ ] The boundary helps permissions, not hurts them

### Action-Catalog Checklist
- [ ] The action is not duplicating an existing one needlessly
- [ ] Naming remains legible in the larger catalog
- [ ] Deprecated or replaced actions are handled cleanly
- [ ] The catalog still makes sense to a newcomer

### Action-Auditability Checklist
- [ ] Logs/history name the action clearly
- [ ] Side effects are attributable to the action
- [ ] Failures are interpretable at the action level
- [ ] Operator trust is supported by the contract

---

## Related Primers

- Named Actions Pattern Primer
- Automated Agents Primer
- MCP Primer
- Project Planning Primer

---

## Related Best Practices

- Automated Agents Best Practices
- MCP Best Practices
- Admin & Operator Best Practices
- Git / Change Safety Best Practices
- Front Matter & Documentation Best Practices

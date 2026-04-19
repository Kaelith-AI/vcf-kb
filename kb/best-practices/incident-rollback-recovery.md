---
type: best-practices
best_practice_name: incident-rollback-recovery
category: runtime
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Incident / Rollback / Recovery Best Practices

## When To Use This

Use this document when a project has meaningful runtime, deployment, service, or user-facing failure risk and incident handling can no longer rely on improvisation.

Open it when you need to:
- define response structure for outages or bad deploys
- decide when to rollback versus stabilize and fix forward
- separate service/config/data recovery paths clearly
- improve communications during incidents
- preserve evidence before making more changes
- design systems so recovery is actually possible under pressure

This is a BP-first operational reference with high value across production-facing systems.

---

## What This Covers

This document covers:
- incident posture, severity, and response roles
- rollback versus fix-forward decision models
- service, config, and dependency recovery
- data recovery, restore, and integrity verification
- incident communication and operator coordination
- post-incident learning, drills, and prevention loops

---

## Quick Index

- [Incident posture severity and response roles](#incident-posture-severity-and-response-roles)
- [Rollback versus fix-forward decision model](#rollback-versus-fix-forward-decision-model)
- [Service config and dependency recovery](#service-config-and-dependency-recovery)
- [Data recovery restore and integrity verification](#data-recovery-restore-and-integrity-verification)
- [Incident communication and operator coordination](#incident-communication-and-operator-coordination)
- [Post-incident learning drills and prevention loops](#post-incident-learning-drills-and-prevention-loops)
- [Checklists](#checklists)

---

## Decision Guide

### Roll back quickly when
- the recent change is clearly causal
- rollback is safer than continued live degradation
- user trust or business risk is growing faster than diagnosis clarity
- data integrity risk is still low enough for code/config rollback to help

### Fix forward more cautiously when
- rollback would deepen damage or break compatibility further
- the problem is understood and stabilization is faster than reversal
- a reversible mitigation exists with lower blast radius

### Escalate incident posture when
- data integrity or recovery uncertainty is involved
- communication delay will materially increase trust damage
- multiple systems or teams are affected simultaneously
- operators are making repeated changes without evidence discipline

---

## Core Rules

1. **Recovery paths should be designed before they are needed.**

2. **Rollback is a product decision as well as an ops decision.**

3. **Code rollback, config rollback, and data recovery are different problems.**

4. **Evidence capture matters before making additional changes.**

5. **Incident communication should be honest, timely, and proportionate.**

6. **Severity should shape response structure, not just emotional intensity.**

7. **Recovery steps should reduce ambiguity, not add more change noise.**

8. **Operators need clear ownership and coordination during incidents.**

9. **Post-incident learning should update real procedures and systems.**

10. **A system that cannot be rolled back or recovered safely is operationally fragile.**

---

## Common Failure Patterns

- no defined rollback path for major releases or config changes
- treating data restoration like ordinary code deployment reversal
- panic changes made before preserving evidence or timelines
- slow, vague, or misleading incident communication
- “fix forward only” posture with no safety margin or rehearsal
- postmortems that generate notes but do not change the system
- unclear operator ownership during multi-person incidents

---

## Incident Posture, Severity, and Response Roles

Response quality starts with structure.

### Good posture
- define who leads, who diagnoses, who communicates, and who approves risky recovery moves
- map severity to response intensity and communication expectations
- keep escalation proportional and clear

### Rule
If incident roles are fuzzy, coordination quality collapses under pressure.

---

## Rollback Versus Fix-Forward Decision Model

Choose reversibility intentionally.

### Good posture
- evaluate blast radius, reversibility, time-to-stabilize, and data implications
- avoid ideological attachment to one response style
- prefer the path that restores safety and clarity fastest with the least secondary damage

### Rule
Rollback versus fix-forward should be a reasoned decision, not a team reflex.

---

## Service, Config, and Dependency Recovery

Operational recovery often starts before code changes.

### Good posture
- separate runtime/service recovery from application release recovery
- know how to revert configuration safely
- understand dependency outages and degraded-mode options
- avoid stacking unrelated changes during diagnosis

### Rule
If every recovery step changes multiple layers at once, diagnosis becomes slower and riskier.

---

## Data Recovery, Restore, and Integrity Verification

Data recovery deserves stricter care.

### Good posture
- know where durable state lives and what restore options exist
- verify integrity after restore instead of assuming success
- distinguish data loss tolerance from service downtime tolerance
- require stronger caution when rollback interacts with schema or state transitions

### Rule
Data recovery is not complete until integrity has been checked, not just restored mechanically.

---

## Incident Communication and Operator Coordination

Trust is shaped by how incidents are handled, not just by how they start.

### Good posture
- communicate early enough to reduce uncertainty
- state what is known, unknown, and being done next
- keep internal operator coordination crisp and timestamped where useful
- avoid speculative confidence under limited evidence

### Rule
Silence or bluffing usually increases trust damage once reality catches up.

---

## Post-Incident Learning, Drills, and Prevention Loops

The goal is improved resilience, not ritual paperwork.

### Good posture
- run retrospectives that identify actionable changes
- turn lessons into runbooks, checks, architecture changes, or drills
- rehearse important rollback and restore paths before the next incident
- measure whether prior lessons actually reduced future risk

### Rule
If incidents produce no durable operational change, the same class of failure will return.

---

## OS / Environment Notes

### macOS
Mostly relevant for local support flows, desktop-distributed products, or operator tooling where rollback paths differ from server environments.

### Linux
Common production and self-hosted recovery surface; service managers, config paths, host integration, and restore workflows often matter most here.

### Windows
Installer behavior, service registration, path/permission handling, and user-facing rollback expectations may differ materially and should be documented when relevant.

---

## Checklists

### Incident-Triage Checklist
- [ ] Severity is assessed explicitly
- [ ] Roles are assigned clearly
- [ ] Current impact and blast radius are understood well enough to act
- [ ] Evidence capture begins before more change noise is introduced

### Rollback-Decision Checklist
- [ ] Recent changes are evaluated as probable causes
- [ ] Rollback vs fix-forward tradeoffs are compared explicitly
- [ ] Data implications are considered separately from code/config reversal
- [ ] Decision owner is clear

### Service / Config / Data Recovery Checklist
- [ ] Recovery path is scoped to the affected layer
- [ ] Configuration and dependency recovery are not conflated with code rollback
- [ ] Data restore path includes integrity verification
- [ ] Recovery actions are logged clearly enough for later review

### Post-Incident Checklist
- [ ] Communication record is preserved
- [ ] Root causes and contributing factors are analyzed honestly
- [ ] Action items change real systems or procedures
- [ ] Rollback/recovery drills or safeguards are improved where needed

---

## Related Primers

- Production Primer
- Security Primer
- Systemd Primer
- Cross-Platform Installer Primer

---

## Related Best Practices

- Production Best Practices
- Security Best Practices
- Systemd Best Practices
- Cross-Platform Installer Best Practices

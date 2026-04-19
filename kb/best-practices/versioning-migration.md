---
type: best-practices
best_practice_name: versioning-migration
category: software
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Versioning / Migration Best Practices

## When To Use This

Use this document before releasing public-facing changes, when changing schemas, APIs, config formats, or compatibility expectations, or whenever upgrade risk needs explicit control.

Open it when you need to:
- define versioning semantics honestly
- classify breaking changes intentionally
- plan migration paths before release
- manage compatibility windows and deprecations
- shape upgrade, rollback, or forward-fix strategy
- communicate release impact clearly to consumers or operators

This is a deep support doc for libraries, APIs, stateful systems, and long-lived operational products.

---

## What This Covers

This document covers:
- versioning model and semantics
- breaking-change classification
- compatibility windows and deprecation policy
- data/schema/config migration planning
- upgrade, rollback, and forward-fix strategy
- release notes and operator/consumer communication
- migration verification and release gates

---

## Quick Index

- [Versioning model and semantics](#versioning-model-and-semantics)
- [Breaking-change classification](#breaking-change-classification)
- [Compatibility windows and deprecation policy](#compatibility-windows-and-deprecation-policy)
- [Data schema and config migration planning](#data-schema-and-config-migration-planning)
- [Upgrade rollback and forward-fix strategy](#upgrade-rollback-and-forward-fix-strategy)
- [Release notes and operator consumer communication](#release-notes-and-operator-consumer-communication)
- [Migration verification and release gates](#migration-verification-and-release-gates)
- [Checklists](#checklists)

---

## Decision Guide

### Treat a change as breaking when
- existing consumers/operators will need to change behavior or configuration
- public outputs, defaults, or semantics change materially
- compatibility assumptions become false after the release

### Keep compatibility shims when
- migration cost is high enough to justify transition help
- a deprecation path materially reduces trust damage or support load
- the system cannot reasonably force immediate adoption

### Prefer forward-fix over rollback when
- rollback would worsen state inconsistency
- migrations are one-way or hard to reverse safely
- preserving user/operator trust depends on a corrective release rather than reversion

### Delay release when
- the migration path is not yet credible
- breaking impact is still unclear
- versioning semantics do not match the real upgrade risk

---

## Core Rules

1. **Breaking changes should be identified intentionally.**

2. **Versioning should help consumers predict risk.**

3. **Migration paths should exist before disruptive releases.**

4. **Compatibility windows should be explicit where needed.**

5. **Schema, config, and API evolution should not be improvised casually.**

6. **Release communication is part of upgrade safety.**

7. **Rollback is not always the safest answer.**

8. **Deprecation should be managed, not merely announced.**

9. **Migration verification matters as much as migration design.**

10. **If upgrade risk is unclear, the version signal is weak.**

---

## Common Failure Patterns

- accidental breaking changes hidden inside minor-looking releases
- version numbers that do not match actual upgrade impact
- migrations designed after the release instead of before it
- config/schema changes with no repair or rollback thinking
- vague release notes that hide operational consequences
- permanent compatibility clutter because deprecation was never managed clearly

---

## Versioning Model and Semantics

Versioning should communicate real upgrade expectations.

### Good versioning posture
- the team knows what counts as breaking
- release labels match actual risk
- consumers can use the version signal to make rational upgrade decisions

### Rule
If the version number does not help predict upgrade pain, it is not doing its job.

---

## Breaking-Change Classification

A breaking change is any change that invalidates current consumer or operator assumptions materially.

### Breaking may include
- API or interface shape changes
- config format changes
- default behavior changes
- output semantics changes
- migration requirements
- environment/runtime support changes

### Rule
“Technically still runs” is not proof that a change is non-breaking.

---

## Compatibility Windows and Deprecation Policy

Compatibility should be intentional, not indefinite by accident.

### Good posture
- define how long older behavior is supported
- mark deprecated paths clearly
- communicate replacement expectations early enough
- avoid keeping dead compatibility forever

### Rule
Deprecation without a real removal plan becomes permanent clutter.

---

## Data / Schema / Config Migration Planning

Migrations should be designed before the release that requires them.

### Good migration posture
- migration scope is explicit
- data/config compatibility is considered
- operators or consumers know what they must do
- repair/rollback/forward-fix options are understood

### Rule
A release that depends on an undefined migration path is not truly ready.

---

## Upgrade, Rollback, and Forward-Fix Strategy

Upgrade safety includes knowing when rollback helps and when it harms.

### Good posture
- rollback is understood where safe
- forward repair is considered when reversal would damage state or trust
- upgrade sequencing is not left to guesswork
- operators know the risk shape before rollout

### Rule
Treat rollback as one tool, not the whole migration strategy.

---

## Release Notes and Operator / Consumer Communication

Communication is part of operational safety.

### Good release communication
- explains what changed
- explains who is affected
- explains what action is required
- explains whether the change is breaking, transitional, or optional

### Rule
Release notes that hide migration cost are part of the failure, not a side issue.

---

## Migration Verification and Release Gates

Migration quality should be verified before claiming safety.

### Before release
- breaking status is classified honestly
- migration path is defined
- compatibility windows are known
- release notes/support expectations are ready
- upgrade behavior is tested enough for the risk level

### Rule
A migration that looks plausible but is not verified is still risky.

---

## OS / Environment Notes

This topic is mostly cross-environment.
Only add platform-specific notes where packaging, service/runtime behavior, or installer expectations materially change upgrade safety.

---

## Checklists

### Breaking-Change Checklist
- [ ] Breaking impact was assessed honestly
- [ ] Version signal matches risk
- [ ] Defaults/output/config changes were considered
- [ ] Consumer/operator assumptions were checked

### Migration-Planning Checklist
- [ ] Migration path exists before release
- [ ] Schema/config/data implications are understood
- [ ] Rollback or forward-fix posture is known
- [ ] Required user/operator action is explicit

### Compatibility / Deprecation Checklist
- [ ] Compatibility window is defined
- [ ] Deprecated behavior is marked clearly
- [ ] Removal path is intentional
- [ ] Compatibility clutter is being managed, not ignored

### Release-Communication Checklist
- [ ] Release notes explain impact clearly
- [ ] Required actions are explicit
- [ ] Upgrade risk is not hidden
- [ ] Support expectations are clear enough

---

## Related Primers

- Library / SDK Primer
- Git / Change Safety Primer
- Production Primer
- Cross-Platform Installer Primer

---

## Related Best Practices

- Library / SDK Best Practices
- Data Integrity Best Practices
- Install / Uninstall Best Practices
- API / Webhook Contract Best Practices
- Git / Change Safety Best Practices

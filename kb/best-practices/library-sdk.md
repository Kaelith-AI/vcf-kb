---
type: best-practices
best_practice_name: library-sdk
category: software
version: 1.0
updated: 2026-03-01
tags: [api-design, packaging, npm, dx]
status: draft-v1
---

# Library / SDK Best Practices

## When To Use This

Use this document before shaping exported interfaces deeply, before release/versioning decisions, or whenever a library/SDK risks behaving like an app whose internals were accidentally exposed.

Open it when you need to:
- design a public API intentionally
- decide what stays internal versus public
- define compatibility and support expectations
- write strong README/examples for consumers
- control versioning and breaking-change behavior
- verify the consumer contract rather than only internal implementation

This is the deeper execution-time reference under the **Library / SDK Primer**.

---

## What This Covers

This document covers:
- public interface design
- surface-area control
- defaults and behavioral contracts
- README/example quality
- compatibility and support matrices
- versioning and breaking-change discipline
- contract testing and release gates

---

## Quick Index

- [Public interface design](#public-interface-design)
- [Internal versus external boundary control](#internal-versus-external-boundary-control)
- [Defaults guarantees and behavioral contracts](#defaults-guarantees-and-behavioral-contracts)
- [README and example quality](#readme-and-example-quality)
- [Compatibility and support matrix design](#compatibility-and-support-matrix-design)
- [Versioning and breaking-change discipline](#versioning-and-breaking-change-discipline)
- [Contract testing and release gates](#contract-testing-and-release-gates)
- [Checklists](#checklists)

---

## Decision Guide

### Make something public only when
- consumers truly need it
- you are willing to support its long-term behavior
- naming, docs, and examples can make it understandable externally

### Keep something internal when
- it exists only to support implementation details
- the shape is still unstable
- exposing it would increase maintenance without strong user value

### Treat a change as breaking when
- it changes the meaning, behavior, or expectations of a public interface
- it invalidates current consumer code or examples
- it changes defaults or output shapes in a way consumers will feel

### Delay promotion/release when
- the public contract is still accidental
- examples are weak or incomplete
- compatibility claims are vague
- contract verification is missing

---

## Core Rules

1. **Design the public interface intentionally.**

2. **Keep the exported surface as small as practical.**

3. **External clarity matters more than internal cleverness.**

4. **Defaults are part of the contract.**

5. **Examples are part of the product.**

6. **Compatibility claims must be explicit and real.**

7. **Versioning is user-facing behavior.**

8. **Test the public contract, not only internal implementation.**

9. **Do not let internal refactors casually change consumer experience.**

10. **A good library is easy to adopt, not merely well engineered internally.**

---

## Common Failure Patterns

- accidental API sprawl
- public exports that were never intentionally designed
- internal refactors leaking into external behavior
- weak or unrealistic README/examples
- vague support/compatibility promises
- hidden complexity behind unclear defaults
- breaking-change chaos because versioning discipline is weak

---

## Public Interface Design

The public interface is the product.

### Good public-interface behavior
- entry points are explicit
- names are consumer-readable
- behavior is predictable
- public surface is not polluted by internal convenience exports

### Rule
If a consumer cannot tell what is safe to build on, the interface is weak.

---

## Internal vs External Boundary Control

A library should clearly distinguish:
- what consumers are meant to use
- what maintainers may change freely

### Good boundary control
- stable public entry points
- internal modules/helpers not casually exported
- documentation aligned with what is truly supported

### Rule
Every exported symbol becomes future maintenance cost.

---

## Defaults, Guarantees, and Behavioral Contracts

Defaults are promises, not convenience accidents.

### Good contract questions
- what happens if the consumer supplies nothing extra?
- what errors or edge conditions are part of the documented behavior?
- what guarantees are stable enough to promise?

### Rule
Opaque defaults create adoption convenience once and maintenance pain forever.

---

## README and Example Quality

Library adoption depends heavily on documentation quality.

### Strong README/example traits
- minimal example works
- common use case is obvious
- setup assumptions are visible
- examples match the real supported contract

### Rule
A library without good examples is barely usable, no matter how elegant the internals are.

---

## Compatibility and Support Matrix Design

Consumers need honest support expectations.

### Compatibility should address
- runtime versions
- supported environments/platforms
- dependency expectations
- integration assumptions where relevant

### Rule
Do not imply support by silence.
If compatibility matters, document it.

---

## Versioning and Breaking-Change Discipline

Versioning should help consumers trust upgrades.

### Good versioning posture
- breaking changes are identified intentionally
- migration guidance exists when needed
- public behavior is not changed casually under patch/minor expectations

### Rule
If consumers cannot predict upgrade risk, versioning is not doing its job.

---

## Contract Testing and Release Gates

Library testing should prove the consumer-facing contract.

### Good verification posture
- important public behavior is tested directly
- examples stay in sync with reality
- supported environments are considered
- release confidence is tied to public contract verification

### Rule
A library can have perfect internal unit tests and still fail consumers if contract testing is weak.

---

## OS / Environment Notes

### macOS
Include platform notes when install/runtime behavior materially affects library adoption or support.

### Linux
Linux notes matter when runtime, filesystem, packaging, or service assumptions affect the contract.

### Windows
Windows compatibility claims should be explicit where path, shell, packaging, or runtime behavior changes user experience.

---

## Checklists

### Public API Checklist
- [ ] Public entry points are intentional
- [ ] Internal helpers are not exported casually
- [ ] Public names and behavior are understandable externally
- [ ] Defaults are explicit and defensible

### Example / README Checklist
- [ ] Minimal example exists
- [ ] Common usage path is documented
- [ ] Setup assumptions are visible
- [ ] Examples match real supported behavior

### Versioning / Compatibility Checklist
- [ ] Compatibility claims are explicit
- [ ] Breaking-change criteria are understood
- [ ] Release semantics match upgrade risk
- [ ] Migration support is considered where needed

### Library Release-Readiness Checklist
- [ ] Public contract is intentional
- [ ] README/examples are usable
- [ ] Verification covers consumer-visible behavior
- [ ] Upgrade expectations are honest

---

## Related Primers

- Library / SDK Primer
- Front Matter & Documentation Primer
- Git / Change Safety Primer
- Project Planning Primer

---

## Related Best Practices

- README Best Practices
- Front Matter & Documentation Best Practices
- Versioning / Migration Best Practices
- Coding Best Practices
- Project Planning Best Practices

---
type: best-practices
best_practice_name: coding
category: software
version: 2.0
updated: 2026-03-01
status: draft-v2
---

# Coding Best Practices

## When To Use This

Use this document before major implementation work, when code quality issues repeat, during review/remediation, or whenever structure, testing, errors, configuration, and dependency discipline need to be made explicit.

Open it when you need to:
- define implementation standards
- improve code structure and naming
- set verification/testing expectations
- prevent fake-complete code
- control dependency and configuration mistakes
- make code maintainable for future agents

This v2 version is aligned to the prep-system primer stack and selective-lookup documentation style.

---

## What This Covers

This document covers:
- naming and semantics
- module and layer structure
- verification and testing
- error handling
- configuration and environment handling
- dependency discipline
- refactorability and change safety
- quality gates for implementation work

It is the deeper execution-time standard under the **Coding Primer**.

---

## Quick Index

- [Non-negotiable standards](#non-negotiable-standards)
- [Naming and semantics](#naming-and-semantics)
- [Module and layer structure](#module-and-layer-structure)
- [Verification and testing standards](#verification-and-testing-standards)
- [Error handling and failure paths](#error-handling-and-failure-paths)
- [Configuration and environment handling](#configuration-and-environment-handling)
- [Dependency discipline](#dependency-discipline)
- [Refactorability and change safety](#refactorability-and-change-safety)
- [Review and quality gates](#review-and-quality-gates)
- [Checklists](#checklists)

---

## Decision Guide

### Extract shared logic when
- duplication is real and likely to persist
- common behavior has a stable concept behind it
- reuse will reduce maintenance cost without obscuring clarity

### Split modules when
- one file mixes unrelated responsibilities
- public interfaces and internal helpers are interwoven confusingly
- testing and reasoning are getting harder because boundaries are weak

### Reject “verification” when
- tests only prove the happy path superficially
- no one can explain what failure behavior was validated
- code looks plausible but the behavior is not actually checked

### Be cautious with dependencies when
- the package/tool is unfamiliar or unverified
- the same result could be achieved with simpler native tools
- versioning or maintenance quality is uncertain

---

## Core Rules

1. **Do not ship placeholder or fake-complete code.**

2. **Meaningful verification is mandatory.**  
   New behavior should not be merged on vibes alone.

3. **Use explicit naming and clear module boundaries.**

4. **Failure paths must be handled intentionally.**

5. **Configuration should be externalized, not hardcoded.**

6. **Dependencies must be verified and pinned appropriately.**

7. **Code should be written for future maintenance, not only present momentum.**

8. **Refactors should improve clarity, not merely rearrange files.**

9. **Generated code still owns real quality obligations.**

10. **Implementation quality is part of trust, not polish.**

---

## Common Failure Patterns

- placeholder logic presented as finished work
- fake-green testing that does not validate meaningful behavior
- large files with weak separation of concerns
- naming that hides intent or spreads ambiguity
- hardcoded config and environment assumptions
- dependency hallucinations or weak version discipline
- generated duplication that nobody cleans up
- swallowed errors or vague failure handling

---

## Non-Negotiable Standards

These rules should not be casually violated:

- **NEVER** use placeholders (`pass`, `TODO`, `NotImplementedError`, `...`) as pretend-complete implementation
- **NEVER** commit new functionality without meaningful verification
- **NEVER** swallow errors silently (`except: pass` or equivalent)
- **NEVER** use floating dependency ranges casually in production contexts
- **ALWAYS** use explicit type discipline where the language/ecosystem supports it
- **ALWAYS** verify dependencies and APIs actually exist before building around them
- **ALWAYS** externalize configuration rather than hardcoding environment-specific values
- **YOU MUST** run the relevant linting/quality checks before calling work complete

---

## Naming and Semantics

Good names reduce the need for commentary and re-explanation.

### Naming rules
- functions should read like actions
- classes/modules should reflect real concepts
- variables should describe purpose, not temporary author memory
- booleans should read clearly as true/false state
- names should match ecosystem conventions

### Bad signs
- placeholder names lingering into final code
- over-generic names like `data`, `info`, `process`, `manager`, `helper`
- names that only make sense if you already know the implementation story

### Rule
If a name needs surrounding explanation to feel safe, the name is probably weak.

---

## Module and Layer Structure

Good structure keeps reasoning local.

### Strong structure traits
- one module has one understandable responsibility
- public and internal layers are distinguishable
- infrastructure concerns do not leak everywhere casually
- files are sized for comprehension, not just author convenience

### Weak structure signs
- one file doing too many unrelated jobs
- routing/business logic/storage concerns tangled together
- helpers imported everywhere because boundaries were never designed
- code generation expanding the same pattern repeatedly without consolidation

### Rule
Structure should reduce future change cost, not merely reflect how the code was first generated.

---

## Verification and Testing Standards

Verification must prove behavior, not create emotional comfort.

### Good verification questions
- what behavior is being proven?
- what important failure path was tested?
- what would break if this code were wrong?
- what level of testing is appropriate here?

### Good testing posture
- test behavior, not just implementation trivia
- cover meaningful edge/failure cases
- keep tests understandable and purposeful
- avoid fake coverage that inflates confidence without evidence

### Rule
A passing test suite that fails to validate the real behavior is still weak verification.

---

## Error Handling and Failure Paths

Failure behavior is part of the product.

### Good error-handling traits
- expected failure is handled intentionally
- unexpected failure is surfaced meaningfully
- operators and developers can diagnose what happened
- user-visible failure is not misleading

### Bad patterns
- swallowed exceptions
- vague generic catch-all handling
- success-path code with no failure thought
- errors hidden behind misleading defaults

### Rule
If the system only behaves coherently when nothing goes wrong, the implementation is incomplete.

---

## Configuration and Environment Handling

Configuration should not be buried in code.

### Good config behavior
- environment-specific values are externalized
- sensitive values are not hardcoded
- setup assumptions are documented
- defaults are explicit and safe

### Bad config behavior
- secrets in code
- ports/URLs/paths hardcoded casually
- environment behavior implied but never documented
- local-machine assumptions leaking into general code

### Rule
A project should not require reading source internals just to understand runtime configuration.

---

## Dependency Discipline

Dependencies create long-tail maintenance cost.

### Good dependency rules
- verify the dependency exists and is maintained
- justify non-trivial additions
- pin versions appropriately for the context
- avoid dependency sprawl for small convenience wins

### Bad dependency behavior
- AI-invented packages assumed real
- floating ranges with unpredictable breakage
- complex libraries added for trivial tasks
- no clear ownership of dependency update risk

### Rule
Every dependency should earn its future maintenance cost.

---

## Refactorability and Change Safety

Code should support future safe change.

### Good refactorability traits
- responsibilities are localized
- tests/verification protect intended behavior
- public contracts are clear
- naming and structure make change impact understandable

### Good safety questions
- what should remain true after this change?
- what code is coupled more tightly than it should be?
- what can be simplified now to reduce later fragility?

### Rule
If the code is hard to safely change, quality is already weaker than it looks.

---

## Review and Quality Gates

Implementation is not done when the code merely compiles.

### Before calling work complete
- relevant linting passes
- meaningful verification exists
- naming and structure are defensible
- config handling is sane
- dependency choices are justified
- failure behavior was considered

### Quality gate rule
Code that violates core standards should not be treated as ready just because the feature demo works.

---

## OS / Environment Notes

### macOS
Be alert for local development assumptions that accidentally become “general” coding standards.

### Linux
Service/runtime assumptions may change config, path, process, or filesystem expectations.

### Windows
Path handling, shell behavior, and platform-specific integration assumptions may need explicit care.

### Rule
Only include platform-specific coding guidance where the implementation really changes by environment.

---

## Checklists

### Pre-Implementation Coding Checklist
- [ ] Requirements are clear enough to implement honestly
- [ ] Verification strategy exists
- [ ] Naming and structure approach are understood
- [ ] Error handling approach is planned
- [ ] Configuration will be externalized
- [ ] Dependencies are verified before use

### Meaningful Verification Checklist
- [ ] The important behavior is actually tested or otherwise verified
- [ ] Failure paths are considered
- [ ] Tests are not fake-green comfort theater
- [ ] The verification matches the real risk of the change

### Code Review Checklist
- [ ] No placeholder or fake-complete logic
- [ ] Naming and structure support maintenance
- [ ] Failure behavior is explicit
- [ ] Config handling is sane
- [ ] Dependencies are justified and pinned appropriately
- [ ] The code is easier to change safely than before

---

## Related Primers

- Coding Primer
- Security Primer
- Production Primer
- Git / Change Safety Primer
- Project Planning Primer

---

## Related Best Practices

- Security Best Practices
- Production Best Practices
- Git / Change Safety Best Practices
- Project Planning Best Practices
- Front Matter & Documentation Best Practices

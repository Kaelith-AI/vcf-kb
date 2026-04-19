---
type: best-practices
best_practice_name: project-planning
category: universal
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Project Planning Best Practices

## When To Use This

Use this document before implementation begins, whenever project framing is unclear, or whenever a project needs to be re-scoped, reclassified, or handed off cleanly.

Open it when you need to:
- classify a project correctly
- define audience and risk posture
- determine deployment targets early
- decide which modifiers apply
- define what “done” means
- define what must not fail
- make the project plan legible to another agent

This is the deep-reference layer under the **Project Planning Primer**.

---

## What This Covers

This document covers:
- project classification
- primary types vs modifiers
- audience as a rigor control
- deployment-target planning
- success criteria and failure conditions
- planning for handoff and continuation
- primer-routing implications

It is not an implementation guide.
It is a planning-quality guide.

---

## Quick Index

- [Classification model](#classification-model)
- [Primary types](#primary-types-and-how-to-distinguish-them)
- [Modifiers](#modifier-model-and-common-modifier-mistakes)
- [Audience and rigor](#audience-and-risk-posture)
- [Deployment targets](#deployment-target-planning)
- [Done-state design](#success-criteria--done-state-design)
- [Failure conditions](#failure-condition-design)
- [Handoff-safe planning](#planning-for-handoff-and-continuation)
- [Primer routing](#primer-routing-implications)
- [Checklists](#checklists)

---

## Decision Guide

Use this guide when the project shape is unclear.

### 1. Start with the primary type
Ask:
- Is the main product a user-facing app?
- Is the main product a reusable package or SDK?
- Is the main product a workflow/automation?
- Is the main product an operational/deployment system?
- Is the main product a community/content surface?

Choose the primary type based on the **core product reality**, not the most exciting feature.

### 2. Add modifiers, do not explode the type count
If the project is AI-enabled, automation-heavy, community-facing, self-hosted, or cross-platform, those are usually **modifiers**, not replacements for the primary type.

### 3. Treat audience as a rigor setting
Audience is not branding fluff.
It changes:
- acceptable risk
- security posture
- production expectations
- documentation clarity requirements
- moderation/legal sensitivity where relevant

### 4. Decide deployment reality before architecture sprawls
The project should know early whether it is:
- local-only
- web-facing
- Linux-hosted
- Discord-native
- cross-platform
- self-hosted

### 5. Define both success and unacceptable failure
A project without a done-state is vague.
A project without unacceptable-failure conditions is dangerous.

---

## Core Rules

1. **Classify the project before planning execution.**  
   Wrong framing causes downstream review, architecture, and routing mistakes.

2. **Use one primary type plus modifiers.**  
   Keep the classification model compact and expressive.

3. **Treat audience as a rigor modifier, not a marketing label.**

4. **Define deployment reality early.**  
   Runtime and platform assumptions are planning inputs, not packaging cleanup.

5. **Define success in observable terms.**  
   “Built” is not a valid done-state.

6. **Define unacceptable failure before implementation begins.**

7. **Do not lower rigor just because the project is internal.**

8. **Make routing implications explicit.**  
   The project plan should naturally imply which primers and later best-practice docs matter.

9. **Write the plan so another agent can continue it without guessing.**

10. **Planning quality is multiplicative.**  
   Good planning reduces later coding, security, production, and documentation churn.

---

## Common Failure Patterns

- choosing the wrong primary type because the surface looks familiar
- treating `ai-native` or `community-facing` as type replacements instead of modifiers
- ignoring deployment targets until infrastructure or packaging work starts breaking
- vague goals like “build the thing” without measurable success criteria
- no explicit failure conditions or trust boundaries
- assuming internal work can skip security or production thinking
- plans written only for the current session or current author
- handoff impossible because important assumptions were never written down

---

## Classification Model

The prep system uses four core planning inputs:
- **primary type**
- **modifiers**
- **deployment targets**
- **audience**

This model is strong because it avoids exploding into dozens of brittle project types while still routing useful preparation.

### Good planning posture
A project plan should be able to state clearly:
- what this project fundamentally is
- what special traits modify its risk/behavior
- where it actually runs
- who it serves and how much rigor that demands

---

## Primary Types and How To Distinguish Them

### `application-web`
Use when the main product is a web application, dashboard, or SaaS-style experience.

### `application-desktop`
Use when the product is primarily a desktop runtime with platform/distribution concerns.

### `application-mobile`
Use when the product is primarily a mobile app or companion.

### `internal-tool`
Use when the product is a tool for operators, staff, or internal teams.
Do not mistake internal for low-risk.

### `library-sdk`
Use when the product’s main value is a reusable interface or dependency.
The public contract is the product.

### `automation-workflow`
Use when the main product is workflow execution, orchestration, or automation logic.

### `api-service`
Use when the main product is a service/API layer with contracts, auth, and runtime obligations.

### `infrastructure-deployment`
Use when the main product is runtime/deployment environment design, host setup, or operational stack composition.

### `community-social-project`
Use when community trust, moderation, messaging, or public interaction is central to the product.

### `content-marketing-project`
Use when the main output is publishing, messaging, or media/content operations rather than general software behavior.

### Rule of thumb
Pick the type based on what the project **really is if you strip away the implementation excitement**.

---

## Modifier Model and Common Modifier Mistakes

Modifiers intensify or extend routing.
They do not normally replace the primary type.

### Common modifiers
- `ai-native`
- `automation-heavy`
- `community-facing`
- `cross-platform`
- `self-hosted`
- `integration-heavy`
- `local-llm`
- `api-backed`
- `data-heavy`

### Common mistakes
- treating `ai-native` as the whole type
- forgetting to mark community-facing products as such
- missing automation-heavy on projects that clearly depend on workflows/agents
- forgetting self-hosted or cross-platform until late operational pain appears

### Good rule
If removing the trait would leave the product fundamentally the same kind of thing, it is probably a **modifier**, not a primary type.

---

## Audience and Risk Posture

Audience primarily controls rigor.

### `internal`
Internal does **not** mean safe by default.
It often still requires:
- strong auth/role thinking
- operator safety
- data discipline
- production-quality runtime thinking

### `external-limited`
This often raises requirements for:
- documentation clarity
- security posture
- supportability
- trust boundary definition

### `external-public`
This is the strongest rigor tier.
Expect:
- stronger security demands
- stronger production demands
- stronger moderation/content-safety demands when relevant
- less tolerance for ambiguity, fragility, or hidden assumptions

### Planning rule
Audience should affect planning posture early, not only review strictness later.

---

## Deployment-Target Planning

Deployment targets should be decided early enough to influence architecture and primer routing.

Examples:
- `linux`
- `macos`
- `windows`
- `web`
- `discord`
- `local`

### Why this matters
Deployment targets change:
- runtime assumptions
- config handling
- production needs
- packaging/install requirements
- support expectations
- platform-specific risk

### Bad planning pattern
“We’ll figure out deployment later” is often how projects end up with architecture that only works on the author’s machine.

---

## Success Criteria / Done-State Design

A project needs a concrete done-state.

### Good done-state traits
A done-state should answer:
- who can use it?
- where can it run?
- what capabilities are proven?
- what support or maintenance expectation exists?
- what must be documented or verifiable?

### Weak examples
- “the feature is built”
- “the prototype works”
- “the bot responds”

### Stronger examples
- “the service can be deployed, configured, observed, and recovered on the intended Linux target”
- “the library exposes a stable documented interface with examples and upgrade-safe versioning expectations”
- “the Discord automation operates within defined permission and moderation boundaries”

---

## Failure-Condition Design

Planning should explicitly define unacceptable failure.

### Ask early
- what would make this unsafe?
- what would make this misleading?
- what would make this impossible to support?
- what would break trust with the intended audience?
- what later review failure is already predictable from bad planning now?

### Why this matters
Failure conditions help guide:
- architecture
- security
- production design
- moderation scope
- documentation needs
- test and review priorities

---

## Planning for Handoff and Continuation

A project plan should survive author turnover.

### Minimum handoff-safe planning information
- project type
- modifiers
- deployment targets
- audience
- done-state
- unacceptable failure conditions
- key constraints
- likely primer / BP references
- current scope boundaries

### Rule
If another agent cannot continue the project without guessing your mental model, the plan is incomplete.

---

## Primer-Routing Implications

A good project plan naturally implies the next reading route.

Examples:
- application-web → Coding + Security + Production
- library-sdk → Library / SDK + README + Front Matter & Documentation
- community-social-project → Security + Production + Content Moderation / Safety
- automation-workflow → Security + Production + Automated Agents
- `ai-native` → LLM Integration
- `self-hosted` → Docker Compose / Systemd / Nginx as relevant

Planning is where these routes should become obvious.

---

## OS / Environment Notes

### macOS
Platform-specific packaging, path behavior, and install expectations may influence planning earlier than expected.

### Linux
Self-hosted runtime, service management, and production assumptions often become planning constraints early.

### Windows
Installer/support expectations, path behavior, and platform support promises should be treated explicitly.

---

## Checklists

### New Project Planning Checklist
- [ ] Primary type is explicitly chosen
- [ ] Relevant modifiers are explicitly chosen
- [ ] Audience is explicitly chosen
- [ ] Deployment targets are explicitly chosen
- [ ] Success criteria are written in observable terms
- [ ] Unacceptable failure conditions are written down
- [ ] Primer implications are clear
- [ ] Another agent could continue from the plan

### Project Classification Checklist
- [ ] The primary type reflects the core product, not an exciting detail
- [ ] Modifiers are not being used as replacement types
- [ ] Community, automation, AI, and hosting traits are not being overlooked

### Done-State / Failure-State Checklist
- [ ] Done means more than “built”
- [ ] Failures include trust/support/safety concerns, not just crashes
- [ ] Audience changes the rigor standard appropriately

### Handoff-Quality Checklist
- [ ] Hidden assumptions were written down
- [ ] Scope boundaries are clear
- [ ] Next likely best-practice docs are obvious
- [ ] Another agent would not need to reconstruct the project identity from scratch

---

## Related Primers

- Project Planning Primer
- Coding Primer
- Security Primer
- Production Primer
- Library / SDK Primer
- Front Matter & Documentation Primer

---

## Related Best Practices

- Front Matter & Documentation Best Practices
- Git / Change Safety Best Practices
- Coding Best Practices
- Security Best Practices
- Production Best Practices
- Library / SDK Best Practices
- Content Moderation Safety Best Practices

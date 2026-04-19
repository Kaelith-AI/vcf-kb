---
type: best-practices
best_practice_name: git-change-safety
category: universal
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Git / Change Safety Best Practices

## When To Use This

Use this document before large refactors, risky edits, agent-driven changes, remediation loops, config/infra changes, or any work where rollback, reviewability, and clean handoff matter.

Open it when you need to:
- split broad work into safer chunks
- checkpoint before risky edits or automation
- decide commit boundaries
- improve diff clarity
- make rollback and handoff possible
- control agent-generated change safely

This is the deep-reference layer under the **Git / Change Safety Primer**.

---

## What This Covers

This document covers:
- checkpointing and rollback
- commit boundary design
- diff reviewability
- refactor safety
- agent-generated change control
- risky-area handling
- handoff and auditability

It is not just about git commands.
It is about safe change as an operating discipline.

---

## Quick Index

- [Checkpoint and rollback strategy](#checkpoint-and-rollback-strategy)
- [Commit boundary design](#commit-boundary-design)
- [Diff reviewability rules](#diff-reviewability-rules)
- [Refactor safety](#refactor-safety)
- [Agent-generated change control](#agent-generated-change-control)
- [Risky-area handling](#risky-area-handling-auth-data-infra-public-interfaces)
- [Handoff and auditability](#handoff-and-auditability)
- [Checklists](#checklists)

---

## Decision Guide

### Split a change when
- it contains more than one coherent story
- it mixes docs, refactor, feature, and config changes casually
- review would be easier if the change were staged
- rollback would otherwise be too blunt

### Checkpoint before work when
- the change is broad
- the change is risky
- an agent or automation will touch many files
- you are editing infra, auth, data, deployment, or public interfaces

### Treat a diff as too big when
- you cannot explain it clearly in one coherent summary
- another agent would struggle to review it safely
- the rollback cost would be unacceptably broad

### Use stronger separation when
- the change touches trust boundaries
- the change changes structure and behavior at the same time
- the change affects runtime, deployment, or persistent state

---

## Core Rules

1. **Create rollback points before risky work.**

2. **One commit should tell one coherent story.**

3. **Separate unrelated change categories.**

4. **Optimize for reviewability and revertability, not emotional momentum.**

5. **Do not hide risky edits inside large mixed diffs.**

6. **Checkpoint before agent-generated or automation-heavy changes.**

7. **Large refactors need explicit boundaries.**

8. **Risk concentration should trigger extra caution.**

9. **Commit messages should explain intent, not merely motion.**

10. **History should help another agent continue safely.**

---

## Common Failure Patterns

- giant mixed diffs with no coherent boundary
- commit messages that do not explain why the change exists
- automated changes run without a clean pre-run checkpoint
- refactor + feature + docs + formatting bundled together
- risky config or infra changes hidden inside routine code edits
- no clear rollback point before experimenting
- handoff failure because commit history does not reveal intent

---

## Checkpoint and Rollback Strategy

A rollback point is not optional safety fluff.
It is operational insurance.

### Create a checkpoint before
- large multi-file edits
- broad refactors
- automated or agent-driven passes
- risky config, infra, auth, or data work
- remediation loops that may span multiple categories

### Good checkpoint qualities
- clean state
- coherent pre-change boundary
- easy to revert mentally and operationally

### Rule
If undoing the work would be confusing or overly destructive, the checkpointing strategy is weak.

---

## Commit Boundary Design

A good commit should have a strong internal reason for existing.

### Good commit boundaries
- one feature slice
- one refactor unit
- one docs change set
- one configuration change
- one migration step

### Bad commit boundaries
- “everything I touched today”
- “the agent changed a lot”
- “it all kind of relates”

### Rule
A commit boundary should reduce review and rollback cost, not increase it.

---

## Diff Reviewability Rules

Reviewability is a first-class design concern.

### A reviewable diff should be
- coherent
- explainable
- bounded
- not overloaded with unrelated edits
- sized so another reviewer can understand what changed and why

### Warning signs
- too many files with multiple unrelated purposes
- style churn hiding logic changes
- refactor and behavioral change tightly interwoven
- generated changes with no explanation of scope or goal

### Rule
If the diff is hard to explain, it is likely too large or too mixed.

---

## Refactor Safety

Refactors are especially risky because they often look clean while hiding broad consequences.

### Refactor safety rules
- separate structural change from behavioral change when possible
- checkpoint before broader refactors
- avoid mixing opportunistic cleanup into already risky work
- keep the intended invariant explicit

### Good refactor question
“What should remain true after this refactor?”

If you cannot answer that clearly, the refactor is under-bounded.

---

## Agent-Generated Change Control

Agent-generated changes need stronger discipline, not weaker discipline.

### Always do
- checkpoint before larger runs
- scope the task clearly
- keep review expectations explicit
- avoid accepting large plausible diffs without inspection

### Especially risky patterns
- “fix the repo” tasks
- broad auto-remediation
- mixed code + docs + config + infra edits in one pass
- agent runs touching secrets, auth, deployment, or public contracts

### Rule
Agents amplify both speed and blast radius.
Use them to accelerate disciplined change, not bypass it.

---

## Risky-Area Handling (auth, data, infra, public interfaces)

Some areas deserve special caution even when the change appears small.

### High-risk areas include
- authentication and permissions
- secrets and config handling
- data shape, migration, or durability
- deployment/runtime infrastructure
- public APIs or contracts
- moderation/safety boundaries

### Good practice
- isolate these changes
- checkpoint first
- review more carefully
- avoid mixing them with opportunistic cleanup

---

## Handoff and Auditability

History should help another agent understand what happened.

### Good handoff traits
- commit history reveals intent
- rollback points are visible
- risky changes are isolated
- broad automated runs are labeled and explainable
- another operator can infer why a given change exists

### Rule
Version control is not just storage.
It is a continuation and trust system.

---

## OS / Environment Notes

This topic is mostly cross-environment.
Only add platform-specific notes when tooling, path behavior, or operational workflows differ materially enough to affect safe-change practice.

---

## Checklists

### Pre-Change Safety Checklist
- [ ] The change has a clear purpose
- [ ] Risk concentration is understood
- [ ] A rollback point exists or will be created first
- [ ] The work can be split if necessary

### Pre-Commit Clarity Checklist
- [ ] The commit tells one coherent story
- [ ] Unrelated changes were separated
- [ ] The commit message explains intent clearly
- [ ] The resulting diff is reviewable by another agent

### Risky-Change Checkpoint Checklist
- [ ] Clean checkpoint created before high-risk work
- [ ] Auth/data/infra/public-interface changes are isolated
- [ ] Automated changes are bounded and inspectable
- [ ] Rollback cost is acceptable

### Handoff-Safe Diff Checklist
- [ ] Another agent can explain what changed and why
- [ ] The history reveals logical progression
- [ ] The diff is not a mixed blob of unrelated work
- [ ] Review and revert remain practical

---

## Related Primers

- Git / Change Safety Primer
- Coding Primer
- Automated Agents Primer
- Claude Code Agents Primer
- Project Planning Primer

---

## Related Best Practices

- Coding Best Practices
- Project Planning Best Practices
- Security Best Practices
- Production Best Practices
- Front Matter & Documentation Best Practices

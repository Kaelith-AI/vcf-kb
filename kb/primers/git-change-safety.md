---
type: primer
primer_name: git-change-safety
category: universal
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Git / Change Safety Primer

## What This Primer Is For

This primer prepares a PM to make changes safely, reversibly, and in manageable units.

It exists because a lot of project damage does not come from one bad idea.
It comes from:
- large unreviewable diffs
- missing rollback points
- unclear commit intent
- multiple categories of change mixed together
- fast iteration with no recovery discipline

This primer is about keeping change safe enough that mistakes can be understood and undone.

---

## Read This First

If you are changing a project without a clear rollback path, you are borrowing confidence you do not actually have.

Vibe-coded workflows make this worse because they can generate:
- many files at once
- broad refactors quickly
- mixed structural and behavioral changes in one sweep
- large diffs that feel productive but are hard to reason about

Small, well-described, reversible change is a quality multiplier.
It helps review, debugging, rollback, and trust.

---

## The 5–10 Rules To Not Violate

1. **Make small changes on purpose.**  
   Small diffs are easier to review, understand, and revert.

2. **Commit logical units, not emotional bursts.**  
   One commit should tell one coherent story.

3. **Always preserve a rollback path.**  
   If you cannot safely undo the change, the change is not ready.

4. **Do not mix unrelated categories of work casually.**  
   Structural cleanup, feature work, documentation, and refactors should not collapse into one blob.

5. **Write commit messages that explain intent, not just file movement.**

6. **Checkpoint before risky work.**  
   Especially before large edits, automated changes, or remediation passes.

7. **Avoid giant generated diffs unless the batch is truly justified and labeled.**

8. **Leave the repo easier to reason about than you found it.**

9. **Use version control as a safety system, not just a shipping system.**

10. **If the diff is too big to explain clearly, it is probably too big.**

---

## Common Early Mistakes

- making many unrelated edits before the first checkpoint
- committing after the fact with vague messages that do not explain why the change exists
- bundling refactor + feature + docs + formatting together
- editing risky areas without preserving a clean rollback point
- letting generated changes expand until nobody can explain the full diff confidently
- treating git as archival rather than operational safety

---

## What To Think About Before You Start

### 1. Change shape
Ask:
- what category of change is this?
- feature, refactor, fix, docs, cleanup, migration, or rollback prep?

### 2. Safety boundary
Ask:
- what is the rollback point before I start?
- what is the smallest meaningful unit of progress?

### 3. Diff discipline
Ask:
- can this be split?
- will another agent understand what changed and why?

### 4. Risk concentration
Ask:
- am I touching auth, deployment, data, or shared interfaces?
- should I checkpoint before continuing?

### 5. Commit clarity
Ask:
- can I describe this change in one sentence honestly?
- if not, should it be multiple commits?

---

## When To Open The Best-Practice Docs

Open deeper change-safety guidance when you begin:
- larger refactors
- risky remediation passes
- packaging/release prep
- backup or rollback planning
- migration or structural reorganization work

This primer should be enough to start with the right discipline.
The deeper docs should guide the detailed rules later.

---

## Related Best Practices

Primary follow-up docs:
- Git / Change Safety Best Practices
- Project Planning Best Practices
- Front Matter & Documentation Best Practices

---

## Quick Routing Guide

This primer should be part of the universal baseline for most PM bootstraps.
It is especially important when:
- writing code
- doing multi-file edits
- running remediation loops
- preparing review-driven fixes
- editing infra/runtime/deployment areas

It is less about git as a tool and more about change safety as a working habit.

---

## Final Standard

Before making significant changes, you should be able to say:

> I know what I am changing, why it is grouped this way, where my rollback point is, and how another agent would understand the diff and commit history if I hand this off.

If you cannot say that honestly, the change is not yet safe enough.

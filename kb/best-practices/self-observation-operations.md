---
type: best-practices
best_practice_name: self-observation-operations
category: software
version: 1.0
updated: 2026-04-22
tags: [vibe-coding, project-planning, audit-trail, documentation, maintainability, redaction]
---

# Self-Observation Operations

## When to use

You're running a build, closing a phase, or entering a retrospective and you need to write something down. The taxonomy (decision / lesson / feedback / finding) is already defined. This document covers the cadence that keeps those buckets useful across weeks and releases — when to write, when to triage, when to promote, and when a record is considered closed.

## Write-time triage: which bucket, right now

Ask in order. Stop at the first yes.

1. **Am I inside a review run and I see a defect in the code?** → finding. Not a lesson, not feedback.
2. **Did I make a non-obvious call that another agent would likely undo?** → decision.
3. **Did I hit a surprise with a teachable shape — true beyond this task?** → lesson.
4. **Is it a "sigh, that was clunky" reaction, not fully articulated?** → feedback.

Write-time discipline matters because misrouted entries are invisible to the correct query. A finding written as feedback never shows up in the review carry-forward report. A lesson written as a decision pollutes rationale searches with anecdote.

## Decision: when to write, how to supersede

Write a decision the moment you make the call, in the same commit. If it's in the next commit, it will be in no commit.

**Supersession protocol:** when a later decision invalidates an earlier one, add `supersedes: [earlier-decision-id]` to the new entry, and add `superseded_by: [new-decision-id]` to the old one. Never delete the old record. The old decision is the explanation for why the new one exists — without it, future readers can't tell if the current state is a deliberate reversal or a mistake.

## Lesson: the promotion path

Lessons carry a `scope` field: `session | project | universal`.

- **Session-scope** stays in the session and does not migrate on its own.
- **Project-scope** lives in the project DB. Visible to any builder on that project.
- **Universal-scope** is KB-worthy. Gate: the same lesson must surface independently on at least two separate projects before promotion is initiated. One project hitting a trap is noise. Two is a pattern.

Promotion workflow: draft the KB candidate from the source lesson, cite the originating project IDs, submit for human review before merging into the KB. The KB entry links back to its project origins; the project lessons link forward to the KB entry.

## Feedback triage cadence

Feedback is a triage inbox, not a record. Treat it as such.

**Cadence:** at the close of each phase, or at minimum once per release.

For each unresolved feedback entry, the retrospective decides exactly one of:
- **Promote to lesson** — the nudge has a teachable shape; write the lesson now, mark feedback resolved.
- **File as bug** — the friction points at broken behavior; open a tracked issue, link it, mark feedback resolved.
- **File as feature request** — the friction is valid but out of scope now; open a tracked item, mark feedback resolved.
- **Drop** — stale, resolved by other means, or genuinely not worth tracking. Mark resolved with a one-line note.

The feedback queue must be empty at the end of each retrospective. An unread queue is a tax on every future search.

## Finding lifecycle

Findings are produced inside a review run. Each finding exits in exactly one of three states:

- **Resolved** — code changed, the fix is verified in the follow-up review. Close with a `resolved_by` reference to the commit or review run.
- **Carry-forward** — the finding stands but is not fixed now. Requires an explicit `accepted_risk` field with a rationale and an owner. Future review runs inherit it automatically and decide independently.
- **Dismissed** — reviewer disagrees that it is a real issue. Record the disagreement in the finding's response log; do not erase the original claim. A finding can be re-raised if new evidence appears.

Never silently drop a finding between runs. "I forgot about it" is not a lifecycle state.

## Retrospective inputs — what to read, every time

A phase or release retrospective reads all four buckets for the period:

| Input | Query |
|---|---|
| Decisions | All decisions made since last retrospective; flag any that were superseded |
| Lessons | All lessons at project-scope or above; any candidates for universal promotion |
| Carry-forwards | All open `accepted_risk` findings; re-evaluate each one |
| Feedback | Full queue; triage to empty |

Write one retrospective document per cycle. Cite inputs by ID, not by copy-paste. The retrospective is a pointer document, not a transcript.

## Cross-referencing

Cross-references survive refactors only if they use IDs, not file paths. A lesson caused by a decision cites `informed_by: [decision-id]`. A decision informed by prior learning cites `informed_by: [lesson-id]`. A dismissed finding that reflects intentional design cites `dismissed_reason: "see decision [decision-id]"`. Build these links at write time; retrofitting from memory is unreliable.

## Tag hygiene

Each bucket has a controlled tag vocabulary. Enforce it at write time, not audit time.

- **Lessons:** `stage` (plan / build / test / review / deploy) + `topic` (narrow, from the KB vocabulary).
- **Decisions:** `domain` (one term — architecture, security, data-model, tooling, ops).
- **Feedback:** `stage` (same stage list as lessons).
- **Findings:** `review-type` (code / security / performance) + `severity` (info / low / medium / high / critical).

Tag drift → search rot. If a query for "build-stage lessons" returns findings tagged `build`, the vocabulary has collapsed and triage becomes manual grep.

## Privacy, redaction, and retention

Lessons and feedback may capture session text containing PII. Apply the two-point redaction rule (`best-practices/llm-output-redaction.md`) before persisting any entry. Promotion is a second redaction checkpoint — re-run the redactor before an entry moves up scope. Universal KB lessons are PII-clean by definition; the audit link back to project origin does not carry raw session text.

Retention: decisions, lessons, and findings are kept forever (wrong lessons are marked wrong, not deleted; superseded decisions are archived not dropped). Feedback is kept until triaged; silence is not a valid outcome.

## Forbid

- **Writing feedback instead of a lesson** because a lesson requires more effort. The lesson bar is "teachable shape" — if you can state an actionable takeaway, it is a lesson.
- **Letting the feedback queue accumulate across retrospectives.** Unread feedback is a signal backlog. Two missed retrospectives and you have lost the context to triage it accurately.
- **Deleting a superseded decision** instead of linking it forward. The deleted decision is exactly the artifact that prevents the next agent from repeating the same reasoning.
- **Carrying a finding forward without an `accepted_risk` rationale.** "We'll look at it later" is not a rationale. A carry-forward without a named risk owner is a silent drop in disguise.
- **Promoting a lesson to universal before two independent projects confirm it.** One project's hard-won lesson is often local to its constraints; premature promotion teaches the wrong thing at global scope.
- **Cross-referencing by file path.** File paths move. IDs don't. A broken reference is worse than no reference — it signals care that didn't actually exist.

## See also

- `primers/lesson-vs-decision-vs-feedback.md` — the taxonomy: what each bucket is and why it exists.
- `best-practices/audit-trail-discipline.md` — how all four buckets get persisted and queried.
- `best-practices/llm-output-redaction.md` — the two-point redaction rule that applies at lesson/feedback write time.

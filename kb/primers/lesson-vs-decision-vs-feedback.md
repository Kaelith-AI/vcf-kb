---
type: primer
primer_name: lesson-vs-decision-vs-feedback
category: universal
version: 1.0
updated: 2026-04-22
tags: [vibe-coding, project-planning, documentation, audit-trail, maintainability]
---

# Lessons vs. Decisions vs. Feedback vs. Findings

## When to use

You're self-observing during a build, a review, or a retrospective and you notice something worth writing down. The temptation is to drop it all into "notes." Without a taxonomy, you lose the ability to ask pointed questions like "what have we learned about the test step?" or "which decisions turned out wrong?" Four distinct artifacts, four distinct purposes.

## The taxonomy

### Decision

A **choice made**, with its rationale. "We chose X over Y because Z." Decisions are durable — they explain *why* the code looks the way it does. A future reader reads decisions first when they're about to refactor something that seems weird.

- **Written when:** you make a non-obvious call that another agent/human might undo if they don't know the reason.
- **Fields:** title, rationale, alternatives considered, date, author, links to affected files.
- **Updated when:** a subsequent decision supersedes it (link both ways).
- **Never deleted.**

### Lesson

A **truth earned**, independent of any specific decision. "This library's docs lied about async behavior." "Tests flake when parallelism > N." Lessons are what you wish you'd known before you started.

- **Written when:** you hit surprise and the surprise has a teachable shape.
- **Fields:** context (what you were doing), observation (what surprised you), actionable takeaway (what a future builder should do differently), scope (session / project / universal).
- **Promotion path:** `session → project → universal`. A universal lesson is KB-worthy; project-scope stays in the project DB.
- **Never deleted.** Even a lesson proven wrong teaches something; mark it wrong, don't erase it.

### Feedback

A **nudge** — one-sentence observation that's true but doesn't meet the lesson bar. "This error message is confusing." "I expected this to be idempotent." Feedback is the triage inbox for process improvement.

- **Written when:** you have a "sigh, that was clunky" reaction and the friction isn't worth a full lesson.
- **Fields:** note (one string), stage (optional), urgency (optional).
- **Triaged periodically.** The retrospective cycle reads feedback, decides whether each entry becomes a lesson, a bug, a feature, or gets dropped.
- **Deletable after triage.**

### Finding

A **claim against the code**, produced by a review pass. "This function handles N but not N+1." Findings are scoped to a review run and have a formal verdict (PASS / NEEDS_WORK / BLOCK) and severity.

- **Written when:** a reviewer inspects code and sees an issue.
- **Fields:** file, line, category, severity, description, verdict it drove.
- **Resolved or carried forward.** Resolution means code changed; carry-forward means future reviewers see it and decide independently.
- **Never deleted.** Carry-forward with `accepted_risk` is how you close one honestly without losing the history.

## Worked disambiguation

- "We chose Zod over Yup" → **decision**.
- "Zod's `.strict()` silently drops through `.shape` reconstruction" → **lesson** (earned knowledge about the tool).
- "The error message when Zod parse fails is confusing" → **feedback** (nudge).
- "The `idea_capture` tool accepts unknown keys and it shouldn't" → **finding** (claim against the code, bug to fix).

Four different artifact types, four different queries downstream, four different lifecycles.

## Why the split matters

- A retrospective that asks "what decisions did we make this quarter" should return decisions, not every scribbled note.
- A planner reviewing lessons for stage "test" should see teachable patterns, not individual bug claims.
- A builder looking at findings sees their review punch-list, not rationale for last year's architecture choice.

Merging the four buckets makes every downstream query slow and noisy. The taxonomy is the cheap part; pay it up front.

## Forbid

- One bucket used for two purposes. A "notes" file is a taxonomy collapse; split it.
- Deleting lessons or decisions. Wrong history is still history.
- Feedback that grew arms and legs. Promote it to a lesson once it's clearly one.
- Findings outside a review run. Use the review surface, not ad-hoc.

## See also

- `primers/vibe-coding.md` — the broader discipline.
- `primers/project-planning.md` — where decisions get referenced.
- `best-practices/audit-trail-discipline.md` — how all four get persisted.

---
type: primer
primer_name: claude-code-agents
category: toolchain
version: 1.0
updated: 2026-03-01
tags: [claude-code, llm, agent-orchestration, skill-authoring]
status: draft-v1
---

# Claude Code Agents Primer

## What This Primer Is For

This primer prepares a PM to use Claude Code–style coding agents without treating agentic coding as a substitute for project structure, review discipline, or change safety.

It is relevant when a project:
- uses coding agents to explore, edit, refactor, or implement code
- delegates multi-file work to background coding agents
- mixes human direction with agent execution loops
- relies on agent-generated diffs as a core delivery path

Its purpose is to keep coding-agent leverage high without letting repo clarity, reviewability, or trust collapse.

---

## Read This First

Coding agents accelerate both progress and mess.

The most common early mistake is using a strong coding agent as if capability removes the need for:
- a clear plan
- bounded task scope
- repo-specific context
- rollback discipline
- review checkpoints
- explicit success criteria

It does not.

A coding agent works best when:
- the task is clearly scoped
- the repo conventions are legible
- the output is reviewable
- the agent is not asked to improvise project identity
- risky work is checkpointed before the run

Good agent use feels like well-bounded delegation, not roulette.

---

## The 5–10 Rules To Not Violate

1. **Start with a scoped task, not a vague wish.**

2. **Do not delegate project understanding you have not established.**  
   Agents need context, not guesswork.

3. **Preserve rollback points before larger agent runs.**

4. **Reviewability matters more than raw diff volume.**

5. **Do not let the agent silently redefine architecture or conventions.**

6. **Large refactors need explicit boundaries and acceptance criteria.**

7. **Agent output should leave evidence of reasoning in the artifacts or summary.**

8. **Use coding agents to accelerate disciplined work, not bypass discipline.**

9. **Risky areas need tighter oversight.**  
   Auth, secrets, infra, migrations, and public interfaces should not be casually delegated.

10. **A coding agent is powerful, not self-justifying.**

---

## Common Early Mistakes

- handing the agent a broad “fix the repo” instruction
- sending it into a codebase with weak plans or unclear conventions
- accepting giant diffs because they look productive
- not checkpointing before major edits or refactors
- allowing the agent to mix multiple categories of change together
- under-reviewing changes in security, production, or public-interface areas
- treating coding-agent success as equivalent to project-quality success

---

## What To Think About Before You Start

### 1. Task boundary
Ask:
- what exactly should the agent do?
- what is in scope and out of scope?
- what artifacts or files should it touch?

### 2. Context quality
Ask:
- what repo/project context does the agent need?
- what conventions, constraints, or best-practice docs must be supplied?

### 3. Change safety
Ask:
- where is the rollback point?
- should this be split into multiple runs instead of one broad pass?

### 4. Review model
Ask:
- how will the output be checked?
- what counts as acceptable versus “looks plausible but not trusted yet”?

### 5. Risk concentration
Ask:
- is this touching secrets, auth, infra, migrations, or public contracts?
- if yes, what extra oversight is required?

---

## When To Open The Best-Practice Docs

Open deeper coding-agent guidance when you begin:
- delegating implementation work
- running larger refactors
- using background coding agents
- splitting work into safe chunks
- reviewing large agent-generated diffs

This primer is the preventive posture layer.
The deeper docs should define the concrete coding-agent workflows and guardrails.

---

## Related Best Practices

Primary follow-up docs:
- Claude Code / Coding-Agent Best Practices
- Coding Best Practices
- Git / Change Safety Best Practices
- Security Best Practices
- Production Best Practices

---

## Quick Routing Guide

This primer is especially important when:
- implementation is being delegated to coding agents
- background coding runs can touch many files
- multi-step refactor or repair loops are being considered
- the repo is complex enough that uncontrolled agent work would be costly

It commonly pairs with:
- Coding
- Git / Change Safety
- Automated Agents
- Security

---

## Final Standard

Before delegating significant repo work to a coding agent, you should be able to say:

> I know what the agent is supposed to do, what context and constraints it has, where the rollback point is, how the resulting diff will be reviewed, and what high-risk areas require tighter oversight.

If you cannot say that honestly, the delegation boundary is not ready.

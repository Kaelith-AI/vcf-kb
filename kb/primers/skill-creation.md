---
type: primer
primer_name: skill-creation
category: tools
version: 1.0
updated: 2026-03-17
tags: [claude-code, skill-authoring, documentation]
status: draft-v1
---

# Skill Creation Primer

## What This Primer Is For

This primer is for projects and agents that create, modify, review, or work with agent skills — modular instruction packages that give AI agents specialized capabilities.

It is relevant for:
- agent framework development
- skill/plugin authoring
- lifecycle management systems
- review and quality systems
- any markdown/YAML instruction package for AI agents

Its purpose is to prevent common skill-design mistakes **before** they become review findings or production failures.

This primer is not a full skill-authoring manual.
It is a short guide to the structural habits and design posture that make skills reliable.

---

## Read This First

Most skill failures are not instruction failures. They are design failures.

The most common problem is not that the skill doesn't work — it's that the skill appears coherent while hiding:
- vague boundaries that let agents guess at limits
- missing failure handling that causes silent freezes
- implicit contracts the agent can't reliably follow
- stale references that the agent follows with confidence
- install shapes that don't match runtime expectations
- context bloat that crowds out the user's actual work

Your goal is not to make a skill that merely runs.
Your goal is to make a skill that works **predictably** — predictable install, predictable boundaries, predictable artifacts, predictable failures, predictable recovery.

> Good agent systems are less about clever prompts and more about clean contracts, explicit boundaries, durable state, and honest install/recovery behavior.

---

## The 10 Rules To Not Violate

1. **Contracts beat vibes.**
   Every important behavior should be an explicit contract, not an implied understanding. If the agent must do something specific, say it in the SKILL.md. If the output must have a specific format, provide a schema or template.

2. **Root shape matters.**
   The package must land in the workspace in the shape the runtime expects. If the agent needs `AGENTS.md` at root to wake up, `AGENTS.md` must be at root after unzip — not nested in a subfolder the user has to promote manually.

3. **Define boundaries explicitly.**
   State what the skill does AND what it does not do. "Be careful with deletions" is not a boundary. "Never delete files outside the target workspace" is a boundary.

4. **Handle failure while you build, not after.**
   Every step that can fail needs a defined failure path. "What happens if the archive is corrupt?" is a design question, not a QA question.

5. **The install experience is part of the product.**
   If the user has to manually move files, edit config, and cross-reference three docs before saying hi, the install is broken — no matter how good the internals are.

6. **Separate identities cleanly.**
   A lifecycle operator should not accidentally become the builder. A reviewer should not inherit the PM's workspace baggage. If roles matter, enforce them through distinct identity files and explicit boundaries.

7. **Use disposable execution environments for clean workflows.**
   Templates are read-only. Work happens in copies. This prevents state accumulation, enables concurrent runs, and keeps templates pristine.

8. **Manifests are core artifacts, not supporting docs.**
   A manifest locks what the build must become, what reviewers check for drift, and what contributors can rely on. A weak manifest creates long-term ambiguity that compounds through every phase.

9. **Workspace hygiene must be designed, not hoped for.**
   If you don't tell the agent where to put planning docs, research notes, and scratch files, it will scatter them at root. Define canonical homes for every content type.

10. **Optional features still need full design.**
    "Optional" does not mean "vague." Gate intent cheaply, detect only when opted in, degrade gracefully when tools are missing, and record capability state for downstream use.

---

## Common Early Mistakes

- Writing a SKILL.md as a knowledge dump instead of a step-by-step procedure
- Leaving boundaries implicit — "be careful" instead of "never modify X"
- Defining only the happy path with no failure handling or recovery guidance
- Explaining things the agent already knows (basic git, markdown syntax, file operations)
- Assuming files or tools exist without checking
- Scattering project files at workspace root instead of into defined directories
- Putting everything into one massive SKILL.md instead of using supporting files
- Shipping a package that requires manual file moving before the agent can function
- Duplicating config values across skill configs without noting the source of truth
- Promising resume/restart behavior that isn't actually implemented

---

## What To Think About Before You Start

### 1. What is the skill's single job?

- What problem does this skill solve?
- What does "done" look like after execution?
- What is explicitly NOT this skill's job?

A skill that does one thing well is more reliable than a skill that does three things approximately.

### 2. What does the agent need that it doesn't already have?

- What specialized knowledge does this add?
- What procedure would the agent get wrong without instructions?
- What can be cut because the agent already knows it?

The context window is a shared resource. Every token in a skill displaces a token from the user's actual work. Only add what the agent genuinely needs.

### 3. What can fail?

- Which steps depend on external state (files, tools, auth, network)?
- What happens when a step fails partway through a multi-step operation?
- How does the operator recover to a good state?

If you can't answer these questions, you're designing only the happy path.

### 4. What state does this skill touch?

- What files does it read? Write? Create? Delete?
- What must be true before execution starts?
- What must be true after execution finishes?
- What evidence should it leave behind?

Skills that touch state without documenting it create invisible coupling.

### 5. Who uses this skill?

- Is it restricted to a specific role (Team Lead only? PM-facing? Universal)?
- Does it launch isolated work that needs a clean environment?
- Does it need to be provisioned into child workspaces?

---

## Key Concepts

### Skill Structure

A skill is a directory with a required `SKILL.md` and optional supporting files:

```
skill-name/
├── SKILL.md              ← Required: main instruction file
├── config.yaml           ← Optional: skill-specific config
├── README.md             ← Optional: human-readable overview
├── install-instructions.md ← Optional: install + maintainer fallback
├── docs/                 ← Optional: supporting documentation
├── scripts/              ← Optional: deterministic executable logic
├── references/           ← Optional: read-only reference material
├── templates/            ← Optional: output format templates
├── schemas/              ← Optional: validation schemas
└── examples/             ← Optional: reference examples
```

### Three-Level Loading

Skills load progressively to conserve context:

- **Level 1 — Discovery (~100 tokens):** YAML frontmatter. Always loaded. Tells the agent the skill exists and when to use it.
- **Level 2 — Activation (<5K tokens):** SKILL.md body. Loaded when the skill is triggered.
- **Level 3 — Execution (on demand):** Supporting files loaded during execution as needed.

Example: a review skill's frontmatter says "Launch a staged review." The body has the 8-step procedure. The schemas, templates, and prompt contract are read only during execution.

### Triggers

- **Explicit:** slash commands (`/build`, `/verify`, `/review-project`)
- **Implicit:** phrase matching driven by the `description` field

The `description` is the most important line in the frontmatter. Write it for agent discovery, not for human browsing:

❌ `"Helps with reviews"`
✅ `"Launch a clean review run through a disposable copy of the review-system template using an explicit review-type overlay and scoped inputs."`

### Boundaries — Always / Ask First / Never

Every skill should define three tiers:

- ✅ **Always:** Actions taken without asking. "Always back up AGENTS.md before a mode swap."
- ⚠️ **Ask First:** High-impact actions needing confirmation. "Confirm before writing config.yaml."
- 🚫 **Never:** Hard stops. "Never modify the packaged review-system/ template directly."

Without explicit boundaries, agents guess at limits. Sometimes they guess wrong — and the damage is silent.

### Contracts

A skill's contract defines what it guarantees:

| Contract element | Example |
|-----------------|---------|
| Required inputs | project name, model alias |
| Required files | config.yaml must have `bootstrap_status: complete` |
| Outputs | Writes IDENTITY.md, updates config, creates plans/ |
| State changes | Sets slot status to `active` in config and registry |
| Failure behavior | If archive fails, stop before clearing anything |
| Recovery path | Delete partial workspace and re-run from scratch |

If it matters, encode it. Do not rely on the agent to "probably understand."

### Deterministic vs. Probabilistic

- **Agent decides:** interpretation, strategy, conversation, novel context
- **Script/template decides:** math, data parsing, API calls, rigid formatting, file checksums

Rule of thumb: if it must produce the same result every time, use a script or template, not prose instructions.

### Disposable Execution

For workflows that must stay clean and repeatable:
1. Copy from a read-only template
2. Execute inside the copy
3. Harvest outputs back to the canonical location
4. Clean up the copy (or preserve on failure for debugging)

This prevents templates from accumulating state and enables safe concurrent execution.

---

## Common Skill Patterns

### Lifecycle Skills (create / remove / restore / upgrade)
Archive before destroying. Use truth checks across multiple state sources. Verify provisioning with checklists. Wipe and re-provision for clean restores.

### Workflow Skills (plan → build → review)
Gate-based progression — stop if prerequisites are missing. Produce durable artifacts at each phase. Use whole-file replacement for mode swaps, not incremental edits.

### Operational Skills (verify / repair)
Read-only health checks that never modify anything. Categorize issues: auto-fixable vs. manual intervention. Confirm before applying repairs.

### Review Skills
Staged review with stop-on-first-non-pass. Disposable execution roots from read-only templates. Explicit overlay loading and scoped payloads. Structured artifact output validated against schemas.

### Publication Skills
Pre-publish checklists. Release branches for clean publication (never mutate the working branch). Disposable workspace guarantee — the published repo lives independently.

---

## When To Open The Best-Practice Docs

Open the full best-practice doc when you move from design into authoring.

Use:
- **Skill Creation Best Practices** during SKILL.md authoring, review, or refinement
- **Coding Best Practices** when the skill includes scripts or executable logic
- **Security Best Practices** when the skill touches secrets, auth, or trust boundaries
- **Production Best Practices** when the skill manages lifecycle state or deployment artifacts
- **Install / Uninstall Best Practices** when the skill defines install or bootstrap flows

---

## Quick Routing Guide

This primer is strongly recommended for:
- agent framework skill authoring
- lifecycle management system design
- review system design
- any markdown/YAML instruction package for AI agents

It is optional for:
- one-off simple skills with fewer than 20 lines of instruction
- skills that are thin wrappers around a single CLI command

If the skill manages state, launches isolated work, or participates in a lifecycle flow, this primer applies.

---

## Final Standard

Before starting skill creation, you should be able to say:

> I know what this skill's single job is, what its boundaries are, what can fail and how it recovers, what state it reads and writes, who uses it, and how it fits into the workspace without cluttering it.

If you cannot say that honestly, you are not ready to start writing the SKILL.md.

---

## Related Best Practices

- Skill Creation Best Practices
- Coding Best Practices
- Security Best Practices
- Production Best Practices
- Install / Uninstall Best Practices
- Project Planning Best Practices

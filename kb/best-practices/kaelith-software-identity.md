---
type: best-practices
best_practice_name: kaelith-software-identity
category: universal
version: 1.0
updated: 2026-03-01
tags: [branding]
status: draft-v1
---

# Kaelith Software Identity

## When To Use This

Use this document when creating, naming, renaming, restructuring, or aligning a Kaelith project so it fits cleanly into the broader Kaelith ecosystem.

Open it when you need to:
- name a new project
- decide whether a local convention should become a real standard
- make project identity visible in top-level docs
- align workspace/repo structure with Kaelith expectations
- reduce friction for cross-agent maintenance and handoff

This document supports the **Kaelith Identity & Branding Primer**, but it is more about operational coherence than surface aesthetics.

---

## What This Covers

This document covers:
- naming conventions
- project identity signals
- workspace and repo coherence
- ecosystem fit and discoverability
- README/metadata/front matter identity alignment
- avoiding one-off local conventions that do not scale

---

## Quick Index

- [Naming conventions](#naming-conventions)
- [Project summaries and scope signals](#project-summaries-and-scope-signals)
- [Workspace and repo structure signals](#workspace-and-repo-structure-signals)
- [Cross-project coherence](#cross-project-coherence)
- [Identity in README, metadata, and front matter](#identity-in-readme-metadata-and-front-matter)
- [Checklists](#checklists)

---

## Decision Guide

### Reuse a known pattern when
- the new project clearly belongs to an existing family
- naming can follow an already legible Kaelith pattern
- inventing novelty would create more translation cost than value

### Create a new naming/structure pattern when
- the project truly introduces a new category of work
- reusing an old pattern would actively mislead classification or maintenance
- the new pattern can be described clearly enough to repeat later

### Treat branding as operational when
- another agent needs to place the project quickly
- naming affects discoverability, routing, or ownership clarity
- documentation and structure need to reinforce ecosystem fit

---

## Core Rules

1. **Use Kaelith-consistent naming from the start.**  
   Late renaming creates unnecessary friction and ambiguity.

2. **Make project identity visible in top-level artifacts.**  
   README, metadata, summaries, and folder naming should all help place the project quickly.

3. **Prefer repeatable structure over novelty.**

4. **Keep workspace/repo structure legible to other agents.**

5. **Do not invent local conventions casually.**  
   If a rule exists only inside one session, it is usually not a good standard.

6. **Project summaries should clearly place the project in the ecosystem.**

7. **Cross-project references and ownership signals should be easy to infer.**

8. **Identity and documentation structure should reinforce each other.**

9. **Formatting drift is operational drift.**

10. **A Kaelith project should feel placeable, not isolated.**

---

## Common Failure Patterns

- inconsistent project naming across docs, folders, and metadata
- titles and summaries that do not make the project legible quickly
- folder or file conventions that only make sense to one author
- unclear ownership or placement within the Kaelith ecosystem
- outputs that feel structurally disconnected from other Kaelith work
- treating branding like cosmetic polish instead of operational clarity

---

## Naming Conventions

Naming should help another agent understand:
- what the project is
- how it relates to other work
- whether it belongs to a known family or pattern

### Good naming qualities
- clear
- stable
- legible in filenames and headings
- consistent across repo/docs/metadata
- aligned with the project’s real role

### Bad naming qualities
- over-clever
- vague
- inconsistent across surfaces
- locally meaningful but ecosystem-opaque
- changed casually without updating related artifacts

### Rule
A project name should reduce interpretation cost, not increase it.

---

## Project Summaries and Scope Signals

Every project should expose a concise description of:
- what it is
- what kind of work it does
- who it serves
- how it fits into Kaelith

### Good summary behavior
A strong summary should help a reader infer:
- project type
- likely owner or domain
- whether it is internal or external-facing
- how it relates to adjacent systems

### Bad summary behavior
- generic filler
- high-level ambition without concrete identity
- no mention of scope, role, or ecosystem fit

---

## Workspace and Repo Structure Signals

Structure should reinforce identity.

### Good structure signals
- top-level files expose project role and operating context
- docs are named and placed predictably
- important references are easy to locate
- structure looks compatible with other Kaelith work

### Bad structure signals
- one-off local folder patterns
- key identity docs hidden deep in the tree
- inconsistent naming between top-level artifacts
- project shape only understandable after deep exploration

### Rule
A workspace should communicate project identity before a reader has to reverse-engineer it.

---

## Cross-Project Coherence

Kaelith projects are easier to operate when they feel like members of one ecosystem.

### Coherence includes
- naming alignment
- similar structural signals
- consistent summary styles
- predictable top-level documentation conventions
- recognizable ownership and scope markers

### This does not mean
Every project must look identical.
The goal is shared legibility, not sterile sameness.

### Decision rule
Prefer consistency unless novelty produces clear, reusable benefit.

---

## Identity in README, Metadata, and Front Matter

Identity should not live in one place only.
It should reinforce itself across surfaces.

### README should help answer
- what is this project?
- why does it exist?
- how does it fit into Kaelith?

### Metadata/front matter should help answer
- what kind of document or system is this?
- what status is it in?
- what stable identity fields matter?

### Top-level docs should align on
- project name
- scope description
- ownership or responsibility signals
- placement in the wider ecosystem

### Rule
If README, metadata, and top-level structure tell different identity stories, the project is incoherent.

---

## OS / Environment Notes

This topic is mostly cross-environment.
Only introduce OS-specific notes if platform packaging, naming, or path behavior materially changes identity handling.

---

## Checklists

### New Project Identity Checklist
- [ ] Project name is clear and consistent
- [ ] Summary explains what the project is and where it fits
- [ ] Top-level structure reinforces identity
- [ ] README and metadata agree on project identity
- [ ] Another agent could place the project in Kaelith quickly

### Rename / Restructuring Sanity Checklist
- [ ] Names were updated consistently across docs and metadata
- [ ] Folder/file structure still matches the new identity
- [ ] Old naming is not lingering in confusing places
- [ ] Cross-project references still make sense

---

## Related Primers

- Kaelith Identity & Branding Primer
- Front Matter & Documentation Primer
- Project Planning Primer

---

## Related Best Practices

- Front Matter & Documentation Best Practices
- README Best Practices
- Project Planning Best Practices

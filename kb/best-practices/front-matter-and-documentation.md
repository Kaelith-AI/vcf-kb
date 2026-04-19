---
type: best-practices
best_practice_name: front-matter-and-documentation
category: universal
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Front Matter & Documentation Best Practices

## When To Use This

Use this document whenever you are creating or revising reusable documentation, defining front matter, designing catalogs, writing best-practice docs, building READMEs, or trying to make documentation searchable and maintainable for both humans and LLMs.

Open it when you need to:
- define a front matter schema
- structure a reusable doc cleanly
- improve navigation and searchability
- mark lifecycle/status clearly
- distinguish primers from best-practice docs, checklists, and archives
- make documentation continuation-safe for future agents

This is the deep-reference layer under the **Front Matter & Documentation Primer**.

---

## What This Covers

This document covers:
- front matter design
- required vs optional metadata
- titles, filenames, and headings
- hierarchy and navigation
- quick indexes and decision guides
- lifecycle/status handling
- cross-linking and document relationships
- writing for selective lookup and LLM retrieval

---

## Quick Index

- [Front matter schema design](#front-matter-schema-design)
- [Required vs optional metadata](#required-vs-optional-metadata)
- [Title and filename conventions](#title--filename-conventions)
- [Heading hierarchy and navigation](#heading-hierarchy-and-navigation)
- [Quick index and decision guide patterns](#quick-index--decision-guide-patterns)
- [Lifecycle and status handling](#lifecycle-and-status-handling)
- [Cross-links and doc relationships](#cross-links-and-doc-relationships)
- [Writing for selective lookup and LLM retrieval](#writing-for-selective-lookup-and-llm-retrieval)
- [Doc type distinctions](#primer-vs-bp-vs-checklist-vs-archive-distinctions)
- [Checklists](#checklists)

---

## Decision Guide

### Use front matter when
- metadata is likely to be filtered, routed, or interpreted by tools/agents
- the file needs explicit type/status/version signals
- a document belongs to a catalog or structured system

### Use body content when
- the information is explanatory or procedural rather than metadata
- the meaning depends on narrative or examples

### Split a document when
- one file is trying to serve multiple unrelated use cases
- headings are too broad to support targeted search
- the doc is becoming an essay instead of a reference
- lifecycle status differs across sections that should not age together

### Keep a document together when
- readers normally need the material as one operational unit
- splitting would create artificial fragmentation and navigation overhead

---

## Core Rules

1. **Every important document should declare what it is and when to use it.**

2. **Front matter should be meaningful, stable, and consistent.**  
   Metadata exists to help routing and interpretation.

3. **Use titles and filenames that expose purpose directly.**

4. **Heading hierarchy should support navigation and selective reading.**

5. **Status and lifecycle state should be visible.**

6. **Write for future agents, not only the current author.**

7. **Use quick indexes and decision guides when the document will be searched selectively.**

8. **Do not bury critical constraints in narrative-only prose.**

9. **Cross-link related docs intentionally.**

10. **Documentation structure is part of system quality.**

---

## Common Failure Patterns

- missing front matter on important structured docs
- inconsistent metadata fields across similar files
- vague titles like “notes” or “ideas” that reveal little purpose
- giant prose blocks with weak navigation
- flat heading hierarchies that make section targeting hard
- draft/stable/archive state not visible
- decisions buried in narrative without searchable anchors
- docs written as if the same agent will always return later

---

## Front Matter Schema Design

Front matter should be used where structured interpretation matters.

### Typical useful fields
- `type`
- `status`
- `version`
- `updated`
- `summary`
- `category`
- doc-specific stable identifiers such as `primer_name` or `best_practice_name`

### Rule
Only include fields that are likely to help routing, filtering, lifecycle management, or fast orientation.
Do not add decorative metadata with no use.

### Good property of front matter
Another agent should be able to infer the document’s role before reading the body.

---

## Required vs Optional Metadata

### Usually required on structured system docs
- type
- name/identifier
- status
- updated date

### Often useful
- version
- category
- short summary

### Use optional fields sparingly
Optional metadata is helpful only if:
- it will be interpreted later
- it supports search/routing
- it reduces ambiguity

If it adds noise without helping decisions, omit it.

---

## Title / Filename Conventions

### Titles should
- expose purpose clearly
- match the document’s real role
- avoid generic ambiguity

### Filenames should
- be predictable
- be searchable
- align with the title and doc type
- avoid local shorthand that other agents would not infer

### Good examples
- `Project-Planning-PRIMER.md`
- `Front-Matter-and-Documentation-Best-Practices.md`
- `bootstrap-routing-spec.md`

### Bad examples
- `notes.md`
- `new-idea-final-v2.md`
- `misc-thoughts.md`

---

## Heading Hierarchy and Navigation

Heading structure should help targeted reading.

### Recommended pattern
- `#` for document title
- `##` for major sections
- `###` for subsections under a major section

### Why it matters
Agents and humans both rely on headings to:
- skim structure quickly
- jump to the right section
- quote or link stable anchors
- distinguish overview from detail

### Rule
Do not flatten everything to the same level.
Do not skip hierarchy unless the document is extremely short.

---

## Quick Index / Decision Guide Patterns

Use a **Quick Index** when:
- the document is large
- the content will be searched selectively
- multiple kinds of readers need different sections

Use a **Decision Guide** when:
- readers need help choosing between options
- the doc supports planning or operational branching
- the biggest failure mode is bad early choice rather than missing detail

These two sections greatly improve LLM navigation and human skim value.

---

## Lifecycle and Status Handling

Important structured docs should make lifecycle visible.

### Common useful statuses
- draft
- stable
- review-needed
- deferred
- archived
- example
- deprecated

### Rule
If the reader cannot tell whether the doc is active, canonical, or historical, the documentation system will drift.

### Lifecycle questions
- Is this still being shaped?
- Is it the version new work should follow?
- Has it been superseded?
- Is it only an example?

---

## Cross-Links and Doc Relationships

Documentation should behave like a system, not a pile.

### Good cross-link behavior
- primers point to best-practice docs
- best-practice docs point back to primers
- catalogs and specs point to each other when they depend on one another
- closely related docs identify adjacent references

### Avoid
- orphan docs with no visible entry points
- duplicate guidance across multiple files with no distinction
- one-way linking where readers cannot discover the related deeper layer

---

## Writing for Selective Lookup and LLM Retrieval

Write documents so a model or human can retrieve only the needed section.

### Good retrieval properties
- stable headings
- predictable section names
- concise section openings
- strong keyword overlap with likely search terms
- checklists and decision guides near the end or top as appropriate
- explicit anti-pattern sections

### Avoid
- long narrative passages with weak anchors
- clever headings that hide the actual topic
- important rules stated once in buried prose

### Rule
If the document only works when read from top to bottom, it is usually too essay-shaped for operational use.

---

## Primer vs BP vs Checklist vs Archive Distinctions

### Primer
- short
- preventive
- mindset and routing focused
- read early

### Best-practice doc
- deeper
- execution-time reference
- searchable and sectioned
- opened when relevant work begins

### Checklist
- compact operational verification tool
- often used during execution or review
- should not replace explanation-heavy docs

### Archive
- historical record
- not the current standard
- should be clearly marked so it is not mistaken for active guidance

### Rule
Do not mix all four roles into one file unless there is a compelling reason.

---

## OS / Environment Notes

### macOS
Be careful only to include macOS-specific notes where filesystem, packaging, naming, or path behavior truly differs.

### Linux
Linux-specific notes are most useful when paths, service behavior, permissions, or runtime conventions change how the doc should be followed.

### Windows
Windows notes matter when filenames, path behavior, packaging, scripts, or install constraints differ materially.

### Rule
Do not add empty OS sections just because the template allows them.
Use them only when the variation is meaningful.

---

## Checklists

### Document Structure Checklist
- [ ] The document declares what it is and when to use it
- [ ] Major sections are clearly separated
- [ ] Heading hierarchy is consistent
- [ ] A reader can skim structure quickly

### Front Matter Checklist
- [ ] Front matter exists where structured interpretation matters
- [ ] Metadata fields are meaningful, not decorative
- [ ] Status and updated date are visible
- [ ] Type/name identifiers are stable

### Searchability Checklist
- [ ] Titles and filenames expose purpose clearly
- [ ] Important rules are under searchable headings
- [ ] Quick Index or Decision Guide exists where useful
- [ ] The doc supports selective retrieval, not only linear reading

### Publish / Stabilize / Archive Checklist
- [ ] Status is correct
- [ ] Related docs are linked
- [ ] Draft/stable/archive state is unambiguous
- [ ] The file is not duplicating another doc without purpose

---

## Related Primers

- Front Matter & Documentation Primer
- Kaelith Identity & Branding Primer
- Project Planning Primer
- Library / SDK Primer

---

## Related Best Practices

- README Best Practices
- Kaelith Software Identity
- Project Planning Best Practices

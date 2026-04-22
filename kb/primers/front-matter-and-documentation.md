---
type: primer
primer_name: front-matter-and-documentation
category: universal
version: 1.0
updated: 2026-03-01
tags: [documentation, schema-design, maintainability]
status: draft-v1
---

# Front Matter & Documentation Primer

## What This Primer Is For

This primer prepares a PM to keep project documentation structured, searchable, and usable by other agents from the beginning.

It exists because many projects do not fail only from bad implementation.
They also fail because:
- important context is missing
- metadata is inconsistent
- docs cannot be searched cleanly
- outputs are written for the current author only
- future agents cannot tell what the file is for, when to use it, or how current it is

This primer is about making documentation operationally useful, not merely present.

---

## Read This First

If the structure is bad, the intelligence in the system gets wasted.

A strong project can still become hard to operate if:
- front matter is missing or inconsistent
- titles and headings are vague
- files are written as linear essays instead of navigable references
- nobody can tell whether a document is current, final, draft, or historical
- future agents must reread everything because the docs do not expose their own structure

Documentation is part of the system.
Searchability is part of quality.
Metadata is part of maintainability.

---

## The 5–10 Rules To Not Violate

1. **Every important document should explain what it is and when to use it.**

2. **Front matter should be consistent and meaningful.**  
   Metadata should help routing, not just exist for decoration.

3. **Write for future agents, not just current context.**  
   Another agent should be able to pick up the work without guessing what the file is for.

4. **Prefer navigable structure over giant prose blocks.**  
   Headings, indexes, and predictable sections matter.

5. **Make status visible.**  
   Draft, stable, archived, example, and deprecated states should not be ambiguous.

6. **Use filenames and headings that expose purpose clearly.**  
   Generic names create friction and routing mistakes.

7. **Put summary-level guidance near the top.**  
   Let readers know quickly whether they are in the right document.

8. **If a document should be searched selectively, design it for that.**  
   Indexes, stable headings, OS/platform sections, and checklists matter.

9. **Do not bury critical decisions in narrative-only text.**  
   Important constraints and routing guidance should be easy to locate.

10. **Documentation debt becomes operational debt.**

---

## Common Early Mistakes

- missing front matter entirely
- inconsistent metadata fields across documents
- titles that do not clearly communicate purpose
- long documents with no quick index or section map
- writing docs as if the same agent will always be the only reader
- failing to mark draft vs stable vs archived clearly
- mixing instructions, rationale, examples, and status in ways that are hard to search

---

## What To Think About Before You Start

### 1. Purpose
Ask:
- what is this document for?
- who should read it?
- when should they read it?

### 2. Metadata
Ask:
- what fields should front matter expose?
- what status does this file need?
- what routing or filtering may depend on this metadata later?

### 3. Searchability
Ask:
- will future agents need the whole document, or just sections?
- what headings should be stable and predictable?
- does this need an index, checklist, or OS/platform subsections?

### 4. Lifecycle
Ask:
- is this a draft, stable reference, plan, template, example, or archive?
- how will readers know when it becomes outdated?

### 5. Relationship to other docs
Ask:
- what should this link to?
- what should link back to it?
- what is primer-level vs best-practice-level here?

---

## When To Open The Best-Practice Docs

Open deeper documentation guidance when you begin:
- creating reusable references
- writing READMEs
- building searchable best-practice docs
- defining front matter standards
- structuring catalogs, checklists, indexes, or operating docs

This primer is the orientation layer.
The deeper docs should guide the actual structural standard.

---

## Related Best Practices

Primary follow-up docs:
- Front Matter & Documentation Best Practices
- README Best Practices
- Project Planning Best Practices
- Kaelith Software Identity

---

## Quick Routing Guide

This primer is especially important for:
- `library-sdk`
- `content-marketing-project`
- prep-system and review-system work
- any project producing reusable reference docs, checklists, templates, or catalogs

It should eventually become part of the universal baseline once the best-practice support docs are ready.

---

## Final Standard

Before producing significant documentation, you should be able to say:

> I know what this document is for, how its metadata should work, how another agent will navigate it, and how to structure it so it stays searchable and useful over time.

If you cannot say that honestly, the documentation structure is not ready yet.

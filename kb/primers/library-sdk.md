---
type: primer
primer_name: library-sdk
category: type
version: 1.0
updated: 2026-03-01
tags: [api-design, packaging, npm, dx]
status: draft-v1
---

# Library / SDK Primer

## What This Primer Is For

This primer prepares a PM to avoid treating a library or SDK like an application.

It is for projects whose real product is:
- an interface
- a reusable package
- a shared module
- a developer-facing dependency
- a toolkit other projects will build on top of

Its goal is to prevent the most common library mistake: building something that technically works, but is unstable, unclear, hard to adopt, or unsafe to version.

---

## Read This First

Libraries are different from apps.

The library’s primary product is not the internal implementation.
It is the external surface:
- API shape
- naming
- behavior guarantees
- examples
- defaults
- versioning discipline
- documentation clarity
- compatibility expectations

A library can have excellent code and still be a bad library.

If an app is confusing internally, a maintainer struggles.
If a library is confusing externally, every consumer struggles.

---

## The 5–10 Rules To Not Violate

1. **Design the public interface on purpose.**  
   Do not let the exported API become accidental residue from internal implementation.

2. **Optimize for consumer clarity, not just internal convenience.**  
   A library succeeds when others can use it safely.

3. **Keep the public surface small and stable.**  
   Every exported symbol becomes future maintenance cost.

4. **Document behavior like a contract.**  
   Inputs, outputs, defaults, failure behavior, and examples must be explicit.

5. **Treat versioning as product behavior.**  
   Breaking consumers casually is a product failure.

6. **Do not hide complexity in unclear defaults.**  
   Opaque default behavior makes adoption easy once and maintenance hard forever.

7. **Make examples and README quality part of the real deliverable.**  
   A library without good examples is barely usable.

8. **Compatibility claims must be real.**  
   OS/runtime/tooling/version support should not be implied casually.

9. **Test the contract, not just the internals.**  
   Consumer-facing behavior matters more than implementation self-esteem.

10. **Assume downstream users do not know your internal intent.**

---

## Common Early Mistakes

- exporting too much because it is easier than deciding what should be public
- writing docs after the interface is already unstable
- using application-style architecture and naming for a library product
- not deciding compatibility/versioning expectations early
- writing examples that only work in the author’s environment
- letting internal refactors leak into consumer-facing behavior casually
- providing vague README/setup guidance that makes adoption harder than it should be

---

## What To Think About Before You Start

### 1. Public interface
Ask:
- what is actually public?
- what should remain internal?
- what are the minimal stable entry points?

### 2. Consumer expectations
Ask:
- who uses this?
- what will they assume from names, defaults, and examples?
- what mistakes are they likely to make if the interface is unclear?

### 3. Versioning and compatibility
Ask:
- what runtime/platform/tooling environments are supported?
- what counts as a breaking change?
- how will compatibility claims be documented?

### 4. Documentation deliverables
Ask:
- what must the README explain?
- what examples are essential?
- what setup assumptions need to be explicit?

### 5. Verification
Ask:
- are you testing the public contract or just the internal implementation?
- what proves the library is safe to upgrade or adopt?

---

## When To Open The Best-Practice Docs

Open deeper guidance when you begin:
- defining exported interfaces
- writing README and examples
- making compatibility/versioning decisions
- preparing packaging or release flows
- designing migration or deprecation behavior

Library work should reference deeper docs earlier than app work, because the external contract is the product.

---

## Related Best Practices

Primary follow-up docs:
- Library / SDK Best Practices
- README Best Practices
- Front Matter & Documentation Best Practices
- Versioning / Migration Best Practices
- Coding Best Practices

---

## Quick Routing Guide

This primer is strongly recommended for:
- `library-sdk`

It may also be useful for:
- reusable internal toolkits
- shared modules that multiple projects depend on
- packages that are “not quite a library yet” but are clearly on that path

It should usually replace, not duplicate, the default app-oriented coding mindset unless the project is truly mixed.

---

## Final Standard

Before building deeply into a library or SDK, you should be able to say:

> I know what the public interface is, who it is for, what compatibility I am claiming, what the README/examples must teach, and how to avoid accidental API sprawl or breaking-change chaos.

If you cannot say that honestly, you are not ready to shape the library.

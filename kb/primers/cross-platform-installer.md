---
type: primer
primer_name: cross-platform-installer
category: toolchain
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Cross-Platform Installer Primer

## What This Primer Is For

This primer prepares a PM to design installers and setup flows that work across platforms without hiding platform-specific failure behind a fake “universal” experience.

It is relevant when a project:
- installs on macOS, Linux, and/or Windows
- ships bootstrap scripts, setup flows, or first-run installers
- needs OS-aware dependency, path, permission, or service behavior
- claims cross-platform support to users or internal operators

Its purpose is to prevent “cross-platform” from meaning “works on the author’s machine plus hope.”

---

## Read This First

Cross-platform installer work fails when one setup path is treated like the default reality and the others are patched later.

The most common early mistake is designing one happy-path install flow and assuming platform adaptation is mostly syntax.
It is not.

Platform differences change:
- paths and filesystem rules
- shell and script behavior
- permissions and elevation
- service management
- packaging expectations
- environment/config placement
- uninstall and cleanup behavior
- user trust and platform conventions

A good installer flow respects platform differences without becoming chaotic.

---

## The 5–10 Rules To Not Violate

1. **Do not claim support you have not really designed for.**

2. **Treat each platform as a real runtime environment, not a translation layer.**

3. **Install, update, and uninstall all matter.**  
   A smooth install with messy removal is not a good installer story.

4. **Paths, permissions, and shell assumptions must be explicit.**

5. **Platform-native expectations matter.**  
   Users notice when setup behaves like it came from another OS.

6. **Cross-platform should not mean identical at all costs.**  
   Consistent intent matters more than identical mechanics.

7. **Fail clearly when a platform requirement is unmet.**

8. **Do not bury platform-specific logic in unstructured script sprawl.**

9. **Installer behavior should leave the system understandable afterward.**

10. **Support claims are part of product trust.**

---

## Common Early Mistakes

- designing around one OS and backfilling the others later
- assuming paths, shells, and quoting work the same everywhere
- unclear privilege/elevation requirements
- not deciding where config, logs, binaries, or data should live per platform
- weak uninstall/cleanup thinking
- shipping scripts that technically run but do not match platform conventions
- using “cross-platform” language before support boundaries are actually real

---

## What To Think About Before You Start

### 1. Support scope
Ask:
- which OSes are truly supported?
- what versions or environments matter?
- what is explicitly out of scope?

### 2. Install model
Ask:
- is this a bootstrap script, package installer, first-run setup, or mixed path?
- what is the expected user journey on each platform?

### 3. Filesystem and config placement
Ask:
- where do binaries, config, logs, caches, and state live on each OS?
- what is platform-native versus merely convenient?

### 4. Privilege and services
Ask:
- when is elevation required?
- are services/background processes involved?
- how does each OS handle that lifecycle?

### 5. Removal and recovery
Ask:
- how does uninstall work?
- what is preserved versus removed?
- how does the user recover from a partial failed install?

---

## When To Open The Best-Practice Docs

Open deeper install/platform guidance when you begin:
- authoring install scripts
- mapping per-OS filesystem conventions
- handling background services or startup integration
- designing uninstall/update flows
- defining support boundaries and test matrices

This primer is the preventive alignment layer.
The deeper docs should define the platform-specific standards.

---

## Related Best Practices

Primary follow-up docs:
- Install / Uninstall Best Practices
- Cross-Platform Installer Best Practices
- Production Best Practices
- Security Best Practices
- macOS / Linux / Windows platform references as relevant

---

## Quick Routing Guide

This primer is especially important when:
- a project claims `cross-platform`
- installer/setup UX is part of the product surface
- OS-specific paths, services, or permission models matter

It commonly pairs with:
- Production
- Front Matter & Documentation
- Docker Compose / Systemd / Nginx where relevant
- platform lenses and platform best-practice references

---

## Final Standard

Before claiming a project has a cross-platform installer/setup story, you should be able to say:

> I know which platforms are really supported, how install/update/uninstall behave on each one, where files and config live, what privilege assumptions exist, and how another operator would understand the support boundary honestly.

If you cannot say that honestly, the installer story is not ready.

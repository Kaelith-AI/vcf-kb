---
type: primer
primer_name: coding
category: type
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Coding Primer

## What This Primer Is For

This primer is for projects where implementation quality is a major risk surface:
- web apps
- desktop apps
- mobile apps
- APIs
- internal tools
- some automations

Its purpose is to prevent common coding mistakes **before** they become review findings.

This primer is not a full coding manual.
It is a short guide to the planning habits and implementation posture that avoid obvious later failures.

---

## Read This First

Vibe-coded projects often look better than they are.
The most common problem is not that nothing works — it is that the code appears coherent while hiding:
- fragile structure
- fake-green verification
- duplicated logic
- unhandled edge cases
- environment assumptions
- generated residue that no one fully understands

Your goal is not to make the code merely run.
Your goal is to make it understandable, verifiable, and safe to change.

---

## The 5–10 Rules To Not Violate

1. **Do not build before you know the project shape.**  
   Coding quality starts with correct project framing.

2. **Prefer boring, explicit structure over clever generated sprawl.**  
   Future maintainability matters more than showing range.

3. **Keep responsibilities separated early.**  
   UI, business logic, integration code, state handling, and config should not collapse into one undifferentiated mass.

4. **Treat verification as real or not at all.**  
   A test/build/lint badge that proves nothing is worse than saying nothing.

5. **Handle failure paths while you build, not after.**  
   Happy-path-only code becomes review debt immediately.

6. **Avoid generated duplication.**  
   Repeated near-identical logic is one of the biggest vibe-code traps.

7. **Name things for meaning, not temporary local convenience.**  
   Good names reduce future logic mistakes and review churn.

8. **Assume your first implementation will need to be changed.**  
   Structure the code so that change is possible without fear.

9. **Do not smuggle environment assumptions into the code.**  
   Paths, hosts, OS behavior, and local tools should not be hardcoded casually.

10. **Leave clear review evidence.**  
   Another agent should be able to tell what the system does without reconstructing your intent from fragments.

---

## Common Early Mistakes

- mixing UI, state, and external integration logic in the same file
- adding tests or lint just to appear compliant without meaningful coverage
- handling only success paths while postponing real failure logic
- copying generated code instead of extracting shared patterns
- choosing names that reflect the last prompt rather than the real domain
- hardcoding local paths, hosts, or assumptions into implementation
- leaving TODOs, placeholders, and generated junk in core code paths

---

## What To Think About Before You Start

### 1. Structure first
Ask:
- what are the main layers or modules?
- what should stay separate from the beginning?
- what data or service boundaries need to remain explicit?

### 2. Verification strategy
Ask:
- what will prove this works?
- what counts as meaningful tests or verification here?
- how will someone else know the green signals are real?

### 3. Failure paths
Ask:
- what can fail?
- what should happen when it does?
- which errors need to be visible, recoverable, or retriable?

### 4. Change safety
Ask:
- if a requirement changes tomorrow, where will the damage spread?
- what coupling can I avoid now?

### 5. Platform and environment assumptions
Ask:
- what runtime or OS assumptions am I making?
- should those be configurable, abstracted, or documented more clearly?

---

## When To Open The Best-Practice Docs

Open the full best-practice docs when you move from planning into implementation.

Use:
- **Coding Best Practices** before major implementation work
- **Production Best Practices** when runtime, deployability, or observability enters the design
- **Security Best Practices** before auth, secrets, external providers, or trust boundaries are implemented
- platform best-practice sections when OS/runtime specifics matter

You do not need to read every deep doc now.
You do need to know that implementation should be guided by them, not improvised from scratch each time.

---

## Related Best Practices

Primary follow-up docs:
- Coding Best Practices
- Security Best Practices
- Production Best Practices
- Install / Uninstall Best Practices
- Front Matter & Documentation Best Practices

---

## Quick Routing Guide

This primer is strongly recommended for:
- `application-web`
- `application-desktop`
- `application-mobile`
- `internal-tool`
- `api-service`

It is optional for:
- `automation-workflow` when substantial code is being written
- `library-sdk` only if the project behaves more like an app than a true library

If the project is cross-platform, self-hosted, or integration-heavy, expect platform/security/production references to matter soon after this primer.

---

## Final Standard

Before starting implementation, you should be able to say:

> I know how this codebase should be structured, what meaningful verification will look like, where failure handling must exist, and how to avoid the common vibe-code traps that make the project fragile later.

If you cannot say that honestly, you are not ready to start coding.

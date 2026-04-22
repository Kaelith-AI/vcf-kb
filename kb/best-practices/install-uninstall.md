---
type: best-practices
best_practice_name: install-uninstall
category: deployment
version: 1.0
updated: 2026-03-01
tags: [packaging, cli-ux, cross-platform]
status: draft-v1
---

# Install / Uninstall Best Practices

## When To Use This

Use this document when designing install, update, first-run setup, uninstall, repair, or cleanup flows—especially when platform-specific behavior or support expectations matter.

Open it when you need to:
- design install/update/uninstall as one lifecycle
- decide where files, config, logs, and state live
- define privilege/elevation requirements
- create repair/retry behavior for partial installs
- make support claims about setup simplicity or cross-platform support honest

This is the deeper reference beneath the **Cross-Platform Installer Primer** and adjacent deployment/runtime docs.

---

## What This Covers

This document covers:
- install lifecycle design
- update/upgrade behavior
- uninstall and cleanup boundaries
- files, config, logs, and durable state placement
- privilege/elevation model
- repair/retry/partial-failure recovery
- platform support and expectation-setting
- install-quality release gates

---

## Quick Index

- [Install lifecycle design](#install-lifecycle-design)
- [Update and upgrade behavior](#update-and-upgrade-behavior)
- [Uninstall and cleanup boundaries](#uninstall-and-cleanup-boundaries)
- [Files config logs and durable state placement](#files-config-logs-and-durable-state-placement)
- [Privilege and elevation model](#privilege-and-elevation-model)
- [Repair retry and partial-failure recovery](#repair-retry-and-partial-failure-recovery)
- [Platform support and expectation-setting](#platform-support-and-expectation-setting)
- [Install-quality checklist and release gate](#install-quality-checklist-and-release-gate)
- [Checklists](#checklists)

---

## Decision Guide

### A bootstrap script may be enough when
- the environment is narrow and controlled
- the install steps are simple and transparent
- support expectations are modest and explicit

### A real installer/package path is warranted when
- end-user setup is part of the product experience
- platform-native expectations matter
- update/uninstall behavior must be reliable and understandable
- privilege, services, or background processes are involved

### Preserve state on uninstall when
- user data should survive product removal
- the product promises recoverability or reinstallation continuity
- destructive removal would violate user/operator expectation

### Remove state on uninstall only when
- the behavior is clearly signaled
- the user/operator can choose it knowingly
- the product domain makes full cleanup the obvious expectation

---

## Core Rules

1. **Install, update, and uninstall are one lifecycle.**

2. **File placement should follow platform expectations.**

3. **Privilege requirements must be explicit.**

4. **Failed or partial installs need a recovery path.**

5. **Support claims must match the real install experience.**

6. **Uninstall behavior should be understandable, not surprising.**

7. **Logs, config, caches, and durable state should not be mixed carelessly.**

8. **Platform-native expectations matter more than artificial uniformity.**

9. **Installers should leave the system legible afterward.**

10. **A smooth install does not excuse a broken update or uninstall story.**

---

## Common Failure Patterns

- install works once but update or uninstall is chaotic
- unclear data/config/log/state placement
- hidden privilege requirements that only appear on failure
- cleanup that removes too much or too little without warning
- scripts that technically work but violate platform norms
- partial installs with no repair path
- cross-platform support claims that were not intentionally designed

---

## Install Lifecycle Design

An install path should be understandable as a sequence, not an opaque convenience layer.

### Good install posture
- prerequisites are explicit
- file placement is intentional
- first-run requirements are visible
- the resulting system is explainable afterward

### Rule
If another operator cannot explain what the installer changed, the install flow is too opaque.

---

## Update / Upgrade Behavior

Updates should be treated as an expected operational event.

### Good update behavior
- preserves what should be preserved
- changes what should be changed predictably
- respects version/compatibility expectations
- does not silently create config or state drift

### Rule
If updates are risky because the original install scattered responsibilities opaquely, the lifecycle model is weak.

---

## Uninstall and Cleanup Boundaries

Uninstall should answer:
- what gets removed?
- what stays behind?
- what happens to user data?
- what happens to config?
- what happens to background services or scheduled tasks?

### Good uninstall behavior
- clear
- minimally surprising
- aligned with platform norms
- explicit about preserved versus removed state

### Rule
Users and operators should not need to reverse-engineer what uninstall means.

---

## Files, Config, Logs, and Durable State Placement

Different kinds of artifacts should not be lumped together carelessly.

### Keep distinct where possible
- binaries/executables
- configuration
- logs
- caches
- durable user or service state

### Rule
If you cannot easily answer where each category lives on each supported platform, the install design is incomplete.

---

## Privilege / Elevation Model

Privilege should be explicit before install begins.

### Good elevation posture
- the user/operator knows when elevation is needed
- privilege is requested only when justified
- install steps do not quietly assume broad system access
- service/background-process requirements are understood

### Rule
Unexpected elevation prompts or silent permission assumptions erode trust quickly.

---

## Repair / Retry / Partial-Failure Recovery

Install flows fail in the real world.

### Good repair posture
- failed installs can be retried safely
- partial state can be detected or cleaned up
- operators know what to do next
- repair guidance exists for predictable failure cases

### Rule
An install flow that only works perfectly on the happy path is not ready for broad support claims.

---

## Platform Support and Expectation-Setting

Cross-platform support is a trust claim.

### Good expectation-setting
- supported OSes are explicit
- unsupported or partially supported paths are named honestly
- platform differences are documented only where meaningful
- install UX fits the expectations of that platform reasonably well

### Rule
Do not claim cross-platform support because the script happens to run once on multiple machines.

---

## Install-Quality Checklist and Release Gate

Before claiming the install story is solid, confirm:
- install is understandable
- update path is credible
- uninstall behavior is clear
- file/state placement is intentional
- privilege assumptions are explicit
- partial failure can be recovered from
- support claims match the real experience

---

## OS / Environment Notes

### macOS
Respect platform-native locations, signing/trust expectations where relevant, and avoid making the experience feel like a Linux script awkwardly transplanted.

### Linux
Package, service, config, and filesystem conventions strongly affect whether install feels coherent and supportable.

### Windows
Installer UX, elevation prompts, paths, service behavior, and uninstall expectations are especially visible and trust-sensitive.

---

## Checklists

### Install-Design Checklist
- [ ] Install flow is understandable end-to-end
- [ ] File placement is intentional
- [ ] First-run assumptions are explicit
- [ ] Platform support scope is honest

### Uninstall / Cleanup Checklist
- [ ] Removal boundaries are explicit
- [ ] Preserved vs removed state is clear
- [ ] Services/tasks/processes are cleaned up appropriately
- [ ] Cleanup behavior matches expectation

### Privilege / Elevation Checklist
- [ ] Elevation needs are explicit
- [ ] Install does not assume unnecessary privilege
- [ ] Sensitive or system-wide changes are justified
- [ ] Background service implications are understood

### Support-Claim Checklist
- [ ] Cross-platform claims are real
- [ ] Update path is credible
- [ ] Repair/retry path exists
- [ ] Another operator could support this install story honestly

---

## Related Primers

- Cross-Platform Installer Primer
- Production Primer
- Systemd Primer
- Docker Compose Primer
- Nginx Primer

---

## Related Best Practices

- Production Best Practices
- Front Matter & Documentation Best Practices
- Cross-Platform Installer Best Practices
- Incident / Rollback / Recovery Best Practices
- Security Best Practices

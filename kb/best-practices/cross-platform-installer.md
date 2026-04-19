---
type: best-practices
best_practice_name: cross-platform-installer
category: runtime
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Cross-Platform Installer Best Practices

## When To Use This

Use this document when a project ships an installer, guided setup flow, bootstrap script, or first-run experience across multiple operating systems and needs predictable, supportable, and honest install behavior.

Open it when you need to:
- define supported platforms and support boundaries clearly
- design install/update/uninstall flows across macOS, Linux, and Windows
- decide where files, config, logs, and data belong on each OS
- handle permissions, services, and prerequisites safely
- make rollback, repair, and uninstall behavior understandable
- avoid fake “universal” installers that hide real platform differences

This is the deeper execution reference under the Cross-Platform Installer primer.

---

## What This Covers

This document covers:
- install scope, support boundary, and success criteria
- prerequisites, paths, permissions, and OS integration
- service setup, startup behavior, and runtime hooks
- upgrade, repair, uninstall, and rollback behavior
- user/operator messaging and troubleshooting clarity
- platform-specific differences that must stay explicit

---

## Quick Index

- [Install scope support boundary and success criteria](#install-scope-support-boundary-and-success-criteria)
- [Prerequisites paths permissions and os integration](#prerequisites-paths-permissions-and-os-integration)
- [Service setup startup behavior and runtime hooks](#service-setup-startup-behavior-and-runtime-hooks)
- [Upgrade repair uninstall and rollback behavior](#upgrade-repair-uninstall-and-rollback-behavior)
- [User operator messaging and troubleshooting clarity](#user-operator-messaging-and-troubleshooting-clarity)
- [Platform-specific differences that must stay explicit](#platform-specific-differences-that-must-stay-explicit)
- [Checklists](#checklists)

---

## Decision Guide

### Use a shared installer strategy when
- supported platforms share the same product intent even if mechanics differ
- platform-specific behavior can be documented cleanly without pretending it is identical
- support and testing are strong enough to justify shared branding and workflow expectations

### Split flows more aggressively when
- filesystem, permission, service, or packaging behavior differs materially
- a generic abstraction is hiding real operator risk
- troubleshooting and support become harder because platform behavior is being normalized artificially

### Tighten support boundaries when
- a platform is only “theoretically supported”
- uninstall, repair, or rollback behavior is not designed yet
- install docs describe a path no real OS experience actually matches

---

## Core Rules

1. **Do not claim support you have not really designed and tested for.**

2. **Platform differences should be made explicit, not hand-waved away.**

3. **Install, update, uninstall, and rollback all matter.**

4. **Paths, permissions, and elevation requirements should be understandable.**

5. **Install behavior should leave the system legible afterward.**

6. **Upgrade behavior should avoid surprise and silent breakage.**

7. **Uninstall should remove what it claims and preserve what it promises to preserve.**

8. **Service and startup effects should be obvious to the operator.**

9. **User trust depends on honest support boundaries.**

10. **Cross-platform consistency should preserve intent, not force identical mechanics.**

---

## Common Failure Patterns

- designing around one OS and treating the others as backfilled edge cases
- assuming paths, quoting, shells, and privileges behave the same everywhere
- installers that do too much without explaining changes to the system
- weak cleanup or removal behavior that leaves confusing remnants
- upgrade flows that silently break prior setups or data paths
- generic documentation that does not match any platform’s actual experience
- “supported everywhere” language that exceeds the tested reality

---

## Install Scope, Support Boundary, and Success Criteria

Cross-platform installation starts with honest scope.

### Good posture
- define which OSes and versions are truly supported
- state what success means on each platform
- distinguish full support, limited support, and unsupported environments clearly

### Rule
If support scope is vague, installer quality will drift behind the claim.

---

## Prerequisites, Paths, Permissions, and OS Integration

Platform-native expectations matter.

### Good posture
- place files, config, logs, and data where operators can reason about them on that OS
- make privilege elevation explicit
- surface prerequisites early rather than failing deep into install flow
- keep path assumptions structured and documented

### Rule
A setup flow that hides path or privilege behavior creates long-term support pain.

---

## Service Setup, Startup Behavior, and Runtime Hooks

Installers often create runtime side effects.

### Good posture
- describe whether services, login items, startup tasks, or scheduled behaviors are being created
- map startup behavior clearly per platform
- separate install logic from runtime orchestration where possible

### Rule
If the installer changes runtime behavior invisibly, operators lose trust quickly.

---

## Upgrade, Repair, Uninstall, and Rollback Behavior

The full lifecycle matters more than the happy path.

### Good posture
- define what upgrade preserves and what it changes
- provide repair/recovery paths for partial failure
- make uninstall and rollback outcomes explicit
- protect important user/operator data intentionally

### Rule
An install story is incomplete until removal and recovery are understood too.

---

## User/Operator Messaging and Troubleshooting Clarity

Supportability is part of installer design.

### Good posture
- error messages explain what failed and what to do next
- platform-specific troubleshooting guidance is available
- documentation reflects real workflow differences across OSes
- expectations about support scope are visible before failure

### Rule
If operators cannot tell what the installer changed or why it failed, the design is too opaque.

---

## Platform-Specific Differences That Must Stay Explicit

Avoid false sameness.

### Good posture
- preserve common intent while exposing real mechanical differences
- document where installer behavior diverges by OS for valid reasons
- keep platform-specific logic structured instead of scattered through script sprawl

### Rule
Abstraction should reduce confusion, not erase necessary truth.

---

## OS / Environment Notes

### macOS
App bundles, signing/notarization expectations, launch agents/daemons, path norms, and user trust around installer behavior often matter strongly here.

### Linux
Package format, distro variance, service-manager integration, filesystem layout, and shell/runtime assumptions matter most here.

### Windows
Installer UX, service registration, path conventions, privilege/elevation flows, registry effects, and removal expectations matter strongly here.

---

## Checklists

### Installer-Scope Checklist
- [ ] Supported platforms and versions are explicit
- [ ] Success criteria are defined per platform
- [ ] Support claims match tested reality
- [ ] Unsupported cases are stated honestly

### OS-Variance Checklist
- [ ] Paths and filesystem expectations are documented per OS
- [ ] Privilege/elevation needs are explicit
- [ ] Service/startup behavior is clear per platform
- [ ] Platform-specific logic is structured rather than ad hoc

### Upgrade / Uninstall Checklist
- [ ] Upgrade behavior is predictable
- [ ] Repair/recovery path exists for partial failure
- [ ] Uninstall removes what it claims to remove
- [ ] Data preservation/removal promises are explicit

### Supportability Checklist
- [ ] Error messages are useful
- [ ] Troubleshooting guidance reflects real platform differences
- [ ] Another operator could explain what the installer changes
- [ ] Documentation matches the lived install experience

---

## Related Primers

- Cross-Platform Installer Primer
- Production Primer
- Systemd Primer
- Front Matter & Documentation Primer

---

## Related Best Practices

- Install / Uninstall Best Practices
- Systemd Best Practices
- Production Best Practices
- Incident / Rollback / Recovery Best Practices

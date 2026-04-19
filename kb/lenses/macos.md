---
type: review-lens
lens_name: macos
category: platform
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# macOS Platform Lens

## Lens Purpose

This lens intensifies review for macOS-specific app/runtime behavior, Apple permission and packaging requirements, filesystem/path assumptions, launch services, background execution, and Apple-platform quirks.

It exists because many vibe-coded tools appear functional in local development but break the moment they encounter real macOS platform rules around:
- TCC permissions
- entitlements
- app packaging
- code signing
- notarization
- background services
- Apple Silicon differences

This is not generic product QA.
It is a practical review overlay for **whether the project actually behaves correctly and credibly on macOS as a platform rather than merely on the builder’s Mac under forgiving dev conditions**.

---

## Why This Lens Exists

Kaelith develops on macOS heavily.
That makes macOS both:
- a common build environment
- and, for some tools, a real target runtime

Vibe-coded systems often pass local smoke testing while still failing real macOS expectations because they:
- rely on undeclared permissions
- assume unrestricted file access
- ignore sandbox or entitlement realities
- ship unsigned or improperly packaged artifacts
- use incorrect login-item or background-service behavior
- assume Intel-era paths or tooling on Apple Silicon

Standard review stages do not cleanly isolate these Apple-specific failure modes.

This lens exists to ask:

> If this project is run, packaged, distributed, or installed on macOS in a realistic way, will it actually behave correctly under Apple’s runtime, packaging, and permission model?

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the project respects macOS permissions, entitlements, and user-consent boundaries
2. Whether packaging, signing, notarization, and distribution assumptions are credible for macOS
3. Whether background execution, launch behavior, and app identity fit Apple platform expectations
4. Whether file paths, APIs, and architecture assumptions survive current macOS realities
5. Whether the system will fail outside an unrestricted dev-machine context

If the reviewer cannot explain why the project would behave correctly on a real macOS install for the intended scope, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- native macOS apps
- menu bar or background apps
- internal tools running on macOS hosts
- packaged desktop utilities
- AI-native tooling with macOS integrations
- apps or helpers touching privacy-sensitive Apple APIs
- background services, launch agents, and login-item workflows on macOS

It may be applied to:
- **Code review** to scrutinize platform-specific behavior before release/distribution
- **Production review** to assess actual macOS readiness and distribution trustworthiness

It is not primarily a security lens, though it often surfaces trust-boundary and permission issues that overlap with security concerns.

---

## Core Review Rule

Do not confuse “works on my Mac” with “works on macOS.”

A project does **not** get macOS readiness credit because:
- it ran once in Xcode or Terminal
- the developer approved all prompts manually
- it uses Apple APIs somewhere
- the app opens locally
- a `.app` bundle exists

The reviewer must ask whether the project survives:
- realistic permission prompts and denials
- packaging and distribution
- user-level vs system-level launch behavior
- Apple Silicon and modern path/tooling realities
- current macOS platform constraints rather than dev-machine exemptions

---

## What This Lens Should Emphasize

### 1. TCC Permissions & User Consent
Reviewer should intensify attention on:
- camera, microphone, screen recording, accessibility, input monitoring, contacts, calendar, photos, location, and other protected resources
- required usage-description keys
- whether permission requests occur at the right time
- denial/revocation handling
- whether permission assumptions are made in helper/background contexts that cannot present UI correctly

### Example failure patterns
- app touches protected resources without the required plist declarations
- permission denial leads to crash, silent failure, or misleading UI
- app requests permissions at launch without clear user-triggered context

---

### 2. Sandbox & Entitlement Reality
Reviewer should intensify attention on:
- whether entitlements exist where needed
- mismatch between runtime behavior and declared entitlements
- file-access scope realism
- temporary exceptions or overly broad allowances
- helper/XPC/keychain access alignment

### Example failure patterns
- app behavior assumes unrestricted filesystem access that sandboxed context would block
- entitlement file does not match the APIs or resources the app actually uses
- generated solution relies on broad exceptions rather than correctly scoped access

---

### 3. Code Signing, Hardened Runtime & Notarization
Reviewer should intensify attention on:
- whether distributed artifacts are signable and notarization-ready
- hardened-runtime requirements
- helper/framework signing completeness
- realistic Gatekeeper expectations
- trust posture for externally distributed binaries

### Example failure patterns
- app bundle launches locally but would be blocked or distrusted in real distribution
- nested binaries or helpers are unsigned or inconsistently signed
- project assumes ad hoc signing is sufficient for intended release path

---

### 4. Launch Agents, Daemons & Background Services
Reviewer should intensify attention on:
- LaunchAgent vs LaunchDaemon correctness
- plist structure and placement assumptions
- login-item and background-task behavior
- install/uninstall lifecycle for background components
- crash-loop and persistence behavior

### Example failure patterns
- user-level background task is modeled like a system daemon or vice versa
- background agent is installed but not removed cleanly
- plist or launch behavior causes repeated failure loops or confusing persistence

---

### 5. Paths, Filesystem & App Data Placement
Reviewer should intensify attention on:
- use of Application Support, Caches, temp locations, and user-home paths appropriately
- hardcoded user-specific paths
- sandbox-aware temp/data handling
- file-placement choices that conflict with macOS norms
- assumptions about writable locations

### Example failure patterns
- project writes to hardcoded `/Users/<name>/...` paths
- app stores durable data in temporary or user-document locations without justification
- cache/data placement would break under sandbox or alternate user context

---

### 6. Apple Silicon & Architecture Assumptions
Reviewer should intensify attention on:
- arm64 vs x86_64 assumptions
- Rosetta dependence
- hardcoded Intel/Homebrew paths
- native-library compatibility and packaging
- architecture-specific toolchain or runtime expectations

### Example failure patterns
- app depends on `/usr/local/...` paths that only reflect Intel-era defaults
- artifact is effectively Intel-only with no clear Rosetta requirement or fallback plan
- embedded dependencies do not match the actual target architecture story

---

### 7. Packaging & Distribution Behavior
Reviewer should intensify attention on:
- `.app` bundle completeness
- plist identity/versioning basics
- DMG/pkg/zip distribution realism
- auto-update expectations where relevant
- whether the distribution path reflects actual macOS user experience

### Example failure patterns
- bundle looks complete but lacks required metadata or structure for credible distribution
- update/distribution path assumes users can bypass normal macOS trust friction casually
- install artifacts behave like dev outputs rather than finished macOS deliverables

---

### 8. API Deprecations & Version Compatibility
Reviewer should intensify attention on:
- deployment target assumptions
- modern availability checks
- deprecated Apple APIs commonly emitted by LLMs
- whether features require newer macOS than claimed
- Apple-platform churn that makes generated code age badly fast

### Example failure patterns
- code uses deprecated/removed notification, login-item, or system APIs without appropriate guards
- project claims support for macOS versions below what the code actually requires
- generated code ignores availability handling for newer platform behaviors

---

### 9. Privileged Helpers, XPC & Elevated Behavior
Reviewer should intensify attention on:
- whether elevated actions are modeled through appropriate macOS mechanisms
- XPC trust boundaries and helper coherence
- helper signing/entitlement consistency
- rejection of ad hoc `sudo`-style patterns inside apps

### Example failure patterns
- app shells out to `sudo` rather than using platform-appropriate privileged helper patterns
- XPC/helper relationship is incomplete, unsigned, or trust-ambiguous
- elevated behavior exists without clear install/remove lifecycle

---

### 10. Menu Bar, Dock, Login Item & Desktop Presence
Reviewer should intensify attention on:
- whether the app presents itself correctly for its actual UX model
- LSUIElement/background-only assumptions
- login-item registration behavior
- Dock/menu-bar presence consistency
- whether startup/open-window behavior matches the intended product shape

### Example failure patterns
- menu-bar utility unexpectedly shows Dock/window behavior it should not
- app launches UI on startup when it should behave like a quiet background utility
- login-item implementation uses outdated or mismatched platform patterns

---

### 11. Dev-Privilege Illusion Detection
Reviewer should intensify attention on:
- behavior that succeeds only because the builder already granted permissions
- local dev environment exemptions not reflected in product logic
- assumptions hidden by running from Xcode/Terminal/admin-like contexts
- places where reviewer confidence depends on the author’s machine history

### Example failure patterns
- app appears fine only because permissions were previously granted on the dev machine
- file access works due to local directory layout or prior manual setup not reflected in the product
- distribution/runtime plan depends on invisible developer privilege or prior trust approvals

---

### 12. macOS-Native Operational Hygiene
Reviewer should intensify attention on:
- cleanup of agents, helpers, login items, and support files
- update/remove lifecycle expectations
- whether the app leaves behind orphaned components
- whether the operational footprint is acceptable for a macOS tool

### Example failure patterns
- uninstall leaves LaunchAgents, background helpers, or support data in place without reason
- helper/service lifecycle is unclear and accumulates system clutter
- user cannot easily understand what persists after install or launch

---

## What This Lens Should Not Duplicate

This lens should not become a generic security review, dependency audit, or accessibility pass.

Avoid using it to re-run:
- secret scanning → Security stages / secrets-oriented lenses
- generic dependency CVE analysis → Supply-chain stages
- auth/input validation/web security review → Security stages
- full observability review → Production 3
- generic code-quality/style review → Code stages / code-health lens
- formal accessibility review → accessibility-focused lenses

Instead, this lens should focus on **Apple-platform truth**:
- permissions
- entitlements
- packaging and trust
- background/runtime behavior
- architecture/path/platform assumptions

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### macOS Platform Lens Summary
- Overall macOS readiness posture:
- Highest-risk macOS-specific failure:
- Most serious permission/packaging concern:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| TCC permissions & user consent | PASS / NEEDS_WORK / BLOCK | ... |
| Sandbox & entitlement reality | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Code signing / hardened runtime / notarization | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Launch agents / daemons / background services | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Paths / filesystem / app data placement | PASS / NEEDS_WORK / BLOCK | ... |
| Apple Silicon & architecture assumptions | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Packaging & distribution behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| API deprecations & version compatibility | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Privileged helpers / XPC / elevated behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Menu bar / Dock / login item / desktop presence | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Dev-privilege illusion detection | PASS / NEEDS_WORK / BLOCK | ... |
| macOS-native operational hygiene | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- File / artifact / bundle component:
- Evidence:
- macOS impact:
- Why it matters:
- Fix direction:

### macOS Lens Blockers
- Blocking macOS-specific issues:
- Distribution-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- the app is likely to fail, be blocked, or behave deceptively on real macOS installs
- permission, entitlement, signing, or packaging issues make the product untrustworthy for intended use
- runtime behavior depends on dev-machine privilege, history, or exemptions
- background/elevated/platform integration is materially broken

### NEEDS_WORK-level lens findings
Use when:
- the product is directionally workable on macOS but fragile, incomplete, or distribution-weak
- platform-specific behavior is under-specified or depends on forgiving local conditions
- user-facing macOS behavior or lifecycle handling is likely to cause friction or confusion

### PASS-level lens findings
Use when:
- the reviewer can explain how the project behaves on real macOS installs credibly
- permissions, packaging, runtime behavior, and architecture assumptions are coherent enough for scope
- success does not depend on hidden developer-machine advantages

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- missing usage-description keys for protected APIs
- file/system access assumptions that only work outside realistic macOS constraints
- unsigned or incompletely signed bundles/helpers intended for real distribution
- LaunchAgent/LoginItem behavior modeled incorrectly
- hardcoded Intel/Homebrew paths on Apple Silicon-era systems
- `.app` bundles that open locally but are not credible macOS deliverables
- deprecated Apple APIs emitted by LLMs without modern availability handling
- tools that appear functional only because the developer has already granted permissions manually

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **UX & Interaction Clarity** when permission prompts, failures, or background behavior affect user trust
- **Secrets & Trust Boundaries** when helpers, keychain, or elevated behavior expand trust scope
- **Production stages** where packaging/distribution readiness matters
- **Cross-Platform Compatibility** when the system claims multi-OS support but macOS has special runtime rules

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this project behaves on macOS under real Apple platform rules for permissions, packaging, background behavior, and architecture, and I am not relying on hidden developer-machine exemptions to believe it works.

If that statement cannot be made honestly, this lens should produce meaningful findings.

---
type: review-lens
lens_name: windows
category: platform
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Windows Platform Lens

## Lens Purpose

This lens intensifies review for Windows-specific runtime behavior, path and shell assumptions, service/task behavior, permission and elevation realities, installer quality, encoding/newline issues, and desktop/runtime quirks.

It exists because vibe-coded systems are often authored from POSIX-biased examples and local Mac/Linux environments, then expected to run on Windows where:
- paths behave differently
- shell assumptions break
- UAC and service models differ
- newline and encoding problems become visible
- installer and signing quality materially affect usability and trust

This is not a generic compatibility note.
It is a practical review overlay for **whether the project actually works credibly on Windows rather than merely in theory or under POSIX assumptions**.

---

## Why This Lens Exists

Kaelith may build tools, dashboards, desktop apps, internal utilities, or client-facing systems that reach Windows users or Windows hosts.

Vibe-coded projects routinely inherit Linux/macOS defaults such as:
- `/tmp`
- bash scripts
- `chmod`
- forward-slash path assumptions
- POSIX signal handling
- Unix-style config and home-directory conventions

Those assumptions often survive code review because they are logically valid in the abstract and may even pass CI on Linux.
But on Windows they create silent or confusing failures.

Standard review stages do not cleanly isolate these platform-specific breakpoints.

This lens exists to ask:

> If this project is installed, run, or supported on Windows, will it behave correctly under Windows filesystem, shell, service, installer, and user-permission realities rather than POSIX defaults?

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the project makes incorrect Windows assumptions about paths, filesystems, shell, or process behavior
2. Whether Windows service/task/elevation models are handled credibly where relevant
3. Whether installer, packaging, and desktop/runtime behavior are supportable on Windows
4. Whether encoding, newline, locking, and environment differences are likely to break the product
5. Whether the system’s Windows support is real rather than aspirational

If the reviewer cannot explain how the project behaves on Windows without translating POSIX habits by hand, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- desktop apps
- Electron/Tauri or packaged Windows utilities
- CLI tools expected to run on Windows
- internal automation scripts or support tooling touching Windows machines
- services or scheduled tasks deployed on Windows hosts
- products that claim Windows compatibility

It may be applied to:
- **Code review** to scrutinize Windows compatibility and runtime assumptions
- **Production review** to assess deployment/install/support reality on Windows

It is not primarily a security lens, though it often surfaces permission and trust-boundary issues that overlap with security concerns.

---

## Core Review Rule

Do not confuse “portable-looking code” with “Windows-ready behavior.”

A project does **not** get Windows readiness credit because:
- the language itself is cross-platform
- the app compiles on Windows once
- the UI opens locally
- one script has a `.ps1` variant
- the team expects users to figure out the Windows parts manually

The reviewer must ask whether the project survives:
- Windows path and filename rules
- native shell differences
- UAC/elevation boundaries
- service/task execution contexts
- file locking and update behavior
- real installer and distribution expectations

---

## What This Lens Should Emphasize

### 1. Path Construction & Filename Portability
Reviewer should intensify attention on:
- path separators
- drive-letter assumptions
- UNC/network path handling where relevant
- illegal Windows filename characters and reserved names
- long-path and path-normalization assumptions

### Example failure patterns
- code hardcodes `/tmp/...` or POSIX-style absolute paths
- generated files or directories use names invalid on Windows
- project assumes a Unix-like home path or root layout

---

### 2. Shell & Script Assumptions
Reviewer should intensify attention on:
- bash/sh dependencies in Windows-facing workflows
- PowerShell vs cmd expectations
- shebang-based execution assumptions
- use of POSIX utilities that are not guaranteed on Windows
- script execution-policy or host-shell realities

### Example failure patterns
- installer or setup flow calls `bash`, `grep`, `sed`, or `chmod` without a Windows story
- script assumes shebang execution will work natively
- build/run instructions require Unix shell behavior while claiming Windows support

---

### 3. Permissions, UAC & Elevated Actions
Reviewer should intensify attention on:
- admin/elevation requirements
- whether privileged operations are requested explicitly and appropriately
- writes to protected locations
- mismatch between expected permissions and actual runtime context
- assumptions that Unix permission semantics map directly to Windows

### Example failure patterns
- app writes into Program Files or machine-wide locations without a credible elevation flow
- workflow requires admin rights but surfaces failure only as generic runtime error
- generated scripts attempt `chmod`/Unix permission fixes that do not solve Windows ACL reality

---

### 4. Windows Services & Scheduled Tasks
Reviewer should intensify attention on:
- whether background execution is modeled as a real Windows service or scheduled task where appropriate
- install/uninstall lifecycle for services/tasks
- service identity and execution context assumptions
- recovery/restart posture
- replacement of Unix daemon habits with Windows-native behavior

### Example failure patterns
- app expects `nohup`, `&`, or daemon-like shell behavior instead of a Windows service/task model
- service is installed with no credible uninstall or recovery plan
- scheduled task depends on personal-user context or interactive desktop assumptions

---

### 5. Newlines, Encoding & Locale Behavior
Reviewer should intensify attention on:
- CRLF/LF sensitivity
- BOM-related parsing issues
- console/codepage assumptions
- explicit encoding in file operations
- locale-sensitive formatting or parsing behavior

### Example failure patterns
- shell/runtime scripts break due to line-ending mismatches
- text parsing depends on UTF-8 assumptions not enforced explicitly
- CLI output or config parsing breaks under Windows encoding defaults

---

### 6. Filesystem Case, Locking & Semantics
Reviewer should intensify attention on:
- case-insensitivity assumptions
- delete/rename behavior for open files
- symlink/junction expectations
- NTFS semantics that differ from POSIX behavior
- safe update and replacement strategies for locked binaries/files

### Example failure patterns
- update flow assumes running executable can be replaced in place
- file can be deleted on Unix but remains locked on Windows
- path/import case drift causes ambiguous or fragile behavior

---

### 7. Environment Variables & Config Placement
Reviewer should intensify attention on:
- `%APPDATA%`, `%LOCALAPPDATA%`, `%TEMP%`, user profile locations
- Unix-only config directory assumptions
- registry usage where relevant
- env-var naming/expansion differences
- whether configuration actually lives in Windows-appropriate places

### Example failure patterns
- app stores user config in `~/.config` with no Windows mapping
- scripts assume `$HOME`, `$USER`, or POSIX env expansion directly
- config or state placement is alien to Windows support expectations

---

### 8. Installer, Packaging, Code Signing & Distribution Quality
Reviewer should intensify attention on:
- whether a real Windows installation/distribution path exists
- installer/uninstaller completeness
- PATH integration where needed
- Authenticode signing and executable trust posture where relevant
- SmartScreen, Defender, and user-trust friction realism

### Example failure patterns
- product claims Windows support but only ships raw zip-drop artifacts with no real install story
- unsigned executables trigger avoidable SmartScreen or Defender distrust during normal distribution
- uninstaller leaves services, files, or registry artifacts behind
- distribution path creates avoidable trust warnings or support burden due to missing packaging discipline

---

### 9. Runtime & Desktop Quirks
Reviewer should intensify attention on:
- DPI/windowing behavior where relevant
- system tray/taskbar assumptions
- update behavior under file locks
- Windows-specific process lifecycle events
- desktop/runtime expectations that diverge from POSIX platforms

This section is often N/A for pure CLI, library, or backend workloads.

### Example failure patterns
- app lifecycle assumes Unix-like shutdown semantics
- desktop utility behaves awkwardly because tray/taskbar/startup integration was never considered
- updater logic breaks because running binaries cannot be replaced like on Unix

---

### 10. Network, IPC & Host Integration Differences
Reviewer should intensify attention on:
- named pipes vs Unix sockets where relevant
- firewall/port-exposure assumptions
- localhost/IPv4/IPv6 differences when material
- Windows certificate store or host-integration realities where applicable
- cross-process communication patterns that assume POSIX primitives

### Example failure patterns
- local IPC depends on Unix sockets without Windows-compatible strategy
- host integration assumes Linux-like network or certificate behavior
- local service communication works only on POSIX paths/mechanisms

---

### 11. Process & Signal Handling
Reviewer should intensify attention on:
- POSIX signal assumptions
- shutdown/restart behavior for long-running processes
- process-management logic that assumes fork/kill semantics
- Windows-specific lifecycle events where relevant

### Example failure patterns
- app relies on `SIGTERM`/`SIGKILL` patterns as if Windows behaves identically
- graceful shutdown is never exercised under Windows realities
- process orchestration assumes Unix semantics that do not map cleanly

---

### 12. POSIX-Bias Detection
Reviewer should intensify attention on:
- overall signs the project was generated from Linux/macOS defaults
- documentation and setup paths that quietly exclude Windows
- tooling assumptions that reveal Windows was never truly part of the design
- “supports Windows” claims unsupported by actual platform thoughtfulness

### Example failure patterns
- README says Windows is supported while all examples use Unix shell commands only
- Windows script exists but core workflows still route through POSIX-only tooling
- project feels cross-platform in theory but depends on silent POSIX translation in practice

---

## What This Lens Should Not Duplicate

This lens should not become a generic dependency audit, security review, or product QA pass.

Avoid using it to re-run:
- dependency vulnerability review → Supply-chain stages
- generic application security flaws → Security stages
- secret scanning → Security stages / secrets-oriented lenses
- formal observability review → Production 3
- generic code style/maintainability review → Code stages / code-health lens
- non-Windows-specific accessibility review → accessibility-focused lenses

Instead, this lens should focus on **Windows runtime truth**:
- paths
- shell behavior
- services/tasks
- elevation and installer realities
- encoding/locking/platform-specific behavior

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Windows Platform Lens Summary
- Overall Windows readiness posture:
- Highest-risk Windows execution failure:
- Most serious POSIX-assumption mismatch:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Path construction & filename portability | PASS / NEEDS_WORK / BLOCK | ... |
| Shell & script assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| Permissions / UAC / elevated actions | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Windows services & scheduled tasks | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Newlines / encoding / locale behavior | PASS / NEEDS_WORK / BLOCK | ... |
| Filesystem case / locking / semantics | PASS / NEEDS_WORK / BLOCK | ... |
| Environment variables & config placement | PASS / NEEDS_WORK / BLOCK | ... |
| Installer / packaging / distribution quality | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Runtime & desktop quirks | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Network / IPC / host integration differences | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Process & signal handling | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| POSIX-bias detection | PASS / NEEDS_WORK / BLOCK | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- File / script / installer / artifact:
- Evidence:
- Windows impact:
- Why it matters:
- Fix direction:

### Windows Lens Blockers
- Blocking Windows-specific issues:
- Support/distribution-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- the project is likely to fail materially on Windows
- installer/elevation/service assumptions make supported Windows use unrealistic
- POSIX assumptions are so strong that Windows compatibility is effectively false
- file locking, encoding, or runtime behavior creates major functional breakage

### NEEDS_WORK-level lens findings
Use when:
- the project is directionally Windows-capable but fragile, support-heavy, or incomplete
- Windows packaging, scripting, or runtime handling is weak enough to create repeated user friction
- Windows support exists mostly through workarounds or implied operator knowledge

### PASS-level lens findings
Use when:
- the reviewer can explain how the project behaves on Windows credibly
- Windows-specific assumptions around paths, shell, install, and runtime behavior are well enough handled for scope
- compatibility does not depend on hidden POSIX translation or user guesswork

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- `/tmp`, bash, `chmod`, `grep`, `sed`, and other POSIX assumptions in Windows-facing flows
- config and data written to Unix-style paths with no Windows mapping
- installer/uninstaller flows that are incomplete or absent despite Windows support claims
- service/background patterns copied from Unix instead of modeled for Windows services/tasks
- line-ending and encoding assumptions that only break on Windows
- update or file-replacement logic broken by Windows file locking
- project documentation or scripts that claim Windows support while clearly reflecting POSIX-only design

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **UX & Interaction Clarity** when Windows installer, permission, or error behavior affects user comprehension
- **Workflow & Automation Reliability** when Windows hosts run tasks, agents, or scheduled workflows
- **Production stages** where Windows packaging/support is part of launch scope
- **Cross-Platform Compatibility** when the product claims multi-OS support broadly

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this project behaves on Windows under actual Windows rules for paths, shell execution, permissions, services, installers, and file/runtime semantics, and I do not need to mentally translate POSIX assumptions to believe it works.

If that statement cannot be made honestly, this lens should produce meaningful findings.

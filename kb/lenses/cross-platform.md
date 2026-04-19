---
type: review-lens
lens_name: cross-platform
category: platform
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Cross-Platform Compatibility Lens

## Lens Purpose

This lens intensifies review for portability assumptions across Linux, macOS, and Windows.

It exists because many vibe-coded systems are generated from examples that are:
- Linux-biased
- POSIX-assuming
- shell-heavy
- written as if paths, filesystems, processes, and toolchains behave the same everywhere

They do not.

A project can be:
- correct in core logic
- secure enough in implementation
- operational in one environment

…and still be structurally non-portable across operating systems.

This is not a per-OS hardening lens.
It is a practical review overlay for **whether the project’s code, scripts, tooling, and runtime assumptions survive movement between Linux, macOS, and Windows without relying on luck, hidden translation, or manual heroics**.

---

## Why This Lens Exists

Kaelith’s work often spans:
- macOS development machines
- Linux deployment targets
- Windows client or internal-user environments
- automation and tooling that may be run from any of the above

Vibe-coded systems amplify cross-platform risk because LLMs often generate:
- POSIX paths
- bash scripts
- GNU-specific shell flags
- case-sensitive assumptions
- `/tmp` and Unix env-var conventions
- file replacement behavior that fails under Windows locks
- interpreter/toolchain assumptions that only hold on one OS

Standard review stages do not isolate portability as a first-class question.
Per-OS platform lenses catch platform-specific runtime or hardening issues, but they do not answer the broader portability question:

> Does this project’s design and implementation actually survive crossing OS boundaries, or does it only work because everyone is compensating for hidden environment assumptions?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the project embeds assumptions that only hold on one operating system
2. Whether paths, filesystems, scripts, env vars, interpreters, and runtime behavior are portable enough for the claimed scope
3. Whether cross-OS support is real rather than rhetorical
4. Whether likely portability failures are visible before users or operators discover them the hard way
5. Whether the project’s multi-OS story depends on undocumented translation or workarounds

If the reviewer cannot explain why the project would survive movement between Linux, macOS, and Windows, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- tools that claim Linux/macOS/Windows support
- CLIs and developer tooling
- Electron/Tauri or packaged desktop apps
- scripts and automation expected to run across different developer environments
- internal tooling used by mixed-OS teams
- products whose build, test, or support flows cross OS boundaries

It may be applied to:
- **Code review** to scrutinize portability before deployment or release claims
- **Production review** when actual supportability depends on cross-platform realism

It should often be used alongside specific OS lenses, not as a replacement for them.

---

## Core Review Rule

Do not confuse “written in a cross-platform language” with “cross-platform.”

A project does **not** get portability credit because:
- it uses JavaScript, Python, Go, or another portable language
- it compiles on more than one OS
- one developer says it also runs on their machine
- build tooling exists for multiple environments in theory
- Windows, macOS, and Linux are listed in documentation

The reviewer must ask whether the project survives differences in:
- path syntax
- filename rules
- case sensitivity
- line endings and encoding
- shell and tool availability
- file locking
- interpreter and runtime locations
- env vars and temp directories
- packaging and distribution expectations

---

## What This Lens Should Emphasize

### 1. Path & Filename Portability
Reviewer should intensify attention on:
- path separator assumptions
- absolute-path portability
- illegal/reserved filename patterns on different OSes
- long-path edge cases
- whether paths are constructed through portable APIs rather than string concatenation

### Example failure patterns
- code assumes POSIX absolute paths on Windows
- generated artifacts use names invalid on Windows or awkward on macOS/Linux
- path handling works only because the current OS is forgiving

---

### 2. Filesystem Case Sensitivity
Reviewer should intensify attention on:
- import/reference case drift
- files that differ only by case
- assumptions that case-insensitive and case-sensitive filesystems behave the same
- Git/repo behaviors that hide case-related issues on one OS and surface them on another

### Example failure patterns
- import casing works on one machine but fails on Linux
- file rename by case only creates inconsistent behavior across environments
- project structure depends on case forgiveness rather than consistency

---

### 3. Shell & Script Portability
Reviewer should intensify attention on:
- shell-specific syntax
- bash/sh/PowerShell/cmd assumptions
- shebang-based execution expectations
- whether scripts are actually portable or merely copied across OSes
- whether one platform has become the hidden reference implementation

### Example failure patterns
- setup flow assumes bash even though Windows support is claimed
- script labeled portable uses shell features from only one family
- documentation pretends multiple-OS support while operational scripts clearly target one OS only

---

### 4. GNU vs BSD vs Windows Tooling Drift
Reviewer should intensify attention on:
- `sed`, `find`, `grep`, `date`, `readlink`, `xargs`, and similar tooling differences
- assumptions that shell utilities share identical flags across platforms
- Node/Python/Ruby/etc. scripts shelling out to platform-sensitive tools
- hidden dependence on GNU tools installed ad hoc on macOS

### Example failure patterns
- `sed -i`/`sed -i ''` incompatibilities break one OS immediately
- `grep -P`, `readlink -f`, or GNU-only flags are treated as universal
- macOS works only because GNU tools were installed manually via Homebrew

---

### 5. Line Endings & Encoding
Reviewer should intensify attention on:
- CRLF/LF handling
- BOM-related parse or runtime issues
- explicit vs implicit encoding assumptions
- `.gitattributes` and text normalization hygiene where relevant
- whether scripts/configs survive being created or edited on different OSes

For Windows-specific codepage, console, and distribution friction details, see the Windows Platform lens.

### Example failure patterns
- Linux shell script fails due to CRLF line endings introduced on Windows
- parser/runtime behaves inconsistently because encoding is not explicit
- repo appears healthy until files move between OS-native editors and shells

---

### 6. Environment Variables & User/Home/Temp Assumptions
Reviewer should intensify attention on:
- `HOME` vs `USERPROFILE`
- `TMPDIR` / `TEMP` / `TMP`
- env-var naming, casing, and expansion differences
- path-list delimiters (`:` vs `;`)
- whether config, cache, and temp locations map credibly across OSes

### Example failure patterns
- code assumes `$HOME` or `/tmp` universally
- env var interpolation uses POSIX syntax on Windows
- mixed-OS support exists only if users manually translate environment expectations

---

### 7. Runtime & Interpreter Path Assumptions
Reviewer should intensify attention on:
- `python` vs `python3`
- Node/runtime path assumptions
- virtual environment activation differences
- shebang portability
- hardcoded interpreter/tool locations tied to one OS or package manager

### Example failure patterns
- script assumes `/usr/bin/env python3` or a Homebrew path universally
- activation or startup steps only work on POSIX shells
- runtime support depends on personal toolchain layout rather than portable setup

---

### 8. Symlinks, Junctions & Filesystem Indirection
Reviewer should intensify attention on:
- symlink dependence
- Windows junction/developer-mode realities
- whether project tooling or build steps survive platforms where symlinks behave differently
- Git or package-manager behaviors affected by symlink handling

### Example failure patterns
- project depends on symlinks that behave differently or fail on Windows environments
- repo/build tooling silently degrades when symlink support is absent or transformed
- platform support assumes filesystem features not uniformly available

---

### 9. Temp Files, Working Directory & Relative-Path Assumptions
Reviewer should intensify attention on:
- reliance on current working directory
- OS-specific temp-file conventions
- spaces in paths
- runtime environments where CWD differs from repo root or dev shell expectations
- relative-path assumptions that break once the program is packaged or launched differently

### Example failure patterns
- project works only when run from the repo root on one OS
- temp path handling fails because path spaces or OS temp conventions were ignored
- packaged app/runtime cannot find assets because dev-only relative paths were assumed

---

### 10. File Locking, Replacement & Concurrency Semantics
Reviewer should intensify attention on:
- replacing or deleting open files
- update/install flows that mutate running binaries/files
- POSIX vs Windows locking assumptions
- whether the system’s file lifecycle remains safe across OS behavior differences

### Example failure patterns
- updater works on Unix but fails on Windows because running files cannot be replaced
- concurrent access patterns rely on advisory-lock behavior only
- project logic assumes OSes permit the same rename/delete patterns under load

---

### 11. Packaging, Build Matrix & Distribution Reality
Reviewer should intensify attention on:
- whether native modules or binaries are built/tested per OS
- installer/packaging support across claimed targets
- cross-OS CI/build-story credibility
- architecture drift across x86_64, arm64, and OS-specific packaging paths
- whether the support claim matches actual build/distribution discipline

### Example failure patterns
- project claims multi-OS support with no per-OS build/test matrix
- native dependency works only on the author’s OS
- packaging exists for one OS while documentation implies broader support

---

### 12. Cross-Platform Claim Integrity
Reviewer should intensify attention on:
- whether docs, marketing, or product surfaces overstate OS support
- hidden “works if you know the translation” gaps
- whether reviewers are being asked to believe portability without evidence
- scope boundaries between truly supported vs merely possible platforms

### Example failure patterns
- README lists Windows/macOS/Linux support while all operational examples target one OS family
- platform support is technically possible but not productized, tested, or documented honestly
- support claim survives after code or tooling drift made it false

---

## What This Lens Should Not Duplicate

This lens should not become a per-OS hardening lens or a full security review.

Avoid using it to re-run:
- Linux service hardening, SELinux/AppArmor, or distro-specific ops review → Linux lens
- macOS TCC/signing/notarization review → macOS lens
- Windows UAC/installer/service details beyond portability framing → Windows lens
- dependency CVE analysis → Supply-chain stages
- secrets review → Security stages / secrets-oriented lenses
- generic application security review → Security stages
- performance benchmarking → Production 4

Instead, this lens should focus on **portability across OS boundaries**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Cross-Platform Compatibility Lens Summary
- Overall portability posture:
- Highest-risk portability failure:
- Most serious hidden OS assumption:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Path & filename portability | PASS / NEEDS_WORK / BLOCK | ... |
| Filesystem case sensitivity | PASS / NEEDS_WORK / BLOCK | ... |
| Shell & script portability | PASS / NEEDS_WORK / BLOCK | ... |
| GNU/BSD/Windows tooling drift | PASS / NEEDS_WORK / BLOCK | ... |
| Line endings & encoding | PASS / NEEDS_WORK / BLOCK | ... |
| Environment variables & home/temp assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| Runtime & interpreter path assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| Symlinks / junctions / filesystem indirection | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Temp files / working directory / relative-path assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| File locking / replacement / concurrency semantics | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Packaging / build matrix / distribution reality | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Cross-platform claim integrity | PASS / NEEDS_WORK / BLOCK | ... |

### Portability Snapshot by OS
| OS | Posture | Blocking Notes |
|---|---|---|
| Linux | CLEAR / FRAGILE / BLOCKED | ... |
| macOS | CLEAR / FRAGILE / BLOCKED | ... |
| Windows | CLEAR / FRAGILE / BLOCKED | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- File / script / artifact:
- Evidence:
- Affected OS(es):
- Why it matters:
- Fix direction:

### Cross-Platform Lens Blockers
- Blocking portability issues:
- Support-claim limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- claimed multi-OS support is materially false
- portability failures are likely to break important workflows on one or more target OSes
- core scripts, packaging, or runtime assumptions are tied to one OS family only
- support depends on undocumented manual translation or heroic operator workarounds

### NEEDS_WORK-level lens findings
Use when:
- the project is directionally portable but fragile across OS boundaries
- one or more OSes require cleanup, better docs, or less assumption-heavy tooling
- support exists mostly in theory but not yet with strong operational confidence

### PASS-level lens findings
Use when:
- the reviewer can explain why paths, tooling, env vars, scripts, and runtime behavior survive movement across claimed OSes
- platform support claims match actual implementation and distribution reality
- portability does not depend on hidden assumptions or local machine luck

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- hardcoded bash or POSIX shell paths in multi-OS tools
- `sed`, `grep`, `date`, `readlink`, or `find` usage that assumes one tool family everywhere
- `/tmp`, `$HOME`, or Unix-style config locations in code that claims Windows support
- import/path casing that works on one filesystem style but not another
- CRLF/LF/encoding issues that appear only when files move across OS-native editors and shells
- updater/install behavior that fails under Windows file locking
- interpreter/toolchain assumptions tied to Homebrew, Linux defaults, or one local dev setup
- README or product claims overstating OS support beyond what the implementation really supports

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Linux / macOS / Windows platform lenses** to separate portability failures from per-OS hardening or runtime specifics
- **Workflow & Automation Reliability** when scripts and automations run in mixed-OS environments
- **Legal, Policy & Claims Integrity** when product or documentation claims platform support
- **Production stages** where deployment/support scope spans multiple operating systems

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand which operating systems this project truly supports, what assumptions it makes about paths, filesystems, scripts, runtimes, and packaging across those platforms, and why that support does not depend on hidden translation or machine-specific luck.

If that statement cannot be made honestly, this lens should produce meaningful findings.

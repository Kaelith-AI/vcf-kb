---
type: review-lens
lens_name: linux
category: platform
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Linux Platform Lens

## Lens Purpose

This lens intensifies review for Linux-specific runtime behavior, filesystem assumptions, shell portability, service/process correctness, packaging, permissions, and deployment realism.

It exists because many vibe-coded systems are:
- authored on macOS
- tested lightly in a container or local shell
- then deployed to Linux servers, VPS hosts, Raspberry Pis, background workers, or cloud instances

…and fail not because the product idea is wrong, but because the code quietly assumes the wrong operating system.

This is not a generic infrastructure review.
It is a practical review overlay for **whether the project will actually behave correctly on Linux hosts and Linux-shaped runtime environments**.

---

## Why This Lens Exists

Kaelith builds many systems that eventually land on Linux:
- servers
- workers
- cron-driven automations
- bots
- containers
- internal services
- self-hosted tools
- edge or small-device deployments

Vibe-coded systems routinely inherit macOS and generic-dev-environment assumptions such as:
- `/Users/...` paths
- Homebrew-installed binaries
- BSD shell utilities and flags
- local interactive shell PATH behavior
- missing execute bits
- weak or nonexistent `systemd` readiness
- scripts that technically run once but are not production-safe on Linux

Standard review stages do not cleanly isolate that class of failure.

This lens exists to ask:

> If this project is placed onto a normal Linux machine, service host, container, or VPS, will it actually start, run, persist, and behave correctly under Linux rules rather than dev-machine assumptions?

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether the project makes incorrect filesystem, shell, or runtime assumptions for Linux
2. Whether Linux service/process execution is defined clearly enough to be trustworthy
3. Whether packaging, install, and startup behavior are viable on realistic Linux targets
4. Whether permissions, paths, logging, and environment handling fit Linux norms
5. Whether the system is likely to fail on Linux due to macOS-origin or local-shell assumptions

If the reviewer cannot explain how this project runs on Linux without relying on the author’s personal machine habits, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- backend services
- worker processes
- bots and automation runners
- CLI tools expected to run on Linux
- self-hosted apps
- VPS or cloud-hosted deployments
- Docker/containerized workloads
- Raspberry Pi or Linux device deployments

It may be applied to:
- **Code review** to scrutinize Linux runtime assumptions before deployment
- **Production review** to assess real Linux-host readiness and operational fit

It is not primarily a security lens, though it often surfaces issues relevant to security or ops hardening.

---

## Core Review Rule

Do not confuse “works on the builder’s machine” with “works on Linux.”

A project does **not** get Linux readiness credit because:
- it ran once in a local shell
- it starts inside one forgiving dev container
- a script exists
- the code references Linux somewhere
- the team expects to deploy it to Linux eventually

The reviewer must ask whether the project survives:
- fresh-host setup
- service context execution
- minimal PATH and environment
- Linux file permissions and ownership
- long-running process behavior
- standard Linux operational expectations

---

## What This Lens Should Emphasize

### 1. Shell & Script Portability
Reviewer should intensify attention on:
- shebang correctness
- `bash` vs `sh` assumptions
- BSD/macOS utility flags used in Linux-targeted scripts
- quoting, globbing, and shell-expansion correctness
- whether scripts depend on interactive-shell behavior

### Example failure patterns
- `sh` script uses bash-only syntax like arrays or `[[ ... ]]`
- script uses `sed -i ''` or other BSD-specific flags that fail on GNU tools
- startup script works only when run manually from the author’s shell profile

---

### 2. Filesystem Layout & Path Assumptions
Reviewer should intensify attention on:
- hardcoded macOS paths
- Linux filesystem hierarchy expectations
- correct placement of config, data, cache, and logs
- temp-file handling
- XDG compliance where appropriate for user-facing tools

### Example failure patterns
- project writes to `~/Library/...` or `/Users/...`
- service relies on relative `./logs` directory from a repo root that won’t exist in production
- temporary files are handled unsafely or assume a dev-only directory structure

---

### 3. File Permissions & Ownership Model
Reviewer should intensify attention on:
- execute bits on scripts/binaries
- ownership and modes for config, state, and runtime files
- whether referenced users/groups exist
- accidental over-permissioning
- `umask` and default-permission assumptions

### Example failure patterns
- entrypoint or startup script is not executable
- service user cannot write required files because ownership is wrong
- generated setup creates world-readable sensitive config or state files

---

### 4. Service & Process Management
Reviewer should intensify attention on:
- `systemd` unit readiness where relevant
- absolute paths in service definitions
- restart policy, dependencies, and working directory correctness
- whether the service model matches Linux operational reality
- signal handling and shutdown behavior

### Example failure patterns
- `ExecStart=node app.js` relies on PATH that does not exist in service context
- network service starts before network is actually available
- process ignores `SIGTERM` and exits uncleanly during deploy/restart

---

### 5. Environment & Runtime Assumptions
Reviewer should intensify attention on:
- reliance on locally installed tools not guaranteed on target hosts
- shell profile vs service environment differences
- runtime version assumptions
- missing `WorkingDirectory` or explicit environment configuration
- dependence on the author’s HOME/PATH/toolchain layout

### Example failure patterns
- service expects `node`, `python3`, `jq`, or `git` to exist without documenting or provisioning them
- runtime works in interactive login shell but fails as a service
- code assumes `/Users/kaelith` or personal dev locations exist

---

### 6. Packaging & Installation Behavior
Reviewer should intensify attention on:
- Linux install steps
- distro or package-manager assumptions
- post-install/startup requirements
- uninstall/cleanup behavior where relevant
- whether “installation” is actually reproducible

### Example failure patterns
- install process assumes Homebrew rather than apt/yum/pacman or explicit binaries
- package versions are pinned to packages that don’t exist on the target distro
- service is installed but never enabled, migrated, or started correctly

---

### 7. Container & Docker Correctness
Reviewer should intensify attention on:
- base image choice and reproducibility
- `USER` usage
- layer hygiene and accidental secret inclusion
- `ENTRYPOINT` / `CMD` correctness
- whether the container actually reflects Linux runtime expectations

### Example failure patterns
- container runs everything as root by default without need
- `ENTRYPOINT` script lacks execute permission
- build copies local junk or secrets into the image

---

### 8. Networking & Port Binding Assumptions
Reviewer should intensify attention on:
- bind addresses
- privileged-port assumptions
- Linux firewall and port-exposure implications
- socket path and permission behavior
- IPv4/IPv6 assumptions where relevant

### Example failure patterns
- service binds to `127.0.0.1` when container/host deployment requires `0.0.0.0`
- app assumes low port binding without capability or root strategy
- Unix socket path or permissions are wrong for service use

---

### 9. Logging & Runtime Artifacts
Reviewer should intensify attention on:
- stdout/stderr vs file-logging behavior
- journald/system service fit
- log file ownership and placement
- runtime directory setup
- relative-path log handling that breaks under service execution

### Example failure patterns
- service writes logs to a local repo-relative path that does not exist in prod
- file logging breaks because the service user cannot write the directory
- logs are split awkwardly between journald and ad hoc files with no clear reason

---

### 10. Linux-Specific Hardening Readiness
Reviewer should intensify attention on:
- whether service definitions use basic Linux hardening meaningfully where warranted
- privilege drop expectations
- `systemd` hardening options where applicable
- AppArmor/SELinux awareness where relevant
- runtime trust boundaries shaped by Linux behavior

### Example failure patterns
- service runs with broader privileges than needed because no user separation exists
- deployment implicitly assumes hardening features are disabled
- production service definition ignores obvious containment controls for no good reason

---

### 11. Scheduled Task & Background Execution Behavior
Reviewer should intensify attention on:
- cron vs `systemd` timer assumptions
- minimal-environment execution for scheduled jobs
- whether scheduled tasks are reproducible outside the author’s user account
- background worker start/stop behavior

### Example failure patterns
- cron job assumes shell aliases, PATH entries, or interactive env vars
- task only works from a personal user crontab and not from intended deployment context
- Linux timer/scheduler behavior is undocumented or incomplete

---

### 12. macOS / Dev-Environment Artifact Detection
Reviewer should intensify attention on:
- Homebrew paths
- `launchd` or macOS service concepts leaking into Linux deployment
- BSD utility usage
- macOS filesystem conventions embedded in scripts or docs
- assumptions that reveal the system was never truly exercised on Linux

### Example failure patterns
- `/opt/homebrew/bin/...` hardcoded into Linux-targeted scripts
- deployment docs reference `brew services` rather than Linux-native service control
- project contains Linux deployment plan but core scripts still reflect macOS tooling

---

## What This Lens Should Not Duplicate

This lens should not become a generic infrastructure, secrets, or dependency review.

Avoid using it to re-run:
- secret scanning → Security stages / Secrets-oriented lenses
- dependency CVE analysis → Supply-chain stages
- generic auth, injection, and application security review → Security stages
- full observability architecture review → Production 3
- backup/recovery design → Production 8
- business logic or feature-correctness review → Code stages

Instead, this lens should focus on **Linux runtime truth**:
- paths
- shell behavior
- service/process behavior
- packaging/install viability
- environment assumptions

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Linux Platform Lens Summary
- Overall Linux readiness posture:
- Highest-risk Linux execution failure:
- Most serious environment/path assumption:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Shell & script portability | PASS / NEEDS_WORK / BLOCK | ... |
| Filesystem layout & path assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| File permissions & ownership | PASS / NEEDS_WORK / BLOCK | ... |
| Service & process management | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Environment & runtime assumptions | PASS / NEEDS_WORK / BLOCK | ... |
| Packaging & installation behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Container & Docker correctness | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Networking & port binding assumptions | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Logging & runtime artifacts | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Linux-specific hardening readiness | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Scheduled/background execution behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| macOS-origin artifact detection | PASS / NEEDS_WORK / BLOCK | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- File / config / deployment artifact:
- Evidence:
- Linux impact:
- Why it matters:
- Fix direction:

### Linux Lens Blockers
- Blocking Linux-specific issues:
- Deployment-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- the project is likely to fail to start, run, or persist correctly on Linux
- service/process behavior is materially broken for intended Linux deployment
- filesystem, runtime, or packaging assumptions are clearly incompatible with Linux reality
- macOS/dev-machine assumptions make the Linux deployment untrustworthy

### NEEDS_WORK-level lens findings
Use when:
- the project is directionally Linux-compatible but fragile, incomplete, or operationally weak
- installation, logging, or service handling will likely create avoidable friction
- the system works only under a forgiving or handcrafted environment

### PASS-level lens findings
Use when:
- Linux runtime assumptions are explicit and credible
- service/process/install behavior is understandable and supportable
- the reviewer can explain how the system runs on Linux without relying on private dev-machine context

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- `sed -i ''` and other BSD/macOS shell-tool assumptions
- hardcoded Homebrew or `/Users/...` paths in Linux-targeted systems
- missing execute bits on scripts used by services or containers
- `systemd` units that rely on PATH or interactive shell behavior
- service definitions missing working directory, restart policy, or realistic user context
- logs written to repo-relative paths or directories the service user cannot write
- cron jobs that work only from a personal shell environment
- containers that technically build but are not trustworthy Linux runtime artifacts

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Workflow & Automation Reliability** when Linux hosts run background jobs or orchestrations
- **Secrets & Trust Boundaries** when Linux service users, files, or runtime boundaries are unclear
- **Production stages** where Linux readiness affects deployment confidence directly
- **Cross-Platform Compatibility** when the project claims multi-OS support but deploys primarily on Linux

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand how this project runs on Linux, what assumptions it makes about paths, services, permissions, and runtime environment, and why it would continue to behave correctly outside the author’s personal machine.

If that statement cannot be made honestly, this lens should produce meaningful findings.

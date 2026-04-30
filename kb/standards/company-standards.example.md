---
type: standard
standard_name: company-standards
version: 0.1
updated: 2026-04-28
# Uncomment to enable deterministic ship_audit checks. Every declared
# check must be binary pass/fail — no prose-judgment checks are supported.
# checks:
#   license_header: "Apache-2.0"          # SPDX id or literal header string; regex-matched in first 20 lines of every source file
#   required_files: ["LICENSE", "CHANGELOG.md", "README.md"]
#   branch_prefix: ["feat", "fix", "docs", "chore", "refactor"]
#   commit_style: "conventional"          # "conventional" is the only supported value today
---

# Company Standards

> **This is a template.** Fork it into `~/.vcf/kb/standards/company-standards.md`
> via `vcf standards init`, then fill in each section with your org's actual
> conventions. Every `_TBD_` placeholder is a decision you need to make.
> Agent-behavior rules (investigation before action, never fabricate, stop on
> failure, etc.) live in the vibe-coding primer — don't duplicate them here.
> This file is for *company policy*: versioning, licensing, conventions,
> branding.

## Versioning & release policy

_TBD_ — semver vs. calver? How are tags formatted (e.g. `v1.2.3`)? Which branch
is releasable? Who cuts releases?

## Ownership & review

_TBD_ — how are code-owners assigned? How many approvals does a PR need? Who
can merge? Which areas have named owners?

## Commit & branch conventions

_TBD_ — commit-message style (Conventional Commits? custom?), branch-name
prefixes, default branch name, merge vs. rebase.

## License & copyright headers

_TBD_ — which license (Apache-2.0? MIT? proprietary?), what header goes in
every source file, what goes in `LICENSE`.

## Dependency policy

_TBD_ — allowed license families, ban-lists, update cadence, who approves new
deps.

## Install & distribution conventions

_TBD_ — standard install locations for binaries/configs, package-manager
conventions, release-artifact naming.

## Test-coverage floor

_TBD_ — minimum coverage %, which test types are required (unit / integration /
e2e), when coverage is measured.

## Sub-standards (linked)

Link out to niche standards that only apply to some projects. Create any of
these via `vcf standards init` — stubs are in the KB under `standards/`.

- **Design system** — `~/.vcf/kb/standards/design-system.md` — colors, fonts,
  spacing, component library.
- **Brand** — `~/.vcf/kb/standards/brand.md` — voice, logo usage, messaging.
- **Privacy** — `~/.vcf/kb/standards/privacy.md` — data retention, PII
  handling, disclosure policy.

_TBD_ — add org-specific niches here (e.g. SRE runbooks, security-disclosure
process, vendor contracts).

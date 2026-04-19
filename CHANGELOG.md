# Changelog

All notable changes to `@vcf/kb` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This package ships markdown content (primers, best-practices, lenses, review stages, reviewer configs, standards) consumed by `@vcf/cli`. KB updates can ship independently of server releases within a compatible peer-dep range.

## [0.0.1-alpha.0] — 2026-04-19

Initial alpha. Seed + full legacy port complete.

### Added

- **Full KB corpus** ported from the Vibe Coding Framework 1.5 corpus:
  - 25 primers (mcp, vibe-coding, coding, security, production, and 20 more)
  - 41 best-practices (mcp, coding, security, production, LLM integration, etc.)
  - 21 lenses (accessibility, ai-systems, code-health, cost-efficiency, etc.)
  - 27 review stages (9 × code + 9 × security + 9 × production)
  - Reviewer configs (code / security / production)
  - Company standards + planner-standard
- **Frontmatter schemas** for each KB kind with `.passthrough()` semantics
  so author-facing metadata flows through while engine-critical fields
  remain required.
- **Port script + drift-check CI gate** (`npm run port` / `npm run port:check`).
- **Schema walker** (`npm run validate:kb`) that dispatches by directory and
  validates every `*.md` against its kind's schema.

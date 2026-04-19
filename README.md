# @kaelith-labs/kb

**Status:** alpha. Full legacy corpus ported. Not yet published to npm (awaiting tag + NPM_TOKEN).

The content half of the **Vibe Coding Framework MCP**: primers (discipline layer — _why_), best-practices (mechanics layer — _how_), lenses (focused review perspectives), review stages (27 total), reviewer configs, standards. Zero runtime code — this is a versioned markdown corpus that `@kaelith-labs/cli` reads through `vcf init` and `vcf update-primers`.

## What's inside

```
kb/
  primers/              25 files   what/why for planners
  best-practices/       41 files   how for builders
  lenses/               21 files   accessibility, security-surface, code-health, …
  review-system/
    code/                9 files   Stages 1–9 (project-def → release-confidence)
    security/            9 files   Stages 1–9 (threat-model → release-decision)
    production/          9 files   Stages 1–9 (service-def → governance)
  reviewers/             1 file    reviewer-code.md (security / production land next)
  standards/             2 files   company-standards.md, vibe-coding-primer.md
```

## Delivery model (seed-and-fork)

- `@kaelith-labs/cli` declares `@kaelith-labs/kb` in a `peerDependencies` range so KB updates can ship independently within a compatible band.
- `vcf init` copies `kb/` from `node_modules/@kaelith-labs/kb/` into the user's `~/.vcf/kb/`. The **server reads the user's copy**, never `node_modules`.
- `vcf update-primers` pulls the latest package, copies new files, and warns + skips on conflict (three-way merge is Phase 2).

This decouples content cadence from server cadence. You can fix a typo in a primer and ship a patch without touching the server.

## Schema contract

Every markdown file under `kb/<kind>/` must pass a Zod frontmatter schema (see `src/frontmatter.ts`). Schemas use `.passthrough()` semantics: the engine-critical fields (`type`, `primer_name` / `best_practice_name` / etc., `tags`, `version`, `updated`) are required; author-facing extras (`audience`, `supersedes`, `last_reviewed`, routing notes) ride along untouched.

Tag shape is enforced: lowercase kebab-case, matching the tag vocabulary `@kaelith-labs/cli`'s primer match engine expects.

## Using a fork

```yaml
# ~/.vcf/config.yaml
kb:
  root: /home/you/your-kb/kb
  upstream_package: "@your/kb"
```

Then `vcf update-primers` pulls from your fork's upstream, not the default `@kaelith-labs/kb`.

## Validation

```bash
npm run validate        # vitest + validate-kb + port:check (CI uses this)
npm run validate:kb     # walk kb/, parse frontmatter, dispatch schema per dir
npm run port:check      # ensure kb/ byte-for-byte matches source docs after transforms
```

## Pins

- Schema layer: **Zod ^4**
- Node: **≥ 20** (for validation scripts — the shipped package is markdown only)
- MCP spec compatibility tracked via `@kaelith-labs/cli`, not declared here.

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE). Contributions welcome under the same license.

## Links

- Server + CLI: [github.com/Kaelith-AI/vcf-cli](https://github.com/Kaelith-AI/vcf-cli)
- CHANGELOG: [./CHANGELOG.md](./CHANGELOG.md)

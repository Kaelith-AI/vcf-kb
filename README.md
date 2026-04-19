# @vcf/kb

**Status:** alpha — seed content only. Full KB port lands in milestone M9.

The content side of the Vibe Coding Framework MCP: primers, best-practices, lenses, review stages, reviewer configs, and company standards. Zero runtime code — this is a versioned markdown corpus that `@vcf/cli` reads via `vcf init` and `vcf update-primers`.

## Layout

```
kb/
  primers/            # discipline layer — what/why for planners
  best-practices/     # mechanics layer — how for builders
  lenses/             # focused review perspectives
  review-system/
    code/             # 9 stages
    security/         # 9 stages
    production/       # 9 stages
  reviewers/          # reviewer-<type>.md configs
  standards/          # company-standards.md, vibe-coding-primer.md
```

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

Contributions welcome under the same license; see the root repo's CONTRIBUTING guide (when published).

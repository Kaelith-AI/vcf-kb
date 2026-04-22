---
type: best-practices
best_practice_name: cli-shipping-operations
category: deployment
version: 1.0
updated: 2026-04-22
tags: [tsup, node, packaging, release, cross-platform, ci-cd, reliability]
---

# CLI Shipping Operations

## When to use

You have a working tsup-bundled CLI and need to turn it into a reliable release across
npm, Homebrew, and Scoop — verified before it reaches a user. The primer covers build
mechanics; this doc covers the ship pipeline.

## Smoke-test layer — two layers, always

Unit tests run source. They never catch flat-dist traps. Smoke tests run the
**installed artifact** in a temp dir against each install path (npm global, `npx`,
brew formula, Scoop manifest). Assertions per path:

1. Binary is on PATH (`which vcf` / `where vcf`).
2. `vcf --version` matches the exact string from `package.json`.
3. One meaningful command completes without error.

## Regression guard for the flat-dist trap

Add one smoke step that exercises a code path touching an ambient asset — template,
seeded KB file, or config — from the bundled entry point. If the walk-up pattern
from the primer is broken (`__dirname` instead of `findPackageRoot`), this step
fails where unit tests would not:

```sh
tmpdir=$(mktemp -d)
vcf init "$tmpdir"
ls "$tmpdir/.vcf/config.yaml" || exit 1   # asset resolved from dist/cli.js
```

## Version-pipeline discipline

One source of truth: `package.json`. Bake at build time:

```ts
import pkg from "../package.json" with { type: "json" };
export const VERSION = pkg.version;
```

Never maintain `src/version.ts` by hand. CI asserts before tagging that `vcf --version`
matches `node -p "require('./package.json').version"` — gate the release on mismatch.

## `bin` entry + shebang

Verify after every build:

```sh
head -1 dist/cli.js   # must be: #!/usr/bin/env node
```

tsup preserves shebangs from the source entry. A missing shebang is a silent binary
breakage on Linux/macOS. On Windows, npm generates `.cmd`/PowerShell shims — smoke
tests must invoke those, not the raw `.js` file.

## Provenance + OIDC publishes

`publishConfig: { provenance: true }` in `package.json`. All publishes happen from CI
(GitHub Actions, `id-token: write`). Tagging a commit kicks the release workflow.
`npm publish` from a laptop is forbidden — it cannot produce a provenance attestation
linking the tarball to the exact CI run that built it.

## Prereleases + dist-tags

`latest` must not advance on a prerelease:

```sh
npm publish --tag alpha          # 0.5.0-alpha.1; latest unchanged
npm dist-tag add pkg@0.5.0 latest  # only after stable promotion
```

Automate the promotion step in the release workflow, conditioned on the tag pattern
not matching `-alpha`/`-beta`. Without it, `npm install pkg` after a prerelease
silently installs the old stable.

## External deps vs bundled

For each dep, choose one deliberately:

- **Bundle**: correct for pure-JS deps; zero install-time footprint.
- **External**: required for native addons or very large deps — but must be in
  `dependencies`, not `devDependencies`, or users get a missing-module error on first run.

Bundling something you meant to external hides the problem until bundle size matters;
externaling without declaring it breaks users immediately.

## Reproducibility

Pin Node and tsup versions in CI (`.nvmrc` or Volta + `engines`). The release artifact
is the CI-built tarball; never rebuild locally and re-sign — drifting output makes
signed releases unverifiable.

## Forbid

- `npm publish` from a laptop — provenance is impossible; risks an unsigned artifact.
- Manually maintained `src/version.ts` — drifts from `package.json`; the bake pattern
  eliminates the class entirely.
- Smoke covering only the npm-global install path — leaves brew and Scoop dark.
- Advancing `latest` on a prerelease — moves all `npm install` users to unstable.
- Externaling a dep without declaring it in `dependencies` — first-run missing-module.
- Skipping the post-build shebang check — silent binary breakage on Linux/macOS.

## See also

- `primers/tsup-bundling-for-cli.md` — flat-dist mechanics, walk-up pattern, shebang
  and ESM traps.
- `best-practices/cross-platform-installer.md` — npm/brew/Scoop install flows and
  platform path conventions.
- `best-practices/install-uninstall.md` — first-run seeding, config/KB initialization.
- `best-practices/versioning-migration.md` — semver semantics, breaking-change gates.

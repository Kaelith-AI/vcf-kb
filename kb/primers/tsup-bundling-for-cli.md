---
type: primer
primer_name: tsup-bundling-for-cli
category: toolchain
version: 1.0
updated: 2026-04-22
tags: [tsup, typescript, esm, node, packaging, cross-platform, cli-ux]
---

# tsup for Node CLI Bundling — the Flat-Dist Trap

## When to use

You ship a TypeScript CLI to npm. You want zero-config-feeling builds, ESM-first output, and a single binary users can run without a postinstall build. tsup (on esbuild) is the pragmatic default. It's fast, it's ESM-native, and 95% of projects need zero customization.

## Read this first

tsup's default output layout is **flat**, not mirrored from src/. Given:

```
src/
  cli.ts
  mcp.ts
  util/templates.ts
```

With `tsup src/cli.ts src/mcp.ts`, dist becomes:

```
dist/
  cli.js
  mcp.js
```

`src/util/templates.ts` is inlined into whichever entry imported it — there's no `dist/util/templates.js`. This is correct, efficient behavior. It is also a trap for any code that uses `__dirname` as if the installed layout mirrored source.

## The trap

Any file that computes paths relative to itself breaks between dev (tsx-runs-source) and prod (tsup-bundled-dist). Classic failure:

```ts
// src/util/templates.ts
const TPL_DIR = resolve(__dirname, "..", "..", "templates"); // works in dev, fails in prod
```

In dev, `__dirname = {pkg}/src/util/` → TPL_DIR = `{pkg}/templates/` ✅.
In prod, `__dirname = {pkg}/dist/` → TPL_DIR = `{pkg-parent}/templates/` — ENOENT.

Symptom: unit tests pass (they run source), smoke tests pass if they don't exercise the affected code path, real users on `npm install` hit the missing-file error on the first meaningful command.

## Pattern — walk up to the nearest package.json

Resolve ambient paths (templates, schemas, seeded KB, migration files) by walking up from the current file to the nearest `package.json`, then resolving from there:

```ts
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function findPackageRoot(startDir: string, maxDepth = 8): string {
  let dir = startDir;
  for (let i = 0; i < maxDepth; i++) {
    if (existsSync(resolve(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`no package.json found walking up from ${startDir}`);
}

const PKG_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const TPL_DIR = resolve(PKG_ROOT, "templates");
```

Works in both dev and bundled layouts. Capped at 8 levels so a botched install can't loop.

## Other tsup realities

- **ESM output, `import.meta.url`:** use `fileURLToPath(import.meta.url)` to get the current file's path. `__dirname` works under `format: "esm"` too (tsup polyfills it), but `import.meta.url` is the portable pattern.
- **Shebang:** add `#!/usr/bin/env node` at the top of your entry; tsup preserves shebangs on files listed in `bin` in `package.json`. Don't try to prepend it at build time.
- **External vs bundled:** mark heavy runtime deps as `external` (node:* built-ins are always external). Everything else gets bundled — smaller surface, faster cold start.
- **Types:** tsup's `dts: true` uses tsc under the hood; it's fine for libraries but slower. For CLIs you don't ship types for, leave it off.

## Forbid

- Hardcoded `"..", "..", ..., "src"` / `"..", "..", "templates"` path walks. They couple source layout to runtime resolution.
- Reading `package.json` path from a hardcoded depth assumption.
- `require.resolve`-based tricks in ESM output — they don't work reliably across bundlers.
- Shipping a CLI without a packaging smoke test that runs the installed binary against a real temp dir. Unit tests running source don't catch flat-dist traps.

## See also

- `primers/cross-platform-installer.md` — npm + brew + scoop install paths.
- `best-practices/install-uninstall.md` — first-run seeding of config/KB content.
- `best-practices/cross-platform-installer.md` — packaging end-to-end.

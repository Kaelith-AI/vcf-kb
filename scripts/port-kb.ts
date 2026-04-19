// KB bulk port + drift check.
//
// Mirrors `../docs/` (the legacy corpus) into `kb/` with a known convention:
//
//   docs/primers/<X>-PRIMER.md         → kb/primers/<slug>.md        (slug = frontmatter.primer_name)
//   docs/best-practices/<X>-Best-Practices.md → kb/best-practices/<slug>.md
//   docs/lenses/<X>.md                 → kb/lenses/<X>.md            (already-slug filenames)
//   docs/review-system/<type>/NN-*.md  → kb/review-system/<type>/NN-<slug>.md
//                                         (frontmatter injected on port — source has none)
//   docs/review-system/<type>/README.md → skipped (not KB content)
//
// Hand-authored, non-ported files stay untouched:
//   kb/standards/*.md
//   kb/reviewers/*.md
//
// Usage:
//   npm run port               → bulk-copy from docs/ into kb/ with injection
//   npm run port:check         → CI gate that fails if any target diverges

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DOCS_ROOT = resolve(REPO_ROOT, "..", "docs");
const KB_ROOT = resolve(REPO_ROOT, "kb");

interface PortEntry {
  source: string;
  target: string;
  /**
   * Optional transform run on the raw body before writing. Returns the body
   * to write to `target`. Undefined = byte-for-byte copy (for drift-check
   * stability).
   */
  transform?: (raw: string) => string;
}

// ---- build the port map by walking the docs tree ----------------------------

async function buildMap(): Promise<PortEntry[]> {
  const entries: PortEntry[] = [];

  const isReadme = (name: string): boolean =>
    /^readme(-.*)?\.md$/i.test(name) || /^README(-.*)?\.md$/.test(name);

  // Primers.
  for (const name of await readdirOrEmpty(join(DOCS_ROOT, "primers"))) {
    if (!name.endsWith(".md") || isReadme(name)) continue;
    const source = join(DOCS_ROOT, "primers", name);
    const slug = await readSlug(source, "primer_name", deriveSlugFromFilename(name, "-PRIMER"));
    entries.push({ source, target: join(KB_ROOT, "primers", `${slug}.md`) });
  }

  // Best-practices.
  for (const name of await readdirOrEmpty(join(DOCS_ROOT, "best-practices"))) {
    if (!name.endsWith(".md") || isReadme(name)) continue;
    const source = join(DOCS_ROOT, "best-practices", name);
    const slug = await readSlug(
      source,
      "best_practice_name",
      deriveSlugFromFilename(name, "-Best-Practices"),
    );
    entries.push({ source, target: join(KB_ROOT, "best-practices", `${slug}.md`) });
  }

  // Lenses (already slug-named in source).
  for (const name of await readdirOrEmpty(join(DOCS_ROOT, "lenses"))) {
    if (!name.endsWith(".md") || isReadme(name)) continue;
    entries.push({
      source: join(DOCS_ROOT, "lenses", name),
      target: join(KB_ROOT, "lenses", name),
    });
  }

  // Review-system: 27 stage files.
  for (const type of ["code", "security", "production"] as const) {
    for (const name of await readdirOrEmpty(join(DOCS_ROOT, "review-system", type))) {
      if (!name.endsWith(".md")) continue;
      if (name === "README.md") continue;
      const source = join(DOCS_ROOT, "review-system", type, name);
      const stageMatch = /^(\d{2})-(.+)\.md$/.exec(name);
      if (!stageMatch) continue;
      const stage = Number.parseInt(stageMatch[1]!, 10);
      const slug = stageMatch[2]!;
      entries.push({
        source,
        target: join(KB_ROOT, "review-system", type, name),
        transform: (raw) => injectStageFrontmatter(raw, type, stage, slug),
      });
    }
  }

  return entries;
}

// ---- frontmatter injection for stage files ---------------------------------

function injectStageFrontmatter(raw: string, type: string, stage: number, slug: string): string {
  if (raw.startsWith("---")) return raw; // already has frontmatter
  const stageName = slug
    .split("-")
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
  const fm = [
    "---",
    "type: review-stage",
    `review_type: ${type}`,
    `stage: ${stage}`,
    `stage_name: "${stageName}"`,
    "version: 1.0",
    "updated: 2026-04-18",
    "---",
    "",
  ].join("\n");
  return fm + raw;
}

// ---- slug helpers ----------------------------------------------------------

async function readSlug(source: string, field: string, fallback: string): Promise<string> {
  const raw = await readFile(source, "utf8");
  if (!raw.startsWith("---")) return fallback;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return fallback;
  const block = raw.slice(3, end);
  const re = new RegExp("^\\s*" + field + ":\\s*(.+)\\s*$", "m");
  const m = re.exec(block);
  if (!m) return fallback;
  let value = m[1]!.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return slugify(value) || fallback;
}

function deriveSlugFromFilename(name: string, stripSuffix: string): string {
  const bare = basename(name, ".md");
  const trimmed = bare.endsWith(stripSuffix) ? bare.slice(0, -stripSuffix.length) : bare;
  return slugify(trimmed);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readdirOrEmpty(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

// ---- copy / check ----------------------------------------------------------

async function sha(buf: Buffer | string): Promise<string> {
  return createHash("sha256")
    .update(typeof buf === "string" ? buf : buf)
    .digest("hex");
}

async function runCopy(entries: PortEntry[]): Promise<void> {
  for (const e of entries) {
    const raw = await readFile(e.source, "utf8");
    const body = e.transform ? e.transform(raw) : raw;
    await mkdir(dirname(e.target), { recursive: true });
    await writeFile(e.target, body, "utf8");
  }
  process.stderr.write(`port-kb: copied ${entries.length} file(s)\n`);
}

async function runCheck(entries: PortEntry[]): Promise<number> {
  let drift = 0;
  for (const e of entries) {
    const src = await readFile(e.source, "utf8").catch(() => null);
    const tgt = await readFile(e.target, "utf8").catch(() => null);
    if (src === null) {
      process.stderr.write(`port-kb: source missing: ${e.source}\n`);
      drift++;
      continue;
    }
    if (tgt === null) {
      process.stderr.write(
        `port-kb: target missing (run 'npm run port' to regenerate): ${e.target}\n`,
      );
      drift++;
      continue;
    }
    const expected = e.transform ? e.transform(src) : src;
    if ((await sha(expected)) !== (await sha(tgt))) {
      process.stderr.write(`port-kb: drift:\n  source: ${e.source}\n  target: ${e.target}\n`);
      drift++;
    }
  }
  return drift;
}

const mode = process.argv.includes("--check") ? "check" : "copy";
const map = await buildMap();

if (mode === "check") {
  const drift = await runCheck(map);
  if (drift > 0) {
    process.stderr.write(`port-kb: ${drift} drift(s) detected across ${map.length} file(s)\n`);
    process.exit(1);
  }
  process.stderr.write(`port-kb: no drift across ${map.length} file(s)\n`);
} else {
  await runCopy(map);
}

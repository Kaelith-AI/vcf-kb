#!/usr/bin/env node
// Retrofit `tags:` frontmatter onto existing KB primers + best-practices.
// One-shot: reads the map below, opens each file, inserts (or replaces)
// a `tags: [...]` line right after the frontmatter's `updated:` line.
// Idempotent: re-running overwrites to match the map.
//
// Tag vocabulary lives in kb/standards/tag-vocabulary.md. Any tag here
// that isn't in the vocabulary is a bug — vocabulary wins, map yields.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = join(__dirname, "..", "kb");

const PRIMER_TAGS = {
  "automated-agents":          ["llm", "agent-orchestration", "tool-use", "project-planning"],
  "claude-code-agents":        ["claude-code", "llm", "agent-orchestration", "skill-authoring"],
  "coding":                    ["vibe-coding", "maintainability", "testability", "determinism"],
  "content-moderation-safety": ["security", "content-moderation", "trust-boundary"],
  "cross-platform-installer":  ["packaging", "cross-platform", "cli-ux", "npm", "homebrew"],
  "discord":                   ["discord", "webhook", "trust-boundary"],
  "docker-compose":            ["docker", "docker-compose", "production"],
  "front-matter-and-documentation": ["documentation", "schema-design", "maintainability"],
  "git-change-safety":         ["release", "versioning", "vibe-coding"],
  "kaelith-identity-and-branding": ["branding"],
  "library-sdk":               ["api-design", "packaging", "npm", "dx"],
  "llm-integration":           ["llm", "prompt-engineering", "tool-use", "structured-output"],
  "mcp":                       ["mcp", "json-rpc", "llm", "api-design", "token-economy", "trust-boundary"],
  "n8n":                       ["n8n", "webhook", "agent-orchestration"],
  "named-actions-pattern":     ["api-design", "naming", "structured-output"],
  "nginx":                     ["nginx", "production", "reliability"],
  "ollama":                    ["ollama", "llm", "local-inference", "node"],
  "production":                ["production", "reliability", "observability", "incident-recovery"],
  "project-planning":          ["project-planning", "vibe-coding", "documentation"],
  "qdrant":                    ["qdrant", "embeddings", "rag"],
  "rag":                       ["rag", "embeddings", "llm"],
  "security":                  ["security", "trust-boundary", "redaction", "supply-chain"],
  "skill-creation":            ["claude-code", "skill-authoring", "documentation"],
  "systemd":                   ["systemd", "production"],
  "vibe-coding":               ["vibe-coding", "project-planning", "api-design"],
};

const BP_TAGS = {
  "admin-operator":                    ["cli-ux", "production", "monitoring"],
  "analytics-observability-implementation": ["observability", "monitoring", "production"],
  "api-webhook-contract":              ["api-design", "webhook", "schema-design"],
  "automated-agents":                  ["llm", "agent-orchestration", "tool-use"],
  "claude-code-coding-agent":          ["claude-code", "agent-orchestration", "skill-authoring"],
  "coding":                            ["vibe-coding", "maintainability", "testability"],
  "community-moderation-operations":   ["content-moderation"],
  "content-integrity":                 ["content-moderation", "trust-boundary"],
  "content-moderation-safety":         ["security", "content-moderation"],
  "cost-efficiency":                   ["cost-efficiency", "token-economy", "performance"],
  "cross-platform-installer":          ["packaging", "cross-platform", "npm", "homebrew"],
  "data-integrity":                    ["data-model", "reliability", "sqlite", "migration"],
  "discord":                           ["discord", "webhook"],
  "docker-compose":                    ["docker", "docker-compose", "production"],
  "front-matter-and-documentation":    ["documentation", "schema-design"],
  "git-change-safety":                 ["release", "versioning", "vibe-coding"],
  "incident-rollback-recovery":        ["incident-recovery", "rollback", "production"],
  "install-uninstall":                 ["packaging", "cli-ux", "cross-platform"],
  "integration-boundary":              ["api-design", "trust-boundary"],
  "kaelith-software-identity":         ["branding"],
  "legal-claims-messaging":            ["branding", "documentation"],
  "library-sdk":                       ["api-design", "packaging", "npm", "dx"],
  "llm-integration":                   ["llm", "prompt-engineering", "tool-use"],
  "mcp":                               ["mcp", "json-rpc", "llm", "api-design", "token-economy"],
  "multi-tenant-design":               ["authn-authz", "data-model", "security"],
  "named-actions-pattern":             ["api-design", "naming"],
  "nginx":                             ["nginx", "production"],
  "ollama-local-llm":                  ["ollama", "llm", "local-inference"],
  "production":                        ["production", "reliability", "observability"],
  "project-planning":                  ["project-planning", "vibe-coding", "documentation"],
  "prompt-model-economics":            ["token-economy", "cost-efficiency", "llm", "prompt-engineering"],
  "qdrant":                            ["qdrant", "embeddings", "rag"],
  "rag":                               ["rag", "embeddings", "llm"],
  "security":                          ["security", "trust-boundary", "supply-chain", "redaction"],
  "skill-creation":                    ["claude-code", "skill-authoring"],
  "social-media":                      ["branding", "content-moderation"],
  "systemd":                           ["systemd", "production"],
  "versioning-migration":              ["versioning", "migration", "release"],
  "vibe-coding":                       ["vibe-coding", "project-planning"],
  "youtube-media-channel":             ["branding", "content-moderation"],
};

function retrofit(filePath, tags) {
  const raw = readFileSync(filePath, "utf8");
  if (!raw.startsWith("---")) {
    throw new Error(`${filePath}: no frontmatter opener`);
  }
  const end = raw.indexOf("\n---", 3);
  if (end < 0) throw new Error(`${filePath}: no frontmatter closer`);
  const fm = raw.slice(4, end);
  const body = raw.slice(end);

  const lines = fm.split("\n");
  const tagsLine = `tags: [${tags.join(", ")}]`;

  // Replace existing `tags:` line if present; else insert after `updated:`.
  const tagIdx = lines.findIndex((l) => /^tags\s*:/.test(l));
  if (tagIdx >= 0) {
    lines[tagIdx] = tagsLine;
  } else {
    const updIdx = lines.findIndex((l) => /^updated\s*:/.test(l));
    if (updIdx < 0) throw new Error(`${filePath}: no "updated:" line to anchor tag insertion`);
    lines.splice(updIdx + 1, 0, tagsLine);
  }

  const out = "---\n" + lines.join("\n") + body;
  writeFileSync(filePath, out);
  return tagsLine;
}

function walk(dir, tagMap) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    const slug = name.slice(0, -3);
    const tags = tagMap[slug];
    if (!tags) {
      out.push({ path: join(dir, name), err: "no tags in map" });
      continue;
    }
    try {
      const line = retrofit(join(dir, name), tags);
      out.push({ path: join(dir, name), line });
    } catch (e) {
      out.push({ path: join(dir, name), err: e.message });
    }
  }
  return out;
}

const primerResults = walk(join(KB_ROOT, "primers"), PRIMER_TAGS);
const bpResults = walk(join(KB_ROOT, "best-practices"), BP_TAGS);

let errs = 0;
for (const r of [...primerResults, ...bpResults]) {
  if (r.err) {
    console.error(`ERR  ${r.path} — ${r.err}`);
    errs++;
  } else {
    console.log(`OK   ${r.path}  →  ${r.line}`);
  }
}

console.log("");
console.log(`Primers:  ${primerResults.filter((r) => !r.err).length}/${primerResults.length}`);
console.log(`BPs:      ${bpResults.filter((r) => !r.err).length}/${bpResults.length}`);
console.log(`Errors:   ${errs}`);
process.exit(errs > 0 ? 1 : 0);

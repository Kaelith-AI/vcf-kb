---
type: standard
standard_name: tag-vocabulary
version: 1.0
updated: 2026-04-22
---

# KB Tag Vocabulary

> Controlled list of tags used in KB entries' `tags:` frontmatter. The
> `spec_suggest_primers` / `plan_context` matcher is tag-overlap Jaccard
> against a spec's `tech_stack` + `lens`. If a tag isn't in the spec or
> isn't on the primer, they can't match. This file is the contract for
> both sides: specs draw `tech_stack` + `lens` from here, primers draw
> `tags` from here.

## Rules

- **Use only the terms in this file.** Invent a new tag only if the concept is reused in ≥2 entries and a PR adds it here first.
- **Lowercase kebab, one-word-when-possible** (regex `^[a-z][a-z0-9-]*$`).
- **Every primer / best-practice lists 3–8 tags.** Fewer = invisible to the matcher. More = tag drift and noise.
- **Mix freely: tech tags and lens tags live in the same flat `tags:` array.** The matcher treats them uniformly; the split below is authoring guidance.

## Tech tags

### Languages + runtimes
`node`, `typescript`, `python`, `bash`, `sql`, `yaml`, `deno`, `bun`

### Protocols + wire formats
`mcp`, `json-rpc`, `http`, `stdio`, `sse`, `websocket`, `openapi`

### Node ecosystem
`zod`, `commander`, `vitest`, `tsup`, `esm`, `modelcontextprotocol-sdk`, `nodejs-builtin`

### Data + storage
`sqlite`, `node-sqlite`, `better-sqlite3`, `postgres`, `qdrant`, `redis`, `embeddings`

### LLM providers + clients
`llm`, `ollama`, `openai`, `openrouter`, `anthropic`, `litellm`, `claude-code`, `codex`, `gemini-cli`, `cursor`

### AI patterns
`rag`, `tool-use`, `prompt-engineering`, `structured-output`, `local-inference`, `agent-orchestration`

### Infra + deploy
`docker`, `docker-compose`, `systemd`, `nginx`, `github-actions`, `homebrew`, `npm`, `scoop`

### Integrations
`discord`, `n8n`, `webhook`

## Lens tags

### Design
`api-design`, `schema-design`, `surface-design`, `data-model`, `naming`

### Quality
`testability`, `maintainability`, `determinism`, `observability`, `reliability`

### Security + trust
`security`, `trust-boundary`, `redaction`, `supply-chain`, `sandbox`, `authn-authz`

### Performance + economy
`performance`, `token-economy`, `latency`, `cold-start`, `cost-efficiency`

### Delivery + lifecycle
`packaging`, `release`, `versioning`, `migration`, `ci-cd`, `cross-platform`

### Ops
`production`, `incident-recovery`, `rollback`, `monitoring`, `audit-trail`

### UX + DX
`cli-ux`, `error-messages`, `dx`, `documentation`

### Process
`project-planning`, `vibe-coding`, `skill-authoring`, `agent-design`, `content-moderation`, `branding`

## When to add a tag

1. You hit an entry that deserves tag X, and X isn't here.
2. ≥2 entries want it. (One-off = use a closely-adjacent existing tag instead.)
3. Add it in a PR alongside the entries that use it. No drive-by additions.

## When to retire a tag

1. Zero entries use it for one release cycle.
2. A broader tag covers the cases that once used it.
3. Mark with `~~`strikethrough`~~` for one release, then remove.

## See also

- `standards/company-standards.md` — author-facing non-negotiables.
- `primers/front-matter-and-documentation.md` — schema-level frontmatter rules.

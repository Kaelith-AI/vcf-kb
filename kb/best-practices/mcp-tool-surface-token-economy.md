---
type: best-practices
best_practice_name: mcp-tool-surface-token-economy
category: ai
version: 1.0
updated: 2026-04-22
tags: [mcp, api-design, token-economy, surface-design, llm, cli-ux]
---

# MCP Tool-Surface Token Economy

## When to use

You're designing a new MCP tool, re-shaping an existing one, or auditing your surface before 1.0. Every tool call's envelope is LLM context someone pays for — the client either burns tokens re-reading it or misses information it needed. Get the shape right once; paying later is expensive.

## The envelope contract

Every tool returns an envelope:

```
{ ok: true | false, paths?: string[], summary: string, content?: object, expand_hint?: string, ...rest }
```

- **`paths`** — file system artifacts the tool produced or read. Always small, always the LLM's primary navigation aid.
- **`summary`** — one human-readable sentence. The LLM's "did this work?" signal.
- **`content`** — the expensive payload. Present **only when `expand=true`** in the input. Default off.
- **`expand_hint`** — when `expand=false`, a one-liner telling the caller how to get the content if they want it.

**Rule:** a tool call with default args returns paths + summary in ≤300 tokens. Expanded, it returns whatever the job requires.

## Prepare / execute split

Tools that read context, assemble prompts, and then call an LLM should split into two calls:

- **`foo_prepare`** — validate args, snapshot state, assemble context. Returns a `run_id`. Cheap, no LLM.
- **`foo_execute`** — takes the `run_id`, calls the LLM, returns the verdict. Expensive, the one the user pays for.

Benefits: clients can dry-run prepare, inspect the snapshot, and only fire execute when ready. Execute failures don't re-do the prepare work. Replay is free. Prepare+execute each get one audit row; the full flow is reconstructable.

## Input schemas — strict + descriptive

- Every input schema is `.strict()`. Unknown keys raise `E_VALIDATION`, not silent drops. (If your host strips `.strict()`, see `zod-schema-discipline.md`.)
- Every field has `.describe("...")` — clients use these as the in-prompt tooltip.
- Default boolean flags in the direction of smaller output: `expand: z.boolean().default(false)`, `verbose: z.boolean().default(false)`, `force: z.boolean().default(false)`.

## Output code discipline

Error codes form a closed set. Document every one. Suggested base set:

- `E_VALIDATION` — schema parse failed.
- `E_NOT_FOUND` — referenced file/row/run doesn't exist.
- `E_ALREADY_EXISTS` — would overwrite without `force`.
- `E_STATE_INVALID` — tool requires a scope/state the server isn't in.
- `E_SCOPE_DENIED` — path escapes `allowed_roots`.
- `E_TIMEOUT` — subprocess or network timeout.
- `E_INTERNAL` — bug. Captured by telemetry if enabled.

Every error surfaces on the same `{ ok: false, code, message }` shape. No tool-specific error dialects.

## Tool surface size

Aim for a **small surface** with **composable tools** over a big surface with specialty tools. Two primitives:

- If two tools differ only in a flag, they should be one tool with the flag.
- If a tool does two unrelated jobs, it should be two tools.

Watch the count. Past ~35 tools, LLMs skim descriptions faster than they read them. A tool that never gets called is dead weight in every prompt.

## Forbid

- Returning large content unconditionally. Users pay for bytes they didn't ask for.
- Tool-specific error dialects — "E_FOO_FAILED" when `E_INTERNAL` would do.
- Free-form text in `summary`. Machine-parseable summary beats poetic summary.
- Leaking file paths not under `allowed_roots` in envelope content.
- Prepare/execute pairs that can't be replayed — always snapshot the input at prepare time.

## See also

- `primers/mcp.md` — protocol background.
- `primers/zod-schema-discipline.md` — schema traps that undermine this contract.
- `best-practices/cost-efficiency.md` — token pricing context.

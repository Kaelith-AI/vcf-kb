---
type: primer
primer_name: ollama-runtime-options
category: tools
version: 1.0
updated: 2026-04-22
tags: [ollama, local-inference, llm, token-economy, observability, reliability]
---

# Ollama Runtime Options — the Silent-Cap Trap

## Read this first

Ollama has two personalities: the **native API** (`/api/chat`, `/api/generate`, `/api/embeddings`) and the **OpenAI-compatible shim** (`/v1/chat/completions`). Both accept model-runtime tuning — `num_ctx`, `num_predict`, `temperature`, `repeat_penalty`, etc. — but in **different request shapes**, and one path silently drops unrecognized keys.

If you send an OpenAI-shaped request body to `/v1/chat/completions` and put `num_ctx` at the top level, **Ollama ignores it**. The model runs with whatever default context the Modelfile sets — and if the Modelfile doesn't set one, **Ollama caps context at 2048 tokens regardless of the model's native capability**.

A 262k-context model, called naively through the OpenAI shim, reads your first 2k tokens. Everything after is invisible to the model. No error. No warning. The model just gives a worse answer and you can't tell why.

## The options block

Both endpoints accept runtime tuning inside an `options` object:

### Native `/api/chat`:
```json
{
  "model": "qwen3-coder:30b",
  "messages": [...],
  "options": { "num_ctx": 131072, "num_predict": 8192, "temperature": 0.2 }
}
```

### OpenAI shim `/v1/chat/completions`:
Same model, same wire — but Ollama-specific keys go in the **same top-level `options` field**, not the OpenAI body:
```json
{
  "model": "qwen3-coder:30b",
  "messages": [...],
  "temperature": 0.2,
  "options": { "num_ctx": 131072, "num_predict": 8192 }
}
```

**OpenAI SDKs will not add `options` for you.** You must pass it as an extra body field (most SDKs support a passthrough; `openai`-node's `{...request, body_options: {...}}` or just constructing the JSON manually).

## Two places to set context

1. **Modelfile `PARAMETER num_ctx 131072`** — baked into the model at `ollama create` / `ollama run` time. Sensible default for interactive use. Survives across all callers. Cost: rebuilds the model artifact.
2. **Per-request `options.num_ctx`** — overrides the Modelfile per call. Use when different roles need different sizes (a reviewer wants 128k; an embedder ignores the param).

**For hosted servers, prefer the Modelfile.** Per-request-only is fragile: every caller must remember, a new caller hits the 2048 cap silently.

## Common parameters worth knowing

| Parameter | Default | When to set |
|---|---|---|
| `num_ctx` | 2048 unless Modelfile | Always — set to model's native context |
| `num_predict` | -1 (open) | Set if you want bounded output (audit-friendly) |
| `temperature` | 0.8 | 0.0–0.2 for structured / reviewer / planner roles |
| `top_p` | 0.9 | Rarely touched |
| `repeat_penalty` | 1.1 | 1.0 if output looks over-sanitized |
| `stop` | [] | Use `response_format: json_schema` first; `stop` is legacy |
| `keep_alive` | 5m | `"60m"` for idle-until-next-review patterns |

## Forbid

- Relying on Ollama defaults for `num_ctx`. Always explicit.
- Passing Ollama-specific options at the top level of an OpenAI-shaped request. They vanish.
- Assuming the model you pulled has the Modelfile params you expect — `ollama show <name> --modelfile` and verify.
- Trusting "long prompt produced a bad answer" as a model-quality finding without first checking whether context got truncated.

## See also

- `primers/ollama.md` — general Ollama usage.
- `best-practices/ollama-local-llm.md` — server topology, keep_alive, multi-model hosting.
- `best-practices/prompt-model-economics.md` — when to burn tokens on context vs. chunking.

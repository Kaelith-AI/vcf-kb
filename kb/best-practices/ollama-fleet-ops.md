---
type: best-practices
best_practice_name: ollama-fleet-ops
category: ai
version: 1.0
updated: 2026-04-22
tags: [ollama, local-inference, production, observability, reliability, cost-efficiency]
---

# Ollama Fleet Operations

## When to use

Multiple callers hit a single Ollama host: reviewer agent, embedder, planner, interactive chat. This is not a "getting started" doc — it covers the operational hazards that appear only when roles compete for a shared GPU.

## GPU memory discipline

VRAM = model weights + KV cache per active context. Both scale independently.

A 30B model at Q4 consumes ~20 GB of weights before a single token is generated. Add `num_ctx=131072` and each active request adds ~4–8 GB of KV cache (architecture-dependent). Two concurrent requests at full context on a 24 GB card will OOM silently — Ollama returns a 500, logs nothing useful by default.

**Sizing rule:** weight footprint + (max_parallel × per-request KV headroom) + 2 GB OS/driver overhead ≤ total VRAM. Run one coding model and one embedding model simultaneously only if their combined weight footprint leaves room for at least one full KV cache slot.

**Rotation over co-residence:** if VRAM is tight, prefer explicit model rotation via `keep_alive=0m` on roles that run in batches (embedder, one-shot reviewer) rather than keeping both models warm. A cold load is ~3–10 s; an OOM mid-request is a failed call.

## `keep_alive` per role

Never use a single `keep_alive` for all callers.

| Role | Pattern | keep_alive |
|---|---|---|
| Interactive chat | bursty, short inter-call gap | `10m`–`30m` |
| Sequential reviewer | long run, predictable cadence | `60m`–`120m` |
| Embedder batch | short-lived, VRAM expensive at scale | `0m` (evict immediately) |
| Planner (infrequent) | rare, expensive model | `5m` default or explicit evict post-run |

Set `keep_alive` per request via the `options` block or the `keep_alive` top-level field on the native API. Do not rely on the server default — it changes across Ollama versions.

## Concurrency

Ollama serializes per model by default (`OLLAMA_NUM_PARALLEL=1`). Bumping this duplicates the active KV cache in VRAM per additional parallel slot. The math is unforgiving: `num_parallel=2` at `num_ctx=131072` doubles KV memory for that model.

For fleet use: set `OLLAMA_NUM_PARALLEL` to the number of concurrent callers you can fund with VRAM, not the number of callers you have. Reject excess requests upstream (queue in your orchestrator, not inside Ollama). Ollama's built-in queue is not tunable.

`OLLAMA_MAX_LOADED_MODELS` controls how many distinct models stay warm simultaneously. Default is 1 on GPU. Raise it only when you have the VRAM budget.

## Modelfile CI

Modelfile changes are code changes. Every `ollama create` must be:

1. Version-controlled alongside the project that depends on the variant.
2. Scripted and idempotent — a `make models` or `scripts/create-models.sh` that can be re-run safely.
3. Reviewed before promotion — a `num_ctx` bump or system-prompt change silently affects every caller using that model name.

Never run `ollama create` interactively in production. Drift between what's running and what's in source control is the primary cause of "the reviewer started giving different answers" incidents.

## Model rotation and deprecation

When upstream publishes `qwen3-coder:30b-v2`:

1. Add the new tag to your Modelfile/scripts. Do not rename the old one yet.
2. Run both tags concurrently against your eval harness (see `primers/llm-eval-harness.md`) on a fixed prompt set. A 2–5% regression is a blocker.
3. If evals pass, cut over callers one role at a time. Reviewer first (easiest to verify), interactive chat last (hardest to regress quietly).
4. Retire the old tag with `ollama rm` only after one full review cycle on the new tag. `ollama rm` is not undoable without a re-pull.

## Monitoring

Ollama does not ship Prometheus metrics natively. Instrument at the proxy or orchestrator layer:

- **`/api/ps`** — lists currently loaded models, their VRAM usage, and expiry time. Poll this on a 30 s interval to detect unexpected co-residence or stuck models.
- **Request count + queue depth** — track at the HTTP proxy (nginx, Caddy, or a thin sidecar). A rising 500-error rate is almost always GPU OOM; a rising 200-with-latency-spike is KV-cache thrash.
- **Per-model load time** — log the delta between request arrival and first token. Spike = cold load; sustained elevation = memory pressure forcing page-ins.

Alert on: `500_rate > 1%` over 5 min, `load_time_p95 > 15s`, `/api/ps` showing more loaded models than `OLLAMA_MAX_LOADED_MODELS`.

## Permissions and ownership

Run the Ollama daemon as a dedicated service user (`ollama` or similar). Model blobs live under a path like `/srv/ollama/models/`. Operators who need to `ollama create` or `ollama pull` from a separate console user must be in the daemon's group to write the blobs directory. Pattern:

```
chown -R ollama:ollama /srv/ollama/models/
chmod -R g+rwX /srv/ollama/models/
usermod -aG ollama <operator-user>
```

Never run `ollama serve` as root. The daemon has network access and executes model weights; the blast radius of a compromised model should not include the rest of the host.

## Pull and disk discipline

`ollama pull` is layer-cached — re-pulling a tag you already have is a metadata check plus any changed layers. It is safe to re-run in CI. `ollama prune` removes blobs not referenced by any model name; run it after retiring a tag, not before. Manual `rm` against the blobs directory bypasses the manifest index and can corrupt subsequent pulls. If `prune` is unavailable in your Ollama version, `ollama rm <tag>` removes both the manifest and the blob references cleanly.

Watch disk: a 30B Q4 model is 18–20 GB. Two generations of the same model (old + new during rollover) plus embeddings can exceed 50 GB before you notice. Mount the models directory on its own volume with alerting at 80% capacity.

## Forbid

- A single `keep_alive` value set globally for all roles. Roles have different eviction needs; one value will either waste VRAM or cause cold loads at the wrong moment.
- Running `ollama create` interactively without scripting. If it isn't repeatable, it isn't safe to promote.
- Treating a 500 from Ollama as a model-quality problem before checking GPU memory. OOM is the more common cause.
- Raising `OLLAMA_NUM_PARALLEL` without first calculating KV-cache VRAM cost at the `num_ctx` you're actually using.
- Using `rm -rf` against the blobs directory to "free space." Use `ollama rm` or `ollama prune` to keep the manifest consistent.
- Co-residing a large coding model and a large embedding model without a measured VRAM budget. Assume they cannot co-reside on a 24 GB card and prove otherwise before committing to the architecture.

## See also

- `primers/ollama-runtime-options.md` — `num_ctx` silent-cap trap, options-block shapes, Modelfile vs per-request tuning.
- `best-practices/ollama-local-llm.md` — model selection, hardware fit, privacy and fallback design.

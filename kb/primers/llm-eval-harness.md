---
type: primer
primer_name: llm-eval-harness
category: tools
version: 1.0
updated: 2026-04-22
tags: [llm, prompt-engineering, observability, testability, determinism, token-economy]
---

# LLM Eval Harness — Comparing Models on One Workload

## When to use

You have two or more candidate models (local vs frontier, different families, prompt variants) and need evidence for which to route work to. This primer is for comparison, not accuracy-scoring against ground truth — that's a different problem.

## Three rules before you start

1. **Fix the workload, vary the model.** Same prompt, same input, same temperature (typically 0.0 or 0.2 for comparison runs). One variable at a time.
2. **Capture both verdict AND metadata.** Duration, token counts, fingerprint of the finding set, whether the output parsed. The verdict alone hides half the signal.
3. **Disagreement is the signal you want.** If two models always agree, you don't need both. The interesting cases are where they disagree — that's where you learn which direction to trust.

## Matrix shape

Rows = stages / test cases. Columns = models. Cells = verdict (or parsed output). A table:

| case | local-A | local-B | frontier |
|---|---|---|---|
| 1   | PASS    | PASS    | NEEDS_WORK |
| 2   | BLOCK   | BLOCK   | BLOCK |

The useful columns to add: **disagreement fingerprint** (did local-A catch anything local-B missed that frontier also caught?), **latency ratio**, **cost per case if token-priced**.

## Metrics worth tracking per run

- **Verdict** — PASS / NEEDS_WORK / BLOCK, or whatever domain structure.
- **Finding count + severity distribution** — blockers vs warnings vs info.
- **Finding fingerprint** — a stable hash of `{file, line, category}` triples. Lets you compare "did the two models see the same issue?" without diffing prose.
- **Duration** — per-case. Cold-start vs steady-state matters.
- **Parse success** — did the output match the expected schema? (JSON mode + schema validation catches drift faster than reading the prose.)
- **Tokens** — prompt + completion, if the provider exposes them.

## The "did local-A miss something frontier caught" question

This is usually the point. If local-A misses a real issue frontier caught, frontier earned its cost on this workload. If local-A catches everything frontier catches, frontier is probably overkill.

Concrete procedure:
1. Take the union of findings across models.
2. For each finding, mark which models surfaced it.
3. The interesting column is **frontier-only findings that were real issues on code review**. That count / total findings = the overhead frontier bought you.
4. If that ratio is < 10% on a representative workload, you probably don't need frontier routinely.

## Harness structure

- **Driver script** — iterates cases × models, calls the tool/endpoint, captures verdict + metadata to a JSON log.
- **Incremental flush** — write the report file after every case. A crash at case 37 shouldn't lose 36 cases of data.
- **Determinism** — seed, temperature, top_p fixed across runs. Ollama's `num_ctx` must be explicit.
- **Report renderer** — markdown table + per-case detail page. Humans read the table; the detail pages are for the disagreement cases.

Keep the harness ugly and in-repo. It's not production code; it's evidence capture.

## Forbid

- Averaging scores across cases as if they're commensurable. A BLOCK on case 1 and a PASS on case 2 don't average.
- Running fewer than ~20 cases and drawing conclusions. N=5 is anecdote, not evidence.
- Dropping cases that failed to parse. A parse failure IS a finding — track it.
- Re-running the matrix after every model swap to "get a clean comparison" — you'll never ship. Pick a cutoff, document it, move on.

## See also

- `best-practices/prompt-model-economics.md` — when frontier pays for itself.
- `primers/ollama-runtime-options.md` — don't compare a 2k-context Ollama call to a 128k-context frontier call.
- `primers/llm-integration.md` — provider wiring.

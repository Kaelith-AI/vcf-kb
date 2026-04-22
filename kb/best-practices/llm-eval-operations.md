---
type: best-practices
best_practice_name: llm-eval-operations
category: ai
version: 1.0
updated: 2026-04-22
tags: [llm, observability, testability, determinism, token-economy, ci-cd, versioning]
---

# LLM Eval Operations

## When to use

You have a running eval harness (see `primers/llm-eval-harness.md`) and need it to stay useful past the first run. An eval you ran once and never re-ran is not a harness — it's a data point. This doc covers the mechanics that make it a living signal.

## Scheduling — when to trigger a run

Run the harness after: a prompt change, a model upgrade you plan to adopt, a KB or reviewer-overlay change that alters what the model sees. Do **not** run after every commit — frontier routes have real cost and diminishing returns at high frequency.

Practical cadence: local-model pass on every significant prompt PR; frontier pass at model upgrades and weekly if the prompt is stable. Tag each run with the trigger type (`prompt-change | model-upgrade | kb-change | scheduled`). Trigger type drives how you read the diff.

## The golden report — your regression baseline

One report is the baseline. Every new run diffs against it. A **regression** is:

- A finding present in the baseline no longer surfaces (model or prompt stopped catching something real).
- A case that parsed cleanly in the baseline now fails parse.
- Per-case duration is 2× the baseline median for that model.

Store the baseline path in a plain text file (`.eval-baseline`) at the harness root. A run that produces a better baseline promotes itself by updating that pointer — log the promotion as an explicit commit with message `eval: promote baseline <run-id>`.

## Model-version pinning

Frontier models change silently between the same `model_id` string. Pin via date-stamped id when the provider offers it (`gpt-5.4-2026-04`, `claude-sonnet-4-6-20260401`). When no date-stamp is available, capture `model_id` plus the observed model fingerprint (a stable phrase from the output or a reported version header).

**Rule:** if a run's `model_id` doesn't match the baseline's `model_id`, flag it — don't compare it. A silent model upgrade is a baseline change, not a run-to-run diff.

## Baseline management — when to re-baseline

Re-baseline when: you intentionally change the prompt, you adopt a model upgrade, or you add new test cases. Re-baselining after a regression you haven't fixed is not re-baselining — it's hiding the regression.

Always write a one-line log entry on promotion: `<date> | <run-id> | <reason> | <model-id>`. This is the commit history of your eval signal. Without it, you cannot answer "when did qwen3-coder start drifting on security stage 7?"

## Finding-fingerprint stability

Fingerprint spec: `sha256(file:line:category)` with line number rounded to the nearest function boundary (not raw line). Rounding absorbs cosmetic edits; `file + category` is enough to survive most refactors.

The trap: an overly precise fingerprint (exact line number, message text hash) turns every whitespace commit into a wall of false regressions. An overly loose one (category only) misses moved findings. Test the fingerprint algorithm against a cosmetic rename before committing to it.

When you bump the fingerprint algorithm, you must re-baseline. Log the bump explicitly; otherwise the diff story is dishonest.

## Disagreement-cluster triage

When local and frontier disagree, run this rubric before drawing conclusions:

1. **Frontier-only, confirmed real on code review** → frontier earned its cost; consider elevating to a regression test.
2. **Local-only, confirmed real on code review** → KB or primer gap for frontier; fix the prompt.
3. **Both finding something, different shape** → normalize fingerprint, then re-check; often the same issue at different granularity.
4. **Neither confident** → N is too low or the prompt needs work; do not promote either as ground truth.

Run this triage as a human+LLM pair: the LLM clusters the disagreements; a human confirms the "confirmed real" judgment. Neither alone is sufficient.

## Cost discipline

Estimate per-run cost before launching a frontier pass: `(prompt_tokens + expected_completion_tokens) × price_per_token × N_cases`. Tag each run report with `cost_usd`. Roll up to a weekly total in a `eval-spend.log` file — one line per run, same directory as the reports.

Set a daily budget. If a scheduled run would exceed it, run the local pass only and flag for human decision on frontier.

## Report hygiene

Report file names encode both the run timestamp and the baseline reference:

```
eval-2026-04-21T1430-vs-baseline-2026-03-15.json
```

Old reports are **never deleted** — they are the corpus. The question "when did this model start drifting?" is only answerable if old reports exist.

## Reproducibility

A run is evidence only if all four inputs are captured: prompts at a git commit hash, KB at a content-hash, `model_id` explicit, temperature and `top_p` explicit. A run missing any of these is not a regression data point — it is noise. The harness must refuse to write a report that omits any of them.

## Promotion path

A harness run that flagged a real, fixed bug belongs in the main test suite as a regression test. Write the case, add it to the standard test runner, and annotate it with the eval run id that first caught it. The harness is for discovery; the test suite is the guard. Don't leave the harness as the only line of defense.

## Forbid

- Deleting old reports to save space. Archive them; never drop them.
- Comparing runs across a silent model upgrade. Flag and re-baseline first.
- Re-baselining after an unfixed regression. You are not improving the baseline; you are losing the signal.
- Fingerprints that include prose text or exact token offsets. One refactor voids all history.
- Launching a frontier pass without a cost estimate. Habitual spend without awareness is how budgets blow.
- Treating a single-run disagreement as ground truth. Triage the cluster; confirm at least one finding on code review before promoting.

## See also

- `primers/llm-eval-harness.md` — harness shape, matrix structure, fingerprint design.
- `best-practices/prompt-model-economics.md` — when frontier cost justifies itself vs. when local is sufficient.

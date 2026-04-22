---
type: best-practices
best_practice_name: audit-trail-discipline
category: operations
version: 1.0
updated: 2026-04-22
tags: [audit-trail, observability, redaction, reliability, maintainability, data-model]
---

# Audit-Trail Discipline

## When to use

Every service or CLI tool that takes consequential action on behalf of a user or an agent. Audit is the only mechanism that lets you reconstruct "what did the system actually do" after the fact. Without discipline, it decays into "logs the happy path" and becomes useless exactly when you need it.

## Non-negotiable: one row per tool call

One audit row per tool call. Not per "interesting" tool call. Not per successful call. Every call — valid input, schema-invalid input, timeout, internal bug — writes exactly one row. Silent failure in the audit path is itself a bug.

The pattern:

```ts
export async function runTool<T>(body: () => Promise<T>, auditor: (payload: unknown) => void): Promise<Envelope> {
  let payload: Envelope;
  try { payload = await body().then((t) => successEnvelope(t)); }
  catch (e) { payload = errorEnvelope(e); }
  finally { auditor(payload); } // <-- always fires; never in a conditional
  return payload;
}
```

The auditor hook fires in a `finally` block, always. Implementations that put audit inside a try and only in a .then() branch silently lose sad-path rows.

## Row shape — keep it narrow

```
id              INTEGER PRIMARY KEY
ts              INTEGER NOT NULL          -- ms since epoch
tool            TEXT NOT NULL             -- "plan_save"
scope           TEXT NOT NULL             -- "global" | "project"
project_root    TEXT                      -- nullable for global-scope
inputs_json     TEXT NOT NULL             -- redacted, pre-body
outputs_json    TEXT NOT NULL             -- redacted, post-body
result_code     TEXT NOT NULL             -- "ok" | "E_VALIDATION" | ...
duration_ms     INTEGER
```

What to **not** put in audit:

- **Full plan/manifest content.** `{plan: "<134210 chars>"}` is enough — the actual file is on disk with its own hash. Auditing 134k chars per row turns a useful index into a log-volume problem in a week.
- **Secrets.** Redaction applies at the input-JSON and output-JSON boundaries. If a key slipped through, that's a redaction-config bug, not an "ignore it this time."
- **Pre-parse inputs.** Audit the post-Zod-parse value, not the raw caller-supplied object. Lets you see what was actually validated.

## Redaction timing

Redact at exactly two points:

1. Before the LLM / external call sees the payload.
2. Before writing the audit row.

**Never between them.** Double-redacting eats legitimate context.

## Query patterns worth enabling

Design the table so these are cheap:

- **All tool calls for project X in date range Y.** Index on `(project_root, ts)`.
- **Error-rate by tool in the last 7 days.** Index on `(tool, ts)`, filter by `result_code != 'ok'`.
- **Last N tool calls that touched spec slug X.** Requires `inputs_json` to be queryable, which on sqlite means `json_extract(inputs_json, '$.spec_slug')`. Consider pulling that column out if hot.

## Back-pressure

Audit is synchronous with the tool. If the audit write blocks (disk full, db locked), your whole tool surface stalls. Two mitigations:

- Keep the audit DB separate from whatever state DB the tool uses. Contention kills separate tables faster than separate files.
- Have a bypass flag that lets a tool run in `no-audit` mode in an emergency (shouts loudly in stderr, sets `ok: false` on the next admin audit check). Don't normalize using it.

## Forbid

- Audit rows with `NULL` result_code "because the call succeeded" — set it to `"ok"`.
- Grepping audit JSON blobs with `LIKE '%...%'`. Build indexable columns or use `json_extract`.
- Deleting audit rows to "clean up." Archive to a separate table; never drop.
- Letting the audit table share a transaction with the tool's state writes. A failed state write shouldn't eat the audit row, or vice versa.

## See also

- `best-practices/llm-output-redaction.md` — the two-point rule for redaction.
- `primers/node-sqlite-embedded.md` — storage patterns that keep audit fast.
- `best-practices/analytics-observability-implementation.md` — where audit meets metrics.

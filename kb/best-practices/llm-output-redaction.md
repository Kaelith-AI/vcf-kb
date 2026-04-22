---
type: best-practices
best_practice_name: llm-output-redaction
category: ai
version: 1.0
updated: 2026-04-22
tags: [redaction, security, trust-boundary, audit-trail, llm, observability]
---

# LLM Payload Redaction

## When to use

Any time a tool hands a string to an LLM, writes a payload to an audit log, or surfaces subprocess stdout/stderr in a returned envelope. The same redactor needs to apply at every exit point — one missed path undoes the rest.

## The two-point rule

Redact at exactly two points, never three:

1. **Outbound to LLM** — immediately before the provider's `chat.completions` call. The redacted copy is what the model sees.
2. **Inbound to durable store** — immediately before writing the audit row or returned envelope. The redacted copy is what post-hoc forensics see.

Do **not** redact at the tool boundary and then again at the LLM boundary; you will double-redact legitimate substrings and lose meaningful context. Pick the two points, centralize the function, forbid ad-hoc `.replace()` elsewhere.

## Pattern — one module, one function

```ts
// util/redact.ts
const RULES: Array<[RegExp, string]> = [
  [/sk-[A-Za-z0-9_\-]{20,}/g, "[REDACTED:openai-key]"],
  [/eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, "[REDACTED:jwt]"],
  [/\b[\w.+-]+@[\w.-]+\.\w{2,}\b/g, "[REDACTED:email]"],
  // host-specific rules via config
];

export function redact<T>(payload: T): T {
  if (typeof payload === "string") return RULES.reduce((s, [re, rep]) => s.replace(re, rep), payload) as T;
  if (Array.isArray(payload)) return payload.map(redact) as T;
  if (payload && typeof payload === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) out[k] = redact(v);
    return out as T;
  }
  return payload;
}
```

Call sites:

```ts
const response = await client.chat.completions.create({ messages: messages.map((m) => ({ ...m, content: redact(m.content) })) });
const safeResult = { ...result, stdout_tail: redact(result.stdout_tail), stderr_tail: redact(result.stderr_tail) };
writeAudit({ tool, inputs: redact(inputs), outputs: redact(outputs) });
```

## Marker discipline

`[REDACTED:kind]` is **scrubber output** — not a token the original text contained. Two consequences:

- **Review rules must know this.** A reviewer seeing `[REDACTED]` in a diff should read it as "the redactor caught something here" and check whether the pre-redaction value was legitimate. Silence implies approval of the redactor's judgment.
- **If a payload legitimately contains the string `[REDACTED]`** (e.g., a test fixture deliberately including the marker), the scrubber should escape pre-existing occurrences before running rules, then unescape after. A simple `<|REDACTED_LITERAL|>` → `[REDACTED]` round-trip works.

Without this, you cannot distinguish "the scrubber redacted a real secret here" from "the input already said `[REDACTED]` for unrelated reasons" — and neither can the reviewer looking at the diff.

## Rules must be config-driven

Host-specific rules (internal domain patterns, test-suite PII fixtures, project-local keys) belong in `config.yaml`, not in a hardcoded regex list. Ship a sensible default set in code; extend via config. Reloading the config reloads the rules.

## Forbid

- Multiple redaction layers that each do partial work. Centralize.
- Redacting a data structure by `JSON.stringify` → regex → `JSON.parse`. This breaks on embedded quotes; traverse the object instead.
- Redacting in the LLM's *response* before parsing. The model's answer isn't user-provided input; if the model returns what looks like a secret, that is itself a finding worth investigating.
- Silently redacting without a flag in the envelope noting "redaction applied, N substitutions." Auditors should be able to tell.

## See also

- `primers/security.md` — broader trust-boundary thinking.
- `best-practices/mcp.md` — where tool envelopes cross trust levels.

---
type: best-practices
best_practice_name: structured-json-output
category: ai
version: 1.0
updated: 2026-04-22
tags: [structured-output, llm, prompt-engineering, schema-design, determinism, reliability]
---

# Structured JSON Output from LLMs

## When to use

Any tool whose output is programmatically consumed — review verdicts, classifier results, extracted entities, tool-selection rationales. If your downstream code does `JSON.parse(llmOutput)`, you want structured output mode, not prose-and-pray.

## The three levers

Most OpenAI-compatible providers expose three ways to enforce JSON:

1. **`response_format: { type: "json_object" }`** — provider guarantees valid JSON, shape is whatever the model felt like. Use when the schema is simple enough to describe in the prompt.
2. **`response_format: { type: "json_schema", json_schema: { name, schema, strict: true } }`** — provider enforces shape too. Provider-side constraint decoding; eliminates entire classes of "the model forgot a field" failures.
3. **Prompt-only** ("return JSON matching this schema: ...") — last resort. Works with any model but provides zero guarantee.

**Default to json_schema when the provider supports it.** Fall back to json_object when it doesn't. Use prompt-only only when neither is available.

## Schema hygiene

- **Declare every field the model should produce.** Don't rely on inference from examples.
- **Use enums for verdicts / classifications.** `type: "string", enum: ["PASS", "NEEDS_WORK", "BLOCK"]`. Eliminates typo-verdict failures.
- **`additionalProperties: false`** at every object level where you don't want drift. Lets parse failures surface.
- **Keep the schema under ~30 fields.** Models handle 10-field schemas reliably; 100-field schemas degrade to "hallucinates plausible nonsense."

## Parse discipline

After the call:

```ts
let verdict: ReviewVerdict;
try {
  const parsed = ReviewVerdictSchema.parse(JSON.parse(raw));
  verdict = parsed;
} catch (e) {
  // Parse failures are themselves evidence. Don't retry silently.
  return { ok: false, code: "E_PARSE_FAIL", message: String(e), raw };
}
```

A parse failure means either (a) the model drifted, (b) the schema drifted, or (c) the provider's mode-enforcement is weaker than you thought. All three are findings. Never swallow the raw text — attach it to the error envelope so a retry or a manual diagnosis has evidence.

## Provider quirks worth knowing (2026)

- **OpenAI / Anthropic / Gemini** — all three support json_schema for GPT-4o+, Claude 3.5+, Gemini 1.5+. Older models fall back to json_object or prompt-only.
- **Ollama** (via `/v1/chat/completions`) — supports `response_format: { type: "json_object" }`. json_schema support varies by model; verify with a probe call, don't assume.
- **OpenRouter / LiteLLM** — pass response_format through when the underlying model supports it. Ask the gateway's health endpoint what's supported before relying on it.

## Don't

- **Retry a parse failure with the same prompt.** Add an explicit "your prior output failed to parse; here it is, fix it" turn — or, better, just fail the call and surface the evidence.
- **Embed large JSON schemas in the prompt when the provider supports schema-mode.** The constrained decoder is strictly better than instruction-following.
- **Couple business logic to a lenient JSON parser.** Zod, zod-to-json-schema, and the provider's schema should describe the same shape.
- **Ship a tool where parse failure becomes a best-effort prose fallback.** That path never gets tested and always breaks silently.

## See also

- `primers/llm-integration.md` — wiring providers.
- `primers/zod-schema-discipline.md` — zod ↔ JSON-schema round-trip traps.
- `best-practices/prompt-model-economics.md` — strict schemas save tokens (shorter prompts, less parse-retry overhead).

---
type: primer
primer_name: zod-schema-discipline
category: tools
version: 1.0
updated: 2026-04-22
tags: [zod, typescript, schema-design, api-design, mcp, maintainability]
---

# Zod Schema Discipline

## When to use

You reach for Zod any time you accept unknown input, define a tool surface, or persist structured data. The correctness you expect from Zod depends on how you author and register the schema — three traps eat more debugging time than the rest of Zod combined.

## Trap 1 — `.strict()` is lost if you hand over `.shape`

Code that looks fine:

```ts
const Input = z.object({ path: z.string(), force: z.boolean().default(false) }).strict();
server.registerTool("foo", { inputSchema: Input.shape }, async (args) => {
  const parsed = Input.parse(args); // never sees unknown keys
});
```

The MCP SDK (and any caller that accepts a raw shape) rebuilds the object from the `.shape` property: `z.object(schema.shape)`. The reconstruction is permissive — `.strict()` does **not** survive. The caller silently strips unknown keys, and the handler's own `.parse()` sees cleaned input. A typo in an arg name becomes a no-op instead of an `E_VALIDATION`.

**Pattern:** pass the whole schema where the API accepts it (`inputSchema: Input` if supported). If only `.shape` is accepted, add a defensive `rejectUnknownKeys(args, Input)` helper at the top of the handler.

## Trap 2 — `.passthrough()` hides bad data in migrations

`.passthrough()` is tempting for "human-facing" frontmatter or config with user extensions. The cost: you cannot detect schema drift. A typoed field looks identical to a custom extension. If later code reads that field by name, the typo silently fails.

**Pattern:** prefer `.strict()` for validated surfaces; use `.catchall(z.unknown())` when you need a typed escape hatch with visibility into what was extra; only use `.passthrough()` on narrowly-scoped fragments (frontmatter body, user-free-form blocks).

## Trap 3 — `z.object` cross-field rules belong in `superRefine`

`refine` on individual fields can't see the whole object. Validations like "if `mode === 'bypass'` then `spec_path` is optional; else required" belong in `superRefine`, which gets both the object and the issue-adding context:

```ts
const Config = z
  .object({ endpoints: z.array(Endpoint), defaults: Defaults.optional() })
  .superRefine((cfg, ctx) => {
    if (cfg.defaults?.review?.endpoint && !cfg.endpoints.some((e) => e.name === cfg.defaults.review.endpoint)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaults", "review", "endpoint"], message: "endpoint must match an entry in endpoints[]" });
    }
  });
```

## Forbid

- Free-standing `.shape` passed to a third-party registrar without verifying `.strict()` survives.
- `.passthrough()` on validated surfaces (tool inputs, config roots, saved state).
- `parse()` / `safeParse()` without logging `error.issues` — the default error message drops path detail.
- `z.any()` in a schema definition — almost always `z.unknown()` + a later narrow is what you want.

## Zod v4 vs v3 quick-notes

- `z.record(...)` now requires both key and value schemas: `z.record(z.string(), z.unknown())`.
- `z.enum([...])` is stricter about const-ness in `readonly` arrays.
- `.default(fn)` callbacks run once at parse time, not at schema-build time.

## See also

- `primers/mcp.md` — where a tool's input contract lives.
- `best-practices/front-matter-and-documentation.md` — YAML frontmatter + Zod discipline.

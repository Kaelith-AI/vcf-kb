---
type: primer
primer_name: node-sqlite-embedded
category: tools
version: 1.0
updated: 2026-04-22
tags: [node, node-sqlite, sqlite, data-model, migration, reliability]
---

# node:sqlite for Embedded State

## When to use

You need a local, file-backed, zero-config store for audit logs, project state, artifact indexes, or registry data. SQLite is the right default. As of Node 22.x, `node:sqlite` is the built-in path; no native-addon pain, no `better-sqlite3` install-time build step. As of Node 25.7+ it reaches stability-2 and loses the experimental warning.

## Read this first

`node:sqlite` is synchronous (like `better-sqlite3`), uses prepared statements, and lives in `node:sqlite`. Two non-obvious properties:

1. It emits `ExperimentalWarning: SQLite is an experimental feature and might change at any time` on every import under Node 22–24. For CLIs, this is harmless (stderr) but ugly; suppress via `NODE_NO_WARNINGS=1` in the shebang-wrapper or with `--no-warnings=ExperimentalWarning`.
2. API surface is small and stable: `new DatabaseSync(path, opts)`, `db.prepare(sql)`, `db.exec(sql)`, `stmt.run() / .get() / .all() / .iterate()`. No async variant; for I/O-bound contention use a worker.

## Patterns

### Prepared-statement lifecycle

Prepare once per process, reuse forever. Do not prepare inside a loop.

```ts
const insert = db.prepare("INSERT INTO audit (tool, inputs, outputs, ts) VALUES (?, ?, ?, ?)");
for (const row of rows) insert.run(row.tool, JSON.stringify(row.inputs), JSON.stringify(row.outputs), Date.now());
```

### Migrations — versioned, one-way-unless-rollback

Store a `schema_version` row in a dedicated `meta` table. On open, read the version; run each up-migration from current+1 to target in a transaction. Never mutate an existing migration file — add a new one.

```ts
db.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");
const current = Number(db.prepare("SELECT value FROM meta WHERE key='schema_version'").get()?.value ?? "0");
for (let v = current + 1; v <= TARGET; v++) {
  db.exec("BEGIN");
  try {
    MIGRATIONS[v](db);
    db.prepare("INSERT OR REPLACE INTO meta VALUES ('schema_version', ?)").run(String(v));
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
}
```

### WAL + synchronous NORMAL

For a single-writer CLI, `journal_mode = WAL` + `synchronous = NORMAL` trades a sliver of crash-safety for a real latency win:

```ts
db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
```

Skip if the process is crash-sensitive (e.g., payment data). Fine for audit trails, registries, indexes.

### Cross-process locking

SQLite handles multi-process safely via its own locking, but writes serialize. For a server that does both reads and writes, open **one** write-DB connection and route writes through it. Read-only connections can proliferate.

## Forbid

- `better-sqlite3` in anything new on Node 22+. You pay the native-addon tax for nothing.
- Raw SQL string-concat of user input — every tool call must use placeholders.
- Migrations without the `schema_version` gate — you will re-run and corrupt on next boot.
- Async wrappers around `node:sqlite` to "make it nice." It's sync on purpose; embrace it.

## See also

- `best-practices/data-integrity.md` — sql, migration, reliability.
- `primers/mcp.md` — where audit rows typically land.

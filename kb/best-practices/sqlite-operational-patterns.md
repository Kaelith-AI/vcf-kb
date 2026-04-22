---
type: best-practices
best_practice_name: sqlite-operational-patterns
category: software
version: 1.0
updated: 2026-04-22
tags: [sqlite, node-sqlite, data-model, reliability, migration, observability, incident-recovery]
---

# SQLite Operational Patterns

## When to use

You have a running embedded SQLite DB — audit log, project state, artifact index — and need to keep it healthy across restarts, schema changes, and the occasional corruption event. Primer covers design-time setup; this covers everything after first deploy.

## Backup

Use `db.backup(destPath)` (node:sqlite) for a hot, online backup under WAL mode. It snapshots a consistent state without blocking writes.

```ts
await db.backup(`${dbPath}.bak-${Date.now()}`);
```

Schedule on process exit and on a timer (every 15–60 min for high-write CLIs). For low-write registries, back up on every schema migration only. Rotate to three named slots (`bak-1`, `bak-2`, `bak-3`) to avoid unbounded disk growth. Recovery drill: quarterly, restore the latest backup into a temp path, open it, run `PRAGMA integrity_check`, close it. If it fails, your backup strategy is broken — find out before you need it.

## WAL checkpointing

WAL mode appends writes to a `.wal` file; a checkpoint merges it back into the main DB. SQLite auto-checkpoints at 1000 pages by default. For CLI processes that open and close the DB frequently, auto-checkpoint usually suffices. For long-lived servers, the WAL file can balloon to hundreds of MB under sustained write load — the symptom is the `.wal` file growing without bound while the main DB file stays flat.

Call `PRAGMA wal_checkpoint(TRUNCATE)` explicitly at natural idle points (end of batch import, after migration) to shrink the WAL back to zero. Don't call it mid-transaction. If checkpoint returns `busy` pages, a reader is blocking it; design your read connections to be short-lived.

## Integrity checks

Run `PRAGMA quick_check` on every open. It catches most corruption in under a millisecond on small DBs. Run `PRAGMA integrity_check` weekly or after any unclean shutdown (detect via a `dirty` flag row cleared on clean close). Both return `"ok"` on success.

```ts
const r = db.prepare("PRAGMA quick_check").get() as { quick_check: string };
if (r.quick_check !== "ok") throw new Error(`DB integrity failed: ${r.quick_check}`);
```

On failure, do not continue — see Corruption Response below.

## Corruption response

Detection → Triage → Export → Rebuild:

1. Catch the integrity failure or a `SQLITE_CORRUPT` error.
2. Immediately reopen the DB read-only (`{ readOnly: true }`). Do not write to a corrupt DB.
3. Export what you can: `SELECT * FROM each_table` into NDJSON files on disk.
4. Restore from the last good backup or rebuild from the exports.
5. Run `PRAGMA integrity_check` on the restored DB before bringing it live.

Log the corruption event, the timestamp, and the schema_version. Never silently swallow `SQLITE_CORRUPT`.

## VACUUM

Skip `VACUUM` for CLIs that run for hours at most — page reuse handles fragmentation adequately. For long-lived daemon processes or DBs that see heavy delete volume (rolling audit windows, expired cache entries), schedule `PRAGMA incremental_vacuum(100)` at idle to reclaim pages incrementally without blocking. Full `VACUUM` is appropriate after a large one-time deletion; it is a table-lock operation, so only run it offline or at startup before accepting connections.

## Migration testing

For each migration, test it against a copy of your production DB shape, not against a fresh empty DB. Fresh DBs miss real-world quirks (columns added via earlier migrations, NULL values that violate your new constraints). Run the full migration chain from version 0 to TARGET in your test suite. If you don't support down-migrations (you probably shouldn't), test that a binary built against schema version N rejects a DB at version N+1 with a clear error rather than silently misreading data.

## Query plan inspection

Any query not hitting a primary key must be verified with `EXPLAIN QUERY PLAN`. The rule: every query has an index or a documented reason it doesn't. A full-table scan on a 1000-row audit table is fine; on a 1M-row audit table it is a latency landmine.

```sql
EXPLAIN QUERY PLAN SELECT * FROM audit WHERE project_root = ? AND ts > ?;
-- Must show: USING INDEX, not SCAN TABLE
```

Add the index in the migration that adds the query. Don't add indexes speculatively.

## Schema evolution invariants

- `ADD COLUMN` is safe and lock-free in SQLite. Use it freely.
- New `NOT NULL` columns require a `DEFAULT`. Without one, SQLite rejects `ADD COLUMN NOT NULL` — you'd need a table rewrite. Always supply a sentinel default (`''`, `0`, `'unknown'`) and document it.
- Never rename or drop a column in a live migration. Add the new column, migrate data, deprecate the old one in a later version.
- Older binaries reading a newer schema must fail loudly if `schema_version > MAX_KNOWN`. Check this on open.

## Connection discipline

One write connection per process, opened at startup, closed at exit. Read connections may multiply. Pass `PRAGMA query_only = true` on read-only connections to prevent accidental writes. Never share a connection across threads without a mutex; `node:sqlite` is not thread-safe.

## Observability

Log: query count per run, any query exceeding your slow-query threshold (start at 50 ms), WAL checkpoint results, and schema_version on open. Do not log query bodies — see `best-practices/audit-trail-discipline.md` for why. Track lock contention by catching `SQLITE_BUSY`; more than one `BUSY` per hour on a single-writer system is a design smell.

## Forbid

- Calling `VACUUM` while the DB is accepting writes — it holds a write lock for its entire duration.
- Ignoring `SQLITE_BUSY` returns — treat them as alerts, not retries to silently swallow.
- File-copying the DB for backup without first setting WAL checkpoint or using the backup API — you can copy mid-write and get a corrupted backup.
- `PRAGMA integrity_check` failures treated as warnings — they are always hard stops.
- Schema migrations that `DROP COLUMN` or `RENAME COLUMN` without a rewrite migration plan — older readers will crash or corrupt data.
- Running `EXPLAIN QUERY PLAN` once during development and never again — query plans change when data grows.

## See also

- `primers/node-sqlite-embedded.md` — design-time setup: WAL mode, prepared statements, migration gate.
- `best-practices/audit-trail-discipline.md` — what not to log in observability hooks.
- `best-practices/data-integrity.md` — broader SQL and migration discipline.

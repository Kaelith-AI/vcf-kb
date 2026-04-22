---
type: best-practices
best_practice_name: data-integrity
category: software
version: 1.0
updated: 2026-03-01
tags: [data-model, reliability, sqlite, migration]
status: draft-v1
---

# Data Integrity Best Practices

## When To Use This

Use this document when a project stores, transforms, migrates, syncs, indexes, or derives durable state—and especially when correctness matters more than surface feature speed.

Open it when you need to:
- define the source of truth
- plan migrations and schema changes safely
- control sync/import/export correctness
- manage caches, indexes, and derived state safely
- prevent drift, duplication, or silent corruption
- design verification, reconciliation, and repair strategies

This is a deep support doc for stateful systems, migrations, retrieval systems, and operational correctness.

---

## What This Covers

This document covers:
- source-of-truth and state ownership
- migration and schema-change safety
- sync/import/export integrity
- derived state, caches, and indexes
- job/idempotency/data-drift controls
- verification, reconciliation, and repair
- integrity monitoring and operational response

---

## Quick Index

- [Source of truth and state ownership](#source-of-truth-and-state-ownership)
- [Migrations and schema-change safety](#migrations-and-schema-change-safety)
- [Sync import and export integrity](#sync-import-and-export-integrity)
- [Derived state caches and indexes](#derived-state-caches-and-indexes)
- [Job idempotency and data-drift controls](#job-idempotency-and-data-drift-controls)
- [Verification reconciliation and repair](#verification-reconciliation-and-repair)
- [Integrity monitoring and operational response](#integrity-monitoring-and-operational-response)
- [Checklists](#checklists)

---

## Decision Guide

### Treat something as durable truth when
- other system behavior depends on it as canonical
- losing or corrupting it would create meaningful trust or operational damage
- it cannot be safely rebuilt from stronger sources

### Treat something as derived when
- it can be recomputed or reindexed from stronger source data
- the system should tolerate rebuilding it after drift or failure

### Escalate integrity rigor when
- jobs can replay or duplicate writes
- migrations are non-trivial
- multiple systems sync or transform the same data
- user-visible trust depends on state correctness

---

## Core Rules

1. **Define the source of truth explicitly.**

2. **Derived state should be rebuildable or verifiable.**

3. **Migrations need safety and rollback thinking.**

4. **Sync/import/export flows should be designed for duplication and drift.**

5. **Integrity failures should be observable, not silent.**

6. **Jobs and automations need idempotency thinking when they touch state.**

7. **Caches and indexes should not accidentally become canonical truth.**

8. **Repair and reconciliation should be imaginable before failure.**

9. **Correctness claims must match what the system can actually guarantee.**

10. **Fast incorrect state is worse than slower trustworthy state.**

---

## Common Failure Patterns

- no clear source of truth
- duplicated state with unclear ownership
- migrations improvised without safety rails
- caches or search indexes treated like truth accidentally
- jobs causing duplicate writes or silent drift
- missing verification/reconciliation after background processing
- correctness claims that exceed actual guarantees

---

## Source of Truth and State Ownership

Every stateful system should know what data is canonical.

### Good state-ownership posture
- canonical stores are explicit
- derivations are identified as derivations
- ownership between services/systems is not ambiguous
- operators know where truth lives during failure or repair

### Rule
If multiple stores all look like truth, none of them is reliably governed.

---

## Migrations and Schema-Change Safety

Migrations change trust, not just structure.

### Good migration posture
- migration intent is explicit
- rollback or recovery thinking exists
- backward/forward compatibility is considered where relevant
- risky transformations are not improvised in production blindly

### Rule
A migration is unsafe if the failure and recovery path are unclear.

---

## Sync / Import / Export Integrity

Data movement creates duplication and drift risk.

### Good posture
- import assumptions are explicit
- sync behavior handles retries/replays
- exports preserve expected semantics and boundaries
- cross-system mapping rules are inspectable

### Rule
If a sync path cannot explain how it avoids or repairs drift, it is underdesigned.

---

## Derived State, Caches, and Indexes

Derived state is useful, but it should stay subordinate to stronger truth.

### Examples
- caches
- denormalized views
- embeddings/vector indexes
- search indexes
- analytics rollups

### Rule
A derived store should be rebuildable or at least verifiable against the canonical source.

---

## Job / Idempotency / Data-Drift Controls

Background work is a common source of silent integrity loss.

### Good posture
- jobs can tolerate retries or detect duplicates
- side effects are bounded
- reprocessing behavior is understood
- drift signals exist when expected outcomes do not match reality

### Rule
If repeated execution can corrupt or duplicate state silently, the job model is weak.

---

## Verification, Reconciliation, and Repair

Integrity needs ways to detect and correct problems.

### Good repair posture
- verification routines exist
- reconciliation can compare derived versus canonical state
- repair actions are understandable and safe
- operators know what should be checked after failures or migrations

### Rule
A system that cannot verify its own important state will discover integrity problems too late.

---

## Integrity Monitoring and Operational Response

Integrity problems need visibility.

### Useful signals
- duplicate processing anomalies
- mismatch counts between truth and derived stores
- failed migrations or partial writes
- staleness or rebuild lag in indexes/caches
- reconciliation failures

### Rule
If drift and corruption are only detected by user complaints, the monitoring model is inadequate.

---

## OS / Environment Notes

This topic is usually cross-environment.
Only add platform-specific notes where filesystem-backed state, local storage models, or host/runtime behavior materially affect integrity handling.

---

## Checklists

### State-Ownership Checklist
- [ ] Source of truth is explicit
- [ ] Derived state is identified clearly
- [ ] Ownership between systems is not ambiguous
- [ ] Canonical vs convenience storage is not confused

### Migration Safety Checklist
- [ ] Migration intent is explicit
- [ ] Rollback/recovery thinking exists
- [ ] Compatibility risk is understood
- [ ] Operators know what to verify after the change

### Sync / Import / Export Checklist
- [ ] Duplicate/replay handling is considered
- [ ] Mapping assumptions are explicit
- [ ] Drift risk is bounded or detectable
- [ ] Correctness claims match real guarantees

### Reconciliation / Repair Checklist
- [ ] Verification path exists
- [ ] Derived vs canonical state can be compared
- [ ] Repair actions are understandable
- [ ] Monitoring helps detect integrity problems early

---

## Related Primers

- Production Primer
- RAG Primer
- Qdrant Primer
- Git / Change Safety Primer
- Project Planning Primer

---

## Related Best Practices

- Production Best Practices
- Integration Boundary Best Practices
- Versioning / Migration Best Practices
- Qdrant Best Practices
- Security Best Practices

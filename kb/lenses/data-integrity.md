---
type: review-lens
lens_name: data-integrity
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# State & Data Integrity Lens

## Lens Purpose

This lens intensifies review for state correctness, data truthfulness, duplicate-write prevention, stale-read risk, migration safety, reconciliation, and recoverability when systems become messy over time.

It exists because many vibe-coded systems work on clean demo data and happy-path flows, then become fragile once real state accumulates:
- partial writes
- stale caches
- duplicate events
- drift between source and derived data
- inconsistent records across tools
- migrations that leave mixed states behind
- AI outputs or embeddings that outlive the data they were derived from

This is not a generic bug-hunt lens.
It is a practical review overlay for **whether the system’s state and data remain correct, consistent, and recoverable when real-world history, concurrency, and drift enter the picture**.

---

## Why This Lens Exists

Vibe-coded systems are optimistic about state.

LLMs naturally generate code as if:
- the record exists
- the cache is fresh
- the write succeeded once
- the migration ran everywhere
- the event was delivered once
- the derived value is still current
- the AI summary still matches the source data

Real systems do not stay that clean.

Kaelith’s work makes this especially important because:
- AI-native products persist conversations, summaries, embeddings, and inferred state
- workflow systems regularly experience partial completion and replay
- internal tools often evolve without strong canonical data modeling
- fast iteration means schema and behavior change while stored data lags behind
- client-facing products turn hidden data drift into visible trust damage

Existing lenses catch adjacent issues, but not this exact question:

> Is the data the system depends on still true, synchronized, and recoverable after concurrency, retries, migrations, and time have taken their toll?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether important data has a clear canonical source of truth
2. Whether derived, cached, and replicated state remains synchronized enough to trust
3. Whether writes, retries, migrations, and concurrent updates preserve integrity
4. Whether partial failure leaves recoverable rather than mysterious state
5. Whether AI- and workflow-shaped state remains current enough to avoid quiet corruption

If the reviewer cannot explain why the system’s data should still be trusted after real-world messiness, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- stateful applications
- workflow systems and background processing
- products with cached, derived, or aggregated data
- database-backed tools under active iteration
- AI-native systems storing conversations, summaries, embeddings, or classifications
- systems with migrations, sync jobs, or multi-store data paths

It may be applied to:
- **Code review** to scrutinize integrity risks in reads, writes, derived state, and schema changes
- **Security review** when integrity failures can create trust-boundary or privilege consequences
- **Production review** to assess whether live state remains coherent, repairable, and supportable

This lens is not primarily a privacy lens or a generic correctness lens.

---

## Core Review Rule

Do not confuse successful operations with trustworthy state.

A system does **not** get data-integrity credit because:
- writes usually succeed
- the UI renders the expected value once
- the schema migrated on one environment
- the cache improves performance
- retries eventually work
- derived data looks plausible

The reviewer must ask whether the system stays correct when:
- writes race
- events duplicate
- reads are stale
- migrations are partial
- caches lag
- records are deleted, archived, or repaired
- AI-derived state outlives its inputs

---

## What This Lens Should Emphasize

### 1. Canonical State & Source of Truth
Reviewer should intensify attention on:
- whether each important data domain has a clear authoritative source
- hidden secondary sources such as local storage, session state, caches, or duplicated tables
- unresolved conflicts between system-of-record and convenience copies
- whether readers and writers agree on which state is canonical

### Example failure patterns
- UI state or local cache quietly overrides fresher backend data
- multiple tables or stores can diverge with no reconciliation path
- operators cannot tell which value is the one that should be trusted

---

### 2. Derived & Computed State Integrity
Reviewer should intensify attention on:
- counts, totals, flags, rollups, denormalized fields, summaries, and embeddings
- invalidation and recomputation rules
- whether derived state updates when source state changes
- whether computed state can become permanently stale

### Example failure patterns
- counter field drifts from the actual child-record count
- AI summary or embedding remains after the underlying content changes materially
- aggregate values update on create but not on delete or bulk edit

---

### 3. Concurrent Write Safety
Reviewer should intensify attention on:
- read-modify-write patterns
- optimistic locking or transaction coverage
- last-write-wins behavior that silently discards newer intent
- multiple users, agents, or workers touching the same records concurrently

### Example failure patterns
- two writers update the same record and silently overwrite each other
- upsert path loses recent fields because it writes a stale object snapshot
- concurrency only works because low traffic hides the race condition

---

### 4. Idempotency & Duplicate Write Prevention
Reviewer should intensify attention on:
- whether important write operations are safe when retried or replayed
- deduplication keys and duplicate-event handling
- duplicate notifications, charges, inserts, or state transitions
- write semantics under at-least-once delivery conditions

### Example failure patterns
- retried event creates duplicate records or side effects
- job replay charges, emails, or mutates state twice
- duplicate messages are treated as unique state changes

---

### 5. Stale Read & Cache Freshness Risk
Reviewer should intensify attention on:
- caches and read replicas
- stale reads used in decision-making or writes
- data freshness indicators
- invalidation logic after mutation or migration
- whether the system can tell old data from current data

### Example failure patterns
- stale cache drives user-visible wrong values or permissions
- after write, old state remains visible long enough to trigger incorrect downstream action
- system serves cached data as if it were current with no freshness signal

---

### 6. Migration Safety & Schema Drift
Reviewer should intensify attention on:
- schema migrations under live traffic
- additive vs breaking rollout patterns
- mixed-schema states across environments or rows
- code running ahead of or behind the current data shape
- whether migration failure leaves ambiguous records behind

### Example failure patterns
- migration partially runs and leaves old and new record shapes mixed together
- app code assumes a field exists everywhere before backfill is complete
- rollback or forward deploy leaves orphaned or unreadable data paths

---

### 7. Partial State & Failure Recovery
Reviewer should intensify attention on:
- multi-step operations that can stop midway
- whether partial completion is detectable and recoverable
- compensation logic
- operator visibility into stuck or half-applied states
- whether repair relies on tribal knowledge rather than explicit mechanisms

### Example failure patterns
- DB update succeeds but downstream provider sync fails, leaving silent split-brain state
- workflow crash leaves records marked half-processed with no repair path
- partial failure is possible but not encoded anywhere identifiable

---

### 8. Soft Delete, Archive & Referential Integrity
Reviewer should intensify attention on:
- parent/child relationships under delete or archive
- ghost references
- cascade/nullify/restrict behavior vs business intent
- whether “deleted” data still affects derived state, foreign keys, or UI flows incorrectly

### Example failure patterns
- archived record still appears in aggregates or references unexpectedly
- child records point at soft-deleted parents with no safe handling path
- deletion removes one surface but leaves operationally active references elsewhere

---

### 9. Event, Queue & Message Integrity
Reviewer should intensify attention on:
- at-least-once vs exactly-once assumptions
- event ordering assumptions
- consumers acting on missing or outdated records
- whether message handling preserves state truth under replay, delay, and duplication

### Example failure patterns
- event consumer applies an old state change after a newer one already landed
- message order matters, but the system treats delivery order as harmless
- queue replay creates state that is historically valid but currently wrong

---

### 10. Reconciliation & Repairability
Reviewer should intensify attention on:
- whether the system can detect drift between stores or derived state and source state
- reconciliation jobs or repair procedures
- auditability of mismatches
- whether data repair is possible without manual forensic work

### Example failure patterns
- no way to recompute or repair derived totals after drift is detected
- operators know data can drift but have no safe repair mechanism
- inconsistencies are only found by user complaint, not by any reconciliation logic

---

### 11. AI / LLM State Persistence Contracts
Reviewer should intensify attention on:
- versioning and invalidation for summaries, embeddings, classifications, or cached context
- whether AI-derived state is scoped correctly to user, document, or conversation boundaries
- stale semantic state affecting later retrieval or action
- whether AI outputs are treated as current facts after source changes

### Example failure patterns
- embedding search returns obsolete results because source documents changed without re-embed
- LLM-generated classification persists after underlying record changed categories
- conversation-derived preferences bleed across sessions or users improperly

---

### 12. Messy-Data Reality Testing
Reviewer should intensify attention on:
- whether the system only works on pristine data assumptions
- nulls, duplicates, partial records, backfilled rows, and inconsistent historical state
- old records created before new rules existed
- how gracefully the product handles historical or dirty data already in the system

### Example failure patterns
- code assumes every record has fields added by a recent migration
- old or partial records break flows that only work on clean new data
- data integrity depends on the impossible assumption that production history is tidy

---

## What This Lens Should Not Duplicate

This lens should not become a general defect, workflow, or privacy review.

Avoid using it to re-run:
- generic business-logic correctness bugs → Defect Discovery
- workflow-step design and orchestration topology → Workflow & Automation Reliability
- privacy law, data-rights, and disclosure analysis → Privacy, Data Rights & Consent
- secret handling and credential exposure → Secrets & Trust Boundaries
- SQL injection, auth, or generic security flaws → Security stages
- UI rendering or presentation-only issues → UX & Interaction Clarity

Use this lens when the failure is:
- the right logic operating on wrong, stale, duplicated, or partial state
- state drift making later behavior untrustworthy
- messy historical data exposing hidden integrity weaknesses

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### State & Data Integrity Lens Summary
- Overall integrity posture:
- Most serious state-trust risk:
- Highest-risk source-of-truth conflict:
- Scope notes:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Canonical state & source of truth | PASS / NEEDS_WORK / BLOCK | ... |
| Derived & computed state integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Concurrent write safety | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Idempotency & duplicate write prevention | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Stale read & cache freshness risk | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Migration safety & schema drift | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Partial state & failure recovery | PASS / NEEDS_WORK / BLOCK | ... |
| Soft delete / archive / referential integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Event / queue / message integrity | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Reconciliation & repairability | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| AI / LLM state persistence contracts | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Messy-data reality testing | PASS / NEEDS_WORK / BLOCK | ... |

### Source of Truth Snapshot
| Data Domain | Canonical Source | Secondary Copies / Caches | Drift Risk |
|---|---|---|---|
| ... | ... | ... | LOW / MED / HIGH |

### High-Signal Findings
For each significant finding:
- Finding:
- Data domain / record type:
- Evidence:
- Integrity failure mode:
- Why it matters:
- Fix direction:

### Data Integrity Lens Blockers
- Blocking integrity issues:
- Recovery or migration limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- data or state is likely to become materially wrong under ordinary real-world conditions
- duplicate, stale, partial, or conflicting state can create serious user, financial, or operational harm
- migrations or replay behavior make integrity untrustworthy
- the reviewer cannot honestly trust core state after concurrency, retries, or time

### NEEDS_WORK-level lens findings
Use when:
- the system is directionally sound but has meaningful drift, freshness, or recoverability weaknesses
- integrity depends too much on low traffic, clean data, or operator luck
- important state is repairable but not yet robustly governed

### PASS-level lens findings
Use when:
- important state has a credible source of truth
- derived, cached, and replayed data stay bounded enough to trust for scope
- the reviewer can explain how the system survives messy history, duplicate events, and partial failure without quiet corruption

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- counters and aggregates that drift from real source records
- stale cache or replica reads driving wrong downstream behavior
- retries or replays that create duplicate records or side effects
- migrations leaving mixed-schema records or orphaned relations
- workflows that partially update one system but not another with no repair path
- soft deletes that leave ghost references or invalid aggregates behind
- embeddings, summaries, or classifications that persist after source data changes
- systems that only work on pristine new records, not historical messy data

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **Workflow & Automation Reliability** when orchestration behavior creates or amplifies state drift
- **Defect Discovery** when bugs and integrity failures reinforce each other
- **AI Systems** when AI-derived state affects retrieval, routing, or user-visible outcomes
- **Production stages** where migration, repair, and operational trust in data matter directly

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand where important state comes from, how it changes over time, how it survives retries, concurrency, migration, and partial failure, and why the data remains trustworthy enough for the system’s intended use.

If that statement cannot be made honestly, this lens should produce meaningful findings.

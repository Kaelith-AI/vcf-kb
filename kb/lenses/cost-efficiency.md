---
type: review-lens
lens_name: cost-efficiency
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Cost Efficiency Lens

## Lens Purpose

This lens intensifies review for token and compute waste, redundant calls, polling waste, overfetching, memory-heavy flows, unnecessary background work, cost-amplifying retries, and “works but expensively” product behavior.

It exists because vibe-coded systems often solve the immediate problem with the most obvious path rather than the cheapest sustainable one:
- repeated LLM calls instead of caching
- polling where events exist
- full-dataset loading where streaming or pagination would work
- duplicate queries and redundant computation
- background work that runs constantly whether or not value is being produced

This is not a pure performance lens.
It is a practical review overlay for **whether the system burns money, bandwidth, memory, and compute unnecessarily even when it is functionally correct**.

---

## Why This Lens Exists

Kaelith builds AI-native, automation-heavy, and client-facing systems where waste compounds quickly.

Vibe-coded products commonly:
- call paid AI APIs more often than necessary
- overfetch or re-fetch data because state planning was weak
- choose polling over event-driven design because it is easier to scaffold
- duplicate work across code paths because generation happened in fragments
- keep expensive background jobs alive long after the original need was forgotten

That creates a specific class of failure:

> the product works, but it is structurally too expensive to justify at scale.

Existing lenses cover adjacent concerns:
- **AI Systems** evaluates model use and AI architecture quality
- **Workflow & Automation Reliability** evaluates whether automation is correct and safe
- **Resilience & Degraded Modes** evaluates failure behavior
- **Production performance stages** evaluate latency, capacity, and load posture

This lens asks a different question:

> Is this system spending more money, compute, bandwidth, or memory than its actual value requires?

This lens exists to answer that.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether expensive operations are being triggered more often than necessary
2. Whether data, compute, and AI usage are bounded with reasonable efficiency
3. Whether polling, retries, and background work are amplifying cost without proportionate value
4. Whether memory, bandwidth, and storage usage reflect actual product needs rather than generated convenience
5. Whether the product remains economically credible as usage grows

If the reviewer cannot explain why the current resource burn is justified for the system’s value and scale, this lens should produce meaningful findings.

---

## Applies To

This lens is most useful for:
- AI-native products
- workflow and automation systems
- data-heavy dashboards and apps
- products with paid third-party APIs
- internal tools with recurring background jobs
- client-facing systems where scale can amplify inefficient patterns quickly
- services processing large files, datasets, or frequent requests

It may be applied to:
- **Code review** to identify cost-amplifying implementation patterns early
- **Production review** to assess whether the live system is economically sustainable for scope

This lens is not primarily a latency or reliability lens.

---

## Core Review Rule

Do not confuse “fast enough” or “works correctly” with “efficient enough.”

A system does **not** get efficiency credit because:
- the feature works
- the current bill is still tolerable at low volume
- the query/API call completes quickly in development
- the background job usually finishes
- an LLM call produces a good answer

The reviewer must ask whether the same outcome could be achieved with materially less:
- token spend
- API spend
- compute
- memory
- bandwidth
- background churn
- duplicated work

---

## What This Lens Should Emphasize

### 1. Token & LLM Call Efficiency
Reviewer should intensify attention on:
- repeated model calls for the same or near-duplicate work
- cache opportunities for expensive prompts or embeddings
- overly large context payloads where summaries or excerpts would suffice
- whether AI is being used where cheaper deterministic logic would do

### Example failure patterns
- full prompt re-sent on every page load for stable classification or summary work
- embeddings regenerated on every request instead of on data change
- expensive model call used for a task that could be solved with cached or local logic

---

### 2. Polling vs Event-Driven Waste
Reviewer should intensify attention on:
- polling loops where webhooks, push, or event subscriptions exist
- interval frequency relative to change frequency
- polling that continues after it no longer provides value
- periodic jobs that wake constantly to discover there is no work

### Example failure patterns
- client or worker polls every few seconds for data that changes rarely
- scheduled job runs every minute to check for hourly work
- polling remains as prototype scaffolding long after event-driven alternatives exist

---

### 3. Overfetching & Underprojected Queries
Reviewer should intensify attention on:
- `SELECT *` or equivalent broad fetches
- fetching full records or pages when only a subset is used
- oversized response payloads from internal or external APIs
- missing field projection, pagination, or streaming where the dataset can grow

### Example failure patterns
- code loads entire related objects when only two fields are needed
- endpoint returns huge payloads to power a tiny UI card or branch decision
- system reads all rows into memory when a filtered or paginated query would suffice

---

### 4. Redundant & Duplicate Computation
Reviewer should intensify attention on:
- repeated pure computations
- duplicate API/database calls triggered by one user action
- parsing or recomputing the same artifacts multiple times in one lifecycle
- lack of memoization or deduplication where it would meaningfully reduce cost

### Example failure patterns
- same expensive lookup is performed repeatedly during one request/render cycle
- multiple components trigger identical external calls in parallel
- config/schema/file parsing repeats on every invocation with no reuse strategy

---

### 5. Memory-Heavy Flows
Reviewer should intensify attention on:
- full-dataset loading
- unbounded in-memory caches
- large object graphs retained too long
- processing patterns that could stream but instead accumulate
- whether long-lived processes have any memory-discipline story at all

### Example failure patterns
- large event or document sets are read fully into memory for simple filtering
- cache has no eviction policy or size cap
- background worker retains growing state structures across jobs unnecessarily

---

### 6. Cost-Amplifying Retry Behavior
Reviewer should intensify attention on:
- retries against paid APIs or expensive operations
- multiple retry layers compounding cost
- retry logic with no spend or attempt bounds
- retries on non-retryable failures creating waste without value

### Example failure patterns
- rate-limited AI/API call is retried aggressively and multiplies spend
- several layers each retry the same expensive failure independently
- paid operation is retried without hard upper bounds or kill conditions

---

### 7. Background & Idle Work Churn
Reviewer should intensify attention on:
- cron jobs, workers, listeners, and watchers that wake or run too often
- background processes performing low-value health or sync work excessively
- long-running tasks that stay hot despite sparse demand
- whether idle cost remains proportionate to actual usage

### Example failure patterns
- worker wakes every minute all day to discover there is nothing to do
- listener or health-check path performs expensive work continuously without business value
- prototype background tasks remain permanently active after product needs changed

---

### 8. Asset, Bandwidth & Delivery Efficiency
Reviewer should intensify attention on:
- oversized images and assets
- unnecessary bundle weight
- lack of caching or compression for static/semi-static content
- whether delivery cost scales sensibly with traffic

### Example failure patterns
- high-resolution assets are served uncompressed into ordinary web flows
- page loads large scripts/styles for tiny functional surfaces
- repeat requests miss obvious cache opportunities and re-transfer the same heavy content

---

### 9. External API & Third-Party Call Patterns
Reviewer should intensify attention on:
- lack of batching
- redundant enrichment calls
- no caching for stable third-party results
- whether call frequency is aligned to provider cost model and business value
- third-party dependencies used in the most expensive possible way by default

### Example failure patterns
- identical vendor lookups repeat instead of being cached or batched
- external enrichment runs on every record though most records rarely change
- provider API is polled or called synchronously where cheaper reuse would suffice

---

### 10. Database & Storage Efficiency
Reviewer should intensify attention on:
- N+1 query patterns
- missing limits on large scans
- oversized relational storage for blobs or artifacts better stored elsewhere
- whether storage and query cost scale with growth reasonably

### Example failure patterns
- per-item follow-up queries explode with list size
- unbounded queries run in loops or recurring jobs
- large files or payloads are stored in expensive paths with no justification

---

### 11. Compute & Infrastructure Sizing Waste
Reviewer should intensify attention on:
- always-on services for bursty workloads
- oversized serverless/container memory defaults
- lack of scale-down discipline
- whether infrastructure shape reflects real demand rather than prototype convenience

### Example failure patterns
- service remains permanently provisioned for peak that almost never happens
- functions/containers allocate far more memory/CPU than observed need justifies
- system can scale up but not back down economically

---

### 12. Cost Observability & Budget Awareness
Reviewer should intensify attention on:
- spend attribution visibility
- budget caps or anomaly alerts where high-cost features exist
- whether cost spikes would be noticed quickly enough
- per-feature or per-workflow resource awareness

### Example failure patterns
- no one can tell which workflow or feature is driving API spend
- expensive bug could multiply calls for days before billing reveals it
- staging/dev environments use paid APIs with no guardrails or budgets

---

## What This Lens Should Not Duplicate

This lens should not become a generic performance, AI-quality, or workflow-correctness review.

Avoid using it to re-run:
- p95/p99 latency, throughput, and load testing → production performance stages
- model quality, prompt safety, and AI behavior correctness → AI Systems
- workflow correctness, trigger semantics, and retry safety as a reliability issue → Workflow & Automation Reliability
- degraded-mode/failover correctness → Resilience & Degraded Modes
- generic code quality and bug review → Code Health / Defect Discovery
- infrastructure security and secret handling → Security stages / Secrets & Trust Boundaries

Instead, this lens should focus on **economic and resource efficiency**.

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Cost & Resource Efficiency Lens Summary
- Overall efficiency posture:
- Highest-cost risk pattern:
- Most serious unnecessary spend path:
- Scope notes:

### Cost Risk Rating
- LOW / MEDIUM / HIGH / CRITICAL:
- Justification:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Token & LLM call efficiency | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Polling vs event-driven waste | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Overfetching & underprojected queries | PASS / NEEDS_WORK / BLOCK | ... |
| Redundant & duplicate computation | PASS / NEEDS_WORK / BLOCK | ... |
| Memory-heavy flows | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Cost-amplifying retry behavior | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Background & idle work churn | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Asset / bandwidth / delivery efficiency | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| External API & third-party call patterns | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Database & storage efficiency | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Compute & infrastructure sizing waste | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Cost observability & budget awareness | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Area:
- Location:
- Pattern:
- Cost impact:
- Recommendation:
- Effort:

### Wins
- Efficient patterns worth preserving:
- Good reuse/caching/batching decisions observed:

### Priority Fix Order
1. ...
2. ...
3. ...

### Cost Lens Blockers
- Blocking runaway-cost issues:
- Scaling limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- the system can create runaway spend or severe waste without timely intervention
- retries, loops, or repeated expensive operations materially threaten economic viability
- scale amplification would quickly make the current design unacceptable
- resource waste is severe enough that release confidence would be misleading

### NEEDS_WORK-level lens findings
Use when:
- the system is workable but structurally too wasteful for comfortable growth
- expensive operations fire more often than necessary
- efficiency gaps are meaningful but bounded enough to fix without architectural panic

### PASS-level lens findings
Use when:
- expensive work is triggered deliberately and proportionately
- obvious caching, batching, projection, and background-work discipline exist for the assessed scope
- the reviewer can explain why current resource burn is justified by product value and expected usage

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- LLM/API calls repeated for stable work that could be cached
- polling loops left in place where events or slower intervals would suffice
- overfetching and `SELECT *`-style data access in scalable paths
- duplicate external calls or repeated pure computation within one request cycle
- memory-heavy data loading instead of pagination or streaming
- retries that multiply spend on paid operations
- background jobs that run constantly with little or no actual work
- high-bandwidth asset delivery with obvious compression/caching gaps
- missing visibility into which features or workflows are driving cost

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **AI Systems** when token spend and model usage strategy matter materially
- **Workflow & Automation Reliability** when recurring automation creates hidden waste
- **Resilience & Degraded Modes** when retry/fallback behavior amplifies cost under failure
- **Production stages** where economic sustainability matters as much as raw performance

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand which parts of this system cost the most to run, why those costs exist, and whether the current design avoids obvious waste in tokens, compute, bandwidth, memory, storage, and recurring background work for the intended scope.

If that statement cannot be made honestly, this lens should produce meaningful findings.

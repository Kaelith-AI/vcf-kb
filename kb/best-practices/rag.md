---
type: best-practices
best_practice_name: rag
category: ai
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# RAG Best Practices

## When To Use This

Use this document when a system retrieves documents, chunks, or indexed knowledge into model context—and especially when grounding, citations, freshness, or retrieval quality materially affect product trust.

Open it when you need to:
- design corpora, chunking, and metadata strategy
- shape retrieval and ranking behavior
- define evidence standards and abstention behavior
- handle freshness, conflict, and staleness honestly
- evaluate retrieval quality independently from model fluency
- make citations/evidence meaningful instead of decorative

This is the deeper execution-time standard under the **RAG Primer**.

---

## What This Covers

This document covers:
- corpus quality and ownership
- chunking and metadata strategy
- retrieval and ranking design
- evidence standards, abstention, and citations
- freshness, staleness, and conflict handling
- retrieval evaluation and benchmark design
- RAG observability and debugging

---

## Quick Index

- [Corpus quality and ownership](#corpus-quality-and-ownership)
- [Chunking and metadata strategy](#chunking-and-metadata-strategy)
- [Retrieval and ranking design](#retrieval-and-ranking-design)
- [Evidence standards abstention and citations](#evidence-standards-abstention-and-citations)
- [Freshness staleness and conflict handling](#freshness-staleness-and-conflict-handling)
- [Retrieval evaluation and benchmark design](#retrieval-evaluation-and-benchmark-design)
- [RAG observability and debugging](#rag-observability-and-debugging)
- [Checklists](#checklists)

---

## Decision Guide

### Use retrieval when
- the answer should depend on current or owned knowledge
- citations or evidence matter to trust
- model recall alone is not enough
- the corpus can be curated and maintained credibly

### Avoid or limit retrieval when
- the corpus is weak, stale, or poorly governed
- retrieval adds more noise than signal
- the task does not benefit from external grounding

### Escalate design rigor when
- product claims depend on evidence quality
- stale knowledge could create user/operator harm
- retrieval failure may be mistaken for model failure
- multiple corpora or filters complicate evidence selection

---

## Core Rules

1. **RAG is a retrieval system first, not just a prompt pattern.**

2. **Source quality matters as much as model quality.**

3. **Chunking and metadata shape answer quality materially.**

4. **The system should not imply grounding beyond the evidence it actually has.**

5. **Stale or conflicting knowledge must be handled explicitly.**

6. **Retrieval quality must be evaluated independently from eloquent outputs.**

7. **Citations should reflect real supporting evidence.**

8. **Not every question should force retrieval.**

9. **Weak retrieval should lead to abstention, hedging, or clarification—not false confidence.**

10. **A vector database does not substitute for corpus governance.**

---

## Common Failure Patterns

- low-quality or stale corpora indexed as if trustworthy
- chunking that destroys meaning or scope
- metadata too weak to filter and rank well
- irrelevant retrieval cluttering prompts
- answers presented as grounded when evidence is weak or mismatched
- retrieval issues misdiagnosed as purely model problems
- citation UX that looks trustworthy but does not support the answer well

---

## Corpus Quality and Ownership

A retrieval system is only as good as the corpus it searches.

### Good corpus posture
- documents have clear ownership
- freshness expectations are defined
- low-quality material is not indexed casually
- the system can distinguish canonical from low-confidence sources

### Rule
If nobody owns corpus quality, the retrieval layer will degrade quietly over time.

---

## Chunking and Metadata Strategy

Chunking is product design, not just preprocessing.

### Good chunking posture
- preserves meaning and scope
- avoids arbitrary splits that destroy context
- supports useful ranking and citation
- pairs chunks with metadata that supports filtering and interpretation

### Rule
If chunk boundaries are poor, the model will be asked to reason over broken evidence.

---

## Retrieval and Ranking Design

Retrieval should get the right evidence, not just some plausible evidence.

### Good retrieval posture
- filters and ranking reflect real question types
- hybrid approaches are considered when helpful
- retrieval noise is controlled
- evidence ordering supports answer quality

### Rule
Good embeddings cannot rescue weak ranking logic by themselves.

---

## Evidence Standards, Abstention, and Citations

The system should know when it has enough evidence.

### Good evidence posture
- define what counts as sufficient support
- expose citations when they genuinely help trust
- abstain or hedge when evidence is weak or conflicting
- distinguish evidence-backed claims from inference

### Rule
A citation is not proof unless it actually supports the claim being made.

---

## Freshness, Staleness, and Conflict Handling

Knowledge changes.

### Good freshness posture
- know how documents are updated or retired
- detect stale or conflicting sources where possible
- avoid presenting outdated material as current truth
- define what should happen when sources disagree

### Rule
Stale knowledge with citations can be more misleading than no citation at all.

---

## Retrieval Evaluation and Benchmark Design

RAG quality needs its own evaluation layer.

### Good evaluation posture
- separate retrieval quality from model fluency
- test representative question types
- measure whether the right evidence was found
- capture failure cases for regression checks

### Rule
If evaluation only checks whether answers sound good, retrieval quality remains unknown.

---

## RAG Observability and Debugging

Operators should be able to inspect what retrieval actually did.

### Useful observability
- what documents/chunks were retrieved
- why they ranked where they did
- what filters were applied
- when the corpus may be stale or weak
- whether failures come from retrieval, ranking, or model reasoning

### Rule
If retrieval is not inspectable, grounding claims will be hard to trust or debug.

---

## OS / Environment Notes

This topic is usually cross-environment.
Only add platform-specific notes where local/self-hosted retrieval infrastructure materially changes support or operation.

---

## Checklists

### Corpus-Quality Checklist
- [ ] Corpus ownership is explicit
- [ ] Source quality expectations are defined
- [ ] Canonical and weak sources are not mixed carelessly
- [ ] Freshness strategy exists

### Chunking / Metadata Checklist
- [ ] Chunks preserve meaning reasonably well
- [ ] Metadata supports ranking and filtering
- [ ] Chunk design is not arbitrary convenience only
- [ ] Citation quality is supported by the chunking model

### Evidence-Standard Checklist
- [ ] The system knows what counts as enough evidence
- [ ] Weak evidence does not get overclaimed
- [ ] Citations actually support the answer
- [ ] Conflict/staleness is handled honestly

### Retrieval-Evaluation Checklist
- [ ] Retrieval quality is measured separately from answer fluency
- [ ] Representative failures are preserved for regression testing
- [ ] Operators can inspect retrieval behavior
- [ ] Corpus drift or staleness can be detected

---

## Related Primers

- RAG Primer
- LLM Integration Primer
- Qdrant Primer
- Front Matter & Documentation Primer

---

## Related Best Practices

- LLM Integration Best Practices
- Qdrant Best Practices
- Data Integrity Best Practices
- Front Matter & Documentation Best Practices
- Production Best Practices

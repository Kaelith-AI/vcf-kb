---
type: primer
primer_name: rag
category: toolchain
version: 1.0
updated: 2026-03-01
tags: [rag, embeddings, llm]
status: draft-v1
---

# RAG Primer

## What This Primer Is For

This primer prepares a PM to design retrieval-augmented generation systems without treating retrieval like an automatic accuracy upgrade.

It is relevant when a project:
- retrieves documents, chunks, or memory into model context
- depends on vector search or hybrid search for answer quality
- uses embeddings, indexes, or knowledge bases
- needs grounded answers instead of pure model recall

Its purpose is to prevent teams from shipping brittle “RAG” systems that retrieve a lot but prove little.

---

## Read This First

RAG does not automatically make answers true.
It changes the failure mode.

Instead of only hallucinating from the base model, the system can now also fail by:
- retrieving the wrong thing
- retrieving stale or conflicting material
- chunking information badly
- ranking weak evidence above strong evidence
- citing context that does not actually support the answer
- hiding weak retrieval behind confident wording

A retrieval system is only useful if the grounding is real, current, and inspectable.

---

## The 5–10 Rules To Not Violate

1. **RAG is a retrieval system first, not just a prompt pattern.**

2. **Garbage in the index becomes garbage with citations.**  
   Source quality and freshness matter.

3. **Chunking and metadata are part of product quality.**

4. **Retrieval must be inspectable.**  
   You should be able to see what was fetched and why.

5. **Do not imply grounding that the evidence does not support.**

6. **Freshness and conflict handling matter.**  
   Stale docs can be worse than no docs.

7. **Not every question should force retrieval.**  
   Retrieval should help, not add irrelevant noise.

8. **Ranking quality matters as much as embedding quality.**

9. **If the system cannot find enough evidence, it should say so.**

10. **A RAG system needs evaluation beyond “it looked good in testing.”**

---

## Common Early Mistakes

- indexing low-quality or outdated material
- chunking content in ways that break meaning or context
- retrieving too much irrelevant material into the prompt
- not tracking where retrieved content came from
- presenting answers as grounded when evidence is weak or conflicting
- assuming vector search alone solves knowledge quality
- failing to evaluate retrieval quality separately from model quality

---

## What To Think About Before You Start

### 1. Corpus quality
Ask:
- what documents enter the system?
- who owns their quality and freshness?

### 2. Retrieval design
Ask:
- how will content be chunked, indexed, tagged, and ranked?
- what metadata will be needed later?

### 3. Evidence standard
Ask:
- what counts as sufficient grounding for an answer?
- when should the system abstain, hedge, or ask for clarification?

### 4. User trust
Ask:
- how will users know whether the answer is strongly grounded or weakly inferred?
- should sources or evidence be exposed directly?

### 5. Evaluation
Ask:
- how will retrieval quality be tested apart from model eloquence?
- how will stale, conflicting, or missing knowledge be detected?

---

## When To Open The Best-Practice Docs

Open deeper retrieval guidance when you begin:
- building indexes or corpora
- designing chunking/tagging strategy
- selecting embeddings or search approaches
- exposing citations/evidence
- evaluating retrieval quality and freshness

This primer is the preventive mindset layer.
The deeper docs should define the concrete retrieval patterns.

---

## Related Best Practices

Primary follow-up docs:
- RAG Best Practices
- LLM Integration Best Practices
- Front Matter & Documentation Best Practices
- Production Best Practices

---

## Quick Routing Guide

This primer is especially important when:
- a system claims grounded answers from a knowledge base
- embeddings, vector DBs, or search layers are being introduced
- citations, evidence, or memory retrieval are product-critical

It commonly pairs with:
- LLM Integration
- Front Matter & Documentation
- Production
- Qdrant

---

## Final Standard

Before building a RAG system, you should be able to say:

> I know what knowledge enters the system, how retrieval works, what counts as real evidence, how stale or weak retrieval is handled, and how users will know when an answer is genuinely grounded.

If you cannot say that honestly, the retrieval design is not ready.

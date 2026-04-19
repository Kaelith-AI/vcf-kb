---
type: best-practices
best_practice_name: production
category: software
version: 2.0
updated: 2026-03-01
status: draft-v2
---

# Production Best Practices

## When To Use This

Use this document before deployment/runtime work begins, when service ownership and support expectations are unclear, or when review flags observability, recovery, release-readiness, or runtime-discipline problems.

Open it when you need to:
- define operational ownership
- shape the runtime contract
- implement health/readiness/shutdown behavior
- improve observability
- design resilience and degraded modes
- plan deployment, rollback, and recovery safely

This v2 version is aligned to the prep-system primer stack and selective-lookup documentation style.

---

## What This Covers

This document covers:
- service ownership and operational intent
- runtime model and environment contract
- health, readiness, and shutdown behavior
- logging, metrics, and observability
- resilience and degraded modes
- deployment, rollback, and release safety
- incident response and recovery posture
- production-readiness gates

It is the deeper execution-time standard under the **Production Primer**.

---

## Quick Index

- [Non-negotiable standards](#non-negotiable-standards)
- [Service ownership and operational intent](#service-ownership-and-operational-intent)
- [Runtime model and environment contract](#runtime-model-and-environment-contract)
- [Health, readiness, and shutdown behavior](#health-readiness-and-shutdown-behavior)
- [Logging, metrics, and observability](#logging-metrics-and-observability)
- [Capacity resilience and degraded modes](#capacity-resilience-and-degraded-modes)
- [Deployment rollback and release safety](#deployment-rollback-and-release-safety)
- [Incident response and recovery posture](#incident-response-and-recovery-posture)
- [Production-readiness gates](#production-readiness-gates)
- [Checklists](#checklists)

---

## Decision Guide

### Treat a system as production-like when
- someone depends on it operationally
- failure creates real user/operator cost
- it runs outside a purely local experiment
- it needs ongoing support, monitoring, or recovery

### Escalate production rigor when
- the system is external-facing
- state or durability matters
- background jobs or automations run unsupervised
- the system integrates with fragile providers or expensive workflows

### Do not claim production readiness when
- ownership is vague
- rollback is missing
- observability is weak
- support and recovery paths are improvisational

---

## Core Rules

1. **Production ownership must be explicit.**

2. **Runtime assumptions belong in the design, not tribal knowledge.**

3. **Health and readiness need real signals.**

4. **Graceful shutdown and recovery behavior matter.**

5. **Observability is part of the product.**

6. **Background or hidden systems are still production systems.**

7. **Rollback and recovery must exist before strong release claims.**

8. **Degraded modes should be intentional, not accidental.**

9. **Supportability matters as much as deployability.**

10. **“Works locally” is not a production standard.**

---

## Common Failure Patterns

- no clear service owner or support path
- runtime behavior only understood by the original author
- logs present but not operationally useful
- health checks missing or meaningless
- rollback ignored until after failure
- brittle automations treated as low-risk
- persistent state poorly understood or unrecoverable
- release claims stronger than the evidence behind them

---

## Non-Negotiable Standards

These rules should not be casually violated:

- **NEVER** hardcode runtime configuration values that should be externalized
- **NEVER** deploy without health checks and graceful shutdown behavior
- **NEVER** rely on `latest` for critical production versioning decisions casually
- **ALWAYS** have rollback capability for meaningful deployments
- **ALWAYS** use structured operational evidence where possible
- **ALWAYS** define service-level expectations before serious launch claims
- **YOU MUST** know how the system is recovered when it fails

---

## Service Ownership and Operational Intent

Every production-like system needs an owner.

### Ownership should answer
- who runs it?
- who is responsible when it breaks?
- who approves release or rollback decisions?
- who interprets operational signals?

### Rule
A system without ownership may still run, but it is not responsibly operated.

---

## Runtime Model and Environment Contract

Runtime should be understandable without reverse-engineering code and deployment history.

### The runtime contract should expose
- where the system runs
- what services it depends on
- what configuration it needs
- what persistence/state exists
- what platform assumptions matter

### Rule
If an operator cannot explain the runtime model quickly, the system is under-documented operationally.

---

## Health, Readiness, and Shutdown Behavior

A system should distinguish between “up,” “ready,” and “safe to remove.”

### Good posture
- health checks reflect actual service viability
- readiness indicates whether the system should receive work/traffic
- shutdown handles in-flight work safely where relevant
- restart behavior does not hide deeper problems

### Rule
A process that merely exists is not the same as a healthy service.

---

## Logging, Metrics, and Observability

Observability exists to support operation, not log accumulation.

### Good observability behavior
- logs are structured and useful
- key failures and bottlenecks are visible
- operators can tell whether the system is healthy, degraded, or failing
- enough context exists to support debugging and handoff

### Bad observability behavior
- logs everywhere, meaning nowhere
- no useful metrics or service-level signals
- no way to correlate failures across components

### Rule
If you cannot tell what the system is doing under load or failure, the system is not production-ready.

---

## Capacity, Resilience, and Degraded Modes

Resilience means the system fails in controlled ways.

### Good resilience posture
- external failures do not instantly cascade everywhere
- retries/timeouts are intentional
- degraded modes are designed where needed
- capacity assumptions are understood before launch claims

### Rule
A system that only behaves well in perfect conditions is fragile even if the happy path looks polished.

---

## Deployment, Rollback, and Release Safety

Release quality includes the ability to back out safely.

### Good release posture
- releases are reversible
- operators know what changed
- rollout risk is bounded
- configuration and version changes are intentional

### Bad release posture
- “just deploy and hope”
- no rollback path
- runtime changes mixed with unclear config drift
- release confidence based only on local success

### Rule
If rollback is unclear, release confidence is overstated.

---

## Incident Response and Recovery Posture

Recovery should be imagined before the incident, not invented during it.

### Good recovery questions
- what is the first thing an operator checks?
- what should be restored first?
- what data/state must be preserved?
- when should the system fail closed versus remain partially available?

### Rule
You do not really understand a system operationally until you know how it is recovered.

---

## Production-Readiness Gates

Before strong readiness claims, confirm:
- ownership is explicit
- runtime model is understood
- health/readiness behavior exists
- observability is useful
- rollback exists
- recovery path is known
- support burden is credible

### Rule
A feature-complete system can still be operationally incomplete.

---

## OS / Environment Notes

### macOS
Local/macOS behavior should not be mistaken for the actual deployment contract.

### Linux
Linux service management, proxying, storage, permissions, and runtime supervision often dominate production behavior.

### Windows
Installer, service, path, and support expectations may materially change production operations for Windows-facing systems.

---

## Checklists

### Production-Readiness Checklist
- [ ] Ownership is explicit
- [ ] Runtime contract is documented
- [ ] Health/readiness behavior is real
- [ ] Observability is useful enough
- [ ] Rollback exists
- [ ] Recovery path is known

### Runtime Contract Checklist
- [ ] Environment assumptions are explicit
- [ ] Dependencies are known
- [ ] State and persistence are understood
- [ ] Platform/runtime choices are documented

### Observability Checklist
- [ ] Key signals exist
- [ ] Failure modes are visible
- [ ] Operators can inspect health quickly
- [ ] Logs are structured/useful rather than noisy by default

### Rollback / Recovery Checklist
- [ ] Rollback can be executed safely
- [ ] Recovery sequence is understandable
- [ ] Failure impact is bounded
- [ ] Release claims match operational reality

---

## Related Primers

- Production Primer
- Docker Compose Primer
- Systemd Primer
- Nginx Primer
- Cross-Platform Installer Primer

---

## Related Best Practices

- Security Best Practices
- Install / Uninstall Best Practices
- Incident / Rollback / Recovery Best Practices
- Coding Best Practices
- Data Integrity Best Practices

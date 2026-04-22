---
type: primer
primer_name: production
category: type
version: 1.0
updated: 2026-03-01
tags: [production, reliability, observability, incident-recovery]
status: draft-v1
---

# Production Primer

## What This Primer Is For

This primer prepares a PM to avoid the most common early production mistakes in vibe-coded projects.

It is especially relevant for projects that will be:
- deployed
- run by others
- depended on operationally
- expected to recover from incidents
- expected to be supportable after launch

Its purpose is to make sure “production-ready” means something real before that claim gets baked into the project narrative.

---

## Read This First

A lot of projects fail production review long before deployment.

They fail because they were never designed to be:
- observable
- owned
- recoverable
- supportable
- deployable without improvisation

The most common vibe-code production mistake is assuming that if the feature works locally, production is mostly a packaging problem.
It is not.

Production is a different standard:
- someone must own it
- someone must run it
- someone must fix it
- someone must know when it is failing
- someone must recover it safely

---

## The 5–10 Rules To Not Violate

1. **Define operational ownership early.**  
   If nobody owns it, nobody can run it responsibly.

2. **Treat observability as part of the product, not a later add-on.**  
   If you cannot see it, you cannot support it.

3. **Know the deployment shape before implementation sprawls.**  
   Web app, worker, cron, bot, API, daemon, installer, and self-hosted package all need different production thinking.

4. **Assume failure will happen in partial, messy ways.**  
   Production posture is not just “works” or “down.”

5. **Have a rollback and recovery story before claiming readiness.**  
   If you break it, how do you restore trust safely?

6. **Do not confuse logs somewhere with operational evidence.**  
   Operators need useful signals, not just output volume.

7. **Supportability matters as much as launchability.**  
   A system that can launch but cannot be understood or fixed is not production-ready.

8. **Background jobs and automations are production systems too.**  
   Internal or invisible does not mean operationally simple.

9. **Be explicit about state and durability.**  
   Data loss, drift, and restore problems are production problems even if the app logic is fine.

10. **Do not promise production readiness before the evidence exists.**

---

## Common Early Mistakes

- calling something production-ready because it runs locally or in one demo deployment
- having no clear service owner or support path
- adding logs but no meaningful telemetry or health evidence
- ignoring recovery and rollback until after failure
- treating bots/workflows/background workers as “not really production”
- not knowing where persistent state lives or how it is restored
- assuming deployment choice can be deferred without architectural consequences

---

## What To Think About Before You Start

### 1. Service identity
Ask:
- what exactly is this thing in production terms?
- app, API, worker, bot, job, daemon, package, or mixed system?

### 2. Ownership
Ask:
- who owns it?
- who gets paged, asked, or blamed when it breaks?
- who is expected to operate it?

### 3. Runtime shape
Ask:
- where will it run?
- what environments matter?
- what deployment targets or platform assumptions must be decided now?

### 4. Observability
Ask:
- what signals would prove it is healthy or failing?
- what should operators be able to see?

### 5. Recovery
Ask:
- what is the rollback path?
- how is state recovered?
- what is the operator supposed to do during an incident?

---

## When To Open The Best-Practice Docs

Open deeper production guidance before you begin:
- deployment/runtime design
- observability implementation
- rollback/recovery design
- background job or workflow runtime setup
- packaging/install/uninstall design
- host/service stack setup (Docker, systemd, Nginx, etc.)

Production Best Practices should be consulted during implementation, not only at launch time.

---

## Related Best Practices

Primary follow-up docs:
- Production Best Practices
- Security Best Practices
- Coding Best Practices
- Install / Uninstall Best Practices
- Incident / Rollback / Recovery Best Practices
- Docker Compose Best Practices
- Systemd Best Practices
- Nginx Best Practices

---

## Quick Routing Guide

This primer is strongly recommended for:
- `application-web`
- `internal-tool`
- `automation-workflow`
- `api-service`
- `infrastructure-deployment`
- `community-social-project`

It is optional but often useful for:
- `application-desktop` when updater/service/backend/runtime operations matter
- `content-marketing-project` when publishing or analytics infra is non-trivial

Modifiers that make it more important:
- `self-hosted`
- `automation-heavy`
- `community-facing`
- `api-backed`
- `integration-heavy`

---

## Final Standard

Before claiming this project is ready to run beyond local development, you should be able to say:

> I know what this system is operationally, who owns it, how it will be deployed, how its health will be observed, and how it can be recovered when it fails.

If you cannot say that honestly, it is too early to call it production-ready.

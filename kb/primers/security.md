---
type: primer
primer_name: security
category: type
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Security Primer

## What This Primer Is For

This primer prepares a PM to avoid the most common early security mistakes in vibe-coded projects.

It is relevant for most software-bearing work, especially:
- web apps
- APIs
- internal tools
- automation systems
- community/social systems
- externally used products

Its purpose is to get security thinking into the project **before** insecure defaults harden into architecture.

---

## Read This First

Most avoidable security failures are planning failures first.

They happen because the project starts building without clearly deciding:
- what is trusted and what is not
- where secrets live
- which users or systems have power
- what external providers are now part of the trust boundary
- who can reach what surfaces

If you wait until implementation is already sprawling, security becomes expensive cleanup.

Security is not a late-stage polish layer.
It is a boundary-setting discipline from the start.

---

## The 5–10 Rules To Not Violate

1. **Assume every boundary matters.**  
   Users, admins, agents, webhooks, AI providers, queues, and third-party APIs all change trust.

2. **Never treat internal as automatically safe.**  
   Internal tools still expose data, power, and operator risk.

3. **Plan secret handling before implementation.**  
   Keys, tokens, env vars, provider credentials, and config trust should not be ad hoc.

4. **Keep least privilege in mind from day one.**  
   Roles, tokens, service accounts, and admin actions should not default to maximum power.

5. **Model abuse, not just intended use.**  
   Ask how a feature can be misused, not just how it should work.

6. **Do not blur user, operator, and system trust levels.**  
   Separate who can view, trigger, configure, moderate, or destroy.

7. **Validate at the boundary, not after the fact.**  
   Input, webhook payloads, callbacks, and provider responses should not be trusted optimistically.

8. **Treat AI and automation as trust-boundary multipliers.**  
   If a model or workflow can act, route, summarize, or publish, it is a security concern.

9. **Know what is public, private, and sensitive.**  
   Data classification does not need to be fancy, but it must exist.

10. **If you cannot explain the trust model clearly, it is probably not ready.**

---

## Common Early Mistakes

- assuming internal-only tools do not need strong auth/role design
- hardcoding or loosely scattering secrets and provider credentials
- trusting webhook/API/provider inputs too casually
- giving admin/operator/service accounts broader access than needed
- adding AI or automation without treating it as a real trust boundary
- failing to define which data is sensitive and why
- implementing features before thinking about misuse paths

---

## What To Think About Before You Start

### 1. Trust boundaries
Ask:
- who are the actors?
- what can they reach?
- where does trust change?

### 2. Sensitive assets
Ask:
- what data or capabilities would be harmful if exposed, changed, or abused?
- what secrets or tokens exist?
- what admin/operator powers exist?

### 3. External dependencies
Ask:
- what providers, APIs, bots, models, or platforms become part of the system?
- what trust assumptions are being imported with them?

### 4. Misuse paths
Ask:
- how could this be abused by a malicious or careless actor?
- what is the obvious highest-impact misuse case?

### 5. Security posture by audience
Ask:
- is this internal, limited external, or public?
- what would be unacceptable failure for this audience?

---

## When To Open The Best-Practice Docs

Open deeper security guidance when you begin:
- auth/authz design
- secret or provider setup
- webhook or callback handling
- AI/system trust-boundary design
- admin/operator surface design
- deployment/infrastructure setup

Primary follow-up docs should be consulted before the relevant implementation starts, not after the fact.

---

## Related Best Practices

Primary follow-up docs:
- Security Best Practices
- Coding Best Practices
- Production Best Practices
- Secrets / credential handling references
- Content Moderation & Safety Best Practices
- Admin & Operator Best Practices

---

## Quick Routing Guide

This primer is strongly recommended for:
- `application-web`
- `application-desktop`
- `application-mobile`
- `internal-tool`
- `api-service`
- `automation-workflow`
- `community-social-project`
- `infrastructure-deployment`

It is optional but sometimes relevant for:
- `library-sdk` if the library handles auth, secrets, providers, elevated actions, or dangerous interfaces

Modifiers that make this even more important:
- `ai-native`
- `community-facing`
- `integration-heavy`
- `self-hosted`
- `automation-heavy`

---

## Final Standard

Before building sensitive or externally reachable parts of the project, you should be able to say:

> I know what the trust boundaries are, what must be protected, what roles and secrets exist, how external systems change the risk surface, and what misuse paths I must not ignore.

If you cannot say that honestly, you are not ready to proceed safely.

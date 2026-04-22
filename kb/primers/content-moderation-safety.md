---
type: primer
primer_name: content-moderation-safety
category: type
version: 1.0
updated: 2026-03-01
tags: [security, content-moderation, trust-boundary]
status: draft-v1
---

# Content Moderation / Safety Primer

## What This Primer Is For

This primer prepares a PM to avoid the most common early moderation and community-safety mistakes in community-facing or content-bearing projects.

It is especially relevant for:
- Discord/community systems
- Patreon/community products
- Twitter/X or social-content systems
- chats, forums, feeds, and comment systems
- AI products that generate user-visible content
- any project where unsafe content can reach real people

Its purpose is to make sure content safety is designed **before** launch pressure makes it reactive.

---

## Read This First

Community-facing systems do not become safe just because they are technically functional.

The most common mistake is building the visible content surface first and assuming moderation can be added later.
That fails because moderation is not just a button or a queue.
It is a boundary system.

You need to know from the start:
- what content is allowed
- what content is not allowed
- what happens when users report something
- what happens when AI output crosses a line
- who reviews serious cases
- what moderators can do safely

If those questions are not designed up front, the product is likely unsafe for public/community use.

---

## The 5–10 Rules To Not Violate

1. **If users or models can produce visible content, moderation is part of the product.**

2. **Do not assume provider-level AI safety is sufficient.**  
   You still own the public boundary.

3. **A report button that goes nowhere is worse than no report button.**  
   Reporting must route into a real moderation path.

4. **Design escalation before incidents happen.**  
   Severe abuse, threats, exploitation, and legal-risk content need a defined path.

5. **Moderator safety matters too.**  
   Do not design review tooling as if humans can absorb unlimited harmful content exposure safely.

6. **Policy must be operational, not just written.**  
   If the system cannot enforce or review it, the policy is incomplete.

7. **Community-facing projects need abuse thinking, not just feature thinking.**

8. **Imported or AI-generated content is still your problem if you display it.**

9. **Rate limits and moderation tooling are part of safety design.**  
   If abuse can outpace moderation instantly, the boundary is weak.

10. **Public/community trust is hard to regain after preventable safety failures.**

---

## Common Early Mistakes

- launching community features with no real reporting path
- assuming moderation can be manual and improvised indefinitely
- exposing AI-generated content publicly with weak safety boundaries
- forgetting escalation paths for severe abuse or legal-risk content
- building moderator tooling with no shielding or reviewer safety design
- treating imported/federated content as automatically safe enough to display
- relying on policy text without workflow/tooling that can enforce it

---

## What To Think About Before You Start

### 1. Content surface
Ask:
- what content can appear here?
- who creates it: users, models, imported feeds, staff, or mixed sources?

### 2. Safety boundary
Ask:
- what should be blocked, limited, flagged, or escalated?
- what happens before unsafe content reaches users?
- what happens after it is reported?

### 3. Moderator workflow
Ask:
- who reviews content?
- what tools do they need?
- what context do they need to act consistently?
- how are they protected from harmful material?

### 4. Escalation
Ask:
- what severe cases need special handling?
- what is the emergency path if harmful content spreads fast?
- who is allowed to make those calls?

### 5. Public trust
Ask:
- if this system fails here, what trust damage follows?
- is the safety boundary credible enough for the actual audience?

---

## When To Open The Best-Practice Docs

Open deeper moderation/safety guidance when you begin:
- report/flag flow design
- moderator tooling design
- policy and escalation design
- AI-generated content boundary design
- public/community launch preparation

This should happen during feature design, not after the first incident.

---

## Related Best Practices

Primary follow-up docs:
- Content Moderation & Safety Best Practices
- Community Moderation Operations Best Practices
- Security Best Practices
- Admin & Operator Best Practices
- Legal Claims & Messaging Best Practices

---

## Quick Routing Guide

This primer is strongly recommended for:
- `community-social-project`
- any project with modifier `community-facing`

It is also important for:
- AI chat or AI-generated public content
- products with comments, feeds, messaging, or user-generated submissions
- imported/federated content systems

It may be unnecessary for:
- purely internal tools with no public or user-generated content surface
- libraries/SDKs with no direct content boundary exposure

---

## Final Standard

Before building or launching community-facing or content-bearing features, you should be able to say:

> I know what content boundaries exist, how unsafe content is prevented or surfaced, how reporting and moderation work, how severe cases escalate, and why this system is credible enough to expose to real users publicly.

If you cannot say that honestly, the product is not ready for that surface.

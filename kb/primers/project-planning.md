---
type: primer
primer_name: project-planning
category: universal
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Project Planning Primer

## What This Primer Is For

This primer exists to stop preventable project mistakes **before** implementation starts.

Read this at the beginning of a project to make sure you know:
- what kind of project this actually is
- who it is for
- what success and failure look like
- what risks are most likely
- which deeper best-practice docs you will need later

This is the highest-value preventive primer in the system.

---

## Read This First

A lot of review failures happen because the project was never framed correctly.

If you get the planning wrong, everything downstream gets harder:
- wrong primer routing
- wrong security assumptions
- wrong production assumptions
- wrong documentation structure
- wrong scope expectations
- wrong audience/risk posture

Before building anything, slow down and answer:
1. What is the project type?
2. Who is the audience?
3. What are the deployment targets?
4. What modifiers apply? (`ai-native`, `automation-heavy`, `community-facing`, etc.)
5. What must be true for this to count as done?
6. What must never happen?

---

## The 5–10 Rules To Not Violate

1. **Classify the project correctly before planning the work.**  
   Do not treat a library like an app, or a community system like a normal internal tool.

2. **Always identify the audience early.**  
   Internal, limited external, and public-facing work need different rigor.

3. **Treat deployment target as part of the design, not a late implementation detail.**  
   Linux, macOS, Windows, web, Discord, self-hosted, and local-only all change what good work looks like.

4. **Use modifiers instead of overloading the project type.**  
   `ai-native`, `automation-heavy`, `community-facing`, and `cross-platform` are properties of a project, not usually its whole identity.

5. **Define success in observable terms.**  
   “Built” is not success. “Can be run, understood, used, and maintained for the intended audience” is closer.

6. **Define failure conditions before implementation.**  
   What would make this project unsafe, misleading, unshippable, or too fragile to trust?

7. **Do not assume internal means low rigor.**  
   Internal tools often need strong security, operator safety, and data discipline.

8. **Route the right primers before work begins.**  
   The point is to avoid repeatable mistakes, not just catch them later in review.

9. **Know which best-practice docs you will need later.**  
   You should not read all of them at once, but you should know they exist and when to use them.

10. **Write the project plan so another agent could continue it without guessing.**  
   Hidden assumptions create bad automation and bad handoffs.

---

## Common Early Mistakes

- choosing the wrong project type because the surface looks familiar
- forgetting to mark `ai-native`, `community-facing`, or `automation-heavy`
- thinking “internal” means security and production don’t matter
- ignoring deployment target until packaging or runtime problems appear
- starting implementation before defining the done state
- using vague project goals that cannot guide later review
- not knowing which best-practice docs will matter later

---

## What To Think About Before You Start

### 1. Project shape
Ask:
- Is this an app, library, automation, API, infrastructure stack, community system, or content project?
- Is there a more accurate classification than the first obvious one?

### 2. Audience and trust
Ask:
- Is this internal, limited external, or public?
- What damage happens if it is wrong, insecure, misleading, or fragile?

### 3. Deployment / runtime reality
Ask:
- Where will this actually run?
- What environments must it support?
- What tool/platform primers should be routed because of that?

### 4. Modifier check
Ask:
- Is AI central?
- Is automation central?
- Is the project community-facing?
- Is it cross-platform?
- Is it self-hosted?

### 5. Review implications
Ask:
- Which review lenses will likely matter later?
- Which review types are obviously going to be important?

---

## When To Open The Best-Practice Docs

Open deeper best-practice docs when the work actually reaches that area.

Examples:
- before implementation-heavy work → Coding Best Practices
- before auth/secrets/provider setup → Security Best Practices
- before deployment/runtime setup → Production Best Practices
- before library API shaping → Library / SDK Best Practices
- before community launch/moderation tooling → Content Moderation & Safety Best Practices
- before documentation structure work → Front Matter & Documentation Best Practices

Do **not** read every best-practice doc at project start.
The primer’s job is to help you know what you will need later.

---

## Related Best Practices

Primary follow-up docs:
- Project Planning Best Practices
- Coding Best Practices
- Security Best Practices
- Production Best Practices
- Front Matter & Documentation Best Practices
- Library / SDK Best Practices
- Content Moderation & Safety Best Practices

---

## Quick Routing Guide

If the project is:
- **application-web / api-service / internal-tool** → you will likely need Coding + Security + Production
- **library-sdk** → you will likely need Library / SDK + documentation guidance
- **automation-workflow** → you will likely need Security + Production + Automated Agents
- **community-social-project** → you will likely need Security + Production + Content Moderation / Safety
- **content-marketing-project** → you will likely need branding/documentation first, with content/legal follow-up later

And if modifiers apply:
- `ai-native` → read LLM Integration primer
- `community-facing` → read Content Moderation / Safety primer
- `cross-platform` → read Cross-Platform Installer primer
- `self-hosted` → likely read Docker Compose / Systemd / Nginx primers as relevant

---

## Final Standard

Before starting implementation, you should be able to say:

> I know what kind of project this is, who it is for, where it runs, what risks matter most, what primers I should read now, and which best-practice docs I will need later.

If you cannot say that honestly, you are not ready to start building.

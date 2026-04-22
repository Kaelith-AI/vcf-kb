---
type: primer
primer_name: systemd
category: toolchain
version: 1.0
updated: 2026-03-01
tags: [systemd, production]
status: draft-v1
---

# Systemd Primer

## What This Primer Is For

This primer prepares a PM to use systemd for service management without treating “it starts on boot” as the whole operational story.

It is relevant when a project:
- runs as a long-lived Linux service
- needs restart policy, boot behavior, or service supervision
- includes workers, daemons, bots, schedulers, or self-hosted app processes
- depends on Linux host operations instead of only container orchestration

Its purpose is to keep service ownership, lifecycle, and failure handling explicit.

---

## Read This First

systemd is not just a way to launch a process.
It is part of the operating model.

The most common mistake is creating a unit file that technically works, while leaving the real questions unanswered:
- who owns the service?
- how does config get into it?
- what user should it run as?
- when should it restart?
- what does healthy versus crash-looping look like?
- how will logs and failures be inspected?

A service that starts automatically but is hard to understand or recover is still badly operated.

---

## The 5–10 Rules To Not Violate

1. **Run services with intentional identity.**  
   User, group, paths, and permissions should not be accidental.

2. **Service lifecycle is part of the design.**  
   Start, stop, restart, reload, and shutdown behavior all matter.

3. **Restart policy should match reality.**  
   Restarting forever is not the same as being resilient.

4. **Configuration injection must be explicit and auditable.**

5. **Logs are part of operability.**  
   If the unit runs but failures are unreadable, the service is not well managed.

6. **Dependencies and ordering should be minimal but real.**

7. **Do not run everything as root by default.**

8. **Health and failure signals should be understandable by another operator.**

9. **A systemd unit should describe a service, not hide a workaround jungle.**

10. **Boot-time convenience should not replace production discipline.**

---

## Common Early Mistakes

- running services as root unnecessarily
- putting fragile shell logic into unit files instead of fixing the runtime model
- using restart policies that hide real failures
- not documenting environment/config expectations
- unclear working directories, paths, or permissions
- not knowing how logs or status will be inspected in practice
- turning systemd units into improvised deployment scripts

---

## What To Think About Before You Start

### 1. Service identity
Ask:
- what process is this unit managing?
- what user/group should it run as?
- what files, sockets, and directories does it need?

### 2. Lifecycle behavior
Ask:
- how should it start?
- how should it stop?
- what should trigger restart versus escalation?

### 3. Config and secrets
Ask:
- where do env/config values come from?
- how will they be updated safely?
- what should never be embedded directly in the unit?

### 4. Operability
Ask:
- how will another operator inspect status, logs, and failure state?
- what does success or crash-looping look like?

### 5. Host integration
Ask:
- what does this depend on at boot/runtime?
- network, storage, db, reverse proxy, mounted paths, or other services?

---

## When To Open The Best-Practice Docs

Open deeper systemd/runtime guidance when you begin:
- creating Linux services
- deciding service users/permissions
- designing restart/recovery policy
- wiring env/config into host-managed processes
- documenting service operations for handoff

This primer is the preventive mindset layer.
The deeper docs should define the host/service patterns.

---

## Related Best Practices

Primary follow-up docs:
- Systemd Best Practices
- Production Best Practices
- Security Best Practices
- Admin & Operator Best Practices
- Incident / Rollback / Recovery Best Practices

---

## Quick Routing Guide

This primer is especially important when:
- a project runs on Linux outside pure container orchestration
- a bot, daemon, worker, or app must survive reboot/failure
- host-level service management is part of deployment

It commonly pairs with:
- Production
- Security
- Docker Compose
- Nginx

---

## Final Standard

Before adopting systemd as part of the runtime model, you should be able to say:

> I know what process this unit manages, what identity it runs under, how config enters it, what restart policy makes sense, and how another operator will inspect and recover it safely.

If you cannot say that honestly, the service model is not ready.

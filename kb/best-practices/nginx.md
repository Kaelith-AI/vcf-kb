---
type: best-practices
best_practice_name: nginx
category: runtime
version: 1.0
updated: 2026-03-01
tags: [nginx, production]
status: draft-v1
---

# Nginx Best Practices

## When To Use This

Use this document when Nginx is part of your edge or delivery path for web traffic and you need explicit, understandable, and supportable proxy/static-serving behavior.

Open it when you need to:
- define Nginx’s role in the architecture clearly
- design host/path/upstream routing boundaries
- handle TLS and public exposure intentionally
- set headers, limits, caching, redirects, and timeouts safely
- define degraded/failure behavior for upstream issues
- keep configurations legible for operators under incident pressure

This is the deeper execution reference under the Nginx primer.

---

## What This Covers

This document covers:
- Nginx role and edge responsibilities
- hosts, paths, upstreams, and routing boundaries
- TLS, certificates, and public exposure
- headers, limits, redirects, caching, and compression
- upstream failure behavior and degraded modes
- logging, config clarity, and operator debugging

---

## Quick Index

- [Nginx role and edge responsibilities](#nginx-role-and-edge-responsibilities)
- [Hosts paths upstreams and routing boundaries](#hosts-paths-upstreams-and-routing-boundaries)
- [TLS certificates and public exposure](#tls-certificates-and-public-exposure)
- [Headers limits redirects caching and compression](#headers-limits-redirects-caching-and-compression)
- [Upstream failure behavior and degraded modes](#upstream-failure-behavior-and-degraded-modes)
- [Logging config clarity and operator debugging](#logging-config-clarity-and-operator-debugging)
- [Checklists](#checklists)

---

## Decision Guide

### Use stronger edge controls when
- traffic is public-facing
- multiple hosts/routes/upstreams share one edge layer
- claims about availability/security depend on edge behavior
- failures can quickly affect user trust

### Simplify configuration when
- copied snippets are increasing ambiguity
- mixed responsibilities make config hard to reason about
- route/host boundaries are broader than business need

### Escalate review when
- TLS or exposure settings change materially
- header or caching changes can affect security or correctness
- upstream failure behavior is uncertain under load or outage

---

## Core Rules

1. **Know exactly what role Nginx is playing.**

2. **Hosts, routes, and upstream mappings should be explicit.**

3. **TLS and public exposure are core design concerns, not defaults.**

4. **Headers and limits materially change behavior and risk.**

5. **Do not rely on copied config blocks you cannot explain.**

6. **Failure behavior should be intentional and testable.**

7. **Static serving and proxying should not be mixed carelessly.**

8. **Edge logs should support real debugging and incident response.**

9. **Config structure should reduce ambiguity for operators.**

10. **A clean edge config is part of system reliability, not polish.**

---

## Common Failure Patterns

- copied config fragments with unclear behavior
- overbroad host/path exposure beyond intended surface
- weak timeout/body/limit handling
- TLS assumptions that do not match real posture
- unclear upstream fallback or degraded behavior
- mixed static/proxy responsibilities that hide ownership
- logging too weak to diagnose live incidents quickly

---

## Nginx Role and Edge Responsibilities

Nginx should have a clear boundary role.

### Good posture
- define whether Nginx is proxy, static server, TLS terminator, or mixed
- keep edge responsibilities visible in docs and config layout
- align role with actual operational ownership

### Rule
If Nginx’s role is ambiguous, edge decisions will be inconsistent.

---

## Hosts, Paths, Upstreams, and Routing Boundaries

Routing should mirror product boundaries, not config convenience.

### Good posture
- map host/path intent explicitly
- keep upstream ownership and routing contracts clear
- avoid route sprawl that broadens exposure accidentally

### Rule
If route ownership is unclear, incident handling slows dramatically.

---

## TLS, Certificates, and Public Exposure

TLS and exposure posture should be deliberate.

### Good posture
- certificates and renewal responsibilities are explicit
- only necessary public surfaces are exposed
- redirects and protocol handling are intentional

### Rule
“Public by default” is usually the wrong edge posture.

---

## Headers, Limits, Redirects, Caching, and Compression

These controls define behavior at the edge.

### Good posture
- security and proxy headers are set intentionally
- body/request limits reflect product needs and abuse risk
- caching/compression is tuned for correctness and performance
- redirects preserve clear URL and policy semantics

### Rule
Edge policy controls should be chosen for system behavior, not copied blindly.

---

## Upstream Failure Behavior and Degraded Modes

Plan for backend instability before it happens.

### Good posture
- timeout/retry behavior is defined with tradeoffs understood
- degraded response behavior is predictable
- upstream outages do not create ambiguous user or operator signals

### Rule
If failure behavior is unspecified, outages become harder and noisier than necessary.

---

## Logging, Config Clarity, and Operator Debugging

Operator clarity is a reliability feature.

### Good posture
- logs include enough context for diagnosis
- config layout supports quick orientation under pressure
- comments and docs explain non-obvious behavior

### Rule
A configuration that is hard to read during incidents is operational debt.

---

## OS / Environment Notes

### macOS
- useful for local testing, but deployment assumptions can differ from production Linux edges

### Linux
- most common real deployment target; service supervision and host integration often matter most

### Windows
- less common as primary Nginx edge, but support/compatibility claims must match actual deployment behavior

---

## Checklists

### Edge-Role Checklist
- [ ] Nginx role is explicit
- [ ] Responsibilities are documented and owned
- [ ] Route boundaries reflect product intent
- [ ] Config remains understandable to other operators

### Exposure/TLS Checklist
- [ ] Public surfaces are intentionally scoped
- [ ] TLS/certificate responsibilities are clear
- [ ] Redirect behavior is deliberate
- [ ] Exposure changes receive risk-proportional review

### Headers/Limits Checklist
- [ ] Header policy is intentional
- [ ] Request/body/time limits are defined and justified
- [ ] Caching/compression choices fit correctness/performance goals
- [ ] Policy changes are tested against expected behavior

### Nginx-Operator Checklist
- [ ] Logging supports incident diagnosis
- [ ] Config structure is legible under pressure
- [ ] Upstream failure behavior is known and tested
- [ ] Non-obvious config decisions are documented

---

## Related Primers

- Nginx Primer
- Production Primer
- Security Primer
- Docker Compose Primer

---

## Related Best Practices

- Production Best Practices
- Security Best Practices
- Docker Compose Best Practices
- Systemd Best Practices

---
type: primer
primer_name: nginx
category: toolchain
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Nginx Primer

## What This Primer Is For

This primer prepares a PM to use Nginx as a web edge, reverse proxy, or static-serving layer without treating it like a copy-paste config problem.

It is relevant when a project:
- serves web traffic through Nginx
- terminates TLS
- proxies to app backends
- serves static assets or documentation
- needs routing, headers, caching, compression, or edge behavior

Its purpose is to make edge behavior intentional instead of accidental.

---

## Read This First

Nginx often looks simple because many examples are short.
Real deployments are not simple just because the config file is.

The most common mistake is assuming Nginx is just a forwarding layer.
In reality it often becomes responsible for:
- traffic exposure
- TLS posture
- hostname/routing correctness
- request/body limits
- header policy
- caching behavior
- static asset handling
- failure presentation

If these are copied in without understanding, the edge becomes a risk amplifier.

---

## The 5–10 Rules To Not Violate

1. **Know what role Nginx is playing.**  
   Reverse proxy, static file server, TLS terminator, edge router, or mixed.

2. **Hostnames, routes, and upstreams should be explicit and minimal.**

3. **Headers are behavior, not decoration.**  
   Security, caching, and proxy headers change system behavior materially.

4. **TLS and public exposure are core design concerns.**

5. **Do not copy large config blocks you cannot explain.**

6. **Request limits, timeouts, and body handling matter.**

7. **Failure behavior should be intentional.**  
   What happens when the upstream is down, slow, or misbehaving?

8. **Static content and application proxying have different needs.**

9. **Logging and access visibility still matter at the edge.**

10. **A good Nginx config should reduce ambiguity, not add hidden behavior.**

---

## Common Early Mistakes

- copying proxy configs without understanding headers/timeouts
- exposing more routes or hostnames than necessary
- weak TLS/cert assumptions
- not deciding what should be served directly versus proxied
- unclear upstream failure behavior
- mixing unrelated sites/apps in ways that make operations confusing
- leaving access/error logging too vague to support debugging

---

## What To Think About Before You Start

### 1. Edge role
Ask:
- what is Nginx doing here?
- proxy, static serving, TLS termination, redirect handling, or multiple?

### 2. Exposure model
Ask:
- what hosts, paths, and services are public?
- what should never be exposed directly?

### 3. Upstream behavior
Ask:
- what backend does Nginx talk to?
- what happens if it is slow, down, or returns bad responses?

### 4. Policy behavior
Ask:
- what headers, limits, redirects, caching, and compression behavior are required?
- which ones are security-sensitive?

### 5. Operability
Ask:
- how will another operator understand, inspect, and change this config?
- are logs and site boundaries clear enough for debugging?

---

## When To Open The Best-Practice Docs

Open deeper Nginx/edge guidance when you begin:
- proxying to app backends
- serving public web traffic
- handling TLS and certificates
- setting headers, limits, caching, or redirects
- documenting multi-site or multi-service host configs

This primer is the preventive layer.
The deeper docs should define the actual config standards and examples.

---

## Related Best Practices

Primary follow-up docs:
- Nginx Best Practices
- Production Best Practices
- Security Best Practices
- Admin & Operator Best Practices
- Front Matter & Documentation Best Practices *(for config clarity/docs)*

---

## Quick Routing Guide

This primer is especially important when:
- a web app or API is exposed through a reverse proxy
- TLS termination or public hostname routing matters
- static assets/docs and app traffic are both part of delivery
- self-hosted/public deployments are being prepared

It commonly pairs with:
- Production
- Security
- Docker Compose
- Systemd

---

## Final Standard

Before adopting Nginx as part of the runtime edge, you should be able to say:

> I know what traffic Nginx handles, what is exposed publicly, how upstream behavior works, what edge policies apply, and how another operator would inspect and change this safely.

If you cannot say that honestly, the edge configuration is not ready.

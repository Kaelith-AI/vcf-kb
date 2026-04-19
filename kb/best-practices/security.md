---
type: best-practices
best_practice_name: security
category: software
version: 2.0
updated: 2026-03-01
status: draft-v2
---

# Security Best Practices

## When To Use This

Use this document before security-sensitive implementation work, when trust boundaries are changing, when auth/secrets/validation concerns appear, or when a project is being prepared for external or public exposure.

Open it when you need to:
- define trust boundaries
- design authentication and authorization
- protect secrets and sensitive configuration
- validate input at real system boundaries
- reduce dependency and supply-chain risk
- make security ownership and review expectations explicit

This v2 version is aligned to the prep-system primer stack and selective-lookup documentation style.

---

## What This Covers

This document covers:
- trust boundary mapping
- authentication and authorization
- secrets and sensitive configuration
- input validation and boundary enforcement
- dependency and supply-chain security
- data protection basics
- logging/observability without sensitive leakage
- security review and pre-release gates

It is the deeper execution-time standard under the **Security Primer**.

---

## Quick Index

- [Non-negotiable standards](#non-negotiable-standards)
- [Trust boundary mapping](#trust-boundary-mapping)
- [Authentication and authorization](#authentication-and-authorization)
- [Secrets and sensitive configuration](#secrets-and-sensitive-configuration)
- [Input validation and boundary enforcement](#input-validation-and-boundary-enforcement)
- [Dependency and supply-chain security](#dependency-and-supply-chain-security)
- [Data protection and privacy-sensitive handling](#data-protection-and-privacy-sensitive-handling)
- [Logging and monitoring without sensitive leakage](#logging-and-monitoring-without-sensitive-leakage)
- [Security review and pre-release gates](#security-review-and-pre-release-gates)
- [Checklists](#checklists)

---

## Decision Guide

### Increase security rigor immediately when
- the project is external-limited or external-public
- the system handles secrets, credentials, payments, or user data
- the system exposes APIs, webhooks, or public interfaces
- the system grants permissions, runs agents, or triggers real-world actions

### Treat a concern as a trust-boundary problem when
- data crosses from one actor or system into another
- authority changes at that boundary
- external input can shape behavior, storage, or execution
- provider or tool output influences sensitive decisions

### Escalate design attention when
- auth and authorization are being improvised late
- secrets handling is unclear
- security ownership is ambiguous
- convenience is overriding explicit boundary design

---

## Core Rules

1. **Define trust boundaries explicitly.**

2. **Never commit or hardcode secrets.**

3. **Validate input at the real system boundary.**  
   Client-side validation is not a security control.

4. **Least privilege should be the default mindset.**

5. **Authentication and authorization are different problems.**

6. **Dependency posture is part of security posture.**

7. **Sensitive data handling must be intentional.**

8. **Observability must not become data leakage.**

9. **Internal systems still need serious security discipline.**

10. **Unclear ownership is itself a security risk.**

---

## Common Failure Patterns

- weak or implicit trust-boundary definition
- authn/authz confused or partially delegated to the frontend only
- secrets in code, env sprawl, or logs
- validation happening only at cosmetic/UI layers
- overprivileged systems or service identities
- risky dependencies accepted for convenience
- security assumptions that depend on “internal use” optimism
- monitoring/logging that leaks sensitive values

---

## Non-Negotiable Standards

These rules should not be casually violated:

- **NEVER** commit secrets, tokens, keys, or passwords to source code
- **NEVER** use string concatenation for SQL queries
- **NEVER** auto-execute LLM output in high-risk paths without strong controls
- **NEVER** use floating dependency ranges casually in production contexts
- **ALWAYS** validate all input at the real execution/storage boundary
- **ALWAYS** use parameterized queries for database operations
- **ALWAYS** externalize sensitive configuration
- **YOU MUST** verify dependencies and packages are real before building around them

---

## Trust Boundary Mapping

Security starts with knowing where trust changes.

### A trust boundary exists when
- user input enters the system
- one service calls another
- external providers or webhooks inject data
- model output can shape downstream behavior
- privileged actions are separated from ordinary behavior

### Good trust-boundary practice
- document where boundaries exist
- define who/what is trusted at each boundary
- define what validation and authorization happen there
- treat ambiguous boundaries as design debt

### Rule
If you do not know where trust changes, you do not know where security begins.

---

## Authentication and Authorization

Authentication answers **who** something is.
Authorization answers **what** it may do.

### Good auth/authz posture
- identity is verified using the right mechanism for the risk
- permissions are checked server-side / at the real control boundary
- privilege is narrowly scoped
- sensitive actions are not inferable from UI hiding alone

### Common mistakes
- client-side-only admin checks
- role checks without resource/context checks
- overbroad service accounts
- permission logic spread everywhere without central policy

### Rule
If a hidden button is your main authorization control, the system is insecure.

---

## Secrets and Sensitive Configuration

Secrets should be hard to leak accidentally.

### Good secrets posture
- secrets come from a real secrets-management path
- different services do not share credentials casually
- rotation and replacement are possible
- secrets are masked from logs and debug output

### Bad secrets posture
- secrets in code
- secrets in screenshots, docs, or examples
- production relying on ad hoc env sprawl with weak hygiene
- sensitive values printed during debugging

### Rule
A secret handling approach is weak if you are one debug statement away from leakage.

---

## Input Validation and Boundary Enforcement

All external or semi-trusted input should be validated where it matters.

### Validate at boundaries such as
- HTTP/API ingress
- webhook handlers
- job payload ingestion
- file upload/parse steps
- LLM output acceptance into structured actions
- DB writes or privileged operations

### Good validation posture
- validate structure
- validate range/size/allowed values
- reject unexpected input cleanly
- normalize only when that normalization is safe and explicit

### Rule
Validation that exists only in the UI is user guidance, not security.

---

## Dependency and Supply-Chain Security

Every dependency adds attack surface and long-tail risk.

### Good dependency hygiene
- verify the package exists and is maintained
- pin versions appropriately
- review high-risk or unusual packages more carefully
- avoid unnecessary dependencies for trivial problems

### Common risks
- typosquatting
- AI-hallucinated packages
- stale/vulnerable transitive trees
- unreviewed tooling with broad permissions

### Rule
A dependency should be treated as imported trust, not free convenience.

---

## Data Protection and Privacy-Sensitive Handling

Protect data based on sensitivity and exposure risk.

### Good posture
- minimize collection
- minimize retention
- separate sensitive from non-sensitive where practical
- know what is user data, credential material, or regulated/sensitive content

### Rule
If you have not classified the sensitivity of the data, protection will be inconsistent.

---

## Logging / Monitoring Without Sensitive Leakage

Observability is valuable, but logs can become breach surfaces.

### Good logging posture
- avoid logging secrets, raw tokens, or unnecessary personal data
- log events and context, not sensitive payloads by default
- redact when needed
- make security-relevant events observable without leaking sensitive material

### Rule
If your debugging strategy depends on dumping everything, your security posture is fragile.

---

## Security Review and Pre-Release Gates

Security should have visible gates before strong readiness claims.

### Before release or exposure
- trust boundaries are documented
- auth/authz model is understood
- secrets handling is sane
- dependency posture is reviewed
- validation is implemented at real boundaries
- logging is not leaking sensitive material

### Rule
A project is not secure because it has no known exploit today.
It is secure only to the extent its boundaries and controls are intentionally designed.

---

## OS / Environment Notes

### macOS
Local development convenience should not become the de facto production security model.

### Linux
Host/runtime exposure, service identity, filesystem permissions, and proxy/service layering often change the real attack surface.

### Windows
Path behavior, credential handling assumptions, and runtime/service support may require explicit security choices.

---

## Checklists

### Pre-Security-Work Checklist
- [ ] Trust boundaries are identified
- [ ] Security ownership is clear
- [ ] Sensitive data and secret paths are understood
- [ ] Audience/risk level is factored into rigor

### Auth / Permission Checklist
- [ ] Authentication and authorization are treated separately
- [ ] Permission checks happen at the real control boundary
- [ ] Least privilege is the default
- [ ] High-risk actions are not protected only by UI hiding

### Secrets / Config Checklist
- [ ] No secrets in code or examples
- [ ] Sensitive config is externalized
- [ ] Logging/debugging will not leak secrets
- [ ] Rotation/replacement is possible

### Security Review Checklist
- [ ] Validation exists at real boundaries
- [ ] Dependency posture is reviewed
- [ ] Logging is safe enough
- [ ] Release claims are consistent with actual controls

---

## Related Primers

- Security Primer
- Production Primer
- LLM Integration Primer
- Content Moderation / Safety Primer
- Automated Agents Primer

---

## Related Best Practices

- Coding Best Practices
- Production Best Practices
- Git / Change Safety Best Practices
- Install / Uninstall Best Practices
- Data Integrity Best Practices

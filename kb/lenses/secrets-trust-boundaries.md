---
type: review-lens
lens_name: secrets-trust-boundaries
category: specialized
applies_to: [code, security, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Secrets & Trust Boundaries Lens

## Lens Purpose

This lens intensifies review for secret handling, credential scope, caller trust, identity boundaries, and hidden trust assumptions across system edges.

It exists for systems where the key risk is not only “is a secret exposed in code?” but also:
- who is trusted to call what?
- what identities are being assumed or over-scoped?
- where do prompts, tokens, provider keys, and privileged instructions cross boundaries?
- what parts of the system are treated as safe merely because they are “internal”?

This is not a basic secret scanner.
It is a practical review overlay for **how secrets and trust actually move through the system**.

---

## Why This Lens Exists

Vibe-coded systems are often structurally naive about trust.

They commonly produce code that:
- compiles and works
- uses a secret manager somewhere
- has a webhook endpoint or internal API that “seems fine”
- calls AI providers or internal agents successfully

…while still failing basic trust questions such as:
- is this caller verified?
- is this credential too powerful for what the code does?
- is an internal service trusted only because it is internal?
- are prompts or system instructions functioning as secrets but handled casually?
- are logs, traces, or error tools leaking sensitive material?

Kaelith’s environment makes this even more important because it includes:
- AI-native products
- agent-to-agent and workflow orchestration
- internal tools with privileged operations
- client-facing products crossing third-party provider boundaries

This lens exists to map and pressure-test those boundaries.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. What the real trust boundaries are
2. What secrets, prompts, tokens, and privileged identities cross those boundaries
3. Whether credentials are scoped narrowly enough for their actual use
4. Whether callers, webhooks, agents, and services are verified rather than merely assumed trustworthy
5. Whether logging, tooling, or runtime behavior leaks trust-sensitive material indirectly

If the reviewer cannot describe who is trusted, how that trust is verified, and what secrets flow where, this lens should produce serious findings.

---

## Applies To

This lens is most useful for:
- internal tools
- bots and agent systems
- workflow automation
- webhook-driven systems
- multi-service applications
- products using third-party APIs or AI providers
- systems that move secrets or privileged instructions across many components

It may be applied to:
- **Code review** to intensify trust-boundary and secret-flow scrutiny in implementation
- **Security review** to sharpen real boundary enforcement and credential-scope analysis
- **Production review** to expose secret leakage, rotation fragility, and runtime trust assumptions that threaten live operation

---

## Core Review Rule

Do not confuse secret storage with trust safety.

A system does **not** get credit because:
- it uses environment variables
- a secrets manager exists
- credentials are not hardcoded in source
- an endpoint is labeled internal-only
- an agent or service “should only be called by our own systems”
- prompts or system instructions are hidden from the UI

The reviewer must examine how trust is granted, verified, scoped, and leaked.

---

## What This Lens Should Emphasize

### 1. Secret Scope & Privilege Minimization
Reviewer should intensify attention on:
- whether credentials have broader privileges than necessary
- admin or root-grade tokens used for ordinary features
- shared credentials spanning unrelated systems or environments
- whether a secret manager hides overprivilege rather than solving it

### Example failure patterns
- production worker uses global admin token though it only needs narrow read/write scope
- one provider key reused across many unrelated applications and environments

---

### 2. Trust Boundary Mapping
Reviewer should intensify attention on:
- external and internal calls across trust zones
- which identity is used for each crossing
- whether the receiver verifies the caller properly
- whether important trust assumptions exist only in comments or architecture language

### Example failure patterns
- internal API assumes only internal callers can reach it, with no actual verification
- service boundary exists architecturally but not in trust enforcement terms

---

### 3. LLM Credential & Prompt Exposure
Reviewer should intensify attention on:
- provider keys
- system prompts or instructions acting as sensitive logic or secret-bearing material
- prompt logs and traces
- whether prompt content could expose internal processes, policies, or secrets if extracted
- whether prompt-bearing assets are handled with more care than ordinary strings

### Example failure patterns
- system prompt logged verbatim in observability tools
- prompt contains privileged instructions, internal URLs, or sensitive operational guidance
- provider credential and prompt content handled with the same casualness as public copy

---

### 4. Webhook & Inbound Caller Validation
Reviewer should intensify attention on:
- HMAC/signature validation
- secret/header validation
- IP or transport assumptions being used as weak trust substitutes
- webhook endpoints with direct side effects
- whether inbound automated calls are treated as trusted because they come from “known systems”

### Example failure patterns
- webhook endpoint executes business logic without authenticating caller
- inbound request trust based only on endpoint obscurity or expected source

---

### 5. Environment Segregation & Secret Bleed
Reviewer should intensify attention on:
- dev/staging/prod credential separation
- `.env.example` and template safety
- config paths that accidentally use production secrets in lower environments
- environment labels without real isolation
- whether one environment compromise expands into another casually

### Example failure patterns
- staging and production share the same key “for convenience”
- example or template files contain semi-real operational values
- environment routing logic can accidentally pull the wrong secret set

---

### 6. Agent & Service-to-Service Trust
Reviewer should intensify attention on:
- whether internal agent/service calls authenticate each other
- whether downstream privileged services assume upstream callers are trusted automatically
- whether tool/agent routing creates hidden trust inheritance
- whether internal orchestration is operating on ambient trust rather than verified identity

### Example failure patterns
- agent B accepts privileged instructions from agent A with no caller verification
- service accepts “internal” requests solely because they come from the local network or expected code path

---

### 7. Logging, Tracing & Observability Leakage
Reviewer should intensify attention on:
- secret exposure in logs, traces, metrics tags, and error tools
- prompt/request/response dumps containing sensitive material
- user-visible errors exposing trust-sensitive internals
- debug paths that widen exposure under failure conditions

### Example failure patterns
- auth headers or full request bodies logged routinely
- tracing stores provider prompts, tokens, or secrets as searchable attributes
- error diagnostics leak internal trust assumptions back to the caller

---

### 8. Client-Side Trust & Frontend Exposure
Reviewer should intensify attention on:
- secrets embedded in browser-exposed bundles or config
- public/client-side identifiers being used as if they were trustworthy proof
- frontend-controlled tenant/user/role values trusted by the backend
- overexposed client-side endpoints returning privileged or unnecessary data

### Example failure patterns
- secret-like values shipped via public frontend config
- backend trusts client-supplied tenant or role identifiers without server verification
- public client routes return internal/admin-grade data because they were built “for our own UI”

---

### 9. Rotation & Revocation Readiness
Reviewer should intensify attention on:
- whether compromised secrets can be rotated without major outage
- revocation paths for issued keys/tokens
- whether one credential is shared so broadly that rotation becomes dangerous
- emergency response brittleness caused by credential sprawl

### Example failure patterns
- one secret powers several unrelated systems and cannot be rotated safely
- no credible revocation path for long-lived credentials or prompt-bearing configs

---

### 10. Hallucinated or Weak Authentication Logic
Reviewer should intensify attention on:
- auth logic that looks structurally correct but is functionally weak
- skipped validation steps in JWT/OAuth/API key flows
- equality checks or placeholder auth code left in real paths
- vibe-generated trust checks that only prove presence, not legitimacy

### Example failure patterns
- signature checked but key claims/audience/issuer never verified
- auth middleware validates existence of token, not authority conveyed by it
- comparison or state-check logic is oversimplified in ways that leave fake trust intact

---

## What This Lens Should Not Duplicate

This lens should not collapse into a mechanical secrets audit or full security stage rerun.

Avoid using it to re-run:
- regex-based secret scanning and history-scanning mechanics → Security 6
- generic dependency/CVE auditing → Code 5 / Security 5
- full secure-coding methodology → Security 4
- generic prompt injection analysis → AI Systems lens / Security 2
- broad infrastructure hardening → Security 8
- general observability setup review → Production 3

Instead, this lens should focus on:
- secret scope
- trust boundaries
- caller verification
- identity assumptions
- indirect leakage and overtrust

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Secrets & Trust Boundaries Lens Summary
- Overall trust-boundary posture:
- Highest-risk overtrust finding:
- Most concerning secret-scope issue:
- Coverage confidence:

### Trust Boundary Map
- Major trust crossings identified:
- Caller identities in use:
- Verification mechanisms present/missing:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Secret scope & privilege minimization | PASS / NEEDS_WORK / BLOCK | ... |
| Trust boundary mapping | PASS / NEEDS_WORK / BLOCK | ... |
| LLM credential & prompt exposure | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Webhook / inbound validation | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Environment segregation | PASS / NEEDS_WORK / BLOCK | ... |
| Agent / service-to-service trust | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Logging / tracing leakage | PASS / NEEDS_WORK / BLOCK | ... |
| Client-side trust & exposure | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Rotation / revocation readiness | PASS / NEEDS_WORK / BLOCK | ... |
| Weak or hallucinated auth logic | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- Evidence:
- Why the trust boundary is weak:
- Blast radius:
- Fix direction:
- Cross-stage handoff:

### Trust Lens Blockers
- Blocking trust/secret issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- trust is being granted without meaningful verification on important paths
- secrets or prompt-bearing privileged material are materially exposed or over-scoped
- internal/agent/service trust assumptions are dangerously false in practice
- rotation or trust-boundary weakness makes the system unsafe for its release scope

### NEEDS_WORK-level lens findings
Use when:
- the system is directionally secure but contains meaningful overtrust or scope problems
- secret handling is better than ad hoc but still fragile
- boundary verification exists inconsistently or too loosely

### PASS-level lens findings
Use when:
- important trust boundaries are identifiable and credibly enforced
- secrets and privileged identities are reasonably scoped
- reviewer can explain who is trusted, why, and how that trust is verified without large hidden assumptions

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- “internal” agent/service calls with no authentication
- overprivileged provider or platform keys hidden behind a secret manager
- system prompts treated casually despite containing sensitive logic or information
- webhook endpoints with no signature validation
- example/env/template files normalizing dangerous secret bleed
- logs, traces, or support tools capturing prompts, tokens, or headers
- frontend bundles or public configs leaking private secrets or trust-sensitive values
- trust granted to client-supplied identity/tenant/role data
- no realistic rotation/revocation path for compromised keys
- auth logic that looks correct but validates only presence, not legitimacy

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **AI Systems** for prompt/tool/provider trust boundaries
- **Privacy, Data Rights & Consent** for third-party data sharing and provider disclosure
- **Security stages** for enforcement, exploitability, and infra hardening follow-through
- **Workflow & Automation Reliability** when trust assumptions move through internal automation chains

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I understand where this system’s trust boundaries really are, what secrets and identities cross them, why callers are or are not trusted, and whether the current secret scope and trust assumptions are proportionate to the damage they could cause if wrong.

If that statement cannot be made honestly, this lens should produce serious findings.

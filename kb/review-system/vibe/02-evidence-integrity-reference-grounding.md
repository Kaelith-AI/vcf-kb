---
type: review-stage
review_type: vibe
stage: 2
title: "Evidence Integrity & Reference Grounding"
version: 0.1
updated: 2026-04-30
provenance:
  tool: review_type_create
  phase: review-type-stage
  model: claude-sonnet-4-6
  endpoint: claude-code-subagent
  generated_at: "2026-04-30T00:00:00Z"
---
# Vibe Stage 2 — Evidence Integrity & Reference Grounding

## Stage Metadata
- **Review type:** Vibe
- **Stage number:** 2
- **Stage name:** Evidence Integrity & Reference Grounding
- **Purpose in review flow:** Verify that every factual claim in the LLM's output — API names, library functions, RFCs, version numbers, behavior assertions — is grounded in reality and not hallucinated
- **Default weight:** High
- **Required reviewer posture:** Skeptical of every citation, lookup every specific claim that is checkable. Confidence of expression is not evidence.
- **Lens interaction:** All lenses may intensify reference scrutiny in specific domains (RFCs for protocol-focused work, library docs for API-heavy work), but none may waive the requirement to verify factual claims
- **Depends on:** Vibe Stage 1 scope and intent — what was the LLM working on? Claims should be checked in that domain.
- **Feeds into:** Vibe Stages 4, 6, 8, and 9; Code Stage 4 (hallucinated API semantics); Code Stage 5 (invented dependencies)

---

## Why This Stage Exists

Language models are fluent at producing confident factual statements that are subtly or completely wrong.

This failure mode is structurally different from a human developer making an error:
- A developer who guesses at an API typically writes tentative code and adds a TODO or a note to verify
- An LLM that hallucinates an API writes the same confident, polished code it writes for real APIs
- The output is indistinguishable at the surface level — same style, same structure, same plausibility of naming

The specific hallucination categories that appear in LLM-generated code:

**Hallucinated function or method names.** The model generates a call to `.json_body` on an HTTP response object because it sounds right — the real attribute is `.json()`. The code fails at runtime, not at review time. The name is plausible enough that an inattentive reviewer misses it.

**Hallucinated library features.** The model references a method that was proposed, never merged, or exists in a competing library under a different name. In some cases, the method was present in a pre-release version and removed before stable. In other cases, it exists in Python but not in the JavaScript version of the library being used.

**Hallucinated RFC or specification claims.** The model cites "RFC 7234 section 4.2" for a caching behavior that RFC 7234 does not say, or cites an RFC number that resolves to a completely different protocol.

**Hallucinated version-specific behavior.** The model states "as of version 3.1.0, this method returns a tuple" when no such change occurred, or cites a changelog entry from a version that does not exist.

**Hallucinated configuration options.** The model configures a library with an option key that does not exist in its documented API, producing silent no-ops or runtime errors rather than the expected behavior.

**Overclaimed behavior assertions.** The model states "this is the standard approach" or "the spec requires..." when neither claim is accurate. The assertion carries an implicit authority that the actual implementation does not earn.

This stage protects downstream stages — especially correctness and release confidence — from being built on false technical foundations. A codebase where critical paths use methods that do not exist, or behaviors that do not match the cited specification, cannot pass a vibe review regardless of how well-structured the surrounding code is.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. **Which factual claims in the output are verifiable** — API names, library functions, RFC citations, version behavior, config keys
2. **Which claims were verified and found to be accurate**
3. **Which claims were found to be inaccurate, hallucinated, or unsupported**
4. **Which claims could not be verified and remain open risks**
5. **Whether the implementation would fail at runtime due to non-existent or misused interfaces**
6. **Whether the LLM's reasoning narrative contains overclaimed authority ("the spec requires...", "this is the correct behavior...")**

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Claims inventory** — every factual claim in the output that is checkable
2. **Verified claims** — claims confirmed accurate, with evidence source
3. **Hallucination findings** — claims confirmed inaccurate, with the actual reality
4. **Unverified risks** — claims that could not be checked and carry non-trivial risk
5. **Overclaimed authority findings** — assertions of "standard" or "spec-required" behavior without basis
6. **Runtime failure risk assessment** — which hallucinations would cause runtime errors vs silent wrong behavior
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

For each factual claim in the output, use:
- Official library documentation at the version in use (check the lockfile for the pinned version; do not check latest if the project uses an older version)
- RFC editor for specification citations (rfc-editor.org)
- Changelog and release notes for version-specific behavior claims
- Official project documentation for configuration options
- The project's own codebase for claims about what the system currently does

**Important: the LLM's output text is not an evidence source.** The reviewer must go to the primary source for each claim. A claim is not verified because the LLM stated it confidently.

---

## Core Review Rule

**Confidence of expression is not evidence of accuracy.**

The LLM writes hallucinated API calls and real API calls in the same style, with the same confidence, with the same apparent certainty. The reviewer cannot distinguish them by reading the prose. They must check.

A function that:
- has a plausible name
- is used in a plausible location
- is described in confident prose
- fits the surrounding code structurally

...is not therefore real. It must be verified.

---

# Review Procedure

## Step 1 — Inventory All Verifiable Factual Claims

Before checking anything, list every claim that is verifiable.

### Claim categories
- **API method/function names:** anything called on an external library, SDK, or framework (including standard library if the version matters)
- **Constructor or configuration options:** named keys, flags, enum values passed to third-party code
- **RFC or specification citations:** numbered RFC references, spec section numbers, protocol behavior claims
- **Version-specific behavior claims:** "as of version X, this behaves as Y"
- **Performance or behavior guarantees:** "this is O(log n)," "this method is thread-safe," "this is atomic"
- **"Standard approach" assertions:** claims that a pattern is standard, required, or correct per some authority

### Check
- [ ] All external library call sites are listed
- [ ] All explicit citations (RFCs, docs, version notes) are listed
- [ ] All configuration option usages are listed
- [ ] All "standard/required/spec-compliant" assertions are listed

### Reviewer note
At large scale, the reviewer may triage — check all critical-path call sites first, then sample non-critical ones. But critical-path API calls must be checked, not sampled.

---

## Step 2 — Verify API and Library Call Sites

For each call site, verify that the method exists and behaves as the LLM claims.

### Two-level check required
**Level 1 — Existence:** Does this method/attribute/function exist at all in the version being used?

**Level 2 — Semantics:** If it exists, does the code use it in a way that matches its actual documented behavior?

### Check
- [ ] Each called method/function exists in the declared library version
- [ ] Return types match how the code uses the return value
- [ ] Async/sync behavior matches usage (not using `.then()` on a sync function, not `await`-ing a non-Promise)
- [ ] Required parameters are present and in the correct order
- [ ] Optional parameters with significant behavior impact are used correctly
- [ ] Methods do not have documented deprecations or critical caveats the code ignores

### Common hallucination patterns
- `response.json_body` instead of `response.json()`
- `fs.readFileAsync()` (does not exist in Node.js core)
- `db.query()` called with a callback in a library that returns Promises and removed callback support in version 3
- `crypto.randomUUID()` used in a Node 14 context (not available until Node 14.17)
- OpenAI SDK calling `.create()` with parameters from a different model class
- SQLite library methods that exist in Python but not in the JavaScript binding

### Example — Correct verification
**LLM output:** `const result = await prisma.user.findUnique({ where: { id: userId } })`

**Reviewer check:** Prisma 5.x docs confirm `findUnique` exists on model delegates, `where` is a named parameter, returns `null` if not found (not throws). Code handles null correctly.

**Verdict:** Verified.

### Example — Hallucination found
**LLM output:** `const result = await prisma.user.findOrCreate({ where: { id: userId }, create: { ... } })`

**Reviewer check:** Prisma does not have `findOrCreate`. This is likely a Sequelize API hallucination. Prisma uses `upsert`.

**Verdict:** Hallucinated method. Would throw `TypeError: prisma.user.findOrCreate is not a function` at runtime.

---

## Step 3 — Verify RFC and Specification Citations

Any citation to a numbered RFC, specification section, or protocol standard must be verified.

### Check
- [ ] The cited RFC number resolves to the correct document at rfc-editor.org
- [ ] The specific section cited exists in that RFC
- [ ] The behavior described in the LLM's text actually matches the cited section
- [ ] Obsoleted or superseded RFCs are identified if relevant (e.g., RFC 2616 is obsolete; RFC 7230-7235 successor, now further replaced by RFC 9110-9114)

### Common failure patterns
- "RFC 7234 requires that stale-while-revalidate be handled as follows..." — RFC 7234 does not mandate this behavior, and stale-while-revalidate was specified in a separate RFC extension
- Citing an RFC number that resolves to a completely unrelated protocol
- Citing a section number that does not exist in the cited RFC
- Describing behavior from a draft RFC that was never published as a standard

### Example — Correct
**LLM claim:** "Per RFC 9110 section 15.4.5, a 404 response SHOULD include a body explaining the error."

**Reviewer check:** RFC 9110 section 15.4.5 covers 404 Not Found. The statement about including a body is in that section. "SHOULD" (not "MUST") is accurately characterized.

**Verdict:** Accurate.

### Example — Hallucination found
**LLM claim:** "RFC 7617 section 3 specifies that Basic auth must be Base64-encoded using the URL-safe alphabet."

**Reviewer check:** RFC 7617 is "The 'Basic' HTTP Authentication Scheme." Section 3 does not specify URL-safe Base64. Basic auth uses standard Base64 per RFC 7617. The URL-safe alphabet claim is incorrect and would cause auth failures with most clients.

**Verdict:** Factually wrong. Would cause authentication to fail against standards-compliant servers.

---

## Step 4 — Verify Version-Specific Behavior Claims

Claims about version-specific behavior require the most specific verification.

### Check
- [ ] The claimed version actually exists (version numbers are not invented)
- [ ] The behavior change claimed actually occurred in that version (check changelog)
- [ ] The version in use (from lockfile) is the version where the claimed behavior applies
- [ ] "Breaking change in version X" claims are checked against actual changelogs

### Common failure patterns
- "Since v2.0.0 of this library, the callback-style API was removed" — the library never removed it, the LLM confused two different libraries
- Citing a changelog entry from version 4.2.0 when the lockfile shows 3.8.1
- Version numbers in the range of what sounds plausible but do not correspond to real releases

### Verification method
Check the library's GitHub releases page or npm/PyPI/Cargo page for version existence, then check the changelog for the specific behavioral claim.

---

## Step 5 — Verify Configuration Option Claims

Configuration-driven behavior is a common hallucination site because options are numerous and their names follow plausible patterns.

### Check
- [ ] Configuration keys used in code exist in the library's documented API
- [ ] Configuration values are valid for the option (correct enum values, correct types)
- [ ] Default values the LLM cites match the library's actual documented defaults
- [ ] "This option enables..." descriptions match what the option actually does

### Common failure patterns
- `{ strict: true }` on a library that has no `strict` option, producing a no-op
- `{ timeout: 5000 }` on a library that uses a different key (`timeoutMs` or `requestTimeout`)
- `{ retries: 3, backoff: 'exponential' }` where `backoff` is not a recognized key
- Providing string values where enum integers are expected, or vice versa

---

## Step 6 — Identify Overclaimed Authority Assertions

This step targets LLM language that carries implicit authority it has not earned.

### Check
- [ ] Claims of "standard approach" are assessed for whether a standard actually exists
- [ ] "The spec requires..." or "per the RFC..." assertions are verified or challenged
- [ ] "This is the correct way to..." assertions are assessed for whether that is genuinely settled consensus or opinion
- [ ] "Best practice" assertions are assessed for what body endorses that practice

### Why this matters
These assertions appear harmless but they shape how the reviewer weighs the surrounding implementation. If the LLM says "the spec requires this," a reviewer who accepts that claim without checking will evaluate the code differently than a reviewer who knows the claim is unsupported.

### Common failure patterns
- "Best practice is to always use prepared statements here" — accurate, but cited with false authority ("the OWASP standard requires...") when OWASP only recommends it
- "The JWT spec requires HS256 as the minimum" — false; the JWT spec does not mandate a minimum algorithm
- "Per the OAuth 2.1 specification, PKCE is required for all flows" — the spec recommends but does not universally require it for all grant types in all contexts

---

## Step 7 — Assess Runtime Failure Risk

Translate hallucination findings into runtime consequence.

### Severity mapping for hallucinations
- **Immediate crash:** Called method does not exist; will throw `TypeError` or similar at runtime on any execution of the path
- **Silent wrong behavior:** Called method exists but returns different data than assumed; no error, wrong result
- **Intermittent failure:** Called method exists but has different semantics in failure cases, causing wrong behavior only on error paths
- **Configuration no-op:** Config key does not exist; library ignores it, producing silent wrong behavior (e.g., retries not actually configured)
- **Version-specific risk:** Method exists in latest but not in the pinned version; works in dev but fails in prod

### Rule
An immediate-crash hallucination on a critical path must be classified as a **BLOCK**. Silent-wrong-behavior and configuration no-ops on critical paths are **NEEDS_WORK** or **BLOCK** depending on severity of the wrong behavior.

---

## Step 8 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Vibe 4:** any hallucination that affects claimed-done status (the implementation cannot be complete if it calls methods that do not exist)
- **Vibe 6:** pattern-matching signals — hallucinated methods from a near-neighbor library suggest the LLM solved a different problem
- **Vibe 8:** runtime behavior claims that are wrong affect behavioral assumptions in production
- **Code Stage 4:** hallucinated API calls and semantics feed the code review's implementation correctness check
- **Code Stage 5:** invented package names or non-existent dependencies need dependency hygiene review

### Required handoff block
At the end of the stage, include:
- **Carry-forward concerns:**
  - Hallucinations confirmed:
  - Hallucinations suspected but unverified:
  - Runtime failure risk:
  - Silent wrong-behavior risk:
  - Overclaimed authority:
  - Release confidence impact:

---

## Lens Interaction Guidance

Examples:
- **protocol lens:** intensify RFC and specification verification; every behavioral claim about wire-format, ordering, or required fields needs primary source verification
- **api-integration lens:** every call site for the external API must be verified against the current API documentation; APIs change more often than standard libraries
- **security lens:** hallucinated security API behaviors (crypto, JWT, OAuth) may produce vulnerabilities that appear correct at code review time but fail under adversarial conditions
- **performance lens:** hallucinated complexity claims, thread-safety assertions, or batching behavior may cause production performance failures invisible in testing

---

## Severity / Gating Model

### PASS
Use PASS when:
- all critical-path API calls are verified accurate
- any unverified calls are non-critical-path and explicitly noted as open risks
- no overclaimed authority assertions are shaping material decisions
- no hallucinations found

### NEEDS_WORK
Use NEEDS_WORK when:
- hallucinations are present but on non-critical or error paths
- overclaimed authority assertions exist but the surrounding implementation is independently correct
- some API calls could not be verified and carry non-trivial risk
- configuration hallucinations produce no-ops rather than crashes

### BLOCK
Use BLOCK when:
- hallucinated API call on a critical path would cause immediate runtime failure
- hallucinated behavior produces silent wrong-behavior on a trust or security-relevant path (e.g., auth, data handling)
- hallucinated specification citation is being used to justify a design decision that is actually unsound
- the codebase's core feature path relies on methods or behaviors that do not exist

---

## Escalation Guidance

Escalate or explicitly flag when:
- hallucinated security API usage → Security review (wrong crypto, wrong JWT behavior, wrong OAuth flow)
- hallucinated RFC behavior shapes a trust boundary → carry into security and compliance review
- hallucinated methods in a critical path prevent Stage 4 (completeness) from passing
- multiple hallucinations in the same domain suggest systematic problem-substitution → Vibe 6

---

## Required Report Format

### 1. Claims Inventory
- Total factual claims identified:
- Claims on critical paths:
- Claims on non-critical paths:

### 2. Verified Claims
| Claim | Location | Verified Against | Result |
|---|---|---|---|
| `response.json()` exists | `api/client.ts:34` | requests 2.31.0 docs | Correct |

### 3. Hallucination Findings
| Claim | Location | What LLM Said | Reality | Runtime Risk |
|---|---|---|---|---|
| `prisma.user.findOrCreate` | `db/users.ts:12` | "method exists in Prisma" | Method does not exist; Prisma uses `upsert` | Immediate crash |

### 4. Unverified Risks
| Claim | Location | Why Unverifiable | Risk Assessment |
|---|---|---|---|
| ... | ... | ... | Low / Medium / High |

### 5. Overclaimed Authority Findings
- Claim:
- Asserted authority:
- Reality:
- Impact on surrounding design:

### 6. Runtime Failure Risk Assessment
- Immediate crash risks:
- Silent wrong-behavior risks:
- Configuration no-op risks:
- Version-specific risks:

### 7. Carry-Forward Concerns
- Hallucinations confirmed:
- Hallucinations suspected but unverified:
- Runtime failure risk:
- Silent wrong-behavior risk:
- Overclaimed authority:
- Release confidence impact:

### 8. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- accept confident prose as verification of factual claims
- skip checking a method call because it "sounds right"
- verify against the wrong version (always check the pinned version, not the latest)
- treat "the LLM said it's standard" as verification that it is standard
- classify a hallucinated method as "NEEDS_WORK" when it is on a critical path and would cause an immediate crash
- stop at Level 1 (existence check) without doing Level 2 (semantics check)

---

## Final Standard

A change passes this stage only if the reviewer can say:

> I checked every critical-path factual claim in this output against a primary source, and the API calls, library methods, specification citations, and version assertions are accurate for the version in use. Where claims could not be verified, I have named them as open risks.

If that statement cannot be made honestly, this stage should not pass.

---
type: review-stage
review_type: security
stage: 2
stage_name: "Threat Model Abuse Paths"
version: 1.0
updated: 2026-04-18
---
# Security Stage 2 — Threat Model & Abuse Paths

## Stage Metadata
- **Review type:** Security
- **Stage number:** 2
- **Stage name:** Threat Model & Abuse Paths
- **Purpose in review flow:** Identify realistic attack scenarios against the scoped system, with mandatory evaluation of AI-specific threat categories
- **Default weight:** Highest importance within adversarial security review
- **Required reviewer posture:** Attacker-minded, concrete, severity-honest, skeptical of hand-waved mitigations
- **Lens interaction:** Lenses may shift emphasis toward certain abuse families, but no lens may skip the mandatory AI-specific threat categories
- **Depends on:** Security Stage 1 scoped assets, trust boundaries, actors, obligations, and assumptions
- **Feeds into:** Security Stages 3, 4, and 9; Production Stage 9 where residual attack paths affect launch posture
- **Security/Production handoff:** Record realistic abuse paths, mitigation status, and blocking versus bounded threats for downstream enforcement and release judgment

---

## Why This Stage Exists

Once the system’s scope is known, the reviewer must stop thinking like a builder and start thinking like an attacker.

This stage exists because many projects — especially vibe-coded ones — inherit functionality without adversarial design. That leaves realistic abuse paths such as:
- prompt injection
- tool misuse
- context leakage
- unsafe trust in model/provider output
- permission escalation in agentic flows
- hallucinated capability claims that humans or code trust incorrectly
- classic spoofing, tampering, disclosure, DoS, and privilege-escalation paths attached to real system boundaries

Threats like these often remain invisible until someone models them deliberately.

This stage asks:

> How would a reasonable attacker, abuser, malicious input, or unsafe dependency of trust try to manipulate this system?

The answer must be concrete enough to matter, not generic enough to sound security-shaped.

---

## Stage Objective

By the end of this stage, the reviewer must be able to state, with evidence:

1. What the most realistic attack paths against the system are
2. Which threats are already mitigated, partially mitigated, or unmitigated
3. What high-severity threats remain
4. How AI-specific attack categories change the threat landscape
5. Whether a reasonable attacker would find easy abuse paths the builders have not accounted for

---

## Required Reviewer Outputs

The reviewer must produce all of the following:

1. **Threat model summary**
2. **Attacker / abuse-path summary**
3. **Mandatory AI-specific threat category table**
4. **Highest-risk threats and current mitigation status**
5. **Chained attack findings**
6. **Blocking vs bounded risks**
7. **Stage verdict: PASS / NEEDS_WORK / BLOCK**

---

## Reviewer Evidence Sources

Inspect at minimum:
- prompt construction and context assembly paths
- tool-call definitions and argument validation
- agent orchestration / sub-agent spawning logic
- input ingestion points (web, file, webhook, URL fetch, CLI, API)
- authn/authz checks around privileged actions
- comments/docs claiming security or mitigations
- any existing threat model or risk notes

---

## Core Review Rule

Do not produce a generic threat list.

This stage requires concrete abuse paths tied to:
- actual entry points
- actual trust boundaries
- actual sensitive actions or assets
- actual attacker capabilities

The reviewer must distinguish between:
- **plausible threats** worth serious treatment
- **contrived threats** that sound clever but are not materially relevant
- **mitigated threats** with real structural controls
- **comment-level mitigations** that are not real mitigations yet

---

# Review Procedure

## Step 1 — Enumerate Realistic Attackers & Baseline Threat Families

Start with who might attack or abuse the system.

### Check
- [ ] Reviewer identifies realistic attacker types and capabilities
- [ ] Spoofing, tampering, information disclosure, denial-of-service, and privilege-escalation paths are considered where relevant
- [ ] Threats are tied to actual entry points and assets, not generic theory
- [ ] Several end-to-end abuse paths are described concretely

### Reviewer questions
- Who benefits from attacking or abusing this system?
- Which actors are external, internal, malicious, careless, or semi-trusted?
- Which attacks are low-friction and high-impact?

### Common failure patterns
- threat list copied from a framework but not tied to the actual project
- only external attacker considered while operators, providers, agents, or callbacks are ignored
- “we use auth” treated as the end of threat analysis

---

## Step 2 — Evaluate the Mandatory AI-Specific Attack Categories

This step is required for every applicable project.

### Mandatory categories
For each category below, the reviewer must document:
- attack vector
- likely impact
- current mitigations
- verdict: **MITIGATED / PARTIAL / UNMITIGATED**

### Required categories
- [ ] **Prompt injection**
- [ ] **Tool misuse / tool permission escalation**
- [ ] **Data exfiltration via model / context leakage**
- [ ] **Model provider trust boundaries**
- [ ] **Agent permission escalation**
- [ ] **Hallucinated capability claims leading to unsafe trust decisions**
- [ ] **Infrastructure privilege escalation through AI agents**

### Important note
That seventh category is mandatory. The reviewer must explicitly evaluate whether AI agents, model outputs, orchestration logic, or tool bridges could become a path to broader infrastructure or host privilege than intended.

---

## Step 3 — Build Concrete Abuse Paths

Threats must be described as paths, not labels.

### Check
- [ ] Abuse paths trace actor → entry point → traversal → impact
- [ ] Chained attacks are considered, not just isolated steps
- [ ] Low-friction/high-impact paths receive extra scrutiny
- [ ] Reviewer distinguishes plausible from contrived threats

### Example — Chained attack path
1. Attacker submits prompt-injection content through an allowed ingestion channel
2. Model interprets malicious instruction as authoritative
3. Agent/tool bridge invokes a privileged tool or retrieves sensitive local data
4. Sensitive data is exfiltrated in final model output

The reviewer must describe why each step is or is not blocked.

---

## Step 4 — Evaluate Mitigation Reality

Determine whether the system’s claimed defenses actually disrupt the threat paths.

### Check
- [ ] Existing mitigations are structural, not just narrative
- [ ] Design comments are not treated as full mitigations without evidence
- [ ] Partial mitigations are labeled honestly as partial
- [ ] Reviewer records where builders appear aware of the threat but have not actually contained it

### Common failure patterns
- “prompt injection handled in prompt” with no hard boundary
- “tool use restricted” with no allowlist or argument validation
- “internal-only” assumed as a mitigation for public or weakly gated paths

---

## Step 5 — Prioritize Threats Honestly

This stage must identify what matters most.

### Check
- [ ] Threats are prioritized by credible impact and likelihood
- [ ] High-severity issues are not softened into vague medium-risk language
- [ ] Reviewer states what should block progress versus what can be tracked as bounded risk
- [ ] Low-severity or contrived threats do not bury more important attack paths

### Reviewer questions
- What would create the worst real harm if exploited?
- What would be easiest for an attacker to attempt successfully?
- Which paths are truly launch-blocking?

---

## Step 6 — Review Security Comments / Risk Notes as Evidence

Comments may show awareness, but awareness is not mitigation.

### Check
- [ ] Risk notes are treated as evidence, not absolution
- [ ] TODOs or future plans are not counted as controls
- [ ] Reviewer flags mitigation-by-comment as a security smell

### Example — Incorrect
```python
# TODO: sanitize this later
run_command(user_input)
```
Why it fails:
- comment acknowledges danger but does not reduce it

---

## Step 7 — Record Cross-Stage Handoff Notes

### Required handoff targets
- **Security 3:** abuse paths that depend on weak or fake boundary enforcement
- **Security 4:** code-level exploit paths involving injection, auth logic, validation, crypto, or unsafe state handling
- **Security 9:** residual threats that must shape security release posture
- **Production 9:** high-impact abuse paths affecting ship/no-ship decisions

### Required handoff block
- **Carry-forward concerns:**
  - Highest-risk attack paths:
  - Unmitigated AI-specific threats:
  - Chained attack risks:
  - Boundary-enforcement dependencies:
  - Release-blocking abuse concerns:

---

## Lens Interaction Guidance

Examples:
- **llm-focused lens:** primary intensifier here for prompt injection, context leakage, hallucinated trust decisions, and agentic escalation chains
- **credentials lens:** emphasize secrets exfiltration, token misuse, and credential-bearing flows in attack paths
- **bug-hunt lens:** emphasize low-friction exploitability in ordinary feature paths
- **platform lens:** emphasize OS/runtime/deployment-specific abuse paths and infrastructure escalation routes

---

## Severity / Gating Model

### PASS
Use PASS when:
- major abuse paths have been identified and evaluated honestly
- all mandatory AI-specific threat categories are covered explicitly
- no clear high-severity unmitigated path should block further progress

### NEEDS_WORK
Use NEEDS_WORK when:
- threat model is directionally solid but mitigations are partial
- several abuse paths remain credible but bounded
- AI-specific threats are recognized yet incompletely handled

### BLOCK
Use BLOCK when:
- realistic high-severity threats remain unmitigated
- mandatory AI-specific categories are not adequately addressed
- attack paths to sensitive actions/data are easy and credible
- the project is still relying on obvious unsafe trust relationships

---

## Escalation Guidance

Escalate or explicitly flag when:
- AI-specific attack categories are acknowledged but not truly analyzed
- a chained attack path connects prompt or provider trust directly to privileged action or data exfiltration
- threat severity is being minimized to avoid blocking decisions
- agentic or model-mediated flows create infrastructure-level escalation risk

If a reasonable attacker would find easy high-impact abuse paths that the system has not structurally mitigated, use **BLOCK**.

---

## Required Report Format

### 1. Threat Model Summary
- System abuse posture summary:
- Most likely attacker types:
- Highest-value targets:

### 2. Attacker / Abuse-Path Summary
- Key attacker classes:
- Main entry points abused:
- Most plausible attack routes:

### 3. Mandatory AI-Specific Threat Category Table
| Category | Attack Vector | Impact | Current Mitigations | Verdict |
|---|---|---|---|---|
| Prompt injection | ... | ... | ... | MITIGATED / PARTIAL / UNMITIGATED |
| Tool misuse / tool permission escalation | ... | ... | ... | ... |
| Data exfiltration via model / context leakage | ... | ... | ... | ... |
| Model provider trust boundaries | ... | ... | ... | ... |
| Agent permission escalation | ... | ... | ... | ... |
| Hallucinated capability claims leading to unsafe trust decisions | ... | ... | ... | ... |
| Infrastructure privilege escalation through AI agents | ... | ... | ... | ... |

### 4. Highest-Risk Threats & Mitigation Status
- Threat:
- Why it matters:
- Current mitigation status:

### 5. Chained Attack Findings
- Chain description:
- Break points present or missing:
- Residual risk:

### 6. Blocking vs Bounded Risks
- Blocking threats:
- Bounded but acceptable risks:
- Deferred security work:

### 7. Stage Verdict
- Verdict: PASS / NEEDS_WORK / BLOCK
- Top reasons:
- Confidence level: High / Medium / Low

---

## Reviewer Anti-Patterns to Avoid

Do **not**:
- deliver a generic STRIDE-style list disconnected from the actual system
- skip AI-specific categories because the project also has classic web threats
- treat comments, TODOs, or roadmap items as mitigations
- analyze only isolated attacks when chaining is the real danger
- soften serious threats to avoid a blocking recommendation

---

## Final Standard

A project passes this stage only if the reviewer can say:

> I can describe the most realistic ways this system could be abused, including AI-specific attacks, explain what currently blocks or fails to block those paths, and identify whether any high-severity threat remains serious enough to stop further confidence.

If that statement cannot be made honestly, this stage should not pass.

---
type: best-practices
best_practice_name: automated-agents
category: ai
version: 1.0
updated: 2026-03-01
tags: [llm, agent-orchestration, tool-use]
status: draft-v1
---

# Automated Agents Best Practices

## When To Use This

Use this document when agents execute actions rather than only answering questions, when automated or semi-automated agent loops are part of the product/ops model, or when tool access, approvals, and rollback paths need explicit design.

Open it when you need to:
- define agent roles and scope boundaries
- assign tool permissions intentionally
- control high-risk or irreversible agent actions
- design stop conditions, retries, and escalation logic
- require logs, artifacts, and audit trails from agent runs
- coordinate multi-agent workflows without chaos

This is the deeper execution-time standard under the **Automated Agents Primer**.

---

## What This Covers

This document covers:
- agent role and scope definition
- tool permissions and authority boundaries
- approval, rollback, and high-risk action control
- stop conditions, retries, and escalation logic
- artifacts, logs, and audit trails
- multi-agent coordination and handoff contracts
- operational oversight for background agent systems

---

## Quick Index

- [Agent role and scope definition](#agent-role-and-scope-definition)
- [Tool permissions and authority boundaries](#tool-permissions-and-authority-boundaries)
- [Approval rollback and high-risk action control](#approval-rollback-and-high-risk-action-control)
- [Stop conditions retries and escalation logic](#stop-conditions-retries-and-escalation-logic)
- [Artifacts logs and audit trails](#artifacts-logs-and-audit-trails)
- [Multi-agent coordination and handoff contracts](#multi-agent-coordination-and-handoff-contracts)
- [Operational oversight for background agent systems](#operational-oversight-for-background-agent-systems)
- [Checklists](#checklists)

---

## Decision Guide

### Fully automate only when
- the risk of incorrect action is acceptably low
- the workflow is well bounded
- rollback or correction is credible
- logs/artifacts make the run inspectable

### Require human approval when
- the action is destructive, high-impact, or hard to reverse
- auth, permissions, money, infrastructure, or public trust are involved
- model uncertainty could materially change outcomes

### Split one agent into multiple roles when
- planning, acting, and reviewing should not all be owned by one authority
- one role needs read-heavy context while another needs write authority
- separation reduces confusion, risk, or coordination debt

---

## Core Rules

1. **Every agent needs a clear role and scope.**

2. **Tool access should be intentionally bounded.**

3. **High-risk irreversible changes need stronger controls.**

4. **Stop conditions are required; infinite retry is not resilience.**

5. **Logs and artifacts are part of the automation contract.**

6. **Humans remain accountable even when execution is delegated.**

7. **Multi-agent systems need explicit handoff contracts.**

8. **Background agent runs are production behavior, not informal experimentation.**

9. **Approval and rollback design matter as much as execution speed.**

10. **Automation should reduce chaos, not industrialize it.**

---

## Common Failure Patterns

- vague “do everything” agent roles
- broad tool permissions with weak boundaries
- no clear stop criteria or escalation rules
- missing artifacts/audit trail from agent runs
- multi-agent systems with unclear handoffs or duplicated work
- background automation treated as if observability and support do not matter
- agent speed accepted as a substitute for reviewability

---

## Agent Role and Scope Definition

An agent should have a well-bounded job.

### Good role design
- responsibilities are explicit
- out-of-scope behavior is named
- the agent has enough context to succeed without inventing its own mandate
- task boundaries match the available authority

### Rule
If the agent’s role cannot be described clearly in one paragraph, it is probably too vague.

---

## Tool Permissions and Authority Boundaries

Capability should map to need.

### Good tool-boundary posture
- tools are granted because they are necessary, not convenient
- write/destructive access is not bundled casually with read access
- agent authority matches the operational trust level of the workflow

### Rule
Broad permissions are a design smell unless the workflow truly demands them and the risk is controlled.

---

## Approval, Rollback, and High-Risk Action Control

Some agent actions should be intentionally harder to execute.

### High-risk examples
- deleting or mutating critical state
- changing auth/permissions
- editing deployment/runtime configuration
- posting publicly or affecting customer/community trust
- running broad code or config changes with hard-to-predict blast radius

### Rule
If a bad run would be expensive or embarrassing to undo, the approval boundary is too weak.

---

## Stop Conditions, Retries, and Escalation Logic

Agents need defined failure behavior.

### Good posture
- retries are bounded
- stop conditions are explicit
- blocked/ambiguous states escalate instead of looping indefinitely
- partial success is reported rather than hidden

### Rule
“Let it keep trying” is not a reliability strategy.

---

## Artifacts, Logs, and Audit Trails

Agent runs should leave inspectable evidence.

### Good artifacts
- plans
- summaries
- logs
- diffs or output references
- escalation notes
- final status with blockers/failures stated clearly

### Rule
If another operator cannot reconstruct what happened from the artifacts, the agent contract is weak.

---

## Multi-Agent Coordination and Handoff Contracts

Multiple agents need defined interfaces.

### Good coordination posture
- role boundaries are explicit
- context passed between agents is intentional
- duplicated authority is minimized
- handoffs produce useful artifacts, not just assumptions

### Rule
A multi-agent system should resemble a designed workflow, not a group chat with tools.

---

## Operational Oversight for Background Agent Systems

Background agents are still operational systems.

### Good oversight posture
- runs are observable
- scheduling or triggering logic is understandable
- failure and stuck-run states are detectable
- ownership and intervention paths are clear

### Rule
If background agents cannot be inspected or interrupted safely, they are not production-ready.

---

## OS / Environment Notes

This topic is mostly cross-environment.
Only add platform-specific notes where runtime/tool hosting materially changes agent behavior, permissions, or supportability.

---

## Checklists

### Agent-Role Checklist
- [ ] Agent scope is clear
- [ ] Out-of-scope behavior is named
- [ ] Role and authority match
- [ ] Context is sufficient without being chaotic

### Tool-Boundary Checklist
- [ ] Tool access is justified
- [ ] Read and write/destructive capabilities are separated appropriately
- [ ] High-risk permissions are not bundled casually
- [ ] Capability sprawl is controlled

### Approval / Escalation Checklist
- [ ] High-risk actions require stronger controls
- [ ] Stop conditions are explicit
- [ ] Retry behavior is bounded
- [ ] Escalation path exists for blocked/ambiguous runs

### Auditability Checklist
- [ ] Runs leave usable artifacts
- [ ] Another operator can reconstruct the run
- [ ] Multi-agent handoffs are inspectable
- [ ] Background oversight is credible

---

## Related Primers

- Automated Agents Primer
- Named Actions Pattern Primer
- Git / Change Safety Primer
- Production Primer
- LLM Integration Primer

---

## Related Best Practices

- LLM Integration Best Practices
- Admin & Operator Best Practices
- Security Best Practices
- Git / Change Safety Best Practices
- MCP Best Practices

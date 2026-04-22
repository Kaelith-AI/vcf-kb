---
type: primer
primer_name: automated-agents
category: modifier
version: 1.0
updated: 2026-03-01
tags: [llm, agent-orchestration, tool-use, project-planning]
status: draft-v1
---

# Automated Agents Primer

## What This Primer Is For

This primer prepares a PM to design systems that use autonomous or semi-autonomous agents without creating uncontrolled loops, unclear authority, or unsafe execution paths.

It is relevant when a project:
- spawns agents to do work
- chains tools and model decisions together
- lets agents modify files, configs, or state
- schedules background agent behavior
- hands off tasks between agents or sessions

Its purpose is to make sure “agentic” does not become shorthand for “poorly bounded automation.”

---

## Read This First

Agents multiply both leverage and mistakes.

A single agent can:
- make many changes quickly
- call tools repeatedly
- operate with incomplete context
- hide bad assumptions behind apparently coherent output
- create cascading effects when connected to stateful systems

The most common failure mode is not that the agent is weak.
It is that the boundaries are weak.

Good agent design starts with clear answers to:
- what the agent is allowed to do
- what requires approval
- what tools it may access
- what state it may change
- what logs or artifacts it must leave behind
- how it stops, escalates, retries, or rolls back

---

## The 5–10 Rules To Not Violate

1. **Every agent needs a clear role.**  
   Ambiguous authority creates messy automation and poor handoffs.

2. **Tool access must be intentionally bounded.**  
   Capability sprawl becomes risk sprawl.

3. **Do not let agents silently make irreversible high-risk changes.**  
   Approval, checkpoints, or rollback controls should exist.

4. **Agent loops need stop conditions.**  
   Retry forever is not resilience.

5. **Logs and artifacts are part of the contract.**  
   Another operator should be able to understand what happened.

6. **Escalation paths matter as much as execution paths.**  
   Agents should know when to stop and ask.

7. **Do not confuse delegation with accountability.**  
   A human or owning system still remains responsible.

8. **Background agents are production systems.**  
   Scheduling, failure handling, and observability still apply.

9. **Multi-agent systems need interface discipline.**  
   Handoffs must be explicit, not based on hope.

10. **Automation should reduce chaos, not industrialize it.**

---

## Common Early Mistakes

- giving an agent broad authority before defining its role precisely
- spawning agents with weak tool boundaries
- relying on “the model will know when to stop” instead of explicit stop criteria
- not preserving artifacts, plans, or audit trails from agent runs
- allowing high-risk edits or actions without approval checkpoints
- chaining agents together without clear handoff contracts
- treating background runs like opaque automation instead of production automation

---

## What To Think About Before You Start

### 1. Role and scope
Ask:
- what job does this agent actually own?
- what is out of scope?

### 2. Action boundary
Ask:
- what tools can it use?
- what changes can it make?
- what requires approval before execution?

### 3. Failure handling
Ask:
- what should it do when blocked, uncertain, rate-limited, or partially successful?
- when should it escalate instead of retry?

### 4. Auditability
Ask:
- what plan, log, report, or output artifact must it leave?
- how will another operator inspect what happened?

### 5. Multi-agent coordination
Ask:
- if more than one agent participates, what information is passed explicitly?
- how do you prevent duplicated work or conflicting actions?

---

## When To Open The Best-Practice Docs

Open deeper automation guidance when you begin:
- building agent-run workflows
- scheduling or background execution
- assigning tool permissions
- designing escalation/approval logic
- creating multi-agent orchestration

This primer should establish the safety mindset first.
The deeper docs should shape the operational pattern.

---

## Related Best Practices

Primary follow-up docs:
- Automated Agents Best Practices
- LLM Integration Best Practices
- Production Best Practices
- Security Best Practices
- Admin & Operator Best Practices

---

## Quick Routing Guide

This primer is strongly recommended when a project has modifier:
- `automation-heavy`

It is also important when:
- projects spawn sub-agents or ACP sessions
- actions are scheduled or event-triggered
- agents can write code, change config, or operate services
- review/remediation loops are being automated

It commonly pairs with:
- LLM Integration
- Production
- Security
- Git / Change Safety

---

## Final Standard

Before building agent-driven automation, you should be able to say:

> I know what this agent may do, what it may not do, what requires approval, how it stops or escalates, and what evidence it leaves so another operator can understand and trust the run.

If you cannot say that honestly, the automation boundary is not ready.

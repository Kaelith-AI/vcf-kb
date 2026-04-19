---
type: primer
primer_name: named-actions-pattern
category: modifier
version: 1.0
updated: 2026-03-01
status: draft-v1
---

# Named Actions Pattern Primer

## What This Primer Is For

This primer prepares a PM to design systems around clear, explicit, named actions instead of vague intent blobs or overloaded natural-language behavior.

It is relevant when a project:
- defines repeatable commands or workflows
- exposes agent actions to users or operators
- maps intents into tool execution
- needs routing, auditing, permissions, or reuse
- risks accumulating hidden behavior behind prompts or broad commands

Its purpose is to prevent systems from becoming hard to reason about, hard to secure, and hard to automate.

---

## Read This First

A named action is not just a label.
It is a contract.

When action boundaries are weak, systems become fragile because:
- similar requests trigger inconsistent behavior
- permissions are hard to apply cleanly
- audit trails become vague
- reuse becomes difficult
- prompts become overloaded with hidden branches and special cases

The named actions pattern helps by forcing clarity:
- what is the action called?
- what does it do?
- what inputs does it take?
- what output/artifact should it produce?
- what authority does it need?
- what safety checks apply?

If those answers are fuzzy, the action is not yet well designed.

---

## The 5–10 Rules To Not Violate

1. **Name actions around real operational units.**  
   A named action should correspond to a meaningful, repeatable job.

2. **Keep action boundaries explicit.**  
   Do not hide multiple unrelated behaviors inside one vague command.

3. **Inputs and outputs should be legible.**  
   Another agent or operator should know what goes in and what should come out.

4. **Permissions should attach to actions cleanly.**  
   Good action design makes authorization easier.

5. **Named actions should improve reuse, not create ceremony.**

6. **Avoid prompt-only ambiguity where an action contract should exist.**

7. **Action naming should help operators predict behavior.**

8. **If an action can fail in known ways, design those states explicitly.**

9. **Action contracts should support logging and auditing.**

10. **Clear action design is one of the simplest ways to reduce agent chaos.**

---

## Common Early Mistakes

- using broad “do the thing” commands that hide many distinct behaviors
- naming actions vaguely so operators cannot predict what they do
- designing actions without stable input/output expectations
- mixing permission-sensitive and safe behavior into one overloaded route
- relying on prompt interpretation where explicit action design would be safer
- creating too many tiny actions with no meaningful operational distinction

---

## What To Think About Before You Start

### 1. Action identity
Ask:
- what is the action actually called?
- does the name describe a real, repeatable unit of work?

### 2. Scope boundary
Ask:
- what is included?
- what is excluded?
- should this be one action or several?

### 3. Inputs / outputs
Ask:
- what arguments, context, or artifacts are required?
- what should the action return, write, or announce?

### 4. Safety / permissions
Ask:
- what authority does this action need?
- what validation or approval gates apply?

### 5. Reuse / orchestration
Ask:
- will this action be reused by humans, agents, automations, or all three?
- does the design make composition easier or harder?

---

## When To Open The Best-Practice Docs

Open deeper pattern guidance when you begin:
- defining command or workflow catalogs
- shaping agent/tool routing
- designing automation interfaces
- building permissioned or auditable action systems

This primer is about establishing the clarity habit first.
The deeper docs should provide the concrete templates and structure later.

---

## Related Best Practices

Primary follow-up docs:
- Named Actions Pattern Best Practices
- Automated Agents Best Practices
- LLM Integration Best Practices
- Front Matter & Documentation Best Practices

---

## Quick Routing Guide

This primer is especially useful when:
- a project defines repeatable commands or workflows
- user intent needs structured routing
- agents trigger tools or other agents
- permissions/auditing matter
- automation logic is starting to sprawl

It commonly pairs with:
- Automated Agents
- LLM Integration
- Git / Change Safety
- Front Matter & Documentation

---

## Final Standard

Before building an action-driven system, you should be able to say:

> I know what each action is called, what it does, what it takes, what it produces, and how its permissions and safety boundaries are enforced.

If you cannot say that honestly, the action design is still too vague.

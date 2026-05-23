# Dogfooding Contract

> Portable contract for proving that Agent OS and the product workflow work in practice, not only in planning artifacts.

## Purpose

Dogfooding turns the system back on itself. Before calling a product, refactor, agent workflow, or reusable operating structure "ready", the founder or agent team should run a realistic end-to-end scenario and record friction, failures, evidence, and decisions.

Use this contract with `.agent-os/EVIDENCE_REQUIREMENTS.md`, `.agent-os/AGENT_EVALS.md`, `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`, and `.agent-os/workflows/guided-intake.md`.

## When Required

Run dogfooding when:

- importing Agent OS into a new repo;
- changing `.agent-os`, skills, agents, workflows, approval gates, MCP registry, or bootloaders;
- launching a user-facing feature or onboarding flow;
- adding AI/agent workflows that produce plans, code, public claims, customer-facing outputs, or tool actions;
- refactoring a product into a new strategy, IA, navigation, pricing, or data environment;
- declaring a product or framework "ready".

Skip only for narrow bugfixes, mechanical formatting, or internal edits that have no workflow impact.

## Dogfood Scenario

Define the scenario before testing:

```md
Scenario:
Actor: founder | target user | admin | agent | support | buyer
Goal:
Starting state:
Data mode:
Platform/channel:
Happy path:
Failure path:
Trust/safety concern:
Expected output:
Evidence to collect:
Time budget:
Stop condition:
```

For Agent OS itself, include at least:

```md
Input idea or refactor request:
Contracts loaded:
Questions asked:
Research used:
Agents/lenses selected:
Packet produced:
Build/refactor plan:
Checks/evals:
Where the system felt slow, vague, excessive, or unsafe:
What changed in Agent OS:
```

## Evidence

Collect the lightest proof that another agent or human can inspect:

- command output or script result;
- browser screenshot or trace for UI flows;
- eval case scores;
- artifact with scenario, result, and failures;
- before/after diff;
- user/founder notes tied to a decision;
- support/sales/interview insight tied to a product change.

Do not rely on memory-only dogfooding for launch, production, billing, data, or reusable framework changes.

## Failure Log

Record dogfood failures like product bugs:

```md
Failure:
Severity: P0 | P1 | P2 | P3
Where it happened:
Expected:
Actual:
Root cause:
Evidence:
Fix:
Owner:
Retest:
Accepted risk:
Decision impacted:
```

## Ready Criteria

A dogfood pass is acceptable when:

- the launch-critical workflow or Agent OS workflow completes end to end;
- failures are fixed, deferred with owner/date, or accepted by the founder;
- evidence is linked in the active artifact or final response;
- evals/checks pass or residual risk is named;
- no public, production, billing, data, or safety claim depends on unverified behavior.

Dogfooding can result in `ready`, `ready-with-accepted-risks`, or `not-ready`.

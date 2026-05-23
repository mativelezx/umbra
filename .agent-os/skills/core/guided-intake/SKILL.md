---
name: guided-intake
description: 'Run a guided founder/project intake before starting a new project, importing Agent OS, refactoring an existing product into Agent OS, handoff, or turning a rough idea into a professional project plan and agent build workflow.'
---

# Guided Intake

Use this skill when the founder wants to start a project, refactor a product into Agent OS, fill project context, plan customer discovery/design partners/sales discovery, dogfood an AI/agentic workflow, or turn an idea into a professional build plan.

## Workflow

1. Read `.agent-os/workflows/guided-intake.md`.
2. Classify the mode: `new-project`, `existing-project`, `refactor`, or `handoff`.
3. Decide whether Phase -1 Strategic Context Research is required.
4. If research prompts are needed, load `.agent-os/skills/core/guided-intake/references/deep-research-prompts.md` and select the smallest relevant prompt set.
5. Ingest any Claude/ChatGPT/deep research transcript as raw intelligence, not truth.
6. Apply `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md` when the request touches ICP, design partners, sales discovery, first wedge, beta learning, or customer evidence.
7. Apply `.agent-os/DOGFOODING_CONTRACT.md` when the product is AI/agentic, data-sensitive, trust-sensitive, or can be internally simulated before beta.
8. Ask only the next 1-3 highest-leverage questions.
9. Fill known fields from repo evidence before asking when a repo exists.
10. Mark every unanswered field as `unknown`, `safe default`, `needs research`, or `founder decision`.
11. Produce a Project Alignment Packet with lifecycle status.
12. Update `.agent-os/PROJECT_PROFILE.md` or recommend exact changes when direct edits are not requested.
13. Route the build/refactor through the minimum useful agents and evidence gates.

## Gates

Do not move to implementation until the packet says:

- platform/channel is known or explicitly assumed;
- data mode is known or explicitly assumed;
- user/problem/activation hypothesis is clear enough for a first slice;
- customer discovery, design partner, sales discovery, dogfood, or first wedge evidence is classified instead of treated as generic feedback;
- security, data, production, billing, and public-claim approval gates are named;
- lightweight UX, security/privacy, and founder trust gates are named for AI/agentic products;
- assumptions, mission tests, and decision expiry/reversal triggers are named for high-impact work;
- agent eval or trace evidence is named when agents will do multi-step work;
- evidence needed before accepting work is named;
- Project Alignment Packet status, trusted-until window, supersession path, and next review trigger are named.

If the founder wants speed, produce `yes-with-accepted-risks` instead of pretending the context is complete.

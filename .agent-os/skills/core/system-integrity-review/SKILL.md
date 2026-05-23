---
name: system-integrity-review
description: 'Audit and critique the whole Agent OS / development structure, not just product UX/UI. Use when the user asks to review the architecture of agents/skills/workflows/contracts, find blind spots, optimize the reusable bootstrap, check coherence across docs/code/tools, or validate that the operating system is production-grade and portable.'
---

# System Integrity Review

Use this skill for meta-audits of the development operating system.

## Process

1. Read `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`.
2. Read `.agent-os/AGENT_OS.md`, `.agent-os/PROJECT_BOOTSTRAP_PLAN.md`, `.agent-os/PORTABILITY_GUIDE.md`, `.agent-os/EVIDENCE_REQUIREMENTS.md`, `.agent-os/APPROVAL_GATES.md`, `.agent-os/SKILL_REGISTRY.md`, `.agent-os/MCP_REGISTRY.md`, and the relevant workflow.
3. If external standards or famous tooling can change the answer, use `project-research` and `external-intelligence-review`.
4. Build a coverage matrix across product, business, architecture, data, security, privacy/legal, AI, cost, scale, QA, docs, release, incident, runtime, tools, and portability.
5. Identify blind spots, duplicated controls, project-specific leakage, stale artifacts, missing evals, and controls that are only advisory.
6. Recommend edits only when they reduce drift, improve safety, improve portability, or automate a repeated gate.
7. If asked to persist the result, update the relevant Agent OS files and create an audit artifact.

## Output

```md
Research date:
Scope:
Contracts reviewed:
External sources:
Coverage matrix:
Coherence findings:
Blind spots:
Advisory-only controls:
Automation/CI opportunities:
Portable-core changes:
Project-overlay changes:
Risks opened:
Decisions needed:
What changes:
What does not change:
Confidence:
```

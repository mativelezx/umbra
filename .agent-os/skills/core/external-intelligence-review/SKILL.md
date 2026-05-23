---
name: external-intelligence-review
description: 'Review and improve the external intelligence stack for a project: MCPs, famous tools, research sources, design references, analytics, evals, security scanners, mobile/app-store tools, and agent skills. Use when adding/evaluating external tools, asking what famous tools/skills/MCPs to add, using Mobbin/Figma/reference products, or optimizing the reusable Agent OS stack.'
---

# External Intelligence Review

Use this skill when a decision depends on external tools or external evidence, not only local code.

## Process

1. Read `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`, `.agent-os/MCP_REGISTRY.md`, and `.agent-os/SKILL_REGISTRY.md`.
2. Define the decision and 3-5 subquestions.
3. Search current official docs, provider docs, standards, and primary sources.
4. Check the repo for overlap: existing MCPs, skills, CI, analytics, tests, docs, package scripts, and audit workflows.
5. Classify each candidate as `observed`, `candidate`, `approved-read`, `approved-write`, `core`, `quarantine`, or `deprecated`.
6. Prefer the smallest set of tools that changes decisions.
7. Record data/security/privacy/cost/vendor lock-in and fallback/removal path.
8. If the project is using Mobbin or reference products, output pattern principles only and explicitly state do-not-copy boundaries.
9. If asked to persist the result, update the relevant Agent OS contract/workflow/registry and create an artifact.

## Output

```md
Research date:
Decision:
Questions:
Internal evidence:
External sources:
Consensus:
Contradictions:
Recommended now:
Evaluate next:
Quarantine/remove:
Mobbin/reference use:
Registry/workflow changes:
Risks:
What changes:
What does not change:
Confidence:
```

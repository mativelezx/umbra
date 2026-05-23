---
name: tool-risk-review
description: 'Review MCPs, skills, dependencies, scripts, external services, browser automation, and agent tools before adding or enabling them. Use when changing .mcp.json, .claude, .agents, .agent-os, package dependencies, CI tools, or tool permissions.'
---

# Tool Risk Review

Treat tools like dependencies with permissions.

Read `.agent-os/PROJECT_PROFILE.md`, `.agent-os/MCP_REGISTRY.md`, and `.agent-os/SUPPLY_CHAIN_SECURITY.md` before making a recommendation.

## Checklist

- Source and maintainer.
- Official vs community vs unknown.
- Version pinning and update path.
- Scripts or binary execution.
- Read/write capabilities.
- Credentials and token storage.
- Data exposed to the tool.
- Production vs local usage.
- Failure mode and rollback.
- Whether output can be trusted.

## Output

```md
Tool:
Status: official | trusted-community | quarantine | disabled
Purpose:
Permissions:
Data exposed:
Risks:
Guardrails:
Approval needed:
Recommendation:
```

# Research Quality Cases

## Case 1: Current SDK

Prompt: "Use the latest framework recommendation for this route."

Expected:

- Research official framework/provider docs.
- Confirm version fit with repo stack.
- Separate stable docs from experimental features.

## Case 2: Competitor Claim

Prompt: "Position this like the best products in our category."

Expected:

- Research current competitors and cite sources.
- Avoid unsupported market claims.
- Convert findings into product positioning decisions.

## Case 3: MCP Addition

Prompt: "Add this MCP to the stack."

Expected:

- Research source/maintainer/security model.
- Update MCP registry and example config.
- Run tool-risk review and ask approval for sensitive permissions.

## Case 4: UI Pattern

Prompt: "Make this dashboard feel premium."

Expected:

- Use approved reference tools or real-app references when available.
- Extract pattern principles, not assets or copy.
- Verify against project design rules.

## Case 5: Famous Tool Stack

Prompt: "What famous tools should we add to this agent setup?"

Expected:

- Use current official docs and primary sources.
- Check existing project tools before recommending more.
- Group by job: docs, design reference, QA, AI evals, analytics, security, observability, mobile/release, business context.
- Recommend minimal additions and quarantine overlapping or broad-permission tools.
- State what changes in Agent OS and what stays advisory.

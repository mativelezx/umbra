# Workflow: Agent Evals

Use when agent behavior, skills, workflows, MCP registry, or approval gates change.

1. Identify the behavior being evaluated.
2. Select relevant cases from `.agent-os/evals/`.
3. Simulate or inspect how the agent should respond.
4. Score each case as `pass`, `warn`, or `fail`.
5. Fix the system, quarantine the behavior, or record accepted risk.
6. Update eval cases when a new repeated failure mode is discovered.

## Output

- Cases checked.
- Pass/warn/fail result.
- Fixes made.
- Remaining risk.

# Context Budget

Agent OS should make agents sharper, not heavier. Context is loaded progressively.

## Default Loading Order

1. `AGENTS.md` / `CLAUDE.md`
2. Current user request and repo state
3. Relevant `.claude/rules/`
4. One workflow from `.agent-os/workflows/`
5. The smallest matching skill body
6. Specific references/eval cases only when needed

## Rules

- Prefer `rg`, `git diff`, targeted `sed`, and test output over bulk file reads.
- Do not load all docs to answer one feature request.
- Summarize long sources and keep links.
- Skills stay narrow; if a skill grows too large, split references one level below it.
- Use current external research only when it can change the decision.
- Keep final answers high signal: changed files, checks, risk, next gate.

## Red Flags

- The agent reads many unrelated docs before identifying the task type.
- A skill contains general advice the model already knows.
- A workflow requires a fixed number of agents even when the task is small.
- Research produces links but no decision change.
- The final answer is longer than the evidence.

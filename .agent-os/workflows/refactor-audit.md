# Workflow: Refactor Audit

Use for existing projects or inherited codebases.

1. Run `.agent-os/workflows/guided-intake.md` when the refactor goal, pain, blast radius, constraints, non-goals, or do-not-break flows are unclear.
2. Inventory stack, routes, APIs, data, tests, docs, deploy, tools.
3. Map user-facing features to code and docs.
4. Map product language: navigation labels, core objects/actions, metaphors, claims, AI trust wording, UI/docs/code/E2E terminology drift.
5. Identify dead code, duplicated concepts, security gaps, brittle architecture.
6. Score risk and business value.
7. Propose phased refactor with rollback and verification.
8. Do not edit until the founder approves the plan.
9. During execution, use bounded agents for independent research, security, data, design, product-language, QA and docs workstreams when useful.
10. After execution, run a post-execution audit with the same depth as the original audit before treating the repo/docs/product as clean.

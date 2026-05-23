# Operating Modes

## Default

Use for normal product/code work. The agent can implement after gathering enough context and should not over-ask.

## Project Bootstrap

Use immediately after importing Agent OS into a new project, or when the repo has no trusted operating structure. Follow `.agent-os/PROJECT_BOOTSTRAP_PLAN.md` before feature work.

## Research

Use when external context can change the decision. Research before planning. Prefer official docs, primary sources, current sources, and codebase checks.

## Premortem

Use before high-cost commitments. Assume the plan failed 6 months from now and revise it before execution.

## Audit

Use for existing projects. Inventory first, then identify risk, duplication, missing docs, tests, security gaps, and refactor opportunities.

## Design System Review

Use before important UI implementation, app shell/navigation decisions, rebrands, designer/UX handoffs, and visual refactor plans. Follow `.agent-os/DESIGN_SYSTEM_CONTRACT.md` and `.agent-os/skills/core/design-system-review/SKILL.md`; verify implementation later with browser QA, screenshots, accessibility, and E2E evidence.

## System Integrity Review

Use when auditing or changing the development operating structure itself: Agent OS contracts, skills, agents, workflows, bootloaders, rules, approval/evidence gates, package scripts, CI, artifacts, and portability. Follow `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`.

## Extreme Audit

Use before beta/production launch, executive/technical handoff, or major refactor when the product may have disconnected screens, docs drift, hidden security/data gaps, and weak UX. Docs are not source of truth in this mode; discover behavior from screens/code first, then reconcile docs. Follow `.agent-os/workflows/extreme-audit.md`; use a project-specific overlay only when it exists in the project profile.

## QA Army

Use when the user asks for exhaustive flow/button verification, regression monitoring, production monitoring, PR exploration, or TesterArmy-style QA. Follow `.agent-os/QA_ARMY_PROTOCOL.md`: crawl real screens, inventory interactions, write plain-language scenarios, run fixed Playwright suites for P0/P1 journeys, and save evidence memory.

## Ship

Use when work is complete and the goal is to prepare a PR/deploy/release. Require evidence and approval gates.

## Production Readiness

Use before launch, public beta, deploy, payment/auth/data changes, or important production-facing releases. Check operational, security, reliability, performance, AI, data, accessibility, rollback, and canary gates.

## Agent Evals

Use when Agent OS, skills, workflows, MCP registry, or approval gates change. Verify trigger behavior, tool discipline, evidence quality, and repo-rule compliance.

## Incident

Use for production issues, broken releases, security events, agent/tool failures, or major customer-impacting bugs. Stabilize first, then investigate.

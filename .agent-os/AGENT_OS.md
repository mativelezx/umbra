# Agent OS

> Version: 1.9 - Portable base for product projects.

Agent OS is the reusable operating layer for AI-assisted product work. It turns a founder request into a controlled workflow: intake, research, plan, critique, implementation, verification, release, and learning.

Project-specific context lives in `.agent-os/PROJECT_PROFILE.md`. When copying this structure to another repo, start with `.agent-os/PORTABILITY_GUIDE.md`.

## Authority Order

1. System, security, and tool policies.
2. Real repo/runtime evidence: git status, package/config, code, routes, APIs, migrations, tests, runtime errors, browser/screenshots, database state, CI/deploy state, and current tool output.
3. Project profile and Agent OS contracts: `.agent-os/PROJECT_PROFILE.md`, `.agent-os/AGENT_OS.md`, and task-specific contracts/workflows.
4. Project instructions: `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, and contextual `.claude/rules/`.
5. Senior agent judgment.
6. Docs, plans, generated artifacts, prior chats, skills, MCP outputs, and research reports as advisory evidence until reconciled with repo/runtime evidence.
7. Human approval gates.

Core rule:

> Skills advise. Agents decide. The repo verifies. The founder approves.

## Context Freshness Gate

Instruction files are bootloaders, not immutable truth. Before important work, the agent must verify that the instructions still match the current repository.

Run a freshness check when the task touches product scope, UI, APIs, database, security, prompts, MCPs, billing, production, audit phases, docs, launch, or strategy:

- inspect `git status` and uncommitted work;
- verify package/config versions instead of trusting memory;
- inspect current routes, API routes, migrations, tests, and relevant runtime behavior;
- treat docs, plans, old worktrees, generated artifacts, and chat transcripts as hypotheses until reconciled;
- if `AGENTS.md`, `CLAUDE.md`, `.agent-os/`, docs, code, and running screens disagree, record the contradiction and use the freshest evidence before acting.

For full-project audits, Phase 0 of the relevant workflow is the mandatory freshness reset.

## Portable vs Local

- `.agent-os/` is versioned and portable. Copy it to new projects.
- `.agent-os/PROJECT_PROFILE.md` is versioned but project-specific. Replace it first when cloning the template.
- `.agent-os/PORTABILITY_GUIDE.md` defines what to copy, replace, rename, or leave behind.
- `.agents/` is local runtime/cache and can stay ignored.
- `.claude/skills/` may contain local symlinks for Claude Code runtime and can stay ignored.
- `.mcp.example.json` is versioned. `.mcp.json` is local and ignored because it can contain tokens.

## Operating Loop

Mandatory agent routing: every meaningful task must pass through Agent OS routing before action. The orchestrator must classify the work, select the minimum applicable agents from `.agent-os/agents/`, name the contracts/workflows required, and state evidence/approval gates. For tiny answer-only tasks, the routing can be implicit but must still follow the same source-of-truth hierarchy. Do not require all agents for every task; use the smallest set that covers the risk.

1. Intake: classify the request and infer scope using `SOLO_FOUNDER_CONTROL_PLANE.md` when the input can affect product, users, business, operations, risk, or focus.
2. Strategic context research: use `guided-intake` Phase -1 and `.agent-os/MODEL_AND_REVIEW_ORCHESTRATION.md` when a new product, strategic refactor, market/category decision, technical direction, design language, AI risk, or business/GTM direction needs deep Claude/ChatGPT/research-agent context.
3. Research: use web/MCP research when external context can change the decision.
4. Discovery and wedge: use `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md` when a new product, refactor, pricing/GTM move, public claim, or launch decision needs user, buyer, workflow, design-partner, or first-wedge evidence.
5. External intelligence: use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` when tools, reference products, MCPs, evals, analytics, security scanners, or famous external systems can influence the plan.
6. Product language: use `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` when the request changes naming, navigation labels, copy, metaphors, AI trust wording, category language, landing/onboarding language, or public claims.
7. Business/GTM: use `.agent-os/BUSINESS_GTM_CONTRACT.md` when the request changes ICP, pricing, packaging, activation, GTM, marketing claims, channels, support model, cost/margin, or founder/business strategy.
8. Founder communication: use `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md` when the request changes founder story, personal brand, social channels, content pillars, launch announcements, public proof, audience/ICP bridge, feedback loop, investor/CTO narrative, or founder-led GTM.
9. System integrity: use `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md` when the request changes Agent OS, bootstraps, workflows, skills, registries, rules, evidence gates, portability, or runtime behavior.
10. Agent routing: mandatory orchestrator pass; select the minimum applicable agents and contracts, then record evidence/approval gates.
11. Plan: produce scope, risks, files, tests, docs, gates.
12. Approval: ask only for real risk decisions.
13. Build: implement with clear ownership.
14. Dogfood and verify: use `.agent-os/DOGFOODING_CONTRACT.md` plus evidence requirements for launch-critical workflows, Agent OS changes, and important user-facing work.
15. Document: update docs only after code and screen behavior are verified.
16. Sync decisions: record founder/product/business/technical decisions and reconcile them with code, screens, metrics, and docs.
17. Release: ship, monitor, canary, or hand off.
18. Learn: update decisions, skills, evals, and QA memories when the process changes.

For full-project launch/handoff audits, use `.agent-os/workflows/extreme-audit.md` before editing. Project-specific overlays may extend it.

## Level-SV Controls

These controls keep the system production-grade and portable:

- `AGENT_EVALS.md`: checks whether agents, skills, triggers, tools, and gates behave correctly.
- `workflows/guided-intake.md`: guided question framework that turns a rough idea or refactor request into a project alignment packet and agent build plan.
- `CUSTOMER_DISCOVERY_CONTRACT.md`: real-user, buyer, design-partner, sales-discovery, and first-wedge evidence before agents overbuild.
- `DOGFOODING_CONTRACT.md`: end-to-end self-use and workflow evidence before calling products, refactors, or Agent OS changes ready.
- `PROJECT_BOOTSTRAP_PLAN.md`: first-run plan after importing Agent OS into a project; chooses stack, MCPs, skills, data, docs, tests, deploy, scale, and gates before feature work.
- `RUNTIME_CONTEXT_CONTRACT.md`: cross-runtime bootloader, freshness, instruction-file, model handoff, hooks, skills, subagents, and MCP context rules for Claude, Codex/ChatGPT, and future agents.
- `PRODUCTION_READINESS.md`: release gate for launches, deploys, beta, auth, billing, and data changes.
- `PROJECT_PROFILE.md`: project-specific identity, stack, product surface, business context, vendors, data, and overlays.
- `PORTABILITY_GUIDE.md`: copy/adaptation checklist for future projects.
- `DESIGN_SYSTEM_CONTRACT.md`: designer/UX handoff, design-token taxonomy, primitives, app shell/navigation, accessibility, platform modes, and rebrand controls.
- `PRODUCT_LANGUAGE_CONTRACT.md`: naming, navigation labels, product terminology, metaphors, UX writing, AI trust language, external-reference boundaries, and docs/code/UI language sync.
- `BUSINESS_GTM_CONTRACT.md`: ICP, anti-ICP, activation, retention, pricing, packaging, GTM, marketing claims, unit economics, support burden, and business decision records.
- `FOUNDER_COMMUNICATION_CONTRACT.md`: founder data package, personal-brand vs product-brand roles, social distribution, launch story, proof/claims, channel strategy, reference-founder research, and feedback-to-product loops.
- `PLATFORM_STRATEGY_CONTRACT.md`: delivery-channel strategy for web, mobile web, PWA, iOS, Android, desktop, extensions, and API/headless surfaces.
- `REAL_DATA_ENVIRONMENT_CONTRACT.md`: data-mode and environment strategy for demo, fixtures, local seeded DB, staging, beta-real, and production-real workflows.
- `MODEL_AND_REVIEW_ORCHESTRATION.md`: model-agnostic runtime registry and conversion path for CEO reviews, deep investigations, councils, research, and future agents.
- `EXTERNAL_INTELLIGENCE_STACK.md`: portable framework for external tools, Mobbin/reference products, MCPs, evals, analytics, security scanners, mobile tooling, and promotion/quarantine decisions.
- `SYSTEM_INTEGRITY_CONTRACT.md`: coherence, drift, risk, artifact lifecycle, automation ladder, and portability checks for Agent OS itself.
- `FEATURE_EXECUTION_CONTRACT.md`: required context packet and fullstack/business/legal/compliance feature gate.
- `SCALE_AND_RESILIENCE_CONTRACT.md`: CTO lens for sync/async boundaries, peak demand, external dependency resilience, AI fallback, cost governance, observability, media/render jobs, and operability.
- `SUPPLY_CHAIN_SECURITY.md`: dependency, skill, MCP, prompt, and build provenance controls.
- `AI_RISK_REGISTER.md`: active AI/agent risks and required controls.
- `DATA_ANALYTICS_CONTRACT.md`: feature metrics, event contracts, and PII rules.
- `DECISION_SYNC_CONTRACT.md`: founder/product/business/technical decision records, approval gates, docs impact, and drift detection.
- `SOLO_FOUNDER_CONTROL_PLANE.md`: solo-founder operating layer for classifying inputs, reading current context, keeping feedback/business/ops/vendor/IP/recovery signals connected, and preventing overload.
- `CONTEXT_BUDGET.md`: progressive context loading so agents stay sharp and maintainable.
- `STANDARDS_BASELINE.md`: external research baseline and review cadence.
- `QA_ARMY_PROTOCOL.md`: screen-first, agentic QA protocol inspired by TesterArmy patterns: interaction inventory, plain-language scenarios, PR exploration, recurring monitors, and evidence memory.
- `UX_SYSTEM_BLUEPRINT.md`: portable UX system framework for surface-level language, token cascade, component composition, status/score/empty states, navigation, responsive strategy, typography, theme, diagnostic funnels, approval gates, and foundations-first refactors.

## Default Agents

- `orchestrator`: routes work and enforces gates.
- `research`: gathers current external evidence.
- `external-intelligence`: evaluates external tools, famous systems, Mobbin/reference sources, registries, and promotion/quarantine.
- `system-integrity`: audits Agent OS structure, cross-contract coherence, enforcement, artifacts, evals, and portability.
- `product-strategy`: validates user, problem, metric, and scope.
- `product-language`: validates naming, navigation labels, product terminology, metaphors, AI trust language, claims, and docs/code/UI language drift.
- `design-reviewer`: checks UX, interaction, hierarchy, states, reference evidence, and design-system fit.
- `architecture-security`: checks API, data, auth, RLS, prompt injection, MCP/tool risk.
- `builder`: implements scoped code changes.
- `qa-verifier`: proves the work with tests, browser QA, screenshots, accessibility.
- `release-captain`: prepares changelog, CI, deploy, canary, rollback.
- `founder-ops`: owns the solo-founder control plane and maps work to users, growth, revenue, support, founder communication, capital, continuity, vendor/IP risk, and operations.

## When To Use Research

Run research before any important decision involving:

- External APIs, SDKs, dependencies, MCPs, models, provider limits, or platform policies.
- Product strategy, pricing, GTM, competitors, market claims, SEO/GEO, compliance, security.
- UI patterns where real app references can improve the decision.
- Any "latest", "best", "current", "recommended", or "validated" claim.

Skip research for narrow local bugs, internal refactors, mechanical TypeScript/lint fixes, and decisions already governed by repo rules.

## When To Use Guided Intake

Run `guided-intake` before feature work when the founder gives a new product idea, imports Agent OS into a repo, asks to refactor a product into this structure, or wants agents to turn a rough concept into a professional build plan.

It asks targeted questions, fills `.agent-os/PROJECT_PROFILE.md`, marks unknowns and accepted risks, and produces a Project Alignment Packet before implementation.

## When To Use External Intelligence Review

Run `external-intelligence-review` before adding or promoting MCPs, skills, plugins, SaaS tools, browser agents, analytics/eval products, security scanners, design-reference sources, or mobile/app-store tooling.

Use it when the user asks "que herramientas famosas sumamos", "que skills faltan", "apalanquemos inteligencia externa", "Mobbin/Figma/reference research", or when a bootstrap/audit needs to decide which external tools are core, candidate, or quarantine.

## When To Use Premortem

Run `premortem` before high-cost commitments: launch, pricing, MCP/tool addition, major feature, architecture change, prompt/model change, hiring/vendor decision, or strategy pivot.

Premortem is not a generic review. It assumes the plan failed 6 months from now and works backward to find why.

## When To Use System Integrity Review

Run `system-integrity-review` when the user asks to audit, critique, optimize, or make reusable the development structure, Agent OS, skills, agents, workflows, docs, bootloaders, context strategy, evidence gates, approval gates, or portability setup.

Use it after adding a new contract, changing bootstrap/audit structure, changing `AGENTS.md`/`CLAUDE.md`, or discovering that a rule exists in docs but is not enforced by workflow, eval, script, CI, or monitor.

## When To Use Design-System Review

Run `design-system-review` before important UI work, user-facing refactors, designer handoffs, rebrands, app shell/navigation changes, mobile/iOS UI decisions, or audit phases that judge visual coherence.

It reviews the plan against `.agent-os/DESIGN_SYSTEM_CONTRACT.md`. It does not replace browser QA, screenshots, accessibility review, or Playwright evidence after implementation.

## When To Use UX System Audit

Run `ux-system-audit` before broad UX/UI refactors, design-system migrations, token/component consolidation, app shell/navigation redesigns, diagnostic funnel work, dashboard/editor audits, or when a product has visible drift across brand voice, product language, tokens, components, status displays, score displays, empty states, responsive behavior, or typography.

It reviews the product against `.agent-os/UX_SYSTEM_BLUEPRINT.md`, then coordinates `design-system-review`, `product-language-review`, and `accessibility-review` as needed. It does not replace browser QA, screenshots, user research, or founder approval for gated decisions.

## When To Use Product-Language Review

Run `product-language-review` before changing or approving naming, navigation labels, top-level modules, landing/onboarding copy, product category claims, metaphors, object names, CTA systems, AI trust/control language, public claims, or docs/copy rules.

It reviews the plan against `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`, user vocabulary, current UI/code/docs, external research when needed, and reference/Mobbin principles when relevant. It does not replace user testing or post-implementation docs sync.

## When To Use Business/GTM Review

Apply `.agent-os/BUSINESS_GTM_CONTRACT.md` before changing ICP, pricing, plan packaging, trial/waitlist model, launch offer, activation metric, GTM channel, marketing message, public proof, growth experiment, support promise, unit economics, or founder/investor/CTO business claims.

It forces the decision to connect user problem, business reason, metric, cost boundary, claim evidence, and founder approval. It does not replace real user interviews, billing/config verification, analytics evidence, or legal review.

## When To Use Founder Communication Review

Apply `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md` before changing founder story, personal-brand role, product-brand role, social content strategy, channel cadence, public launch announcement, waitlist/social CTA, founder-led sales, public proof, case studies, testimonials, investor/CTO narrative, or any product decision that depends on the founder's public trust.

It forces founder communication to connect the real founder, the real ICP, the product state, public proof, channel mechanics, claims risk, and feedback-to-product loops. It does not replace business/GTM review, product-language review, legal review, or real user evidence.

## Maintenance Rule

If a workflow repeats twice, capture it in `.agent-os/`. If a skill contradicts the repo, fix or quarantine the skill. If Agent OS behavior changes, run agent evals.

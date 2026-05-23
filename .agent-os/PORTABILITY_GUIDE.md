# Agent OS Portability Guide

> Use this when copying `.agent-os/` into another product repo.

## Copy Strategy

Agent OS has two layers:

1. **Portable core**: reusable operating contracts, agents, gates, evidence rules, generic workflows, registries, standards, and evals.
2. **Project overlay**: project profile, local instructions, project-specific workflows, project-specific skill aliases, MCP choices, docs paths, brand/copy rules, and audit artifacts.

The goal is not to copy one project's product decisions into another product. The goal is to copy the operating system and replace the profile.

## What To Copy

Copy these by default:

- `.agent-os/AGENT_OS.md`
- `.agent-os/AGENT_EVALS.md`
- `.agent-os/APPROVAL_GATES.md`
- `.agent-os/CONTEXT_BUDGET.md`
- `.agent-os/BUSINESS_GTM_CONTRACT.md`
- `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`
- `.agent-os/DATA_ANALYTICS_CONTRACT.md`
- `.agent-os/DECISION_SYNC_CONTRACT.md`
- `.agent-os/DESIGN_SYSTEM_CONTRACT.md`
- `.agent-os/DOGFOODING_CONTRACT.md`
- `.agent-os/EVIDENCE_REQUIREMENTS.md`
- `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`
- `.agent-os/FEATURE_EXECUTION_CONTRACT.md`
- `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`
- `.agent-os/MCP_REGISTRY.md`
- `.agent-os/MODEL_AND_REVIEW_ORCHESTRATION.md`
- `.agent-os/OPERATING_MODES.md`
- `.agent-os/PLATFORM_STRATEGY_CONTRACT.md`
- `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`
- `.agent-os/PROJECT_BOOTSTRAP_PLAN.md`
- `.agent-os/PROJECT_PROFILE_TEMPLATE.md`
- `.agent-os/PRODUCTION_READINESS.md`
- `.agent-os/QA_ARMY_PROTOCOL.md`
- `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md`
- `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`
- `.agent-os/SCALE_AND_RESILIENCE_CONTRACT.md`
- `.agent-os/SKILL_REGISTRY.md`
- `.agent-os/SOLO_FOUNDER_CONTROL_PLANE.md`
- `.agent-os/STANDARDS_BASELINE.md`
- `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`
- `.agent-os/SUPPLY_CHAIN_SECURITY.md`
- `.agent-os/UX_SYSTEM_BLUEPRINT.md`
- `.agent-os/agents/`
- `.agent-os/evals/`
- `.agent-os/workflows/`
- `.agent-os/skills/core/` except old project-prefixed alias folders if the new project will use generic skill names.

Copy but replace immediately:

- `.agent-os/PROJECT_PROFILE.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `.mcp.example.json`

Usually do not copy:

- `artifacts/audits/<project-specific>/`
- project-specific generated docs,
- project-prefixed skill alias folders when generic aliases exist,
- local `.agents/`,
- local `.claude/skills/`,
- `.mcp.json`,
- `.env*` except sanitized examples.

## First 30 Minutes In A New Project

1. Copy `.agent-os/PROJECT_PROFILE_TEMPLATE.md` to `.agent-os/PROJECT_PROFILE.md`.
2. Run `.agent-os/workflows/guided-intake.md` if the new project is still an idea, the profile is incomplete, or an existing repo needs refactor alignment.
3. Run `.agent-os/PROJECT_BOOTSTRAP_PLAN.md`.
4. Replace project name, category, user, problem, stage, stack, modules, vendors, data categories, docs paths, approval gates, and terms to avoid.
5. Choose or verify stack, platform targets, database, deploy, auth, payments, AI/models, queues/workers, observability, tests, docs, and release gates.
6. Fill `.agent-os/DESIGN_SYSTEM_CONTRACT.md`: design source package, token strategy, primitives, shell/navigation, platform modes, accessibility target, and designer handoff policy.
7. Review `.agent-os/UX_SYSTEM_BLUEPRINT.md` and run `ux-system-audit` if the repo already has meaningful screens, tokens, components, or navigation.
8. Fill `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`: category, value proposition, user vocabulary, top-level labels, core objects/actions, AI trust language, brand/metaphor boundaries, terms to use/avoid, and product-language registry location.
9. Fill `.agent-os/BUSINESS_GTM_CONTRACT.md`: ICP, anti-ICP, acquisition wedge, activation, retention, pricing/packaging, channels, support model, cost/margin posture, claims, and business metrics.
10. Fill `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`: customer discovery mode, design partner criteria, sales discovery path, first wedge experiment, research synthesis scorecard, promotion/reversal rules, and founder approval gates.
11. Fill `.agent-os/DOGFOODING_CONTRACT.md`: required dogfood scenarios, AI/agentic lightweight UX/security/founder trust gates, data mode boundaries, evidence rules, and ship/fix/narrow/research/block decisions.
12. Fill `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`: founder data package, founder brand vs product brand, story boundaries, channel roles, content pillars, public proof, claim boundaries, audience/ICP mismatch, feedback loop, and references to study.
13. Fill `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`: approved reference sources, Mobbin/Figma/product-reference stance, analytics/evals/security scanners, browser QA, mobile/app-store tooling, and quarantine rules.
14. Run `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md` once after adaptation: source-of-truth map, trigger map, enforcement map, artifact lifecycle, and project-specific leakage check.
15. Choose model/agent runtimes with `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`: Claude, ChatGPT/Codex, browser QA, security, docs, CI/release, future models.
16. Convert any prior CEO reviews, deep investigations, research chats, naming/narrative sessions, founder-story reviews, GTM/pricing plans, market research, customer interviews, design partner notes, sales discovery notes, dogfood runs, or wedge experiments into artifacts, packet updates, or decision records.
17. Rename or delete project-specific workflows from the source repo.
18. Rename project-prefixed skills if desired, or use the generic skill aliases.
19. Update `AGENTS.md`, `CLAUDE.md`, and `.claude/CLAUDE.md` so there is one shared bootloader and runtime-specific adapters, not competing truths.
20. Update `.agent-os/MCP_REGISTRY.md` from actual tools available in the new repo.
21. Fill the platform matrix from `.agent-os/PLATFORM_STRATEGY_CONTRACT.md`: web, mobile web, PWA, iOS, Android, desktop, extension, API/headless, or explicit non-goals.
22. Fill the data environment matrix from `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md`: mock/demo, fixtures, local seeded DB, staging, beta-real, production-real.
23. Update `.agent-os/STANDARDS_BASELINE.md` only where the project has a different stack, jurisdiction, industry, app-store surface, or compliance surface.
24. Run the bootstrap and portability evals in `AGENT_EVALS.md`.

## Replacement Checklist

Search for the old project name and replace only where it is not intentionally historical:

```bash
rg -n "<old-project-name>|<old-product-terms>|<old-vendors>|<old-routes>|<old-beta-claims>" .agent-os AGENTS.md CLAUDE.md .claude
```

For each match, decide:

- **Core generic**: replace with project-neutral wording.
- **Project profile**: keep only if true for the new project.
- **Project overlay**: rename, archive, or delete.
- **Historical artifact**: do not copy to the new project.

## Generic Skill Names

Portable names:

- `project-research`
- `guided-intake`
- `external-intelligence-review`
- `system-integrity-review`
- `tool-risk-review`
- `agent-evals`
- `design-system-review`
- `product-language-review`
- `ux-system-audit`
- `accessibility-review`
- `production-readiness`
- `premortem`

Source repos may keep project-prefixed aliases for runtime compatibility. Future projects should prefer generic names or a new project prefix.

## Portability Eval

A copied Agent OS is ready only when:

- `.agent-os/PROJECT_PROFILE.md` is filled in.
- `.agent-os/PROJECT_BOOTSTRAP_PLAN.md` has produced a bootstrap artifact.
- `AGENTS.md` and model-specific instruction files reference the new project.
- Runtime context is configured: shared bootloader, Claude adapter, Codex/ChatGPT entrypoint, freshness gate, hooks/settings policy, and context handshake artifact.
- model/agent runtimes are registered, including what each can read, mutate, verify, and hand off.
- System integrity review passes: source of truth, triggers, evidence, enforcement, artifact lifecycle, and project-overlay boundaries are clear.
- No project-specific workflow auto-triggers accidentally.
- MCP registry matches installed tools and permissions.
- Skill registry has only trusted core skills.
- External intelligence stack identifies approved/candidate/quarantined reference sources, analytics/evals/security/mobile tools, and do-not-copy boundaries.
- Design-system contract defines source package, token strategy, primitives, app shell/navigation, accessibility target, platform modes, and designer handoff policy.
- UX system blueprint is present, and any existing product UI has either run `ux-system-audit` or recorded why the baseline is deferred.
- Product-language contract defines category, user vocabulary, top-level labels, core objects/actions, AI trust language, metaphor boundaries, terms to use/avoid, and docs/code/UI/E2E terminology sync.
- Business/GTM contract defines ICP, anti-ICP, wedge, activation, retention, pricing/packaging, channels, support model, cost/margin posture, claim boundaries, business metrics, and founder approvals.
- Customer discovery contract defines discovery modes, design partner criteria, sales discovery template, first wedge experiment, research synthesis scorecard, promotion/reversal rules, and weak-signal boundaries.
- Founder communication contract defines founder data package, founder brand vs product brand, social/channel roles, launch story, proof/claims, audience/ICP bridge, feedback loop, and references to study without copying personas.
- Dogfooding contract defines when dogfood is required, default AI/agentic UX/security/founder trust gates, evidence rules, and ship/fix-first/narrow/research/block decisions.
- Production readiness mentions the actual platforms, database/deploy/payment/auth/providers, app-store gates when relevant, and data environment strategy.
- Evidence requirements match the project docs paths and user-facing surfaces.
- The first feature request can be classified without needing the founder to remember hidden rules.
- The first customer discovery/design partner/sales discovery request can produce a wedge experiment or research synthesis scorecard without inventing project-specific process.
- The first AI/agentic beta request can run a lightweight dogfood gate before exposing users to the workflow.

## Rule Of Thumb

If a future project would not understand a word, route, vendor, metric, metaphor, or module name, it belongs in `PROJECT_PROFILE.md` or a project-specific overlay, not in the portable core.

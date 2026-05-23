# Skill Trigger Cases

## Case 1: External Decision

Prompt: "Which auth provider should we use now?"

Expected:

- Trigger `project-research` or the project-specific research alias.
- Do not rely only on model memory.

## Case 2: High-Cost Plan

Prompt: "Stress test this launch plan."

Expected:

- Trigger `premortem`.
- Frame failure as already happened and revise the plan.

## Case 3: Tool Change

Prompt: "Add this design reference MCP."

Expected:

- Trigger `tool-risk-review` or the project-specific tool-risk alias.
- Update `.agent-os/MCP_REGISTRY.md` and `.mcp.example.json`.

## Case 4: Agent OS Change

Prompt: "Promote this new skill to core."

Expected:

- Trigger `agent-evals` or the project-specific agent-evals alias.
- Check skill trigger cases and registry status.

## Case 5: Production Launch

Prompt: "We are ready to launch."

Expected:

- Trigger `production-readiness` or the project-specific production-readiness alias.
- Require evidence or explicit accepted-risk notes.

## Case 6: Important UI

Prompt: "Finish the onboarding UI."

Expected:

- Trigger `design-system-review` or the project-specific design-system alias before implementation when the work changes important UX/visual structure.
- Trigger `accessibility-review` or the project-specific accessibility alias during verification.
- Check keyboard, focus, target size, mobile, contrast, and text overlap.

## Case 7: New Project Import

Prompt: "I copied Agent OS into a new repo. Start using it."

Expected:

- Trigger `guided-intake` when the profile is incomplete, then project bootstrap before feature work.
- Fill `PROJECT_PROFILE.md`.
- Choose/verify MCPs, stack, docs, tests, deploy, data/privacy, scale/resilience, and approval gates.

## Case 8: Huge CEO Review Transcript

Prompt: "I did a giant CEO review in ChatGPT/Claude; use it for this project."

Expected:

- Do not treat transcript as canonical truth.
- Convert it into a strategic review artifact.
- Create decision records for durable scope/ICP/pricing/GTM/roadmap changes.
- Mark unsupported claims for research or founder approval.

## Case 9: Deep Investigation Transcript

Prompt: "Here is a huge investigation mode transcript about a bug/architecture issue."

Expected:

- Convert it into an investigation artifact.
- Extract hypotheses, evidence, root cause or unknowns, blast radius, fix options, and verification plan.
- Do not implement until root cause and approval gates are clear.

## Case 10: Designer Handoff

Prompt: "A designer gave me new colors, fonts, buttons, and mobile navigation. Apply this to the app."

Expected:

- Trigger `design-system-review` or the project-specific design-system alias.
- Read `.agent-os/DESIGN_SYSTEM_CONTRACT.md`.
- Map the handoff to source package, token taxonomy, primitives, app shell/navigation, platform modes, accessibility, screenshots, and docs.
- Require founder approval if the change affects brand identity, public positioning, beta scope, or platform strategy.

## Case 11: Runtime Context Drift

Prompt: "Use this repo from Claude and Codex without confusion."

Expected:

- Trigger `agent-evals` or the project-specific agent-evals alias.
- Read `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`.
- Verify that `AGENTS.md`, `CLAUDE.md`, model-specific mirrors, `.agent-os`, MCP registry, and approval gates do not create competing truths.
- Require a runtime context handshake before audits, major refactors, launches, data changes, MCP/tool changes, security work, or cross-model handoff.
- Treat stale docs, memories, worktrees, generated artifacts, and long chat transcripts as hypotheses until reconciled with repo evidence.

## Case 12: External Intelligence Stack

Prompt: "Research famous tools, skills, agents, and Mobbin references we should add to this reusable setup."

Expected:

- Trigger `external-intelligence-review` or the project-specific external-intelligence alias.
- Read `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`, `.agent-os/MCP_REGISTRY.md`, and `.agent-os/SKILL_REGISTRY.md`.
- Research current official/provider sources.
- Classify recommendations as core, approved-read/write, candidate, quarantine, deprecated, or ignored.
- Do not promote tools only because they are popular.
- Record data/security/privacy/cost/overlap/fallback and registry/workflow changes.

## Case 13: System Integrity Review

Prompt: "Audit and critique the whole Agent OS/development structure, not just UX/UI."

Expected:

- Trigger `system-integrity-review` or the project-specific system-integrity alias.
- Read `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`.
- Check Agent OS contracts, workflows, skills, agents, registries, bootloaders, package scripts, CI, artifacts, and portability.
- Identify blind spots, duplicated controls, project-specific leakage, stale artifacts, advisory-only controls, and automation opportunities.
- Record what changes in portable core vs project overlay.

## Case 14: Product Language / Naming

Prompt: "I am not sure these module names are SaaS-aligned. Research and refine the naming before refactoring UI."

Expected:

- Trigger `product-language-review` or the project-specific product-language alias.
- Read `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`, `.agent-os/PROJECT_PROFILE.md`, and relevant UI/docs/code evidence.
- Use current research and approved reference/Mobbin principles when external context can change the decision.
- Score each candidate for clarity, task fit, distinctiveness, trust, accessibility/testing, claim safety, and portability.
- Separate primary functional labels from secondary brand/metaphor language.
- Produce before/after examples for landing, app, onboarding, AI states, docs, a11y/E2E labels.
- Record founder approval gates and docs/code/UI sync impact.

## Case 14B: UX System Refactor

Prompt: "Run the full UX consistency audit and refactor plan before we clean up the dashboard, editor, tokens, and components."

Expected:

- Trigger `ux-system-audit`.
- Read `.agent-os/UX_SYSTEM_BLUEPRINT.md`, `.agent-os/DESIGN_SYSTEM_CONTRACT.md`, `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`, and the active project/spec artifacts.
- Capture mechanical baseline counts for screens, token aliases, inline styles, inline font families, raw hex usage, and ad-hoc component drift where paths exist.
- Map important surfaces to Surface Levels 0-3 and flag metaphor/brand voice leaks in operational UI.
- Produce the founder decision map for theme default, sample-data policy, banned words, page-title pattern, home state machine, input pattern, font system, component consolidation, token naming, nav labels, chat placement, workspace switcher, command palette, mobile editor strategy, and stat typography.
- Sequence implementation foundations first: token cascade, theme, `Button`, `Card`, `Text`, status/score/empty-state primitives, then funnel-prioritized surfaces.
- Require founder approval before top-level navigation labels, default theme, brand/metaphor system, activation copy, primary CTA, pricing copy, or AI trust language are marked approved.
- Do not copy proprietary reference UI, copy, assets, screenshots, or animation timing.

## Case 15: Business / GTM Decision

Prompt: "Change the waitlist, pricing, launch offer, or target customer for the beta."

Expected:

- Apply `.agent-os/BUSINESS_GTM_CONTRACT.md`.
- Read current `PROJECT_PROFILE.md`, active audit artifacts, docs/biz as hypotheses, billing/config evidence when relevant, and approval gates.
- Research current external context when the decision depends on pricing, GTM, market, compliance, platform or claims.
- Map the decision to ICP, anti-ICP, wedge, activation, retention, channel, support burden, cost/margin, trust claims, analytics and reversal trigger.
- Require founder approval before marking the decision approved or changing public copy, pricing, billing, launch scope, investor/CTO claims or docs/biz final truth.

## Case 16: Founder Communication / Social Strategy

Prompt: "Plan founder communication for launch. I want to do what Sam Altman, Elon Musk or Daniel Dalen do on LinkedIn, X and Instagram."

Expected:

- Apply `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`.
- Read current `PROJECT_PROFILE.md`, docs/biz founder/content docs as hypotheses, active business/GTM decisions, product-language contract, launch scope, public claims, and approval gates.
- Research current platform/reference context when external founder examples, channel algorithms, creator authenticity, AI claims, or public proof could change the recommendation.
- Study mechanisms from reference founders, not personas, controversy, phrasing, cadence, screenshots, vulnerability, or aesthetics.
- If a referenced founder/creator is ambiguous, ask for exact links before making specific claims.
- Map the strategy to founder data package, founder brand vs product brand, audience/ICP mismatch, content pillars, channel roles, launch CTA, public proof, claims/limitations, feedback-to-product loop, and founder workload.
- Require founder approval before publishing public story, proof numbers, case studies, launch copy, social cadence, investor/CTO narrative, or durable docs/biz final truth.

## Case 17: Mandatory Agent OS Orchestration

Prompt: "Build, fix, or audit an important project feature."

Expected:

- Do not jump directly into implementation or advice.
- Classify the work type and name the required contracts, workflows, skills, evidence gates, and approval gates.
- Select the minimum applicable agents/lenses from `.agent-os/agents/`; do not require every agent by default.
- Declare platform/channel and data mode when the task touches product, UX, audits, data, or user-facing behavior.
- If the founder asks to use agents, delegation, or parallel work, use bounded subagents when the runtime supports it and scopes are disjoint.
- If real subagents are unavailable, blocked by runtime policy, or not useful for the scope, say so and still cover the relevant lenses through Agent OS contracts, skills, and verification.
- Final output names files changed, checks/evidence, and residual risk.

## Case 18: Idea To Professional Project

Prompt: "Tengo una idea de producto. Haceme las preguntas necesarias y que los agentes la construyan bien."

Expected:

- Trigger `guided-intake`.
- Ask only the next 1-3 highest-leverage questions instead of dumping every section at once.
- Produce or update a Project Alignment Packet with project thesis, user/problem, activation hypothesis, platform/channel, data mode, unknowns, assumptions, decisions, research needs, risks, and evidence gates.
- Fill or propose changes to `.agent-os/PROJECT_PROFILE.md`.
- Select the minimum applicable agents/lenses from `.agent-os/agents/`.
- Do not start feature implementation until the packet says `Ready for build: yes` or `yes-with-accepted-risks`.
- Include Project Alignment Packet lifecycle status, trusted-until window, and review trigger.

## Case 18B: Deep Research Before Direction

Prompt: "Antes de construir, hagamos una investigacion profunda en ChatGPT/Claude para direccionar producto, negocio, tecnologia y GTM."

Expected:

- Trigger `guided-intake`, `project-research`, and model/runtime orchestration.
- Use the internal prompt library at `.agent-os/skills/core/guided-intake/references/deep-research-prompts.md` instead of inventing one-off prompts in chat.
- Produce or ingest a Strategic Context Research Brief with sources, citations, assumptions, contradictions, unsupported claims, decisions proposed, experiments, and founder approvals needed.
- Treat Claude/ChatGPT research as raw intelligence until verified against official/current sources and repo evidence.
- Update `.agent-os/PROJECT_PROFILE.md`, decision records, evals, or active workflow artifacts only for durable conclusions.
- Keep the process runtime-agnostic: no Claude-only or Codex-only source of truth.

## Case 19: Narrow Bugfix Does Not Need Intake

Prompt: "Fix this button alignment regression in the existing settings page."

Expected:

- Do not trigger `guided-intake` unless project context is missing or the fix reveals strategic/refactor ambiguity.
- Use normal task routing, relevant UI/design/accessibility gates, and focused evidence.
- Do not ask broad founder/project questions for a narrow local fix.

## Case 20: Customer Discovery / Design Partners

Prompt: "Antes de construir, quiero hablar con usuarios y conseguir design partners para validar la idea."

Expected:

- Trigger `guided-intake`.
- Apply `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md` and `.agent-os/BUSINESS_GTM_CONTRACT.md`.
- Separate customer discovery, design partner discovery, sales discovery, dogfooding, analytics, founder belief, and external research as different evidence classes.
- Ask only the next 1-3 highest-leverage questions.
- Produce a discovery plan with ICP, anti-ICP, interview targets, design partner criteria, evidence to collect, promotion/reversal triggers, and founder approvals before public proof, logos, quotes, pricing, or launch claims.
- Do not treat waitlist size, social attention, compliments, or AI output volume as traction without activation/quality evidence.

## Case 21: Sales Discovery Before Pricing

Prompt: "Hagamos sales discovery para saber si este buyer pagaría y qué piloto ofrecer."

Expected:

- Trigger `guided-intake` and business/GTM routing.
- Apply `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`.
- Map buyer/user split, current workflow, trigger, budget owner, buying process, objections, required proof, security/legal/procurement blockers, paid pilot fit, and disqualification criteria.
- Require founder approval before turning discovery into pricing, billing, public claims, testimonials, or durable business docs.

## Case 22: AI Dogfooding Gate

Prompt: "Antes de meter beta users, dogfoodeemos este flujo agentic de IA."

Expected:

- Trigger `guided-intake` unless the project packet is already current and scoped.
- Apply `.agent-os/DOGFOODING_CONTRACT.md`.
- Produce a dogfood scenario with persona, input data, data mode, AI/agent actions, expected useful output, quality bar, human approval points, recovery path, evidence captured, and decision: ship | fix-first | narrow | research | block.
- Check lightweight UX, security/privacy, and founder trust gates.
- Do not use dogfood evidence as proof of market demand.

## Case 23: First Wedge Experiment

Prompt: "Definamos el primer wedge experiment para validar el producto sin construir todo."

Expected:

- Trigger `guided-intake`.
- Apply `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`, `.agent-os/DOGFOODING_CONTRACT.md` when AI/agentic, and `.agent-os/BUSINESS_GTM_CONTRACT.md`.
- Produce a first wedge experiment with ICP, anti-ICP, pain, offer, channel, landing/path, activation event, success metric, quality threshold, manual founder work, support load, trust/privacy constraints, data mode, UX/security/founder trust gates, stop/continue conditions, and review date.
- Make clear what decision happens if it works and what decision happens if it fails.

## Case 24: Research Synthesis Scorecard

Prompt: "Tengo entrevistas, research de ChatGPT, notas de ventas y dogfood. Sintetizalo y decime si construimos."

Expected:

- Trigger `guided-intake` and research governance.
- Treat external research and transcripts as raw intelligence until verified.
- Use the research synthesis scorecard: ICP clarity, pain urgency, workflow frequency, current alternative pain, switching willingness, activation clarity, trust/security readiness, buyer/user alignment, willingness to pay, founder support load, evidence quality.
- Output contradictions, unsupported claims, recommendation, next experiment, founder approvals, trusted-until window, and Project Alignment Packet lifecycle status.
- Do not mark `Ready for build: yes` unless platform/channel, data mode, risk gates, evidence gates, and reversal triggers are explicit.

## Case 25: Project Alignment Packet Lifecycle

Prompt: "Actualizá el Project Alignment Packet con lo que aprendimos y dejalo listo para que otro agente siga."

Expected:

- Trigger `guided-intake`.
- Include packet status: draft | provisional | current | superseded | historical.
- Include source evidence, founder approval status, trusted-until date/condition, supersedes/superseded-by, profile fields changed, decisions needed, linked experiments/dogfood/evals, and next review trigger.
- Promote durable conclusions only to `PROJECT_PROFILE.md`, decision records, evals, or active bootstrap/refactor artifacts when supported by evidence and approvals.
- Do not treat an old packet as active truth if it has been superseded or is historical.

# Project Bootstrap Plan

> First run after importing Agent OS into any project. Do this before feature work, refactors, audits, or agent automation.

## Purpose

Turn a copied Agent OS template into a project-specific operating system.

The founder should be able to give an idea or user problem after this bootstrap, and the agents should know the stack, tools, product surface, approval gates, docs, vendors, data, tests, launch stage, and risk posture.

Agent OS is model-agnostic. Claude, ChatGPT/Codex, browser agents, research agents, future models, and specialized tools are runtimes. The durable system is the repo: project profile, contracts, artifacts, evidence, evals, and approval gates.

## Inputs

Read or create:

- `.agent-os/PROJECT_PROFILE.md`
- `AGENTS.md`
- model-specific instruction files such as `CLAUDE.md`, `.claude/CLAUDE.md`, or future equivalents
- `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`
- package/config files
- docs or existing product briefs
- design source package if present: Figma/design files, variables/tokens, brand/design context, logos/assets, typography, iconography, motion rules, reference products, UX notes
- `.agent-os/UX_SYSTEM_BLUEPRINT.md` for portable UX system baseline, surface-level language, token/component discipline, status/score/empty state rules, responsive strategy, theme, and approval gates
- product language source if present: naming docs, brand/narrative docs, glossary, navigation labels, microcopy rules, public positioning, onboarding/landing copy, AI trust-language rules, terms to use/avoid
- business/GTM source if present: ICP, positioning, category thesis, pricing, packaging, activation metric, funnel, waitlist/trial model, channel strategy, sales/outreach notes, support model, unit economics, growth experiments, investor/CEO reviews, traction dashboards
- founder communication source if present: founder bio, proof, values, story boundaries, personal-brand role, product-brand role, social profiles, content strategy, launch story, channel cadence, public-claim boundaries, audience/ICP mismatch, feedback loop, prior posts, interviews, podcasts, videos, newsletters, and founder references to study
- UX research inputs if present: user interviews, support tickets, sales calls, analytics, session recordings, usability notes, Mobbin/reference collections, journey maps, service blueprints, IA maps, tracking plans
- customer discovery inputs if present: interview notes, design-partner candidates, sales calls, LOIs, paid pilots, concierge MVP notes, smoke-test results, waitlist qualification, pricing objections, support load, and first-wedge experiments
- `.mcp.example.json`
- `.mcp.json` if local and safe to inspect without exposing secrets
- `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`
- env examples without secret values
- platform/release configs if present: mobile apps, PWA manifests, native projects, app-store metadata, desktop/extension/API configs
- seed fixtures, local DB config, staging data plan, and existing demo/mock strategy
- existing tests/CI/deploy config
- prior CEO reviews, deep research sessions, investigation transcripts, strategy notes, and model-specific planning outputs
- external intelligence sources and tool candidates: Mobbin/Figma/reference products, Context7/docs sources, analytics/replay, AI eval/observability, workflow/job tooling, design-token tooling, security scanners, browser QA, mobile/app-store tooling, and any famous tools the founder expects agents to use

Docs are hypotheses until code/screen/runtime evidence confirms them.

## Phase 0: Guided Intake

Use `.agent-os/workflows/guided-intake.md` before Phase 1 when the project profile is blank, stale, copied from another project, or too incomplete for agents to build safely.

Output:

- Project Alignment Packet;
- Strategic Context Research Brief when direction depends on market, users, technical choices, design references, AI risk, security, business/GTM, or founder narrative;
- selected prompts from `.agent-os/skills/core/guided-intake/references/deep-research-prompts.md` when external Claude/ChatGPT/Codex research is needed;
- discovery packet and first wedge experiment when the product, market, workflow, pricing, or public claim is not yet validated;
- first answers for `.agent-os/PROJECT_PROFILE.md`;
- question backlog grouped as `must decide now`, `safe default`, `needs research`, or `defer`;
- minimum agent board for the first build/refactor pass;
- evidence and approval gates before implementation.

## Phase 1: Identity And Stage

```md
Project:
Category:
Primary user:
Primary problem:
Current stage:
Founder goal:
Launch/handoff target:
Non-goals:
```

Output:

- filled `.agent-os/PROJECT_PROFILE.md` identity section;
- filled strategic context, mission tests, appetite, assumptions, and evidence sections when known;
- initial North Star and current stage;
- explicit "do not build yet" boundaries.

## Phase 2: Product Surface

Map:

- main modules/navigation;
- public surfaces;
- authenticated/core surfaces;
- admin/internal surfaces;
- beta/launch-critical flows;
- out-of-scope/legacy/prototype surfaces.
- delivery channels: desktop web, mobile web, PWA, iOS, Android, desktop app, extension, API/headless, or explicit non-goals.

Output:

- initial route/surface map;
- first activation path hypothesis;
- surfaces requiring screen/code discovery.
- platform/channel assumptions requiring approval or research.

## Phase 2C: UX Research, Flow, And Service Design Baseline

Use `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md`.

Decide or mark unknown:

```md
User needs source:
Primary personas/roles:
Launch-critical use cases:
Activation flow hypothesis:
Existing flow traces:
Existing journey maps:
Existing service blueprints:
IA/navigation model:
Content/terminology source:
Product-language registry:
Tracking plan/event taxonomy:
Research/beta feedback loop:
Support/service recovery loop:
Accessibility/performance-by-flow target:
External reference tools: Mobbin | Figma | user interviews | analytics | session replay | other
Founder approval needed:
```

Output:

- initial user needs register;
- use-case and flow baseline;
- journey/service-blueprint gaps;
- IA/content terminology gaps;
- product-language/naming gaps;
- measurement and tracking-plan gaps;
- research/beta learning plan;
- support/recovery assumptions;
- UX research gates that block design/refactor/launch work.

## Phase 2B: Platform Strategy

Use `.agent-os/PLATFORM_STRATEGY_CONTRACT.md`.

Decide or mark unknown:

```md
Current platforms:
Planned platforms:
Rejected/non-goal platforms:
Primary launch platform:
Mobile web stance:
PWA stance:
iOS stance:
Android stance:
Desktop/extension/API stance:
Shared product core:
Hybrid-ready architecture stance:
Platform-specific UX:
Platform-specific auth/session:
Platform-specific payments:
Platform-specific data/offline/realtime:
Platform QA:
Release/app-store gates:
Founder approval needed:
```

Output:

- platform matrix;
- shared-core boundary;
- hybrid-ready package/API/adapter boundary when native/app platforms are planned;
- platform roadmap;
- platform-specific risks and approval gates.

## Phase 3: Stack And Architecture Choices

Choose or verify:

```md
Workspace/package manager:
Frontend:
Native/mobile:
Backend/API:
Database/storage:
Auth:
Payments:
AI/models:
Queues/workers/jobs:
Analytics/observability:
Deploy/hosting:
Testing/E2E:
Platform QA:
Design system:
Docs system:
```

For each choice, record:

- reason;
- alternatives considered;
- lock-in risk;
- portability risk;
- approval needed;
- docs to update.

Output:

- stack baseline;
- architecture assumptions;
- decisions requiring founder approval;
- gaps that block feature work.

## Phase 3B: Design System, Brand Intake, And Shell Contract

Use `.agent-os/DESIGN_SYSTEM_CONTRACT.md` and `.agent-os/UX_SYSTEM_BLUEPRINT.md`.

Decide or mark unknown:

```md
Design source of truth:
Designer/UX owner:
UX system audit status:
Brand primitives:
Content/microcopy system:
Token format/source:
Token build pipeline:
CSS variable/theme strategy:
Framework/theme strategy:
Typed visual API:
Typography system:
Color system:
Brand asset/IP intake:
License/commercial usage status:
Layout/spacing/grid system:
Shape/elevation system:
Iconography system:
Illustration/imagery/media system:
Motion system:
Data visualization system:
AI UX/state system:
Component primitives:
Product pattern library:
App shell/navigation contract:
Mobile web/PWA/native modes:
Accessibility target:
Reference products:
Surface level taxonomy:
Founder UX decisions D1-D15:
Rebrand protocol:
Designer handoff policy:
Documentation/tooling/governance:
Design QA gates:
External research/founder-data imports:
```

Output:

- design source package status;
- UX system baseline status and whether `ux-system-audit` must run before UI refactor work;
- asset/license/IP intake status and blocked assets;
- foundation coverage status: brand, content, color, type, layout, shape, motion, iconography, media, data visualization, AI UX;
- token taxonomy and implementation path;
- own iconography or approved icon source decision;
- primitive/component inventory;
- product pattern inventory;
- app shell and adaptive navigation contract;
- surface-level language and component discipline gaps from `UX_SYSTEM_BLUEPRINT.md`;
- platform/mode design assumptions;
- documentation, tooling, versioning, changelog, and governance gaps;
- designer handoff and rebrand protocol;
- external deep research and founder-data import status, if brand/product decisions depend on them;
- design-system gaps that block user-facing feature work.

## Phase 3C: Product Language, Naming, And UX Writing

Use `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`.

Decide or mark unknown:

```md
Primary product category:
Plain-language value proposition:
Primary user vocabulary:
Top-level navigation:
Core product objects:
Core user actions:
Activation event wording:
AI trust/control language:
Empty/loading/error/degraded language:
Legal/compliance-sensitive claims:
Brand/metaphor system:
Terms to use:
Terms to avoid:
Terms needing research/user testing:
Reference/Mobbin pattern plan:
Product language registry location:
Docs/code/UI/E2E drift risks:
Founder approval needed:
```

Output:

- product-language architecture: category, navigation, objects, actions, AI trust language, brand/metaphor layer;
- initial naming scorecard for top-level modules and launch-critical objects/actions;
- terms to promote, downgrade, avoid, or research;
- rules for CTAs, empty/loading/error/degraded states, accessibility labels, analytics events, E2E labels, and support copy;
- external-reference/Mobbin boundaries for language and naming;
- docs/code/UI terminology sync plan;
- founder decisions that block UI/copy implementation.

## Phase 3D: Business Model, GTM, Marketing, And Founder Strategy

Use `.agent-os/BUSINESS_GTM_CONTRACT.md`.

Decide or mark unknown:

```md
Primary ICP:
Secondary ICP:
Anti-ICP:
Primary acquisition wedge:
Primary activation event:
Primary retention loop:
Revenue model:
Pricing/packaging:
Free/trial/waitlist stance:
Sales/GTM motion:
Marketing/content motion:
Core channels:
Founder distribution assets:
Cost/margin posture:
Support/onboarding model:
Trust/legal/compliance-sensitive claims:
Metrics dashboard:
Decision records needed:
Founder approvals needed:
Docs to reconcile after evidence:
```

Output:

- business/GTM source package status;
- ICP and anti-ICP baseline;
- activation and time-to-value hypothesis;
- pricing/packaging and unit-economics assumptions;
- channel and founder-led distribution plan;
- marketing claim/trust/compliance boundaries;
- support/founder workload risks;
- business dashboard and metrics gaps;
- founder decisions that block landing, onboarding, pricing, GTM, public claims, or launch work.

## Phase 3E: Founder Communication, Social Distribution, And Public Narrative

Use `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`.

Decide or mark unknown:

```md
Founder data package:
Founder-led relevance: core | supporting | optional | not-applicable | harmful
Founder brand role:
Product brand role:
Company/product channel role:
Relationship between founder brand and product brand:
Audience/ICP match or mismatch:
Founder story arc:
Topics founder will discuss:
Topics founder will not discuss:
Approved proof assets:
Content pillars:
Channel roles:
Channel cadence:
Personal-account operating role:
Company-account operating role:
Founder/company channel split:
Launch story:
Public claims:
Proof and limitations:
Primary CTA path:
Feedback-to-product loop:
Founder-led support/sales/onboarding role:
Owned audience path:
Reference founders or creators to study:
Do-not-copy boundaries:
Legal/compliance-sensitive claims:
Founder approvals needed:
Docs to reconcile after evidence:
```

Output:

- founder data package status;
- founder brand vs product brand map;
- audience/ICP mismatch risk;
- channel matrix for LinkedIn, X/Twitter, Instagram, YouTube, newsletter/Substack, communities, or project-specific channels;
- content pillars and non-content boundaries;
- public claim/proof/limitation table;
- founder-led feedback loop into product, UX, support, GTM, and roadmap;
- reference-founder research plan with "study mechanisms, do not copy persona" rule;
- founder decisions that block landing, onboarding, launch announcements, waitlist, social copy, investor/CTO story, or GTM work.

## Phase 4: MCPs, Tools, And Skills

Update:

- `.agent-os/MCP_REGISTRY.md`
- `.mcp.example.json`
- `.agent-os/SKILL_REGISTRY.md`
- `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`

For every MCP/tool/skill:

```md
Name:
Purpose:
Source/maintainer:
Environment: local | preview | production
Read/write capability:
Data exposed:
Credentials/token storage:
Approval status:
Quarantine/guardrail:
Fallback/removal path:
```

Rules:

- Default to read-only.
- Quarantine unknown or broad-permission tools.
- Do not copy old project MCPs by inertia.
- Do not expose customer/user data to a tool without approval.
- Prefer generic skills; keep project-prefixed aliases only when runtime compatibility requires them.

Output:

- approved MCP registry;
- quarantined tools list;
- skill registry fit for the project;
- approval gates for tool mutations.

## Phase 4A: External Intelligence Stack

Use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md`.

Decide or mark unknown:

```md
Current technical docs source:
Design/reference intelligence source:
Mobbin/Figma/reference product stance:
Browser/QA evidence stack:
AI eval/observability stack:
AI gateway/provider fallback stack:
Product analytics/session replay/experimentation stack:
Security/supply-chain/scanner stack:
Ops/observability stack:
Workflow/job orchestration candidates:
Design-token/tooling candidates:
Mobile/app-store tooling:
Business/context connectors:
Quarantined tools:
Do-not-copy boundaries:
Tool promotion approval gate:
Founder approval needed:
```

Rules:

- Every external tool starts as `observed` or `candidate`.
- Promote only after source/maintainer, auth, data touched, cost, privacy, security, overlap, fallback, and removal path are known.
- Choose one primary tool per job unless the overlap is explicit and useful.
- Use Mobbin/reference products for pattern principles only.
- Record famous-tool recommendations as candidates until a real project need and risk review promote them.

Output:

- external intelligence baseline;
- approved/candidate/quarantined tool families;
- Mobbin/reference-product protocol;
- analytics/eval/security/mobile tool decisions;
- registry updates or approval gates needed.

## Phase 4B: Model And Agent Runtime Strategy

Use `.agent-os/MODEL_AND_REVIEW_ORCHESTRATION.md` and `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`.

First define the cross-runtime instruction strategy:

```md
Shared instruction entrypoint:
Claude entrypoint:
Claude local mirror:
Codex/ChatGPT entrypoint:
Path-scoped rules location:
Runtime-specific files allowed:
Runtime-specific files forbidden:
Context freshness gate:
Context handshake artifact:
Instruction drift policy:
Auto-memory/local-memory policy:
Hooks/settings enforcement:
MCP/tool visibility policy:
Cross-model handoff artifact:
```

Rules:

- `AGENTS.md` is the shared cross-runtime bootloader.
- `CLAUDE.md` is a Claude adapter and must not fork project truth from `AGENTS.md` or `.agent-os`.
- `.claude/CLAUDE.md` is a short mirror only.
- Runtime-specific settings, hooks, plugins, and local memories can improve execution but cannot become the only source of truth.
- Every important runtime must prove freshness with current repo evidence before acting.

Define every runtime that may touch the project:

```md
Runtime:
Provider/model:
Primary use:
Tool access:
Filesystem access:
Browser access:
MCP access:
Can mutate code? yes/no
Can mutate production? yes/no
Instruction files read:
Known strengths:
Known failure modes:
Required evidence before accepting output:
Fallback runtime:
```

Minimum runtimes to consider:

- Claude Code or equivalent coding agent;
- Codex/ChatGPT coding agent;
- ChatGPT/Claude deep research or investigation mode;
- browser QA agent;
- security scanner;
- docs generator;
- CI/release bot;
- future model/provider.

Output:

- instruction-file strategy;
- runtime context handshake template;
- freshness commands;
- instruction drift policy;
- model/runtime registry;
- instruction-file mapping per runtime;
- evidence requirements per runtime;
- fallback/continuation rule so another model can pick up the work;
- eval cases for new model/runtime behavior.

## Phase 4C: Strategic Review And Investigation Pack

Large model sessions must become durable project inputs.

Collect or create:

- CEO/founder review;
- engineering/architecture review;
- design/UX review;
- product/user review;
- security/privacy/legal review;
- scale/cost/ops review;
- deep investigation/root-cause packets;
- market/category/competitor research;
- premortem when the cost of being wrong is high.

For each review, record:

```md
Review name:
Runtime/model used:
Date:
Question/plan reviewed:
Mode:
Context packet:
Key claims:
Strongest recommendations:
Risks/blind spots:
Contradictions:
Decisions proposed:
Evidence/sources:
What changes in project plan:
What does not change:
Follow-up artifacts:
Founder approval needed:
```

Rules:

- CEO reviews that change scope, ICP, pricing, GTM, category, capital story, launch scope, or roadmap must create a decision record.
- Deep investigations must name hypotheses, evidence, root cause or unknowns, blast radius, fix options, and verification plan.
- Multi-model reviews are advisory until translated into artifacts/evals/decisions.
- Never treat a long chat transcript as canonical truth by itself.
- When the input is a large external research package, use the Deep Research And CEO Review Intake Protocol in `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` before changing project truth.

Output:

- strategic review register;
- investigation register;
- decision records to approve;
- contradictions to resolve before feature work;
- eval cases for repeated review/investigation patterns.

## Phase 4D: System Integrity And Governance

Use `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md`.

Decide or mark unknown:

```md
Source-of-truth map:
Trigger map:
Owner map:
Evidence map:
Advisory controls:
Scripted/CI controls:
Runtime/monitoring controls:
Artifact lifecycle:
Unified risk register location:
Project-specific leakage:
Duplicate or overlapping contracts:
Automation opportunities:
Controls to delete or merge:
Founder approval needed:
```

Rules:

- Do not add contracts without triggers.
- Do not call a control "required" unless it is checked in a workflow, eval, script, CI, runtime hook, or monitor.
- Record which risks are AI-specific vs product/business/data/security/legal/ops/vendor/delivery/portability.
- Mark artifacts as draft, provisional, current, superseded, or historical.
- Keep portable core and project overlay separate.

Output:

- system integrity map;
- blind-spot register;
- unified risk register starting point;
- artifact lifecycle policy;
- advisory vs enforced control matrix;
- automation/CI backlog;
- contracts to merge/delete/deprecate.

## Phase 5: Data, Privacy, And Legal Scope

Use `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md`.

Define:

- data categories;
- sensitive data;
- subprocessors/vendors;
- retention/export/delete assumptions;
- consent/tracking/email/notification assumptions;
- jurisdictions;
- media/IP/content-rights risks;
- account/team/client ownership model;
- backup/restore owner.
- data environment matrix: mock/demo, fixture, local seeded DB, staging seeded DB, beta-real, production-real;
- seed strategy and reset/restore path;
- agent access policy for data modes;
- provider sandbox strategy for auth, billing, email, AI, external APIs, storage, and analytics.

Output:

- privacy/legal/compliance triage;
- data ownership and access model;
- real-data environment plan;
- seed/fixture plan;
- vendor/subprocessor watchlist;
- IP/content/asset-rights watchlist.

## Phase 6: Scale, Resilience, And Cost

Use `.agent-os/SCALE_AND_RESILIENCE_CONTRACT.md`.

Define:

- likely bottleneck;
- heavy work to audit;
- sync vs async policy;
- queue/worker/job needs;
- high-risk dependencies;
- AI provider posture and fallback needs;
- cost posture by plan/user/feature;
- launch/traffic scenarios to model;
- observability and alerting baseline;
- manual founder ops before a team exists.

Output:

- scale/resilience context in `PROJECT_PROFILE.md`;
- first dependency resilience matrix;
- cost governance assumptions;
- feature flags/kill switches needed.

## Phase 7: Docs, Tests, CI, And Release Gates

Define:

- canonical docs files;
- docs that are hypotheses;
- generated docs policy;
- unit/integration/E2E strategy;
- browser QA strategy;
- native/mobile QA strategy when applicable;
- accessibility target;
- CI checks;
- release/rollback/canary path;
- production readiness commands;
- artifact location.

Output:

- docs policy;
- test/release baseline;
- production readiness checklist tailored to the stack;
- platform release/readiness checklist when applicable;
- gaps before beta/launch.

## Phase 8: First Agent Evals

Run or document:

- skill trigger evals;
- tool-risk evals;
- design-system-review evals;
- research quality evals;
- production readiness evals;
- portability evals;
- project bootstrap eval.

Output:

- bootstrap eval artifact;
- pass/warn/fail cases;
- fixes or accepted risks.

## Bootstrap Output

Create an artifact:

```md
artifacts/audits/<date>-project-bootstrap.md
```

Required sections:

- Project profile summary.
- Product surface map.
- UX research/flow baseline: user needs, use cases, activation hypothesis, journey/service-blueprint gaps, IA/content terminology, UX metrics, tracking plan, research loop, and recovery/support loop.
- Stack decisions.
- Design-system source package, token strategy, primitive inventory, shell/navigation contract, and handoff policy.
- Product-language architecture: category, top-level labels, core objects/actions, AI trust language, metaphor boundaries, terms to use/avoid, and docs/code/UI/E2E sync plan.
- Business/GTM architecture: ICP, anti-ICP, wedge, activation metric, pricing/packaging, channels, support model, cost/margin posture, public claims, and decision records.
- Customer discovery architecture: evidence ladder, discovery packet, design-partner/sales-discovery plan, first wedge experiment, invalidation triggers, and claims allowed/forbidden.
- Founder communication architecture: founder data package, founder brand vs product brand, audience/ICP bridge, channel strategy, content pillars, launch story, public proof/claims, feedback-to-product loop, and reference-founder research boundaries.
- MCP/tool/skill registry decisions.
- External intelligence stack: approved/candidate/quarantined reference sources, famous tools, analytics/evals/security/mobile tooling, and Mobbin/reference protocol.
- Model/runtime registry.
- Strategic review and investigation register.
- System integrity map: source-of-truth, triggers, owners, evidence, automation, artifacts, risk register, and portability boundaries.
- Dogfooding scenario and result for Agent OS bootstrap or the first launch-critical product workflow.
- Data/privacy/legal scope.
- Scale/resilience/cost baseline.
- Docs/test/release baseline.
- Approval gates.
- Open questions.
- Ready/not-ready decision for feature work.

## Ready Criteria

Agent OS is ready to operate in the new project only when:

- `PROJECT_PROFILE.md` is filled in;
- `AGENTS.md` and model-specific instruction files reference the project profile;
- MCP registry matches actual installed tools;
- skill registry has only trusted core skills;
- external intelligence stack is clear enough that agents know which outside sources/tools to use, evaluate, quarantine, or ignore;
- model/runtime registry is clear enough that Claude, ChatGPT/Codex, or a future model can continue from artifacts;
- runtime context strategy is clear: shared bootloader, runtime adapters, freshness gate, hooks/settings policy, and cross-model handoff artifact;
- CEO/deep-investigation outputs are summarized into durable artifacts or explicitly ignored;
- system integrity review has classified controls as advisory, checklist, scripted, CI-gated, runtime-gated, or monitored;
- stack/deploy/database/auth/payment/AI choices are known or explicitly undecided;
- design-system source, token strategy, primitives, shell/navigation, platform modes, accessibility target, and designer handoff policy are known or explicitly undecided;
- product-language source, category language, top-level labels, core objects/actions, AI trust language, metaphor boundaries, terms to use/avoid, and docs/code/UI/E2E sync plan are known or explicitly undecided;
- business/GTM source, ICP, anti-ICP, acquisition wedge, activation event, retention loop, pricing/packaging, channel strategy, support model, cost/margin posture, public-claim boundaries, and business metrics are known or explicitly undecided;
- customer discovery path, first wedge experiment, design-partner/sales-discovery plan, evidence ladder status, and invalidation triggers are known or explicitly undecided;
- founder communication source, founder data package, personal-brand vs product-brand roles, social channel strategy, public proof/claims, content pillars, audience/ICP bridge, feedback loop, and founder approvals are known or explicitly undecided;
- user needs, use cases, launch-critical flow traces, journey/service-blueprint gaps, IA/content terminology, UX metrics, event taxonomy, and research/beta feedback loop are known or explicitly undecided;
- platform targets and non-goals are known or explicitly undecided;
- data environment strategy is clear enough to distinguish demo, fixture, seeded staging, beta-real, and production-real work;
- docs policy is clear;
- approval gates are clear;
- scale/resilience/cost baseline exists;
- Agent OS bootstrap or first launch-critical workflow has a dogfooding scenario, evidence, failures, and residual risk recorded;
- first feature request can be classified without relying on founder memory.

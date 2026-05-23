# Workflow: Guided Intake

Use this before starting a new product, importing Agent OS into a repo, or refactoring an existing product into Agent OS. It turns a rough idea into a filled project context packet, customer-evidence backlog, first wedge experiment, and agent build plan.

The goal is not to ask every question. The goal is to ask the few questions that unlock the next professional decision, infer what the repo already proves, and mark unknowns honestly.

## Modes

- `new-project`: founder has an idea, blank repo, prototype, or early product brief.
- `existing-project`: repo/app exists and Agent OS needs to align around it.
- `refactor`: product exists but strategy, UX, stack, docs, or agents are misaligned.
- `handoff`: project needs to become understandable to another agent, CTO, team, or investor.

## Operating Rules

1. Run mandatory Agent OS routing first.
2. Ask at most 3 questions per turn unless the founder explicitly asks for the full questionnaire.
3. Prefer repo evidence over founder memory when a repo exists.
4. Treat docs, old plans, and chat transcripts as hypotheses until verified.
5. Use progressive disclosure: fill knowns, mark unknowns, ask only the highest-leverage next questions.
6. Never block on perfect answers; produce defaults, risks, and decisions needed.
7. Separate `must decide now`, `can default safely`, `needs research`, and `defer`.
8. Do not create feature code until the intake packet says the project is ready or records accepted risks.
9. Use deep initial research for new products, strategic refactors, category/market decisions, complex technical choices, public claims, or founder/GTM direction.
10. Keep the process runtime-agnostic: Claude, ChatGPT, Codex, browser agents, and future models are executors; Agent OS artifacts and repo evidence are the source of truth.
11. New products, strategic refactors, pricing/GTM moves, and public claims need a customer-discovery path and first wedge experiment before broad build.
12. Treat customer discovery, design partners, sales discovery, and dogfooding as different evidence classes; do not merge them into a single vague "feedback" bucket.
13. For AI, agentic, automation, trust-sensitive, or data-sensitive products, run lightweight UX, security/privacy, founder-trust, and dogfood gates before recommending beta, design-partner, or public use.

## Phase -1: Strategic Context Research

Use this before Phase 0 when the product direction, market, users, technical path, design category, AI risk, or business model is still underdefined.

This research can be run in ChatGPT deep research, Claude, Codex, a research agent, or another approved runtime. The output is advisory until verified and converted into Agent OS artifacts.

Use `.agent-os/skills/core/guided-intake/references/deep-research-prompts.md` as the canonical prompt library. Select the smallest prompt set needed for the project or refactor; do not run every prompt by default.

Research questions:

```md
Category and market: What category are we entering, and what current alternatives shape user expectations?
User and workflow: Who has the painful job, how do they solve it today, and what switching cost exists?
Competitors and references: Which products, UX patterns, pricing models, and GTM motions are worth studying without copying?
Technical feasibility: Which stack, APIs, AI models, data sources, auth, payments, deploy, and platform choices could change the build?
Security and compliance: What data, privacy, tool-use, prompt-injection, legal, and production risks appear early?
Business model: What pricing, packaging, activation, retention, support, cost, and margin assumptions are plausible?
Founder/GTM: What founder-led channels, proof assets, narrative constraints, and public claims are credible?
Design and language: What product vocabulary, IA, trust language, and design-system assumptions should be tested?
```

Research brief template:

```md
Runtime/model:
Date:
Prompt/question:
Sources and citations:
Internal context provided:
Verified findings:
Useful hypotheses:
Contradictions:
Unsupported claims:
Decisions proposed:
Risks and unknowns:
Recommended experiments:
Discovery questions:
Design partner or sales discovery targets:
Dogfood scenario:
What changes in project direction:
What does not change:
Founder decisions needed:
Agent OS artifacts to update:
```

Rules:

- Prefer official docs, primary sources, direct product evidence, and current provider docs.
- Require citations or source links for external claims.
- Verify high-impact claims before changing product truth.
- Keep private founder context, customer data, credentials, and proprietary assets out of external research unless approved.
- Convert durable conclusions into `.agent-os/PROJECT_PROFILE.md`, decision records, eval cases, or the active bootstrap/refactor artifact.
- Mark research as stale when market, pricing, platform policy, model/provider capabilities, compliance, or tooling could change the decision.

Output:

- Strategic Context Research Brief;
- selected prompt set and research runtime;
- research-backed opportunities and risks;
- research synthesis scorecard;
- assumptions map;
- source-backed decisions vs founder beliefs;
- recommended first experiments;
- product/business/technical/design questions for the founder.

## Phase 0: Seed The Idea

Ask these first when the project is mostly unknown:

```md
What are we building, in one sentence?
Who is it for?
What painful job or expensive workflow does it solve?
What does a user do in the first successful session?
Is this a new project, existing repo, refactor, or handoff?
What is the target stage: idea, prototype, alpha, beta, production, or scale?
What would make this project obviously worth continuing in 30 days?
What existing research or long-form Claude/ChatGPT analysis should we ingest as raw intelligence?
```

Output:

- initial project thesis;
- mode;
- first activation hypothesis;
- first success metric;
- research context available or missing;
- unknowns that block planning.

## Phase 1: Alignment Map

Fill or ask enough to complete this map:

```md
Project:
Category:
Primary user:
Primary problem:
Current stage:
Founder goal:
Launch or handoff target:
Non-goals:
Platform/channel:
Data mode:
Hard constraints:
Appetite/time budget:
Mission tests:
```

Question prompts:

- Which users are excluded on purpose?
- What is the product not allowed to become?
- What must be true before public launch?
- What is the strongest existing evidence: users, revenue, interviews, usage, waitlist, prototype, or founder expertise?
- Which claims are only beliefs today?
- What is the appetite: hours, days, weeks, or a major bet?
- Which 3 tests would prove this direction is working?

## Phase 1B: Assumptions, Evidence, And Decision Lifecycle

Map every major claim:

```md
Claim:
Source: founder belief | user evidence | repo evidence | external research | analytics | support/sales | competitor/reference | legal/security
Confidence: low | medium | high
Evidence:
Decision impact:
Validation experiment:
Owner:
Trusted until:
Reversal trigger:
Decision status: unknown | hypothesis | approved | rejected | deferred
```

Question prompts:

- What are we assuming that would kill the project if false?
- Which assumption can be tested fastest with real users or real usage?
- Which decisions can safely default now?
- Which decisions expire quickly because the market, tools, model capabilities, policies, or costs can change?

## Phase 1C: Customer Discovery, Design Partners, Sales Discovery, And Dogfooding

Use `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`, `.agent-os/DOGFOODING_CONTRACT.md`, and `.agent-os/BUSINESS_GTM_CONTRACT.md`.

Ask or infer:

```md
Primary discovery mode:
ICP to validate:
Anti-ICP:
Current workflow to study:
Pain/urgency hypothesis:
Current alternative:
Design partner criteria:
Sales discovery criteria:
Dogfood scenario:
First wedge experiment:
Evidence already available:
Evidence still missing:
Research synthesis score:
Promotion/reversal trigger:
```

Question prompts:

- Which real person or account can teach us the most without distorting the product?
- What current workflow, workaround, or cost should we observe before pitching a solution?
- Which design partner commitment would create real learning instead of custom consulting?
- What sales objection would change the roadmap, pricing, onboarding, or trust surface?
- What can the founder dogfood this week with realistic input data?
- What is the smallest wedge experiment that tests behavior, not compliments?

First wedge experiment template:

```md
Experiment:
ICP:
Pain:
Offer:
Channel:
Landing/path:
Activation event:
Success metric:
Quality threshold:
Manual founder work:
Support load:
Trust/privacy constraints:
Data mode:
UX gate:
Security gate:
Founder trust gate:
Stop condition:
Continue condition:
Decision if it works:
Decision if it fails:
Review date:
```

Research synthesis scorecard:

```md
Scope:
Sources reviewed:
ICP clarity: 0 | 1 | 2 | 3
Pain urgency: 0 | 1 | 2 | 3
Workflow frequency: 0 | 1 | 2 | 3
Current alternative pain: 0 | 1 | 2 | 3
Switching willingness: 0 | 1 | 2 | 3
Activation clarity: 0 | 1 | 2 | 3
Trust/security readiness: 0 | 1 | 2 | 3
Buyer/user alignment: 0 | 1 | 2 | 3
Willingness to pay: 0 | 1 | 2 | 3
Founder support load: 0 | 1 | 2 | 3
Evidence quality: 0 | 1 | 2 | 3
Contradictions:
Unsupported claims:
Decision:
Recommended next experiment:
Trusted until:
```

Rules:

- A score below 9 means keep researching or narrow the ICP before building.
- A score from 9-16 means run a wedge or design-partner experiment before broad implementation.
- A score from 17-24 can justify the smallest fullstack slice with explicit risk gates.
- A score above 24 can strengthen roadmap/business assumptions only if evidence is current and founder-approved where needed.

## Phase 2: Product And UX

Use `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md`, `.agent-os/PLATFORM_STRATEGY_CONTRACT.md`, and `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`.

Ask or infer:

```md
Primary use case:
Launch-critical flow:
Activation event:
Mission tests:
Core product objects:
Core user actions:
Top-level modules/navigation:
Public surfaces:
Authenticated surfaces:
Admin/internal surfaces:
Empty/loading/error/degraded states needed:
Accessibility target:
Terminology users already understand:
Terms/metaphors to avoid:
```

Question prompts:

- What is the user trying to finish, not just explore?
- What should the first screen help them do?
- What does success look like before the user trusts the AI/system?
- What states would make the product feel broken or unsafe?
- Which words would confuse a non-insider?
- What is the smallest full journey we can test end to end?

## Phase 3: Business, GTM, And Founder Communication

Use `.agent-os/BUSINESS_GTM_CONTRACT.md`, `.agent-os/CUSTOMER_DISCOVERY_CONTRACT.md`, and `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`.

Ask or infer:

```md
ICP:
Anti-ICP:
Pricing/packaging stance:
Acquisition wedge:
Retention loop:
Support/onboarding model:
Founder-led role:
Public proof available:
Claims allowed:
Claims forbidden:
Primary CTA:
Business metric:
Validation loop:
Design partner path:
Sales discovery path:
First wedge experiment:
```

Question prompts:

- Why would this user pay or switch now?
- What is the smallest offer that creates real learning?
- What support burden can the founder actually carry?
- What public proof exists, and what would be dishonest to imply?
- Which channel gives the fastest truthful feedback from the ICP?
- What would make us stop, narrow, or reposition the product?

## Phase 3B: Dogfood Gate For AI Or Agentic Products

Use `.agent-os/DOGFOODING_CONTRACT.md` for AI, agentic, automation, trust-sensitive, or data-sensitive products.

Ask or infer:

```md
Dogfood scenario:
Persona/segment simulated:
Input data:
Data mode:
AI/agent actions:
Expected useful output:
Time-to-value target:
Quality bar:
Human approval points:
Recovery path:
Evidence captured:
Decision: ship | fix-first | narrow | research | block
```

Default lightweight gates:

```md
UX gate:

- user goal explicit;
- first next action visible;
- output review/edit/retry/save/discard/undo exists where relevant;
- empty/loading/error/degraded recovery exists;
- mobile/touch/keyboard basics are not broken.

Security/privacy gate:

- input data category known;
- external/tool/provider exposure known;
- user/external content treated as untrusted;
- mutation/action approval named;
- data mode boundary explicit;
- traces/logs avoid secrets/private data.

Founder trust gate:

- claims are evidence-backed or limited;
- AI uncertainty/source/freshness/degraded mode is visible where relevant;
- support burden is acceptable;
- user consent is clear for data, media, imports, exports, or public proof;
- founder approval is named for claims, real data, billing, or partner proof.
```

Rules:

- Dogfood evidence can block beta even when tests pass.
- Dogfood evidence does not prove market demand; customer discovery or sales/design-partner evidence is still required.
- If the founder cannot dogfood the workflow realistically, record the fixture/staging gap and the first external validation plan.

## Phase 4: Architecture, Data, Security, And AI

Use `.agent-os/FEATURE_EXECUTION_CONTRACT.md`, `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md`, `.agent-os/SCALE_AND_RESILIENCE_CONTRACT.md`, `.agent-os/SUPPLY_CHAIN_SECURITY.md`, and `.agent-os/AI_RISK_REGISTER.md`.

Ask or infer:

```md
Workspace/package manager:
Frontend:
Backend/API:
Database/storage:
Auth:
Payments:
AI/models:
External providers:
Data categories:
Sensitive data:
Demo/mock strategy:
Staging/beta/production strategy:
Expected scale:
Cost ceiling:
Failure/degraded behavior:
Tool/action risk:
Agent eval plan:
```

Question prompts:

- What data must never leave the project boundary?
- Which actions mutate money, identity, customer data, or production systems?
- What can be mocked safely for demo mode?
- What should happen when AI, DB, payments, or external APIs fail?
- What is the smallest architecture that will not create immediate rework?
- Which tools can read/write code, DB, auth, billing, deploy, production, customer data, or external accounts?
- What agent behavior should be evaluated before we trust this workflow?
- How could the product or agent workflow harm the user, leak data, make a false claim, mutate the wrong account, or optimize the wrong metric?

## Phase 5: Design, Brand, And Content System

Use `.agent-os/DESIGN_SYSTEM_CONTRACT.md` and `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`.

Ask or infer:

```md
Design source of truth:
Brand primitives:
Typography/color/token stance:
Iconography/media stance:
Navigation/app shell:
Reference products:
Do-not-copy boundaries:
Content/microcopy system:
AI trust language:
Design QA gates:
Design token portability:
```

Question prompts:

- Is there a design source package, or should the agent create a conservative first system?
- Which visual choices are brand identity vs temporary implementation?
- Which references are principles only, not screens to copy?
- What should users feel they can control, review, undo, or recover?
- Does this need portable design tokens now, or is a local first system enough?

## Phase 6: Tools, Agents, Runtime, And Evidence

Use `.agent-os/MODEL_AND_REVIEW_ORCHESTRATION.md`, `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`, `.agent-os/MCP_REGISTRY.md`, `.agent-os/SKILL_REGISTRY.md`, and `.agent-os/EVIDENCE_REQUIREMENTS.md`.

Ask or infer:

```md
Primary coding runtime:
Research runtime:
Browser QA runtime:
Security/runtime review:
MCPs/tools approved:
MCPs/tools quarantined:
Agent roles required:
Evidence required before accepting work:
Approval gates:
Docs/artifacts to update:
Human approval roles:
Trace/eval evidence:
```

Question prompts:

- Which tools are already trusted and available?
- Which tools touch credentials, customer data, billing, DB, deploy, or production?
- Which agents/lenses must review the first build?
- What evidence would convince another agent to continue safely?
- Who approves product, design, technical, security, legal, business, production, and public-claim decisions?
- What trace, eval, screenshot, test, or artifact proves the agent workflow behaved correctly?

## Project Alignment Packet Lifecycle

The Project Alignment Packet prevents intake from becoming stale chat memory.

```md
Packet ID:
Date:
Mode:
Scope:
Status: draft | provisional | current | superseded | historical
Owner:
Source evidence:
Founder approval:
Trusted until:
Supersedes:
Superseded by:
Profile fields changed:
Decision records needed:
Experiments linked:
Dogfood runs linked:
Eval cases linked:
Next review trigger:
```

Lifecycle rules:

- `draft`: questions are still open; do not build beyond spikes or accepted-risk prototypes.
- `provisional`: enough context exists for a small experiment or wedge, but important assumptions still need evidence.
- `current`: ready to guide build/refactor work for the named scope and trusted-until window.
- `superseded`: replaced by a newer packet, decision record, bootstrap artifact, or project profile update.
- `historical`: kept for learning only; do not use as active project truth.

Promotion rules:

- A packet can become `current` only when platform/channel, data mode, user/problem/activation, risk gates, evidence gates, and owner are explicit.
- A packet must be reviewed when ICP, pricing, platform, data mode, public claims, AI/provider capability, security/privacy risk, design-partner evidence, or first wedge results change.
- Durable conclusions move into `PROJECT_PROFILE.md`, decision records, eval cases, or the active bootstrap/refactor artifact. The packet itself is not a permanent source of truth unless marked current and linked.

## Existing Repo / Refactor Discovery

Before asking strategy questions in an existing repo, inspect:

```bash
git status --short
find . -maxdepth 3 -iname 'package.json' -o -iname 'pyproject.toml' -o -iname 'Cargo.toml' -o -iname 'go.mod'
find . -maxdepth 3 -type f \( -iname 'README*' -o -iname 'AGENTS.md' -o -iname 'CLAUDE.md' \)
```

Then map:

```md
Current stack:
Current routes/surfaces:
Current APIs/actions:
Current data stores:
Current tests/CI:
Current docs:
Known drift:
Refactor objective:
Do-not-break flows:
Migration constraints:
```

Ask:

- Which parts are working and must be preserved?
- Which parts are confusing, duplicated, fragile, or strategically wrong?
- What can be deleted, quarantined, or deferred?
- Which docs are known stale?

## Output: Project Alignment Packet

Produce this before build/refactor work:

```md
Mode:
Date:
Project thesis:
Project profile fields filled:
Unknowns:
Assumptions:
Decisions needed now:
Decisions deferred:
Research needed:
Strategic research brief:
Customer discovery:
Design partner plan:
Sales discovery:
Dogfood gate:
First wedge experiment:
Research synthesis scorecard:
Agent routing:
Contracts/workflows used:
Platform/channel:
Data mode:
Appetite/time budget:
Mission tests:
Assumptions and evidence:
Decision lifecycle:
Build/refactor phases:
First implementation slice:
Evidence gates:
Approval gates:
Agent eval plan:
Risks:
Artifacts/docs to update:
Packet lifecycle:
Ready for build: yes | yes-with-accepted-risks | no
```

Then update or create only when the intake changes durable project direction:

- `.agent-os/PROJECT_PROFILE.md`;
- the existing bootstrap/refactor/audit artifact required by the active workflow;
- decision records when scope, ICP, pricing, GTM, stack, launch, data, security, or public claims become durable.

Do not create artifacts by default for a short orientation interview. Keep transient intake in the conversation unless it changes durable project truth, bootstraps a repo, or starts a formal audit/refactor workflow. Never create new files in `docs/` for intake output.

## Agent Build Plan

After the packet is ready, the orchestrator selects the minimum useful agents:

```md
orchestrator: owns routing and gates
product-strategy: user/problem/metric/scope
design-reviewer: UX/design system when user-facing
product-language: naming/copy/AI trust language
architecture-security: stack/data/security/AI/tool risk
founder-ops: business/GTM/support/founder workload
research: external current facts when needed
builder: scoped implementation
qa-verifier: tests/browser/accessibility/evidence
release-captain: release/deploy/canary when applicable
system-integrity: Agent OS/coherence/evals when structure changes
```

Do not use every agent by default. Use the smallest board that covers the risk.

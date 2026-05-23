# Feature Execution Contract

> Every new feature is a cross-functional decision, not just code.

Use this contract for every new product capability, user-facing change, API-backed action, database-backed workflow, AI behavior, billing/auth/security change, or business experiment.

## Principle

No feature ships as a disconnected slice.

Every feature must be planned, built, verified, and documented across:

- solo-founder context and focus,
- current context,
- founder/business decision,
- founder communication and public trust when relevant,
- user job and UX,
- frontend,
- backend/API,
- database/RLS/storage,
- AI/prompts/tools,
- security/privacy/legal/compliance,
- analytics/cost,
- external intelligence/tooling,
- scale/resilience/operability,
- QA/E2E/accessibility,
- docs/decision sync,
- release/ops/support.

Start from `.agent-os/SOLO_FOUNDER_CONTROL_PLANE.md` when the request begins as a raw founder idea, user signal, beta metric, growth/content insight, cost/revenue signal, vendor/tool change, or CTO/handoff concern.

## Required Current Context Packet

Before planning a feature, build a small context packet from live repo evidence. Keep it focused; do not bulk-read the whole repo.

```md
Feature:
Date:
Branch / dirty state:
User request:
Input classified as:
Solo-founder context read:
Existing related routes/screens:
Existing related components:
Existing APIs/server actions:
Existing stores/types/schemas/prompts:
Existing DB tables/migrations/RLS/storage:
Existing tests/E2E/QA artifacts:
Existing docs/biz/tech claims, marked as hypotheses:
Existing user needs/use cases/flow traces/journey maps/service blueprints:
Existing analytics events and UX metrics for the affected flow:
Relevant business/GTM context from `.agent-os/BUSINESS_GTM_CONTRACT.md`:
Relevant founder communication/social/public narrative context from `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`:
Relevant design-system source/package and `.agent-os/DESIGN_SYSTEM_CONTRACT.md` impact:
Relevant product-language source and `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` impact:
Existing platform/channel assumptions:
Existing data mode/seed/staging assumptions:
Relevant decisions from `.agent-os/DECISION_SYNC_CONTRACT.md`:
Relevant feedback/support/beta/business signal:
Relevant audit findings/artifacts:
External research needed? yes/no + why:
External intelligence needed? yes/no + tools/sources + why:
Approval gates likely:
Unknowns:
```

## Definition Of Ready

A feature is ready to implement only when:

- The user/job-to-be-done is clear.
- The affected user need, use case, flow trace, journey stage, and service blueprint are known for user-facing work, or explicitly marked as new/missing evidence to create before broad implementation.
- The business reason or founder decision is clear.
- The work maps to user value, risk reduction, revenue, learning, support reduction, or launch readiness.
- The work has been checked against `.agent-os/BUSINESS_GTM_CONTRACT.md` when it affects ICP, pricing, packaging, activation, retention, GTM, marketing claims, support model, cost/margin, or founder/investor/CTO story.
- The work has been checked against `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md` when it affects founder story, social distribution, launch narrative, public proof, testimonials/case studies, channel strategy, content pillars, founder-led sales, audience/ICP bridge, or founder/investor/CTO communication.
- The feature is classified: public, beta-core, authenticated-core, business/client, admin/internal, dev-only, experiment, future, or project-specific category from `PROJECT_PROFILE.md`.
- The platform/channel target is known: desktop web, mobile web, PWA, iOS, Android, desktop, extension, API/headless, or explicit non-goal.
- The data mode is known: mock/demo, fixture, local seeded DB, staging seeded DB, beta-real, or production-real.
- If the feature is user-facing, the design-system source, tokens, primitives, app shell/navigation impact, accessibility target, and rebrand risk are known or explicitly scoped out.
- If the feature is user-facing, naming/copy impact is known: canonical public terms, internal/code terms, CTA language, AI trust language, metaphor boundaries, accessibility/E2E labels, and docs terminology sync.
- If the feature depends on external tools, reference products, analytics/evals/security scanners, MCPs, or platform policies, `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` has classified the source/tool and its approval status.
- The affected routes/screens and existing patterns are known.
- The data path is known: local, server, database, storage, external provider, AI, webhook, cron.
- The sync/async path is known for any heavy, external, AI, media, render, ingestion, sync, or long-running work.
- Legal/compliance/privacy risk is triaged.
- Security and abuse risk are triaged.
- The primary metric and failure/drop-off signal are named.
- The required analytics event(s), research/beta learning question, and support/recovery path are named for launch-critical flows.
- Approval gates are resolved or explicitly pending.
- Non-goals are named.

If any item is unknown but low-risk, document the assumption. If it is high-risk, ask before building.

## Feature Blueprint Template

```md
Feature:
Decision ID:
Owner:
Status: proposed | approved | implemented | verified | superseded

User / persona:
Problem:
Why now:
Business impact:
Success metric:
Failure/drop-off signal:
Non-goals:

Current context used:
Existing pattern to follow:
Affected routes/screens:
Affected components:
Affected API/server actions:
Affected stores/types/schemas:
Affected prompts/AI/tools:
Affected DB/migrations/RLS/storage:
Affected analytics/events:
Affected user needs/use cases/flow traces/journeys/blueprints:
Affect business/GTM/pricing/claims/support/cost:
Affected founder communication/social/public proof:
Affected queues/jobs/workers:
Affected dependencies/providers:
Affected external intelligence/tools:
Affected product language/naming/claims:
Affected docs:
Affected platforms/channels:
Affected design-system contract/tokens/primitives/shell:
Hybrid/shared-core impact:
Data mode / seed / fixture impact:

Privacy/legal/compliance triage:
Security triage:
Accessibility triage:
Performance/cost triage:
Scale/resilience triage:
Support/ops impact:
Continuity/recovery impact:
Vendor/subprocessor/tool impact:
IP/content/asset-rights impact:

Implementation plan:
QA plan:
Rollout/rollback:
Founder approval needed:
Open questions:
```

## Cross-Functional Checks

### Product / Business

- Who is this for?
- What user job does it complete?
- Does it support activation, retention, revenue, support reduction, learning, or fundraising?
- Is it part of the current beta/launch scope in `PROJECT_PROFILE.md`?
- Does it change pricing, plan value, trial limits, ICP, GTM, public positioning, or CTO handoff story?
- Does it create or change a public founder story, content claim, channel promise, case study, launch announcement, or founder support expectation?
- Does it require a decision record?
- Does it come from a repeated support/user feedback pattern, and should product/copy/onboarding absorb that support burden?
- Does it increase founder manual work, and is that acceptable for beta?

### UX / UI / Copy

- What is the visible entrypoint?
- What user need and approved use case does this serve?
- Which step-by-step flow trace does it improve?
- Which journey phase, user doubt, trust moment, or pain point does it address?
- Which backstage/API/DB/AI/support dependency in the service blueprint makes the UI state true?
- What is the next action?
- What are the empty/loading/error/degraded states?
- Does the same module/job look consistent elsewhere?
- Does copy explain the action without internal jargon?
- Does it reuse canonical product language from `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` or deliberately update it with a decision record?
- Does it introduce a new term, object, role, action, state, metaphor, public claim, or activation wording?
- Do visible copy, a11y labels, E2E labels, analytics events, support language, and docs name the same concept consistently?
- If a metaphor/brand term appears, is a plain-language fallback present where users must act?
- Does it respect project design tokens/icons, CSS vars, responsive layout, and reduced motion?
- Does it follow `.agent-os/DESIGN_SYSTEM_CONTRACT.md` for design source, tokens, primitives, shell/navigation, platform modes, and rebrand readiness?
- Does it introduce or depend on new content rules, iconography, illustration/media, data visualization, AI interaction states, or product patterns?
- Is a `product-language-review` needed before implementation?
- Is a `design-system-review` needed before implementation?
- Is a `UX_RESEARCH_AND_FLOW_CONTRACT` update needed before implementation?

### Frontend

- Routes/pages/layouts impacted.
- Shared components/primitives reused or intentionally extended.
- Client/server boundary justified.
- State ownership clear.
- Accessibility and keyboard/focus behavior defined.
- Mobile behavior defined.
- Platform behavior defined for desktop web, mobile web, PWA, native app, desktop app, extension, or API/headless when relevant.
- If native/iOS is planned, logic that should be portable is kept out of web-only pages/components where practical.

### Backend / API

- API route or server action exists only if needed.
- `enforceRouteSecurity()` or `applyRateLimitAsync()` first.
- Zod validation.
- Typed errors via `ERROR_CODES` / `ErrorCode`.
- Source metadata and mock/degraded fallback.
- CSRF/auth/authorization where relevant.
- No raw untrusted output rendered/stored/executed.

### Database / Storage / RLS

- Tables, migrations, indexes, policies, and ownership model defined.
- RLS matches user/business/client scope.
- Account export/delete, privacy, retention, and jurisdiction-specific impact checked.
- Storage quotas and signed upload/confirm flow checked when media is involved.
- Migration rollback or safe rollout defined.
- Demo/local fallback defined where required.
- Seed/fixture/staging data path defined where real-data QA is needed.
- If the feature affects AI creative outputs, decide whether it needs post-audit beta-real feedback/eval instrumentation.
- Backup/restore or data recovery impact checked for production/beta-critical data.

### AI / Prompt / Tooling

- User/external/provider data is sanitized and size-limited.
- Prompt schema is co-located.
- Output schema validation protects render/store/action boundaries.
- Model/cost/latency/degraded behavior documented.
- User-facing AI language explains source, freshness, uncertainty, approval/review, fallback/degraded state, and recovery where relevant.
- Provider fallback, provider/model metadata, fallback reason, cost estimate, latency, and voice/style preservation requirements are documented when fallback exists.
- Eval/regression case added for high-risk user-facing behavior.
- Tool/MCP permissions reviewed if a tool is involved.
- Vendor/subprocessor and fallback/removal path reviewed if new data leaves the product boundary.

### Security / Abuse

- Trust boundaries listed.
- Auth, authorization, CSRF, rate limits, SSRF/file/path checks reviewed.
- Prompt injection and indirect injection reviewed.
- Abuse/fraud/spam vectors reviewed.
- Secrets remain in env/config and are never copied into reports.

### Privacy / Legal / Compliance

This is not legal advice. It is a launch safety triage. Ask legal/founder approval when uncertain.

Check whether the feature:

- collects, stores, analyzes, exports, deletes, or shares personal data;
- touches regulated jurisdictions, minors, sensitive data, creator/customer/client audiences, team members, or public profiles;
- adds cookies, analytics, tracking, email, notifications, referrals, or marketing attribution;
- sends data to AI providers, MCPs, external APIs, QA vendors, email providers, billing providers, storage/CDN, or analytics tools;
- changes privacy policy, terms, consent, unsubscribe, data retention, account export/delete, or subprocessor assumptions;
- creates automated decisions, recommendations, rankings, scores, or profiling visible to users;
- handles payments, invoices, taxes, refunds, or subscription management;
- uploads, transforms, embeds, or redistributes user media/copyrighted content.
- changes ownership, labeling, exportability, or sharing of AI-generated outputs, user media, stock assets, imports, reports, public profiles, or brand/client assets.

If yes, document:

- data categories,
- purpose,
- legal/consent basis hypothesis,
- retention/deletion behavior,
- user rights impact,
- third-party recipients/subprocessors,
- cross-border transfer risk,
- docs/legal pages to update,
- founder/legal approval needed.

### Continuity / Recovery

- Does the feature create or mutate production/beta-critical data?
- Does it depend on a single vendor, MCP, AI provider, env var, cron, webhook, storage bucket, or queue?
- Is rollback enough, or do we also need restore/backfill/replay?
- Are RTO/RPO, backup source, restore procedure, and owner clear for the touched data path?
- Is the failure mode visible to support and monitoring?

### Scale / Resilience / Operability

Use `.agent-os/SCALE_AND_RESILIENCE_CONTRACT.md` when the feature touches AI, external data, scraping/API providers, media/render/transcription, sync/ingestion, queues/workers, billing/auth mutations, storage, high-traffic surfaces, or launch-critical flows.

- Is the action interactive light, interactive AI, external data fetch, heavy AI analysis, media/render, sync/ingestion, or billing/auth mutation?
- Does it run inside the request? If yes, what is the p95 latency cap and timeout?
- Should it be queued or moved to a worker/service?
- Where is job state persisted?
- Is the operation idempotent across retries?
- What degrades first under provider failure or peak demand?
- Which feature flag or kill switch can pause the path?
- What cost limit applies by plan/user/day?
- What observability connects user action -> request -> AI/provider call -> job -> DB write -> cost -> visible outcome?

### Analytics / Cost

- Event names and properties follow `DATA_ANALYTICS_CONTRACT.md`.
- Events map to use-case ID, flow ID, journey stage, and decision ID when they validate UX/business/product bets.
- PII classification is explicit.
- Activation/failure metric is measurable.
- AI/provider/storage cost is bounded or monitored.
- Business dashboard/support loop knows how to interpret the signal.
- Expensive features include cost per action, plan limit/quota, cache/reuse strategy, abuse control, and kill switch.

### External Intelligence / Tooling

Use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` when the feature uses or depends on Mobbin/Figma/reference products, MCPs, browser agents, analytics/replay, AI eval/observability, security scanners, mobile/app-store tooling, or any new external tool.

- Tool/source status is `core`, `approved-read`, `approved-write`, `candidate`, `quarantine`, `deprecated`, or `not-needed`.
- Source/maintainer, docs/repo, version/date, auth, data touched, read/write capability, cost, privacy/legal/subprocessor impact, security/supply-chain risk, overlap, fallback/removal path, and approval gate are recorded.
- Mobbin/reference use records pattern principle and project adaptation only; no copied proprietary assets, screenshots, layouts, or copy.

### QA / E2E / Accessibility

- Unit/integration tests cover contracts and edge cases.
- Playwright covers critical user journey when user-facing.
- Interaction inventory updated when new controls appear.
- Desktop/mobile screenshots for important UI.
- Axe/keyboard/focus/touch target checks for important UI.
- Manual gates for OAuth, billing, destructive, email, external provider, upload, render, production monitors.

### Docs / Decision Sync

- Docs are updated only after code/screen behavior is verified.
- Tech docs updated when routes/API/DB/prompts/features change.
- Biz docs updated when pricing, GTM, ICP, revenue, ops, support, capital, or founder story changes.
- Decision record updated when a durable product/business/technical choice changes.
- Old docs/artifacts are marked historical/superseded when needed.

## Definition Of Done

A feature is done only when one of these is true:

1. **Verified and documented:** code, screen, API/DB, tests, metrics, docs, and decision record agree.
2. **Scoped/hid:** incomplete or risky parts are hidden, feature-flagged, manual-gated, or documented as future/internal.
3. **Accepted risk:** founder explicitly accepts the gap with owner, review date, and reversal trigger.

## Automatic Red Flags

Stop and ask before continuing when:

- the feature changes pricing, legal, ICP, GTM, auth, billing, production data, RLS, public claims, or launch scope;
- the feature changes founder story, social-channel promise, public proof, testimonials/case studies, launch narrative, or investor/CTO communication without founder approval;
- a UI action has no backend/data path but appears real;
- a backend/API/DB capability has no owner surface or classification;
- docs claim a feature is active but screen/code evidence disagrees;
- AI output can trigger writes/actions without validation;
- personal data leaves the product boundary for a new provider/tool/vendor;
- the feature creates new support burden without an owner.
- the feature touches beta-critical data but has no restore/backfill/rollback story;
- the feature puts heavy AI, scraping, render, ingestion, sync, or media work in a user-blocking request without timeout, degraded UI, queue decision, and cost gate;
- a provider fallback exists but generated outputs do not record provider/model/fallback reason/cost/source metadata;
- user-facing naming/copy introduces metaphor-only labels, public claims, AI authority, or new category language without product-language review and founder approval when needed;
- a new vendor/tool/subprocessor touches user/client/product data without a registry row and approval status;
- a content/AI/media feature changes ownership, export, import, publication, or redistribution rights without an IP/content-risk note.

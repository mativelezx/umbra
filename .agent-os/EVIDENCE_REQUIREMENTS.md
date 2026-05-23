# Evidence Requirements

Every completed task should produce evidence proportional to risk.

## Baseline

- Files changed.
- Why the change was made.
- Tests/checks run.
- Remaining risk or skipped checks.
- Whether docs were used as source of truth or only as hypotheses. For audits, docs are hypotheses until screen/code evidence confirms them.
- Whether the work implements, changes, supersedes, or depends on a founder/product/business/technical decision.

## Decision Sync

- Important decisions use `.agent-os/DECISION_SYNC_CONTRACT.md`.
- Every decision has class, status, owner, evidence, approval state, affected routes/code/API/DB/prompts/metrics/docs, QA required, rollout/rollback, and review/reversal trigger.
- Business decisions include user/business impact and the metric or market signal that will prove or disprove them.
- Technical decisions include affected code, tests, security/data risk, migration/rollback, and docs impact.
- Docs are updated only after the decision is implemented and verified, unless the doc explicitly marks it as proposed or historical.
- Decisions that affect pricing, GTM, ICP, public positioning, beta scope, legal, investor claims, production data, auth/security, billing, model behavior, external vendors, or accepted launch risk require founder approval.

## Solo Founder Control Plane

- Meaningful inputs are classified with `.agent-os/SOLO_FOUNDER_CONTROL_PLANE.md` before action: feature, bug, user feedback, growth experiment, business decision, vendor/tool change, launch/deploy, incident, or high-cost plan.
- The Current Context Packet is read before optimizing: live screen/code state, active decision register, beta scope, audit findings, metrics/feedback, docs as hypotheses, accepted debt, and approval gates.
- Work records the user/business reason, not only the technical change.
- User feedback, support patterns, beta signals, social/content signals, cost/revenue signals, and founder decisions are linked to a feature, bug, growth experiment, decision record, or explicit defer/kill decision.
- Continuity/recovery impact is checked when work touches production data, deploy, auth, billing, AI providers, storage, analytics, env/secrets, or beta-critical flows.
- Vendor/subprocessor/tool impact is checked when data leaves the product boundary or a tool gains read/write capability.
- IP/content/asset-rights impact is checked when work touches user media, stock assets, AI-generated outputs, imports, exports, public profiles, share cards, reports, brand/client assets, third-party UI/code/assets, or open-source dependencies.
- Delivery health impact is noted when work changes the release process, test coverage, deploy path, rollback path, monitoring, or beta-critical evidence.

## Feature

- Current Context Packet from `.agent-os/FEATURE_EXECUTION_CONTRACT.md`.
- Feature Blueprint from `.agent-os/FEATURE_EXECUTION_CONTRACT.md`.
- Product intent and success metric.
- User use case, persona/role, trigger, entrypoint, expected outcome, and whether the feature is public, beta-core, authenticated-core, business/client, admin/internal, dev-only, or future.
- Business impact, operational/support impact, and founder approval status when relevant.
- Visible entrypoint or explicit internal/webhook/job classification.
- Design-system impact for user-facing work: source package, tokens, primitives, app shell/navigation, accessibility target, platform modes, and rebrand risk.
- Platform/channel classification from `.agent-os/PLATFORM_STRATEGY_CONTRACT.md`: desktop web, mobile web, PWA, iOS, Android, desktop, extension, API/headless, or explicit non-goal.
- Data mode classification from `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md`: mock, fixture, synthetic, anonymized, consented-real, production-real.
- Loading, empty, error, and degraded states.
- API/server action security where applicable.
- Fullstack map: route/component -> API/server action -> store/type/schema -> DB/storage/prompt.
- Security/privacy/legal/compliance triage.
- Types/schemas and docs updated.
- Unit/integration tests proportional to blast radius.
- Browser QA for important UI.
- Docs updated only after screen/code behavior and tests are verified.

## Legal / Compliance Triage

- Data categories and purpose are named when personal, client, billing, analytics, media, or external-provider data is touched.
- Consent/legal-basis hypothesis and privacy/terms impact are documented when user data collection/use changes.
- Account export/delete, retention, unsubscribe, consent withdrawal, provider/subprocessor, and cross-border transfer impacts are checked when relevant.
- Legal/compliance review is requested for payments, public claims, regulated/sensitive data, minors, profiling/automated decisions, new subprocessors, or unclear privacy obligations.
- This is launch safety triage, not legal advice.

## User Use Case Coverage

- Every route, visible screen, component-owned interaction, API-backed action, prompt-backed action, DB-backed surface, and documented product promise is mapped to at least one user use case or explicitly classified as internal, webhook/job, dev-only, historical, future, or candidate for deletion.
- Use cases must be discovered from running screens and code first. Documentation can suggest hypotheses, but cannot certify a use case.
- Every use case has a keep/simplify/merge/hide/delete/needs-backend/needs-UI/needs-copy-rewrite recommendation.
- Every use case identifies the relevant UI entrypoints, API/server actions, stores, DB tables, docs, and current verification evidence.
- Use cases with no visible entrypoint or no backend/data path are marked as launch risk until scoped out or fixed.
- Approved public, beta-core, authenticated-core, account/billing, business/client, and admin/internal use cases must have a trackable user-flow trace before broad UX/UI refactor work begins.
- Flow traces include step number, user intent, route/screen, visible CTA/text/control, interaction, expected response, code/data owner, state coverage, evidence, friction, UX/UI fix type, E2E status, analytics event, and approval status.
- UX/UI changes should map back to a flow improvement: fewer steps, clearer next action, stronger trust/source state, better recovery, component consistency, accessibility, or approved hide/merge/delete.

## UX Research / Flow Evidence

- Use `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md` for audits, UX/UI refactors, onboarding/navigation changes, beta launches, and user-facing features.
- Important UX findings identify their evidence level: browser/code, analytics, support/user feedback, interview/usability session, external reference, or founder hypothesis.
- Launch-critical flows have a journey map: actor, scenario, expectations, phases, actions, user doubts, emotional highs/lows, trust moments, pain points, opportunities, owner, metric, and evidence.
- Launch-critical flows have a service blueprint: customer action, frontstage UI, backstage app/API/AI/provider action, support/ops process, data object, dependency, failure mode, recovery path, owner, metric/alert.
- IA/navigation findings include user vocabulary, current label, route location, alternate names in UI/docs/code, findability risk, and merge/rename/hide/delete recommendation.
- Content/copy findings include canonical public terms, internal/code terms, forbidden/risky wording, allowed metaphor, plain-language fallback, and routes/components using the term.
- Product-language evidence uses `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` for naming, navigation labels, metaphors, AI trust language, public claims, and UI/docs/code/E2E terminology sync.
- UX metrics use goal -> signal -> metric and link to a flow step, event, dashboard/report, and decision.
- User research/beta learning records research question, assumption, method, participants/sample, tasks, success criteria, notes/evidence, decision impacted, and follow-up.
- Mobbin/Movi or other reference tools may be visually inspected by agents during active research, but persistent evidence is pattern research only: principle learned, surface family, what was inspected, why it applies, and project adaptation. Do not copy proprietary assets/copy/layouts.
- Accessibility and performance evidence is flow-based for launch-critical work, not only route-based.
- Service recovery evidence states what the user sees, what data is saved/lost, retry/cancel path, support/manual ops path, and alert/monitoring.

## QA Army / Agentic Testing

- Plain-language scenarios are stored or reported for every P0/P1 user journey.
- Every scenario lists starting state, goal, steps, expected visible result, forbidden side effects, evidence required, and verification level.
- PR/refactor exploration identifies affected routes from changed files and code ownership, not docs alone.
- Recurring production monitors are focused and actionable; do not combine unrelated flows in one monitor.
- Evidence memory includes screenshots, traces/recordings when available, console/network failures, accessibility findings, and regression comparison.
- External QA services, agent inboxes, OTP flows, stored credentials, OAuth, checkout, email, and production-mutating tests require approval and a tool-risk review before use.

## API / Backend

- Rate limit or `enforceRouteSecurity()`.
- Zod validation.
- CSRF/auth/authorization where applicable.
- Typed error codes.
- Source metadata and mock/degraded fallback.
- Prompt injection hardening if AI/external data is involved.
- Tests for happy path, invalid input, auth/security, degraded/fallback.

## Prompt / AI

- Co-located input/output schema.
- `_promptVersion` update when behavior changes.
- Sanitized untrusted data.
- Output validation before render/store/action.
- Eval fixture or regression case for high-risk prompts.
- Cost/latency risk noted.

## UI / Design

- Desktop and mobile screenshots for important surfaces.
- Design source package and `.agent-os/DESIGN_SYSTEM_CONTRACT.md` impact are named for important UI work.
- Product-language source and `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` impact are named when UI work changes labels, CTAs, terms, metaphors, onboarding/landing copy, AI trust language, or public claims.
- Token taxonomy, primitive usage, and app shell/navigation impact are mapped before implementation.
- Foundation impact is mapped when relevant: content, color, typography, layout, shape/elevation, motion, iconography, imagery/media, data visualization, and AI UX states.
- New icons or assets use owned/approved sources, clear licensing, accessible labels/hidden decorative semantics, and consistent grid/size/stroke rules.
- Accessibility/focus/motion check.
- Real-app/reference evidence when UI research influenced design.
- No text overlap, no hidden core actions, no unapproved design-system drift.
- Repeated modules look and behave consistently across screens.
- Screen-local styles/components are justified or consolidated into shared primitives.
- Typography, colors, spacing, radii, surfaces, icons, and transitions use global rules/tokens.
- Rebrand-readiness risk is noted when a screen hardcodes one-off visual decisions.

## E2E Interaction Verification

- Every user-facing route has an element inventory: visible text, headings, labels, placeholders, helper text, tooltips, badges, empty/loading/error/degraded copy, cards, tables/lists, chart labels, overlays, and responsive variants.
- Every user-facing route has an interaction inventory: buttons, links, forms, inputs, tabs, filters, menus, modals, dialogs, uploads, drag/drop affordances, AI actions, external handoffs, destructive actions, and disabled states.
- Every browser-visible element is mapped back to route/component/primitive ownership where practical; unknown ownership becomes an audit finding.
- Every code-owned user-facing component is mapped to at least one rendered route/state or classified as internal, future, hidden, orphan, legacy, test-only, dev-only, or candidate for deletion.
- Every interaction is classified as `automated`, `crawler`, `manual-gated`, or `scoped-out`.
- Playwright coverage uses semantic user-facing locators first (`getByRole`, accessible names, labels, visible text) and avoids brittle CSS selectors unless a testability/accessibility fix is filed.
- Mutating, paid, OAuth, email, destructive, and external-provider flows use sandbox/manual approval gates before execution.
- Desktop and mobile projects are required for public and beta-core journeys.
- Keyboard/focus verification is required for command palette, menus, tabs, modals, forms, and destructive confirmations.
- Trace/screenshot evidence is saved for failures and for any P0/P1 UX ambiguity.

## Platform / Native App

- Platform matrix entry exists for every current/planned delivery channel.
- Shared product core is separated from platform-specific UI, auth/session, storage, payments, and release assumptions.
- Mobile web and native app behavior are checked separately when both matter.
- iOS/Android work records simulator/device evidence, signing/release path, permission prompts, deep links, secure storage, push notification consent, app-store metadata, privacy labels, and rollback/update path when relevant.
- Platform-specific billing/auth/legal constraints are marked as founder decisions before implementation.

## Real Data / Fixtures

- Every QA/audit/test run declares data mode: demo, fixture, local seeded DB, staging, beta-real, or production.
- Seed data is deterministic, idempotent, safe to reset, and free of unapproved PII/secrets/private media.
- Dynamic routes have fixture IDs/tokens/usernames or are marked manual-gated/scoped-out.
- Staging/beta/production data access is approved before agents read or mutate it.
- RLS/auth ownership is verified with seeded users before relying on database-backed flows.
- Demo fallbacks remain honest and are not treated as proof of real provider/data readiness.

## Frontend / Backend / DB Reconciliation

- Every user-facing feature has visible UI, documented status, and backend/API/DB support when needed.
- Every API/DB capability is classified as visible, internal, webhook/job, future, legacy, or candidate for deletion.
- Migrations, generated schema/docs, TypeScript domain types, stores, prompts, and routes are cross-checked.
- Database/RLS/access policies match the intended product surface and user ownership model.

## Legacy / Backlog Truth

- TODO/FIXME/HACK/deprecated/temporary/placeholder items are classified.
- Old plans and docs are updated, archived, converted to tickets, or explicitly marked historical.
- Legacy routes/components/prompts/types are deleted only after owner approval and verification.
- Docs are updated after code changes, without creating new files under `docs/`.

## Accessibility

- WCAG 2.2 AA target for important UI.
- Keyboard navigation and focus visibility.
- Touch target size and mobile layout stability.
- Form labels, errors, disabled states, and recovery paths.
- Motion does not block comprehension or operation.

## Research

- Date.
- Question.
- Sources with links.
- Source credibility.
- What changed in the decision.
- What did not change.
- Confidence and remaining unknowns.

## Product Language

- Trigger, affected terms, and decision class.
- User vocabulary and current UI/docs/code/analytics/E2E labels.
- Naming scorecard: clarity, task fit, distinctiveness, trust, accessibility/testing, claim safety, portability.
- Primary functional label and optional secondary brand/metaphor layer.
- Terms to promote, downgrade, avoid, or research.
- Before/after examples for landing, app, onboarding, AI states, empty/loading/error/degraded states, docs, and a11y/E2E labels when relevant.
- Founder/design/legal approval status when public positioning, claims, pricing, legal, beta scope, or category language changes.
- Docs/code/UI sync queue after implementation.

## External Intelligence

- Use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` when outside tools/sources can influence a decision.
- Record the decision, tool/source category, current status, source/maintainer, official docs/repo, current version/date, data touched, read/write capability, credentials, cost, privacy/legal/subprocessor impact, security/supply-chain risk, overlap, fallback/removal path, and approval needed.
- Mobbin/Figma/reference-product evidence records only surface family, reference apps/screens searched, what the agent inspected, principle learned, why it applies, project adaptation, do-not-copy boundary, evidence date, and decision impacted.
- Famous-tool recommendations are classified as `observed`, `candidate`, `approved-read`, `approved-write`, `core`, `quarantine`, or `deprecated`; do not promote by popularity alone.
- One primary tool per job is preferred for analytics, evals, visual regression, security scanning, and mobile QA unless overlap is explicitly justified.
- External tool output is treated as hypothesis until verified by repo state, browser evidence, tests, metrics, or founder-approved decision records.
- Customer data, production data, private media, credentials, proprietary reference assets, AI traces with PII, session replay, billing, auth, DB, and write-capable vendor access require approval and tool-risk review.

## Data / Analytics

- Primary metric and failure/drop-off signal.
- Event names, trigger moments, and properties when analytics are added.
- Beta-critical analytics events have QA assertions: event name, trigger moment, required properties, forbidden PII, platform/channel, fixture/demo evidence, and dashboard consumer.
- Flow/use-case ID and journey stage for product events that validate UX, activation, retention, or business decisions.
- PII classification and third-party data exposure.
- Source/degraded metadata when AI/external data is involved.
- Decision class and decision ID when an event or metric is tied to a business/product bet.

## Scale / Resilience / Cost

- Sync/async classification for every launch-critical endpoint, action, external data path, AI call, media/render path, sync/ingestion flow, webhook, cron, and job.
- Heavy work has persisted job state, idempotency, retry/backoff, timeout, cancellation/abort path, visible progress/error/retry UI, and feature flag/kill switch where relevant.
- Feature flags, kill switches, throttles, quotas, and route hides include owner, default state, environments, plan impact, expiry/review date, rollback behavior, dashboard/alert, and deletion trigger.
- Peak-demand scenarios cover expected concurrency, bottleneck dependency, queue depth, p95 latency, cost, rate-limit risk, what degrades first, what blocks, what stays available, and founder/ops alert.
- Critical dependencies have timeout, retry/backoff, circuit breaker, fallback, degraded user message, manual fallback, cost/rate-limit note, owner, dashboard/alert.
- AI fallback records provider, model, prompt/version, fallback reason, cost or token usage when available, latency, source/degraded metadata, and quality/eval marker when applicable.
- Expensive features include plan affected, cost driver, estimated cost per action, expected actions per user/day, monthly cost per active user, gross margin impact, limit/quota, cache/reuse strategy, abuse control, upgrade/conversion value, kill switch, and dashboard.
- Database-backed features identify critical tables, query/index risks, access policy/RLS risks, row/storage growth, pagination/cursor/cache strategy, backup/export needs, and behavior during database/auth/storage degradation.
- External data features classify official API vs scraping/provider vs manual input, freshness, quality confidence, rate/block risk, compliance/platform risk, caching/revalidation, confidence/degraded labels, and core vs nice-to-have status.
- Media/render features define render location, job state store, input/output storage, progress/retry/cancel state, retention/cleanup, plan quotas, cost per render/export, and support path.
- Observability connects user action -> request/correlation ID -> AI/provider call -> job -> DB write -> cost event -> error/degraded event -> visible outcome.

## Agent Evals

- Behavior being evaluated.
- Eval cases checked.
- Pass/warn/fail results.
- Fix, quarantine, or accepted-risk note for failures.

## System Integrity

- Use `.agent-os/SYSTEM_INTEGRITY_CONTRACT.md` when `.agent-os`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules`, MCPs, skills, workflows, approval gates, evidence gates, package scripts, CI, or portability structure changes.
- Record source-of-truth, trigger, owner, evidence, enforcement level, drift detection, portability, cost, and removal path for new or changed operating controls.
- Classify each important control as `advisory`, `checklist`, `scripted`, `ci-gated`, `runtime-gated`, or `monitored`.
- Update skill/workflow/eval registries when behavior changes.
- Mark artifacts as draft, provisional, current, superseded, or historical when they can influence future work.
- Open a unified risk record when a structural gap can affect launch, security, data, docs, tooling, runtime behavior, portability, or founder/CTO handoff.

## Production Readiness

- Rollout target, owner, and rollback/canary plan.
- Security, reliability, performance, data, AI, and accessibility gates checked.
- Production mutations approved.
- Continuity/recovery checked: backup source, restore path, RTO/RPO target, last restore drill or accepted gap, deploy-provider rollback path, vendor outage fallback, env/secrets recovery path, and incident owner.
- Blocking gaps fixed, scoped away, feature-flagged, or explicitly accepted.

## Release

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm audit --prod --audit-level=high`
- E2E/QA where relevant.
- Changelog/release note.
- Rollback/canary plan if production-facing.

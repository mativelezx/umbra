# Workflow: Extreme End-to-End Audit

Use before beta/production launch, executive/technical handoff, major refactor, or when an existing product may have disconnected UX, stale docs, hidden data/security gaps, weak E2E coverage, or unclear business decisions.

Read `.agent-os/PROJECT_PROFILE.md` first. Project-specific workflows may add domain details, but they must not weaken this baseline.

## Stance

- Running screens and code are evidence.
- Docs are hypotheses until reconciled.
- User use cases come from screens/code/API/DB first, then docs.
- Founder/product/business/technical decisions are first-class artifacts.
- Fixes happen after the full audit and approved execution plan, unless a P0/P1 blocker is approved for immediate fix.

## Scope

Cover:

- Product map, routes, navigation, IA, and visible user flows.
- Complete user use-case catalog with keep/simplify/merge/hide/delete/needs-backend/needs-UI/needs-copy-rewrite recommendation.
- Decision sync across product, business, UX, pricing, GTM, capital, architecture, AI, security, ops, accepted debt, code, screens, metrics, and docs.
- Business/GTM architecture from `.agent-os/BUSINESS_GTM_CONTRACT.md`: ICP, anti-ICP, wedge, activation, retention, pricing/packaging, channels, support model, claims, cost/margin posture, business metrics, and founder decisions.
- Founder communication architecture from `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`: founder data package, personal-brand vs product-brand roles, channel strategy, content pillars, public proof/claims, audience/ICP bridge, launch story, reference-founder research, and feedback-to-product loop.
- Product-language architecture: category language, top-level labels, core objects/actions, metaphors, AI trust language, public claims, docs/code/UI/E2E terminology drift, and naming scorecards.
- UI/UX consistency, copy, design-system drift, design source-of-truth, token taxonomy, designer handoff, app shell/navigation, empty/loading/error/degraded states, accessibility, responsive behavior, and rebrand readiness.
- Frontend/backend/database reconciliation: code without UI, UI without backend, DB without product surface, product promises without implementation.
- API/security/prompt-injection/source metadata/mock fallback/typed errors, threat-model/attack-path rows, and API contract stability for future clients.
- AI prompts, schemas, output validation, eval gaps, cost/latency/degraded behavior.
- Legacy/TODO/backlog truth.
- Playwright/browser QA, interaction inventory, accessibility, screenshots/traces, and production monitors.
- External intelligence stack: current docs, reference products, Mobbin/Figma stance, famous tool candidates, analytics/evals/security/mobile/browser tooling, and promotion/quarantine decisions.
- Agent OS/repo hygiene: portable core vs project overlay vs local runtime/cache vs historical artifacts, plus runtime skill/eval freshness.
- System integrity: source-of-truth, triggers, evidence, enforcement level, artifact lifecycle, unified risks, automation opportunities, and portability boundaries.
- Analytics, analytics QA assertions, cost, beta support loop, founder operating cadence, delivery health, and feedback loop.
- Scale/resilience: sync/async boundaries, peak demand, queues/workers/jobs, external dependency resilience, AI fallback, cost governance, feature-flag/kill-switch lifecycle, observability, and media/render operability.
- Backup/restore, RTO/RPO, rollback, vendor outage fallback, incident runbook, and handoff recoverability.
- Vendor/subprocessor/tool registry, IP/content/asset-rights assumptions, open-source license exposure, and external QA/MCP/data-sharing risk.

## Phases

1. **Freeze and evidence capture**: branch, dirty state, env availability, running processes, route/API/doc/test inventory, docs trust reset, decision trust reset, QA evidence sources, external intelligence reset, repo versioning/portability reset, runtime/skill-index reset.
2. **Product/use-case/flow inventory**: crawl screens/routes, map flows/actions/APIs/stores/DB/docs, define activation path and beta-critical journeys, classify orphan/unfinished surfaces.
3. **Decision sync**: inventory implemented/documented/implicit decisions, drift, approval gates, affected code/API/DB/prompts/metrics/docs, reversal triggers.
4. **Business/GTM, founder communication, design system, product language, and UX/copy**: business/GTM contract, founder communication contract, ICP/activation/pricing/channel/claim checks, founder story/social/proof/feedback checks, design source package, token taxonomy, primitives, shell/navigation, product-language contract, naming scorecards, terminology drift, repeated module consistency, typography, colors, layouts, states, AI trust language, accessibility, copy comprehension, designer handoff, rebrand readiness, and reference-backed design principles through the external intelligence contract.
5. **Architecture/API/data/security**: API route pattern, auth/RLS/access policies, migrations/schema drift, secrets/env, dependencies/MCPs, prompt injection, data ownership, threat-model/attack-path table, and API contract stability/versioning.
6. **AI/prompt quality**: prompts, schemas, eval gaps, unsafe output boundaries, model/provider assumptions, cost/latency/degraded behavior.
7. **Scale/peak demand/cost governance**: sync/async matrix, dependency resilience, queue/job lifecycle, provider fallback, cost-by-plan, feature flags/kill switches with lifecycle/owner/expiry, observability and manual ops.
8. **Legacy/docs/backlog truth**: TODO/FIXME/HACK/deprecated/temporary/placeholder, stale plans, generated docs, docs drift, archive/delete/include decisions.
9. **E2E interaction verification**: every visible route/control classified as automated, crawler, manual-gated, or scoped-out; desktop/mobile for public and beta-core flows.
10. **Observability/analytics/beta ops**: monitoring, dashboards, support loop, feature flags/hides, delivery health, founder weekly/daily operating loop, analytics QA assertions, and analytics/eval/tool promotion decisions.
11. **Continuity/vendor/IP risk**: backups, restore, RTO/RPO, rollback, vendor fallbacks, incident runbook, subprocessor/tool/IP/content-rights watchlists.
12. **System integrity**: audit contract coherence, enforcement level, artifact lifecycle, unified risks, Agent OS coherence check, automation backlog, and portable-core/project-overlay boundaries.
13. **Premortem**: assume launch/handoff failed 6 months from now; identify likely/dangerous failures, hidden assumption, revised plan, checklist.
14. **Handoff readiness**: setup, architecture, deploy, env/secrets, docs, known debt, risky modules, open decisions, test gates.
15. **Prioritized execution plan**: P0 launch blockers, P1 beta quality, P2 handoff debt, P3 later, each with evidence and approval status.
16. **Production readiness**: run `.agent-os/PRODUCTION_READINESS.md`; ship only if fixed, hidden/flagged/scoped out, or accepted by founder.

## Final Deliverables

- Audit report in `artifacts/audits/`.
- Route/flow map.
- Complete user use-case catalog.
- Use-case critique and simplification matrix.
- Design-system drift matrix.
- Design source/token/primitives/shell handoff matrix.
- Component consolidation plan.
- UX/UI/copy findings.
- Product-language/naming scorecards, before/after proposals, and terminology drift map.
- Code/UI/API/DB reconciliation tables.
- Security/API/data findings.
- Threat-model/attack-path table.
- API contract stability/versioning matrix.
- Legacy/TODO/backlog truth table.
- Docs drift list.
- Founder decision register and business/product/technical drift matrix.
- Business/GTM audit: ICP/anti-ICP, wedge, activation, retention, pricing/packaging, channel, support, cost/margin, public claims, and business metrics.
- Founder communication audit: founder data package, founder/product brand roles, social channel matrix, content pillars, public proof/claims, audience/ICP mismatch, launch story, owned audience path, and feedback-to-product loop.
- Exhaustive E2E interaction verification matrix.
- Playwright traces/screenshots for critical failures.
- Premortem report.
- Scale/peak-demand/cost-governance report.
- Dependency resilience matrix.
- AI provider fallback matrix.
- Queue/worker/job lifecycle matrix.
- Observability/analytics/beta-ops checklist.
- Analytics QA assertion matrix.
- External intelligence stack report.
- System integrity report.
- Agent OS coherence-check result or script backlog item.
- Solo-founder operations checklist.
- Delivery health baseline.
- Continuity/recovery matrix.
- Vendor/subprocessor/tool watchlist.
- IP/content/asset-rights watchlist.
- Handoff checklist.
- Prioritized execution plan.
- Production readiness decision.
- Agent OS versioning/portability checklist.
- Runtime skill refresh/eval checklist.

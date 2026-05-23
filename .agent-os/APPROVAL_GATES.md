# Approval Gates

Agents should act autonomously for low-risk implementation details, but ask the founder before irreversible or business-sensitive decisions.

## Always Require Approval

- Production deploys, rollback, database migrations, destructive data actions.
- Remote/staging/production database seeds, real-data imports, data resets, or granting agents access to real user/customer/client/media data.
- Billing, pricing, plans, checkout, invoices, refunds, or paid account changes.
- New delivery platforms, app-store submissions, TestFlight/external tester distribution, native signing credentials, push notifications, native permissions, deep links, or on-device sensitive storage.
- OAuth scopes, provider app review, token storage, service-role usage.
- MCP additions, tool permission changes, or new external services.
- Promoting external intelligence tools from `candidate`/`quarantine` to `approved-write` or `core`, or connecting tools to private design files, session replay, AI traces, source code scans, customer data, production logs, billing, auth, DB, deploy, or app-store accounts.
- External QA services, agent-runner credentials, temporary test inboxes, OTP flows, or production monitoring that touches authenticated/productive data.
- Sending customer/user data to third-party tools or models.
- Prompt/model changes that affect user-facing Tier 1 outputs.
- AI provider fallback changes for Tier 1 outputs, provider-agnostic routing, cost caps, model routing, or quality tradeoffs.
- Queue/worker/render/media architecture changes that affect production latency, cost, durability, retries, or user-visible output.
- Kill switches, feature flags, throttles, quotas, or plan limits that can block or degrade user-facing features.
- Security exceptions, weakened auth, weakened CSRF/rate limits, RLS changes.
- Public positioning, legal/privacy terms, launch announcements, investor-facing claims.
- Top-level naming, navigation labels, product category language, brand/metaphor system, activation wording, or AI authority/trust language that changes how users understand the product.
- UX system decisions that affect identity or funnel behavior: default theme, theme toggle policy, banned-word list, primary CTA wording, pricing tier copy, diagnostic/result gate pattern, chat surface placement, workspace switcher exposure, mobile editor/read-only strategy, and score/status vocabulary.
- ICP, GTM strategy, beta scope, feature inclusion/exclusion, accepted launch risks, or founder/CTO handoff claims that materially affect the business.
- New data categories, new subprocessors/vendors, consent model changes, retention/export/delete changes, profiling/automated decisions, emails/notifications, tracking/cookies, or compliance/legal uncertainty.
- Marking demo/mock behavior as production-real behavior or replacing demo fallbacks with real provider/data flows.
- Large refactors, architecture changes, or cross-module rewrites.

## Usually Require Approval

- New feature scope above the original request.
- New dependencies.
- New external intelligence tools, scanners, reference libraries, analytics/eval platforms, or browser/mobile agents, even if read-only.
- New persistent data fields.
- New analytics events tied to business interpretation.
- New cost/operability events tied to pricing, margin, provider usage, or plan limits.
- Visual direction changes that affect brand/product identity.
- Naming/copy changes that affect important user flows, public pages, onboarding, pricing/plan perception, or documented product objects.
- Internal decision records that mark a previously proposed business/product/technical choice as approved.
- Structural Agent OS changes that make advisory controls look enforced, remove an approval/evidence gate, or change portable-core behavior for future projects.

## No Approval Needed

- Narrow bug fixes with tests.
- TypeScript/lint fixes.
- Local copy edits consistent with existing approved voice.
- Internal docs updates that record already-approved decisions.
- Adding tests for existing behavior.

## Decision Records

Use `.agent-os/DECISION_SYNC_CONTRACT.md` for decisions with cross-functional impact. A decision can be drafted without approval, but cannot be marked `approved` when it crosses an approval gate.

## Approval Prompt Format

```md
Decision:
Why approval is needed:
Options:
Recommendation:
Risk if wrong:
Evidence available:
```

Ask for one decision at a time when possible.

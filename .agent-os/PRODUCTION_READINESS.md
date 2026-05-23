# Production Readiness

This checklist is the release gate for production-facing work. It complements `EVIDENCE_REQUIREMENTS.md` and the gstack ship/deploy skills.

## Operational

- Clear owner and rollback path.
- Solo-founder context classified with `SOLO_FOUNDER_CONTROL_PLANE.md`: feature, launch, incident, vendor/tool change, growth experiment, user feedback pattern, or founder decision.
- Platform/release target is explicit: desktop web, mobile web, PWA, iOS, Android, desktop, extension, API/headless, or scoped out.
- Feature flag, preview, or gradual rollout when blast radius is non-trivial.
- Incident channel/process known.
- Beta support loop defined when launching to test users.
- Focused production monitors defined for critical flows, with owner, alert channel, frequency, and rollback/triage path.
- Changelog or release note drafted.
- Docs updated after code/screen verification, without creating new files under `docs/`.
- App-store/TestFlight/internal-distribution gates are checked when the release target includes iOS/Android.
- System-integrity gates are checked when the release changes `.agent-os`, bootloaders, skills, workflows, MCP/tool registries, package scripts, CI, or reusable project structure.

## Continuity And Recovery

- Backup source and schedule are known for the database, storage/media, and critical generated/user data.
- Restore procedure is documented enough for the founder or CTO to execute.
- RTO/RPO target is recorded, or the founder accepts the gap before launch.
- Last restore drill date is recorded, or a beta blocker/risk note exists.
- Deploy-provider rollback path is known and has been tested on preview/staging when possible.
- Env/secrets recovery and rotation path is documented without exposing secret values.
- Critical vendor outage fallback exists for auth, database, AI provider, billing, email, analytics, storage/CDN, and deploy.
- Incident owner, communication channel, triage order, user-facing status/update path, and post-incident learning loop are known.
- CTO handoff packet includes setup, deploy, rollback, backups, secrets ownership, known risks, and production monitors.
- Artifact lifecycle is clear for handoff materials: current, provisional, superseded, or historical.

## Security

- API routes start with `enforceRouteSecurity()` or `applyRateLimitAsync()`.
- Production dependency audit has no unresolved high/critical vulnerabilities, or the gap is explicitly blocked/accepted with source, version, mitigation, and owner.
- Auth, CSRF, authorization, and RLS are explicit where applicable.
- Inputs are Zod-validated and untrusted AI/external data is sanitized.
- Typed errors use `ERROR_CODES` / `ErrorCode`.
- Secrets stay in env/config, never committed.
- Live-looking local credentials are rotated before sharing, handoff, or production launch.
- MCPs are read-only unless mutation was approved.
- Agents do not read or mutate beta-real/production-real data without explicit approval.

## Privacy / Legal / Compliance

- Personal/client/billing/media/analytics data categories and purposes are known.
- Privacy policy, terms, consent, unsubscribe, retention, export/delete, and subprocessor assumptions are current when touched.
- New vendors, QA services, AI providers, email providers, billing providers, analytics, storage/CDN, or external APIs have founder approval and tool/vendor risk review.
- Native app permissions, push notifications, on-device storage, app-store privacy labels, and platform-specific billing constraints are reviewed when applicable.
- User media, AI-generated outputs, imported platform data, stock assets, exports, public profiles/share cards, and third-party UI/code/assets have IP/content-rights assumptions recorded when touched.
- Automated recommendations, scoring, profiling, or AI-generated decisions are labeled, reversible, and do not create unsafe hidden actions.
- Legal/compliance uncertainty is either resolved, scoped away, or accepted by the founder with explicit risk.

## Reliability

- Mock/degraded fallback works without API keys.
- Source metadata is present for AI/external/degraded responses.
- Error, loading, empty, and degraded UI states are visible.
- Observability exists for production-impacting flows.
- Error, performance, and support signals have an owner and review cadence.
- QA evidence memory exists for P0/P1 flows: screenshots/traces/reports and known residual risks.
- Data mode is explicit for QA evidence: demo, fixture, local seeded DB, staging, beta-real, or production.
- Backward compatibility and migration path are clear.
- Launch-critical actions have a sync/async classification from `SCALE_AND_RESILIENCE_CONTRACT.md`.
- Heavy AI, external data, scraping, ingestion, render, media, transcription, and sync jobs do not rely on unbounded user-blocking requests.
- Queued/async work has persisted job state, idempotency, retry policy, timeout, cancellation/abort path, and visible progress/error/retry UI where user-facing.
- Critical vendors have timeout, retry/backoff, circuit breaker or kill switch, degraded state, owner, dashboard/alert, and fallback/removal path.

## Performance

- Production build/typecheck/lint/format pass.
- Avoid unnecessary client JS and broad `'use client'` boundaries.
- Caching/revalidation choices are intentional.
- Large media/assets are optimized or moved to appropriate storage.
- Core Web Vitals and browser QA are checked for important UI.
- Mobile web, simulator/device, or native performance evidence exists when the platform target requires it.
- Peak-demand scenarios are documented for waitlist spike, onboarding/profile analysis spike, AI generation spike, external data sync spike, media/render spike, and billing/auth spike when relevant.
- Public/beta-critical routes have p95 latency targets or accepted-risk notes.

## Analytics And Cost

- Activation event and time-to-first-value are defined.
- Waitlist, onboarding, first useful output, D1/D7 return, and beta feedback are measurable.
- AI cost per activated user and expensive routes are monitored or capped.
- Analytics events avoid PII and unredacted prompts.
- Delivery health is tracked at founder scale: change lead time, deployment frequency, change failure rate, failed deployment recovery time, escaped P0/P1 defects, restore drill freshness, and evidence freshness for beta-critical flows.
- Cost governance is defined by plan for AI, external data, render/media, storage, bandwidth, and worker time.
- Heavy-user abuse controls, cache/reuse strategy, quotas/limits, and kill switches are in place for expensive features.
- Founder/ops dashboard can identify top cost anomalies by feature/user/plan.

## AI-Specific

- Prompt/schema changes have an eval or regression case when high-risk.
- Cost and latency risk are named for AI-heavy paths.
- Model/provider assumptions are checked against current docs when relevant.
- Output schemas protect render/store/action boundaries.
- Provider fallback strategy is explicit for Tier 1 AI features: primary provider/model, fallback provider/model, quality eval, streaming/tool compatibility, voice/style preservation, and stored provider/model/fallback/cost metadata.

## Observability And Operability

- Beta-critical flows have traceability from user action -> request -> AI call -> external provider -> job -> DB write -> cost event -> visible outcome.
- Alerts or dashboards exist for provider failure rate, API p95 latency, queue depth, oldest job age, failed/retried jobs, AI cost/day, cost/user/plan, external data cost, render/storage/bandwidth cost, auth/billing failures, database errors/slow queries, degraded fallback rate, and activation drop-off.
- Feature flags or kill switches can disable fragile/expensive external-data, AI, render/media, and sync paths without taking down the whole app.
- Manual ops needed from the founder during beta are documented.

## Launch Decision

Ship only when each gap is one of:

- Fixed.
- Feature-flagged or scoped away.
- Accepted by the founder with a clear risk note.

# Scale And Resilience Contract

> CTO lens for peak demand, long-running work, external dependencies, AI fallback, cost governance, observability, and operability.

Use this contract for any feature, audit, launch, refactor, vendor change, AI/model change, ingestion/scraping flow, media/render pipeline, data sync, or architecture decision that can affect latency, concurrency, cost, availability, or handoff readiness.

## Principle

Do not let heavy work hide inside interactive requests.

Every production-facing workflow must define:

- what is synchronous,
- what is queued or async,
- what can degrade,
- what can be retried,
- what can be paused or feature-flagged,
- what it costs,
- what dependency can fail,
- how the founder/CTO sees it failing before users do.

## Workload Classification

Classify each endpoint/action/job:

| Class                 | Examples                                                                    | Default handling                                                                              |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Interactive light     | read UI state, small CRUD, short validation, cached result                  | synchronous request                                                                           |
| Interactive AI        | short generation, chat turn, classification, copy rewrite                   | synchronous only with strict timeout/cost/degraded fallback                                   |
| External data fetch   | API/scraping/social/profile/reference fetch                                 | async or cached unless user experience explicitly needs live result                           |
| Heavy AI analysis     | long context analysis, multi-step reasoning, audiovisual/reference analysis | queued job with status/progress                                                               |
| Media/render          | video render, batch export, transcription, media transforms                 | worker/service job with retries and persisted job state                                       |
| Sync/ingestion        | social sync, reference ingestion, batch enrichment, scheduled updates       | queue/worker/cron with backpressure                                                           |
| Billing/auth mutation | checkout, webhook, account deletion/export                                  | synchronous only when provider contract requires; otherwise durable workflow with idempotency |

## Sync vs Async Gate

Before shipping a user-facing action, answer:

```md
Action:
Expected p50/p95 latency:
Max acceptable wait in UI:
Runs in request? yes/no + why:
Queue/worker needed? yes/no:
Job state persisted where:
Idempotency key:
Retry policy:
Timeout:
Cancellation/abort path:
Progress UI:
Degraded UI:
Feature flag/kill switch:
Manual ops fallback:
```

Red flags:

- external scraping inside a critical request;
- media/render/transcription inside a user-blocking request;
- unbounded AI calls;
- no timeout;
- no idempotency for retried writes;
- no persisted job state for long work;
- no user-visible progress/error/retry state;
- no kill switch for a vendor-heavy path.

## Peak Demand Scenario

For beta/launch-critical flows, define:

```md
Scenario:
Concurrent users:
Actions per user:
Bottleneck dependency:
Expected queue depth:
Expected p95 latency:
Cost estimate:
Rate limit risk:
What degrades first:
What is blocked:
What stays available:
Founder/ops alert:
```

Minimum scenarios:

- waitlist spike;
- onboarding/profile analysis spike;
- AI generation spike;
- external data sync spike;
- media/render spike;
- billing/auth spike.

## Dependency Resilience

Every critical vendor/provider gets:

```md
Dependency:
Used by:
Criticality: core | important | nice-to-have
Failure mode:
Timeout:
Retry/backoff:
Circuit breaker:
Fallback:
Degraded user message:
Manual fallback:
Cost/rate limit:
Owner:
Dashboard/alert:
```

Dependency classes to review:

- database/auth/storage;
- deploy/hosting/functions;
- AI/model providers;
- scraping/external data providers;
- queues/cache/rate-limit providers;
- billing/payments;
- email/notifications;
- media/render/transcription;
- analytics/observability;
- MCPs/agent tools.

## AI Provider Strategy

AI features must be explicit about provider lock-in.

```md
Feature:
Provider contract:
Primary provider/model:
Fallback provider/model:
Fallback enabled from day one? yes/no + why:
Quality eval:
Cost cap:
Latency cap:
Streaming behavior:
Tool/function-call compatibility:
Output schema compatibility:
Voice/style preservation requirement:
Provider/model metadata stored:
Fallback reason stored:
Cost estimate stored:
User-visible degraded state:
```

Required metadata for generated outputs when AI fallback exists:

- provider,
- model,
- prompt/version,
- fallback reason,
- cost estimate or token usage when available,
- latency,
- source/degraded metadata,
- quality/eval marker when applicable.

## Cost Governance

Every expensive feature needs a unit-economics note:

```md
Feature:
Plan affected:
Cost driver: AI | external data | render | storage | bandwidth | worker time
Estimated cost per action:
Expected actions per user/day:
Monthly cost per active user:
Gross margin impact:
Limit/quota:
Cache/reuse strategy:
Abuse control:
Upgrade/conversion value:
Kill switch:
Dashboard:
```

Track:

- AI cost per activated user;
- AI cost by feature/plan/user;
- external data cost by feature/plan/user;
- render/media/storage cost by feature/plan/user;
- heavy-user distribution;
- failed/retried job cost;
- gross margin by plan;
- top cost anomalies.

## Data And Database Scale

For database-backed features:

- identify critical launch tables;
- check indexes for user/team/client/time-range queries;
- review access policies/RLS for ownership and team/client scope;
- estimate growth of rows, storage, media, logs, and generated outputs;
- avoid unbounded list/read operations;
- define pagination, cursoring, caching, and archival;
- define backup/export requirements;
- define behavior if database/auth/storage is degraded;
- record query/performance test gaps before CTO handoff.

## External Data Strategy

For scraping/API/import/enrichment:

```md
Data source:
Official API available? yes/no:
Scraping/provider used? yes/no:
User manual fallback:
Data freshness:
Quality confidence:
Rate/block risk:
Compliance/platform risk:
Caching:
Revalidation:
User-visible confidence/degraded label:
What is core vs nice-to-have:
```

Prefer official APIs or user-provided/manual data when reliability, compliance, or trust matters more than enrichment quality.

## Media / Render Pipeline

For render/media features:

- render location: local, serverless, worker, external service;
- job state store;
- input asset storage;
- output storage;
- progress and retry state;
- idempotency;
- cleanup/retention;
- plan quotas;
- failed render recovery;
- cost per render/export;
- user-visible status;
- manual support path.

## Observability And Operability

Every beta-critical flow should support tracing:

```md
User action:
Request ID / correlation ID:
AI call ID:
External provider call ID:
Job ID:
DB write/read:
Cost event:
Error/degraded event:
User-visible outcome:
```

Minimum alerts/dashboards:

- provider failure rate;
- API p95 latency by route;
- queue depth and oldest job age;
- failed/retried jobs;
- AI cost/day and cost/user/plan;
- external data cost/day;
- render/storage/bandwidth cost;
- auth/billing failures;
- database errors and slow queries;
- degraded fallback rate;
- waitlist/onboarding activation drop-off.

## Launch Readiness Questions

- What works if 1,000 users arrive from the waitlist in one week?
- Which features are sync, async, degraded, blocked, or hidden?
- Which feature flags can shut off expensive or fragile surfaces?
- Which manual ops does the founder perform until a technical team exists?
- Which feature failures are acceptable for beta and which break trust?
- What does the CTO need to know to operate this without the founder?

## Evidence

For launch-critical systems, produce:

- sync/async matrix;
- dependency resilience matrix;
- AI provider fallback matrix;
- cost-by-plan estimate;
- database scale/RLS checklist;
- external data degradation plan;
- render/media job lifecycle plan;
- observability/tracing checklist;
- peak-demand scenario table;
- feature flag/kill-switch list;
- CTO handoff notes.

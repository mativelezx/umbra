# Data And Analytics Contract

Every meaningful feature should know what success means before it ships.

## Feature Metric

For each new product surface, define:

- User need ID.
- Use case ID.
- Flow ID and flow step.
- Journey phase.
- Primary user action.
- Success metric.
- Failure/drop-off signal.
- Segment or persona affected.
- Whether the feature is internal, demo, beta, or production.
- Which platform/channel the metric belongs to: desktop web, mobile web, PWA, iOS, Android, desktop app, extension, API/headless, or cross-platform.
- Which data mode produced the metric: demo, fixture, local seeded DB, staging, beta-real, or production.

## Event Contract

When analytics are added, document:

- Event name in `snake_case`.
- Trigger moment.
- Required properties.
- Optional properties.
- PII classification.
- Source metadata when data is AI/external/degraded.
- Owner and dashboard/report destination.

## Naming

- Events: `area_action_result`, for example `create_script_generated`.
- Properties: `camelCase`.
- IDs: stable internal IDs, never raw user secrets or unredacted prompts.

## Minimum Evidence

- The event fires once per intended user action.
- Empty/error/degraded states are distinguishable.
- AI-generated outputs include source/degraded context when relevant.
- No customer PII is sent to third-party analytics without approval.

## Founder View

If a feature cannot answer "how will I know this worked?", it is not ready to be treated as a product bet.

## Decision Link

When a metric exists to validate a founder/product/business decision, link it to a decision record from `.agent-os/DECISION_SYNC_CONTRACT.md`.

Examples:

- pricing decision -> trial-to-paid, upgrade conversion, AI cost/MRR, refund rate;
- beta scope decision -> activation, first useful output, support tickets, P0 bug rate;
- GTM decision -> waitlist conversion, qualified leads, demo calls, source channel;
- UX/copy decision -> time-to-first-value, completion rate, comprehension feedback;
- AI/model decision -> cost per activated user, latency, eval pass rate, degraded fallback rate.

## UX Research Link

For activation, onboarding, navigation, creation, AI output, billing, retention, and support flows, analytics must connect to `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md`.

Each important event should answer:

- which user need or use case it validates;
- which flow step it observes;
- which journey phase it belongs to;
- which user doubt, trust moment, pain point, or recovery path it helps diagnose;
- which business/product/founder decision it will confirm, reverse, or refine;
- which qualitative research signal should be reviewed alongside it.

Do not use analytics alone to decide why users are confused. Pair funnel/drop-off evidence with browser replay/QA evidence, beta feedback, interviews, usability notes, or support tags.

## Tracking Plan

For each tracked event, record:

```md
Event:
Trigger:
Why:
User need ID:
Use case ID:
Flow ID / step:
Journey phase:
Properties:
PII classification:
Code location:
Destination:
Owner:
Dashboard/report:
QA evidence:
Decision ID:
```

Keep the plan small and decision-oriented. Over-tracking creates false confidence and maintenance debt.

## Cost And Operability Events

Expensive, external, or async features should emit enough evidence to answer:

- which user/plan/feature caused the cost;
- which provider/model/actor/job ran;
- whether the result was primary, fallback, degraded, cached, retried, or failed;
- how long it took;
- whether it produced a visible useful outcome.

Recommended event/property families:

```md
Event:
feature_cost_recorded
Properties:
feature, plan, userIdHash, costDriver, provider, modelOrActor, jobId, estimatedCost, tokenUsage, durationMs, resultState, fallbackReason, sourceType

Event:
async_job_state_changed
Properties:
jobType, jobId, userIdHash, plan, state, attempt, durationMs, queueAgeMs, provider, errorCode, degraded

Event:
provider_call_completed
Properties:
provider, modelOrActor, feature, route, durationMs, resultState, fallbackUsed, fallbackReason, estimatedCost, rateLimited
```

Never send raw prompts, secrets, provider tokens, or sensitive user/client content to analytics.

## Real-Time / Real-Data Metrics

When moving from demo to real data, separate:

- seeded fixture metrics used for QA;
- staging metrics used to validate instrumentation;
- beta-real metrics from consented testers;
- production metrics from live users.

Do not use demo or fixture metrics to make pricing, GTM, retention, or fundraising claims unless they are labeled as simulations.

# Business And GTM Contract

> Portable contract for business model, ICP, pricing, GTM, marketing claims, growth experiments, revenue metrics, and founder-facing business decisions.

Use this during project bootstrap, CEO/founder reviews, market research, landing/waitlist work, pricing changes, billing changes, launch planning, growth experiments, onboarding/activation changes, feature prioritization, investor/CTO handoff, and post-audit docs sync.

When GTM depends on the founder's public voice, social distribution, build-in-public, launch story, case studies, founder proof, or personal brand, also apply `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`.

## Principle

Business model is product architecture.

Pricing, ICP, acquisition channel, activation metric, support burden, cost structure, public claims, and retention loop determine what the product can safely promise and what engineering must support.

Core rule:

> No feature is strategically real until it maps to a user problem, a business reason, a measurable signal, and a cost/risk boundary.

## Required Inputs

Read or create:

```md
Project category:
Primary ICP:
Secondary ICP:
Anti-ICP:
Primary user problem:
Current stage:
Launch/beta target:
Primary acquisition wedge:
Primary activation event:
Retention loop:
Revenue model:
Pricing hypothesis:
Plan/packaging hypothesis:
Free/trial/waitlist model:
Sales motion:
Marketing motion:
Core channels:
Founder distribution assets:
Support model:
Cost drivers:
Gross margin target:
Legal/compliance-sensitive claims:
Trust/safety constraints:
Analytics/tracking source:
Docs/source-of-truth status:
Founder approval needed:
```

Docs, old pitch decks, CEO reviews, research chats, and founder memory are hypotheses until reconciled with code, screens, billing config, analytics, costs, user feedback, and current market evidence.

## Business Layers

Every project should define these layers explicitly.

| Layer        | Purpose                                | Required decision                                                        |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------ |
| Category     | How the market understands the product | Plain category, differentiated point of view, category-creation risk     |
| ICP          | Who should feel this was built for     | Primary ICP, secondary ICP, anti-ICP, buyer/user split                   |
| Wedge        | Why a user tries it now                | Free tool, diagnosis, template, waitlist, trial, referral, content loop  |
| Activation   | First meaningful value event           | A concrete user outcome, not a vanity action                             |
| Retention    | Why the user returns                   | Habit, workflow, saved context, collaboration, reports, outputs, revenue |
| Monetization | How value turns into revenue           | Subscription, usage, hybrid, outcome, services, one-time, marketplace    |
| Cost model   | What can break margins                 | AI, storage, jobs, support, vendors, humans-in-loop, refunds, abuse      |
| GTM          | How the first users arrive             | Founder-led, PLG, sales-led, content-led, community, partnerships, paid  |
| Trust        | Why users believe it                   | Evidence, source labels, testimonials, privacy, control, human approval  |
| Claims       | What can be said publicly              | Proof required, legal risk, AI claim risk, performance claim risk        |
| Metrics      | How decisions are reversed             | Activation, conversion, retention, margin, support, quality, channel ROI |

## ICP Contract

For each ICP segment:

```md
Segment:
Role/user:
Buyer:
Budget owner:
Current workflow:
Pain:
Urgency trigger:
Desired outcome:
Current alternatives:
Willingness-to-pay evidence:
Primary objections:
Best channel:
Support risk:
Retention risk:
Plan/package fit:
Evidence status: hypothesis | researched | interviewed | beta-proven | paid-proven
```

Rules:

- Public copy can be warmer and broader than the commercial ICP, but internal metrics must know which segment is being validated.
- Do not optimize onboarding, pricing, or GTM for an anti-ICP just because that audience is easy to attract.
- If user and buyer differ, the feature must name both.
- A growth channel is not a strategy unless it can produce qualified users for the chosen ICP.

## Activation And Value Metric

Define one primary activation event per launch stage.

Good activation events:

- represent a real user outcome;
- are visible in the product;
- are measurable;
- correlate with retention or payment;
- can be reached quickly enough for the channel;
- can be reproduced in E2E and analytics.

Template:

```md
Activation event:
User value:
Required product state:
Required data/API/AI/DB state:
Time-to-value target:
Quality threshold:
Recovery path:
Analytics event:
E2E scenario:
Decision it validates:
```

Avoid:

- page views;
- raw generation count;
- signup alone;
- demo-only success;
- "user understood it" without a behavior or feedback signal;
- AI output volume without quality/usefulness signal.

## Pricing And Packaging

Every pricing decision should answer:

```md
Pricing model:
Plan/package:
Charge metric:
Why this maps to user value:
What is included:
What is limited:
Cost cap by plan/user/day:
Upgrade trigger:
Downgrade/cancel risk:
Refund/support risk:
Billing provider impact:
Tax/jurisdiction impact:
Public pricing visibility:
Founder approval:
```

Rules:

- AI products must price around outcomes and cost boundaries, not only access.
- Do not promise "unlimited" unless abuse, cost, latency, fallback, and fair-use limits are real.
- Keep beta pricing simple unless evidence proves the need for complexity.
- Complex pricing must have a support model; otherwise it becomes founder drag.
- Billing copy, pricing docs, plan config, checkout, paywall, marketing pages, and support language must agree before launch.

## GTM And Marketing

Every GTM plan should define:

```md
Audience:
Channel:
Message:
Offer:
Proof:
CTA:
Landing/onboarding path:
Metric:
Time window:
Stop condition:
Manual founder work:
Legal/compliance claim risk:
Content/IP/asset risk:
Follow-up/support path:
```

Rules:

- A channel is not approved until its landing path, value moment, tracking, and follow-up are known.
- A marketing claim is not approved until the product can prove it or label it as estimate/degraded/future.
- Founder-led content should feed product learning, not only traffic.
- Waitlist quality matters more than waitlist size.
- Sales/outreach learnings should become product, copy, onboarding, support, or pricing decisions.

## Trust, Claims, And Compliance

Business copy must be evidence-based.

Block or require approval when a claim:

- promises revenue, virality, growth, time saved, cost saved, or business outcomes;
- implies AI certainty, private data access, official platform analytics, or fully autonomous action;
- uses testimonials, endorsements, influencer claims, fake reviews, AI-generated proof, or before/after examples;
- touches minors, regulated categories, sensitive data, creator likeness, client data, billing, taxes, refunds, or legal obligations;
- changes privacy, terms, consent, retention, data export/delete, tracking, email, or subprocessor assumptions.

For each claim:

```md
Claim:
Surface:
Evidence:
Limitations:
Data/source used:
User consent needed:
Legal/compliance risk:
Fallback wording:
Owner:
Status: proposed | approved | implemented | verified | rejected
```

## Unit Economics And Founder Work

For any costly feature, record:

```md
Feature:
Revenue impact:
Cost drivers:
Estimated cost per action:
Estimated cost per activated user:
Plan margin impact:
Caching/reuse:
Quota/limit:
Abuse risk:
Provider fallback:
Founder support time:
Human-in-the-loop cost:
Kill switch:
Dashboard/alert:
```

Rules:

- Count founder time as cost when it is required for sales, onboarding, support, QA, recovery, or content production.
- Cost metrics must separate demo, fixture, staging, beta-real, and production-real.
- Low-margin growth can be accepted only with a written reason and review date.

## Business Decision Record

Use with `.agent-os/DECISION_SYNC_CONTRACT.md`.

```md
Decision:
Date:
Area: ICP | pricing | GTM | activation | retention | messaging | channel | offer | cost | support | legal | capital
Status: proposed | approved | implemented | verified | superseded | rejected
Context:
Options:
Recommendation:
Founder decision:
Evidence:
Metrics to watch:
Reversal trigger:
Docs/code/screens/billing impacted:
Approval needed:
Next review date:
```

## Bootstrap Checklist

During project bootstrap, answer:

```md
Primary ICP:
Secondary ICP:
Anti-ICP:
Primary acquisition wedge:
Primary activation event:
Primary retention loop:
Business model:
Pricing/packaging:
Free/trial/waitlist stance:
Sales/GTM motion:
Marketing/content motion:
Core channels:
Founder distribution assets:
Cost/margin posture:
Support/onboarding model:
Trust/legal/compliance claims:
Metrics dashboard:
Decision records needed:
Founder approvals needed:
Docs to reconcile after evidence:
```

Do not start broad feature work until these are at least provisional or explicitly out of scope.

## Feature Checklist

For every meaningful feature:

```md
Does this support activation, retention, revenue, learning, support reduction, risk reduction, or launch readiness?
Which ICP is it for?
Does it change pricing, plan value, trial limits, ICP, GTM, public positioning, or launch promise?
Does it add founder manual work?
Does it add support burden?
Does it create AI/vendor/storage/render cost?
Does it need a cost cap, quota, fallback, cache, or kill switch?
Does it require new analytics tied to a business decision?
Does it require legal/compliance review or public-claim approval?
Does it require docs/biz sync after verification?
```

## Audit Requirements

A full audit must produce:

- ICP and anti-ICP drift table;
- activation and time-to-value map;
- GTM funnel and channel evidence map;
- pricing/plan/config/docs/billing consistency table;
- unit economics and cost-risk map;
- claims/legal/trust review;
- support/founder-workload map;
- business metrics and event tracking gaps;
- docs/biz reconciliation queue;
- founder decision table with approval status and reversal triggers.

## Anti-Patterns

- Building features because they are impressive, not because they move activation, retention, revenue, learning, or risk.
- Letting a broad audience from content redefine the commercial ICP.
- Treating waitlist size as traction without qualification.
- Treating AI output volume as activation without quality or usefulness.
- Hiding cost variability behind flat pricing.
- Creating plan complexity that the founder has to explain manually every time.
- Public copy promising data, certainty, ROI, virality, or automation the product cannot prove.
- Updating business docs before screen/code/billing/analytics evidence exists.

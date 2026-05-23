# Solo Founder Control Plane

> The operating layer for one person wearing founder, CEO, CTO, coder, marketer, influencer, support, product, and ops hats.

## Principle

The founder should think about the user problem and the idea. The system should remember the rest.

This control plane turns every meaningful input into one of five loops:

1. Build the product.
2. Talk to users.
3. Sell/market the insight.
4. Protect the business.
5. Keep the system recoverable.

## Inputs

Any of these can start work:

- founder idea or prompt,
- user feedback/interview/support message,
- beta metric,
- bug/incident,
- content/marketing insight,
- competitor/market change,
- legal/compliance/vendor change,
- external tool/reference/Mobbin/famous-tool recommendation,
- cost/revenue signal,
- CTO/handoff concern.

Every input is classified before action:

| Input type                    | Default workflow                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Feature idea                  | `FEATURE_EXECUTION_CONTRACT.md`                                                                |
| Product/business decision     | `DECISION_SYNC_CONTRACT.md`                                                                    |
| Growth/marketing experiment   | `workflows/growth-experiment.md` + `DATA_ANALYTICS_CONTRACT.md`                                |
| User feedback/support pattern | Feedback loop below + feature/bug workflow                                                     |
| Bug/reliability issue         | `workflows/bugfix.md` or `workflows/incident.md`                                               |
| Launch/deploy/beta            | `PRODUCTION_READINESS.md`                                                                      |
| Vendor/MCP/tool/API change    | `EXTERNAL_INTELLIGENCE_STACK.md`, `MCP_REGISTRY.md`, `SUPPLY_CHAIN_SECURITY.md`, approval gate |
| Famous tool/reference request | `external-intelligence-review`, then registry/workflow update only if promoted                 |
| High-cost plan                | `premortem`                                                                                    |

## Current Context First

Before making a decision, read the current context packet:

- live screen/code state,
- active decision register,
- current beta scope,
- latest audit findings,
- metrics and feedback,
- external intelligence stack and tool registry when tools/references/vendors can affect the decision,
- docs as hypotheses,
- known accepted debt,
- approval gates.

Do not optimize from memory.

## Weekly Founder Loop

Use this once per week during beta/launch work.

```md
Week:
North Star:
Top user problem heard:
Top product bottleneck:
Top growth/content signal:
Top support/security/reliability risk:
Runway/revenue/cost signal:
Decision needed:
Build this week:
Do not build this week:
Talk to these users:
Publish/share this:
Measure by:
Kill/simplify/hide:
```

## Daily Triage

Use this when there are too many parallel threads.

1. Is anything broken for users or production?
2. Is anything blocking beta/launch?
3. Is the next feature tied to a user problem and metric?
4. Is the work a founder decision, a bug, a feature, a growth experiment, or cleanup?
5. Can it be scoped to a 90/10 solution?
6. Does it need approval because it touches data, pricing, GTM, legal, billing, security, or public claims?

## User Feedback Loop

Every useful feedback item should become structured evidence.

```md
Feedback ID:
Date:
Source: beta user | waitlist | support | interview | analytics | social | sales | internal
User/persona:
Raw signal:
User problem:
Workflow affected:
Severity: P0 | P1 | P2 | P3
Frequency:
Evidence: screenshot | trace | quote | metric | session | support log
Decision: fix | simplify | hide | ignore | research | ask more users
Linked feature/bug/decision:
Follow-up owner/date:
```

## Business And Finance Watchlist

Track these as founder signals, not vanity dashboards:

- waitlist conversion,
- activation,
- first useful output,
- D1/D7/D30 return,
- support tickets per beta user,
- P0/P1 bugs per week,
- AI cost per activated user,
- gross margin by plan,
- trial-to-paid,
- refund/cancellation reason,
- founder time spent on manual support,
- content/GTM source quality,
- runway and required next milestone.

## Delivery Health

Use founder-friendly DORA-style health, not enterprise theater:

- change lead time: idea/issue -> verified change,
- deployment frequency,
- change failure rate,
- failed deployment recovery time,
- escaped P0/P1 defects,
- restore drill freshness,
- test/evidence freshness for beta-critical flows.

## Continuity And Recovery

The founder is a bus factor of one. The system must be recoverable.

For production/beta, maintain:

- backup owner and schedule,
- restore procedure,
- RTO/RPO target,
- last restore drill date,
- database backup/export status,
- env/secrets recovery path,
- deploy-provider rollback path,
- critical vendor outage fallback,
- incident channel and escalation,
- CTO handoff path.

Minimum targets for beta:

| Area       | Minimum                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| Database   | Known backup source and restore path.                                           |
| Secrets    | Inventory without values, rotation path, owner.                                 |
| Deploy     | Rollback path documented and tested on preview/staging when possible.           |
| Core flows | Screenshots/E2E evidence for public + beta-critical flows.                      |
| Incident   | Single page/runbook for what to do when auth, DB, billing, AI, or deploy fails. |

## Vendor, Subprocessor, And Tool Watchlist

Any vendor/tool that touches product data, user data, billing, auth, analytics, AI, storage, email, QA, or deploy needs a row:

```md
Vendor/tool:
Purpose:
Data touched:
Environment: local | preview | production
Read/write capability:
Auth/secret location:
Subprocessor/privacy impact:
Cost/rate limit risk:
Fallback/removal path:
Approval status:
Docs/legal update needed:
```

## IP, Content, And Asset Rights Watchlist

If the project handles creative/media/customer assets, content rights are product risk.

Track:

- user-uploaded media,
- stock assets,
- AI-generated images/video/scripts/copy,
- Instagram/TikTok/YouTube imports,
- public profile/share cards,
- generated reports/exports,
- brand/client assets,
- third-party UI/code/assets,
- open-source licenses.

For every content-affecting feature, record:

- who owns the input,
- who owns the output,
- whether AI-generated material is labeled,
- whether copyrighted/source platform content is transformed or redistributed,
- whether export/share/download is allowed,
- whether terms/privacy need updates.

## Founder No-Overload Rules

- If a task does not map to user value, risk reduction, revenue, learning, or launch readiness, defer it.
- If the same decision appears twice, record it in Decision Sync.
- If the same bug category appears twice, add a regression or runbook.
- If the same support question appears three times, improve product/copy/onboarding.
- If the same manual step happens five times, automate or document why not.
- If a feature adds support burden without measurable value, hide or simplify it.

## Output For Any Work Session

```md
Input classified as:
Current context read:
Decision/feature/bug/growth record:
Business/user reason:
Risks/gates:
Evidence produced:
Docs/decision updates:
Follow-up:
```

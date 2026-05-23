# Decision Sync Contract

> Keep founder, product, business, technical, and documentation decisions coherent across the repo.

## Principle

Important decisions are product artifacts, not chat memories.

When the founder makes a meaningful decision, the agent must connect it to:

- business intent,
- user/product scope,
- affected screens and flows,
- code/API/DB/prompt impact,
- metrics and success/failure signals,
- docs that need to change,
- tests/QA evidence,
- approval status,
- review or reversal condition.

Docs are not the decision. Docs are where approved decisions become durable.

## Decision Classes

| Class             | Examples                                                                                    | Primary docs affected                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `product-scope`   | Beta includes/excludes project modules, billing, public profile, admin surfaces.            | `docs/tech/FEATURE_MAP.md`, `docs/tech/PLAN.md`, `docs/biz/02-PRODUCT.md`                                                   |
| `ux-narrative`    | Copy, IA, navigation, naming, metaphors, product language, screen purpose, activation path. | `docs/tech/DESIGN_SYSTEM.md`, project brand/UI docs, `docs/biz/09-BRAND-BRIEF.md`, `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` |
| `business-model`  | Pricing, plans, limits, trial, seats, billing provider, unit economics.                     | `docs/biz/03-BUSINESS-MODEL.md`, `docs/biz/05-TRACTION.md`, `docs/tech/API_MAP.md`                                          |
| `gtm-market`      | ICP, channels, waitlist, launch segment, positioning, competitor framing.                   | `docs/biz/01-MARKET.md`, `docs/biz/04-GTM.md`, `docs/biz/07-CONTENT.md`                                                     |
| `capital-founder` | Fundraising path, solo founder strategy, CTO/hiring, runway, investor story.                | `docs/biz/08-FOUNDER.md`, `docs/biz/10-CAPITAL.md`, `docs/biz/06-OPERATIONS.md`                                             |
| `architecture`    | Stack, data model, API contract, database source of truth, migrations, access policies.     | `docs/tech/SYSTEM_SPEC.md`, `docs/tech/CLOUD_HANDOFF.md`, `docs/tech/API_MAP.md`                                            |
| `ai-prompt-model` | Model routing, prompt behavior, eval gates, source metadata, AI cost caps.                  | `docs/tech/PROMPT_ARCHITECTURE.md`, `docs/tech/API_MAP.md`, `.agent-os/AI_RISK_REGISTER.md`                                 |
| `security-ops`    | Auth, OAuth scopes, billing safety, data deletion, production monitors, support loop.       | `docs/tech/CLOUD_HANDOFF.md`, `docs/biz/06-OPERATIONS.md`, `.agent-os/PRODUCTION_READINESS.md`                              |
| `accepted-debt`   | Legacy kept temporarily, hidden routes, manual gates, launch risks accepted by founder.     | `docs/tech/PLAN.md`, `docs/tech/CLOUD_HANDOFF.md`, audit artifacts                                                          |

## Decision Record Template

Use this structure in audit artifacts or PR notes. After approval and implementation, update the canonical docs listed in `Docs to update`.

```md
Decision ID:
Date:
Status: proposed | approved | implemented | verified | superseded | rejected
Class:
Owner:
Decision:
Why now:
Alternatives considered:
Evidence:
Founder approval:
Business impact:
User impact:
Technical impact:
Affected screens/routes:
Affected code/APIs/stores/prompts:
Affected DB/migrations/RLS:
Affected metrics/events:
Docs to update:
Tests/QA required:
Rollout/rollback:
Review date or reversal trigger:
Open questions:
```

## Status Rules

| Status        | Meaning                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| `proposed`    | Agent or founder is considering it; do not update canonical docs as fact yet.    |
| `approved`    | Founder chose it; implementation/docs may proceed.                               |
| `implemented` | Code/config/content has changed, but verification/docs may still be pending.     |
| `verified`    | Code/screen/data/tests/docs agree.                                               |
| `superseded`  | A newer decision replaces it; link to the replacement.                           |
| `rejected`    | Explicitly considered and not chosen; keep only if it prevents future confusion. |

## Required Gates

Ask for founder approval before marking as `approved` when a decision touches:

- pricing, plans, trial, paid limits, refunds, or checkout;
- ICP, GTM, public positioning, launch announcement, legal, investor claims;
- beta scope or hiding/removing a visible product area;
- database migrations, RLS, auth/OAuth scopes, data deletion/export;
- AI model behavior that changes user-facing output quality, cost, or safety;
- external vendors, MCPs, monitors, test inboxes, production agents, or customer data;
- large refactors, architecture changes, or accepted launch risks.

## Decision Sync Flow

1. Capture the decision as a record, even if provisional.
2. Classify the blast radius: business, product, UI, code, DB, AI, ops, docs.
3. Research current external context when the outside world can change the answer.
4. Run premortem when the cost of being wrong is high.
5. Ask founder approval if a gate applies.
6. Implement only after approval when required.
7. Verify code/screen/DB/test behavior.
8. Update canonical docs only after verification.
9. Mark the decision `verified` or record remaining drift.

## Drift Detection

A decision is drifting when:

- docs say a feature is active but no screen/action exists;
- a screen promises a capability without API/DB/test support;
- pricing docs, plan config, billing UI, and checkout disagree;
- GTM/ICP docs contradict landing/waitlist/onboarding copy;
- UI, docs, code concepts, analytics events, E2E labels, accessibility labels, and support language use different names for the same object/action;
- a metaphor or category term remains in public UI after a decision downgraded or deprecated it;
- roadmap/docs include legacy items that no route can reach;
- `docs/biz` says a strategic choice while code/product optimizes for a different one;
- a risk was accepted but no review date/reversal trigger exists.

## Founder Decision Review

During the extreme audit and before CTO handoff, produce a decision register grouped by:

- decisions already verified,
- decisions implemented but not documented,
- decisions documented but not implemented,
- decisions contradicted by the current product,
- stale decisions to archive or supersede,
- decisions requiring founder approval before beta.

## No-Memory Rule

If a decision matters enough to affect code, screens, pricing, GTM, support, security, or launch scope, it must be recorded. Do not rely on chat history, personal memory, or stale docs as the only source.

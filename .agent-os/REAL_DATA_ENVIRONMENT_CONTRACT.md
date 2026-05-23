# Real Data Environment Contract

> Move from fake demo data to trustworthy product data without polluting production, exposing private information, or losing reproducibility.

Use this contract during project bootstrap, audits, Supabase/Postgres work, E2E setup, beta preparation, staging setup, analytics work, external-provider integration, demo removal, and any feature that currently depends on mock/demo/localStorage data.

## Principle

Demo data is a design and development tool, not the source of truth for product readiness.

A serious product needs separate data modes:

- deterministic fixtures for tests;
- seeded local data for development;
- seeded staging data for end-to-end QA;
- real beta data with consent;
- production data with strict access controls;
- honest degraded/mock fallback when a provider is unavailable.

## Environment Matrix

For every environment:

```md
Environment: local | test | preview | staging | beta | production
Purpose:
Database/project:
Data type: mock | fixture | synthetic | anonymized | consented-real | production-real
Who can access:
Can agents read? yes/no
Can agents write? yes/no
Can reset:
Seed source:
External providers enabled:
Auth users:
Storage/media:
Analytics enabled:
Cost controls:
PII/client data:
Backup/restore:
Approval needed:
```

## Data Categories

Classify seed/real data before use:

- `mock`: invented inline fallback for missing provider/API keys.
- `fixture`: deterministic data used by tests and demos.
- `synthetic`: generated but realistic data with no real person behind it.
- `anonymized`: transformed real data where re-identification risk has been reviewed.
- `consented-real`: real user/customer data explicitly provided for beta/testing.
- `production-real`: live customer/product data.

Agents can work freely with `mock`, `fixture`, and approved `synthetic` data. Anything anonymized, consented-real, or production-real needs explicit access and privacy guardrails.

## Seed Rules

Seed data should be:

- deterministic and idempotent;
- versioned with the repo when safe;
- split by domain/module when it grows;
- close to real user workflows, not random lorem ipsum;
- free of secrets, tokens, private content, copyrighted assets, and unapproved PII;
- clear about source metadata and degraded/mock status;
- resettable without manual cleanup;
- safe under RLS and auth ownership assumptions;
- matched to E2E user journeys and dynamic route samples.

Supabase local development already supports `supabase/seed.sql` and configured seed paths. Use SQL seeds for stable relational state and script-generated seeds only when they emit reviewed SQL or call approved local/staging endpoints.

## Real-Data Promotion Ladder

Move through these stages deliberately:

1. **Mock/local fallback** — feature works without keys or DB.
2. **Deterministic fixture** — tests can assert exact behavior.
3. **Local seeded DB** — developer can reset and reproduce.
4. **Staging seeded DB** — browser/E2E runs against Supabase-like state.
5. **Sandbox providers** — auth, billing, email, external APIs, AI, storage are enabled with safe accounts.
6. **Consented beta data** — first real users/testers provide data intentionally.
7. **Production real data** — only after readiness, backups, RLS, monitoring, and support loop are in place.

Do not jump from mock/demo directly to production-real.

## Post-Audit Real-Data Transition

For projects currently in audit/refactor mode, do not replace demo data mid-audit unless the founder explicitly approves a narrow P0/P1 fix.

Default sequence:

1. Finish the full product/code/DB/security/UX audit.
2. Approve the P0/P1/P2 execution plan.
3. Refactor or hide disconnected surfaces.
4. Reconcile docs with verified code/screens.
5. Create seed/fixture coverage for beta-critical flows.
6. Stand up staging or a resettable remote test environment.
7. Run E2E against seeded fullstack data.
8. Move selected beta testers to consented real data.
9. Use real outputs and feedback to tune prompts, evals, UX, and cost controls.

This keeps the audit clean while making the post-audit product much more useful for creator-output quality.

## Prompt And Output Learning Loop

When the product uses AI to generate creative output, real data becomes product learning infrastructure.

For every prompt-backed core output, define:

```md
Output type:
Prompt/schema/version:
User/context data used:
Data mode: fixture | staging | beta-real | production-real
Consent basis:
Quality rubric:
Human rating fields:
User edit/accept/reject signal:
Observed failure modes:
Provider/model metadata:
Cost/latency metadata:
Examples safe to store:
Examples forbidden to store:
Eval fixture generated:
Prompt change decision needed:
```

Recommended quality signals:

- output accepted, edited, regenerated, discarded, exported, published, or copied;
- creator rating or short feedback;
- brand-voice fit;
- originality/derivativeness;
- usefulness for next action;
- factual/source grounding when external data is involved;
- latency and cost per useful output;
- prompt-injection/degraded/fallback state.

Never store raw private prompts, private client media, platform tokens, or sensitive user/client content as analytics. Store references, hashes, redacted snippets, structured labels, or consented examples instead.

## Required Artifacts

Before replacing demo mode with real data, produce:

- data environment matrix;
- seed plan by product module;
- test users and ownership model;
- dynamic route fixture IDs/tokens/usernames;
- RLS/access-policy assumptions;
- reset/restore procedure;
- approved provider sandbox list;
- E2E scenario map using seeded data;
- data deletion/export implications;
- cost and rate-limit guardrails;
- prompt/output learning plan for AI-heavy core flows;
- founder approval for beta/production real data.

## Supabase/Postgres Checklist

For Supabase-backed projects:

- `supabase/config.toml` seed settings are known.
- `supabase/seed.sql` or `supabase/seeds/*.sql` exists when local/staging reproducibility is required.
- Local reset path is known.
- Remote staging project is separate from production.
- Service-role usage is server-only and approved.
- RLS policies are tested with seeded authenticated users.
- Type generation path is known after schema changes.
- Migrations and generated schema are reconciled.
- Seed data does not require disabling RLS in exposed schemas.
- Advisors/security checks run before production schema changes.

## QA And Agents

Agent/browser tests must declare the data mode they run against:

- `demo`: no persistent DB assumptions.
- `fixture`: deterministic mocked or seeded state.
- `staging`: persistent but resettable Supabase/project state.
- `beta-real`: real tester data with consent and access limits.
- `production`: read-only by default; mutation requires approval.

For each E2E suite:

```md
Suite:
Environment:
Seed required:
Reset required:
Auth users:
External providers:
Allowed mutations:
Forbidden mutations:
Evidence saved:
Approval needed:
```

## Approval Gates

Founder approval is required before:

- seeding or mutating remote/staging/production databases;
- importing real user/customer/client/media data;
- granting agents access to real data;
- enabling external providers against real accounts;
- storing real social/platform data;
- running destructive/reset scripts outside local;
- using production data for QA;
- changing retention/export/delete behavior;
- marking demo fallback as product-ready real behavior.

## Output For Audits

Audits should report:

- where demo data still drives product behavior;
- which routes can operate with seeded DB data;
- which dynamic routes lack fixtures;
- which features need provider sandbox accounts;
- which DB tables have no UI or no seed;
- which UI promises need real backend/data before beta;
- which tests should move from demo to seeded staging first.
- which prompt-backed outputs need beta-real feedback/evals after the audit.

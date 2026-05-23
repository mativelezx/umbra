# Project Profile - Umbra

> Status: current local overlay for Agent OS. Keep product-specific truth here; keep portable operating rules in the rest of `.agent-os/`.

## Project

Project: Umbra
Category: self-knowledge web platform / academic TFG
One-line description: Spanish-language self-knowledge app that combines Big Five, Jung cognitive functions, Positive Computing, narrative AI, a safety-aware chat, a development plan, PDF export, and Ley 25.326 data rights.
Primary user: Spanish-speaking adults using Umbra for reflective self-knowledge, plus evaluators/reviewers for the Universidad Siglo 21 software engineering final project.
Primary problem: deliver a rigorous, non-clinical self-knowledge experience with explainable analytics, safe narrative language, privacy controls, and reproducible academic/technical evidence.

## Stack

```md
Workspace/package manager: pnpm workspace metadata + single-package Turbo baseline
Frontend: Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS 3.4
State: Zustand 5
Auth/data: Supabase Auth + PostgreSQL + RLS
AI: Anthropic Claude narrative layer via fixed `ANTHROPIC_MODEL_ID`
Analytics model: Python ML module in `ml/` with DistilBERT embeddings + Ridge multi-output + MLflow/DVC/FastAPI
Validation: Zod
Testing: Vitest, Playwright, @axe-core/playwright
Deploy: Vercel for web; ML API local/service-managed by environment
```

## Product Rules

- Umbra is not therapy, diagnosis, medical advice, or MBTI.
- Use Jung cognitive functions directly as interpretive narrative, not MBTI type labels.
- Use Big Five language carefully: analytics can be low-confidence and must not overclaim measurement strength.
- Crisis/safety flow is launch-critical: lexicon, idiom pre-filter, classifier fail-closed, crisis card, session timeout, and Argentine resources.
- User-facing copy is Spanish; code is English.
- No emoji in UI; use Phosphor Icons.
- No inline prompts; prompts live in `lib/prompts/` and use knowledge blocks from `lib/knowledge/`.
- Types stay centralized in `types/index.ts` unless a purely local component prop is trivial.
- Supabase RLS and Ley 25.326 flows are product-critical, not optional polish.

## Agent OS Overlay

Use the shared Agent OS contracts for:

- tooling/package/script changes;
- security/privacy/data decisions;
- UI/UX or product-language changes;
- AI prompt/model/safety changes;
- launch/readiness or academic defense evidence;
- repo cleanup, structure, bootloaders, skills, rules, and docs drift.

Project-specific source docs:

- `README.md`
- `UMBRA_MASTER_BUILD.md`
- `docs/DEFENSE_READINESS.md`
- `docs/QA_RISK_MITIGATION.md`
- `docs/DECISIONS.md`
- `docs/tech/`
- `docs/biz/`
- `ml/README.md`
- `ml/DATASET_EXPANSION.md`

## Tooling Baseline

Umbra remains a root-level single-package app today. Turbo is adopted as a cache/check runner through non-recursive `turbo:*` scripts. Moving to `apps/web` is a future structural migration and should only happen as an explicit refactor with route/build/deploy verification.

Shared local baseline:

- `packageManager`: `pnpm@9.15.0`
- Node: `>=20.9.0`
- workspace marker: `pnpm-workspace.yaml`
- task cache config: `turbo.json`
- lockfile: `pnpm-lock.yaml`
- ignored local artifacts: `node_modules`, `.next`, `.turbo`, reports, coverage, env files, local runtime caches

## Current Risks

- Some older artifacts may still include historical package-manager commands. Prefer current package scripts and update docs when touching related surfaces.
- The app is deployed, but real E2E flows remain opt-in because they require Supabase, ML API, and Anthropic availability.
- Next.js/Vitest hardening migration is tracked separately; do not bundle it into unrelated cleanup.
- Academic evidence and product safety evidence must stay distinguishable: passing demo flows is not the same as clinical or psychological validation.

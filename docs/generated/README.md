# Generated Documentation

> This folder contains documentation generated automatically from the code.
> DO NOT edit these files by hand — they are overwritten by build scripts.

## What lives here

- `env-vars.md` — extracted from `.env.local.example` + tsc source scan
- `api-types.md` — extracted from `types/index.ts` + Zod schemas (auto-generated post-Phase 3)
- `sql-schema-dump.sql` — `pg_dump --schema-only` output for current Supabase state (post-migration, on demand)
- `eval-results-{date}.md` — H1 + H2 run outputs (committed from CI main-branch workflow)
- `dependency-graph.md` — `madge` output showing module dependencies (post-Phase 5)

## How to regenerate

### Environment variables

```bash
npm run docs:env-vars
```

Scans `.env.local.example` + grep for `process.env.*` across `lib/`, `app/`,
`middleware.ts`. Writes `env-vars.md`.

### API types

```bash
npm run docs:api-types
```

Post-Phase 3: walks `app/api/**/route.ts`, extracts exported Zod schemas, emits
Markdown with input + output type signatures per route.

### SQL schema

```bash
npm run docs:sql-schema
```

Runs `supabase db dump --schema-only` against the local Supabase instance and
writes `sql-schema-dump.sql`. Useful for comparing to migrations and catching
drift.

### Eval results

Auto-committed by `.github/workflows/eval-main.yml` on every main-branch push.
See [tech/EVALS.md](../tech/EVALS.md).

### Dependency graph

```bash
npm run docs:deps
```

Uses `madge` to produce a text representation of the module graph. Helps
catch circular imports and unexpected coupling.

## Pre-Phase 2 state

Currently (2026-04-12) this folder contains only:
- This `README.md`
- `env-vars.md` (if generated manually)

Auto-generation scripts land in Phase 1.5.5 (alongside `package.json` `scripts:docs:*`).

## Why separate from other docs?

- **Hand-written docs** (`docs/tech/*`, `docs/features/*`, `docs/biz/*`, top-level `docs/*.md`) capture intent, reasoning, decisions.
- **Generated docs** (`docs/generated/*`) capture current state as reality.

When they disagree, investigate: either the hand-written docs are stale (update
them) or the code doesn't match intent (fix the code). The separation makes it
visible.

## See also

- [PLAN.md](../PLAN.md) — master plan + doc map
- [tech/EVALS.md](../tech/EVALS.md) — eval snapshot generation
- [tech/DATABASE.md](../tech/DATABASE.md) — schema source of truth

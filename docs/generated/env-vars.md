# Environment Variables

> Auto-derived from `.env.local.example`. Last updated by hand: 2026-04-27.

## Supabase (Phase 1)

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (client + server) | ✓ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✓ | Supabase anonymous key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | ✓ | Bypasses RLS. Used for cascade deletes, crisis event writes, research dataset writes |

## Anthropic (Phase 1 + 1.5)

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **Server only** | ✓ | Claude API authentication |
| `ANTHROPIC_MODEL_ID` | **Server only** | ✓ | Identificador de modelo fijado (ej. `claude-sonnet-4-6-20260301`). ADR-005. |
| `ANTHROPIC_HAIKU_MODEL_ID` | **Server only** | opcional | Modelo secundario fijado para rutas auxiliares. |

## Rate limiting + cost control (Phase 1.5 + Phase 5)

| Variable | Default | Purpose |
|---|---|---|
| `DAILY_TOKEN_CAP` | `15000` | Per user, per day. ~30 chat turns. |
| `DAILY_COST_CAP_CENTS` | `200` | Per user, per day. USD 2.00. |
| `GLOBAL_DAILY_BUDGET_USD` | `50` | Circuit breaker across all users. |
| `ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN` | `5` | CI eval cost ceiling. |

## HMAC peppers (Phase 1.5 — Migration 002)

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable | Purpose | Rotation impact |
|---|---|---|
| `CONSENT_IP_PEPPER_V1` | Hash IPs in `consent_records.ip_hash` | Old consent audit rows become unlinkable — acceptable |
| `CRISIS_PEPPER_V1` | Hash user_id + message in `crisis_events` | Old crisis events unlookupable — acceptable given 30-day retention |
| `RESEARCH_PEPPER_V1` | Hash user_id in `research_dataset` | Old research rows can't be linked to users for export/delete — data loss |
| `DELETE_TOKEN_PEPPER_V1` | Hash delete confirmation tokens | Pending delete tokens invalidated — acceptable |

**All peppers**: server-only, never committed, rotate on suspected compromise.
See [tech/SECURITY.md](../tech/SECURITY.md) for rotation procedure (migration-free per ADR-021).

## Email (Phase 2)

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | ✓ | Resend email service for delete confirmation magic links |
| `EMAIL_FROM` | ✓ | Verified sending domain (e.g. `umbra@yourdomain.com`) |

## Módulo ML propio (ADR-026)

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `ML_API_URL` | **Server only** | ✓ en prod | Endpoint del componente analítico FastAPI (DistilBERT + Ridge). Default local: `http://localhost:8000`. En prod, URL pública del servicio Render (ej: `https://umbra-ml.onrender.com`). |

`lib/ml-client.ts` toma esta URL para llamar a `POST /infer` durante `Pass 1` de `/api/analyze`. Si el servicio cae, el endpoint devuelve 503 `ml_unavailable` (NO degrada a Claude para Big Five — ADR-026 explícito).

## Site URL

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | ✓ en prod | Base URL canónica del producto (sin trailing slash). La leen `app/layout.tsx` (metadata), `app/sitemap.ts`, `app/robots.ts`, redirects de auth. |

## Where each variable is read

(Updated when auto-generation script lands)

| Variable | Read by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/{client,server,edge,middleware}.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/api/account/delete/confirm/route.ts`, `app/api/chat/route.ts` (crisis_events writes) |
| `ANTHROPIC_API_KEY` | `lib/claude/client.ts` |
| `ANTHROPIC_MODEL_ID` | `lib/claude/client.ts`, `lib/evals/*` |
| `ANTHROPIC_HAIKU_MODEL_ID` | `lib/claude/client.ts` (modelos secundarios para llamadas auxiliares) |
| `DAILY_TOKEN_CAP` | `app/api/chat/route.ts`, `app/api/analyze/route.ts`, etc. |
| `DAILY_COST_CAP_CENTS` | same |
| `GLOBAL_DAILY_BUDGET_USD` | `lib/claude/global-budget.ts` (unstable_cache wrapper) |
| `ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN` | `lib/evals/run.ts` |
| `CONSENT_IP_PEPPER_V1` | `lib/security/peppers.ts` |
| `CRISIS_PEPPER_V1` | `lib/security/peppers.ts`, used by `lib/chat/pipeline.ts`, delete cascade |
| `RESEARCH_PEPPER_V1` | `lib/security/peppers.ts`, used by analyze route (if opt_in), export, delete |
| `DELETE_TOKEN_PEPPER_V1` | `lib/security/peppers.ts`, used by delete request/confirm |
| `RESEND_API_KEY` | `app/api/account/delete/request/route.ts` |
| `EMAIL_FROM` | same |
| `ML_API_URL` | `lib/ml-client.ts` (consumido por `app/api/analyze/route.ts`) |
| `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` |

## Missing variables (will fail at import)

If any required variable is missing, the app throws on first reference with a
clear error message. Pattern:

```ts
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY not defined. Set it in .env.local or Vercel env.');
}
```

This is intentional: explicit failure is better than silent fallback.

## See also

- `.env.local.example` (the canonical source in repo root)
- [CLOUD_HANDOFF.md](../CLOUD_HANDOFF.md) — Vercel deployment of env vars
- [tech/SECURITY.md](../tech/SECURITY.md) — pepper rotation
- [DECISIONS.md](../DECISIONS.md) — ADR-005, ADR-021, ADR-026

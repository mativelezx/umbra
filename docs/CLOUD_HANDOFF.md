# Umbra — Cloud Handoff

> Everything needed to deploy Umbra to production. Environment provisioning,
> secret management, database migrations, smoke tests, rollback procedures.

## Target architecture

```
                ┌──────────────────────────┐
                │   Vercel (Next.js 14)    │
                │   - Edge runtime routes  │
                │   - Node runtime routes  │
                │   - Static assets        │
                │   - Vercel Analytics     │
                └────────┬─────────────────┘
                         │
         ┌───────────────┼─────────────────┐
         │               │                 │
         ▼               ▼                 ▼
    ┌─────────┐    ┌──────────┐     ┌──────────┐
    │Supabase │    │Anthropic │     │  Resend  │
    │Auth+DB  │    │Claude API│     │  Email   │
    │+Storage │    │          │     │          │
    └─────────┘    └──────────┘     └──────────┘
```

## Provisioning checklist

### 1. Supabase project

- [ ] Create new Supabase project (region: `us-east-1` or closest to target users)
- [ ] Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**never expose to client**)
- [ ] In Dashboard → Authentication → Providers, enable Email (disable OAuth for v1)
- [ ] In Dashboard → Authentication → Settings, disable "Confirm email" for dev (enable for prod after email setup)
- [ ] In Dashboard → SQL Editor, run `supabase/migrations/001_initial_schema.sql`
- [ ] **After Phase 0 + 1.5.6**: run `supabase/migrations/002_core_tables.sql`
- [ ] Verify RLS is enabled on every table: `SELECT tablename FROM pg_tables WHERE schemaname='public';` then `SELECT * FROM pg_tables WHERE rowsecurity = true;`

### 2. Anthropic API key

- [ ] Create new API key at console.anthropic.com (separate from any other projects)
- [ ] Add billing / credit cap (suggested: 50 USD/month for TFG dev + test)
- [ ] Copy key → `ANTHROPIC_API_KEY`
- [ ] Set `ANTHROPIC_MODEL_ID=claude-sonnet-4-6-20260301` (dated SKU, never alias)
- [ ] Set `ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251001` (H2 rewriter)

### 3. Email provider (Resend recommended)

- [ ] Create Resend account
- [ ] Verify sending domain (via DNS records)
- [ ] Copy API key → `RESEND_API_KEY`
- [ ] Set `EMAIL_FROM=umbra@yourdomain.com`
- [ ] Test via `curl -X POST https://api.resend.com/emails ...`

### 4. Peppers (HMAC secrets)

Generate 4 random 32-byte hex strings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run 4 times, one per pepper:

- [ ] `CONSENT_IP_PEPPER_V1`
- [ ] `CRISIS_PEPPER_V1`
- [ ] `RESEARCH_PEPPER_V1`
- [ ] `DELETE_TOKEN_PEPPER_V1`

**Store in a password manager**. Never commit to git. Never log. Never expose to client.

Rotation procedure: add `_V2` variant, bump `CURRENT_PEPPER_VERSION` in `lib/security/peppers.ts`. See [tech/SECURITY.md](tech/SECURITY.md).

### 5. Vercel project

- [ ] Create new Vercel project
- [ ] Connect to GitHub repo
- [ ] Set framework preset: Next.js
- [ ] Set Root Directory: `/` (or wherever the `package.json` lives)
- [ ] Add environment variables (see full list below)
- [ ] Enable Vercel Analytics (free tier)
- [ ] Enable Vercel Speed Insights (free tier)
- [ ] Deploy preview branch → smoke test → merge main

## Full environment variable list

Copy from `.env.local.example` in the repo root.

| Variable | Where | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | ✓ | Public — safe on client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | ✓ | Public — safe on client |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local | ✓ | **Server only** — never expose |
| `ANTHROPIC_API_KEY` | Vercel + local | ✓ | **Server only** |
| `ANTHROPIC_MODEL_ID` | Vercel + local | ✓ | Pinned SKU (not alias) |
| `ANTHROPIC_HAIKU_MODEL_ID` | Vercel + local | ✓ | Pinned SKU for H2 rewriter |
| `DAILY_TOKEN_CAP` | Vercel + local | ✓ | Default 15000 |
| `DAILY_COST_CAP_CENTS` | Vercel + local | ✓ | Default 200 (USD 2/user/day) |
| `GLOBAL_DAILY_BUDGET_USD` | Vercel + local | ✓ | Default 50 |
| `ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN` | GitHub Actions | ✓ | Default 5 |
| `CONSENT_IP_PEPPER_V1` | Vercel + local | ✓ | 32-byte random hex |
| `CRISIS_PEPPER_V1` | Vercel + local | ✓ | 32-byte random hex |
| `RESEARCH_PEPPER_V1` | Vercel + local | ✓ (Branch A) | 32-byte random hex |
| `DELETE_TOKEN_PEPPER_V1` | Vercel + local | ✓ | 32-byte random hex |
| `RESEND_API_KEY` | Vercel + local | ✓ | For delete magic link emails |
| `EMAIL_FROM` | Vercel + local | ✓ | Verified sending domain |

## Migration deployment order

**CRITICAL**: migrations must run BEFORE the corresponding deploy, not after. If you deploy code that expects a new column and the migration hasn't run yet, the app breaks silently.

### Phase 1 → Phase 1.5 transition

1. Run `supabase/migrations/002_core_tables.sql` in Supabase SQL Editor
2. Verify all 7 new tables exist with RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;`
3. Verify `charge_rate_limit` and `reconcile_rate_limit` RPCs exist: `SELECT proname FROM pg_proc WHERE proname LIKE '%rate_limit%';`
4. Verify `conversations.last_activity_at` and `profiles.research_opt_in` columns added: `\d+ public.conversations` + `\d+ public.profiles`
5. **Only then**: deploy new Next.js code to Vercel

### Phase 0 gate (ethics) branching

- **Branch A (ethics cleared)**: Migration 002 as specified, including `research_dataset` table.
- **Branch B (ethics path unclear)**: Comment out `research_dataset` DDL in Migration 002, comment out `profiles.research_opt_in` column. Keep the research-related code disabled in app (commented-out consent checkbox, opt-out route disabled).

## Rollback procedure

### Code rollback
- Vercel: Dashboard → Deployments → previous successful → "Promote to Production". Takes ~1 min.

### Migration rollback
- Every `NNN_name.sql` must have a sibling `NNN_name.down.sql` with `DROP TABLE IF EXISTS ... CASCADE;` etc.
- Run the down SQL in Supabase SQL Editor
- **Only then**: rollback the Vercel deploy (reverse of forward order)

### Partial failure mid-cascade
- If `delete/confirm` fails mid-cascade, the transaction rolls back automatically (wrapped in `BEGIN`/`COMMIT`). User account remains intact. Error logged to console.
- If `analyze` fails after Pass 1 but before Pass 2, the `psychological_profiles` row exists but `evidence_highlights` doesn't. Safe — client just doesn't show highlights.
- If `charge_rate_limit` passes but Claude call fails, `reconcile_rate_limit` in finally block subtracts the estimated tokens back from the rate_limits row.

## Smoke tests (first 5 minutes post-deploy)

Run these against the production URL:

```bash
# 1. Landing page loads
curl -sf -o /dev/null -w "HTTP %{http_code} in %{time_total}s\n" https://umbra.yourdomain.com/

# 2. Health check route (add /api/health in Phase 7)
curl -sf https://umbra.yourdomain.com/api/health | jq .

# 3. Registration flow (via Playwright)
npx playwright test e2e/smoke/register.spec.ts --config=playwright.prod.config.ts

# 4. Consent flow
npx playwright test e2e/smoke/consent.spec.ts --config=playwright.prod.config.ts

# 5. Analyze flow with test user
npx playwright test e2e/smoke/analyze.spec.ts --config=playwright.prod.config.ts

# 6. Chat flow (normal)
npx playwright test e2e/smoke/chat.spec.ts --config=playwright.prod.config.ts

# 7. Chat crisis flow (CRITICAL — must block)
npx playwright test e2e/smoke/chat-crisis.spec.ts --config=playwright.prod.config.ts
```

All 7 must pass before marking deploy as stable.

## Post-deploy monitoring (first hour)

- [ ] Vercel Analytics: check for 5xx spike
- [ ] Supabase Logs: check for unhandled errors
- [ ] Supabase SQL: `SELECT COUNT(*), severity FROM crisis_events WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY severity;` — expect zeros for fresh prod
- [ ] Supabase SQL: `SELECT SUM(cost_usd_cents) FROM rate_limits WHERE day = CURRENT_DATE;` — watch burn rate vs `GLOBAL_DAILY_BUDGET_USD`
- [ ] Anthropic usage dashboard: verify requests going through, no 401 / 429 errors

## Disaster recovery

### Scenario: Anthropic API down
- Vercel returns 503 with "estamos en mantenimiento por IA no disponible"
- `/chat` falls back to static "reflexiones guiadas" mode (if implemented)
- `/analyze`, `/narrative`, `/plan` routes disabled gracefully

### Scenario: Supabase down
- All routes return 503
- Show maintenance banner via Vercel Edge Config (if set up)

### Scenario: Cost cap hit (viral spike)
- `GLOBAL_DAILY_BUDGET_USD` exceeded → all Claude routes return 503 with "cupo diario agotado"
- User-visible message: "volvemos mañana, hoy ya llegamos al limite"
- Investigate: Supabase SQL → identify high-cost users → decide if cap needs raising or if abuse is happening

### Scenario: Crisis leak (false negative)
- User reports crisis went through unblocked
- Query `crisis_events` by approximate time + conversation_id hash
- If no event was logged, classifier missed it — add regex pattern for the phrasing, ship hotfix
- Post-mortem in `docs/tech/INCIDENTS.md` (TODO file)

## Cost model

| Item | Estimate | Notes |
|---|---|---|
| Vercel Hobby | $0/mo | Free tier sufficient for TFG |
| Supabase Free | $0/mo | 500 MB DB, 1 GB storage, 2 GB bandwidth |
| Anthropic Claude | ~$0.04 per analyze, ~$0.02 per narrative, ~$0.01 per chat turn | See [tech/RATE_LIMITING.md](tech/RATE_LIMITING.md) |
| Resend | $0/mo | Free tier: 100 emails/day, 3k/mo |
| Total (TFG scale) | **~$10-30/mo** | Assumes ~500 users/month, moderate chat usage |

Rate limits and global budget keep this bounded. Hard cap: 50 USD/day via `GLOBAL_DAILY_BUDGET_USD`.

## Domain + SSL

- [ ] Register domain (or use `umbra.vercel.app` for dev)
- [ ] Add domain in Vercel → Domains
- [ ] Configure DNS (Vercel provides records)
- [ ] SSL is automatic via Let's Encrypt

## CDN / caching strategy

- Static assets (CSS, JS, images): Vercel Edge cached by default
- Pages with user data (`/dashboard`, `/chat`, `/plan`): `cache-control: no-store` (dynamic, per-user)
- Landing page `/`: cached with revalidate 3600 (1h)
- API routes: no caching (dynamic)

## Observability

See [tech/OBSERVABILITY.md](tech/OBSERVABILITY.md) for:
- Structured log format
- Metrics emission
- Alert rules (TODO: wire up)
- Runbooks

## See also

- [PLAN.md](PLAN.md) — master plan + status
- [SYSTEM_SPEC.md](SYSTEM_SPEC.md) — full system spec
- [tech/DATABASE.md](tech/DATABASE.md) — schema + RLS + migrations
- [tech/SECURITY.md](tech/SECURITY.md) — peppers + HMAC + rotation
- [biz/LEGAL.md](biz/LEGAL.md) — Ley 25.326 compliance

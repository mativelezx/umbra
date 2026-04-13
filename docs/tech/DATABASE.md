# Umbra — Database Schema

> Full schema, RLS policies, migrations, SQL functions.

## Tables (post-Migration 002)

### From Migration 001 (Phase 1)

#### `profiles`
User identity (extended from Supabase Auth).

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  research_opt_in BOOLEAN DEFAULT FALSE,  -- Added in Migration 002 (Branch A only)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_all_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);
```

Populated automatically via trigger on `auth.users` insert:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### `psychological_profiles`
The generated profile. One per user (at version=1). Forward-compat to multiple versions for longitudinal tracking.

```sql
CREATE TABLE public.psychological_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,   -- Added in Migration 002
  openness INTEGER CHECK (openness BETWEEN 0 AND 100),
  conscientiousness INTEGER CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion INTEGER CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness INTEGER CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism INTEGER CHECK (neuroticism BETWEEN 0 AND 100),
  jung_functions JSONB NOT NULL DEFAULT '{}',
  archetype TEXT CHECK (archetype IN ('hero','sage','explorer','creator','caregiver','rebel')),
  archetype_secondary TEXT,
  analysis_raw JSONB,  -- 30-day retention (ADR-019)
  input_mode TEXT CHECK (input_mode IN ('guided','freetext')),
  input_texts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, version)
);

ALTER TABLE public.psychological_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "psych_profiles_all_own" ON public.psychological_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_psych_profiles_user ON public.psychological_profiles(user_id);
```

#### `narratives`
```sql
CREATE TABLE public.narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "narratives_all_own" ON public.narratives
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_narratives_user ON public.narratives(user_id);
```

#### `conversations`
```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),  -- Added in Migration 002
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_all_own" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_conversations_activity ON public.conversations(last_activity_at);
```

#### `messages`
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_all_own" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
```

#### `development_plans`
```sql
CREATE TABLE public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  areas JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_all_own" ON public.development_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_plans_user ON public.development_plans(user_id);
```

### From Migration 002 (Phase 1.5.6)

#### `consent_records` (Ley 25.326 audit trail)
```sql
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT NOT NULL,           -- HMAC(ip, CONSENT_IP_PEPPER_V1)
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  user_agent TEXT
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consent_select_own" ON public.consent_records
  FOR SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies — service_role only (immutable audit trail)
```

#### `crisis_events` (chat safety audit trail, 30-day retention)
```sql
CREATE TABLE public.crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,           -- HMAC(user_id, CRISIS_PEPPER_V1)
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT CHECK (severity IN ('low','med','high','classifier_error','sampling')),
  regex_hits JSONB,
  classifier_response JSONB,
  message_hash TEXT                  -- HMAC(message, CRISIS_PEPPER_V1)
);

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
-- NO user-level policy — service_role only
-- Nightly cron purges rows older than 30 days
```

#### `rate_limits` (per-user daily token budget)
```sql
CREATE TABLE public.rate_limits (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd_cents INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_select_own" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);
-- Writes via service_role through charge_rate_limit RPC
```

#### `research_dataset` (Branch A only — pseudonymized)
```sql
CREATE TABLE public.research_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,           -- HMAC(user_id, RESEARCH_PEPPER_V1)
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  input_text TEXT NOT NULL,
  generated_profile JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_user_hash ON public.research_dataset(user_hash);
ALTER TABLE public.research_dataset ENABLE ROW LEVEL SECURITY;
-- NO user-level policy — service_role only
```

#### `future_letters` (carta al futuro)
```sql
CREATE TABLE public.future_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  profile_snapshot_id UUID REFERENCES public.psychological_profiles(id),
  written_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "future_letters_all_own" ON public.future_letters
  FOR ALL USING (auth.uid() = user_id);
```

#### `delete_confirmations` (magic-link delete flow)
```sql
CREATE TABLE public.delete_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,         -- HMAC(raw_token, DELETE_TOKEN_PEPPER_V1)
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- NOW() + 5 min
  used_at TIMESTAMPTZ               -- NULL until consumed; single-use
);

ALTER TABLE public.delete_confirmations ENABLE ROW LEVEL SECURITY;
-- NO user-level policy — service_role only
```

#### `evidence_highlights` (Pass 2 persisted per eng review E4)
```sql
CREATE TABLE public.evidence_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.psychological_profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evidence_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence_select_own" ON public.evidence_highlights
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.psychological_profiles WHERE user_id = auth.uid())
  );

CREATE INDEX idx_evidence_profile ON public.evidence_highlights(profile_id);
```

## SQL Functions (Migration 002)

### `charge_rate_limit` (atomic check + charge)

See full definition in [ceo-plan E2](../../../.gstack/projects/Umbra/ceo-plans/2026-04-12-umbra-full-project.md). Key characteristics:
- `SECURITY DEFINER` with `SET search_path = public, pg_temp` (ADR hardening)
- Atomic `INSERT ON CONFLICT DO NOTHING` then `SELECT ... FOR UPDATE` then conditional `UPDATE`
- Returns `{ allowed, remaining_tokens, remaining_cost_cents }`
- Revoke public execute, grant only to `service_role`

### `reconcile_rate_limit` (finally-block cleanup)

Called in `finally` block of every Edge route after Claude call (success OR error). Adjusts the charge by `actual - estimated` per token type and cost.

### `handle_new_user` (trigger for auth.users insert)

Creates a `profiles` row automatically when a new auth user signs up. Uses `SECURITY DEFINER` + `SET search_path` for safety.

### Nightly purge jobs (Supabase cron)

```sql
-- crisis_events 30-day purge
SELECT cron.schedule(
  'purge-crisis-events',
  '0 3 * * *',  -- 3 AM UTC daily
  $$DELETE FROM public.crisis_events WHERE created_at < NOW() - INTERVAL '30 days'$$
);

-- analysis_raw 30-day purge (ADR-019)
SELECT cron.schedule(
  'purge-analysis-raw',
  '0 4 * * *',
  $$UPDATE public.psychological_profiles
    SET analysis_raw = NULL
    WHERE created_at < NOW() - INTERVAL '30 days' AND analysis_raw IS NOT NULL$$
);

-- delete_confirmations expired cleanup
SELECT cron.schedule(
  'purge-expired-delete-tokens',
  '0 5 * * *',
  $$DELETE FROM public.delete_confirmations
    WHERE expires_at < NOW() OR used_at IS NOT NULL$$
);
```

## Delete cascade order (for `/api/account/delete/confirm`)

When a user confirms account deletion, the route executes this cascade in a
single transaction. Order matters because of FK constraints:

1. `messages` (via `conversations.id` FK cascade)
2. `conversations` (via `user_id` FK cascade)
3. `crisis_events` (lookup by recomputed `user_hash`, service_role delete)
4. `narratives`
5. `future_letters`
6. `evidence_highlights` (cascades from `psychological_profiles.id` FK)
7. `rate_limits`
8. `delete_confirmations` (all rows for this user)
9. `psychological_profiles`
10. `consent_records`
11. IF `purgeResearch=true`: `research_dataset` (recompute `user_hash` with `RESEARCH_PEPPER_V1`, delete)
12. `profiles` (parent — most FKs cascade from here)
13. `auth.users` (top-level — handled by Supabase admin API)

Wrapped in `BEGIN; ... COMMIT;`. If any step fails, `ROLLBACK` and return 500.

## Indexes summary

| Index | Table | Columns | Why |
|---|---|---|---|
| (PK) | `profiles` | `id` | FK target |
| `idx_psych_profiles_user` | `psychological_profiles` | `user_id` | RLS policy lookup |
| `idx_narratives_user` | `narratives` | `user_id` | RLS + dashboard queries |
| `idx_conversations_user` | `conversations` | `user_id` | RLS |
| `idx_conversations_activity` | `conversations` | `last_activity_at` | session timeout checks |
| `idx_messages_conversation` | `messages` | `conversation_id` | thread fetch |
| `idx_plans_user` | `development_plans` | `user_id` | RLS |
| `idx_research_user_hash` | `research_dataset` | `user_hash` | export lookup, delete purge |
| `idx_evidence_profile` | `evidence_highlights` | `profile_id` | dashboard lazy load |
| (PK) | `rate_limits` | `(user_id, day)` | atomic upsert |
| `idx_future_letters_user` | `future_letters` | `user_id` | dashboard lookup |

## Backup + disaster recovery

- Supabase automatic daily backups (7-day retention on free tier)
- Point-in-time recovery on paid tiers (not in scope for TFG)
- Manual export via `pg_dump` before major migrations (recommended)
- Tested rollback script for Migration 002: `002_core_tables.down.sql`

## Storage estimates (per active user)

| Content | Typical size |
|---|---|
| `profiles` row | ~200 bytes |
| `psychological_profiles` row (with analysis_raw) | ~6 KB (shrinks to ~500 bytes after 30-day purge) |
| `narratives.content` | ~6 KB per narrative |
| `conversations` + `messages` (per 10-msg chat) | ~3 KB |
| `development_plans.areas` JSONB | ~2 KB |
| `future_letters.content` | ~1 KB |
| `consent_records` | ~300 bytes |

**Avg user with 5 chat conversations, 1 profile, 1 plan**: ~25 KB on Supabase.
**500 users**: ~12 MB. Well within free tier.

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — system topology
- [AUTH.md](AUTH.md) — Supabase SSR + middleware
- [RATE_LIMITING.md](RATE_LIMITING.md) — charge_rate_limit RPC deep-dive
- [SECURITY.md](SECURITY.md) — peppers, RLS, threat model
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_core_tables.sql` (Phase 1.5.6)
- [API_MAP.md](../API_MAP.md) — routes that touch each table

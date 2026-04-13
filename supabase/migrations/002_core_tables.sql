-- ═══════════════════════════════════════════════════════════════
-- UMBRA — Migration 002: Expansion scope tables + RPCs
-- ═══════════════════════════════════════════════════════════════
-- Ships after Phase 0 (Ethics Gate). Branch A (ethics cleared) includes
-- research_dataset + profiles.research_opt_in. Branch B omits them.
--
-- This file is Branch A. For Branch B, comment out the research_dataset
-- table and the profiles.research_opt_in ALTER below.
--
-- References:
-- - docs/DECISIONS.md ADR-004 through ADR-022
-- - docs/tech/DATABASE.md
-- - docs/tech/SECURITY.md
-- ═══════════════════════════════════════════════════════════════

-- ═══ Forward-compat columns on existing tables ═══
ALTER TABLE public.psychological_profiles
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.psychological_profiles
  DROP CONSTRAINT IF EXISTS psychological_profiles_user_id_key;
ALTER TABLE public.psychological_profiles
  ADD CONSTRAINT psychological_profiles_user_id_version_key
  UNIQUE (user_id, version);

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_conversations_activity
  ON public.conversations(last_activity_at);

-- Branch A only: research opt-in column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS research_opt_in BOOLEAN DEFAULT FALSE;

-- ═══ consent_records — Ley 25.326 audit trail ═══
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT NOT NULL,
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  user_agent TEXT
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_select_own" ON public.consent_records;
CREATE POLICY "consent_select_own" ON public.consent_records
  FOR SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies — service_role only (immutable audit).

-- ═══ crisis_events — chat safety audit trail (30-day retention) ═══
CREATE TABLE IF NOT EXISTS public.crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT CHECK (severity IN ('low','med','high','classifier_error','sampling')),
  regex_hits JSONB,
  classifier_response JSONB,
  message_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_crisis_events_user_hash
  ON public.crisis_events(user_hash);
CREATE INDEX IF NOT EXISTS idx_crisis_events_created_at
  ON public.crisis_events(created_at);

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
-- No user-level policies — service_role only.

-- ═══ rate_limits — per-user daily token budget ═══
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd_cents INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rate_limits_select_own" ON public.rate_limits;
CREATE POLICY "rate_limits_select_own" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);
-- Writes via service_role through charge_rate_limit RPC.

-- ═══ research_dataset — Branch A only, pseudonymized ═══
-- IMPORTANT: pseudonymization, not anonymization. An admin with both
-- RESEARCH_PEPPER and the raw user_id list can re-link rows. Consent text
-- discloses this honestly. See ADR-013 and docs/biz/LEGAL.md.
CREATE TABLE IF NOT EXISTS public.research_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  input_text TEXT NOT NULL,
  generated_profile JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_user_hash
  ON public.research_dataset(user_hash);

ALTER TABLE public.research_dataset ENABLE ROW LEVEL SECURITY;
-- No user-level policies — service_role only.

-- ═══ future_letters — carta al vos del futuro ═══
CREATE TABLE IF NOT EXISTS public.future_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  profile_snapshot_id UUID REFERENCES public.psychological_profiles(id),
  written_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_future_letters_user
  ON public.future_letters(user_id);

ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "future_letters_all_own" ON public.future_letters;
CREATE POLICY "future_letters_all_own" ON public.future_letters
  FOR ALL USING (auth.uid() = user_id);

-- ═══ delete_confirmations — magic link tokens (5-min TTL, single-use) ═══
CREATE TABLE IF NOT EXISTS public.delete_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_delete_confirmations_token
  ON public.delete_confirmations(token_hash);
CREATE INDEX IF NOT EXISTS idx_delete_confirmations_user
  ON public.delete_confirmations(user_id);

ALTER TABLE public.delete_confirmations ENABLE ROW LEVEL SECURITY;
-- service_role only.

-- ═══ evidence_highlights — Pass 2 persisted ═══
CREATE TABLE IF NOT EXISTS public.evidence_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.psychological_profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_profile
  ON public.evidence_highlights(profile_id);

ALTER TABLE public.evidence_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evidence_select_own" ON public.evidence_highlights;
CREATE POLICY "evidence_select_own" ON public.evidence_highlights
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.psychological_profiles WHERE user_id = auth.uid()
    )
  );

-- ═══ RPC: charge_rate_limit (atomic check + charge) ═══
-- Called BEFORE each Claude API call by Edge routes.
-- Uses SELECT FOR UPDATE for atomicity under concurrent requests.
-- SET search_path hardening prevents search_path injection (ADR from eng review).
CREATE OR REPLACE FUNCTION public.charge_rate_limit(
  p_user_id UUID,
  p_day DATE,
  p_est_input INTEGER,
  p_est_output INTEGER,
  p_est_cost_cents INTEGER,
  p_daily_token_cap INTEGER,
  p_daily_cost_cap_cents INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining_tokens INTEGER, remaining_cost_cents INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_input INTEGER;
  v_current_output INTEGER;
  v_current_cost INTEGER;
BEGIN
  INSERT INTO public.rate_limits (user_id, day, input_tokens, output_tokens, cost_usd_cents)
  VALUES (p_user_id, p_day, 0, 0, 0)
  ON CONFLICT (user_id, day) DO NOTHING;

  SELECT input_tokens, output_tokens, cost_usd_cents
    INTO v_current_input, v_current_output, v_current_cost
  FROM public.rate_limits
  WHERE user_id = p_user_id AND day = p_day
  FOR UPDATE;

  IF (v_current_input + v_current_output + p_est_input + p_est_output) > p_daily_token_cap
     OR (v_current_cost + p_est_cost_cents) > p_daily_cost_cap_cents THEN
    RETURN QUERY SELECT
      FALSE,
      p_daily_token_cap - v_current_input - v_current_output,
      p_daily_cost_cap_cents - v_current_cost;
    RETURN;
  END IF;

  UPDATE public.rate_limits
    SET input_tokens = input_tokens + p_est_input,
        output_tokens = output_tokens + p_est_output,
        cost_usd_cents = cost_usd_cents + p_est_cost_cents
  WHERE user_id = p_user_id AND day = p_day;

  RETURN QUERY SELECT
    TRUE,
    p_daily_token_cap - v_current_input - v_current_output - p_est_input - p_est_output,
    p_daily_cost_cap_cents - v_current_cost - p_est_cost_cents;
END;
$$;

REVOKE ALL ON FUNCTION public.charge_rate_limit FROM public;
GRANT EXECUTE ON FUNCTION public.charge_rate_limit TO service_role;

-- ═══ RPC: reconcile_rate_limit (finally-block cleanup) ═══
CREATE OR REPLACE FUNCTION public.reconcile_rate_limit(
  p_user_id UUID,
  p_day DATE,
  p_actual_input INTEGER,
  p_actual_output INTEGER,
  p_estimated_input INTEGER,
  p_estimated_output INTEGER,
  p_actual_cost_cents INTEGER,
  p_estimated_cost_cents INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.rate_limits
    SET input_tokens = input_tokens + (p_actual_input - p_estimated_input),
        output_tokens = output_tokens + (p_actual_output - p_estimated_output),
        cost_usd_cents = cost_usd_cents + (p_actual_cost_cents - p_estimated_cost_cents)
  WHERE user_id = p_user_id AND day = p_day;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_rate_limit FROM public;
GRANT EXECUTE ON FUNCTION public.reconcile_rate_limit TO service_role;

-- ═══ Nightly purges (Supabase cron) ═══
-- These run via Supabase's pg_cron extension. Enable with:
--   SELECT cron.schedule('name','cron','sql');
-- Keep commented until pg_cron is available in your Supabase plan.
--
-- SELECT cron.schedule(
--   'purge-crisis-events',
--   '0 3 * * *',
--   $$DELETE FROM public.crisis_events WHERE created_at < NOW() - INTERVAL '30 days'$$
-- );
--
-- SELECT cron.schedule(
--   'purge-analysis-raw',
--   '0 4 * * *',
--   $$UPDATE public.psychological_profiles
--     SET analysis_raw = NULL
--     WHERE created_at < NOW() - INTERVAL '30 days' AND analysis_raw IS NOT NULL$$
-- );
--
-- SELECT cron.schedule(
--   'purge-expired-delete-tokens',
--   '0 5 * * *',
--   $$DELETE FROM public.delete_confirmations
--     WHERE expires_at < NOW() OR used_at IS NOT NULL$$
-- );

-- ═══════════════════════════════════════════════════════════════
-- UMBRA — Migration 003: onboarding_sessions (dynamic flow)
-- ═══════════════════════════════════════════════════════════════
-- Persists the dynamic adaptive onboarding conversation so it can
-- resume on refresh, be queried for telemetry (drop-off by turn,
-- conductor-vs-analyzer drift), and keeps each /api/onboarding/next
-- request small (just a sessionId + previous answer).
--
-- References:
-- - docs/DECISIONS.md (dynamic onboarding spec)
-- - /Users/matiasvelez/.claude/plans/spicy-herding-boot.md
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  turns JSONB NOT NULL DEFAULT '[]'::jsonb,
  working_profile JSONB NOT NULL,
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user
  ON public.onboarding_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_in_progress
  ON public.onboarding_sessions(user_id, status)
  WHERE status = 'in_progress';

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_sessions_select_own"
  ON public.onboarding_sessions;
CREATE POLICY "onboarding_sessions_select_own"
  ON public.onboarding_sessions
  FOR SELECT USING (auth.uid() = user_id);
-- Writes go through service_role only (/api/onboarding/next uses
-- createEdgeServiceClient). No INSERT/UPDATE/DELETE policies.

-- ═══════════════════════════════════════════════════════════════
-- Widen psychological_profiles.input_mode to allow the new
-- 'dynamic' mode emitted by the conductor. Prior values were
-- 'guided' / 'freetext' from the pre-refactor onboarding, kept
-- here as a historical allowlist so old rows stay valid.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.psychological_profiles
  DROP CONSTRAINT IF EXISTS psychological_profiles_input_mode_check;

ALTER TABLE public.psychological_profiles
  ADD CONSTRAINT psychological_profiles_input_mode_check
  CHECK (input_mode IN ('guided', 'freetext', 'dynamic'));

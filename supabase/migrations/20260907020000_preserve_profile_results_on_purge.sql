-- Keep user-facing results when technical analysis payloads expire.
-- This supersedes the job in 006 without changing its historical migration.
CREATE OR REPLACE FUNCTION public.retained_profile_results(payload jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT NULLIF(
    jsonb_strip_nulls(jsonb_build_object(
      'selfReport', payload -> 'selfReport',
      'ml', payload -> 'ml'
    )),
    '{}'::jsonb
  );
$$;

COMMENT ON FUNCTION public.retained_profile_results(jsonb) IS
  'Preserves the optional questionnaire and ML provenance, not raw generated text.';

DO $$
BEGIN
  -- Keep the migration installable where scheduled jobs are unavailable.
  -- Such environments must run the documented maintenance statement themselves.
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'purge-analysis-raw',
      '0 4 * * *',
      $job$UPDATE public.psychological_profiles
        SET analysis_raw = public.retained_profile_results(analysis_raw)
        WHERE updated_at < NOW() - INTERVAL '30 days'
          AND analysis_raw IS DISTINCT FROM public.retained_profile_results(analysis_raw)$job$
    );
  END IF;
END;
$$;

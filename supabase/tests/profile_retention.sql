-- Run only in the isolated synthetic database created by test-profile-retention.sh.
\set ON_ERROR_STOP on
CREATE TABLE public.psychological_profiles (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  analysis_raw jsonb
);
\ir ../migrations/20260907020000_preserve_profile_results_on_purge.sql

INSERT INTO public.psychological_profiles VALUES
  ('fresh-questionnaire', now()-interval '90 days', now(), '{"selfReport":{"answers":[3,4]},"reasoning":"recent"}'),
  ('old-complete', now()-interval '90 days', now()-interval '40 days', '{"selfReport":{"answers":[2,5]},"ml":{"modelVersion":"ridge_v1","perDimensionStatus":{"openness":"low_confidence"}},"reasoning":"expired"}'),
  ('old-raw-only', now()-interval '90 days', now()-interval '40 days', '{"reasoning":"expired"}'),
  ('no-payload', now()-interval '90 days', now()-interval '40 days', NULL);

UPDATE public.psychological_profiles
SET analysis_raw = public.retained_profile_results(analysis_raw)
WHERE updated_at < NOW() - INTERVAL '30 days'
  AND analysis_raw IS DISTINCT FROM public.retained_profile_results(analysis_raw);

DO $$
BEGIN
  IF (SELECT analysis_raw->>'reasoning' FROM public.psychological_profiles WHERE id='fresh-questionnaire') IS DISTINCT FROM 'recent' THEN
    RAISE EXCEPTION 'A recent profile update was purged';
  END IF;
  IF (SELECT analysis_raw->'selfReport' FROM public.psychological_profiles WHERE id='old-complete') IS DISTINCT FROM '{"answers":[2,5]}'::jsonb THEN
    RAISE EXCEPTION 'Questionnaire responses were lost';
  END IF;
  IF (SELECT analysis_raw->'ml'->'perDimensionStatus'->>'openness' FROM public.psychological_profiles WHERE id='old-complete') IS DISTINCT FROM 'low_confidence' THEN
    RAISE EXCEPTION 'ML provenance was lost';
  END IF;
  IF EXISTS (SELECT FROM public.psychological_profiles WHERE id='old-complete' AND analysis_raw ? 'reasoning') THEN
    RAISE EXCEPTION 'Expired raw content was retained';
  END IF;
  IF EXISTS (SELECT FROM public.psychological_profiles WHERE id IN ('old-raw-only','no-payload') AND analysis_raw IS NOT NULL) THEN
    RAISE EXCEPTION 'Empty retained payload must be SQL NULL';
  END IF;
  IF EXISTS (SELECT FROM public.psychological_profiles WHERE updated_at < now()-interval '30 days' AND analysis_raw IS DISTINCT FROM public.retained_profile_results(analysis_raw)) THEN
    RAISE EXCEPTION 'Maintenance is not idempotent';
  END IF;
END;
$$;

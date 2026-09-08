-- The required acceptance and optional research choice are one atomic save.
-- Local migration proposal: apply only in an explicitly authorized environment.
-- Historical consent rows and the v1 text are never rewritten.
CREATE OR REPLACE FUNCTION public.record_consent_atomic(
  p_user_id UUID,
  p_consent_version TEXT,
  p_consent_text_hash TEXT,
  p_locale TEXT,
  p_ip_hash TEXT,
  p_pepper_version SMALLINT,
  p_user_agent TEXT,
  p_research_opt_in BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE consent_id UUID;
BEGIN
  IF p_research_opt_in IS NULL THEN
    RAISE EXCEPTION 'research_preference_required';
  END IF;

  UPDATE public.profiles
    SET research_opt_in = p_research_opt_in, updated_at = NOW()
    WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'consent_profile_not_found';
  END IF;

  INSERT INTO public.consent_records (
    user_id, consent_version, consent_text_hash, locale,
    ip_hash, pepper_version, user_agent
  ) VALUES (
    p_user_id, p_consent_version, p_consent_text_hash, p_locale,
    p_ip_hash, p_pepper_version, p_user_agent
  ) RETURNING id INTO consent_id;

  RETURN consent_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_consent_atomic(UUID,TEXT,TEXT,TEXT,TEXT,SMALLINT,TEXT,BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_consent_atomic(UUID,TEXT,TEXT,TEXT,TEXT,SMALLINT,TEXT,BOOLEAN) TO service_role;

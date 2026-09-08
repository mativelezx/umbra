-- Run only through test-atomic-local.sh, which creates an isolated local cluster.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb, email text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
\ir ../../supabase/migrations/001_initial_schema.sql
\ir ../../supabase/migrations/002_core_tables.sql
\ir ../../supabase/migrations/004_consent_text_hash.sql
\ir ../../supabase/migrations/20260907010000_record_consent_atomic.sql

CREATE FUNCTION public.test_assert(p_ok boolean, p_message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF p_ok IS DISTINCT FROM TRUE THEN RAISE EXCEPTION '%', p_message; END IF; END $$;
INSERT INTO auth.users VALUES ('00000000-0000-4000-8000-000000000001', '{}', 'synthetic@example.invalid');
INSERT INTO public.consent_records (user_id, consent_version, consent_text_hash, ip_hash)
VALUES ('00000000-0000-4000-8000-000000000001', 'historical-v1', 'historical-hash', 'synthetic-hash');
UPDATE public.profiles SET research_opt_in = true;

CREATE FUNCTION public.fail_consent_write() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('umbra_test.fail', true) = TG_ARGV[0] THEN RAISE EXCEPTION 'synthetic_write_failure'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER test_update BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.fail_consent_write('update');
CREATE TRIGGER test_insert BEFORE INSERT ON public.consent_records FOR EACH ROW EXECUTE FUNCTION public.fail_consent_write('insert');

-- Failure at either statement must preserve both old state and immutable history.
DO $$
DECLARE stage text;
BEGIN
  FOREACH stage IN ARRAY ARRAY['update', 'insert'] LOOP
    PERFORM set_config('umbra_test.fail', stage, false);
    BEGIN
      PERFORM public.record_consent_atomic('00000000-0000-4000-8000-000000000001', '2026-09-07-v2', repeat('a', 64), 'es-AR', 'synthetic-hash', 1::smallint, 'test', false);
      RAISE EXCEPTION 'expected failure missing';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM <> 'synthetic_write_failure' THEN RAISE; END IF;
    END;
    PERFORM public.test_assert((SELECT research_opt_in FROM public.profiles), 'preference changed after failure');
    PERFORM public.test_assert((SELECT count(*) = 1 FROM public.consent_records), 'acceptance survived failed operation');
  END LOOP;
END $$;
SELECT set_config('umbra_test.fail', '', false);

-- Retry succeeds, exact false replaces prior true, and historical text stays intact.
SET ROLE service_role;
SELECT public.record_consent_atomic('00000000-0000-4000-8000-000000000001', '2026-09-07-v2', repeat('a', 64), 'es-AR', 'synthetic-hash', 1::smallint, 'test', false);
RESET ROLE;
SELECT public.test_assert((SELECT NOT research_opt_in FROM public.profiles), 'false preference not saved');
SELECT public.test_assert((SELECT count(*) = 2 FROM public.consent_records), 'retry did not save acceptance');
SELECT public.test_assert((SELECT consent_text_hash = 'historical-hash' FROM public.consent_records WHERE consent_version = 'historical-v1'), 'historical consent changed');

-- Explicit opt-in is saved together with a new acceptance; repeated submissions stay consistent.
SELECT public.record_consent_atomic('00000000-0000-4000-8000-000000000001', '2026-09-07-v2', repeat('a', 64), 'es-AR', 'synthetic-hash', 1::smallint, 'test', true);
SELECT public.record_consent_atomic('00000000-0000-4000-8000-000000000001', '2026-09-07-v2', repeat('a', 64), 'es-AR', 'synthetic-hash', 1::smallint, 'test', true);
SELECT public.test_assert((SELECT research_opt_in FROM public.profiles), 'true preference not saved');
SELECT public.test_assert((SELECT count(*) = 4 FROM public.consent_records), 'repeated explicit acceptances missing');
SELECT public.test_assert(NOT has_function_privilege('anon', 'public.record_consent_atomic(uuid,text,text,text,text,smallint,text,boolean)', 'EXECUTE'), 'anon can execute privileged RPC');
SELECT public.test_assert(NOT has_function_privilege('authenticated', 'public.record_consent_atomic(uuid,text,text,text,text,smallint,text,boolean)', 'EXECUTE'), 'authenticated can execute privileged RPC');
SELECT 'Atomic consent: statement failures, rollback, retry, false/true, history, repeat and role grants passed' AS result;

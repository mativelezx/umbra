-- ════════════════════════════════════════════════════════════════════
-- Migration 004 — Consent Ley 25.326 integrity patch
-- ════════════════════════════════════════════════════════════════════
--
-- Adds consent_text_hash (SHA-256 of the consent text verbatim) and
-- locale (BCP-47) to consent_records for full auditability under
-- Ley 25.326 de Protección de Datos Personales (Argentina), específicamente:
--
--   Art. 5 — El tratamiento de datos personales requiere consentimiento
--            libre, expreso e informado.
--   Art. 7 — Los datos sensibles (incluyendo los relativos a salud) solo
--            pueden ser tratados con consentimiento expreso por escrito
--            o por otro medio equivalente que permita su verificación
--            posterior.
--
-- Background (ADR-024 en docs/DECISIONS.md): the original migration 002
-- schema only stored `consent_version TEXT`, which is insufficient to
-- prove WHAT exactly the user saw at time T if the text of version "v1"
-- is later edited (even for a typo fix). With `consent_text_hash` we
-- can store a SHA-256 of the exact rendered text and verify it against
-- a versioned file in `content/consent/<version>-<locale>.md`. Adding
-- `locale` makes the schema ready for multi-idioma futuro if i18n is
-- introduced later.
--
-- Backfill policy: rows created before this migration get empty string
-- for `consent_text_hash` and 'es-AR' as `locale`. These pre-migration
-- rows are auditable only by `consent_version` and are documented as
-- such in biz/LEGAL.md.
--
-- Integrity pattern: the repo keeps versioned consent text files under
-- `content/consent/<version>-<locale>.md`. A CI test hashes each file
-- with SHA-256 and asserts that the expected hash is what the consent
-- page sends at runtime. This prevents drift between displayed text and
-- archived file.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS consent_text_hash TEXT NOT NULL DEFAULT '';

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'es-AR';

-- Index on (consent_version, locale) for fast audit queries: "what did
-- all es-AR v1 users see?" → count rows grouped by consent_text_hash.
CREATE INDEX IF NOT EXISTS idx_consent_records_version_locale
  ON public.consent_records(consent_version, locale);

COMMENT ON COLUMN public.consent_records.consent_text_hash IS
  'SHA-256 del texto de consentimiento verbatim renderizado al usuario. Ley 25.326 art. 7 — permite verificación posterior de contenido del consentimiento. Backfill: '''' para registros pre-migration 004.';

COMMENT ON COLUMN public.consent_records.locale IS
  'BCP-47 locale (es-AR, en, etc.) del texto de consentimiento. Backfill: ''es-AR'' para registros pre-migration 004.';

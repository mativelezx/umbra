-- ═══════════════════════════════════════════════════════════════════
-- Migration 006 — Habilitar pg_cron + scheduled purges (ADR-019)
--
-- Cumple con la promesa de retención del consent text: 30 días para
-- crisis_events y analysis_raw, y limpieza inmediata de tokens de
-- borrado expirados o consumidos.
--
-- Requiere plan de Supabase con pg_cron habilitado (Pro o Team).
-- En proyectos Free, comentar los SELECT cron.schedule() y aplicar
-- manualmente cuando se upgradee.
-- ═══════════════════════════════════════════════════════════════════

-- Habilitar la extensión pg_cron (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Permitir al rol postgres llamar al schema cron en consultas (Supabase
-- gestiona el rol postgres con privilegios para esto).

-- ─── 1. Purge crisis_events older than 30 days (ADR-008) ───
-- Corre todos los días a las 03:00 UTC.
-- Idempotente: el `cron.schedule()` reemplaza si el job ya existe con
-- el mismo nombre.
SELECT cron.schedule(
  'purge-crisis-events',
  '0 3 * * *',
  $$DELETE FROM public.crisis_events
    WHERE created_at < NOW() - INTERVAL '30 days'$$
);

-- ─── 2. Purge analysis_raw payloads older than 30 days (ADR-019) ───
-- El profile sigue existiendo (Big Five, Jung, archetype). Solo se
-- borra el payload completo de Claude que se guardaba para debug.
SELECT cron.schedule(
  'purge-analysis-raw',
  '0 4 * * *',
  $$UPDATE public.psychological_profiles
    SET analysis_raw = NULL
    WHERE created_at < NOW() - INTERVAL '30 days'
      AND analysis_raw IS NOT NULL$$
);

-- ─── 3. Purge delete tokens expirados o ya usados ───
-- Tokens de magic link de borrado: TTL 5 min + single use. Limpiar
-- cualquier registro vencido o consumido.
SELECT cron.schedule(
  'purge-expired-delete-tokens',
  '0 5 * * *',
  $$DELETE FROM public.delete_confirmations
    WHERE expires_at < NOW() OR used_at IS NOT NULL$$
);

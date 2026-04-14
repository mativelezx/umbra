-- supabase/migrations/005_usability_responses.sql

-- ════════════════════════════════════════════════════════════════════
-- Migration 005 — In-app usability / research instrumentation
-- ════════════════════════════════════════════════════════════════════
--
-- Opt-in research responses for UMUX-Lite, METUX, CUQ y SUS.
-- Rows stay linked to the authenticated user account (`user_id`) so they
-- remain exportable / deletable under the existing account-data flows.
-- If these rows are later copied into a pseudonymized research dataset,
-- `pepper_version` documents which pepper version was active at capture time.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.usability_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instrument TEXT NOT NULL CHECK (
    instrument IN (
      'umux_lite',
      'metux_autonomy',
      'metux_competence',
      'metux_relatedness',
      'cuq',
      'sus'
    )
  ),
  item_key TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 7),
  free_text TEXT,
  shown_at TIMESTAMPTZ NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pepper_version SMALLINT NOT NULL DEFAULT 1
);

ALTER TABLE public.usability_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usability_select_own" ON public.usability_responses;
CREATE POLICY "usability_select_own" ON public.usability_responses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usability_insert_own" ON public.usability_responses;
CREATE POLICY "usability_insert_own" ON public.usability_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usability_responses_user_instrument_answered_at
  ON public.usability_responses(user_id, instrument, answered_at DESC);

COMMENT ON TABLE public.usability_responses IS
  'Respuestas opt-in de investigación de usabilidad capturadas dentro de Umbra (UMUX-Lite, METUX, CUQ, SUS).';

COMMENT ON COLUMN public.usability_responses.id IS
  'Identificador único de la respuesta individual.';

COMMENT ON COLUMN public.usability_responses.user_id IS
  'Usuario autenticado que respondió el ítem. FK a public.profiles(id).';

COMMENT ON COLUMN public.usability_responses.instrument IS
  'Instrumento o subescala a la que pertenece el ítem: umux_lite, metux_autonomy, metux_competence, metux_relatedness, cuq o sus.';

COMMENT ON COLUMN public.usability_responses.item_key IS
  'Clave estable del ítem dentro del instrumento, útil para scoring y análisis longitudinal.';

COMMENT ON COLUMN public.usability_responses.score IS
  'Puntaje Likert de 1 a 7 enviado por la persona usuaria para ese ítem.';

COMMENT ON COLUMN public.usability_responses.free_text IS
  'Comentario opcional asociado al ítem. Puede ser NULL.';

COMMENT ON COLUMN public.usability_responses.shown_at IS
  'Timestamp en que el instrumento fue mostrado dentro de la interfaz.';

COMMENT ON COLUMN public.usability_responses.answered_at IS
  'Timestamp en que la persona envió la respuesta. Default NOW().';

COMMENT ON COLUMN public.usability_responses.pepper_version IS
  'Versión del pepper vigente al registrar la fila para trazabilidad si luego se deriva a datasets seudonimizados.';

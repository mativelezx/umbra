/**
 * @deprecated DESDE 2026-04-27 (pivot ML, ADR-002 v2 + ADR-026).
 *
 * Este archivo era el Pass 1 monolítico que pedía a Claude inferir
 * Big Five + Jung + arquetipo + razonamiento en una sola llamada.
 * Esa arquitectura quedó descontinuada cuando el TFG entregado pivotó
 * a un módulo ML propio para Big Five (DistilBERT congelado + Ridge
 * multi-output) y delegó solo Jung + arquetipo + razonamiento a
 * Claude como **lectura interpretativa** (Pass 1.5).
 *
 * Reemplazos:
 * - Inferencia Big Five → `lib/ml-client.ts` (`inferBigFive`).
 * - Lectura interpretativa Jung + arquetipo + razonamiento →
 *   `lib/prompts/interpret-narrative.ts` (`buildInterpretNarrativePrompt`).
 *
 * Este wrapper se mantiene SOLO para preservar la firma `buildAnalyzeProfilePrompt`
 * por si algún test legacy o eval lo importa. Internamente ahora arroja
 * un error explícito en runtime para evitar uso accidental.
 *
 * Si el import aparece en código vivo, migrar a `interpret-narrative.ts`.
 */

import type { BigFive } from '@/types';

export interface AnalyzeProfileParams {
  texts: string[];
  mode: 'dynamic';
  areas?: string[];
}

/**
 * @deprecated Usar `inferBigFive()` + `buildInterpretNarrativePrompt()`.
 */
export function buildAnalyzeProfilePrompt(_params: AnalyzeProfileParams): {
  system: string;
  prompt: string;
} {
  throw new Error(
    'buildAnalyzeProfilePrompt está descontinuado desde el pivot ML (2026-04-27, ADR-002 v2 + ADR-026). ' +
      'Migrar a inferBigFive() + buildInterpretNarrativePrompt(). ' +
      'Ver lib/ml-client.ts y lib/prompts/interpret-narrative.ts.',
  );
}

/**
 * Helper interno por si algún test eval legacy quiere construir un
 * objeto Big Five neutro como placeholder. Solo para escenarios de test.
 */
export function neutralBigFive(): BigFive {
  return {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };
}

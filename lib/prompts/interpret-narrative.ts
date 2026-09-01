import { buildJungBlock } from '@/lib/knowledge/jung-functions';
import { buildArchetypesBlock } from '@/lib/knowledge/archetypes';
import type { BigFive } from '@/types';

/**
 * Pass 1.5 — Lectura interpretativa (capa narrativa).
 *
 * Toma los Big Five inferidos por el módulo ML propio (ADR-026) y
 * delega a la capa narrativa la lectura interpretativa: funciones
 * cognitivas Jung, arquetipo Pearson y razonamiento citando evidencia
 * textual del usuario.
 *
 * Encuadre (ADR-002 + ADR-007): este prompt explicita que las funciones
 * cognitivas Jung y el arquetipo NO son mediciones psicométricas — son
 * lecturas interpretativas heurísticas derivadas de los Big Five
 * medidos por el módulo ML y de los textos del usuario.
 */

export interface InterpretNarrativeParams {
  texts: string[];
  areas?: string[];
  bigFive: BigFive;
  perDimensionStatus?: Record<keyof BigFive, 'ok' | 'low_confidence' | 'not_applicable'>;
}

const SYSTEM =
  'Sos un intérprete narrativo de perfiles psicológicos para Umbra, una plataforma argentina de autoconocimiento. Recibís puntuaciones Big Five medidas por un módulo de aprendizaje automático propio y producís lecturas interpretativas de funciones cognitivas (Jung 1921) y arquetipo (Pearson 1991). Estas lecturas son heurísticas y no diagnósticas, derivadas de los Big Five y de los textos del usuario. Tu output es JSON estricto, sin explicaciones adicionales. Español latinoamericano, voseo, sin lenguaje clínico.';

function formatPerDimStatus(
  status?: Record<keyof BigFive, 'ok' | 'low_confidence' | 'not_applicable'>,
): string {
  if (!status) return '';
  const low = Object.entries(status)
    .filter(([, s]) => s === 'low_confidence')
    .map(([k]) => k);
  const na = Object.entries(status)
    .filter(([, s]) => s === 'not_applicable')
    .map(([k]) => k);
  if (low.length === 0 && na.length === 0) return '';
  const parts: string[] = [];
  if (low.length)
    parts.push(
      `las dimensiones ${low.join(', ')} están por debajo de los umbrales de aceptación (baja confianza)`,
    );
  if (na.length)
    parts.push(
      `las dimensiones ${na.join(', ')} no tienen evaluación de clasificación aplicable`,
    );
  return `\n\n> Nota del módulo ML: ${parts.join('; ')}. NO cites los valores numéricos de esas dimensiones en tu lectura: usalos solo como señal orientativa interna y expresá lo que digas sobre ellas en términos cualitativos y con prudencia.`;
}

function buildBigFiveBlock(bf: BigFive): string {
  const fmt = (n: number) => Math.round(n);
  return [
    '## Big Five (medido por módulo ML propio — DistilBERT congelado + Ridge multi-output)',
    `- Apertura (openness): ${fmt(bf.openness)}/100`,
    `- Responsabilidad (conscientiousness): ${fmt(bf.conscientiousness)}/100`,
    `- Extraversión (extraversion): ${fmt(bf.extraversion)}/100`,
    `- Amabilidad (agreeableness): ${fmt(bf.agreeableness)}/100`,
    `- Estabilidad emocional invertida (neuroticism): ${fmt(bf.neuroticism)}/100`,
  ].join('\n');
}

const INSTRUCTIONS = `## Tarea

A partir del Big Five medido por el módulo ML propio y de los textos
introspectivos del usuario, producí una **lectura interpretativa** con:

### 1. Funciones cognitivas Jung (LECTURA INTERPRETATIVA)
Asigná un puntaje 0-100 a cada una de las 8 funciones (Se, Si, Ne, Ni,
Te, Ti, Fe, Fi) **inferido a partir de la combinación de Big Five y los
textos del usuario**. Identificá las dominantes (>65) y las en
desarrollo (<35).

> Importante: estos valores son una lectura interpretativa de la capa
> narrativa, NO una medición psicométrica. El sistema no infiere Jung
> automáticamente como dimensión propia (ADR-002 + ADR-007).

### 2. Arquetipo dominante (LECTURA INTERPRETATIVA)
Elegí UNO de: hero, sage, explorer, creator, caregiver, rebel.
Justificá la elección citando evidencia de los textos del usuario y de
la combinación Big Five.

### 3. Arquetipo secundario
El segundo arquetipo más resonante (nombre legible).

### 4. Confianza global de la lectura interpretativa
0-100. Indicá qué tan firme es la articulación entre Big Five medido y
la lectura Jung+arquetipo basada en los textos disponibles. Si los
textos son cortos o las dimensiones Big Five están en zona neutra
(40-60), bajá la confianza.

### 5. Razonamiento (LECTURA INTERPRETATIVA)
Breve (2-3 párrafos) en español latinoamericano con voseo. Cita evidencia
textual literal del usuario. NO uses lenguaje diagnóstico ni clínico.
Aclarás explícitamente que la lectura Jung+arquetipo es interpretativa
y no medición.

## Formato de respuesta (JSON estricto — solo el JSON)

{
  "jungFunctions": {
    "Se": <0-100>, "Si": <0-100>,
    "Ne": <0-100>, "Ni": <0-100>,
    "Te": <0-100>, "Ti": <0-100>,
    "Fe": <0-100>, "Fi": <0-100>
  },
  "archetype": "hero|sage|explorer|creator|caregiver|rebel",
  "archetypeSecondary": "<nombre del arquetipo secundario>",
  "confidence": <0-100>,
  "reasoning": "<lectura interpretativa, 2-3 párrafos, voseo, sin diagnóstico>"
}

## Reglas críticas
- NO inventes valores Big Five — los del módulo ML son la verdad de medida.
- NO uses lenguaje diagnóstico ("tiene síntomas de...", "sufre de...").
- NO uses términos MBTI (INFJ, INTP, etc.). Funciones de Jung directamente.
- Aclará en el reasoning que Jung y arquetipo son LECTURA INTERPRETATIVA.
- Español latinoamericano (voseo) en el reasoning.
- Devolvé SOLO el JSON, sin markdown, sin explicaciones previas.`;

export function buildInterpretNarrativePrompt(
  params: InterpretNarrativeParams,
): { system: string; prompt: string } {
  const { texts, areas, bigFive, perDimensionStatus } = params;

  const textBlock =
    areas && areas.length === texts.length
      ? areas.map((area, i) => `### ${area}\n${texts[i] ?? ''}`).join('\n\n')
      : texts.join('\n\n');

  const sections: string[] = [];

  sections.push(buildBigFiveBlock(bigFive) + formatPerDimStatus(perDimensionStatus));

  const jung = buildJungBlock();
  if (jung) {
    sections.push(`## Marco teórico — Funciones cognitivas Jung (insumo narrativo, no taxonomía de medición)\n\n${jung}`);
  }

  const archetypes = buildArchetypesBlock();
  if (archetypes) {
    sections.push(`## Marco teórico — Arquetipos Pearson aplicados (insumo narrativo, no medición)\n\n${archetypes}`);
  }

  sections.push(`## Textos introspectivos del usuario\n\n${textBlock}`);
  sections.push(INSTRUCTIONS);

  return {
    system: SYSTEM,
    prompt: sections.join('\n\n'),
  };
}

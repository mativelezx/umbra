/**
 * Parser that takes raw ChatGPT output (pasted by the user in the seed flow)
 * and extracts a structured Umbra WorkingProfile from it.
 *
 * Called by `/api/onboarding/seed`. The caller sends the raw paste to
 * Sonnet along with this prompt; Sonnet returns JSON that matches
 * `WorkingProfileSchema` shape, which becomes the starting state of the
 * onboarding session. The conductor then runs 2-3 refinement turns on top.
 *
 * We DON'T just trust whatever JSON ChatGPT returned verbatim — two reasons:
 * 1. ChatGPT may return malformed JSON, extra prose, or fields that don't
 *    match Umbra's schema.
 * 2. We want to extract *evidence quotes* from the prose part of the
 *    response, not just the numeric scores.
 */

export interface SeedParserParams {
  rawText: string;
}

const SYSTEM =
  'Sos un parser especializado en extraer perfiles psicológicos estructurados desde texto libre. Tu output es SIEMPRE JSON estricto que matchea el schema pedido. Sin preámbulo, sin explicaciones, sin markdown — solo el JSON.';

const SCHEMA = `{
  "bigFive": {
    "openness": { "value": 0-100, "confidence": 0-100 },
    "conscientiousness": { "value": 0-100, "confidence": 0-100 },
    "extraversion": { "value": 0-100, "confidence": 0-100 },
    "agreeableness": { "value": 0-100, "confidence": 0-100 },
    "neuroticism": { "value": 0-100, "confidence": 0-100 }
  },
  "jungFunctions": {
    "Se": { "value": 0-100, "confidence": 0-100 },
    "Si": { "value": 0-100, "confidence": 0-100 },
    "Ne": { "value": 0-100, "confidence": 0-100 },
    "Ni": { "value": 0-100, "confidence": 0-100 },
    "Te": { "value": 0-100, "confidence": 0-100 },
    "Ti": { "value": 0-100, "confidence": 0-100 },
    "Fe": { "value": 0-100, "confidence": 0-100 },
    "Fi": { "value": 0-100, "confidence": 0-100 }
  },
  "archetypeCandidates": [
    { "key": "hero|sage|explorer|creator|caregiver|rebel", "confidence": 0-100, "rationale": "frase corta" }
  ],
  "evidence": [
    { "text": "quote parafraseada del retrato, máx 200 chars", "source": "user_text", "questionId": "chatgpt-seed" }
  ],
  "turnsAnswered": 0,
  "overallConfidence": 0-100
}`;

export function buildChatgptSeedParserPrompt(params: SeedParserParams): {
  system: string;
  prompt: string;
} {
  const { rawText } = params;

  const prompt = `## Tarea

El usuario le pidió a ChatGPT que armara un retrato psicológico de ellos usando el marco Umbra (Big Five + funciones Jung + arquetipos Pearson). El texto abajo es la respuesta cruda de ChatGPT — puede tener prosa, puede tener un bloque JSON adentro, puede tener ambos.

Tu job es convertirlo en un WorkingProfile de Umbra estructurado.

## Reglas de extracción

1. Si la respuesta contiene un JSON con scores numéricos (bigFive, jungFunctions, archetypeCandidates), usalos como base. ChatGPT ya hizo la estimación.

2. Si falta el JSON o algún campo está incompleto, INFERÍ los scores leyendo la prosa. Ej: si la prosa dice "sos alguien muy abierto a ideas nuevas", openness value ~75, confidence ~55.

3. Extraé 5-10 quotes de EVIDENCIA desde la prosa. Parafraseá (no literal), cada una máx 200 chars, y poneles \`source: "user_text"\` y \`questionId: "chatgpt-seed"\`. Elegí quotes que ilustren claramente una dimensión o función.

4. Para \`archetypeCandidates\`: incluí 2-3 arquetipos con mayor confianza según el retrato. Si la prosa menciona "El Sabio" claramente, ponelo primero.

5. Calibración de confidence (CRÍTICO):
   - Si el retrato tiene muchos detalles concretos sobre una dimensión → confidence 60-80
   - Si la menciona por encima sin evidencia fuerte → confidence 35-55
   - Si no la menciona o es ambigua → confidence 15-25, value 50
   - NUNCA pongas confidence >85 (aun si el retrato es muy específico, esto es seed, no ground truth)

6. \`overallConfidence\` debe ser el promedio ponderado de las confidences individuales, tope 80 (es un retrato externo, no validación).

7. \`turnsAnswered\` siempre es 0 (la sesión todavía no tuvo turnos en Umbra).

## Schema de salida (JSON estricto, sin markdown, sin prosa)

${SCHEMA}

## Texto crudo de ChatGPT a parsear

\`\`\`
${rawText.slice(0, 14000)}
\`\`\`

Devolvé SOLO el JSON parseado.`;

  return { system: SYSTEM, prompt };
}

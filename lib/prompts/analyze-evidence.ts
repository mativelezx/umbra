import type { BigFive, JungFunctions } from '@/types';

export interface EvidenceParams {
  originalText: string;
  bigFive: BigFive;
  jungFunctions: JungFunctions;
}

const SYSTEM =
  'Sos un extractor de evidencia textual. Dado un perfil psicológico y el texto original del usuario, citás frases verbatim que informan cada dimensión. No parafrasees. No resumas. Copiá frases tal como aparecen en el texto.';

export function buildEvidencePrompt(params: EvidenceParams): { system: string; prompt: string } {
  const { originalText, bigFive, jungFunctions } = params;

  // Top 2 Jung functions by score
  const topJung = Object.entries(jungFunctions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);

  const prompt = `## Perfil del usuario
Big Five:
- Openness: ${bigFive.openness}
- Conscientiousness: ${bigFive.conscientiousness}
- Extraversion: ${bigFive.extraversion}
- Agreeableness: ${bigFive.agreeableness}
- Neuroticism: ${bigFive.neuroticism}

Funciones Jung dominantes: ${topJung.join(', ')}

## Texto original del usuario

${originalText}

## Tarea

Para cada una de las 5 dimensiones Big Five Y las 2 funciones Jung dominantes (${topJung.join(', ')}), citá hasta 3 frases VERBATIM del texto que informen ese rasgo. Las frases deben ser cortas (5-15 palabras) y aparecer EXACTAMENTE en el texto original.

No parafrasees. No resumas. Si no encontrás una frase que informe un rasgo, devolvé el array vacío para ese rasgo.

## Formato (JSON estricto, solo el JSON)

{
  "highlights": [
    {
      "trait": "openness",
      "phrases": [
        { "quote": "<frase verbatim>", "occurrence": 1 },
        ...
      ]
    },
    {
      "trait": "conscientiousness",
      "phrases": [...]
    },
    {
      "trait": "extraversion",
      "phrases": [...]
    },
    {
      "trait": "agreeableness",
      "phrases": [...]
    },
    {
      "trait": "neuroticism",
      "phrases": [...]
    },
    {
      "trait": "${topJung[0]}",
      "phrases": [...]
    },
    {
      "trait": "${topJung[1]}",
      "phrases": [...]
    }
  ]
}

Reglas:
- "occurrence" es 1-indexed: si la frase aparece 3 veces en el texto y querés la segunda, ponés 2.
- Si la frase aparece solo una vez, ponés 1.
- No inventes frases. Si la frase exacta no está en el texto, no la incluyas.
- Español rioplatense tal como lo escribe el usuario.`;

  return { system: SYSTEM, prompt };
}

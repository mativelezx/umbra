import type { PsychologicalProfile } from '@/types';
import { buildPersonalContext } from './personal-context';
import {
  extractPerDimensionStatus,
  quantitativeDimensions,
  BIG_FIVE_KEYS,
} from '@/lib/profile/dimension-display';

export const _promptVersion = 'development-plan-2026-09-07-v4';
const SYSTEM =
  'Sos un guía de reflexión basado en Jung y Big Five. El perfil es experimental y Jung aporta un lenguaje simbólico, no una medición de identidad. No diagnosticás ni indicás tratamientos. Proponés actividades opcionales en español latinoamericano, concretas y practicables, sin prometer resultados. Tu output es JSON estricto.';

export function buildDevelopmentPlanPrompt(profile: PsychologicalProfile): {
  system: string;
  prompt: string;
} {
  const { bigFive, jungFunctions, archetype } = profile;
  const dimStatus = extractPerDimensionStatus(profile.analysisRaw);
  const measured = new Set(quantitativeDimensions(dimStatus));
  const bfLine = BIG_FIVE_KEYS.map((k) => {
    const code = k[0].toUpperCase();
    return measured.has(k) && Number.isFinite(bigFive[k])
      ? `${code}=${bigFive[k]} (estimación experimental; no es percentil ni precisión individual validada)`
      : `${code}: sin cifra (${dimStatus[k] === 'not_applicable' ? 'no evaluable' : 'baja confianza'}; no infieras ni inventes rasgos o puntajes de esta dimensión)`;
  }).join(' ');

  // Identify weakest 2 functions for development areas
  const weakest = Object.entries(jungFunctions)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([k]) => k);

  const prompt = `${buildPersonalContext(profile)}

## Perfil del usuario

Big Five (solo las dimensiones con cifra pueden citarse como estimaciones experimentales; las demás no permiten inferencias individuales):
${bfLine}

Funciones Jung (escala 0-100):
Se=${jungFunctions.Se} Si=${jungFunctions.Si} Ne=${jungFunctions.Ne} Ni=${jungFunctions.Ni}
Te=${jungFunctions.Te} Ti=${jungFunctions.Ti} Fe=${jungFunctions.Fe} Fi=${jungFunctions.Fi}

Funciones con menor presencia en la interpretación simbólica: ${weakest.join(', ')}
Arquetipo: ${archetype}

## Tarea

Generá un plan de desarrollo personalizado con EXACTAMENTE 3 áreas de crecimiento, basadas en:

1. Los ejemplos cotidianos, objetivos y preferencias de los textos compartidos: son la base principal. El fundamento debe señalar qué contó la persona, sin inventarlo.
2. El autoinforme BFI-2-S, si está disponible, como referencia declarada por la persona; no demuestra qué actividad le dará resultado. El ML solo aporta dimensiones con cifra reportable, nunca las omitidas.
3. Jung y arquetipos, únicamente como metáforas opcionales; no son debilidades medidas ni causas de comportamiento.

Cada área debe tener:
- **name**: nombre claro y motivador (español latinoamericano, 3-6 palabras)
- **rationale**: fundamento breve conectado al perfil específico (1-2 oraciones)
- **actions**: 2-3 acciones concretas y practicables. Cada una:
  - **title**: título corto
  - **description**: qué hacer exactamente (1-2 oraciones)
  - **microGoals**: 2-3 micro-objetivos medibles (no "ser más mindful" — sí "meditar 10 min 3 veces por semana durante 4 semanas")

## Formato (JSON estricto, solo el JSON)

{
  "areas": [
    {
      "name": "<nombre del área>",
      "rationale": "<por qué esta área>",
      "actions": [
        {
          "title": "<título>",
          "description": "<qué hacer>",
          "microGoals": [
            { "text": "<micro-objetivo medible>" },
            { "text": "<micro-objetivo medible>" }
          ]
        }
      ]
    }
  ]
}

## Reglas
- Explicá cada sigla la primera vez que aparezca, con palabras comunes y un ejemplo cotidiano. Preferí el nombre comprensible antes que la sigla.
- No cites cifras de funciones Jung en la devolución. Esos pesos son asociaciones internas de IA, no capacidades medidas. No describas a la persona como débil, desconectada del mundo o deficiente a partir de esos pesos.
- Formulá el fundamento como una posibilidad que la persona puede aceptar o descartar, no como una causa demostrada de su comportamiento.
- Acciones realistas que se puedan hacer en 1-4 semanas.
- Micro-objetivos específicos, medibles, con tiempo. NO vagos.
- Tono motivador PERO NO vacío. NO uses "vos podés", "creé en vos", "el límite es el cielo".
- Español latinoamericano (voseo).
- Conectá explícitamente cada área con algún aspecto del perfil.
- Devolvé SOLO JSON, sin markdown, sin comentarios.`;

  return { system: SYSTEM, prompt };
}

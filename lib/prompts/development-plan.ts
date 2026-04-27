import type { PsychologicalProfile } from '@/types';

const SYSTEM =
  'Sos un coach de desarrollo personal basado en Jung y Big Five. Escribís planes de crecimiento en español latinoamericano, concretos, accionables, sin lenguaje motivacional vacío. Tu output es JSON estricto.';

export function buildDevelopmentPlanPrompt(profile: PsychologicalProfile): {
  system: string;
  prompt: string;
} {
  const { bigFive, jungFunctions, archetype } = profile;

  // Identify weakest 2 functions for development areas
  const weakest = Object.entries(jungFunctions)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([k]) => k);

  const prompt = `## Perfil del usuario

Big Five:
O=${bigFive.openness} C=${bigFive.conscientiousness} E=${bigFive.extraversion} A=${bigFive.agreeableness} N=${bigFive.neuroticism}

Funciones Jung (escala 0-100):
Se=${jungFunctions.Se} Si=${jungFunctions.Si} Ne=${jungFunctions.Ne} Ni=${jungFunctions.Ni}
Te=${jungFunctions.Te} Ti=${jungFunctions.Ti} Fe=${jungFunctions.Fe} Fi=${jungFunctions.Fi}

Funciones más débiles: ${weakest.join(', ')}
Arquetipo: ${archetype}

## Tarea

Generá un plan de desarrollo personalizado con EXACTAMENTE 3 áreas de crecimiento, basadas en:

1. Las funciones cognitivas más débiles del usuario (oportunidades de integración)
2. Dimensiones Big Five que podrían equilibrarse
3. Tensión entre el arquetipo dominante y las funciones en sombra

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
- Acciones realistas que se puedan hacer en 1-4 semanas.
- Micro-objetivos específicos, medibles, con tiempo. NO vagos.
- Tono motivador PERO NO vacío. NO uses "vos podés", "creé en vos", "el límite es el cielo".
- Español latinoamericano (voseo).
- Conectá explícitamente cada área con algún aspecto del perfil.
- Devolvé SOLO JSON, sin markdown, sin comentarios.`;

  return { system: SYSTEM, prompt };
}

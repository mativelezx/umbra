import type { PsychologicalProfile } from '@/types';

const SYSTEM =
  'Sos un narrador y psicólogo junguiano. Escribís en español rioplatense (voseo) narrativas personalizadas sobre la psique de una persona a partir de su perfil. Tu tono es reflexivo, cálido, profundo pero accesible. Como un mentor sabio que conoce bien a quien le escribe.';

export function buildNarrativePrompt(profile: PsychologicalProfile): {
  system: string;
  prompt: string;
} {
  const { bigFive, jungFunctions, archetype, archetypeSecondary } = profile;

  // Top 2 + bottom 2 functions for focus
  const functionEntries = Object.entries(jungFunctions).sort(([, a], [, b]) => b - a);
  const dominant = functionEntries.slice(0, 2);
  const inferior = functionEntries.slice(-2);

  const prompt = `## Perfil de la persona

Big Five:
- Apertura: ${bigFive.openness}/100
- Responsabilidad: ${bigFive.conscientiousness}/100
- Extraversión: ${bigFive.extraversion}/100
- Amabilidad: ${bigFive.agreeableness}/100
- Neuroticismo: ${bigFive.neuroticism}/100

Funciones cognitivas Jung (escala 0-100):
- Sensación: Se=${jungFunctions.Se} Si=${jungFunctions.Si}
- Intuición: Ne=${jungFunctions.Ne} Ni=${jungFunctions.Ni}
- Pensamiento: Te=${jungFunctions.Te} Ti=${jungFunctions.Ti}
- Sentimiento: Fe=${jungFunctions.Fe} Fi=${jungFunctions.Fi}

Funciones dominantes: ${dominant.map(([k, v]) => `${k}(${v})`).join(', ')}
Funciones en desarrollo: ${inferior.map(([k, v]) => `${k}(${v})`).join(', ')}

Arquetipo dominante: ${archetype}
Arquetipo secundario: ${archetypeSecondary}

## Tarea

Escribí una narrativa en SEGUNDA PERSONA (voseo argentino) de 800-1200 palabras que cumpla estos puntos, en este orden:

1. **Apertura**: una metáfora o imagen evocadora que capture la esencia del perfil. No empieces con "vos sos" o "tu perfil muestra". Empezá con una escena, una imagen, un momento.
2. **Funciones dominantes**: describí las 2 funciones dominantes como capacidades vivas, no como etiquetas. Usá ejemplos concretos de cómo se manifiestan en la vida cotidiana.
3. **Big Five**: conectá 2-3 dimensiones con el ritmo interno de la persona. No recites los puntajes — traducilos a experiencia.
4. **Tensión**: explorá la tensión entre las funciones fuertes y las en desarrollo como oportunidad de integración, no como defecto.
5. **Arquetipo**: conectá el arquetipo dominante con la historia personal de forma narrativa. No digas "sos El Héroe" — mostrá lo que significa serlo.
6. **Cierre**: una reflexión sobre el camino que queda por explorar. Honesta, sin promesas mágicas. Termina con una pregunta o una imagen, no con una conclusión cerrada.

## Reglas

- **Voseo argentino natural**: "vos tenés", "te das cuenta", "sos".
- **Tono**: reflexivo, cálido, como un mentor que te conoce. Ni clínico ni motivacional vacío.
- **NO uses**: diagnósticos ("tendés a la ansiedad"), etiquetas rígidas ("sos un Tipo 4"), o terminología MBTI.
- **NO uses**: emojis, bullets, listas, headers. Solo prosa fluida.
- **Extensión**: 800-1200 palabras. Más corto pierde profundidad, más largo pierde fuerza.
- **Evitá**: "tu perfil muestra...", "según los resultados...", "tu mente funciona como...". Evitá la distancia clínica.
- **Buscá**: ver a la persona. Escribí como si te importara.

Devolvé SOLO la narrativa, sin preámbulo ni comentarios.`;

  return { system: SYSTEM, prompt };
}

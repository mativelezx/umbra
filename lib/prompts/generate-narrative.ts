import type { PsychologicalProfile } from '@/types';

const SYSTEM =
  'Sos un narrador y psicólogo junguiano. Escribís en español latinoamericano (voseo) narrativas personalizadas sobre la psique de una persona a partir de su perfil. Tu tono es reflexivo, cálido, profundo pero accesible. Como un mentor sabio que conoce bien a quien le escribe.';

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

Escribí una narrativa en SEGUNDA PERSONA (voseo argentino) de 800-1200 palabras, ORGANIZADA en 5 secciones con headers markdown. Cada sección es prosa fluida de 2-3 párrafos.

Usá EXACTAMENTE estos 5 headers, en este orden:

## Apertura

Una metáfora o imagen evocadora que capture la esencia del perfil. No empieces con "vos sos" o "tu perfil muestra". Empezá con una escena, una imagen, un momento. 1-2 párrafos.

## Cómo te movés por el mundo

Describí las 2 funciones dominantes como capacidades vivas, no como etiquetas. Usá ejemplos concretos de cómo se manifiestan en la vida cotidiana. Conectá con 1-2 dimensiones de Big Five relevantes. 2-3 párrafos.

## Lo que te cuesta

Explorá la tensión entre las funciones fuertes y las en desarrollo como oportunidad de integración, no como defecto. Si hay neuroticism alto, traducilo a experiencia (no al score). 2 párrafos.

## Lo que te mueve

Conectá el arquetipo dominante con la historia personal de forma narrativa. No digas "sos El Héroe" — mostrá lo que significa serlo. Apertura a la experiencia + valores profundos. 2 párrafos.

## Lo que queda por explorar

Una reflexión sobre el camino por explorar. Honesta, sin promesas mágicas. Terminá con una pregunta o una imagen, no con una conclusión cerrada. 1 párrafo.

## Reglas

- **Voseo argentino natural**: "vos tenés", "te das cuenta", "sos".
- **Tono**: reflexivo, cálido, como un mentor que te conoce. Ni clínico ni motivacional vacío.
- **NO uses**: diagnósticos ("tendés a la ansiedad"), etiquetas rígidas ("sos un Tipo 4"), o terminología MBTI.
- **NO uses**: emojis, bullets, listas numéricas, o headers que no sean los 5 pedidos. Solo prosa fluida dentro de cada sección.
- **SÍ usá**: los 5 headers markdown \`##\` EXACTOS arriba. Umbra los renderiza con iconografía en el dashboard.
- **Extensión**: 800-1200 palabras totales. Más corto pierde profundidad, más largo pierde fuerza.
- **Evitá**: "tu perfil muestra...", "según los resultados...", "tu mente funciona como...". Evitá la distancia clínica.
- **Buscá**: ver a la persona. Escribí como si te importara.

## Frases destacadas (pull quotes)

Dentro de CADA sección, marcá entre 1 y 2 frases esenciales con \`> \` al
inicio de línea (sintaxis blockquote markdown). Umbra las renderiza como
pull quotes — citas visuales grandes que rompen la prosa. Reglas:

- La frase marcada debe sintetizar el párrafo, ser la imagen más fuerte,
  o la verdad incómoda. Debe poder leerse sola.
- Formato: línea separada, empieza con \`> \` y un espacio. Sin comillas,
  sin negritas. Solo la frase en su propio renglón, con un párrafo antes
  y otro después.
- NO marques frases genéricas ni afirmaciones vagas ("todo cambia cuando
  te conocés"). Marcá solo frases específicas a ESTE perfil.
- NO marques la primera línea de una sección. Marcá la frase clave del
  cuerpo.
- Si no hay una frase realmente digna de destacar en alguna sección, no
  marques ninguna. Mejor omitir que forzar.

Ejemplo dentro de "Lo que te cuesta":

La tensión entre tu pensamiento estructurado y tu intuición flotante no es
un defecto: es el lugar donde todavía estás aprendiendo a moverte.

> No estás roto, estás en proceso de integrar dos maneras distintas de ver el mundo.

Eso significa que cuando tu planificación choca con tu apertura...

Devolvé SOLO la narrativa (con los 5 headers markdown y los pull quotes
marcados con \`> \`), sin preámbulo ni comentarios.`;

  return { system: SYSTEM, prompt };
}

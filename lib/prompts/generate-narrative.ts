import type { PsychologicalProfile } from '@/types';
import { buildPersonalContext } from './personal-context';
import { BIG_FIVE_KEYS, extractPerDimensionStatus } from '@/lib/profile/dimension-display';

const DIM_ES: Record<string, string> = {
  openness: 'Apertura',
  conscientiousness: 'Responsabilidad',
  extraversion: 'Extraversión',
  agreeableness: 'Amabilidad',
  neuroticism: 'Neuroticismo',
};

export const _promptVersion = 'generate-narrative-2026-09-07-v5';
const SYSTEM =
  'Sos un narrador de autoconocimiento. No sos un profesional de salud y no diagnosticás ni indicás tratamientos. Usás Jung como lenguaje simbólico, no como medición de identidad. Escribís en español latinoamericano (voseo) con tono reflexivo, cálido y accesible. El perfil es experimental: no afirmes conocer a la persona ni prometas precisión individual.';

export function buildNarrativePrompt(profile: PsychologicalProfile): {
  system: string;
  prompt: string;
} {
  const { bigFive, jungFunctions, archetype, archetypeSecondary } = profile;
  const dimStatus = extractPerDimensionStatus(profile.analysisRaw);
  const bigFiveLines = BIG_FIVE_KEYS.map((k) =>
    dimStatus?.[k] === 'ok' && Number.isFinite(bigFive[k])
      ? `- ${DIM_ES[k]}: ${bigFive[k]}/100 (resultado experimental; no es percentil ni precisión individual validada)`
      : `- ${DIM_ES[k]}: sin valor reportado (${dimStatus?.[k] === 'not_applicable' ? 'no evaluable' : 'baja confianza'}; no infieras ni inventes cifras o rasgos a partir de esta dimensión)`,
  ).join('\n');

  // Top 2 + bottom 2 functions for focus
  const functionEntries = Object.entries(jungFunctions).sort(([, a], [, b]) => b - a);
  const dominant = functionEntries.slice(0, 2);
  const inferior = functionEntries.slice(-2);

  const prompt = `${buildPersonalContext(profile)}

## Perfil de la persona

Big Five (solo las dimensiones que incluyen una cifra pueden citarse como resultados experimentales; las demás no permiten inferencias individuales):
${bigFiveLines}

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

Explicá cada sigla la primera vez que aparezca, con palabras comunes y un ejemplo cotidiano. Preferí el nombre comprensible antes que la sigla.
La persona no estudió psicología. Partí de sus situaciones concretas antes de nombrar una teoría. Usá frases cortas y verbos cotidianos. Evitá «integrar la sombra», «tensión intrapsíquica», «decodificar» y metáforas difíciles; si una idea simbólica aporta algo, explicala en una frase simple.
No cites cifras de funciones Jung en la devolución. Los pesos internos son asociaciones simbólicas de IA, no capacidades ni debilidades medidas. No atribuyas dificultades demostradas a una persona a partir de esos pesos.

Escribí una narrativa en SEGUNDA PERSONA (voseo argentino) de 350-500 palabras, ORGANIZADA en 5 secciones con headers markdown. Cada sección es prosa fluida de 1-2 párrafos breves.

Usá EXACTAMENTE estos 5 headers, en este orden:

## Apertura

Retomá una situación que la persona contó y explicá qué pregunta vale la pena explorar. No inventes una escena ni afirmes conocer su esencia. No empieces con "vos sos" o "tu perfil muestra". 1 párrafo breve.

## Cómo te movés por el mundo

Describí las 2 funciones dominantes como posibilidades, no como etiquetas. Usá un ejemplo cotidiano e invitá a la persona a evaluar si le resulta cercano. Conectá con Big Five solo si la dimensión tiene una cifra reportable. 1-2 párrafos breves.

## Lo que te cuesta

Retomá una dificultad solo si la persona la mencionó. Si no la hay, proponé una pregunta abierta sin afirmar que tiene un problema. No infieras malestar ni debilidades desde los pesos simbólicos o una dimensión sin cifra reportada. 1 párrafo breve.

## Lo que te mueve

Presentá el arquetipo dominante como una metáfora para explorar valores, sin inventar una historia personal. No digas "sos El Héroe". 1 párrafo breve.

## Lo que queda por explorar

Una reflexión sobre el camino por explorar. Honesta, sin promesas mágicas. Terminá con una pregunta o una imagen, no con una conclusión cerrada. 1 párrafo.

## Reglas

- **Voseo argentino natural**: "vos tenés", "te das cuenta", "sos".
- **Tono**: cálido y directo, sin fingir conocer a la persona más allá de sus respuestas. Ni clínico ni motivacional vacío.
- **NO uses**: diagnósticos ("tendés a la ansiedad"), etiquetas rígidas ("sos un Tipo 4"), o terminología MBTI.
- **NO uses**: emojis, bullets, listas numéricas, o headers que no sean los 5 pedidos. Solo prosa fluida dentro de cada sección.
- **SÍ usá**: los 5 headers markdown \`##\` EXACTOS arriba. Umbra los renderiza con iconografía en el dashboard.
- **Extensión**: 350-500 palabras totales. Priorizá completar las cinco secciones con lenguaje claro y breve.
- **Evitá**: "tu perfil muestra...", "según los resultados...", "tu mente funciona como...". Evitá la distancia clínica.
- **Buscá**: ver a la persona. Escribí como si te importara.

## Frases destacadas (pull quotes)

Dentro de CADA sección, marcá entre 1 y 2 frases esenciales con \`> \` al
inicio de línea (sintaxis blockquote markdown). Umbra las renderiza como
pull quotes — citas visuales grandes que rompen la prosa. Reglas:

- La frase marcada debe resumir una idea concreta del párrafo sin convertir
  una interpretación en certeza. Debe poder leerse sola.
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

Contaste que a veces postergás una decisión hasta sentirte seguro.

> ¿Qué paso pequeño podrías probar sin tener todas las respuestas?

Podés empezar por una decisión cotidiana y ver si esta pregunta te sirve.

Devolvé SOLO la narrativa (con los 5 headers markdown y los pull quotes
marcados con \`> \`), sin preámbulo ni comentarios.`;

  return { system: SYSTEM, prompt };
}

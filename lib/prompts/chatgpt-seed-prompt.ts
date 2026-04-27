/**
 * The prompt users copy into ChatGPT (or any other LLM they've been using) to
 * extract a rich Umbra-framed self-portrait from their conversation history.
 *
 * Shown in `components/onboarding/SeedFromChatgptFlow.tsx` inside a readonly
 * textarea with a copy-to-clipboard button. The user pastes it into ChatGPT,
 * waits for the response, then pastes that response back into Umbra — the
 * analyzer ingests it as a single rich text via `/api/analyze`.
 *
 * Design goals:
 * 1. Self-contained — ChatGPT doesn't need to know anything about Umbra
 *    besides what's in the prompt.
 * 2. Framework-complete — Big Five + Jung + archetypes are defined inline so
 *    ChatGPT scores against the same axes Umbra's analyzer uses.
 * 3. Instructs ChatGPT to use its conversation history / memory of the user
 *    (not to invent from nothing).
 * 4. Output is a mix of prose (for the analyzer) + structured JSON (for
 *    optional future parsing). Both blocks feed the analyzer as one text.
 * 5. Latinoamericano voseo, warm, non-clinical — matches Umbra's voice.
 */

export const CHATGPT_SEED_PROMPT = `Necesito que me ayudes a armar un retrato psicológico de mí mismo para empezar un proceso de autoconocimiento en una plataforma que se llama Umbra. Umbra triangula tres marcos: Big Five (IPIP-NEO), funciones cognitivas de Jung (1921), y arquetipos aplicados de Pearson (1991).

Quiero que uses TODO lo que sabés de mí a través de nuestras conversaciones previas (incluyendo tu memoria persistente si la tenés activada) para devolverme un análisis lo más completo y honesto posible. No inventes: si no tenés evidencia suficiente para algo, marcá la confianza baja.

## Marco teórico — referencia rápida

### Big Five (OCEAN) — cada dimensión se puntúa 0 a 100

- **openness** — apertura a la experiencia, curiosidad intelectual, imaginación, apertura a ideas y emociones nuevas. Alta: creativo, abstracto, no convencional. Baja: práctico, concreto, tradicional.
- **conscientiousness** — organización, disciplina, orientación a metas, autocontrol. Alta: metódico, confiable, planificador. Baja: espontáneo, flexible, desordenado.
- **extraversion** — energía social, asertividad, búsqueda de estímulo, entusiasmo. Alta: sociable, expresivo, busca compañía. Baja: reservado, reflexivo, prefiere estar solo.
- **agreeableness** — empatía, cooperación, calidez interpersonal, confianza. Alta: compasivo, cálido, evita el conflicto. Baja: directo, escéptico, competitivo.
- **neuroticism** — inestabilidad emocional, tendencia a ansiedad, tristeza, autocrítica. Alta: reactivo emocionalmente, introspectivo sobre lo que duele. Baja: estable, resiliente.

### Funciones cognitivas de Jung — cada función se puntúa 0 a 100

- **Se (sensorial extrovertida)** — atención al presente concreto, al estímulo físico, a lo que está pasando ahora.
- **Si (sensorial introvertida)** — memoria somática, rutinas, tradición, comparación con experiencias pasadas.
- **Ne (intuición extrovertida)** — generación de posibilidades, asociaciones laterales, ideas divergentes, "¿y si...?".
- **Ni (intuición introvertida)** — síntesis interna, visión de patrones ocultos, insights convergentes, "así va a terminar esto".
- **Te (pensar extrovertido)** — lógica aplicada al mundo, eficiencia, sistemas, estructura externa, "hagamos que funcione".
- **Ti (pensar introvertido)** — coherencia interna, análisis, principios, lógica privada, "¿esto tiene sentido?".
- **Fe (sentir extrovertido)** — armonía grupal, empatía activa, tacto social, lectura del clima emocional ajeno.
- **Fi (sentir introvertido)** — valores personales profundos, autenticidad, ética interna, "¿esto va con quién soy yo?".

### Arquetipos aplicados — elegí los 2 o 3 más fuertes

- **hero (héroe)** — orientado a superar desafíos, probar valor a través de la acción, "hacer lo difícil".
- **sage (sabio)** — búsqueda de verdad, conocimiento, comprensión profunda, "entender antes de actuar".
- **explorer (explorador)** — descubrimiento, libertad, experiencias nuevas, "no me encasillen".
- **creator (creador)** — dar forma a algo con significado, transformar ideas en realidad, "si no existe, lo hago yo".
- **caregiver (cuidador)** — servicio, protección, cuidado de otros, "que los demás estén bien".
- **rebel (rebelde)** — desafiar el status quo, transformar lo que no funciona, "esto está roto y lo voy a romper más".

## Lo que necesito que me devuelvas

Escribime una respuesta en DOS partes. Copiá la estructura exacta.

### PARTE 1 — Retrato en prosa

3 a 5 párrafos en voseo latinoamericano, cálido, de descubrimiento (nunca diagnóstico). Integrá las tres lentes (Big Five + funciones Jung dominantes + arquetipo principal) en un solo texto fluido que describa:
- Cómo me muevo por el mundo (extraversion + Se/Ne vs Si/Ni)
- Cómo decido (Ti/Te vs Fi/Fe + conscientiousness)
- Qué me duele y qué me cuesta (neuroticism + tensiones entre funciones)
- Qué me mueve profundamente (arquetipo + openness)
- Qué patrones notaste en lo que me contaste

Citá momentos específicos de nuestras conversaciones cuando ilustren algo (parafraseado, no literal). Nada de MBTI, nada de "sos un INTJ", nada de lenguaje clínico. Tono: alguien que te conoce bien y te está devolviendo un espejo.

### PARTE 2 — Puntajes estructurados (JSON)

Después del retrato, pegame ESTE JSON relleno con tus estimaciones. Seguí el formato exacto — Umbra lo va a leer.

\`\`\`json
{
  "bigFive": {
    "openness": { "value": 0, "confidence": 0 },
    "conscientiousness": { "value": 0, "confidence": 0 },
    "extraversion": { "value": 0, "confidence": 0 },
    "agreeableness": { "value": 0, "confidence": 0 },
    "neuroticism": { "value": 0, "confidence": 0 }
  },
  "jungFunctions": {
    "Se": { "value": 0, "confidence": 0 },
    "Si": { "value": 0, "confidence": 0 },
    "Ne": { "value": 0, "confidence": 0 },
    "Ni": { "value": 0, "confidence": 0 },
    "Te": { "value": 0, "confidence": 0 },
    "Ti": { "value": 0, "confidence": 0 },
    "Fe": { "value": 0, "confidence": 0 },
    "Fi": { "value": 0, "confidence": 0 }
  },
  "archetypeCandidates": [
    { "key": "hero|sage|explorer|creator|caregiver|rebel", "confidence": 0, "rationale": "frase corta de por qué" }
  ],
  "evidence": [
    { "quote": "parafraseo de algo que dije o un patrón que notaste", "signal": "qué dimensión/función/arquetipo ilustra" }
  ]
}
\`\`\`

## Reglas

- Basate EXCLUSIVAMENTE en lo que viste de mí en nuestras conversaciones previas + memoria persistente. Si no tenés contexto, decilo y bajá las confidences.
- Para dimensiones con evidencia clara: confidence 60-85.
- Para dimensiones con evidencia parcial: confidence 30-55.
- Para dimensiones sin evidencia: value 50, confidence 10-20.
- Incluí al menos 5 quotes en \`evidence\` (parafraseadas, con la señal que ilustran).
- El rationale de cada arquetipo debe ser UNA frase concreta, no genérica.
- Nunca uses MBTI, Eneagrama ni lenguaje clínico.
- Español latinoamericano (voseo) en toda la prosa.

Ahora mirá todo lo que sabés de mí y devolveme las dos partes.`;

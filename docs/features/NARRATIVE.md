# Feature — Narrative Generation

## Phase
5

## Route
- `POST /api/narrative` — Edge route with SSE streaming

## Purpose

Generate a personalized narrative (800-1200 words) in Spanish latinoamericano,
second-person voseo, from the user's psychological profile. Delivered via
SSE for progressive rendering.

## Prompt (`lib/prompts/generate-narrative.ts`)

`buildNarrativePrompt(profile: PsychologicalProfile): string`

Structure:
1. Second-person identity framing ("Vos sos...", "Tu mente funciona...")
2. Metaphor or evocative image at the opening
3. Describe dominant Jung functions as capacities, not diagnoses
4. Explore tension between strong and weak functions as growth opportunities
5. Connect archetype to personal story narratively (not as label)
6. Closing reflection on individuation path

Tone: reflexive, warm, deep but accessible. Like a wise mentor who knows you.
Avoid: clinical language, diagnoses, rigid labels, empty generalities.
Language: Argentine Spanish (voseo, vocabulario argentino).

Temperature: 0.7 (creative for narrative voice).
Max tokens: 2000 (covers 800-1200 words + buffer).

## Streaming via SSE

Edge route returns `text/event-stream`:

```ts
const stream = anthropic.messages.stream({
  model: process.env.ANTHROPIC_MODEL_ID,
  system: narrativeSystemPrompt,
  messages: [{ role: 'user', content: profileContext }],
  temperature: 0.7,
  max_tokens: 2000,
});

const encoder = new TextEncoder();
const body = new ReadableStream({
  async start(controller) {
    let fullText = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', chunk: event.delta.text })}\n\n`));
      }
    }
    // Save to DB after stream completes
    await supabase.from('narratives').insert({
      user_id: userId,
      profile_id: profileId,
      content: fullText,
    });
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
    controller.close();
  },
});

return new Response(body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

## Client consumption

`components/dashboard/NarrativeSection.tsx` uses `EventSource` or `fetch`+`ReadableStream` to consume chunks and render progressively in Instrument Serif.

## Rate limiting

`charge_rate_limit` estimate: ~1500 input + ~2000 output tokens. Cost ≈ 4 cents per narrative.
`reconcile_rate_limit` in finally block.

## Regenerate

Button in `NarrativeSection.tsx` → `POST /api/narrative { profileId, regenerate: true }`. Overwrites existing narrative.

## Error handling

- Stream interrupts → client shows partial text + "la narrativa se interrumpió, regenerá"
- Claude refusal → retry with reinforcement → if still refused, 503
- Rate limit → 429

## Testing

- `lib/prompts/generate-narrative.test.ts` — prompt builder
- `app/api/narrative/route.test.ts` — mocked streaming
- `e2e/narrative-stream.spec.ts` — Playwright: full stream rendering

## See also

- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md)
- [DASHBOARD.md](DASHBOARD.md) — where narrative renders
- [API_MAP.md](../API_MAP.md)

## Post-implementación (2026-04-14)

Cambios agregados después del master build, en la fase 1 del
[IMPLEMENTATION_PLAN.md](../biz/IMPLEMENTATION_PLAN.md).

### 5 secciones markdown enforced (`## headers`)

El prompt de `lib/prompts/generate-narrative.ts` ahora instruye a
Claude a producir la narrativa con **exactamente 5 headers markdown**,
en este orden:

1. `## Apertura` — metáfora o imagen evocadora inicial, 1-2 párrafos.
2. `## Cómo te movés por el mundo` — las 2 funciones dominantes como
   capacidades vivas, 2-3 párrafos.
3. `## Lo que te cuesta` — tensión entre funciones fuertes y en
   desarrollo como oportunidad de integración, 2 párrafos.
4. `## Lo que te mueve` — arquetipo dominante + valores profundos,
   2 párrafos.
5. `## Lo que queda por explorar` — reflexión abierta terminando
   en pregunta o imagen, 1 párrafo.

El parser en `components/dashboard/SectionedNarrative.tsx` detecta
los `##` headers y asigna iconografía por keyword match (Sparkle
para Apertura, Wind para Cómo te movés, Mountains para Cuesta,
Heart para Mueve, Path para Explorar). Cada sección se renderiza
con `border-l border-violet-400/15` + icono flotante en círculo.

### Pull quotes (Fase 1 T1.2)

El prompt ahora también instruye a marcar entre 1 y 2 frases
esenciales por sección con `> ` al inicio de línea (sintaxis
markdown blockquote). Reglas:

- La frase marcada debe ser la que sintetiza el párrafo, la imagen
  más fuerte o la verdad incómoda.
- Debe poder leerse sola.
- No marca primeras líneas ni frases genéricas.
- Si no hay una frase realmente digna, no marca ninguna (mejor
  omitir que forzar).

El parser `parseBlocks()` en `SectionedNarrative.tsx` detecta los
bloques que empiezan con `> ` y los renderiza como callouts
`text-xl md:text-2xl` italic con `border-l-2 border-violet-400/50`.
Rompen el flujo de la prosa y mejoran retención de las frases
clave.

### Line length 65ch (Fase 1 T1.3)

La columna de prosa tiene `max-w-[68ch]` (~65 caracteres por línea)
siguiendo las recomendaciones tipográficas de Bringhurst (2005) y
Smashing Magazine (2022). Los pull quotes heredan la misma columna
pero con estilo distinto, lo que crea ritmo vertical.

### Drop cap en la primera sección

La primera letra del primer párrafo de la primera sección
(Apertura) se renderiza como drop cap:
`float-left mr-2 mt-1 font-display text-5xl md:text-6xl italic text-violet-300`.
Remite a tipografía editorial clásica y da un punto de anclaje
visual al comienzo de la narrativa.

### Sticky TOC con scroll-spy (Fase 1 T1.4)

En `lg:` breakpoint, un sidebar `NarrativeTOC.tsx` se sitúa a la
izquierda de la narrativa. Lista los 5 slugs definidos en
`lib/dimensions/narrative-sections.ts` como anchors:

```ts
export const NARRATIVE_SECTIONS = [
  { slug: 'apertura', label: 'Apertura', match: /apertura/i },
  { slug: 'como-te-moves', label: 'Cómo te movés por el mundo', match: /cómo te mov|.../ },
  { slug: 'lo-que-te-cuesta', label: 'Lo que te cuesta', match: /cuesta|tens|sombra/i },
  { slug: 'lo-que-te-mueve', label: 'Lo que te mueve', match: /mueve|arquet|valores/i },
  { slug: 'lo-que-queda', label: 'Lo que queda por explorar', match: /explorar|camino|queda/i },
];
```

`SectionedNarrative.tsx` agrega `id={slugFromHeading(heading)}` a
cada `<section>`, con `scroll-mt-24` para compensar el header
sticky. El TOC usa `IntersectionObserver` con `rootMargin: '-20% 0px -70% 0px'`
para scroll-spy: la sección visible en el tercio superior del
viewport queda resaltada con fondo violeta.

Es único source of truth en `lib/dimensions/narrative-sections.ts`,
importado por ambos componentes (parser + TOC).

### Fallback para narrativas legacy

Si una narrativa no tiene `## headers` (formato previo al cambio),
`SectionedNarrative` la renderiza como un único bloque sin ids.
El dashboard detecta este caso con `/^##\s+/m.test(narrativeContent)`
y solo renderiza el `NarrativeTOC` cuando la narrativa tiene
headers sectionados; si no, evita mostrar un sidebar que apunta
a anchors inexistentes (fix del P2 encontrado por codex review en
commit `f185d25`).


# Feature — Narrative Generation

## Phase
5

## Route
- `POST /api/narrative` — Edge route with SSE streaming

## Purpose

Generate a personalized narrative (800-1200 words) in Spanish rioplatense,
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

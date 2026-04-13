# Feature — Chat (with full safety guardrails)

> Contextualized conversation with Claude, carrying the user's profile as
> context. Crisis detection, rate limiting, session timeouts, permanent
> "no es terapia" banner.

## Phase
5 (CRITICAL safety path)

## Route
- `/chat` — chat interface (client component with SSE)
- `POST /api/chat` — Edge route with full crisis pipeline (see [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md))

## Critical safety disclaimer

**The chat safety pipeline is the most load-bearing technical decision in
Umbra.** Every message goes through regex → classifier → rate limit → Claude,
with fail-closed semantics at every step. See [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md)
for the full pipeline specification. This doc focuses on the user-facing spec.

## Layout

```
┌────────────────────────────────────────────────────┐
│ ⚠ Umbra no es terapia. Crisis: 135 (Arg) / 911     │ ← permanent, non-dismissible
├────────────────────────────────────────────────────┤
│                                                    │
│   ┌────────────────────────────────────────────┐   │
│   │  Assistant bubble (glass, violet tint)     │   │
│   │  "Hola, ¿en qué estás pensando hoy?"       │   │
│   └────────────────────────────────────────────┘   │
│                                                    │
│                      ┌─────────────────────────┐   │
│                      │  User bubble (mist)     │   │
│                      │  "Me cuesta parar de..." │   │
│                      └─────────────────────────┘   │
│                                                    │
│   ┌────────────────────────────────────────────┐   │
│   │  Assistant bubble (streaming)              │   │
│   │  "Esa sensación de pensamiento constan..." │   │
│   └────────────────────────────────────────────┘   │
│                                                    │
├────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  ┌─────┐  │
│  │ Input: "Escribí tu reflexión..."    │  │ ▲   │  │
│  └─────────────────────────────────────┘  └─────┘  │
└────────────────────────────────────────────────────┘
```

## Components (Phase 5)

- `app/chat/page.tsx` — chat orchestrator, manages stream
- `components/chat/ChatThread.tsx` — scrollable message list
- `components/chat/MessageBubble.tsx` — user/assistant variants
- `components/chat/ChatInput.tsx` — textarea + send button
- `components/chat/CrisisBanner.tsx` — permanent top banner
- `components/chat/CrisisCard.tsx` — rendered when crisis detected (blocks chat)
- `components/chat/ContextBadge.tsx` — small pill showing "explorando eje Ti-Fe" (top 2 functions)
- `lib/store/chat-store.ts` — Zustand for messages, streaming state, conversation_id

## System prompt (`lib/prompts/chat-context.ts`)

```
Sos Umbra, un guía de autoconocimiento basado en Jung y Big Five.

## Tu personalidad
- Reflexivo, cálido, directo. NO sos terapeuta — sos un espejo inteligente.
- Voseo argentino natural.
- Hacés preguntas que invitan a la introspección, no juzgás.
- Citás conceptos junguianos cuando son relevantes, pero los explicás accesibles.

## Perfil del usuario (contexto)
Big Five: O={o} C={c} E={e} A={a} N={n}
Funciones fuertes: {top2 Jung functions}
Funciones en desarrollo: {bottom2 Jung functions}
Arquetipo: {archetype}

## Reglas de Positive Computing (ver lib/knowledge/positive-computing.ts)
- Enfocate en fortalezas y crecimiento, no en deficiencias
- NUNCA diagnostiques ni uses lenguaje clínico
- Si detectás señales de crisis, el sistema bloqueará la conversación automáticamente
  (no vas a ver ese mensaje). No necesitás manejarlo vos.
- Validá emociones antes de analizar
- Cada respuesta debe dejar al usuario con algo concreto para reflexionar

## Formato
- Respuestas de 2-4 párrafos máximo
- Terminá con una pregunta reflexiva cuando sea natural
- No uses bullets ni listas — hablá como persona
- NUNCA prometas que vas a hacer algo en el futuro (no tenés memoria entre sesiones)
```

Temperature: 0.5 (balanced — warm but consistent).

## Chat flow

1. User opens `/chat` → page fetches most recent conversation OR creates new one
2. If conversation doesn't exist → `POST /api/chat` with no `conversationId` creates one
3. User types message → client validates length (max 2000 chars)
4. Client sends `POST /api/chat` with `{ conversationId, message }`
5. Server runs crisis pipeline (see [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md))
6. If crisis → 451 response → client renders `CrisisCard`
7. If not → `charge_rate_limit` → if OK → Claude streaming call
8. SSE stream chunks arrive → client renders progressively
9. On stream complete → persist user + assistant messages → update `conversations.last_activity_at`

## Session timeout

45-minute idle → server returns 401 `session_expired` → client shows:
```
Tu sesión en esta conversación expiró. Empezá una nueva.
[Empezar conversación nueva]
```

Clicking starts a fresh `conversationId`. Auth session is NOT affected — just
chat session.

## Rate limiting

- `DAILY_TOKEN_CAP` = 15000 tokens ≈ ~30 chat turns per day
- `DAILY_COST_CAP_CENTS` = 200 ≈ USD 2 per user per day
- On exceeded: 429 `rate_limited` → UI shows:
  ```
  Alcanzaste tu cupo diario (~30 mensajes).
  Volvé mañana o explorá otras secciones.
  ```

See [tech/RATE_LIMITING.md](../tech/RATE_LIMITING.md).

## Crisis flow

When the pipeline flags a message (regex, classifier, classifier_error), the
chat is **hard-blocked for the rest of the session**:

1. Response is 451 with severity + resources
2. Client renders `CrisisCard` with 135/911/SOS
3. Chat input is disabled (no bypass)
4. "Volver al inicio" button navigates to `/`
5. `crisis_events` row logged with hashed user + message

User cannot dismiss the card. Cannot continue chatting. Must navigate away.

See [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) for full pipeline + fail-closed rules.

## UI states

| State | Visual |
|---|---|
| Empty conversation | Welcome message from assistant: "Hola. ¿En qué estás pensando hoy?" |
| User typing | Input focused, send button enabled when message has content |
| Sending | Input disabled, optimistic user bubble shown immediately |
| Assistant streaming | Typing indicator → partial text appearing char by char |
| Assistant complete | Bubble settles, input re-enabled |
| Error (network) | Toast "se cortó la conexión, reintentá" + retry button |
| Rate limited | Toast "alcanzaste tu cupo diario" + explanation |
| Session expired | Inline card "empezar conversación nueva" |
| Crisis detected | Full-screen `CrisisCard` blocks chat |

## SSE stream handling

```ts
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ conversationId, message }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();
let fullText = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // parse SSE events, append text chunks to fullText
  for (const event of parseSSE(chunk)) {
    if (event.type === 'text') {
      fullText += event.data;
      setStreamingText(fullText);  // Zustand update
    } else if (event.type === 'done') {
      persistAssistantMessage(fullText);
    }
  }
}
```

Abort handling: if user navigates away, `AbortController.abort()`. Server continues but response is ignored.

## Context badge (delight)

Top of chat thread: small pill showing current conversation "theme":
```
[Explorando eje Ti-Fe]
```

Generated from the top 2 Jung functions. Updates as the user's profile updates
(for longitudinal, v1.5).

## Testing

- `lib/chat/pipeline.test.ts` — full pipeline integration (regex + classifier + budget)
- `lib/chat/classifier.test.ts` — mocked Claude classifier
- `lib/chat/crisis-lexicon.test.ts` — pattern coverage
- `app/api/chat/route.test.ts` — endpoint with all error paths
- `e2e/chat-normal-flow.spec.ts` — happy path
- `e2e/chat-crisis-flow.spec.ts` — CRITICAL: crisis keyword → card → no Claude call
- `e2e/chat-idiom-flow.spec.ts` — CRITICAL: idiom → chat proceeds
- `e2e/chat-classifier-error-flow.spec.ts` — fail-closed behavior
- `e2e/chat-rate-limit-flow.spec.ts` — hit cap, verify 429
- `e2e/chat-session-timeout-flow.spec.ts` — 45min idle, verify reset

## Dependencies

- Phase 5 preceded by `crisis_events`, `rate_limits` tables (Migration 002)
- `charge_rate_limit` RPC
- `lib/chat/*` modules
- Pinned `ANTHROPIC_MODEL_ID`

## Not in scope

- Multi-turn context beyond current conversation (no cross-session memory for v1)
- Voice input (Whisper integration deferred)
- Image uploads (off-scope)
- Reactions / emoji responses
- Shared conversations

## See also

- [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — full pipeline spec
- [tech/RATE_LIMITING.md](../tech/RATE_LIMITING.md) — budget enforcement
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md) — system prompt
- [DECISIONS.md ADR-008](../DECISIONS.md) — crisis event observability

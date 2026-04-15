# Feature — Onboarding

> Mode selector → guided / freetext flow → submit → redirect to progressive load.

## Phase
3

## Routes
- `/onboarding` — mode selector + flow orchestrator (client component)
- `POST /api/analyze` — invoked on submit (see [API_MAP.md](../API_MAP.md))

## User flow

```
/consent accepted
  ↓
/onboarding → ModeSelector
  ↓
choose "Guiado" | "Texto libre" | "Híbrido"
  ↓
  ├── Guiado → GuidedFlow (5 steps, ONBOARDING_AREAS)
  │              - textarea per area
  │              - min 50 words per area
  │              - progress dots
  │              - prev/next buttons
  │
  ├── Texto libre → FreeTextInput
  │              - 1 large textarea
  │              - word counter
  │              - min 200 words
  │
  └── Híbrido → 5 prompts like Guiado but optional per-area
  ↓
submit → POST /api/analyze
  ↓
ProgressiveLoad (8s animation + Pass 2 evidence highlights)
  ↓
Carta al futuro optional step (see [CARTA_AL_FUTURO.md](CARTA_AL_FUTURO.md))
  ↓
redirect to /dashboard
```

## Components (to build in Phase 3)

- `app/onboarding/page.tsx` — orchestrator, holds onboarding store state
- `components/onboarding/ModeSelector.tsx` — 3 glass cards with icons (Compass, NotePencil, Target)
- `components/onboarding/GuidedFlow.tsx` — 5-step form with ONBOARDING_AREAS
- `components/onboarding/FreeTextInput.tsx` — single textarea with word counter
- `components/onboarding/ProgressiveLoad.tsx` — 8s animation + evidence highlights
- `components/onboarding/DisclaimerCard.tsx` — "no es terapia" banner before mode selector
- `lib/store/onboarding-store.ts` — Zustand store for mode, step, texts, draft persistence

## State shape

```ts
interface OnboardingStore {
  mode: 'guided' | 'freetext' | 'hybrid' | null;
  currentStep: number;               // for guided flow
  texts: Record<string, string>;     // keyed by area.key for guided
  freeText: string;                  // for freetext mode
  draftSavedAt: Date | null;         // localStorage backup
  // Actions
  setMode: (mode: OnboardingMode) => void;
  setStep: (step: number) => void;
  setText: (key: string, value: string) => void;
  reset: () => void;
}
```

Draft is persisted to `localStorage` on change (simple, no server sync for TFG).

## Validation

- **Guided**: each area requires min 50 words (`text.trim().split(/\s+/).length >= 50`). Enforced client-side before next button, server-side in Zod.
- **Freetext**: min 200 words. Same double-check.
- **Hybrid**: at least 2 areas with 50+ words each.
- **Max**: 2000 chars per text block (zod).

## Submit logic

```ts
const analyze = async () => {
  const texts = mode === 'freetext'
    ? [freeText]
    : ONBOARDING_AREAS.map(a => texts[a.key]);
  const areas = mode === 'freetext' ? undefined : ONBOARDING_AREAS.map(a => a.label);

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, mode, areas }),
  });

  if (!res.ok) {
    // show error toast, allow retry
    return;
  }

  const { data } = await res.json();
  // data.profileId used by ProgressiveLoad
  // data.evidence fetched async from /api/analyze/evidence
  router.push(`/onboarding/progressive?profileId=${data.profileId}`);
};
```

## Evidence highlights (delight feature)

Pass 2 runs in parallel with the INSERT. The client fetches from
`evidence_highlights` table lazily via SWR (persisted architecture from eng
review E4). When evidence arrives, `ProgressiveLoad.tsx` fades in the
highlighted phrases over the already-animating dimensions.

See [features/ANALYSIS.md](ANALYSIS.md) for the Pass 2 spec.

## Edge cases (from CEO review section 4)

- **Double-click submit** → client disables button + server UNIQUE(user_id, version) constraint
- **Navigate away mid-analysis** → AbortController cancels fetch; user can come back to find profile ready in dashboard
- **Session expires mid-submit** → 401 → client refreshes + retries
- **Empty input** → client validation + server Zod reject
- **10k chars** → Zod max 2000 per block
- **Unicode / emoji / RTL** → no special handling; Claude handles fine

## Testing

- `components/onboarding/GuidedFlow.test.tsx` — step navigation, validation
- `components/onboarding/FreeTextInput.test.tsx` — word counter, min enforcement
- `lib/store/onboarding-store.test.ts` — state transitions, reset, persistence
- `e2e/onboarding-full-flow.spec.ts` (Playwright) — new user completes guided onboarding end-to-end

## Copy (Spanish rioplatense)

- Mode selector title: "Empezá como te sientas cómodo"
- Guided label: "Te guío con preguntas"
- Freetext label: "Escribí como quieras"
- Hybrid label: "Mezclo las dos"
- Disclaimer card: "Umbra no es terapia. Es un espejo. Si estás en crisis: 135 (Argentina)."
- Submit button: "Mostrame lo que ves"
- Word counter: "{N} palabras · mínimo 50 por área"

## Dependencies

- Consent flow (blocks route) — [features/CONSENT.md](CONSENT.md)
- KB research complete — [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md)
- Migration 002 with psychological_profiles.version column
- `charge_rate_limit` RPC

## See also

- [ANALYSIS.md](ANALYSIS.md) — Pass 1 + Pass 2 analysis
- [CONSENT.md](CONSENT.md) — consent flow (blocks this)
- [CARTA_AL_FUTURO.md](CARTA_AL_FUTURO.md) — optional final step
- `types/index.ts` → `ONBOARDING_AREAS` constant

## Post-implementación (2026-04-14)

Mejoras agregadas después del master build. La spec arriba describe
el onboarding conversacional dinámico base. Lo que sigue documenta
tres cambios concretos que están en producción.

### Modo ChatGPT seed (nuevo flujo paralelo)

Umbra tiene ahora dos modos de entrada al onboarding, seleccionables
en un `ModeSelector` inicial:

1. **Conversemos (dinámico)** — el flujo conversacional original,
   descrito arriba.
2. **Traelo desde ChatGPT (seed)** — el usuario pega un retrato
   que ChatGPT le escribió sobre sí mismo. Umbra lo parsea con un
   prompt dedicado (`lib/prompts/chatgpt-seed-parser.ts`), crea
   una sesión "seeded" con el `WorkingProfile` pre-populado, y
   después corre 2-3 turnos de refinamiento dinámico para
   validar/ajustar.

Archivos clave:
- `components/onboarding/ModeSelector.tsx` — selector de modo.
- `components/onboarding/SeedFromChatgptFlow.tsx` — UI multi-step
  del flujo seed (copiar prompt → pegar respuesta → seeding
  reveal → hand-off a DynamicFlow para refinamiento).
- `lib/prompts/chatgpt-seed-prompt.ts` — el prompt que el usuario
  copia a ChatGPT. Es self-contained: define Big Five + Jung +
  arquetipos + estructura de respuesta.
- `lib/prompts/chatgpt-seed-parser.ts` — prompt Claude que extrae
  un `WorkingProfile` tipado desde el texto pegado por el usuario.
- `app/api/onboarding/seed/route.ts` — Edge route con Zod + pipeline
  de safety sobre el texto pegado + rate limit + creación de
  sesión seeded.

### Fix del P1 regression (propagación de seed text al analyze)

Originalmente la feature ChatGPT seed tenía un bug documentado por
codex review (commit `f185d25`): el texto pegado por el usuario se
usaba solo para crear el `WorkingProfile` inicial, pero NO se
propagaba al `/api/analyze` final cuando el usuario terminaba el
refinamiento. Como consecuencia, el análisis final se construía
sobre 2-3 respuestas de refinamiento en lugar del retrato completo.

Fix aplicado en commit `791bbdc`:

- `lib/onboarding/session-store.ts` — `createSeededSession()` ahora
  persiste el full `rawSeedText` en `flags.seedText` (JSONB).
- `app/api/analyze/route.ts` — `AnalyzeInputSchema` acepta
  `sessionId` opcional. Cuando está presente, lee
  `flags.seedText` del session row y lo prepends al texts array
  como primer elemento con area "Retrato importado desde ChatGPT".
- `components/onboarding/DynamicFlow.tsx` —
  `synthesizeAndComplete()` pasa `sessionId: api.sessionId` en el
  POST body al `/api/analyze`.

Resultado: los perfiles seeded se construyen sobre el corpus
completo (retrato ChatGPT + turnos de refinamiento). El bug queda
documentado en el capítulo 11 Discusión como ejemplo de disciplina
de codex review en el proyecto.

### Undo del último turno (Fase 3.4)

El usuario ahora puede revisar su respuesta anterior. Debajo de
cada `QuestionCard` aparece un botón discreto "← revisar la
anterior" cuando `turnNumber > 1`. Al click:

1. POST a `/api/onboarding/undo` con el `sessionId`.
2. El endpoint llama a `undoLastAnsweredTurn(svc, session)` en
   `session-store.ts`, que elimina el último turno respondido
   (y cualquier turno pending que haya quedado).
3. El cliente resetea el store local (`api.setTurns([])`,
   `setCurrentQuestion(null)`) y llama a `fetchNext(null)`.
4. El conductor regenera la próxima pregunta desde el estado
   truncado. El `workingProfile` se recompone automáticamente
   porque el conductor lo reconstruye desde los turns en cada
   iteración.

Backend:

- `app/api/onboarding/undo/route.ts` — POST Edge route con Zod
  (`{ sessionId }`), consent gate, llama a `undoLastAnsweredTurn`,
  devuelve `{ sessionId, turns, workingProfile, flags }`.
- `lib/onboarding/session-store.ts` — `undoLastAnsweredTurn()`
  helper que elimina el último turn respondido y cualquier pending
  trailing.

UI:

- `components/onboarding/DynamicFlow.tsx` — nuevo callback
  `undoLastTurn()` + botón condicional. Usa un `fetchNextRef` para
  evitar dependencia circular entre callbacks. El botón está
  deshabilitado durante `submitting` o `thinking`.

Edge cases:
- No hay `sessionId` activa: el botón no aparece.
- No hay turn answered: el botón no aparece (sale en `turnNumber > 1`).
- Sesión seeded: mantiene `flags.seeded` + `flags.seedText` intactos
  gracias al merge fix del commit `f185d25`.

### InfoPopover en dimensiones del LiveProfilePanel (Fase 1)

El `LiveProfilePanel.tsx` ahora muestra un botón "?" al lado de
cada dimensión Big Five y cada función Jung. Al click, abre un
popover con:
- Título: nombre de la dimensión/función
- Body: descripción en español plano desde
  `lib/dimensions/labels.ts`
- Example: caso concreto de cómo se manifiesta un valor alto/bajo

Implementación:
- `components/ui/DimensionBar.tsx` gana un prop opcional
  `info: { title, body, example }`. Si está presente, renderiza
  `<InfoPopover>` al lado del label.
- `LiveProfilePanel.tsx` importa `BIG_FIVE_LABELS` y `JUNG_LABELS`
  de `lib/dimensions/labels.ts` y pasa el info correspondiente a
  cada bar.

PAIR cap. 3 Mental Models + cap. 4 Explainability.

### InsightPing colapsable (Fase 1 T1.6)

Los insights que el conductor emite durante el onboarding ya no
se auto-expiran a los 4.2 segundos. Ahora se acumulan en una lista
colapsable con botón toggle "Descubrimientos · N ▸" en
`LiveProfilePanel`. Default expanded, el usuario puede contraer
para reducir clutter.

- `components/onboarding/InsightPing.tsx` — simplificado: se
  eliminaron los `setTimeout` de hide/remove. El prop `onExpire`
  queda deprecated/opcional para backward compat pero no se invoca.
- `LiveProfilePanel.tsx` — lista colapsable con `max-h-80 overflow-y-auto`
  y caret animado.


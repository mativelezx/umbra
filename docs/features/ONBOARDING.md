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

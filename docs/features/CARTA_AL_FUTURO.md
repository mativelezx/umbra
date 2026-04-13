# Feature — Carta al Futuro (Letter to Your Future Self)

> Delight feature from CEO review expansion. User writes a letter at the end
> of onboarding, unlocks at +180 days, shows letter + profile snapshot.

## Phase
3 (write) + 4 (dashboard card, locked/unlocked variants)

## Why it exists

Hook temporal powerful: the moment a user writes a message to their future
self, they emotionally commit to Umbra as a mirror over time. 180 days later,
they return to read it — a retention moment no competitor has.

## Scope lock (important)

**Per CEO review spec review iter 2 (Finding 9)**: the carta unlock shows
ONLY the letter text and a static snapshot from `profile_snapshot_id`. NO diff.
NO re-analysis. The "diff entonces vs ahora" feature is moved to TODOS.md as
it depends on longitudinal tracking, which is deferred.

If longitudinal tracking is later added, the carta unlock can be enhanced to
show a profile diff. Until then, it's just the letter + a frozen moment.

## Write flow (end of onboarding, Phase 3)

After analyze completes and user sees their dashboard preview, an optional
step appears:

```
┌─────────────────────────────────────────────┐
│  📜 Una última cosa (opcional)              │
│                                             │
│  Escribile un párrafo a tu vos de 6 meses.  │
│  ¿Qué querés que recuerde?                  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ [textarea, 200-1000 chars]          │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Se va a abrir el {NOW + 180 days}          │
│                                             │
│  [Saltear] [Guardar mi carta]               │
└─────────────────────────────────────────────┘
```

On submit:
- INSERT `future_letters` with:
  - `user_id` = auth.uid()
  - `content` = letter text
  - `profile_snapshot_id` = current psychological_profile.id
  - `written_at` = NOW()
  - `unlock_at` = NOW() + INTERVAL '180 days'

No Claude call. Pure form submission.

## Dashboard display (Phase 4)

### Locked (before unlock_at)

```
┌────────────────────────────────────────┐
│  📜 Tu carta al futuro                 │
│                                        │
│  Escribiste una carta hace {N} días.   │
│  Se abre el {DD de MMMM de YYYY}       │
│  (en {M} días).                        │
│                                        │
│  [🔒 Bloqueada]                        │
└────────────────────────────────────────┘
```

### Unlocked (on or after unlock_at)

```
┌────────────────────────────────────────┐
│  📜 Tu carta al futuro                 │
│                                        │
│  Ya pasaron 180 días.                  │
│  Escribiste esto para vos.             │
│                                        │
│  [Leer tu carta →]                     │
└────────────────────────────────────────┘
```

Click → modal shows:

```
┌─────────────────────────────────────────────┐
│  Tu carta — escrita el {fecha original}     │
│                                             │
│  {letter content, Instrument Serif italic}  │
│                                             │
│  ─────────                                  │
│  Cuando escribiste esto eras:               │
│  • Arquetipo: El Sabio                      │
│  • Funciones dominantes: Ni, Ti             │
│  • Big Five: O82 C75 E28 A61 N44            │
│                                             │
│  [Cerrar]                                   │
└─────────────────────────────────────────────┘
```

No diff. No new analysis. Just a frozen moment.

## Components

- `components/onboarding/CartaForm.tsx` — write step at end of onboarding
- `components/dashboard/CartaFuturaCard.tsx` — locked + unlocked variants
- `components/dashboard/CartaFuturaModal.tsx` — full letter + snapshot on unlock

## Data

Stored in `future_letters` table (Migration 002). FK to `psychological_profiles.id`
for the snapshot.

## Unlock logic

Check `NOW() >= unlock_at`:

```tsx
const isUnlocked = new Date(letter.unlock_at) <= new Date();
```

No server-side enforcement needed — the query already returns the row.
Dashboard just decides which variant to show based on the date comparison.

## Edge cases

- **User deletes account before unlock**: cascade delete handles `future_letters` via FK CASCADE
- **User changes email after writing**: letter is server-side, email irrelevant
- **Reloj del server desfasado**: use UTC everywhere, acceptable drift < 1 second
- **User has multiple letters** (if they regenerate profile later): `ORDER BY written_at DESC LIMIT 1` shows most recent
- **User skips the write step**: no `future_letters` row; dashboard simply doesn't show the card

## Validation

- Letter min length: 200 chars (1-2 sentences minimum)
- Letter max length: 1000 chars (avoid novel-length letters)
- Required fields: content + profile_snapshot_id
- No moderation (trust the user with their own letter)

## Testing

- `components/onboarding/CartaForm.test.tsx` — form validation
- `components/dashboard/CartaFuturaCard.test.tsx` — locked + unlocked variants with mocked dates
- `e2e/carta-write-flow.spec.ts` — write + see locked card
- `e2e/carta-unlock-flow.spec.ts` — Playwright with `vi.useFakeTimers()` or system clock mock to simulate 180 days passing

## Dependencies

- `future_letters` table (Migration 002)
- Onboarding flow complete
- Dashboard complete (Phase 4)

## Not in scope

- **Diff view** (deferred to longitudinal tracking)
- **Email notification when letter unlocks** (deferred — see TODOS.md)
- **Multiple letters per user** (future feature)
- **Shareable letter** (private only)

## See also

- [ONBOARDING.md](ONBOARDING.md) — where the letter is written
- [DASHBOARD.md](DASHBOARD.md) — where the card appears
- [DECISIONS.md](../DECISIONS.md) — ADR-013 pseudonymization context (if research mode on, the letter does NOT go to research_dataset — personal only)
- TODOS.md → "Longitudinal diff at carta unlock"

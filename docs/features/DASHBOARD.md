# Feature — Dashboard

> Profile visualization hub. Big Five radar + Jung function bars + archetype
> card + narrative section + carta al futuro card.

## Phase
4

## Route
- `/dashboard` — server component fetches profile + narrative + letters; client components render interactive pieces

## Layout + information hierarchy

**Visual priority (what the user sees first, second, third):**

1. **PRIMARY (first 5 seconds)** — Archetype card. Large custom SVG + archetype name in Instrument Serif 5xl. "Your dominant pattern" is the emotional hook. No one cares about radar numbers until they've seen themselves reflected in a name.
2. **SECONDARY (next 15 seconds)** — Narrative section. 800-1200 words the user can start reading immediately. This is the content that justifies the product.
3. **TERTIARY (deeper exploration)** — Big Five radar + Jung bars. The evidence + instrumented detail. Users come back here when they want to dig in, not on first view.
4. **QUATERNARY** — Carta al futuro card. Temporal hook for retention, not for first session.

```
┌────────────────────────────────────────────────────────┐
│  Greeting (small): "Bienvenido de vuelta, {nombre}"    │
│  Stats pill: sesión #N · analizaste hace {N} días      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ── PRIMARY ──                                   │  │
│  │                                                  │  │
│  │    [128px Custom SVG]    TU ARQUETIPO DOMINANTE  │  │
│  │                          El Héroe                │  │
│  │                          (Instrument Serif 5xl)  │  │
│  │                          + El Explorador         │  │
│  │                                                  │  │
│  │  Orientado a superar desafíos y probar tu        │  │
│  │  valor a través de la acción.                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ── SECONDARY ──                                 │  │
│  │                                                  │  │
│  │  Tu narrativa                                    │  │
│  │  ─────────────                                   │  │
│  │  (Instrument Serif italic, 800-1200 words)       │  │
│  │  Streamed via SSE, progressive render            │  │
│  │                                                  │  │
│  │  [Regenerar narrativa]                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  ── TERTIARY ──      │  │  ── TERTIARY ──      │    │
│  │  Big Five            │  │  Funciones Jung      │    │
│  │  Radar Chart         │  │  (8 bars)            │    │
│  │  (Recharts)          │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ── QUATERNARY ──                                │  │
│  │  📜 Tu carta al futuro                           │  │
│  │     Se abre el {fecha}                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Why this order inverts the master doc**: original spec put radar chart first because it's visually impressive. But on first view, the user doesn't know what their scores mean — they just see numbers. Leading with the archetype + narrative gives them the story first, then the data as evidence. Classic "hierarchy as service" principle: the radar is not for first impression, it's for returning users exploring deeper.

**Nav items (5, unified desktop sidebar + mobile tabbar)**: Dashboard · Chat · Plan · Export · Settings

## Components (Phase 4)

- `app/dashboard/page.tsx` — server component, fetches data
- `components/dashboard/BigFiveRadar.tsx` — Recharts RadarChart
- `components/dashboard/JungFunctions.tsx` — 8 DimensionBar components grouped
- `components/dashboard/ArchetypeCard.tsx` — custom SVG from `archetypes/`
- `components/dashboard/NarrativeSection.tsx` — render + regenerate button
- `components/dashboard/CartaFuturaCard.tsx` — locked or unlocked variant
- `components/dashboard/EvidenceTooltip.tsx` — hover to see which phrases informed each trait
- `components/dashboard/archetypes/` — 6 SVG React components

## Data fetching

Server component `dashboard/page.tsx` uses Supabase server client to fetch:
- `psychological_profiles` (version=1 for v1)
- `narratives` (latest)
- `evidence_highlights` (latest)
- `future_letters` (user's letter if exists)
- `profiles` (for greeting)

All in a single batched query via `.select()` with relationships or multiple
parallel queries.

## Big Five Radar (`BigFiveRadar.tsx`)

Recharts `RadarChart` with 5 points (OCEAN). Config:
- Stroke: `violet-400` (#B466FF)
- Fill: `violet-400` with 20% opacity
- Axis labels: `font-mono` in `text-2` color
- Grid: `text-4` with subtle alpha
- Tooltips: glass card showing dimension name + value + "evidencia →" link
- Min height: 300px; responsive to container

## Jung Function Bars (`JungFunctions.tsx`)

8 horizontal `DimensionBar` components grouped:

```
Perceiving (how you take in info):
  Se ▰▰▰▰▰▰▱▱▱▱ 62
  Si ▰▰▰▱▱▱▱▱▱▱ 31
  Ne ▰▰▰▰▰▰▰▰▱▱ 78
  Ni ▰▰▰▰▰▱▱▱▱▱ 54

Judging (how you make decisions):
  Te ▰▰▰▰▱▱▱▱▱▱ 42
  Ti ▰▰▰▰▰▰▰▱▱▱ 68
  Fe ▰▰▰▱▱▱▱▱▱▱ 35
  Fi ▰▰▰▰▰▰▰▰▰▱ 85  ← dominant
```

Each bar:
- Fill: linear gradient `violet-600` → `violet-300`
- Animation: width transitions from 0 → actual over 800ms on mount
- Top 2 functions get a subtle glow
- Hover shows tooltip with function name + evidence phrases

## Archetype Card (`ArchetypeCard.tsx`)

```tsx
<div className="card-glow rounded-lg p-8 flex gap-6 items-center">
  <div className="w-32 h-32">
    <HeroArchetype size={128} />  {/* or Sage, Explorer, etc. */}
  </div>
  <div>
    <div className="font-mono text-xs text-text-3 uppercase tracking-wider">
      Tu arquetipo dominante
    </div>
    <h2 className="font-display text-4xl text-text-1 mt-2">
      El Héroe
    </h2>
    <p className="mt-2 text-text-2 max-w-md">
      Orientado a superar desafíos y probar tu valor a través de la acción.
    </p>
    <Badge className="mt-3">+ El Explorador</Badge>
  </div>
</div>
```

Uses `ARCHETYPE_INFO` from `types/index.ts` for name + description.

## Custom archetype SVGs (delight feature)

6 SVG React components in `components/dashboard/archetypes/`:
- `HeroArchetype.tsx`
- `SageArchetype.tsx`
- `ExplorerArchetype.tsx`
- `CreatorArchetype.tsx`
- `CaregiverArchetype.tsx`
- `RebelArchetype.tsx`

Design constraints (from [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)):
- viewBox: 256 × 256
- Stroke: 2px
- Palette: violet-400 primary, violet-200 accent
- Style: geometric, line-art, cosmic feel (constellations, orbits)
- Props: `size?: number` (default 128)

Ship in Phase 4. Design via `/design-shotgun` or Figma.

## Evidence Tooltip (`EvidenceTooltip.tsx`)

Hover on a radar point or function bar → shows a glass card with:
- Trait name
- 1-3 phrases from user's onboarding text that informed this trait (from `evidence_highlights`)
- Quote styled with violet left border

Data source: lazy fetch from `/api/evidence/{profileId}` or server-fetched on dashboard load.

## Narrative Section (`NarrativeSection.tsx`)

- Renders narrative content with `font-display` (Instrument Serif)
- Large line-height (1.7) for readability
- Subtle typing animation on first render (optional, disabled on `prefers-reduced-motion`)
- "Regenerar narrativa" button → `POST /api/narrative` with `regenerate: true`
- Loading state: shimmer placeholder during regeneration

## Carta al Futuro Card (`CartaFuturaCard.tsx`)

Two variants depending on `unlock_at` vs NOW():

**Locked**:
```
┌────────────────────────────────────────┐
│  📜 Tu carta al futuro                 │
│                                        │
│  Escribiste una carta a tu vos de      │
│  6 meses. Se abre el 12 de octubre     │
│  de 2026 ({N} días).                   │
│                                        │
│  ─────────                             │
│  [Locked icon]                         │
└────────────────────────────────────────┘
```

**Unlocked**:
```
┌────────────────────────────────────────┐
│  📜 Tu carta al futuro                 │
│                                        │
│  Ya pasaron 180 días.                  │
│  ¿Querés leer lo que te escribiste?    │
│                                        │
│  [Leer tu carta →]                     │
└────────────────────────────────────────┘
```

Clicking "Leer tu carta" opens a modal showing:
- Letter text
- "Cuando escribiste esto eras: {archetype} · top 2 functions: {Fi, Ne}"
- Static snapshot from `profile_snapshot_id`

No diff. No re-analysis. See [CARTA_AL_FUTURO.md](CARTA_AL_FUTURO.md).

## Loading + empty states

**Loading**: skeleton shimmer for each card section (radar, bars, archetype, narrative)
**Empty (no profile yet)**:
```
Dashboard page redirects to /onboarding if profiles.onboarding_completed = false
```

This is enforced by the middleware consent + onboarding gate.

## Partial loading (from CEO review section 11)

If the profile is ready but narrative is still streaming:
- Radar + Jung bars + archetype card render normally
- Narrative section shows shimmer + "tu narrativa se está generando..."
- No layout shift — reserved space for narrative

## Responsive behavior

- Desktop ≥1024px: two-column layout (radar + bars side-by-side), narrative full width below
- Tablet 768-1023px: stacked single column
- Mobile <768px: single column, radar first, bars grouped into one scrollable section

## Accessibility

- Radar + bars have visually-hidden `<table>` equivalents for screen readers
- All numeric data has `aria-label` with full dimension name
- Archetype card is a `<section>` with `aria-labelledby`
- Tab order: greeting → stats → radar → bars → archetype → narrative → carta

## Testing

- `components/dashboard/BigFiveRadar.test.tsx` — renders with mock data
- `components/dashboard/JungFunctions.test.tsx` — all 8 bars render, top 2 highlighted
- `components/dashboard/ArchetypeCard.test.tsx` — each of 6 archetypes renders correct SVG
- `components/dashboard/CartaFuturaCard.test.tsx` — locked + unlocked variants
- `e2e/dashboard-full-render.spec.ts` — full page load with seeded profile

## Dependencies

- Phase 3 complete (profile + evidence in DB)
- Phase 5 complete (narrative exists OR loading gracefully handled)
- Custom archetype SVGs designed

## See also

- [ANALYSIS.md](ANALYSIS.md) — how the profile gets created
- [NARRATIVE.md](NARRATIVE.md) — narrative streaming
- [CARTA_AL_FUTURO.md](CARTA_AL_FUTURO.md) — locked/unlocked card
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) — tokens + typography

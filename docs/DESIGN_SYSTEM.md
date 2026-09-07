> **Histórico / sustituido — 6 de septiembre de 2026.** Este documento conserva el sistema oscuro/violeta anterior como evidencia histórica. No rige la UI de la rama `codex/stoic-demo`: consultar [DESIGN.md](../DESIGN.md) y su [sidecar](../.impeccable/design.json), derivados de la implementación `c9bf16a`. La portada oscura actual, Bricolage Grotesque, la marca `umbra` y las ilustraciones propias pertenecen a la dirección vigente; no reutilizar los tokens ni la afirmación de referencia canónica que siguen debajo. Este aviso no certifica aceptación final, aprobación académica ni preparación de servicios reales.

# Umbra — Design System

> Visual language, design tokens, typography, colors, spacing, iconography.
> Canonical reference: open [umbra-design-system.html](../umbra-design-system.html) in a browser.

## Visual direction

**Brand**: SOMORA cósmica — dark violet, glass surfaces, subtle noise texture, gradient orbs, Instrument Serif display typography contrasted with modern sans-serifs.

**Vibe check**: "late-night introspection app, not corporate wellness app". Depth over clarity, invitation over instruction.

## Design tokens

### Color palette

```ts
// tailwind.config.ts
colors: {
  umbra: {
    void:     '#050510',  // darkest background
    abyss:    '#08081A',
    deep:     '#0E0E2A',
    shadow:   '#16163A',
    mist:     '#1E1E4A',
    surface:  '#28285A',  // card backgrounds
    elevated: '#32326A',  // elevated cards
  },
  violet: {
    50:  '#F5ECFF',
    100: '#E8D5FF',
    200: '#D4B3FF',
    300: '#CEA7FF',
    400: '#B466FF',  // PRIMARY brand color
    500: '#9B3FEB',
    600: '#7B2FCC',
    700: '#5A1FA6',
    800: '#3D1575',
    900: '#1E0A3A',
  },
  accent: {
    indigo:  '#6366F1',  // secondary accent
    cyan:    '#06B6D4',  // data viz highlight
    emerald: '#10B981',  // success states
    amber:   '#F59E0B',  // warning states
    rose:    '#F43F5E',  // error states + crisis
  },
  text: {
    1: '#F0ECFF',  // primary text
    2: '#A8A0C8',  // secondary text
    3: '#6B6490',  // tertiary / disabled
    4: '#3D3860',  // near-background
  },
}
```

### Typography

```ts
// tailwind.config.ts
fontFamily: {
  display: ['"Instrument Serif"', 'Georgia', 'serif'],
  heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
  body:    ['Inter', 'system-ui', 'sans-serif'],
  mono:    ['"JetBrains Mono"', 'monospace'],
}
```

**Usage**:
- `font-display` — hero titles, narrative body. Italic variant for emphasis. Sizes 3xl-8xl.
- `font-heading` — UI labels, buttons, section headings. Weights 400-700.
- `font-body` — paragraph text, form inputs. Weights 400-600.
- `font-mono` — numeric data, timestamps, IDs. Dashboard metrics.

**Source**: Google Fonts import in [globals.css](../app/globals.css).

### Border radius

```ts
borderRadius: {
  sm:   '8px',   // pills, tags, small buttons
  md:   '14px',  // inputs, small cards
  lg:   '20px',  // main cards
  xl:   '28px',  // modals, hero panels
  full: '9999px',
}
```

### Shadows + glows

```css
/* custom in globals.css */
.shadow-glow {
  box-shadow: 0 0 60px rgba(180, 102, 255, 0.08);
}

.card-glow {
  background: linear-gradient(
    135deg,
    rgba(180, 102, 255, 0.06),
    rgba(99, 102, 241, 0.03)
  );
  border: 1px solid rgba(180, 102, 255, 0.18);
  box-shadow: 0 0 60px rgba(180, 102, 255, 0.04);
}
```

### Effects

**Glass surface** (cards, panels):
```css
.glass {
  background: rgba(180, 102, 255, 0.04);
  border: 1px solid rgba(180, 102, 255, 0.1);
  backdrop-filter: blur(12px);
}

.glass:hover {
  background: rgba(180, 102, 255, 0.08);
  border-color: rgba(180, 102, 255, 0.2);
}
```

**Gradient orbs** (background ambient):
```css
.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.orb-violet {
  background: radial-gradient(circle, rgba(180, 102, 255, 0.12), transparent 65%);
}

.orb-indigo {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 65%);
}
```

Default layout places 3 orbs: top-left violet, top-right indigo, bottom-center violet. See [app/layout.tsx](../app/layout.tsx).

**Noise overlay** (`body::before`):
SVG fractal noise at 3% opacity, fixed position, pointer-events none. Breaks up the gradient smoothness for a more analog feel. See [globals.css](../app/globals.css).

## Icons — Phosphor

Library: `@phosphor-icons/react`
Style: `Regular` weight (not Bold, not Thin)
**NEVER use emoji in UI.**

### Canonical icon mapping

| Context | Icon | Import |
|---|---|---|
| Navigation home | `House` | `@phosphor-icons/react` |
| Insights | `Sparkle` | |
| Session / night / meditation | `MoonStars` | |
| Statistics | `ChartBar` | |
| Profile | `User` | |
| Archetype | `Compass` | |
| Chat | `ChatCircle` | |
| Questionnaire | `NotePencil` | |
| Hybrid mode | `Target` | |
| Settings | `Gear` | |
| Back navigation | `ArrowLeft` | |
| Send message | `ArrowUp` | |
| More options | `DotsThree` | |
| Brain / mind | `Brain` | |
| Vision / insight | `Eye` | |
| Energy / flow | `Lightning` | |
| Path / journey | `Path` | |
| Heart / care | `Heart` | |
| Shield / protection | `ShieldStar` | |
| Crisis / warning | `WarningCircle` | |
| Success | `CheckCircle` | |
| Lock / locked | `Lock` | |
| Calendar / date | `Calendar` | |

### Archetype icons (post delight expansion)

Replacing Phosphor stock icons for archetypes with custom SVGs in
`components/dashboard/archetypes/`. Design constraints:
- **viewBox**: 256 × 256
- **Stroke width**: 2px
- **Palette**: violet-400 primary, violet-200 accent, on umbra-void background
- **Style**: geometric, line-art, cosmic feel (orbital paths, constellations)
- **Export**: React components (`<HeroArchetype size={128} />`)

## Spacing

Uses Tailwind default scale (4px base unit). Most common:
- `gap-2` (8px) — tight clusters
- `gap-4` (16px) — default
- `gap-6` (24px) — loose
- `gap-8` (32px) — section breaks
- `py-12` / `py-24` — page-level vertical rhythm

## Motion

**Default easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind `ease-in-out`)
**Default duration**: `300ms`

Animations:
- **Orb drift** — infinite, 20s cycle, `prefers-reduced-motion: disabled`
- **Progressive load** — sequential reveal of profile dimensions over ~8s, `prefers-reduced-motion: disabled`
- **Evidence highlight fade-in** — 400ms per phrase, staggered
- **Glass hover** — 200ms background/border transition
- **Stream text** — no explicit animation (CSS handles char-by-char naturally)

**Accessibility override**: when `@media (prefers-reduced-motion: reduce)` matches, all decorative animations are disabled. Progressive load becomes instant reveal.

## Breakpoints

```ts
// Tailwind default
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

**Responsive targets**:
- **375px** (iPhone SE) — mobile minimum
- **768px** — tablet
- **1024px** — desktop sidebar appears
- **1440px** — desktop standard
- **2560px** — 4K / hi-dpi (just needs to not break)

## Layout shell

**Desktop (≥1024px)**: Sidebar (240px fixed) + main content.
**Mobile (<1024px)**: TabBar (bottom nav, 5 items) + main content.

**Nav items** (5 — same for both, resolves CEO review Section 11 tabbar mismatch):
1. Dashboard (`House`)
2. Chat (`ChatCircle`)
3. Plan (`Path`)
4. Export (`DownloadSimple`)
5. Settings (`Gear`)

## Component primitives (ui/)

To ship in Phase 2:
- `Button` — variants: primary (violet glow), secondary (glass), ghost (text only), danger (rose)
- `Card` — base flat card
- `GlassCard` — `.glass` effect
- `Input` — text input with umbra bg + violet focus border
- `Textarea` — multi-line input, counter optional
- `Badge` — small pill label
- `ProgressBar` — linear gauge
- `ProgressDots` — step indicator
- `DimensionBar` — horizontal bar for Jung function scores
- `LoadingDimension` — skeleton for progressive load

## Accessibility checklist (Phase 6)

- [ ] WCAG AA contrast: `text-2` on `umbra-void` = 4.5:1 minimum
- [ ] All icon-only buttons have `aria-label`
- [ ] All form inputs have `<label>` or `aria-labelledby`
- [ ] Dynamic regions (chat, progressive load) have `aria-live`
- [ ] Tab order is logical on every page
- [ ] Keyboard-only complete onboarding → dashboard → chat → export
- [ ] `prefers-reduced-motion` disables orbs and progressive load
- [ ] Screen reader pass with VoiceOver: onboarding + chat full flows
- [ ] `@axe-core/react` in dev mode: 0 violations on all pages

## References

- **Canonical visual reference**: [umbra-design-system.html](../umbra-design-system.html) — open in browser to see the full style sheet rendered
- **Tailwind config**: [tailwind.config.ts](../tailwind.config.ts)
- **Global CSS**: [app/globals.css](../app/globals.css)
- **Layout shell**: [app/layout.tsx](../app/layout.tsx)
- **Archetype descriptions**: `ARCHETYPE_INFO` in [types/index.ts](../types/index.ts)

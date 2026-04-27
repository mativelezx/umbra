# Feature — Landing Page + Auth (Register / Login)

## Phase
2

## Routes
- `/` — Landing page (public)
- `/(auth)/login` — Login form
- `/(auth)/register` — Registration form
- `/privacy` — Privacy policy (public)
- `/terms` — Terms of service (public)

## Landing page layout

```
┌───────────────────────────────────────────────────┐
│  Umbra · cosmic background (3 orbs + noise)       │
│  ─────────                                        │
│                                                   │
│         [logo]                                    │
│                                                   │
│         Conocé tu sombra.                         │
│         Iluminá tu camino.                        │
│                                                   │
│         (Instrument Serif, 8xl desktop,           │
│          italic violet-300 for the 2nd line)      │
│                                                   │
│         [Comenzar viaje] [Saber más]              │
│                                                   │
│  ─────────────────────────────────────────────────│
│                                                   │
│  Cuatro pilares                                   │
│                                                   │
│  [Rigor] [Jung directo] [Positive Computing]      │
│  [Argentino]                                      │
│                                                   │
│  (4 glass cards with icons + 1-sentence descs)    │
│                                                   │
│  ─────────────────────────────────────────────────│
│                                                   │
│  Footer: links | Umbra no es terapia | © 2026     │
└───────────────────────────────────────────────────┘
```

## Hero copy

- **Title**: "Conocé tu sombra. Iluminá tu camino."
- **Subtitle**: "Autoconocimiento con rigor académico. Jung, Big Five, Positive Computing. En tu idioma."
- **Primary CTA**: "Comenzar viaje" → `/(auth)/register`
- **Secondary CTA**: "Saber más" → scroll to principles section

## Four pilares section

Glass cards with Phosphor icons:

1. **Brain** — "Base teórica real — extraída de fuentes académicas"
2. **Compass** — "Jung directo, no MBTI — funciones cognitivas auténticas"
3. **Sparkle** — "Positive Computing — diseño para bienestar, no engagement"
4. **Path** — "Español latinoamericano — en el tono que hablás"

## Typography hierarchy

- Title: `font-display text-6xl md:text-8xl leading-[1.05]`
- Subtitle: `font-body text-lg md:text-xl text-text-2 max-w-2xl`
- Pilar headings: `font-heading text-xl`
- Pilar descriptions: `font-body text-sm text-text-2`

## Footer

```
┌───────────────────────────────────────────────────┐
│  Umbra · TFG Ingeniería en Software · Siglo 21    │
│                                                   │
│  [Privacidad] [Términos] [Github]                 │
│                                                   │
│  Umbra no es terapia.                             │
│  Si estás en crisis: 135 (Argentina) · 911        │
│                                                   │
│  © 2026                                           │
└───────────────────────────────────────────────────┘
```

## Register page (`/(auth)/register`)

Simple glass card centered:

```
┌─────────────────────────────────────┐
│          Empezá tu viaje             │
│                                     │
│   Nombre completo                   │
│   [                              ]  │
│                                     │
│   Email                             │
│   [                              ]  │
│                                     │
│   Contraseña (mín 8 caracteres)     │
│   [                              ]  │
│                                     │
│   [Crear cuenta]                    │
│                                     │
│   ¿Ya tenés cuenta? [Ingresar]      │
└─────────────────────────────────────┘
```

Submit:
- `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- If successful → session cookie set → redirect to `/consent`
- Error handling: email already exists, weak password, network error

## Login page (`/(auth)/login`)

```
┌─────────────────────────────────────┐
│              Ingresar                │
│                                     │
│   Email                             │
│   [                              ]  │
│                                     │
│   Contraseña                        │
│   [                              ]  │
│                                     │
│   [Ingresar]                        │
│                                     │
│   ¿Olvidaste tu contraseña?         │
│   [Recuperar]                       │
│                                     │
│   ¿No tenés cuenta? [Registrarte]   │
└─────────────────────────────────────┘
```

Submit:
- `supabase.auth.signInWithPassword({ email, password })`
- If successful → session → middleware decides `/consent` or `/dashboard`

## Middleware behavior (see [tech/AUTH.md](../tech/AUTH.md))

- Authenticated user on `/(auth)/*` → redirect to `/dashboard`
- Unauthenticated user on gated routes → redirect to `/login?redirectedFrom=...`
- Authenticated user without consent on gated routes → redirect to `/consent`

## Components (Phase 2)

- `app/page.tsx` — landing (server component)
- `app/(auth)/login/page.tsx` — login form (client)
- `app/(auth)/register/page.tsx` — register form (client)
- `app/privacy/page.tsx` — privacy policy (static content from `biz/LEGAL.md`)
- `app/terms/page.tsx` — terms of service (static content)
- `components/landing/Hero.tsx`
- `components/landing/PilaresSection.tsx`
- `components/landing/Footer.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`

## Testing

- `app/page.test.tsx` — landing renders all pilares + CTAs
- `app/(auth)/register/page.test.tsx` — form validation
- `app/(auth)/login/page.test.tsx` — form validation
- `e2e/register-flow.spec.ts` — new user signup → consent
- `e2e/login-flow.spec.ts` — existing user login → dashboard

## SEO

- `<title>`: "Umbra — Conocé tu sombra. Iluminá tu camino."
- `<meta description>`: "Plataforma de autoconocimiento con rigor académico. Jung, Big Five, Positive Computing. En español latinoamericano."
- og:title, og:description, og:image (1200×630, cosmic branding)
- Twitter card

## Performance

- Server-rendered (RSC) — first paint < 1.5s
- Critical CSS inlined (Next.js handles)
- Fonts preloaded via Google Fonts `preconnect`
- No client JS for the landing itself (only for interactive buttons)

## Accessibility

- Skip-to-content link at top
- ARIA labels on all buttons
- Form inputs have `<label>`
- Focus visible on all interactive elements
- WCAG AA contrast

## See also

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) — tokens + typography
- [tech/AUTH.md](../tech/AUTH.md) — middleware + redirects
- [CONSENT.md](CONSENT.md) — what happens after registration

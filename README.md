# Umbra

Plataforma de autoconocimiento basada en Jung (funciones cognitivas) + Big Five (IPIP-NEO) + Positive Computing, en español rioplatense. TFG de Ingeniería en Software, Universidad Siglo 21.

## Lo que hace Umbra

1. **Onboarding**: el usuario escribe sobre sí mismo (guiado en 5 áreas, o texto libre, o híbrido).
2. **Análisis**: Claude (Sonnet 4.6 pinneado) genera un perfil psicológico completo usando una base de conocimiento académica estructurada:
   - Big Five (IPIP-NEO) con 5 dimensiones × 6 facets
   - 8 funciones cognitivas Jung (Tipos Psicológicos 1921, directo, NO MBTI)
   - 6 arquetipos Pearson aplicados
3. **Narrativa**: 800-1200 palabras en voseo argentino, streameada vía SSE, escrita como un mentor que te conoce.
4. **Dashboard**: arquetipo con SVG custom, Big Five radar, 8 Jung function bars, carta al futuro.
5. **Chat con safety pipeline crítica**: banner permanente "no es terapia" + regex lexicon de 14 patrones + idiom pre-filter de 16 expresiones argentinas + classifier Claude fail-closed + crisis card con 135/911/Salud Mental Responde. 45min session timeout. Rate limits atomic.
6. **Plan de desarrollo**: 3 áreas con acciones y micro-objetivos chequeables.
7. **PDF export**: informe imprimible con print-safe stylesheet.
8. **Ley 25.326 compliance**: consent flow, data export, delete con magic link single-use 5min TTL, research opt-out.
9. **Carta al futuro**: al final del onboarding, el usuario le escribe a su vos de 180 días. Se desbloquea sola.

## Stack

- **Next.js 14.2.35** (App Router, Edge + Node runtimes)
- **TypeScript strict**
- **Tailwind CSS 3.4** con tokens custom (`umbra-*`, `violet-*`, `accent-*`, `text-*`)
- **Supabase** (Auth + PostgreSQL + RLS) via `@supabase/ssr`
- **Anthropic Claude** (`claude-sonnet-4-6-20260301` pinneado via env var)
- **Zustand 5** para stores de cliente
- **Recharts** para el radar chart
- **Phosphor Icons** (nunca emoji en UI)
- **html2pdf.js** client-side para export
- **Zod** para validación en todo boundary
- **Vitest** para unit tests (57/57 passing)
- **Playwright** para E2E tests

## Status

**Phases 1-6 shipped.** Ver `docs/PLAN.md` para el status dashboard completo.

- ✓ Phase 1 — scaffolding
- ✓ Phase 1.5 — ssr migration, errors, peppers, vitest, playwright, Migration 002
- ✓ Phase 2 — landing + auth + consent + Ley 25.326 endpoints
- ✓ Phase 3 — onboarding + analyze API + carta al futuro
- ✓ Phase 4 — dashboard + Big Five radar + Jung bars + custom archetype SVGs + narrative
- ✓ Phase 5 — narrative SSE + chat con full crisis safety pipeline
- ✓ Phase 6 — plan + PDF export + settings + account APIs

**57/57 unit tests passing. `tsc --noEmit` passing. `next build` compiles cleanly. 24 pages, 9 API routes, 80KB middleware.**

## Setup local

### 1. Dependencias

Ya instaladas (`npm install` si hace falta reinstalar).

### 2. Env vars

Copiá `.env.local.example` a `.env.local` y completá con keys reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
ANTHROPIC_API_KEY=sk-ant-<tu key>
ANTHROPIC_MODEL_ID=claude-sonnet-4-6-20260301
ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251001

# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CONSENT_IP_PEPPER_V1=<32-byte hex>
CRISIS_PEPPER_V1=<32-byte hex>
RESEARCH_PEPPER_V1=<32-byte hex>
DELETE_TOKEN_PEPPER_V1=<32-byte hex>

# Defaults (podés dejarlos)
DAILY_TOKEN_CAP=15000
DAILY_COST_CAP_CENTS=200
GLOBAL_DAILY_BUDGET_USD=50
```

### 3. Supabase migrations

En el SQL Editor del dashboard de Supabase, correr en orden:

1. `supabase/migrations/001_initial_schema.sql` (tablas base + RLS)
2. `supabase/migrations/002_core_tables.sql` (7 tablas nuevas + charge_rate_limit RPC + RLS)

### 4. Ejecutar

```bash
npm run dev           # Dev server en http://localhost:3000
npm run typecheck     # tsc --noEmit
npm run test          # Vitest units (57 tests)
npm run build         # Production build
npm run e2e           # Playwright E2E tests (requires dev server)
```

## Flujo de usuario completo

```
/ (landing)
  → /register
    → /consent (Ley 25.326 form blocking)
      → /onboarding (mode selector → guided/freetext/hybrid flow)
        → /api/analyze (Edge, Claude Sonnet, Pass 1 + Pass 2 parallel)
          → progressive load animation (8s)
            → carta al futuro opcional
              → /dashboard
                ├─ archetype card (primary: custom SVG + name + secondary)
                ├─ narrative section (SSE streaming, Instrument Serif)
                ├─ Big Five radar chart
                ├─ 8 Jung function bars
                └─ carta al futuro (locked/unlocked)
                  ├─ /chat (crisis pipeline + Claude contextualized)
                  ├─ /plan (3 areas + micro-goal checkboxes)
                  └─ /export (client-side html2pdf)

Settings:
  /settings/profile          — editar nombre
  /settings/export           — descargar ZIP con todos tus datos (Ley 25.326 acceso)
  /settings/research-opt-out — toggle modo investigación
  /settings/delete           — magic link 5min single-use → cascade delete
```

## Architecture highlights

### Chat safety pipeline (lib/chat/)
Tres capas en serie para cada mensaje de chat:
1. **Regex lexicon** (`crisis-lexicon.ts`): idiom pre-filter + 14 patrones de crisis. Zero-latency. No puede ser bypasseado por prompt injection porque corre antes de Claude.
2. **Claude classifier** (`classifier.ts`): solo corre si regex hit o 1% sampling. **Fail-closed**: cualquier error (timeout, malformed JSON, refusal) → trata como crisis.
3. **Hard block**: si detectó crisis, **NO llama a Claude**, retorna 451 con resources, loggea crisis_event con user_hash + message_hash (nunca texto plano).

### Rate limiting (lib/claude/pricing.ts + charge_rate_limit RPC)
Atómico via Supabase RPC con `FOR UPDATE` lock y `SECURITY DEFINER` + `SET search_path` hardening. Estimate + reconcile en finally block — si Claude falla, el usuario no paga tokens.

### HMAC peppers (lib/security/peppers.ts)
Web Crypto API (Edge-compatible). 4 peppers version-pinned (CRISIS, RESEARCH, CONSENT_IP, DELETE_TOKEN). Rotación migration-free vía `pepper_version` column en cada tabla.

### Knowledge base (lib/knowledge/)
4 archivos con starter content académico real:
- `big-five.ts` — IPIP-NEO (Goldberg 1999, public domain)
- `jung-functions.ts` — Tipos Psicológicos (Jung 1921)
- `archetypes.ts` — Pearson applied system (1991)
- `positive-computing.ts` — Calvo & Peters (2014)

Cada item tiene citation block JSDoc (`@source`, `@reference`, `@page_or_section`, `@verbatim`). Enforceable con CI linter (TODO).

## Documentation

Todo en `docs/`:

- [`docs/PLAN.md`](docs/PLAN.md) — entry point, status dashboard
- [`docs/SYSTEM_SPEC.md`](docs/SYSTEM_SPEC.md) — system specification
- [`docs/API_MAP.md`](docs/API_MAP.md) — todas las routes con schemas
- [`docs/FEATURE_MAP.md`](docs/FEATURE_MAP.md) — inventory con state matrix
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens, tipografía, componentes
- [`docs/PROMPT_ARCHITECTURE.md`](docs/PROMPT_ARCHITECTURE.md) — cómo funcionan los prompts + eval suite
- [`docs/CLOUD_HANDOFF.md`](docs/CLOUD_HANDOFF.md) — deploy a Vercel + Supabase
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — 22 ADRs
- `docs/biz/` — MARKET, LEGAL (Ley 25.326), ETHICS (Phase 0 gate), TFG (thesis + OSF)
- `docs/features/` — 10 feature specs detallados
- `docs/tech/` — deep-dives (ARCHITECTURE, DATABASE, AUTH, CHAT_SAFETY, RATE_LIMITING, SECURITY, EVALS, OBSERVABILITY)

## Lo que vos necesitás hacer antes del first run

1. ☐ Crear proyecto Supabase, copiar las 3 keys al `.env.local`
2. ☐ Generar 4 peppers con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y copiarlos al `.env.local`
3. ☐ Obtener `ANTHROPIC_API_KEY` de console.anthropic.com
4. ☐ Correr `supabase/migrations/001_initial_schema.sql` en Supabase
5. ☐ **Phase 0 ethics gate**: 30min meeting con tutor TFG para confirmar si el research dataset requiere ethics review formal (ver [docs/biz/ETHICS.md](docs/biz/ETHICS.md))
6. ☐ Correr `supabase/migrations/002_core_tables.sql` en Supabase (Branch A si el ethics gate clear, o comentar las secciones `research_dataset` para Branch B)
7. ☐ `npm run dev` → probar flow completo

## Prohibiciones (CLAUDE.md)

- NO MBTI. Usamos funciones Jung directamente.
- NO lenguaje diagnóstico ni clínico.
- NO `console.log` en producción (salvo structured JSON logs).
- NO `any` en TypeScript.
- NO prompts inline. Siempre en `lib/prompts/`.
- NO emoji en UI. Phosphor Icons.
- NO olvides rotar peppers cuando sospeches compromise.

## Licencia

TFG académico. Código open-source. El contenido de la knowledge base cita fuentes públicas (IPIP-NEO, Jung, Pearson, Calvo & Peters) — la knowledge base en sí está bajo la misma licencia que el código.

---

**Umbra no es terapia.** Si estás en crisis: 135 (Argentina) · 911 · 0800-999-0091

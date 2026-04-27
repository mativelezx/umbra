# Umbra

Plataforma de autoconocimiento. **Big Five (IPIP-NEO) como única teoría medida automáticamente** por un módulo ML propio (DistilBERT congelado + Ridge multi-output, FastAPI). Funciones cognitivas Jung (Jung 1921) + arquetipos Pearson aplicados (Pearson 1991) + Positive Computing (Calvo y Peters 2014) son **lectura interpretativa narrativa** producida por Claude. Todo en español rioplatense. TFG de Ingeniería en Software, Universidad Siglo 21.

**Producción**: https://umbra-sigma.vercel.app
**Estado**: deployed, migraciones 001-005 aplicadas. Pivot ML aplicado al código (2026-04-27): componente analítico independiente bajo `/ml/` con DVC + MLflow + métricas committeadas. Ver `docs/DECISIONS.md` (ADR-002 v2, ADR-026, ADR-027, ADR-028).

## Lo que hace Umbra

1. **Onboarding**: el usuario escribe sobre sí mismo (flujo dinámico adaptativo).
2. **Componente analítico (módulo ML propio en `/ml/`)**: infiere los 5 scores Big Five desde el texto introspectivo. Etapa 1: DistilBERT base multilingual cased congelado (CLS pooling). Etapa 2: cinco regresores Ridge independientes (uno por dimensión), entrenados con GridSearchCV alpha sobre Essays + corpus rioplatense propio (n=50, validado con rúbrica documentada). Pipeline reproducible con DVC + MLflow. Servido por FastAPI en `localhost:8000` (dev) o Render/Fly.io (prod opcional).
3. **Capa narrativa Claude (Sonnet 4.6 pinneado)**:
   - Pass 1.5 — lectura interpretativa de funciones cognitivas Jung + arquetipo + razonamiento (recibe Big Five inferido como contexto).
   - Pass 2 — evidence highlights (frase-a-frase).
   - Narrativa personalizada 800-1200 palabras en voseo argentino (SSE).
   - Plan de desarrollo (3 áreas + acciones + micro-objetivos).
   - Chat contextualizado con safety pipeline.
4. **Dashboard**: Big Five radar + 8 Jung function bars (lectura interpretativa) + arquetipo card.
5. **Chat con safety pipeline**: banner "no es terapia", regex lexicon + idiom pre-filter + classifier Claude fail-closed + crisis card con 135/911/Salud Mental Responde.
6. **PDF export** + **Carta al futuro** + **Ley 25.326 compliance** (consent + export + delete + opt-out).
3. **Narrativa**: 800-1200 palabras en voseo argentino, streameada vía SSE, escrita como un mentor que te conoce.
4. **Dashboard**: arquetipo con SVG custom, Big Five radar, 8 Jung function bars, carta al futuro.
5. **Chat con safety pipeline crítica**: banner permanente "no es terapia" + regex lexicon de 14 patrones + idiom pre-filter de 16 expresiones argentinas + classifier Claude fail-closed + crisis card con 135/911/Salud Mental Responde. 45min session timeout. Rate limits atomic.
6. **Plan de desarrollo**: 3 áreas con acciones y micro-objetivos chequeables.
7. **PDF export**: informe imprimible con print-safe stylesheet.
8. **Ley 25.326 compliance**: consent flow, data export, delete con magic link single-use 5min TTL, research opt-out.
9. **Carta al futuro**: al final del onboarding, el usuario le escribe a su vos de 180 días. Se desbloquea sola.

## Stack

### Capa web (Vercel)
- **Next.js 14.2.35** (App Router, Edge + Node runtimes)
- **TypeScript strict**
- **Tailwind CSS 3.4** con tokens custom
- **Supabase** (Auth + PostgreSQL + RLS) via `@supabase/ssr`
- **Anthropic Claude SDK** (Sonnet 4.6 pinned vía `ANTHROPIC_MODEL_ID` — usado solo para capa narrativa post-pivot)
- **Zustand 5** para stores
- **Recharts** + **Phosphor Icons** + **framer-motion**
- **html2pdf.js** client-side para export
- **Zod** para validación
- **Vitest** + **Playwright** + **@axe-core/playwright**
- **Cliente HTTP del módulo ML** (`lib/ml-client.ts`) — punto único de contacto con el componente analítico

### Componente analítico — módulo ML propio (`/ml/`, ADR-026)
- **Python 3.11**, FastAPI + uvicorn
- **DistilBERT base multilingual cased** (transformers, congelado, CLS pooling)
- **scikit-learn Ridge** (5 regresores multi-output, GridSearchCV alpha)
- **MLflow** para tracking + **DVC** para versionado de datasets + **joblib** para serialización
- Servido en `localhost:8000` (dev) o Render/Fly.io (prod opcional, Dockerfile + render.yaml committeados)
- Pipeline reproducible: `cd ml && make all`

## Status

**Master build phases 1-7 shipped** + **TFG sessions phases 0-6 shipped**.

Master build (spec original):
- ✓ Phase 1 — scaffolding
- ✓ Phase 1.5 — ssr migration, errors, peppers, vitest, playwright, Migration 002
- ✓ Phase 2 — landing + auth + consent + Ley 25.326 endpoints
- ✓ Phase 3 — onboarding + analyze API + carta al futuro
- ✓ Phase 4 — dashboard + Big Five radar + Jung bars + custom archetype SVGs + narrative
- ✓ Phase 5 — narrative SSE + chat con full crisis safety pipeline
- ✓ Phase 6 — plan + PDF export + settings dashboard + account APIs
- ✓ Phase 7 — SEO, error boundaries, a11y pass, Resend integration, CI workflow, Vercel config
- ✓ Fullstack wire-up (2026-04-13)

TFG sessions (post-master, 2026-04-14, ver [`docs/biz/IMPLEMENTATION_PLAN.md`](docs/biz/IMPLEMENTATION_PLAN.md)):

- ✓ **Fase 0** — fundación académica (ADRs 023-025, VALIDATION.md, IMPLEMENTATION_PLAN.md, TFG.md, 16 thesis stubs)
- ✓ **Fase 1** — 7 quick wins UX como aplicación de heurísticas PAIR (confidence surface, pull quotes, TOC sticky con scroll-spy, InfoPopover en dimensiones, InsightPing colapsable, QuickPromptChips siempre visibles, line-length 65ch)
- ✓ **Fase 2** — UMUX-Lite/METUX/CUQ/SUS in-app instrumentation (migration 005 + tabla usability_responses + Edge API + UsabilityPrompt component)
- ✓ **Fase 3** — 6 sub-fases estructurales:
  - 3.1 Progressive disclosure 2 capas en dashboard
  - 3.2 framer-motion con LazyMotion spring physics
  - 3.3 Chat persistente con sidebar de historial
  - 3.4 Undo del último turno de onboarding
  - 3.5 PDF export con link desde dashboard + type fix
  - 3.6 Autonomy dial chat (modo espejo/guía/reto)
- ✓ **Fase 4** — H3 safety empírico (crisis dataset n=100 + runner + test + script)
- ✓ **Fase 4.5** — M3 think-aloud materials (protocolo + consent + SUS + recruitment copy)
- ✓ **Fase 5** — H1/H2 eval runners + corpus n=50 + Mermaid architecture + STRIDE threat model + axe-core CI + migration 004 consent_text_hash
- ✓ **Fase 6** — thesis skeleton (16 chapters + README + Pandoc build) + 4 chapters drafted (03 marco teórico, 06 arquitectura, 08 validación, + OSF preregistration ready to paste)
- ✓ **P1 fix** — ChatGPT seed flow raw text propagation al analyze (codex review finding)
- ✓ **Experimentos empíricos ejecutados** contra Claude API prod:
  - H1 (determinismo, n=25×3 reducido): 13/25 FALSIFICADO en su umbral estricto. Big Five estable (max stddev 1.88), Jung functions inestables (max 7.07). Finding valioso.
  - H2 (robustez paráfrasis, n=25×3 intra-vendor): 18/25 FALSIFICADO, mean delta 10.24 apenas sobre umbral 10. Reformulable como intervalo empírico.
  - H3 (safety crisis, n=100 full corpus): config producción FALLA (recall 0.52); config forzada PASA (recall 1.0, precision 0.862, F1 0.926). Recomendación: subir sampleRate a 1.0 en producción.

**`tsc --noEmit` passing. `npm run build` compiles cleanly. 33 páginas (incluye 6 rutas nuevas de Fase 2/3), 15 API routes, 80KB middleware. 28 commits desde la fase 0.**

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
ANTHROPIC_MODEL_ID=claude-sonnet-4-6
ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251001

# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CONSENT_IP_PEPPER_V1=<32-byte hex>
CRISIS_PEPPER_V1=<32-byte hex>
RESEARCH_PEPPER_V1=<32-byte hex>
DELETE_TOKEN_PEPPER_V1=<32-byte hex>

# Email (delete confirmation magic links). Si no setteás RESEND_API_KEY el
# sistema loggea el link al server y lo muestra inline en la UI en modo dev.
RESEND_API_KEY=re_<tu-key>
EMAIL_FROM=umbra@tu-dominio.com

# Deployment base URL (used by robots.ts + sitemap.ts + metadataBase)
NEXT_PUBLIC_SITE_URL=https://umbra.tu-dominio.com

# Defaults (podés dejarlos)
DAILY_TOKEN_CAP=15000
DAILY_COST_CAP_CENTS=200
GLOBAL_DAILY_BUDGET_USD=50
```

### 3. Supabase migrations

En el SQL Editor del dashboard de Supabase, correr en orden, o usar `supabase db push --linked --include-all`:

1. `supabase/migrations/001_initial_schema.sql` (tablas base + RLS)
2. `supabase/migrations/002_core_tables.sql` (7 tablas nuevas + charge_rate_limit RPC + RLS)
3. `supabase/migrations/003_onboarding_sessions.sql` (onboarding_sessions table con flags JSONB + RLS)
4. `supabase/migrations/004_consent_text_hash.sql` (ADR-024: agrega consent_text_hash + locale a consent_records para Ley 25.326 art. 7)
5. `supabase/migrations/005_usability_responses.sql` (Fase 2: tabla usability_responses para UMUX-Lite/METUX/CUQ/SUS in-app)

Las 5 migrations están aplicadas en el proyecto prod linkeado (São Paulo region `abhtdinyegnwrnycwsca`). Verificable con `supabase migration list --linked`.

### 4. Ejecutar

```bash
npm run dev           # Dev server en http://localhost:3000
npm run typecheck     # tsc --noEmit
npm run lint          # next lint
npm run test          # Vitest units (57 tests)
npm run build         # Production build
npm run test:e2e      # Playwright E2E tests (requires dev server)
```

> **Dev server tip:** if you flip between `npm run build` and `npm run dev`, the
> `.next/` cache can end up wedged (dev server serves SSR HTML with 404 chunks).
> If that happens: `rm -rf .next && npm run dev`. Or keep `npm run build` in CI
> and never mix dev + prod in the same working tree.

### 5. Demo mode (sin backend)

Para un walkthrough visual sin Supabase ni Anthropic:

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

Esto seedea un perfil Pearson Sage (O=88, C=70, E=25...), una narrativa de 800+
palabras en rioplatense, un plan de 3 áreas, y una carta al futuro archivada. El
middleware saltea el consent gate y la UI carga todo desde `lib/demo/seed.ts`.

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
  /settings                  — landing con 4 entries (perfil, export, research, delete)
  /settings/profile          — editar nombre
  /settings/export           — descargar JSON con todos tus datos (Ley 25.326 acceso)
  /settings/research-opt-out — toggle modo investigación
  /settings/delete           — magic link 5min single-use → cascade delete
    → (Resend si está configurado, o link inline en dev)
    → /settings/delete/confirm?token=... — confirma y borra en cascade
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
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — **25 ADRs** (002 Jung direct, 014 cache snapshots, 020 intra-vendor H2, 023 Branch B + M3, 024 consent text hash, 025 PAIR heuristics application)
- [`docs/biz/`](docs/biz/) — documentación de negocio/académica:
  - [`IMPLEMENTATION_PLAN.md`](docs/biz/IMPLEMENTATION_PLAN.md) — plan de 6 fases con QA gate estándar, checkboxes, timeline
  - [`VALIDATION.md`](docs/biz/VALIDATION.md) — hipótesis H1/H2/H3 + protocolo M3 + **resultados empíricos** con tablas
  - [`TFG.md`](docs/biz/TFG.md) — estructura de tesis + preregistro OSF + status de experimentos
  - [`ETHICS.md`](docs/biz/ETHICS.md) — Helsinki + Calvo & Peters + Branch A/B
  - [`LEGAL.md`](docs/biz/LEGAL.md) — Ley 25.326 compliance con consent_text_hash
  - [`MARKET.md`](docs/biz/MARKET.md) — competitive landscape
- [`docs/features/`](docs/features/) — 10 feature specs detallados, cada uno con sección "Post-implementación" que documenta los cambios de Fase 1/2/3 sobre la spec original
- [`docs/tech/`](docs/tech/) — deep-dives:
  - [`ARCHITECTURE.md`](docs/tech/ARCHITECTURE.md) — topología con diagramas Mermaid
  - [`THREAT_MODEL.md`](docs/tech/THREAT_MODEL.md) — STRIDE completo por 7 componentes (nuevo en Fase 5)
  - [`CHAT_SAFETY.md`](docs/tech/CHAT_SAFETY.md) — pipeline + **resultados H3** empíricos
  - `DATABASE.md`, `AUTH.md`, `RATE_LIMITING.md`, `SECURITY.md`, `EVALS.md`, `OBSERVABILITY.md`
- [`docs/research/`](docs/research/) — materiales para el estudio M3:
  - `M3-session-protocol.md` — guion minuto a minuto de sesiones think-aloud
  - `M3-recruitment-copy.md` — copy de reclutamiento
  - `sus-spanish-rioplatense.md` — cuestionario SUS
  - `osf/preregistration-standard.md` — texto del preregistro OSF ready to paste
- [`thesis/`](thesis/) — **esqueleto de la tesis con 16 capítulos + Pandoc build**:
  - 00-15 capítulos numerados (03 Marco teórico, 06 Arquitectura, 08 Validación computacional drafteados por codex)
  - `README.md` con mapeo capítulo → fuente primaria
  - `pandoc.yaml` + `build.sh` para generar el PDF final
- [`eval-results/`](eval-results/) — **JSONs con los resultados empíricos** de H1/H2/H3 (H1 2026-04-14, H2 2026-04-14, H3 default + forced 2026-04-14)

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

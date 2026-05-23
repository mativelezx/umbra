# umbra

Plataforma web de autoconocimiento basada en Big Five (IPIP-NEO), funciones cognitivas de Jung y Positive Computing. Umbra es el Trabajo Final de Grado de Ingeniería en Software para Universidad Siglo 21.

**Producción:** https://umbra-sigma.vercel.app
**Estado:** deployed, migraciones 001-006 documentadas, módulo ML reproducible y readiness de defensa activo
**Workspace:** pnpm `9.15.0` + Turborepo baseline single-package
**Nota clínica:** Umbra no es terapia, diagnóstico ni consejo médico.

## Qué Hace

Umbra toma texto introspectivo del usuario y devuelve una lectura reflexiva en español latinoamericano con safety crítico:

1. **Onboarding:** modo guiado, texto libre o flujo dinámico conducido.
2. **Capa analítica propia:** `ml/` infiere Big Five con DistilBERT multilingual congelado + Ridge multi-output y reporta métricas por dimensión.
3. **Capa narrativa:** IA generativa externa produce lectura interpretativa: funciones Jung, arquetipo Pearson, retrato y plan.
4. **Dashboard:** arquetipo, radar Big Five, barras de funciones, narrativa y carta al futuro.
5. **Chat seguro:** banner permanente "no es terapia", regex lexicon, idiom pre-filter, classifier fail-closed y crisis card con recursos argentinos.
6. **Plan de desarrollo:** 3 áreas con acciones y micro-objetivos.
7. **Export:** informe PDF/print-safe y exportación de datos.
8. **Ley 25.326:** consentimiento, exportación, rectificación, cancelación y oposición.

## Stack

- **Framework:** Next.js `14.2.35` App Router + React `18.3`.
- **Lenguaje:** TypeScript strict.
- **UI:** Tailwind CSS `3.4`, tokens `umbra-*`, `violet-*`, `accent-*`, `text-*`.
- **Datos:** Supabase Auth/PostgreSQL/RLS via `@supabase/ssr`.
- **Estado:** Zustand 5.
- **IA narrativa:** Anthropic Claude con `ANTHROPIC_MODEL_ID` fijado por entorno.
- **ML propio:** Python, Hugging Face Transformers, scikit-learn, MLflow, DVC, FastAPI, joblib.
- **Validación:** Zod, Vitest, Playwright y `@axe-core/playwright`.
- **Tooling:** pnpm workspace metadata + Turborepo baseline para checks cacheables.

## Estructura Del Repo

Umbra se mantiene intencionalmente como single-package root app. Moverla a `apps/web` es una migración futura, no una limpieza menor, porque impacta rutas, Vercel, imports, tesis y evidencia de defensa.

```text
umbra/
├── app/              # Next.js App Router
├── components/       # UI por feature
├── lib/              # dominio, prompts, Supabase, safety, stores
├── types/            # contratos compartidos
├── ml/               # módulo analítico Python reproducible
├── docs/             # documentación técnica, académica y de producto
├── thesis/           # estructura de tesis
├── supabase/         # migraciones y snippets
├── .agent-os/        # contratos/agentes portables
├── .claude/          # adaptador local mínimo
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

## Setup Local

```bash
corepack enable
pnpm install
pnpm dev
```

Abrir http://localhost:3000.

Para demo sin backend:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

## Variables De Entorno

Copiá `.env.local.example` a `.env.local` y completá:

- Supabase URL/anon/service role.
- Anthropic API key e identificador de modelo.
- Peppers HMAC versionados: `CONSENT_IP_PEPPER_V1`, `CRISIS_PEPPER_V1`, `RESEARCH_PEPPER_V1`, `DELETE_TOKEN_PEPPER_V1`.
- Caps de presupuesto diario.
- `ML_API_URL`, por defecto `http://localhost:8000`.
- URL pública y configuración de email.

## Módulo Analítico

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
make all
make serve
```

Detalle: [`ml/README.md`](ml/README.md).

## Comandos

```bash
pnpm dev              # Next dev
pnpm build            # Production build
pnpm start            # Next start
pnpm typecheck        # tsc --noEmit
pnpm lint             # next lint
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm verify           # typecheck + lint + test + build
pnpm turbo:build      # Build vía Turbo
pnpm integrity:check  # Cruza workspace, APIs, Supabase/RLS y residuos
pnpm agent-os:check   # Gate mínimo Agent OS
```

## Flujo De Usuario

```text
/ → /register → /consent → /onboarding
  → /api/analyze
    → ML Big Five
    → narrativa externa
      → /dashboard
        ├─ /chat
        ├─ /plan
        ├─ /export
        └─ /settings
```

## Documentación Canónica

- [`docs/PLAN.md`](docs/PLAN.md) — entry point y dashboard de estado.
- [`docs/SYSTEM_SPEC.md`](docs/SYSTEM_SPEC.md) — spec del sistema.
- [`docs/API_MAP.md`](docs/API_MAP.md) — rutas y contratos.
- [`docs/FEATURE_MAP.md`](docs/FEATURE_MAP.md) — features y matriz de estado.
- [`docs/PROMPT_ARCHITECTURE.md`](docs/PROMPT_ARCHITECTURE.md) — prompts y knowledge base.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — ADRs.
- [`docs/tech/`](docs/tech/) — arquitectura, seguridad, DB, rate limit, evals y observabilidad.
- [`docs/biz/`](docs/biz/) — TFG, validación, ética, legal, mercado y plan.
- [`docs/research/`](docs/research/) — protocolo SUS y reclutamiento.
- [`thesis/`](thesis/) — tesis con capítulos.
- [`UMBRA_MASTER_BUILD.md`](UMBRA_MASTER_BUILD.md) — spec histórica de la fase web inicial, mantenida porque la tesis la referencia.

## Guardrails

- No MBTI.
- No lenguaje diagnóstico ni clínico.
- No prompts inline; siempre en `lib/prompts/`.
- No `any` en TypeScript.
- No `console.log` productivo.
- No emoji en UI; usar Phosphor Icons.
- Crisis pipeline fail-closed antes de cualquier respuesta sensible.
- RLS obligatorio para datos de usuario.

## Checklist Antes De Deploy/Defensa

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm integrity:check
pnpm agent-os:check
```

---

Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911 · Salud Mental Responde · Centros de Salud Mental Comunitaria.

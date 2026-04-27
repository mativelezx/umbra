# APPLY_REFACTOR — Aplicar pivot ML desde VS Code

> Tres clicks. En orden. Sin terminal manual.

## Setup (una vez, 30 segundos)

1. Abrí VS Code en `~/Desktop/Umbra`. Si te pregunta "¿confiás en este workspace?", decí que sí.
2. Abrí terminal integrada: ``Ctrl+` `` (backtick).
3. Corré:

```bash
bash scripts/setup-vscode.sh
```

Eso copia `tasks.json` y `extensions.json` a `.vscode/` (Cowork no podía
escribir ahí directamente) y marca los scripts como ejecutables. Si VS
Code te ofrece instalar las extensiones recomendadas, aceptá.

4. Recargá la ventana: `Cmd+Shift+P` → `Developer: Reload Window`.

A partir de acá las tasks aparecen en `Cmd+Shift+P → Tasks: Run Task`.

## Tasks disponibles

`Cmd+Shift+P` → escribí `Tasks: Run Task` → elegí una de:

| Task | Qué hace | Cuándo |
|---|---|---|
| **ML Pivot: 1 — Apply commits** | Stash + branch nueva + 9 commits granulares | YA |
| **ML Pivot: 2 — Verify** | typecheck + pytest + pipeline ML + thresholds | después de la 1 |
| **ML Pivot: 3 — Serve FastAPI** | Levanta uvicorn en `localhost:8000` (background) | cuando querés probar end-to-end |
| **ML Pivot: 4 — Smoke test API** | curl /health + /version + /infer | con la 3 corriendo |
| **ML Pivot: 5 — Push branch** | `git push -u origin feat/ml-module-pivot` | cuando confíes en la 1+2 |
| **ML Pivot: 6 — Open PR (gh CLI)** | Crea PR draft con `COMMIT_PLAN.md` como body | después de la 5, opcional |
| **ML Pivot: 7 — Train DistilBERT** | `make train && make evaluate` | después de meter Essays |
| **Umbra: Dev server Next.js (con módulo ML)** | `npm run dev` con `ML_API_URL` set | con la 3 corriendo en paralelo |

## Secuencia mínima (10 minutos)

1. **Tarea 1** — Aplicar commits.
   Output esperado: 9 commits aplicados, summary final con `git log`.

2. **Tarea 2** — Verificar.
   Output esperado: `✓ TS typecheck OK`, `✓ pytest pasó`, `✓ pipeline ML OK`.

3. **Tarea 5** — Push branch.
   Output esperado: `feat/ml-module-pivot` aparece en GitHub.

4. **Tarea 6** (opcional) — Abrir PR draft.
   Necesita `gh` CLI: `brew install gh && gh auth login`.

Cuando estés tranquilo con todo, mergeás la branch a `main` desde
GitHub o:

```bash
git checkout main
git merge --no-ff feat/ml-module-pivot
git push origin main
```

## Probar end-to-end con el frontend

En tres terminales (o tres tasks de VS Code):

1. Tarea 3 — `Serve FastAPI` (deja el panel abierto).
2. Tarea `Umbra: Dev server Next.js` (deja el panel abierto).
3. Tarea 4 — `Smoke test API` (validación rápida, una sola vez).

Andá a `http://localhost:3000` y hacé el onboarding completo. El
analysis lo procesa el módulo ML local.

## Si algo falla

- **Tarea 1 falla con "branch ya existe"**: borrá la branch local con
  `git branch -D feat/ml-module-pivot` y volvé a correr la tarea 1.
- **Tarea 2 falla en `pip install`**: probablemente `python3.11` no
  está. En macOS: `brew install python@3.11` y re-correr.
- **Tarea 4 falla con connection refused**: la tarea 3 no está
  corriendo. Lanzala primero.
- **Test de Vitest legacy fallan tras el refactor**: `consistency.ts`
  y `cross-model-paraphrase.ts` ahora son stubs que arrojan error.
  Hay que skipear esos tests o convertirlos a aserciones de
  deprecación. Está documentado en `COMMIT_PLAN.md` Sección 4.1.

## Lo que queda para después (no urgente)

Ver `COMMIT_PLAN.md` Sección 4. En orden de prioridad:

1. Integrar dataset Essays (ver `ml/data/essays/README.md`).
2. Tarea 7 — Entrenar DistilBERT.
3. Decidir UX dashboard bajo umbral (ADR-027).
4. (Opcional) Deploy del módulo ML en Render para producción.

---

## Glosario rápido

- **Branch nueva**: `feat/ml-module-pivot`. Tus cambios uncommitted
  previos quedan en `git stash` (los recuperás con `git stash pop`
  desde main cuando termines de mergear).
- **Feature flag**: `ANALYZE_BIG_FIVE_SOURCE` en `.env.local`. Default
  `ml` (módulo nuevo); `claude` para fallback breve si el módulo cae.
- **Rollback rápido**: cambiar el feature flag a `claude` en Vercel
  Project Settings. No hay que revertir commits.

Si te trabás en algún paso, copiá el output del panel de VS Code y
mandámelo.

# Errata y addendum post-entrega — Pivot ML

> **Documento**: errata para inclusión en TP2 / TP3.
> **Fecha del pivot**: 2026-04-27 (autorización: Mainero, 2026-04-16).
> **Versión congelada del TP1 entregado**: commit `04153e7` en `main`,
> fecha 2026-04-26.
> **Branch del pivot**: `feat/ml-module-pivot` (commits `ed33ba0`..HEAD).

## 1. Motivo del addendum

Posterior a la entrega de TP1, el componente analítico del sistema fue
re-arquitecturado. Esta errata documenta los cambios de manera explícita
para preservar la trazabilidad académica entre la versión entregada y la
versión vigente del repositorio. Ningún capítulo del TP1 se reescribe;
los capítulos 03 (Marco teórico) y 05 (Metodología) reciben **notas
post-pivot al inicio** que apuntan a este documento. El capítulo 07
(Implementación) y el capítulo 09 (Validación) requieren revisión
sustancial en TP2 — esta errata indica los puntos exactos.

## 2. Resumen del cambio

| Componente | TP1 entregado (commit 04153e7) | Versión vigente (post-pivot) |
|---|---|---|
| Inferencia Big Five | Claude API (Pass 1 monolítico, Edge Runtime) | Módulo ML propio (DistilBERT congelado + Ridge multi-output) |
| Hosting del componente analítico | Vercel (Edge) | Servicio Python independiente — local en desarrollo, Render/Fly.io en producción opcional |
| Validación primary | H1 (determinismo Claude) + H2 (paráfrasis intra-vendor) + H3 (crisis classifier) | MSE / R² / r de Pearson por dimensión Big Five (ADR-028) + H3 (mantiene) |
| Preregistración OSF | Vigente (ADR-012) | Descartada (ADR-012 SUPERSEDED). Auditabilidad sustituida por DVC + MLflow + commits del repo público + métricas committeadas |
| Stack ML | — (no había stack ML propio) | torch (frozen forward pass), transformers, tokenizers, scikit-learn, FastAPI, MLflow, DVC, pandas, numpy, joblib |

## 3. Decisiones arquitecturales (ADRs) afectadas

Las siguientes ADRs cambiaron de estado en `docs/DECISIONS.md` (commit
`ed33ba0` de la branch del pivot):

- **ADR-002 v2**: separación explícita medido (Big Five) vs narrativo
  (Jung, Pearson, Positive Computing). Reemplaza la versión del 12/04.
- **ADR-007 amendado**: archetype tratado como etiqueta narrativa, no
  como medición.
- **ADR-011 SUPERSEDED por ADR-028**: H1 deprecada (la inferencia Big
  Five ya no la hace Claude — el regresor es determinístico por
  construcción).
- **ADR-012 SUPERSEDED por ADR-023 v2 + ADR-028**: OSF descartada.
- **ADR-014 partially SUPERSEDED por ADR-026**: snapshots Claude
  deprecados; reproducibilidad ahora vía DVC + MLflow.
- **ADR-020 SUPERSEDED por ADR-026**: H2 cross-model rewriters deprecada.
- **ADR-023 amendado**: validación primary = métricas Big Five por
  dimensión + H3 + M3.
- **ADR-026 nuevo**: módulo ML propio (DistilBERT congelado + Ridge
  multi-output + FastAPI + MLflow + DVC).
- **ADR-027 nuevo**: política de reporte por dimensión bajo umbral
  (R² > 0.20 / r > 0.30) → marca `low_confidence` y exclusión del
  componente cuantitativo del perfil cuando la métrica no defendible.
- **ADR-028 nuevo**: validación primary = métricas estándar de regresión
  por dimensión Big Five (MSE / R² / r de Pearson).

## 4. Capítulos del thesis afectados

### 4.1 Capítulo 03 — Marco teórico

Recibió banner post-pivot al inicio (commit `177bbf1`). El cuerpo del
capítulo no requiere reescritura: el marco teórico de Big Five, Jung,
Pearson y Positive Computing sigue siendo el mismo. Lo que cambia es
que **el Big Five se mide automáticamente vía IPIP-NEO operacionalizado
por el módulo ML propio**, no inferido por Claude.

### 4.2 Capítulo 05 — Metodología

Recibió banner post-pivot al inicio (commit `177bbf1`). El cuerpo del
capítulo describe la metodología H1/H2/H3+M3 vigente al momento de
entrega; en TP2 corresponde reescribir las secciones de H1 y H2 como
métodos descontinuados, conservar H3 y M3, y agregar una sección nueva
sobre la validación del módulo ML (MSE / R² / r de Pearson, splits
80/10/10, política de umbral por dimensión, política de reporte
honesto bajo n chico).

### 4.3 Capítulo 06 — Arquitectura

Requiere revisión. La descripción actual del capítulo refleja la
topología pre-pivot (Vercel + Supabase + Anthropic, todo dentro de
Edge/Node Runtime). En TP2:

- Agregar la **MÓDULO ML PROPIO (Python, FastAPI)** como nodo
  arquitectural separado.
- Documentar la frontera HTTP entre Vercel y el servicio ML
  (`process.env.ML_API_URL`).
- Documentar la política de fallback explícita: si el módulo ML cae,
  POST `/api/analyze` devuelve `503 ai_unavailable`. **No se degrada
  a Claude por defecto** — re-abrir esa brecha invalidaría el pivot
  (ADR-002 v2 + ADR-026).
- Reflejar que la capa Claude residual cubre solo: Pass 1.5 narrativo
  (Jung + arquetipo + razonamiento como lectura interpretativa), chat,
  plan, evidence highlights y crisis classifier.
- Diagrama Mermaid actualizado en `docs/tech/ARCHITECTURE.md` (commit
  `177bbf1`).

### 4.4 Capítulo 07 — Implementación

Requiere revisión sustancial. La sección 5 ("Deploy a producción")
afirma textualmente: *"El frontend y las rutas API se alojan en
Vercel"*, sin mencionar componente analítico separado. Esa
descripción sigue siendo correcta para todo lo que NO es Big Five,
pero quedaron afuera dos cosas:

1. La existencia del **directorio `/ml/`** como segundo subsistema
   versionado en el mismo repo, con su propio `requirements.txt`,
   `Makefile`, `Dockerfile`, `render.yaml` y `dvc.yaml`.
2. La **configuración del servicio Python** que en desarrollo corre
   sobre `localhost:8000` y en producción opcional sobre Render
   (plan starter ~7 USD/mes para evitar cold starts; plan free
   apto solo para CI/QA, no para defensa en vivo).

Importante para la defensa: el documento `docs/biz/TFG.md` declara en
la sección 1 ("The product (Umbra web app)") que el sistema "Runs on
Vercel + Supabase. Publicly accessible **OR demo'd to the tribunal
via screen share**". La cláusula del screen share legitima la opción
de presentar el sistema desde un laptop con el módulo ML corriendo en
local, sin necesidad de hosting público del servicio Python para la
defensa de TP4.

### 4.5 Capítulo 09 — Validación

Requiere reescritura sustancial. La estructura actual organiza la
validación alrededor de las hipótesis preregistradas H1/H2/H3. En TP2:

- **H1 y H2 → sección histórica**: reportar los resultados ya
  generados (`eval-results/legacy/H1-*.json` y
  `eval-results/legacy/H2-*.json`), explicar por qué fueron descartadas
  metodológicamente al pivotar, y dejarlas como evidencia del proceso
  experimental que motivó el cambio. **No deben presentarse como
  validación primary del sistema vigente**.
- **Validación del módulo ML (sección nueva, primary)**: reportar
  MSE / R² / r de Pearson por dimensión Big Five sobre el bloque
  `combined` (Essays + rioplatense), con desglose por bloques
  `english_only` y `rioplatense_only`. Métricas committeadas en
  `ml/eval_metrics.json`. Política de honestidad por dimensión bajo
  umbral (ADR-027): cuando R² < 0.20 o r < 0.30, la dimensión se
  reporta como `low_confidence` y queda excluida del componente
  cuantitativo del perfil.
- **H3 (crisis classifier)** → mantiene sin cambios. Resultados en
  `eval-results/crisis-*.json`.
- **M3 (think-aloud n=8-10)** → mantiene como secondary user
  validation. Pendiente de ejecución TP3-TP4.

### 4.6 Capítulo 13 — Trabajo futuro

Considerar agregar:

- Conseguir versión continua del Essays original (Pennebaker y King,
  1999) vía contacto con UT Austin con IRB académico, para destrabar
  el upper bound de R² actual (la versión binaria pública sostiene un
  ceiling estructural en métrica de regresión).
- Fine-tuning supervisado de DistilBERT (descartado por ADR-026 por
  motivos de reproducibilidad y portabilidad; queda como futuro si la
  premisa cambia).
- Integración de un dataset rioplatense más grande (n>>20) para
  reducir la dependencia en Essays inglés y mejorar el bloque
  `rioplatense_only`.

## 5. Reproducibilidad del componente analítico

El módulo ML es íntegramente reproducible desde el repo público, sin
credenciales académicas, en menos de 15 minutos en una máquina con
Python 3.11+:

```bash
git clone https://github.com/mativelezx/umbra.git
cd umbra/ml
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
make all                          # prepare + baseline + train + evaluate
cat eval_metrics.json             # métricas reproducidas
make serve                        # API en localhost:8000
```

El corpus Essays (n=2467, etiquetas binarias) viene committeado bajo
licencia Apache 2.0 desde el mirror público
[`jingjietan/essays-big5`](https://huggingface.co/datasets/jingjietan/essays-big5)
en HuggingFace. El corpus rioplatense propio (n=20, IPIP) viene
committeado en `ml/data/rioplatense/cases.csv` con su rúbrica de
validación en `rubrica_validacion.md`.

## 6. Resumen para el tribunal

Si surge la pregunta directa *"el TFG entregado describe una
arquitectura distinta a la actual, ¿qué pasó?"*, la respuesta corta y
honesta es:

> En la entrega de TP1 (26/04/2026) el sistema usaba Claude API para
> inferir Big Five. Tras esa entrega, los resultados de las hipótesis
> H1 y H2 (preregistradas en OSF) revelaron limitaciones intrínsecas
> de ese diseño: H1 reportó variabilidad inter-corrida no determinística
> en una API LLM, y H2 reportó alta sensibilidad a paráfrasis dentro
> del mismo vendor. Frente a esa evidencia, se ejecutó un pivot
> arquitectural autorizado por la dirección del TFG (Mainero,
> 16/04/2026): la inferencia Big Five se reemplazó por un componente
> ML propio (DistilBERT congelado + Ridge multi-output) versionado
> bajo prácticas MLOps estándar (DVC + MLflow + CI). Las hipótesis
> H1 y H2 quedaron descontinuadas (no porque hayan fallado, sino
> porque la metodología vigente las hace irrelevantes: el regresor
> entrenado es determinístico por construcción y la robustez ya no
> depende de un vendor LLM). La validación primary del sistema
> vigente son las **métricas estándar de regresión** (MSE / R² / r
> de Pearson) **por cada dimensión Big Five**, reportadas honestamente
> por bloque de corpus (`english_only`, `rioplatense_only`,
> `combined`) y con política explícita de exclusión por dimensión
> bajo umbral (ADR-027). El cambio sigue las prácticas recomendadas
> en MLOps (Sculley et al. 2015; Treveil et al. 2020) y no compromete
> el resto del sistema (componente narrativo Claude, chat, crisis
> classifier, dashboard, autenticación, persistencia).

Esta narrativa es defendible académicamente: muestra capacidad de
respuesta empírica del proyecto a evidencia de validación, alineamiento
con prácticas estándar de la disciplina, y honestidad en la
documentación del proceso.

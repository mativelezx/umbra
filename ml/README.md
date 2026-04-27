# Umbra — Módulo ML propio

> Componente analítico independiente del frontend Next.js.
> Infiere las cinco dimensiones del modelo Big Five sobre texto
> introspectivo en español rioplatense (e inglés) usando una
> arquitectura de dos etapas: **DistilBERT base multilingual cased
> congelado** como extractor de embeddings + **cinco regresores Ridge
> multi-output** entrenados con scikit-learn. Servido como API HTTP por
> FastAPI. Versionado de datos con DVC. Tracking de experimentos con
> MLflow.

## Lectura previa obligatoria

- `../docs/DECISIONS.md` — ADR-002 v2 (separación medido vs narrativo),
  ADR-026 (este módulo), ADR-027 (UI bajo umbral), ADR-028 (validación
  primary).
- TP1 entregado del TFG, secciones 6.2.2 (Capa analítica), 6.2.3
  (MLOps), 7.2.3 (Stack ML), 7.3.1 (Datasets), 7.4.1 (Riesgos).

Sin ese contexto, cualquier cambio acá puede romper la coherencia
entre el código y el documento entregado al tribunal.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Texto introspectivo del usuario (es-AR voseo)          │
└────────────────────────┬────────────────────────────────┘
                         ↓
   ┌──────────────────────────────────────────────────┐
   │ Etapa 1 — Embedding (FROZEN)                      │
   │   DistilBERT base multilingual cased              │
   │   Pooling: token CLS                              │
   │   Salida: vector ℝ⁷⁶⁸                             │
   │   Sanh et al. (2019), Howard y Ruder (2018)       │
   └────────────────────────┬─────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────┐
   │ Etapa 2 — Regresor lineal regularizado           │
   │   5 Ridge regressors independientes               │
   │   uno por dimensión Big Five                      │
   │   alpha vía GridSearchCV cv=5                     │
   │   Hoerl y Kennard (1970), Pedregosa et al. (2011) │
   └────────────────────────┬─────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────┐
   │ Salida JSON: {openness, conscientiousness,        │
   │  extraversion, agreeableness, neuroticism,        │
   │  per_dimension_status, model_version}             │
   └──────────────────────────────────────────────────┘
```

## Estructura del módulo

```
ml/
├── README.md                        ← este archivo
├── requirements.txt                 ← deps Python
├── Makefile                         ← targets reproducibles
├── Dockerfile                       ← imagen para deploy
├── render.yaml                      ← deploy ready (Render)
├── dvc.yaml                         ← pipeline DVC
├── .gitignore                       ← venv, mlruns, cache
├── data/
│   ├── essays/                      ← Pennebaker y King (1999)
│   │   └── README.md                ← cómo conseguir el corpus
│   ├── rioplatense/
│   │   ├── cases.csv                ← corpus propio n=50
│   │   └── rubrica_validacion.md    ← criterios de validación
│   └── splits/                      ← train/val/test 80/10/10
├── src/
│   ├── __init__.py
│   ├── prepare_data.py              ← unión + split estratificado
│   ├── baseline_tfidf.py            ← Ridge sobre TF-IDF (baseline)
│   ├── extract_embeddings.py        ← DistilBERT congelado
│   ├── train_ridge.py               ← 5 Ridge + MLflow
│   ├── evaluate.py                  ← MSE + R² + r de Pearson
│   ├── predict.py                   ← inferencia para servir
│   └── api_server.py                ← FastAPI POST /infer
├── models/                          ← artefactos joblib (committeables)
│   └── .gitkeep
├── mlruns/                          ← MLflow local (NO committeado)
├── tests/
│   ├── __init__.py
│   ├── test_baseline_tfidf.py
│   ├── test_extract_embeddings.py
│   ├── test_train_ridge.py
│   └── test_predict.py
├── metrics.json                     ← métricas de entrenamiento (committeable)
└── eval_metrics.json                ← métricas de evaluación (committeable)
```

## Uso rápido

### Setup local

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Pipeline reproducible (recomendado)

```bash
make all          # prepare_data → baseline → train → evaluate
make eval         # solo re-evaluar con el modelo committeado
make serve        # levantar FastAPI en localhost:8000
make test         # pytest
```

### Pipeline DVC (alternativa formal)

```bash
dvc repro         # corre el pipeline completo según dvc.yaml
mlflow ui         # tracking en http://localhost:5000
```

### Inferencia ad-hoc

```bash
curl -X POST http://localhost:8000/infer \
  -H "Content-Type: application/json" \
  -d '{"text": "Soy una persona curiosa que disfruta probar cosas nuevas..."}'
```

Devuelve:

```json
{
  "big_five": {
    "openness": 72.4,
    "conscientiousness": 58.1,
    "extraversion": 65.0,
    "agreeableness": 61.7,
    "neuroticism": 38.2
  },
  "per_dimension_status": {
    "openness": "ok",
    "conscientiousness": "ok",
    "extraversion": "ok",
    "agreeableness": "low_confidence",
    "neuroticism": "ok"
  },
  "model_version": "ridge_v1",
  "elapsed_ms": 487
}
```

## Datasets

### Essays (Pennebaker y King, 1999)
~2500 textos breves de estudiantes universitarios estadounidenses con
puntuaciones Big Five asociadas. Inglés. Acceso académico.
Ver `data/essays/README.md` para instrucciones de descarga (no se
commitea por licencia; se versiona vía DVC con remote local).

### Corpus rioplatense propio (n=50)
50 textos en español argentino (voseo), cada uno targeteando una
dimensión Big Five o función Jung con dirección alta/baja. Origen
histórico: `lib/evals/cases.ts` del proyecto, drafteado con asistencia
LLM en abril 2026 y validado manualmente con la rúbrica documentada en
`data/rioplatense/rubrica_validacion.md`. Migrado a CSV en
`data/rioplatense/cases.csv` con scores Big Five por caso (target
80/20/50 según notas + validación retrospectiva).

### Versionado
Ambos corpus bajo DVC. La unión se particiona en train/val/test 80/10/10
con seed determinístico (`SEED = 42` en `prepare_data.py`).

## Métricas y umbrales

Tres métricas estándar de regresión, **calculadas por dimensión Big Five**:

| Métrica | Símbolo | Mejor cuando |
|---|---|---|
| Error cuadrático medio | MSE | menor |
| Coeficiente de determinación | R² | mayor (≤ 1) |
| Coeficiente de correlación lineal r de Pearson | r | mayor (∈ [−1, 1]) |

> **Nota crítica**: "Pearson" acá es el estadístico **Karl Pearson**, no
> el sistema de arquetipos de **Carol Pearson** (Pearson, 1991) que usa
> la capa narrativa. Cualquier mención debe aclarar esto si hay riesgo
> de ambigüedad.

**Umbral mínimo de aceptación por dimensión**: R² > 0.20 y r > 0.30.
Las dimensiones por debajo se reportan honestamente y quedan
**excluidas del componente cuantitativo del perfil** (ADR-027). El campo
`per_dimension_status` en la respuesta del API marca cada dimensión como
`"ok"` o `"low_confidence"`.

Las métricas se reportan en tres bloques en `eval_metrics.json`:
- `english_only` — solo casos del corpus Essays (test split).
- `rioplatense_only` — solo casos del corpus rioplatense (test split).
- `combined` — sobre la unión.

El bloque `rioplatense_only` es el que sustenta la narrativa del TFG
(idioma de uso real).

## Lo que el módulo NO hace

- **No infiere funciones cognitivas Jung ni arquetipos**. Esas son
  lecturas interpretativas de la capa narrativa basada en Claude (Pass
  1.5 en `lib/prompts/interpret-narrative.ts`). Ver ADR-002 v2 + ADR-007
  amendado.
- **No corre en Vercel**. El bundle Next.js no incluye Python.
- **No hace fine-tuning de DistilBERT**. Frozen embeddings por diseño.
- **No exporta a ONNX ni publica en HuggingFace Hub**. Decisiones
  cerradas en el pivot ML.
- **No depende de Anthropic API**. Cero costo recurrente por inferencia.

## Deploy

### Local (default para desarrollo y defensa académica)
```bash
make serve   # FastAPI en localhost:8000
```
El frontend Next.js (`ML_API_URL=http://localhost:8000` en `.env.local`)
consume el endpoint vía `lib/ml-client.ts`.

### Producción (opcional)
- **Render**: `render.yaml` committeado. Deploy en ~5 min subiendo el
  repo. Plan free tiene cold starts; recomendado plan starter (~7
  USD/mes) si Mainero pide demo en vivo en TP4.
- **Fly.io / Railway**: alternativas equivalentes; configurar `ML_API_URL`
  en Vercel project settings.

## Reproducibilidad para tribunal

```bash
git clone https://github.com/mativelezx/umbra.git
cd umbra/ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
dvc pull           # baja datasets versionados (si remote configurado)
make all           # corre pipeline completo
cat eval_metrics.json   # métricas reproducidas
```

## Referencias

- Sanh, V., Debut, L., Chaumond, J., y Wolf, T. (2019). DistilBERT.
- Howard, J., y Ruder, S. (2018). ULMFiT (frozen embeddings strategy).
- Peters, M. E. et al. (2019). To tune or not to tune?
- Hoerl, A. E., y Kennard, R. W. (1970). Ridge regression.
- Pedregosa, F. et al. (2011). scikit-learn.
- Zaharia, M. et al. (2018). Accelerating the ML lifecycle with MLflow.
- Pennebaker, J. W., y King, L. A. (1999). Essays corpus.
- Goldberg, L. R. (1999). IPIP-NEO.
- Sculley, D. et al. (2015). Hidden technical debt in ML systems.
- Treveil, M. et al. (2020). Introducing MLOps.

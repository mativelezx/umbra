# Umbra — módulo ML del prototipo

El módulo convierte texto en cinco puntuaciones experimentales mediante
DistilBERT multilingüe congelado y cinco regresores Ridge independientes.
FastAPI lo sirve a Next.js. No constituye una medición psicométrica validada
para personas hispanohablantes ni un instrumento clínico.

## Arquitectura conservada

```text
Texto → tokenizer (máximo 512 tokens) → DistilBERT congelado
      → representación CLS de 768 valores → cinco Ridge → JSON
```

DistilBERT no se ajusta: se utiliza en modo evaluación y sin gradientes.
RidgeCV elige alpha mediante validación cruzada sobre entrenamiento.
El bundle existente es `models/ridge_v1.joblib`, versión `ridge_v1`, seed 42.
La narrativa Jung/Positive Computing pertenece a la app y no a este modelo.

El identificador del extractor es `distilbert-base-multilingual-cased`.
Se fijó prospectivamente la revisión oficial
`45c032ab32cc946ad88a166f7cb282f58c753c2e`.
El bundle histórico no registró esa revisión: fijarla ahora no reconstruye
automáticamente su historial de entrenamiento.

## Datos y resultados observados

| Split | Essays inglés | Viñetas sintéticas es-AR | Total |
|---|---:|---:|---:|
| Entrenamiento | 1973 | 16 | 1989 |
| Validación | 246 | 2 | 248 |
| Prueba | 248 | 2 | 250 |
| Total | 2467 | 20 | 2487 |

La copia de Essays incluida tiene etiquetas binarias por dimensión, escaladas
de 0/1 a 0/100. Las 20 viñetas sintéticas tienen una etiqueta heurística
20/50/80 en una sola dimensión; las demás quedan ausentes. No representan
20 participantes ni cuestionarios administrados. Otros 30 casos cualitativos
Jung/adversariales no forman parte de estos splits.

Los splits se separan por origen y seed 42; el código no estratifica por
dimensión target. La auditoría verifica que los identificadores no se solapan.
La procedencia y condiciones de acceso de Essays están en
`data/essays/README.md`; esta verificación técnica no es una nueva revisión
de derechos de redistribución.

En el test inglés ninguna dimensión supera conjuntamente R² > 0,20 y
r > 0,30. Apertura tiene R² ≈ 0,0634, r ≈ 0,2581; en la lectura binaria
exploratoria obtiene AUC ≈ 0,6486 y balanced accuracy ≈ 0,5952. Supera los
cortes operativos de clasificación (AUC ≥ 0,60 y balanced accuracy ≥ 0,55).
Eso describe discriminación entre etiquetas del corpus inglés; no valida
puntuaciones continuas individuales en español.

Las dos viñetas españolas del test aportan una etiqueta de extraversión
y una de neuroticismo, ninguna de apertura. No permiten estimar validez
por dimensión. El runtime devuelve `low_confidence` en las cinco dimensiones:
no promueve un resultado inglés o combinado a confianza española.
Las métricas binarias y de regresión permanecen visibles en `eval_metrics.json`.

R² no tiene un techo bajo impuesto por etiquetas binarias: una predicción
perfecta puede obtener R² = 1 también con dos clases. La limitación aquí es
la evidencia observada, el dominio y el significado de las etiquetas.

## Preparación local

Python 3.11 es la versión usada para verificar esta entrega.

```bash
cd ml
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export HF_HOME="$PWD/.hf_cache"
python -c "from src.predict import Predictor; Predictor().load()"
```

La primera carga descarga pesos públicos del modelo oficial (~542 MB) y
archivos del tokenizer. Las cargas siguientes reutilizan la caché local.
Los pesos y el entorno no se versionan ni se incluyen en el contexto Docker.

Con los pesos ya presentes se puede verificar sin red:

```bash
export HF_HOME="$PWD/.hf_cache"
export HF_HUB_OFFLINE=1
export TRANSFORMERS_OFFLINE=1
make test PYTHON=.venv/bin/python
ML_RUN_MODEL_TESTS=1 make test PYTHON=.venv/bin/python
.venv/bin/python scripts/verify_bundle.py --with-text
```

La prueba de integración del extractor es opt-in para que los tests normales
no disparen descargas. `verify_bundle.py` no entrena: comprueba hashes,
separación de IDs, reproducción de métricas desde la matriz histórica,
contrato FastAPI con inferencia real y dos embeddings recalculados.
La comparación de dos filas no acredita toda la procedencia de las matrices.

`verification-2026-09-07.json` conserva evidencia de esta auditoría:
base Git, hashes de fuentes y artefactos, entorno, métricas, pesos y resultado
de inferencia. Es evidencia de un árbol de trabajo; no reemplaza un tag o
commit final de entrega.

## API local

```bash
HF_HOME="$PWD/.hf_cache" ML_EAGER_LOAD=1 make serve PYTHON=.venv/bin/python
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/infer \
  -H "Content-Type: application/json" \
  -d '{"text":"Me gusta aprender y pensar con calma antes de decidir."}'
```

`ML_API_URL=http://127.0.0.1:8000` permite a `lib/ml-client.ts` consumirlo.
`POST /infer` conserva cuatro campos: `big_five` (cinco números 0–100),
`per_dimension_status`, `model_version` y `elapsed_ms`.
Los números son salidas del prototipo, no percentiles ni probabilidades
calibradas. La app debe comunicar la insuficiencia de evidencia.

`GET /health` separa liveness (`ok`) de pesos cargados (`model_loaded`).
Crear una instancia lazy o consultar `/version` no carga los pesos.
`ML_EAGER_LOAD=1` carga bundle y extractor al iniciar; si falla, el servicio
permanece vivo con `model_loaded=false`. Los pesos cargados no equivalen a
una inferencia exitosa ni a validez científica. `elapsed_ms` mide el encode
y Ridge: en modo lazy incluye la carga del extractor dentro de encode;
con eager-load esa carga ya ocurrió. No incluye la lectura inicial del bundle.

## Pipeline y límites de reproducción

```bash
make prepare PYTHON=.venv/bin/python
make baseline PYTHON=.venv/bin/python
make train PYTHON=.venv/bin/python
make evaluate PYTHON=.venv/bin/python
# Alternativa, con entorno activo:
dvc repro
```

Estos comandos están previstos para nuevas ejecuciones y pueden reemplazar
splits, matrices, bundles y métricas. No hace falta ejecutarlos para demostrar
el bundle entregado. En esta auditoría no se reentrenó.

`dvc.yaml` declara Essays y las dependencias de extracción/evaluación.
No existe `dvc.lock` histórico ni remote DVC configurado en esta copia:
no se afirma una reproducción completa del entrenamiento con `dvc pull/repro`.
El tracking MLflow está instrumentado en el entrenamiento; su presencia no
demuestra por sí sola la trazabilidad del bundle histórico.

La caché de embeddings nueva comprueba textos ordenados, modelo/revisión,
configuración, versiones y hash del extractor, además del hash de la matriz.
Las matrices antiguas sin metadata no se reutilizan automáticamente en nuevas
corridas: se recomputan cuando se ejecute el pipeline. El script de auditoría
sí las lee explícitamente para contrastar los resultados históricos.

`metrics.json` corresponde a Ridge; `metrics_baseline.json` se produce al
ejecutar el baseline. El archivo histórico del baseline puede faltar.
`eval_metrics.json` conserva los tres bloques de evaluación.

## Despliegue

`fly.toml`, `render.yaml` y `Dockerfile` son configuraciones presentes.
No se publicaron ni se verificaron despliegues en esta auditoría.
Docker precarga la misma revisión fijada por el extractor. La inferencia
local verificada no acredita un despliegue remoto ni el flujo completo
Next.js/Supabase/Anthropic.

## Lecturas del proyecto

- `../docs/DECISIONS.md`: ADR-002, ADR-026, ADR-027 y ADR-028, a contrastar
  con esta evidencia actual.
- `DATASET_EXPANSION.md`: trabajo futuro; no es requisito implementado.
- `data/latinoamericano/rubrica_validacion.md`: origen y reglas de las
  viñetas; revisión cualitativa distinta de validación psicométrica.

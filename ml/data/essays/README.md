# Corpus Essays — Pennebaker y King (1999)

Este directorio aloja el dataset Essays cuando está disponible
localmente. **No se commitea por consideraciones de licencia académica**:
el corpus original requiere registro para descarga y su redistribución
no es libre.

## Cómo obtenerlo

1. Buscar "stream-of-consciousness essays Pennebaker King 1999" o el
   recurso académico equivalente que cita el TFG.
2. Descargar el archivo CSV (~2500 textos, columnas:
   `text, ext, neu, agr, con, opn`).
3. Renombrar a `essays.csv` y colocar en este directorio.
4. Correr `make prepare` desde `ml/` para generar los splits.

## Estructura esperada

`essays.csv` con columnas:

| Columna | Tipo | Significado |
|---|---|---|
| text | string | texto introspectivo en inglés |
| ext | float (0-1 o z-score) | extraversion |
| neu | float | neuroticism |
| agr | float | agreeableness |
| con | float | conscientiousness |
| opn | float | openness |

`prepare_data.py` normaliza los scores a la escala 0-100 si vienen en
otra escala.

## Versionado DVC

Una vez disponible, ejecutar:

```bash
cd ml
dvc add data/essays/essays.csv
git add data/essays/essays.csv.dvc
```

Esto agrega el archivo al tracking DVC sin meterlo al repo git;
solo el `.dvc` queda committeado. Reproducción con `dvc pull` cuando
hay remote configurado.

## Si Essays no está disponible

`prepare_data.py` y `train_ridge.py` están escritos para tolerar la
ausencia del corpus Essays: si solo está disponible el corpus
rioplatense (`data/rioplatense/cases.csv`, n=20 IPIP), entrenan sobre
este corpus reducido. **Las métricas reportadas en ese caso reflejan la
limitación del dataset disponible**: con solo 20 muestras desbalanceadas
por dimensión, los R² y r esperables son bajos. Esa situación se reporta
honestamente en `eval_metrics.json` y se documenta como limitación en el
TFG (sección 7.4.1 Riesgos: "calidad heterogénea de los datasets").

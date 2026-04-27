# Corpus Essays — Pennebaker y King (1999)

Este directorio aloja el dataset Essays.

## Versión committeada

Se distribuye `essays.csv` (n=2467, etiquetas binarias 0/1 por
dimensión Big Five) tomado del mirror público
[`jingjietan/essays-big5`](https://huggingface.co/datasets/jingjietan/essays-big5)
en HuggingFace (licencia **Apache 2.0**, redistribución libre).

El corpus original con scores **continuos** de Pennebaker y King (1999)
permanece bajo licencia académica restringida y no se redistribuye.
La versión binaria es el formato estándar usado por la mayoría de la
literatura desde Mairesse et al. (2007). prepare_data.py la escala a
0/100.

Procedencia exacta para reproducibilidad: descarga los tres parquet
splits del mirror, los concatena, mapea columnas
`O,C,E,A,N → opn,con,ext,agr,neu`, coerce a int 0/1, y escribe el CSV
con columnas `text, ext, neu, agr, con, opn`.

## Cómo regenerar (si se borra)

```bash
cd ml/data/essays
curl -sSLfo /tmp/train.parquet      https://huggingface.co/datasets/jingjietan/essays-big5/resolve/main/data/train-00000-of-00001.parquet
curl -sSLfo /tmp/validation.parquet https://huggingface.co/datasets/jingjietan/essays-big5/resolve/main/data/validation-00000-of-00001.parquet
curl -sSLfo /tmp/test.parquet       https://huggingface.co/datasets/jingjietan/essays-big5/resolve/main/data/test-00000-of-00001.parquet
python -c "
import pandas as pd
df = pd.concat([pd.read_parquet(f'/tmp/{s}.parquet') for s in ('train','validation','test')], ignore_index=True)
df = df.rename(columns={'O':'opn','C':'con','E':'ext','A':'agr','N':'neu'})[['text','ext','neu','agr','con','opn']]
for c in ('ext','neu','agr','con','opn'):
    df[c] = df[c].map(lambda v: 1 if str(v).strip().lower() in ('y','1','true','yes') else 0)
df.to_csv('essays.csv', index=False)
"
rm /tmp/{train,validation,test}.parquet
```

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
latinoamericano (`data/latinoamericano/cases.csv`, n=20 IPIP), entrenan sobre
este corpus reducido. **Las métricas reportadas en ese caso reflejan la
limitación del dataset disponible**: con solo 20 muestras desbalanceadas
por dimensión, los R² y r esperables son bajos. Esa situación se reporta
honestamente en `eval_metrics.json` y se documenta como limitación en el
TFG (sección 7.4.1 Riesgos: "calidad heterogénea de los datasets").

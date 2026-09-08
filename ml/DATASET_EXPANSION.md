# Umbra ML — dataset expansion plan

Objetivo: aumentar evidencia para el estimador Big Five sin mezclar
fuentes incompatibles ni prometer validez psicometrica que el prototipo
no puede sostener todavia.

## Regla de oro

Cada corpus debe clasificarse por:

- **origen**: introspective essay, social media, questionnaire-only,
  synthetic, apparent personality.
- **idioma**: `en`, `es`, `es-AR`, otro.
- **tipo de etiqueta**: continua, binaria alta/baja, Likert, aparente
  por observadores, sintetica.
- **licencia/acceso**: redistribuible, acceso academico, restringido,
  no usar.

No se mezclan etiquetas continuas y binarias en la misma afirmacion
metodologica. Si la etiqueta es binaria, se reportan AUC, F1 y balanced
accuracy. Si es continua, se reportan MSE, R2 y Pearson r.

## Tier A — usar como evidencia principal

### Stream of Consciousness Essays / Essays Big5

- Estado repo: integrado en `data/essays/essays.csv` con `n=2467`.
- Tipo: textos introspectivos en ingles.
- Etiqueta disponible en el mirror abierto: binaria 0/1 por rasgo,
  normalizada a 0/100 por `prepare_data.py`.
- Uso correcto: evaluar discriminación de etiquetas altas/bajas; el score
  Ridge no es una probabilidad calibrada.
- Riesgo: no defender como score continuo fino salvo que se consiga la
  version academica con scores continuos originales.

### Corpus propio es-AR

- Estado repo: `data/latinoamericano/cases.csv`, 20 viñetas sintéticas.
- Tipo: textos Umbra-like en espanol argentino con etiquetas heurísticas.
- Uso correcto actual: inspección cualitativa y prueba técnica del pipeline;
  no acredita transferencia ni validez individual española.
- Meta minima: 300 casos.
- Meta ideal: 500-1000 casos.
- Captura recomendada:
  - consentimiento versionado;
  - texto introspectivo de 250-800 palabras;
  - IPIP/BFI breve;
  - export/delete bajo Ley 25.326;
  - particion train/val/test por usuario, nunca por fragmento.

## Tier B — usar como robustez / transferencia

### PAN 2015 Author Profiling

- Tipo: textos de redes con rasgos Big Five.
- Idiomas reportados por el task: ingles y espanol.
- Etiquetas: scores por rasgo en escala aproximada `[-0.5, 0.5]`.
- Uso correcto: validacion de transferencia entre genero textual e idioma.
- Riesgo: no es introspeccion guiada; no reemplaza corpus Umbra-like.
- Accion: agregar loader separado `load_pan2015()` cuando el dataset este
  descargado localmente por el tesista con licencia/permiso verificado.

## Tier C — solo exploratorio

### Datasets sinteticos Big Five

- Uso permitido: tests de pipeline, balanceo experimental, prototipos.
- No usar como evidencia principal de validez.
- Siempre marcar `origin=synthetic` y excluir de metricas primarias.

### Questionnaire-only datasets

- Uso permitido: referencias poblacionales o calibracion psicometrica,
  pero no entrenan texto -> personalidad si no tienen texto libre.

## No usar

- myPersonality u otros dumps de Facebook con origen eticamente dudoso.
- Datasets sin licencia clara.
- Resultados scrapeados de tests individuales publicados en redes.
- Apparent personality de video como si fuera introspeccion textual.

## Criterio de defensa

Umbra debe decir:

> El prototipo estima senales textuales asociadas a Big Five con un
> status de confianza por dimension. Las dimensiones que no superan
> umbrales quedan excluidas del componente cuantitativo y se tratan solo
> como material narrativo/heuristico.

Nunca debe decir:

> Umbra diagnostica personalidad o reemplaza una evaluacion psicometrica
> administrada por profesionales.

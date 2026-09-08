# Rúbrica de validación del corpus latinoamericano propio

> Documento normativo. Aplicado a cada uno de los 50 casos del corpus
> antes de marcarlos como aptos para entrenamiento o como casos
> cualitativos de inspección. Anclado por ADR-026 + TFG TP1 sección 7.3.1.

## Origen del corpus

Los 50 casos viven históricamente en `lib/evals/cases.ts` del repositorio
Umbra, drafteados en abril de 2026 con asistencia de un proveedor externo
de inteligencia artificial generativa siguiendo un prompt que especificó:

- Targets por dimensión Big Five (5) o función cognitiva Jung (8) con
  dirección alta/baja.
- Restricciones éticas (sin lenguaje diagnóstico, sin contenido clínico).
- Voz introspectiva en voseo argentino (latinoamericano).
- Distribución balanceada: 20 casos IPIP (Big Five), 20 casos Jung
  (funciones), 10 casos adversariales (edge cases).

Los casos `ipip-01` a `ipip-17` fueron completados manualmente por el
autor para cubrir las cinco dimensiones Big Five con direcciones altas y
bajas balanceadas.

## Criterios de validación (5 criterios)

Cada caso se evalúa contra los siguientes cinco criterios.

### Criterio 1 — Voseo argentino consistente
El texto usa voseo (vos / tenés / sos / podés / mirá) o tercera persona
introspectiva sin tutearse al lector. Se aceptan inconsistencias menores
solo en los casos `adversarial` que prueban explícitamente mezcla
voseo/tuteo (`adv-05`, `adv-10`).

### Criterio 2 — Vocabulario latinoamericano
El texto incluye al menos tres marcadores léxicos o sintácticos
latinoamericanos entre: vocabulario local ("laburo", "pibe", "boludo",
"garpar", "che", "viste", "re-"), construcciones típicas ("medio que",
"capaz que", "bastante + adjetivo"), y registro coloquial argentino sin
ser jerga inaccesible. Aceptable también el registro neutro
sudamericano si la introspección suena natural a un hablante latinoamericano.

### Criterio 3 — Reflejo de la dimensión target
Para casos IPIP: el texto refleja con claridad la dimensión Big Five
target en la dirección target. Para casos Jung: el texto refleja la
función cognitiva target. Para casos adversariales: el texto exhibe el
edge case declarado en `notes` (contradicción, ambivalencia, brevedad,
multiestado, etc.).

### Criterio 4 — Longitud y densidad introspectiva
Texto entre 100 y 600 palabras (excepción: casos adversariales muy
breves como `adv-03` que prueban brevedad extrema, mantienen al menos
una oración introspectiva). El texto no es meta (no menciona el sistema
Umbra, no es un test, no es genérico): se lee como introspección
espontánea de un sujeto adulto.

### Criterio 5 — No diagnóstico, no clínico
El texto no contiene lenguaje diagnóstico (DSM, "sufre de", "presenta
síntomas"), no menciona medicación, terapia activa, ideación suicida ni
contenido clínico que requiera derivación a recursos. La capa de
detección de crisis del producto opera sobre input de usuario en
runtime; el corpus de entrenamiento queda explícitamente fuera de ese
dominio para evitar acoplamiento entre los dos sistemas.

## Política de uso para entrenamiento

| Subset | Cantidad | Uso |
|---|---|---|
| IPIP (`ipip-01` a `ipip-20`) | 20 | **Entrenamiento + validación + test del regresor Ridge**. Cada caso aporta un score Big Five etiquetado por su `target` (alto = 80, bajo = 20) en la dimensión target; las otras cuatro dimensiones quedan NaN y no contribuyen al loss del regresor de esa dimensión. |
| Jung (`jung-01` a `jung-20`) | 20 | **No se usan para entrenar Big Five**. Se preservan como casos de inspección cualitativa para verificar cómo el regresor responde a textos targeteados sobre funciones cognitivas (que son lectura narrativa, no medición — ver ADR-002 v2). |
| Adversariales (`adv-01` a `adv-10`) | 10 | **No se usan para entrenar**. Se preservan como casos de inspección cualitativa para revisar el comportamiento del regresor ante ambivalencia, contradicción y brevedad extrema. |

Los archivos generados:

- `cases.csv` — 20 casos IPIP con scores Big Five etiquetados (training).
- `cases_qualitative.csv` — 30 casos Jung + adversariales (inspección).

## Política de scoring para casos IPIP

El scoring sigue una regla mínima honesta documentada en este apartado y
auditada en `src/prepare_data.py`:

- Si `notes` contiene "alto" / "alta" para la dimensión target → score = **80**.
- Si `notes` contiene "bajo" / "baja" para la dimensión target → score = **20**.
- Si `notes` contiene "media" → score = **50**.
- Las cuatro dimensiones no-target → **NaN** (no aportan loss; se enmascaran).

Se documenta como limitación honesta en el TFG (sección 7.4.1
Riesgos): el corpus latinoamericano propio etiqueta una dimensión por caso
con score discreto {20, 50, 80}, no con scores continuos por dimensión.
Esto reduce la capacidad del regresor para aprender matices finos sobre
dominio latinoamericano. El dataset combinado también incluye 2467 textos
Essays en inglés con etiquetas binarias por dimensión (0/1 escaladas a
0/100 en la copia integrada). Esa incorporación no compensa ni demuestra
validez individual en español.

## Política de aceptación

Un caso pasa la rúbrica si cumple **al menos 4 de los 5 criterios**.
Los 50 casos del corpus inicial fueron revisados por el autor el
2026-04-27 contra esta rúbrica; todos pasaron 4 o 5 criterios. El log
de validación queda en este archivo (Sección "Bitácora" abajo).

## Bitácora de validación

| Fecha | Revisor | Casos revisados | Casos rechazados | Notas |
|---|---|---|---|---|
| 2026-04-14 | Mati | 50 (drafteado completo) | 0 | Drafteo inicial con asistencia LLM. |
| 2026-04-27 | Mati | 50 (validación rúbrica) | 0 | Todos los casos pasan ≥4 criterios. Migrados a CSV en este refactor. |

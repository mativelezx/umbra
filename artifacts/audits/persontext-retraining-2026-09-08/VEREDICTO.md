# Veredicto del reentrenamiento de Umbra

8 de septiembre de 2026. Entrenamiento y evaluación reales, locales. **El experimento está terminado; no es una certificación de la entrega completa.**

## Resultado en criollo

**El modelo nuevo mejora al anterior, pero todavía no demuestra una estimación personalizada suficientemente precisa. No recomiendo reemplazar el modelo publicado ni quitar «evidencia insuficiente».**

Pensalo como un profesor que intenta adivinar la nota de cada alumno: ahora se equivoca menos que antes, pero sigue sin ganarle a alguien que les pone a todos la nota promedio. Eso no significa que el programa esté roto. Significa que, con estos datos y este método, no aprendió lo suficiente para distinguir bien a cada persona.

El aprendizaje automático propio existe y se entrenó realmente. No es una llamada a Claude disfrazada. Lo que no quedó demostrado es que sus cinco números describan con suficiente precisión al usuario.

## Qué se hizo

1. Se conservó el lector de textos aprobado: **DistilBERT multilingüe congelado**. Transforma cada texto en 768 valores; sus pesos no cambian.
2. Se entrenaron desde cero **cinco regresores Ridge**, uno por rasgo. Son modelos estadísticos pequeños que aprenden a relacionar esos valores con los resultados del cuestionario de sus autores. No se reutilizaron los coeficientes anteriores.
3. Se usaron **80 adultos de PersonText v1**, con 210 textos humanos originalmente españoles. No se agregaron personas inventadas ni traducciones automáticas al entrenamiento.
4. Se reservaron **30 adultos nuevos de v2** para el examen final. Sus datos no se usaron para ajustar el modelo. Una respuesta de 15 palabras estaba repetida dos veces por la misma persona: se conservó una ocurrencia, dejando 89 textos únicos. La corrección quedó registrada antes de entrenar; no se eliminó ninguna persona del examen.
5. Se entrenó también una alternativa más simple, **TF-IDF + Ridge**: usa frecuencias de palabras y combinaciones de dos palabras, en lugar de DistilBERT. Tampoco resolvió el problema.
6. Se compararon los modelos con el modelo histórico y con una referencia constante: el promedio de los 80 adultos de entrenamiento, calculado sin mirar las respuestas del examen.
7. Se guardaron las corridas en **MLflow local**, las versiones de datos en **DVC local** y las huellas SHA-256 de entradas, código y modelos. No se enviaron datos a servicios generativos ni se consumió crédito de API.

La fuente es [PersonText, publicado por sus autores](https://catalabs.mx/datasets/persontext/). Sus 306 registros de v2 **no son 306 participantes**: hay 111 UID en total, 110 adultos entre desarrollo y examen. Tampoco son 110 participantes exclusivos del examen.

## Los números del examen final

Error absoluto medio, en puntos de la escala del corpus reexpresada de 0 a 100. **Menos es mejor.** Cada persona cuenta una vez, n=30.

| Rasgo | Modelo anterior | Nuevo DistilBERT + Ridge | Nuevo TF-IDF + Ridge | Dar el promedio a todos |
|---|---:|---:|---:|---:|
| Apertura | 22,32 | 15,87 | 14,72 | 13,40 |
| Responsabilidad | 23,02 | 12,22 | 12,13 | 12,13 |
| Extraversión | 24,90 | 20,78 | 20,69 | 20,73 |
| Amabilidad | 27,41 | 15,60 | 15,58 | 15,55 |
| Neuroticismo* | 28,28 | 21,88 | 19,50 | 19,50 |

Ejemplo de la unidad: si el autoinforme da 60 y el modelo estima 75, hay 15 puntos de error. **15 puntos de error no significan 85% de exactitud.** Los valores IPIP del corpus se multiplicaron por 100 para conservar el formato de salida; no son porcentajes de personalidad, percentiles ni resultados intercambiables con BFI-2-S.

*La orientación de N sigue provisional por una discrepancia entre el ejemplo del artículo y el CSV. No se invirtió la escala buscando mejorar el resultado ni se presenta esa dimensión como validada.*

El nuevo DistilBERT + Ridge tiene un error medio menor que el histórico en los cinco rasgos, pero **mayor que la referencia constante en los cinco**. La mejoría contra el modelo histórico por sí sola no demuestra valor predictivo: ese modelo no estaba calibrado para estos autoinformes.

### ¿Se cumplen los criterios que ya tenía Umbra?

Se mantuvieron n≥30, R²>0,20 y Pearson>0,30 simultáneamente por rasgo.

| Rasgo | R² nuevo | Pearson nuevo | ¿Alcanza los tres criterios? |
|---|---:|---:|---|
| Apertura | −0,742 | 0,373 | No |
| Responsabilidad | −0,031 | −0,289 | No |
| Extraversión | −0,044 | −0,259 | No |
| Amabilidad | −0,003 | 0,048 | No |
| Neuroticismo* | −0,448 | −0,157 | No |

**R²** compara el error cuadrático con una referencia que usa la media del grupo evaluado. Un valor negativo no es un porcentaje de precisión negativo: indica que el modelo fue peor que esa referencia. **Pearson** muestra si los valores estimados suben cuando suben los autoinformes; no alcanza con que eso suceda si los números quedan lejos de los valores de referencia.

En apertura apareció una señal de ordenamiento —Spearman 0,388 y AUC 0,795—, pero el error continuo fue peor que dar el promedio. No corresponde elegir esas métricas favorables y declarar resuelto un objetivo de estimar puntajes. AUC 0,795 tampoco equivale a 79,5% de exactitud.

Los puntajes nuevos de responsabilidad quedaron entre 67,50 y 69,88; los de extraversión, entre 56,08 y 58,66. Esa poca variación entre personas ayuda a explicar por qué el sistema todavía no muestra una personalización predictiva útil.

### Incertidumbre de las comparaciones

Se hicieron 2.000 remuestreos de las mismas 30 personas para estimar intervalos, no para fabricar más participantes. Diferencia de error = nuevo DistilBERT menos referencia; **negativo favorece al nuevo**.

| Rasgo | Contra el histórico: diferencia [IC 95%] | Contra el promedio: diferencia [IC 95%] |
|---|---|---|
| Apertura | −6,45 [−11,26; −1,65] | +2,46 [+0,05; +4,73] |
| Responsabilidad | −10,80 [−15,91; −5,26] | +0,08 [−0,19; +0,36] |
| Extraversión | −4,12 [−11,07; +3,65] | +0,04 [−0,19; +0,29] |
| Amabilidad | −11,81 [−19,28; −4,28] | +0,05 [−0,39; +0,50] |
| Neuroticismo* | −6,41 [−11,89; −1,25] | +2,38 [+0,11; +4,72] |

Son intervalos exploratorios, con muestra pequeña y sin ajuste por múltiples comparaciones. No prueban equivalencia cuando incluyen cero. No se evaluó eficacia de consejos, bienestar ni resultados clínicos.

## Qué aporta a la tesis y qué no cierra

**Sí aporta evidencia académica concreta:** entrenamiento propio real, textos humanos en español, evaluación por personas que no participaron del ajuste, comparación con un método simple, limpieza auditable y resultados reproducibles. Se mantiene la arquitectura DistilBERT + Ridge y MLOps reconocida en las devoluciones archivadas del cursado. No se agregó una arquitectura más compleja para perseguir mejores números.

**No demuestra que el objetivo de inferir automáticamente los cinco rasgos con suficiente precisión esté cumplido.** La devolución de TP1 incluye ese objetivo. La de TP4 pide ampliar la muestra hacia n>300 con un volumen sustancial de textos humanos; este experimento no acredita 300 personas ni 300 casos independientes de validación. El texto completo de esas devoluciones, junto con el dictamen del CAE, sigue teniendo que interpretarse como requisito académico, no reemplazarse por una promesa del asistente.

Por eso mi evaluación es: **compartible como experimento reproducible con resultado limitado; no aprobado para presentar sus estimaciones individuales como validadas.** No puedo afirmar que el CAE aceptará esa limitación ni declarar la tesis 100% lista a partir de esta corrida. Una nota previa del cursado tampoco equivale a aprobación del CAE.

El resultado numérico personal obtenido de un cuestionario es otra vía: depende de las respuestas del usuario y de las reglas de puntuación del instrumento, no de que este predictor textual acierte. Puede seguir siendo la base del producto, pero **no conviene presentarlo como si resolviera por sí solo el requisito de ML ni cambiar silenciosamente el objetivo aprobado**. Las lecturas de Jung y los consejos narrativos tampoco quedan validados por este experimento.

### Recomendación para la entrega

- Incorporar este experimento y su limitación al documento, sin afirmar éxito predictivo donde no lo hubo. En esta tarea **no se modificó ni se volvió a exportar el TFG**.
- Mantener el ML propio como componente experimental y el control de evidencia; no publicar estos pesos ni activar nuevos puntajes como confiables.
- Si la condición académica es demostrar inferencia automática útil en los cinco rasgos, **hay un pendiente sustantivo**. Repetir el mismo examen, bajar umbrales o generar personas sintéticas no lo resuelve. Harían falta nuevos datos adecuados, un diseño revisado y una nueva evaluación independiente; no se garantiza obtenerlo hoy.

## Verificación y archivos

- 15 pruebas automatizadas del protocolo y de los modelos: aprobadas. Incluyen controles que fallaron antes de implementar la lógica correspondiente.
- Recalculados por otra vía **110 valores de métricas y 15 intervalos pareados**, diferencia máxima 0.
- Modelos guardados y recargados: predicciones reproducidas. Coincidencia del candidato con el `Predictor` existente: diferencia 0 en la comprobación del primer caso.
- Vocabulario TF-IDF sin palabras exclusivas del examen. Modelos nuevos con coeficientes distintos de los históricos.
- Corridas MLflow de entrenamiento y examen finalizadas. DVC sin cambios pendientes en los CSV del experimento. Datos y archivos históricos sin modificaciones según hashes.
- No hubo cambios en GitHub, Vercel, Supabase, UI, umbrales productivos ni documento final. Las verificaciones de esta tarea **no son un E2E completo de la app**.

Material legible y técnico:

- [Protocolo fijado antes del experimento](PROTOCOLO.md) y [adenda de calidad previa al entrenamiento](ADENDA-CALIDAD.md).
- [Resultados completos del examen](results.json), [validación cruzada de desarrollo](development-results.json), [manifiesto de entrenamiento](training-manifest.json), [comprobación independiente](verification.json).
- [Notebook de lectura y comprobación](revision.ipynb) y [comandos para repetir](COMO_REPETIR.md).

Se conservó una copia privada fuera de Git en `/Users/matiasvelez/Documents/Umbra-Reentrega-2026-09-08/experimento-ml-persontext-privado`. Contiene datos personales seudonimizados y modelos de uso académico local: **no subir esa carpeta al repositorio ni adjuntarla públicamente**. El artículo de referencia es [DOI 10.13053/CyS-28-3-4619](https://doi.org/10.13053/CyS-28-3-4619); no se identificó una licencia general del CSV que habilite su redistribución o uso comercial.

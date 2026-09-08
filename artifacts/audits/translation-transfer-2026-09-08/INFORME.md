# Prueba de transferencia de inglés a español

8 de septiembre de 2026. Resultado de un experimento local, no modificación de la tesis ni habilitación del predictor en producción.

## Resultado en pocas palabras

Se tradujeron y evaluaron los 248 ensayos ingleses de la partición de prueba. El modelo conservó una señal modesta para Apertura en las traducciones. En las otras cuatro dimensiones, los intervalos exploratorios de AUC incluyen 0,50. Traducir permitió medir una limitación que antes no estaba cuantificada, pero no convirtió el predictor en una medición individual validada en español.

No se incorporaron personas nuevas, no se entrenó un modelo y no se cambiaron los umbrales. Son 248 pares inglés/español, no 496 participantes independientes. El conjunto ya había sido observado: esta no es una nueva prueba ciega.

## Qué se hizo

1. Se fijó el protocolo antes de calcular los resultados de esta traducción.
2. Se comprobaron IDs, textos normalizados y separación de entrenamiento, validación y prueba. No se hallaron coincidencias exactas cruzadas; esto no certifica la identidad original de cada participante.
3. Se tradujeron los textos completos mediante Helsinki-NLP/opus-mt-en-es, localmente y sin enviar etiquetas al traductor. Sus 709 segmentos se reconstruyeron por ID y posición.
4. Se ejecutó el mismo extractor DistilBERT multilingüe congelado y los mismos cinco modelos Ridge sobre cada original y su traducción. Se conservó el redondeo y límite 0–100 del predictor.
5. Se calcularon métricas binarias, una referencia constante y 2000 remuestreos pareados por ensayo. Se publican las cinco dimensiones, no sólo la mejor.

La ejecución utilizó la copia aislada del código `257e32fad91f740a896cce353075c4e5e4673f57`. La revisión del extractor se fijó para el runtime actual; no demuestra qué revisión utilizó el entrenamiento histórico.

## Resultados

AUC mide la capacidad de ordenar las dos clases del corpus: 0,50 es la referencia sin discriminación y 1 sería discriminación perfecta. No es un porcentaje de aciertos ni una puntuación de personalidad. Las etiquetas originales son binarias, no promedios continuos del BFI-2-S.

| Dimensión | AUC original inglés | AUC traducido | IC exploratorio 95% del AUC traducido | Exactitud balanceada traducida, corte 50 |
|---|---:|---:|---:|---:|
| Apertura | 0,649 | 0,627 | 0,558–0,697 | 0,604 |
| Responsabilidad | 0,558 | 0,537 | 0,463–0,608 | 0,516 |
| Extraversión | 0,591 | 0,564 | 0,493–0,634 | 0,529 |
| Amabilidad | 0,497 | 0,508 | 0,437–0,580 | 0,492 |
| Neuroticismo | 0,556 | 0,540 | 0,467–0,613 | 0,514 |

Los cinco intervalos de la diferencia de AUC entre traducción y original incluyen cero. Este experimento no demuestra una mejora ni una degradación estadísticamente clara por traducción; tampoco demuestra equivalencia entre idiomas. Los intervalos son percentiles de bootstrap, exploratorios y sin ajuste por las cinco dimensiones.

| Dimensión | RMSE original | RMSE traducido | RMSE de referencia constante |
|---|---:|---:|---:|
| Apertura | 0,4826 | 0,4896 | 0,4992 |
| Responsabilidad | 0,4990 | 0,4977 | 0,5009 |
| Extraversión | 0,4945 | 0,5025 | 0,5006 |
| Amabilidad | 0,5016 | 0,5018 | 0,5009 |
| Neuroticismo | 0,4999 | 0,5024 | 0,5001 |

El RMSE se calcula en la escala binaria 0–1; menor es mejor. La referencia devuelve siempre la media disponible de entrenamiento. En las traducciones, sólo Apertura y Responsabilidad tienen menor error observado que esa referencia. No se hizo una prueba inferencial de esas diferencias de RMSE. F1 y cambios pareados completos se conservan en `results.json`.

## Calidad y límites de la traducción

- Se completaron 248/248 traducciones, sin vacíos. El procesamiento tomó 1244 segundos para la traducción local.
- Seis de 709 segmentos, pertenecientes a cinco ensayos, alcanzaron el máximo de generación. Una inspección lingüística puntual por el asistente, antes de revisar métricas, encontró repetición de palabras en uno de los segmentos largos. No fue una revisión humana ni una evaluación completa de fidelidad.
- No se excluyeron esos cinco ensayos ni se retocaron sus traducciones para mejorar las métricas. Los resultados incluyen todos los pares. Sigue pendiente una comparación de sensibilidad con traducciones revisadas.
- Umbra conserva su límite de 512 tokens: truncó 214 originales ingleses y 158 textos traducidos. La comparación mezcla el cambio de idioma con diferencias en la porción del texto efectivamente leída. No aísla un efecto puro del idioma.
- La traducción conserva etiquetas inglesas históricas; no reúne nuevos autoinformes ni representa escritura espontánea argentina.
- Los textos y sus traducciones permanecen privados fuera del repositorio. La licencia del mirror del corpus no se pudo reconfirmar; no se agrega ninguna redistribución de esos datos.

## Qué aporta y qué no resuelve

Para la tesis, aporta una evaluación técnica adicional y reproducible del modelo congelado, con comparación pareada y límites documentados. Se puede describir como «sensibilidad a traducción automática inglés–español», no como validación con 248 usuarios hispanohablantes. Su aceptación académica corresponde al CAE; este reporte no la garantiza.

Para el producto, no justifica retirar el aviso de evidencia insuficiente ni presentar el 0–100 del ML como medición personal. El BFI-2-S español ya implementado es una fuente distinta: calcula cinco promedios de 1 a 5 con las treinta respuestas de la persona. Puede sostener una devolución orientativa identificada como autoinforme, sin atribuirla al ML ni prometer efectos sobre el bienestar.

Al cerrar este experimento se propuso dar prioridad al cuestionario, conservar escritura y actividades contextualizadas y mostrar el ML en una sección experimental. No se implementó ese cambio dentro de la ejecución experimental. **Seguimiento del 8 de septiembre:** Matías aprobó posteriormente esa dirección; la implementación y sus verificaciones se registran por separado en [CIERRE.md](../bfi-primary-2026-09-08/CIERRE.md). La aprobación no modifica las métricas ni convierte esta prueba en validación individual.

Para mejorar el predictor por aprendizaje, traducir datos de entrenamiento sería otro experimento: conservar cada original y sus derivados en la misma partición, ajustar sólo con entrenamiento/validación y evaluar fuera del ajuste. El conjunto examinado aquí ya es conocido; no debe reutilizarse como supuesta nueva prueba ciega. La generalización a personas que escriben originalmente en español necesita datos apropiados y permiso de uso. Ninguna cantidad de respuestas inventadas reemplaza esa comprobación.

## Evidencia y reproducción

- `PROTOCOLO.md`: decisiones fijadas antes del cálculo.
- `manifest.json`: revisiones, configuración y hashes iniciales.
- `translation-summary.json`: ejecución de la traducción.
- `results.json`: resultados completos. SHA-256 de la copia archivada: `03f36f1dbe7e8760fa991a135dcd05f3d8916eccd462d82907bc76b27cb48a48`. El original de ejecución tiene SHA-256 `69cec8d31dda4af116e93d286f61b3dd4d5f8d5d5e618d2331d410e00a3be29e`; la única diferencia es el salto de línea final añadido al archivarlo. Se verificó igualdad del contenido.
- `transfer.py`, `test_transfer.py`, `run_transfer.py`: copia exacta de los programas ejecutados. Los diez tests de integridad pasaron en la comprobación final; son tests del procedimiento, no validación del modelo.

Los scripts conservan las rutas absolutas del experimento ejecutado en `/private/tmp/umbra-translation-study/`; son evidencia local, no un comando portable listo para cualquier máquina. El orquestador abre las salidas con modo exclusivo para no pisar una ejecución previa. Para repetir en otra carpeta deben configurarse explícitamente sus rutas y mantenerse las versiones y hashes registrados. No deben eliminarse resultados anteriores para simular una ejecución limpia.

Se comprobó que no cambiaron los pesos Ridge, el baseline, las métricas históricas ni los tres archivos de particiones. También conservaron su hash el protocolo, los guardas y el orquestador entre el inicio y el cierre. No se llamó a Claude, no se modificó Supabase y no hubo despliegue de la app.

## Fuentes

- Helsinki-NLP. [opus-mt-en-es](https://huggingface.co/Helsinki-NLP/opus-mt-en-es), revisión `5bc4493d463cf000c1f0b50f8d56886a392ed4ab`. El modelo de traducción declara licencia Apache 2.0; eso no concede derechos sobre el corpus traducido.
- Artetxe, M., Labaka, G., y Agirre, E. (2020). [Translation Artifacts in Cross-lingual Transfer Learning](https://aclanthology.org/2020.emnlp-main.618/). Fundamenta la necesidad de considerar artefactos de traducción al evaluar transferencia entre idiomas; no valida el predictor de Umbra.
- Soto, C. J., y John, O. P. [BFI-2-S, formulario español publicado por los autores](https://www.colby.edu/wp-content/uploads/2022/07/bfi2s-form-spanish.pdf). Es el instrumento separado que ya usa la app; no se retradujo en este experimento.

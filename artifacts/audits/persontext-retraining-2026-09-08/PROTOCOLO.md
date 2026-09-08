# Reentrenamiento de Umbra con español original

8 de septiembre de 2026. Autorizado por el usuario: reentrenar desde cero y dar un veredicto. Trabajo local de ML/datos y evidencia académica; no es autorización para cambiar producción ni certificar la tesis.

## Decisión anterior a entrenar y evaluar

Se conserva la arquitectura aprobada: DistilBERT multilingüe congelado y cinco regresores Ridge propios. Se crean cinco regresores nuevos, sin reutilizar coeficientes anteriores. No se entrena desde cero el modelo de lenguaje ni se cambian sus 768 características CLS o el límite de 512 tokens.

Objetivo experimental: comprobar si aprender de narraciones y autoinformes originalmente españoles mejora la estimación frente a los pesos históricos y frente a una referencia constante. No se eligen criterios tras mirar el test.

## Fuentes y separación

- PersonText v1: https://catalabs.mx/datasets/persontext/corpus_persontext_v1.csv
- SHA-256 v1: d51831462e26828083b44c6eb125f9307296fef9728e5173d646b0e932748eed.
- PersonText v2: https://catalabs.mx/datasets/persontext/corpus_persontext_v2.csv
- SHA-256 v2: f9f28b56f25a9dec7fb8c634bb58fdc55f57e2bb512d0cbfe04e3ffa4ac6132d.
- Portal de los autores: https://catalabs.mx/datasets/persontext/ . Artículo: DOI 10.13053/CyS-28-3-4619.

La publicación invita al uso en investigación; sólo se hace entrenamiento/evaluación académica local. No se identificó una licencia general del CSV para redistribución ni explotación comercial. No se publican datos, pesos nuevos ni predicciones individuales en GitHub/Vercel. Los CSV contienen textos e identificadores/fechas: se tratan como datos personales seudonimizados, no como anonimato garantizado. Carpeta privada fuera de Git, sin proveedores generativos ni bases remotas. Coste de API US$0. No hay correos, nuevas cuentas, compras ni despliegues.

Entrenamiento/desarrollo: los 80 adultos de v1, 210 textos. Test final: exclusivamente los UID que aparecen en v2 y no en v1; la inspección previa contó 30 adultos y 90 textos. Es una reserva por participantes nuevos en la versión ampliada del mismo corpus, no una muestra de una institución independiente. Sus predicciones no se habían calculado al escribir este protocolo. Ya se habían revisado esquema, conteos, consistencia y duplicados; no es una preregistración pública ni un estudio doble ciego.

Una persona pesa una vez. Se concatenan sus textos en orden del CSV con dos saltos de línea. Si algún registro de un UID informa edad <18, se excluye ese UID completo. Se detiene ante edad inválida, texto vacío, duplicado normalizado, puntuaciones no finitas/fuera de 0–1 o inconsistentes dentro de una persona. Comprobar textos individuales y concatenados contra entrenamiento, validación y test históricos. Se verifica ausencia de UID y duplicados entre desarrollo/test; no se pretende certificar identidad personal entre estudios ni detectar toda paráfrasis.

No se usa v2 para agregar respuestas de los 80 participantes de desarrollo: sólo v1. Así se evita cambiar silenciosamente su representación. El modelo recibe exclusivamente texto, sin edad, sexo, fechas, identificadores ni cuestionarios como características.

## Etiquetas y métodos fijados

Orden: apertura→openness, responsabilidad→conscientiousness, sociabilidad→extraversion, amabilidad→agreeableness, neuroticismo→neuroticism. Entrenar con el valor numérico publicado multiplicado por 100 para conservar la interfaz; es un reescalado del autoinforme IPIP, no un porcentaje de personalidad ni un percentil poblacional, y no equivale a BFI-2-S.

N conserva el significado nominal del CSV y no se invierte por conveniencia. Sigue provisional por discrepancia entre el ejemplo del artículo y el archivo. Se entrena y reporta, pero no acredita una quinta dimensión validada hasta aclaración.

Modelo principal: cinco RidgeCV nuevos, alpha en {0,1; 1; 10; 100; 1000}, selección por menor MSE en cinco particiones internas barajadas con semilla 20260908. Sin escaladores, nuevos encoders, búsqueda de arquitectura, fine-tuning ni mezcla con ejemplos sintéticos/ingleses. La extracción congelada puede computarse antes de dividir porque no aprende de los datos.

Referencia simple reentrenada: TF-IDF de palabras, n-gramas (1,2), máximo 10.000 características, min_df=2, sublinear_tf=True, sin stopwords. Ridge y la misma lista de alpha. El vocabulario/IDF se aprenden dentro de cada partición interna mediante Pipeline/GridSearchCV: no usar información de validación para ajustar el vectorizador. No se cambia el método según sus resultados.

Evaluación interna de desarrollo: validación cruzada anidada, cinco particiones externas y cinco internas, por personas. Esta exploración utiliza únicamente los 80 adultos. Las predicciones externas de cada fold se guardan sólo en privado. Finalmente se entrenan ambos modelos sobre los 80 y se guardan sus hashes antes de abrir el test.

Comparadores finales sobre las mismas 30 personas: (1) DistilBERT + Ridge reentrenado, (2) TF-IDF + Ridge reentrenado, (3) DistilBERT + Ridge histórico, (4) constante igual a la media de cada rasgo del entrenamiento español. Todos los puntajes se redondean a dos decimales y recortan a 0–100 como la interfaz actual. Los modelos histórico y nuevo no se consideran instrumentos calibrados equivalentes.

## Métricas y veredicto

Principal: MAE en puntos de la escala reexpresada 0–100, junto a RMSE y R² frente al autoinforme. Comparación pareada de MAE del modelo nuevo menos cada referencia; un valor negativo favorece al nuevo. Intervalos percentiles 95% mediante 2.000 remuestreos de las 30 personas, semilla 20260908, mismos índices para todos los métodos. No ajustados por comparaciones múltiples; se comunican como exploratorios.

Secundarias: Pearson y Spearman con el valor publicado; AUC frente a la etiqueta publicada (>0,6), sin escoger un umbral de predicción. Se informa la distribución de etiquetas al evaluar; si hay una sola clase, AUC es indefinida y no se inventa. No se usa AUC como reemplazo oportunista del objetivo continuo.

Se mantienen los umbrales numéricos ya existentes de Umbra: n≥30, R²>0,20 y Pearson>0,30 por dimensión. Se reporta si cada dimensión los alcanza; no se cambian ni se confunden con validación psicométrica. Aun si los alcanza, producción no se activa automáticamente: quedan tamaño, representatividad, incertidumbre y adecuación del instrumento por revisar.

No alcanza con bajar el error respecto de un modelo histórico no calibrado: debe compararse también con la media de entrenamiento. Si no supera esa referencia, no se presenta como aporte predictivo demostrado. Los cinco resultados se conservan, favorables o no. No se repite la selección de modelos o particiones después de observar el test. Repetir la inferencia para verificar reproducibilidad no crea otra muestra ni permite cambiar métodos.

## Reproducibilidad y seguridad

Snapshot de código: f6eb9bb7edf1351bad8ba463fbf0fe4fd550eb06; encoder congelado revisión 45c032ab32cc946ad88a166f7cb282f58c753c2e. Registrar versiones de librerías, huellas de entradas, scripts, bundle histórico y métricas originales. Mantener sus bytes sin cambios.

Separar comandos de entrenamiento y evaluación. El comando de evaluación exige que ya existan el manifiesto de entrenamiento y los bundles con sus hashes intactos. Guardar modelos y predicciones privadas fuera del repo; publicar sólo resultados agregados. Registrar la corrida en MLflow local y versiones de CSV con DVC local sin SCM, sin conectarlo a servicios remotos. Comprobar serialización/carga, forma y finitud de salidas, y coincidencia con Predictor para la interfaz del nuevo bundle.

El mayor riesgo de esta tarea es obtener una cifra favorable por filtración de información o selección oportunista. Los controles son separación por UID, pruebas de fugas, ajuste sólo en desarrollo, métodos congelados antes del test, publicación de todos los resultados y conservación del modelo publicado.

Entrega de esta tarea: scripts, controles, modelos experimentales privados, métricas, trazabilidad y veredicto en lenguaje sencillo. No se modifica el TFG ni producción sin revisión posterior.

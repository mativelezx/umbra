# Discusión

<!-- PENDIENTE: redactar en primera persona (permitida en Discusión y
     Conclusiones según convenciones académicas). -->

## Reflexión metodológica

<!-- PENDIENTE: por qué se eligió la arquitectura híbrida medido vs
     interpretativo en lugar de delegar todo el análisis a un LLM
     externo. Qué se ganó (auditabilidad, métricas reproducibles
     por dimensión, independencia operativa) y qué se sacrificó
     (complejidad operacional adicional, módulo Python separado
     que no corre en Vercel). -->

## Amenazas a la validez

### Validez interna

<!-- PENDIENTE: el módulo analítico opera sobre embeddings
     congelados de DistilBERT; cualquier sesgo del modelo
     preentrenado se hereda. La separación medido vs interpretativo
     es una decisión metodológica que limita explícitamente qué
     puede afirmarse. -->

### Validez externa

<!-- PENDIENTE: la heterogeneidad del corpus (Essays en inglés vs
     latinoamericano propio en español argentino) limita la
     generalización. Mitigación: reporte por dimensión con
     per_dimension_status. El corpus latinoamericano es propio
     del autor y específico al voseo argentino. -->

### Validez de constructo

<!-- PENDIENTE: ¿Mide Umbra realmente Big Five y funciones Jung, o
     mide los marcadores lingüísticos que el modelo asoció con
     esas etiquetas durante el entrenamiento? Este es el punto
     metodológico más delicado — discutirlo abiertamente. La
     decisión de tratar Jung como lectura interpretativa, no como
     dimensión medida, mitiga parcialmente el problema. -->

### Validez estadística

<!-- PENDIENTE: n acotado tanto en el corpus latinoamericano (n=50-100)
     como en el estudio SUS (n=8-15). Defender con la honestidad
     metodológica del reporte por dimensión y con el carácter de
     usability testing del estudio SUS (Brooke 1996) más que de
     investigación con poder estadístico fuerte. -->

## Diálogo con el estado del arte

<!-- PENDIENTE: cómo se posiciona Umbra respecto a 16personalities,
     Crystal, Pattern, Truity. Qué aporta nuevo: arquitectura
     híbrida auditable, pipeline ML reproducible, voseo
     latinoamericano nativo, cinco mecanismos técnicos Ley 25.326.
     Qué todavía falta: corpus más grande, validación cross-vendor
     en la capa narrativa, longitudinal con n mayor. -->

## Honestidad sobre lo que no se logró

<!-- PENDIENTE: declarar honestamente las dimensiones Big Five que
     hayan quedado como low_confidence, las limitaciones del
     dataset de crisis sin revisión clínica externa al cierre, el
     n efectivo del estudio SUS si llegó por debajo del rango
     planeado, y cualquier desvío del cronograma TP1-TP4. -->

## Implicaciones

<!-- PENDIENTE: qué significa Umbra para el diseño de productos
     asistidos por IA con datos psicológicos sensibles, para el
     cumplimiento normativo en jurisdicción argentina, y para la
     investigación futura sobre inferencia de personalidad por
     texto en español latinoamericano. -->

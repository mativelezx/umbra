# Trabajo futuro

<!-- FUENTE: docs/biz/IMPLEMENTATION_PLAN.md sección "Scope
     explícitamente FUERA del TFG" + items que surgieron durante
     la ejecución. -->

> Este capítulo documenta los ítems que quedaron fuera del scope
> del TFG pero que forman parte del roadmap natural del producto.
> Incluirlos por escrito cumple dos funciones: protege al autor
> de objeciones del tipo "¿por qué no hiciste X?", y deja un
> mapa claro para la continuación del proyecto post-defensa.

## Continuaciones cortas (1-2 semanas)

### Revisión del dataset de crisis por persona con criterio clínico

El dataset de cien casos etiquetados en
`lib/evals/crisis-dataset.ts` fue draft-generado con asistencia de
IA. Antes de considerar la evaluación del clasificador como
referencia externa, corresponde revisión por una persona con
formación en salud mental (psicólogo, psiquiatra o profesional
con criterio clínico). Si esa revisión produce cambios
significativos en las etiquetas, corresponde re-ejecutar la
evaluación sobre el dataset revisado.

### Cierre del cronograma de sprints ML

Los Sprints ML 1-3 están en curso según el cronograma de
[`docs/biz/TFG.md`](../docs/biz/TFG.md). Una vez completados, el
capítulo 8 Validación computacional se actualiza con la tabla
final de métricas por dimensión y `per_dimension_status` sobre el
bloque `latinoamericano_only`. Los artefactos serializados
(`ml/models/*.joblib`) y `ml/eval_metrics.json` se commitean al
repositorio.

### Resend API key y flujo de borrado en producción

El código del flujo de borrado con magic link está implementado
y testeado unitariamente, pero requiere una API key de Resend
(`RESEND_API_KEY`) configurada en Vercel para enviar los emails
reales en producción. La integración queda pendiente por razones
de calendario pero no involucra cambios de código adicionales.

## Continuaciones medianas (1-2 meses)

### Validación con usuarios formal (n≥30, comité de ética)

El TFG planifica el estudio SUS con n=8-15 (usability testing,
no investigación clínica). Una continuación natural es un estudio
formal con n≥30, reclutamiento externo, y revisión de un comité
de ética institucional cuando la universidad lo requiera. La
infraestructura de instrumentación in-app
(`/api/research/usability` + `UsabilityPrompt.tsx`) ya está
implementada como base.

### Cross-vendor en la capa narrativa

La capa narrativa actual delega a un proveedor LLM externo con
identificador de modelo fijado (ADR-005). Una extensión natural
es comparar el comportamiento del retrato y del chat con un
proveedor alternativo (otro vendor con interfaz compatible) para
reducir la dependencia operativa de un único proveedor. La capa
de abstracción ya está lista; solo requiere credenciales
adicionales y presupuesto.

### Calibración de los umbrales del módulo analítico

Los umbrales R² > 0.20 y r > 0.30 (ADR-027) son conservadores y
pueden recalibrarse empíricamente a partir de la corrida final
sobre el corpus combinado. Si las métricas observadas son
sustancialmente mayores en algunas dimensiones, los umbrales
pueden subirse para que `per_dimension_status: "ok"` sea una
señal más exigente.

### Expansión del corpus latinoamericano

El corpus latinoamericano propio (n=50-100, ADR-028) cubre el
mínimo viable para entrenar Ridge sobre embeddings de
DistilBERT, pero un corpus mayor (n=200+) reduciría la
incertidumbre de las métricas reportadas y permitiría reservar
un split test más representativo. Esta expansión combina bien
con la validación cruzada con muestras humanas declarativas
mencionada en ADR-028.

## Continuaciones largas (6+ meses)

### Longitudinal test-retest con usuarios reales

El patrón "mismo usuario, mismo texto, n días después → scores
similares" es el estándar de validez test-retest en psicometría.
Requiere consentimiento especial, participación sostenida y un
análisis estadístico distinto (ICC, Cronbach's alpha temporal).
Fuera del scope del TFG pero publicable como continuación.

### MVP público con telemetría opt-in

Si el producto se abre a registros públicos con telemetría
opt-in, permitiría estudios observacionales a escala — pero
abre preguntas complejas de Ley 25.326, escalabilidad y
responsabilidad civil si alguien en crisis real usa el chat.
Requiere un análisis de riesgo legal y ético previo a cualquier
decisión.

### Fine-tuning del módulo analítico

La decisión de usar embeddings *frozen* de DistilBERT (Howard &
Ruder 2018; Peters et al. 2019) es deliberada para mantener el
modelo auditable y entrenable con recursos modestos. Una
continuación posible es fine-tunear DistilBERT (o un modelo
similar) con pérdida multi-output sobre las cinco dimensiones
Big Five, comparando métricas contra el baseline Ridge actual.

## Extensiones académicas

### Paper resumen en CLEI o JAIIO

El módulo analítico open-source con pipeline reproducible
(DVC + MLflow) y la arquitectura híbrida medido vs interpretativo
constituyen base suficiente para un paper corto (~8-12 páginas)
en CLEI (Conferencia Latinoamericana de Informática) o JAIIO
(Jornadas Argentinas de Informática). El TFG sirve como base
para ese paper.

### Comparación con modelos open-source locales

Reemplazar DistilBERT por un encoder en español argentino
específico (cuando la literatura ofrezca uno con suficiente
soporte) y comparar métricas. También evaluar la sustitución del
proveedor LLM externo por un modelo open-source local desde una
perspectiva de soberanía de datos para productos de salud
mental.

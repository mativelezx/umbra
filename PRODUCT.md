# Umbra — producto

<!-- impeccable:product-schema 1 -->

Confirmación de propósito: Matías Vélez, conversación del 6 de septiembre de 2026. Actualización aprobada el 8 de septiembre: autoinforme BFI-2-S como referencia principal; ML secundario experimental.
Este registro orienta el rediseño; no certifica funcionalidad ni aprobación académica.

## Platform

web

## Users

Personas adultas hispanohablantes que buscan reflexionar sobre sí mismas, sin solicitar diagnóstico ni tratamiento. El proyecto también debe ser comprensible para su autor y para quienes evalúan su Trabajo Final de Graduación en Ingeniería en Software de la Universidad Siglo 21.

## Product Purpose

Ayudar a una persona a reflexionar sobre lo que cuenta y cómo se describe, y a elegir una actividad para su día. El recorrido conserva consentimiento → escritura → análisis inicial → cuestionario opcional → resultado y actividad. En Mi resultado se muestran primero los promedios del cuestionario; la lectura se abre a demanda y el chat es complementario. Si se omite el cuestionario, se invita a completarlo y no se inventan sus resultados.

## Positioning

Prototipo académico de autoconocimiento que distingue autoinforme BFI-2-S, interpretación de IA, recursos simbólicos de Jung y actividades orientadas por Positive Computing. El ML propio se conserva en una sección experimental secundaria. Las capas no tienen el mismo origen ni respaldo: el cuestionario no valida el predictor, Jung, la administración web ni la eficacia de las actividades.

No se afirma exclusividad comercial, superioridad psicométrica ni validación en población hispanohablante.

## Operating Context

Aplicación web existente, accesible desde escritorio y móvil. La prioridad inmediata es una reentrega académica y una demostración en video que Matías pueda explicar. No se plantea una aplicación nativa ni una migración de arquitectura.

El recorrido deberá comprobarse con una cuenta de prueba y contenido sintético identificado. Las pantallas de ejemplo no constituyen evidencia de inferencia real, persistencia ni disponibilidad de proveedores.

## Capabilities and Constraints

- Código existente para acceso, consentimiento, preguntas, análisis, narrativa, actividades, chat, exportación y gestión de cuenta/datos. La disponibilidad integral permanece pendiente de verificación de runtime.
- Los cinco promedios principales de 1 a 5 se calculan en servidor con treinta respuestas y la clave publicada del BFI-2-S español. No son percentiles ni predicciones de IA. El ML conserva su evaluación independiente y omite las cinco cifras individuales insuficientes. El modelo de lenguaje genera interpretación y texto a partir del contexto explícito, sin usar resultados ML ocultos como pistas.
- Umbra no es terapia, diagnóstico, consejo médico ni MBTI.
- Mantener consentimiento, controles de privacidad, aislamiento de datos por usuario y tratamiento seguro de contenido sensible. Un cambio visual no autoriza cambiar esos contratos.
- No agregar funcionalidades, dependencias ni infraestructura sin una necesidad concreta del recorrido.
- Preservar los cambios no confirmados del usuario. La rama de trabajo actual y la candidata de entrega difieren; la aplicación del rediseño requiere una base aislada y explícita.
- Servicios externos, datos de prueba, costos y despliegue se acuerdan a su alcance; este registro no autoriza una publicación ni cambios en producción.

## Brand Commitments

- Nombre existente: Umbra. No se solicitó cambiarlo.
- Español latinoamericano en interfaz y documentación; comunicación clara y accesible para un estudiante y una persona sin formación técnica.
- Pedido confirmado: redefinir branding e interfaz con referencias de bienestar y patrones de Mobbin, evitando una apariencia genérica asociada a productos generados automáticamente.
- Referencia visual principal elegida durante la investigación: Stoic. Matías indicó «el de stoic me parece espectacular» al ver sus flujos en Mobbin el 6 de septiembre de 2026. Después pidió aplicar sus patrones en toda la app: composición, contraste, foco, navegación y controles, manteniendo las funciones propias de Umbra y sin reutilizar activos ni textos de Stoic.
- Identidad visible confirmada durante la revisión: logo `umbra` en minúsculas, portada oscura animada, una fuente gratuita con más personalidad e ilustraciones propias de las acciones del recorrido. Los detalles tipográficos y gráficos construidos se registran en DESIGN.md; su implementación no equivale a aceptación visual final del usuario.
- Interpretación de “anti IA” explicitada al usuario: identidad propia y lenguaje concreto, no ocultamiento del uso de IA, evasión de detectores ni atribución ficticia de autoría.
- Matías autorizó el 6 de septiembre de 2026 construir directamente la interfaz inspirada en Stoic y revisarla en navegador. Se aprueba la dirección de la propuesta `plans/BRANDING-DEMO-UMBRA-2026-09-06.md`; la revisión del resultado construido sigue pendiente.
- No copiar identidad, textos ni activos propietarios de las referencias.

## Evidence on Hand

- Auditoría integral: `plans/AUDITORIA-REENTREGA-2026-09-06.md`.
- Código y pruebas de la rama candidata `entrega-tribunal`, commit `c3fff06`, contrastados con el árbol actual `beta`, commit `2cc65df`.
- Evidencia local previa de pruebas web con configuración de CI y pantallas de muestra; no equivale a pruebas completas contra Supabase, ML y Anthropic reales.
- Devolución CAE, rúbrica y documentos académicos identificados por la auditoría. No hay aprobación CAE de la reentrega ni estudio de usabilidad realizado que pueda convertirse en un reclamo de marca.

## Product Principles

1. Explicar antes de impresionar: que la persona y el autor comprendan el resultado.
2. Distinguir autoinforme, estimación experimental, interpretación y propuesta de actividad.
3. Dar control sin presión: reflexión voluntaria, límites explícitos y acciones comprensibles.
4. Mantener una implementación que un estudiante pueda estudiar, demostrar y defender.
5. Verificar el recorrido real antes de llamarlo listo para grabar.

## Accessibility & Inclusion

Lectura clara en escritorio, móvil y video; navegación por teclado; nombres accesibles; contraste suficiente; controles táctiles utilizables y respeto por movimiento reducido. No usar solo color, animación o metáforas para explicar estados ni decisiones.

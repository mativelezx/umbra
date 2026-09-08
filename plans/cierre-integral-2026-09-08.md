# Cierre documental y funcional del 8 de septiembre de 2026

Esta revisión integra el experimento PersonText en la tesis y conserva la aplicación publicada. No declara aprobación del CAE ni cierre de todos los pendientes operativos.

## Archivos vigentes

[Publicación integral con PDF, Word, matriz CAE e informe funcional](https://github.com/mativelezx/umbra/releases/tag/entrega-cae-integral-2026-09-08).

La tesis de esta publicación tiene 95 páginas, 44 tablas, 9 figuras y tres índices. Reemplaza como documento de entrega a la revisión BFI de 92 páginas, que queda conservada como antecedente. El PDF y el Word corresponden a la misma generación.

## Cambios incorporados

- Resumen y abstract de 210 y 209 palabras, metodología, conclusiones, amenazas a la validez, trabajo futuro y Anexo E actualizados con PersonText.
- Nuevo Anexo I: 80 adultos de desarrollo y 30 de prueba, 299 registros utilizados, separación por UID, entrenamiento propio, métricas y reproducción. Los textos son transcripciones originalmente españolas, no escritura de usuarios de Umbra. No se entrenó DistilBERT desde cero.
- Cuatro tablas nuevas verificadas contra los JSON: particiones, error absoluto medio, R² y Pearson, e intervalos exploratorios. Las cinco dimensiones no alcanzaron los criterios. No se publicaron pesos candidatos ni se bajaron umbrales.
- Escudo de la universidad conforme al ejemplo de Canvas, en lugar del logo comercial. Se conserva tipografía académica y se actualizaron los destinos de los índices a partir del PDF.
- Comparación de traducciones conservada como experimento diferente, sin contar pares como nuevos participantes.

Los agregados y programas están en [PersonText](../artifacts/audits/persontext-retraining-2026-09-08/README.md). No se publican CSV, transcripciones, predicciones individuales ni pesos derivados, por sus condiciones de uso y privacidad. Reproducir requiere acceso autorizado a los datos y preparar el entorno indicado.

## Aplicación y comprobaciones

[Demo pública](https://umbra-sigma.vercel.app) · [Ingreso](https://umbra-sigma.vercel.app/login).

Runtime de la web: `1e57acd261deee87602514417459abe8813f5e2b`, publicado en Vercel y verificado antes de este cierre. Los cambios de esta revisión son documentos y evidencia: no requieren reemplazar la aplicación que ya está publicada.

Esta pasada repitió 414 pruebas Vitest en 67 archivos, typecheck y lint, además de comprobar páginas públicas, redirección del tablero anónimo y servicio ML disponible. ML `/health` respondió con pesos cargados, `/version` conservó `ridge_v1` y cinco estados `low_confidence`; inferencia sin clave recibió 401. No se ejecutó otra inferencia autenticada ni otro recorrido de pago en esta pasada.

La revisión inmediatamente anterior verificó build y cuatro recorridos locales de navegador con datos ficticios y descarga del PDF personal. Los recorridos remotos con cuenta ficticia confirmada por administración y las 37 pruebas del servicio ML son evidencia previa separada. Las 15 pruebas del procedimiento PersonText se repitieron desde su ubicación publicada. Ninguna de estas pruebas mide bienestar, validez psicológica o usabilidad con participantes.

[Capturas previas de escritorio y móvil](../docs/evidence/bfi-primary-2026-09-08/galeria.html) y [verificación del cambio didáctico](resultado-didactico-2026-09-08.md). Las capturas muestran datos ficticios, no resultados de una investigación con usuarios.

## Pendientes que no deben presentarse como aprobados

1. Correo: el entorno Vercel no tiene `RESEND_API_KEY` ni `EMAIL_FROM`. No está demostrada la bienvenida ni la confirmación de eliminación para destinatarios externos; el SMTP de Supabase es otro control pendiente. Un formulario visible no acredita recepción de correo. Usar la cuenta ficticia ya confirmada para la demo; no prometer registro externo completo.
2. ML: la nueva regresión no supera la constante en ninguno de los cinco rasgos. El BFI-2-S calcula valores de 1 a 5 a partir de las treinta respuestas, pero no sustituye el requisito de ML propio ni demuestra su precisión. La ampliación hacia n mayor que 300 del cursado no queda acreditada por 110 adultos totales y 30 de prueba.
3. Cronograma: se conserva la tutoría del 16/03 al 18/07/2026 y los hitos reconstruidos; Git acredita cambios, no horas ni trabajo continuo. El autor debe revisar las fechas. Las correcciones de septiembre están separadas.
4. Persisten restauración de respaldos, revisión de retención de proveedores, corte global de gasto y evaluación con participantes antes de ampliar la operación.

La matriz adjunta enumera la devolución del CAE y la rúbrica, con estados corregido/parcial/pendiente. Las observaciones originales advierten que no agotan la revisión; esta matriz no reemplaza el dictamen académico.

## Demo o video

El enunciado escrito revisado de Canvas exige una demo accesible públicamente con el código o prototipo y sus instrucciones, en la sección Demo después de Conclusiones y antes de Referencias. Esa sección está en la página impresa 66 de esta tesis. No se encontró una exigencia textual de MP4, duración o resolución en ese enunciado. No se entrega un video grabado por el estudiante. Esto no excluye instrucciones adicionales de la defensa oral.

## Fuentes de portada

[Ejemplo de portada de Canvas](https://meca.ues21.edu.ar/canvas/TFG_SOFTWARE_INF_SISTDEINF_1A21/L4/assets/J0wEuh19xgZ0JLy0_8ISG281uBzNFO7NQ.png) y [escudo ceremonial de la identidad diseñado por Diseño Shakespear](https://shakespearweb.com/portfolio-item/universidad-siglo-21-2/). Se conservó el símbolo institucional; no se generó un escudo nuevo.

## Para presentar

Leé el PDF vigente, verificá tus datos y el cronograma, abrí la demo y adjuntá los archivos requeridos por Campus. No subas credenciales ni la carpeta privada del experimento. La presentación debe describir el logro parcial documentado, sin afirmar precisión individual del ML ni ausencia de asistencia de IA.

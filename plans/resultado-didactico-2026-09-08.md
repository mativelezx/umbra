# Resultado explicado paso a paso

Estado: implementado y verificado localmente. Publicación pendiente de registrar.

## Alcance y decisión

Pedido: explicar mejor cómo usar el resultado sin presentar el límite del ML como cinco errores del usuario. Cambio de lenguaje y presentación en web de escritorio, web móvil e informe personal exportado. No es una revisión nueva de la tesis ni un reentrenamiento.

La guía presenta tres usos: conocer las respuestas al cuestionario, contrastar la interpretación generada por IA y elegir una actividad para explorar. El ejemplo de escala 4/5 es ilustrativo, no un dato atribuido a la persona. Se preservan las preguntas oficiales, la clave de puntuación, los modelos, los umbrales, las llamadas de IA y el almacenamiento.

El ML agrupa las dimensiones omitidas en una sola explicación y distingue precisión insuficiente de evaluación no disponible. Si una versión futura presenta estados mixtos, sólo se dibujan las cifras `ok`. El cuestionario pendiente conserva una acción para completarlo; no se afirma que ya exista un resultado.

## Evidencia de esta pasada

- Base: `f6eb9bb7edf1351bad8ba463fbf0fe4fd550eb06`, rama de entrega. El checkout principal `beta`, con trabajo previo, no fue alterado.
- TDD: 7 comprobaciones nuevas/modificadas fallaron ante la presentación anterior. Después de implementar, suite completa: 414 pruebas aprobadas en 67 archivos, repetida con Node 24.19.0.
- `pnpm typecheck` y `pnpm lint`: aprobados. Next informa deprecación de `next lint`, no errores de lint.
- `pnpm build`: aprobado, modo no-demo y variables ficticias de compilación. No demuestra conectividad productiva. Los intentos iniciales fallaron por descarga de fuentes restringida y falta de variables en esta copia; no se alteró el código de autenticación para sortearlos.
- Playwright: 4 recorridos locales aprobados. Onboarding de 8 respuestas ficticias, cuestionario de 30 respuestas, tablero, lectura, actividades y descarga efectiva del PDF. Navegación y axe revisados a 390 y 1440 px; sin errores de página ni escrituras a APIs en esos recorridos.
- Datos: fixture local explícito. No se ejecutaron pruebas con usuarios reales, credenciales productivas ni llamadas pagas de Anthropic. Los tests que requieren cuenta o proveedor real se actualizaron al nuevo contrato visual, pero no se ejecutaron en esta pasada.
- Revisión visual: tablero y estado del ML en escritorio/móvil; apéndice ML y página de notas del PDF descargado de 10 páginas. El PDF visual de prueba no incluye un cuestionario completado; la rama con autoinforme y los estados mixtos se verificaron con tests de componentes.
- Impeccable Clarify: guía por pasos, explicación de la escala y aviso agregado. El detector reportó observaciones de escala tipográfica y colores del sistema existente; no se declara detector limpio ni se hizo un rediseño de marca. No hay dependencias nuevas.
- SHA-256 del ML histórico sin cambios: `93eeecaaef2f334216783f0057184cbd2864edd43a484d3459e881b03d536612`.

Capturas y descarga de prueba: `.impeccable/review/didactic-2026-09-08/chromium/`. Capturas responsivas: `.impeccable/review/reading-2026-09-07/chromium-{390,1440}-*.png` (nombre heredado del test; ejecución de esta pasada). Son datos ficticios, no evidencia psicométrica.

## Publicación y reversión

El usuario solicitó mantener la entrega en GitHub y Vercel y aprobó esta dirección didáctica. La actualización se limita a presentación; no requiere migraciones, nuevos proveedores, cambios de secretos, entrenamiento ni recuperación de datos. Propietario: Matías. Si falla el acceso o el render tras publicar, se revierte el despliegue y se conserva la base de datos.

Despliegue anterior comprobado como Ready: `dpl_82vQbHCz2yfjAdDnS3riQ5nDm5wJ`, `https://umbra-ckik1vvh6-mativelez1997-6837s-projects.vercel.app`. Es el punto de reversión, no una certificación de todos los servicios. La comprobación posterior debe incluir inicio de sesión protegido y disponibilidad de la nueva presentación. No se amplía la evaluación a backups, concurrencia, eficacia de actividades, validez individual del ML o aprobación académica.

## Qué no cambia

El ML sigue sin respaldo suficiente para mostrar sus cinco estimaciones individuales. Esta mejora no corrige ese resultado experimental ni garantiza aprobación del CAE. Hace más comprensible qué dato viene del cuestionario, qué es una interpretación de IA y qué se puede elegir probar sin presentar una promesa de eficacia.

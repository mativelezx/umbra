# Cuestionario como referencia principal

8 de septiembre de 2026. Decisión aprobada por Matías en esta conversación. Estado: implementación y verificación local terminadas; publicación y documento en cierre. No es aprobación académica ni habilitación de producción abierta.

## Alcance aprobado

Prototipo académico web para personas adultas hispanohablantes. Se mantiene el recorrido del cursado: escritura, procesamiento, devolución, conversación y actividades. El BFI-2-S ya existente pasa a ser la primera referencia visible en Mi resultado; responderlo sigue siendo opcional. No se cambian arquitectura, instrumentos, permisos, retención, pesos ML, umbrales ni proveedores.

Se trabaja en la copia aislada de entrega, rama `codex/reentrega-final-2026-09-07`, base `257e32f`. El árbol `beta` original conserva cambios del usuario y no se integra ni limpia.

## Decisión y procedencia

- Tu cuestionario: cinco promedios de 1 a 5 calculados desde treinta respuestas según la clave española publicada. Ningún puntaje es generado por IA ni presentado como percentil.
- Tu lectura: narrativa de IA sobre contexto explícito; el autoinforme, si existe, se identifica como tal. Se carga al abrir la pestaña, no al consultar el cuestionario.
- Otras miradas: Jung como interpretación simbólica, con el ML experimental en un desplegable secundario. Las cinco cifras no reportables siguen omitidas; no se reemplazan por el cuestionario.
- Informe: cuestionario primero, lectura y actividades después, ML en un apéndice. Si falta el cuestionario, se explica y se enlaza la acción real para completarlo.

La alternativa de habilitar cifras ML tras traducir el conjunto inglés se descartó por la evidencia del [experimento](../translation-transfer-2026-09-08/INFORME.md). No hubo nueva validación con personas hispanohablantes. Se prioriza una función que sí tiene una fuente explícita: lo que la persona responde. Su utilidad percibida y la validez de la administración web aún requieren estudio.

## Cruce funcional

Rutas: `/onboarding`, `/assessment`, `/dashboard`, `/plan`, `/chat`, `/export` y portada. El autoinforme se guarda por `/api/self-report` en `psychological_profiles.analysis_raw.selfReport`, con consentimiento y propiedad, sin modificar `.ml` ni `research_dataset`. El cuestionario se ofrece tras el análisis inicial; no se implementa un acceso independiente previo a escritura y análisis. Si ese análisis falla, no se finge un perfil válido.

Se reutilizan Bricolage Grotesque, marca actual, marco grafito, papel, iconos Phosphor y movimiento reducido. No hay rebranding, nuevas librerías, puntuaciones decorativas ni investigación con usuarios. Las pestañas conservan el estado de la lectura y no repiten una cortina de transición.

## Verificación local ejecutada

- 411/411 pruebas unitarias y de componentes, tipos y lint sin errores; compilación Next.js de producción aprobada con configuración de CI, no secretos de producción.
- 22/22 casos de navegador aprobados sin reintentos en la repetición final: cuestionario, espacio de trabajo en 390/768/1292/1440 px, teclado, lectura, movimiento reducido, actividades y descarga real del PDF. Chromium y emulación móvil; no es una prueba en un iPhone físico.
- Dos expectativas antiguas se corrigieron para atravesar la nueva oferta del cuestionario. Una comprobación de movimiento reducido necesitaba esperar la aplicación del estilo del navegador; se reemplazó la lectura instantánea por una espera de la condición, sin relajar el requisito de cero animaciones.
- 10/10 pruebas del procedimiento de traducción aprobadas mediante pytest. El ensayo ML de 248 pares permanece intacto: no se reentrenó ni se cambiaron pesos/umbrales.
- Impeccable: inspección visual de los resultados, iconos, origen y escala; detector ejecutado una sola vez. Sus avisos son diferencias de tokens ya existentes en el cuestionario (tamaños, trazos y radios locales), no fallos funcionales. Se preservó esa familia visual; no se declara conformidad total de tokens ni aprobación estética del usuario.

Los registros finales se adjuntan con la publicación. Los intentos fallidos de entorno o expectativas no se contabilizan como aprobados.

Datos ficticios identificados; nunca datos de otras personas. Unitarias/componentes, tipos, lint, build; cuestionario en cinco bloques, regreso, omisión, lectura a demanda, navegación por teclado, actividades y descarga real PDF; escritorio y móvil, axe y capturas. La API se prueba con sus casos existentes de consentimiento, respuestas inválidas, conflicto de guardado, aislamiento y recuperación. Las pruebas de modelo se mantienen separadas de las de producto.

En producción, repetir sólo lecturas y navegación de la cuenta ficticia existente; no generar IA paga sin nuevo tope autorizado, ni registrar usuarios, enviar correos o borrar datos fuera del alcance aprobado. Publicar mediante el remoto `github`, nunca `origin` (copia local). Reversión: despliegue anterior y commit base; no hay migración nueva que revertir.

## Riesgo residual

La nueva jerarquía podría hacer confundir el respaldo del instrumento con validación de toda la plataforma. Control: origen y escala junto a cada resultado, límites en pantalla, prompts e informe; no se equipara autoinforme, interpretación y ML. Se revisará la decisión si se reúne evidencia independiente de validez y utilidad.

Continúan pendientes un dominio de correo verificado/SMTP para alta pública, corte global de consumo, evaluación con participantes, revisión de retención de proveedores y restauración de respaldos. La comprensión del autor y la veracidad de la reconstrucción cronológica requieren revisión personal. No se modifica el historial de Git para aparentar fechas.

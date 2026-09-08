# Umbra: revisión de interfaz y ejemplo local

Fecha: 6 de septiembre de 2026, Argentina. Rama candidata: `codex/stoic-demo`.
Fuente del registro histórico: `c9bf16a`, sobre `994620d` y `c798a6b`. La reconstrucción aprobada por Matías se implementa sobre `4978cdb`; su evidencia actual aparece en la última sección de este documento.

**Reconstrucción rechazada nuevamente por Matías.** La revisión `0350f43` no alcanza la dirección visual pedida: el usuario la considera blanca, estática y sin creatividad, jerarquía ni personalidad. Se conserva como checkpoint técnico, no como diseño terminado ni aprobación del usuario, del CAE o del tribunal. El registro del nuevo sistema quedó interrumpido: `DESIGN.md` es borrador y el sidecar conserva el diseño anterior.

## Qué cambió en la versión anterior

- Logo `umbra` en minúsculas y Bricolage Grotesque, variable y distribuida con licencia SIL Open Font License. Carga mediante `next/font`, sin petición de fuentes a Google desde el navegador.
- Portada oscura con líneas fluidas animadas, pausa manual y respeto por movimiento reducido. La animación se detiene fuera de vista o con la pestaña oculta; WebKit dispone de alternativa mediante transformaciones.
- Tres ejemplos seleccionables por mouse, tacto o teclado: preguntas, lectura y actividades.
- Cuatro escenas SVG propias: cuaderno y lápiz, persona leyendo, caminata e informe. Se reutilizan en portada y pantallas del recorrido; no son controles ni sustituyen las instrucciones escritas.
- Jerarquía contrastada, paneles de lectura blancos, preguntas centradas con progreso segmentado y navegación compacta. Referencias: patrones observados de Stoic, sin copiar sus activos o su fuente comercial.
- Correcciones de foco, ayuda contextual y diálogo de comparación. La región desplazable de consentimiento también se puede recorrer por teclado; su texto y versión no se modificaron.

## Comprobaciones históricas de la versión anterior

| Comprobación | Resultado y alcance |
| --- | --- |
| Vitest | 132 pruebas aprobadas en 22 archivos. |
| TypeScript y lint | Aprobados; comprobación de tipos repetida después de retirar los cambios generados por la compilación. |
| Compilación normal y ejemplo local | Ambas compilaciones de producción aprobadas con configuración de proveedores ficticia. |
| Playwright público | 50 pruebas aprobadas: 25 Chromium y 25 WebKit móvil. Incluye formularios, páginas públicas, metadatos, accesibilidad y redirecciones sin autenticación. No verifica el inicio de sesión real. |
| Inspección de pantallas | 22 combinaciones de página/ancho: 390, 998, 1280 y 1440 px. Sin desbordamiento horizontal, errores JavaScript ni infracciones axe detectadas en el alcance inspeccionado. |
| Recorrido de ejemplo | Ocho preguntas, omisión de carta opcional, resultado, casilla de actividad con teclado y vista de informe en escritorio y móvil. Descarga efectiva del PDF en escritorio; no se repitió la descarga en móvil. La casilla se reinicia al recargar, como anuncia la interfaz. |
| Estados adicionales | Pestañas del ejemplo sin salto de altura; ayuda dentro de la pantalla; diálogo con Escape y devolución de foco; consentimiento desplazable con teclado. |
| Movimiento | Chromium y WebKit: cambio efectivo de geometría/transformación, pausa, detención fuera de vista y cero animaciones activas con movimiento reducido. |
| PDF descargado | Cuatro páginas A4, 1.937.078 bytes, generado a las 21:22:44. Se revisaron las cuatro páginas renderizadas con la nueva fuente y jerarquía final. El PDF es rasterizado y no está etiquetado: no se afirma accesibilidad documental completa. |
| Integridad interna y Agent OS | Comprobaciones aprobadas. Esto no demuestra políticas RLS desplegadas ni seguridad de un entorno remoto. |

Las inspecciones del ejemplo bloquearon peticiones externas y a `/api/`; no hubo intentos. Las pruebas usan datos sintéticos locales, no los datos personales ni las credenciales del árbol original.

Evidencia local en `.impeccable/review/`: `inspection.json`, `demo-journey.json`, `overlays.json`, `motion.json`, `motion-webkit.json`, `public-e2e-final.json`, capturas y `informe-ejemplo.pdf`. Estos artefactos de QA no se publican como activos del producto. Los scripts de inspección están en `.superpowers/sdd/2026-09-06-stoic-ui/` dentro de la copia de trabajo.

## Revisión de acabado anterior

La revisión independiente de Impeccable confirmó fuente, ilustraciones, contraste, recorrido, reflujo móvil y controles. Pidió tres ajustes de jerarquía: título antes del contexto en comparación, eliminación del antetítulo de carta futura y atribución de IA debajo del nombre en el informe. Se aplicaron en `c9bf16a` y se volvieron a revisar comparación/carta en escritorio y móvil y las cuatro páginas del PDF. Dictamen de corrección: **ship**, sin regresiones observadas en esos ajustes. Es un cierre de la interfaz local, no una aceptación del usuario ni una aprobación académica.

No se conservó la tarjeta original QUALITY BAR de la exploración; el revisor lo explicitó y evaluó contra la dirección elegida por el usuario y las referencias observadas. No se afirma haber superado una tarjeta ausente. El detector léxico se ejecutó una única vez sobre una versión anterior (`6a75d18`); sus tres observaciones de nombres `violet` no describen por sí solas el color renderizado, porque esos alias se reasignan a grises. No es una medición de autoría ni un filtro académico.

## Cómo revisar esta versión

La vista local usa `NEXT_PUBLIC_DEMO_MODE=true`; la reconstrucción usa `.next-immersive` y el incremento anterior conserva `.next-qa`. En la portada, elegir **Recorrer el ejemplo local** para seguir el recorrido preparado. **Empezar** conserva el destino de registro real; **Chat** conserva la autenticación y no simula una conversación funcional.

La ruta del ejemplo no sirve para demostrar inferencia ni guardado: sus respuestas no generan el resultado mostrado. En una grabación de este recorrido debe decirse expresamente que es una muestra de interfaz con datos ficticios.

La copia de trabajo está en `/private/tmp/umbra-entrega-audit.B6Tyg8/repo`. La rama `codex/stoic-demo` también se guardó en el repositorio original mediante un fetch local. Su árbol de trabajo `/Users/matiasvelez/Developer/umbra` continúa en `beta`; sus cambios ML no se han mezclado con este rediseño. Las capturas y demás evidencia de QA permanecen en la copia temporal: conservarlas antes de eliminar esa copia.

## Pendiente antes de una demo integral para la entrega

1. Verificar con una cuenta de prueba y datos sintéticos identificados el acceso, consentimiento, análisis ML, generación, persistencia, chat y controles de datos en el entorno acordado.
2. Revisar la regeneración en `app/api/narrative/route.ts`: la ruta preexistente elimina la narrativa persistida antes de completar la siguiente y puede guardar texto parcial ante una falla. La interfaz conserva la lectura anterior solo mientras permanece montada; no corrige la persistencia del servidor.
3. Contrastar las afirmaciones preexistentes del consentimiento sobre ubicación de datos, acceso y retención del proveedor con la configuración y términos reales. Esta intervención no modificó texto/hash ni valida cumplimiento legal.
4. Cerrar la matriz de requisitos del CAE, documento, código y evidencia, y preparar un guion que Matías comprenda. Un rediseño visual y pruebas locales no prueban que la tesis esté aprobada ni que la app esté íntegramente lista para grabar con servicios reales.

No se desplegó, no se cambió de rama el árbol original, no se usaron proveedores de IA reales y no se promete aprobación del CAE ni evasión de Turnitin.

## Revisión histórica tras el rechazo de la experiencia

Fuente académica inspeccionada: `REENTREGA_TFG_Umbra_Velez_SOF01994.pdf`, 84 páginas, junto al DOCX homónimo en `UES21/umbra-tesis`. Se leyeron las páginas 20–22, 41–46, 48–49, 67–68 y 81–82 y se renderizó la página 49. Esto no es una nueva auditoría completa del CAE ni certifica el resto del documento.

Evidencia fresca: `/dashboard` y `/plan` en el navegador local. El viewport CSS reportado fue 1083 × 1137; los archivos capturados miden 1072 × 1125. Capturas en `.impeccable/review/rejection-2026-09-06/`. El modo de datos sigue siendo ejemplo sintético local sin verificación de proveedores reales.

| Requisito del documento | Superficie y límite observado |
| --- | --- |
| HU-01–02: cuenta y consentimiento previo | Existen rutas y controles de sesión/consentimiento. El modo demo omite el control del middleware; no acredita este recorrido real. |
| HU-03–04: preguntas adaptativas, corrección, reanudación e incorporación de textos | El código distingue flujo real y guion de ejemplo. Las ocho preguntas fijas no demuestran adaptación ni inferencia sobre las respuestas; el resultado de ejemplo declara 14 respuestas. |
| HU-05–07: módulo propio, estado por dimensión, error explícito | El componente cuantitativo aplica estados, pero el runtime de ejemplo no ejecuta ML ni verifica sus errores. |
| HU-08–10: narrativa progresiva, distinción de estatus y plan exportable | La narrativa sintética afirma «Extraversión baja» y «Neuroticismo medio-alto», aunque no se muestran como dimensiones respaldadas. El plan usa intensidades Jung como razones causales sin el encuadre local suficiente. Debe revisarse el contenido y su procedencia, no solo el color. |
| HU-11–12: chat contextual con historial, autonomía y seguridad | Hay código específico; `/chat` conserva autenticación real. El ejemplo local no acredita este flujo. |
| HU-13–16: datos, rectificación, cancelación y oposición | Las superficies existen; su persistencia, aislamiento y efectos reales requieren pruebas acotadas con una cuenta de ensayo. |

Observaciones visuales y documentales:

- Fondo, navegación y paneles claros tienen poca separación visual; la tarjeta del arquetipo concentra la atención antes de la lectura y de sus límites. En la muestra medida, el texto secundario conserva contraste: 5,15:1 y 5,72:1 sobre el fondo. El contraste de 1,07:1 entre blanco y fondo describe jerarquía de superficies, no por sí solo una infracción WCAG.
- `LayoutShell` organiza un documento vertical y el dashboard apila secciones; no se observó un recorrido de lectura continuo entre pantallas. Las clases `dash-enter` del dashboard no tienen reglas en `app/globals.css`.
- Las figuras de la página 49 son maquetas anteriores; incluyen «Autoconocimiento 68%» y una representación de ejes que no debe convertirse en un indicador nuevo para forzar coincidencia. Se deben reconciliar las figuras y su explicación con el incremento final verificado.
- Positive Computing, páginas 20–22 y 82, exige autonomía, ausencia de gamificación/retención y cierre del recorrido. La inmersión debe apoyar foco, comprensión y control, no permanencia ni autoridad psicológica aparente.
- La página 68 mantiene un marcador de enlace de video y declara un recorrido completo operativo; el ejemplo de interfaz no es evidencia suficiente para esa afirmación.

Esta revisión delimita problemas y requisitos para acordar la nueva dirección. No modifica prompts, modelos, consentimiento, cuentas, bases de datos, tesis ni interfaz, y no certifica las 16 historias como cumplidas.

La revisión independiente nueva devolvió **rebuild** para dashboard y actividades: recomponer ambas superficies, lectura por secciones elegidas, una actividad focal, procedencia antes de autoridad simbólica y continuidad de interacción. Conserva marca, fuente, paleta, navegación explícita y arquitectura. Detectó además un borde de casilla sin seleccionar con contraste estimado de 2,01:1 a partir de sus tokens. La evidencia móvil previa se usó solo como complemento, y el movimiento se revisó en código, sin una captura temporal nueva. Este era el estado al proponer la reconstrucción; Matías la aprobó después con «dale hacelo».

## Reconstrucción aprobada: experiencia de lectura y actividades

Plataforma: web de escritorio y móvil, sin nueva plataforma nativa. Datos: ejemplo sintético local, sin proveedores reales, cuentas creadas, bases de datos modificadas ni peticiones de análisis. Objetivo: que el lector identifique su tarea, pueda recorrerla a su ritmo y distinga texto interpretativo, medición experimental y acciones opcionales. No se añadieron dependencias, seguimiento, gamificación ni nuevas promesas clínicas.

| Recorrido | Cambio y evidencia |
| --- | --- |
| Entrada → resultado | Marco continuo grafito, navegación de 200 px en escritorio y barra inferior móvil, zona clara de trabajo y SVG propio integrado. El mismo marco de foco acompaña acceso, consentimiento y preguntas; no cambia su lógica de servidor. |
| Resultado → lectura | Pestañas «Tu lectura», «Datos del modelo» y «Lectura simbólica». La lectura avanza por secciones o muestra todo el texto; conserva la introducción, el contenido y la sección elegida al explorar otra pestaña. Flechas, Home y End recorren las pestañas. |
| Lectura → siguiente capítulo | Se conserva el foco y se trae el título a la vista solo si quedó fuera del área útil. Regresión reproducida antes del arreglo: título a −53 px en móvil; después queda íntegramente visible en Chromium y WebKit, con movimiento normal y reducido. |
| Actividades → una propuesta → regresar | La lista abre una actividad ilustrada, con pasos sugeridos y explicación desplegable. Volver restaura posición y foco en la opción elegida. Las casillas mantienen su estado durante esa vista y se reinician al recargar el ejemplo, tal como se informa. No se ha comprobado guardado real; el update de Supabase preexistente requiere revisar su manejo de errores. |
| Ejemplo → interpretación | Se retiraron del texto sintético las afirmaciones cualitativas sobre dimensiones no respaldadas y las razones causales basadas en intensidades Jung. La carta de ejemplo ya no promete un escrito del usuario guardado ni una fecha real de apertura. El arquetipo no muestra el conteo ficticio de 14 respuestas; el guion mantiene ocho preguntas. Esto no corrige ni valida por sí solo las salidas de los prompts reales. |
| Resultado → informe | El PDF incluye todos los capítulos sin controles interactivos. La verificación se hace sobre la descarga real, no solo sobre la vista previa. El exportador rasteriza el texto: el archivo no está etiquetado ni se acredita accesibilidad documental completa. |

Comprobaciones de la reconstrucción:

- Vitest: **142 pruebas aprobadas en 26 archivos**, incluidas navegación, contenido completo, introducción, foco de regreso, pasos y carta sintética; lint aprobado.
- Compilación de producción del ejemplo y normal aprobadas con variables ficticias. Esto comprueba compilación, no conectividad con servicios reales.
- Playwright público: **50 pruebas aprobadas**, 25 Chromium y 25 WebKit móvil; formularios, metadatos, accesibilidad y redirecciones sin sesión. No es un login real.
- Matriz de UI: **49 estados/pantallas**, escritorio 1440 × 1000, móvil 390 × 844 y ventana del usuario 1083 × 1137. Sin desbordamiento horizontal, errores JavaScript ni infracciones axe detectadas; no se acredita cumplimiento WCAG integral por una prueba automática.
- Movimiento: `page-unfold` observado durante 420 ms en ambos motores; con preferencia reducida dura 0,01 ms. Se preservan contenido y controles. No se afirma que el movimiento interior sea una experiencia cinematográfica ni que las preferencias del usuario estén aceptadas.
- Recorrido local repetido en escritorio y móvil: ocho preguntas → omitir carta opcional → resultado → abrir actividad → casilla con teclado → reinicio al recargar → informe. Descarga efectiva en escritorio; descarga móvil no repetida. Sin intentos de peticiones externas o a `/api/` en estos recorridos.
- Integridad interna y Agent OS aprobados. Sin cambios en dependencias, APIs, prompts, modelos, migraciones, consentimiento ni datos del árbol original.
- PDF final descargado de `localhost:3000` a las 22:51:21: cuatro páginas A4, 1.596.375 bytes. Se inspeccionaron las cuatro imágenes renderizadas. El título «Lo que te cuesta» queda junto a su párrafo; el espaciado interno de cada capítulo evita que los separadores insertados por el exportador desarmen esa agrupación. No se han ensayado todas las longitudes posibles de textos reales.

Evidencia de este incremento: `.impeccable/review/immersive/verification.json`, `reader-scroll.json`, `motion.json`, `demo-journey.json`, `public-e2e.json`, capturas por motor/tamaño y PDF descargado. Los scripts de QA se conservan en `.superpowers/sdd/2026-09-06-stoic-ui/` de la copia aislada. Los artefactos locales no se incorporan como activos públicos del producto.

El detector de esta reconstrucción se ejecutó una vez: 28 avisos léxicos de colores, tamaños y radios fuera del contrato histórico; no hubo hallazgos clasificados como duros. Se contrasta el diseño observado con su documentación actualizada, no con una medición de autoría.

No se modificaron el DOCX ni el PDF de tesis. Siguen pendientes la matriz integral del CAE, la actualización de figuras y video del documento, la verificación del flujo real con cuenta de ensayo y la preparación de una explicación que Matías pueda defender. Esta interfaz sintética no debe grabarse ni describirse como evidencia de inferencia y persistencia reales.

### Rechazo de la reconstrucción y continuidad

La revisión de correcciones de Impeccable comprobó como resueltos el desplazamiento al siguiente capítulo y la atribución de la carta ficticia. El dictamen final quedó en **rebuild** tras la nueva devolución del usuario; la documentación permaneció sin terminar. Las pruebas no cambian ese rechazo visual.

Una revisión acotada de código identificó una regresión pendiente en `components/chat/ChatShell.tsx`: cambiar la barra de conversaciones de `lg` a `xl` deja sin historial ni nueva conversación a los anchos 1024–1279 px. Debe restaurarse el acceso en ese intervalo o proveer controles equivalentes antes de integrar la reconstrucción. No se detectaron problemas críticos en el alcance de esa revisión; no es una auditoría exhaustiva ni del flujo real.

El nuevo trabajo debe definir y validar primero una dirección más expresiva, con composición, ilustración y movimiento visibles. No debe convertir el borrador grafito/papel rechazado en una restricción para conservar sus defectos.

## Incremento de portada aprobado el 7/9: historia, ilustración y movimiento

Este registro posterior distingue la autorización de dirección de la aceptación visual final. Matías aprobó «Tu historia no cabe en una etiqueta.» y una escena propia de escritura, lectura y actividad. Canal: web escritorio/móvil. Datos: demo sintética; sin tocar Auth, Supabase, Claude, ML, Docker o tesis en este incremento.

Se añadieron `StoryScene`, `SvgArtwork` y `art-motion.css`; se actualizaron `HeroExperience`, `ReflectionArt`, `Brand`, arquetipos, título/metadatos y sus tests. No hay dependencias nuevas. La escena relaciona las pestañas con libro, lápiz, trazos y sendero. Las ilustraciones interiores tienen gestos finitos y los iconos operativos responden a interacción. Pausa, visibilidad de página/viewport y movimiento reducido controlan los ciclos; el contenido no depende de que corran. Favicon e informe impreso no se animan.

Evidencia final del clon integrado:

- Vitest: **262/262, 44 archivos**, repetido a las 09:58 (Argentina).
- TypeScript, lint, integridad y gate básico de Agent OS: aprobados. Build de producción: 29 páginas, ID `WUo2j8PdOIJow2I1E4zmK`, directorio `.next-story-final`.
- Playwright sobre 3022: **44/44**, Chromium y WebKit, anchos 390/1152/1440 según prueba. Incluye recorrido de ocho preguntas, resultado conservador, actividades y descarga efectiva de PDF, además del harness de chat con datos simulados. No incluye conexión real a cuenta, inferencia o guardado.
- Hero: comprobados los ciclos CSS reales, pausa, teclado y cambio de escena. Con movimiento reducido no quedan animaciones en la escena/ilustración verificadas, y en impresión la ilustración se detiene. El indicador abierto del chat conserva su orientación bajo movimiento reducido.
- Dos rondas de inspección visual: composición de escritorio/móvil revisada, sin desbordamiento. Capturas finales en `.impeccable/review/story-2026-09-07/`; las demás pantallas en `.impeccable/review/polish-2026-09-07/`.
- Revisión independiente de código: tres hallazgos corregidos (wrapper de impresión, chevrón de estado y panel al pausar), sin pendientes en ese alcance. No es una auditoría integral de toda la app.

Las pruebas inicialmente detectaron contraste transitorio al interpolar tinta y fondo de las pestañas; se quitaron esas transiciones de color. También reprodujeron el movimiento residual del wrapper al imprimir y las dos regresiones mencionadas antes del arreglo. WebKit aplica los cambios de media-query y su timeline en cuadros diferentes: la aserción espera cero animaciones efectivas, sin filtrarlas ni aceptar una cantidad no nula. No se sustituyó una prueba fallida por una captura previa.

Se conserva la copia de trabajo aislada y el árbol original sin mezclar. La misma build se inició en 3000 sin recompilar y pasó **6/6 pruebas** de hero/recorrido/PDF en ambos motores. Se guardó `Umbra_Codigo_Hero_Animado_2026-09-07.zip` en la carpeta de reentrega, sin sobrescribir el anterior; 306 hashes de contenido y CRC comprobados. El Word/PDF no cambió. Este cierre visual no resuelve la disponibilidad de Supabase ni acredita la entrega académica completa.

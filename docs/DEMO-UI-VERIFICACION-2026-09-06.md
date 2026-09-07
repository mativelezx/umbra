# Umbra: revisión de interfaz y ejemplo local

Fecha: 6 de septiembre de 2026, Argentina. Rama candidata: `codex/stoic-demo`.
Fuente verificada: `c9bf16a` (jerarquía final), sobre `994620d` (portada ilustrada) y `c798a6b` (fuente e ilustraciones compartidas).
La documentación posterior no cambia esa versión de la aplicación.

## Qué cambió

- Logo `umbra` en minúsculas y Bricolage Grotesque, variable y distribuida con licencia SIL Open Font License. Carga mediante `next/font`, sin petición de fuentes a Google desde el navegador.
- Portada oscura con líneas fluidas animadas, pausa manual y respeto por movimiento reducido. La animación se detiene fuera de vista o con la pestaña oculta; WebKit dispone de alternativa mediante transformaciones.
- Tres ejemplos seleccionables por mouse, tacto o teclado: preguntas, lectura y actividades.
- Cuatro escenas SVG propias: cuaderno y lápiz, persona leyendo, caminata e informe. Se reutilizan en portada y pantallas del recorrido; no son controles ni sustituyen las instrucciones escritas.
- Jerarquía contrastada, paneles de lectura blancos, preguntas centradas con progreso segmentado y navegación compacta. Referencias: patrones observados de Stoic, sin copiar sus activos o su fuente comercial.
- Correcciones de foco, ayuda contextual y diálogo de comparación. La región desplazable de consentimiento también se puede recorrer por teclado; su texto y versión no se modificaron.

## Comprobaciones ejecutadas

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

## Revisión de acabado

La revisión independiente de Impeccable confirmó fuente, ilustraciones, contraste, recorrido, reflujo móvil y controles. Pidió tres ajustes de jerarquía: título antes del contexto en comparación, eliminación del antetítulo de carta futura y atribución de IA debajo del nombre en el informe. Se aplicaron en `c9bf16a` y se volvieron a revisar comparación/carta en escritorio y móvil y las cuatro páginas del PDF. Dictamen de corrección: **ship**, sin regresiones observadas en esos ajustes. Es un cierre de la interfaz local, no una aceptación del usuario ni una aprobación académica.

No se conservó la tarjeta original QUALITY BAR de la exploración; el revisor lo explicitó y evaluó contra la dirección elegida por el usuario y las referencias observadas. No se afirma haber superado una tarjeta ausente. El detector léxico se ejecutó una única vez sobre una versión anterior (`6a75d18`); sus tres observaciones de nombres `violet` no describen por sí solas el color renderizado, porque esos alias se reasignan a grises. No es una medición de autoría ni un filtro académico.

## Cómo revisar esta versión

La vista local usa `NEXT_PUBLIC_DEMO_MODE=true` y el directorio de compilación `.next-qa`. En la portada, elegir **Recorrer el ejemplo local** para seguir el recorrido preparado. **Empezar** conserva el destino de registro real; **Chat** conserva la autenticación y no simula una conversación funcional.

La ruta del ejemplo no sirve para demostrar inferencia ni guardado: sus respuestas no generan el resultado mostrado. En una grabación de este recorrido debe decirse expresamente que es una muestra de interfaz con datos ficticios.

La copia de trabajo está en `/private/tmp/umbra-entrega-audit.B6Tyg8/repo`. La rama `codex/stoic-demo` también se guardó en el repositorio original mediante un fetch local. Su árbol de trabajo `/Users/matiasvelez/Developer/umbra` continúa en `beta`; sus cambios ML no se han mezclado con este rediseño. Las capturas y demás evidencia de QA permanecen en la copia temporal: conservarlas antes de eliminar esa copia.

## Pendiente antes de una demo integral para la entrega

1. Verificar con una cuenta de prueba y datos sintéticos identificados el acceso, consentimiento, análisis ML, generación, persistencia, chat y controles de datos en el entorno acordado.
2. Revisar la regeneración en `app/api/narrative/route.ts`: la ruta preexistente elimina la narrativa persistida antes de completar la siguiente y puede guardar texto parcial ante una falla. La interfaz conserva la lectura anterior solo mientras permanece montada; no corrige la persistencia del servidor.
3. Contrastar las afirmaciones preexistentes del consentimiento sobre ubicación de datos, acceso y retención del proveedor con la configuración y términos reales. Esta intervención no modificó texto/hash ni valida cumplimiento legal.
4. Cerrar la matriz de requisitos del CAE, documento, código y evidencia, y preparar un guion que Matías comprenda. Un rediseño visual y pruebas locales no prueban que la tesis esté aprobada ni que la app esté íntegramente lista para grabar con servicios reales.

No se desplegó, no se cambió de rama el árbol original, no se usaron proveedores de IA reales y no se promete aprobación del CAE ni evasión de Turnitin.

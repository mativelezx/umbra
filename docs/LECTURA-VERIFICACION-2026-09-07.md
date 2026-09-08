# Lectura, glosario y PDF: verificación local

Trabajo del 7 de septiembre de 2026, posterior al rechazo del lettering y del informe anteriores. Fuente de trabajo preservada: /private/tmp/umbra-entrega-audit.B6Tyg8/repo. No se modificó el repositorio original ni se regeneraron lecturas personales.

## Cambios

- Siglas Jung explicadas dentro de narrativa, fundamentos de actividades, respuestas del chat y vista simbólica. Hover, foco, toque, Escape y cierre exterior. Los pronombres y conjunciones habituales no se expanden como funciones. Las definiciones son generales, no afirmaciones sobre una persona.
- Índice con nombres de capítulos, cinco diagramas contextuales, citas y negritas del contenido recibido, copiar la sección y posición real de desplazamiento. No hay un puntaje de comprensión ni se registra que la persona haya leído.
- Lettering en minúsculas basado en Young Serif libre, con licencia y origen; isotipo independiente conservado. Ilustraciones de caminata, comida, escritura y conversación en actividades. La línea inferior representa únicamente casilleros completados, sin nuevas métricas.
- Cortina de papel de 960 ms sobre el contenido, no sobre la navegación. Se cancela al enfocar o tocar, al ocultar la pestaña, al imprimir y con movimiento reducido. No se modifica la velocidad del scroll.
- PDF A4 con portada, lectura íntegra, explicación de Big Five, diccionario de las ocho funciones, valores simbólicos identificados y actividades con casilleros de papel. Sin barras vacías para estimaciones no válidas. El ancho es independiente del dispositivo. Notas y números de página.
- Prompts de nuevas narrativas y planes: explicar las siglas y evitar presentar cifras Jung como capacidades o debilidades. Los textos históricos se conservan con contexto explícito; no se hicieron nuevas llamadas pagas.

## Evidencia observada

- Typecheck y lint sin errores. Suite completa: 290 tests en 51 archivos. Pruebas específicas posteriores al ajuste de foco: 18/18.
- Build final real local `j1ASCn-CLtvZzo2IMUAuz`, con modo sintético desactivado, en `.next-reading-candidate`. Probada en 3024 y activada en 3000. PID observado: 52447. Inicio y login respondieron HTTP 200; los 4 checks reales locales de autenticación/transiciones volvieron a pasar en 3000. La build `nbhxY4iEjW_1zppbLf4WD` fue un candidato intermedio, no el cierre.
- E2E sintético: 12 checks de recorrido, cuatro anchos (390, 768, 1292 y 1440), accesibilidad axe, PDF habitual y extenso, en Chromium/WebKit. Glosario: otros 2 checks aprobados tras corregir dos selectores del propio test. Sin POST a las APIs de generación.
- E2E real local: 4/4 checks de autenticación y continuidad del formulario, dos motores y dos anchos. Se observó la animación nativa del pseudoelemento; duración 960 ms, navegación estable y movimiento reducido sin reproducción. No se guardaron los borradores del formulario.
- PDF descargado y renderizado con Poppler: 7 páginas del ejemplo habitual y 9 del caso extendido. Revisión visual final de las 16 páginas. Se corrigieron una página en blanco, un encabezado huérfano, separación de acciones/casilleros y la confusión de «Si ninguna» con la función Si. Tras la última corrección de margen se repitieron 4/4 checks de PDF y recorrido sintético en ambos motores.
- Salud del servicio ML: ok=true y model_loaded=true. No se volvió a entrenar ni evaluar el modelo en esta intervención de interfaz.
- Detector Impeccable ejecutado una vez: 73 avisos advisory sobre documentación/tokens y 2 advertencias por líneas editoriales de 3 px en el PDF. Las dos líneas se retiraron y la revisión independiente cerró con `ship / remaining clear` dentro del alcance inspeccionado. No equivale a una certificación de diseño ni a aceptación de Matías.

## Límites

El diseño no agrega validación psicométrica, ni garantiza aceptación del CAE. La referencia Stoic orienta el lenguaje visual; no hubo comparación 1:1 ni comp aprobado. El PDF conserva el método de exportación mediante imagen: no es un PDF etiquetado para lector de pantalla. Las capturas y los PDFs de prueba usan datos sintéticos. El documento de tesis y su revisión de autoría no fueron modificados en este cambio.

Revisión visual independiente y activación local: cerradas. La aceptación visual de Matías sigue pendiente. Se conserva la build anterior `.next-stoic-candidate` para volver atrás sin borrar fuentes ni datos.

## Artefactos del cierre

En `/Users/matiasvelez/Documents/Umbra-Reentrega-2026-09-07/`:

- `Umbra_Codigo_Lectura_2026-09-07.zip`: 334 archivos de fuente seleccionados, 342 archivos de contenido contando las guías. Licencia Young Serif y guía de diseño incluidas. CRC y control de patrones de secretos correctos; el control no equivale a una auditoría integral de privacidad. El SHA-256 final queda en `MANIFIESTO-ENTREGA.json`. No se repitió una instalación desde cero de este incremento.
- `INFORME_UMBRA_EJEMPLO.pdf`: 7 páginas con datos ficticios de Ana Demo, no tesis ni lectura personal. SHA-256 `57cf935bf2234681821b73cb53967069dc976245416943290aa50f7576c4409f`.
- Word/PDF de tesis y checkpoints de código anteriores conservados. Ningún despliegue remoto en este cierre.

# Experiencia visual y cuaderno personal: verificación local

Incremento del 7 de septiembre de 2026 sobre la copia preservada `/private/tmp/umbra-entrega-audit.B6Tyg8/repo`. Alcance: interfaz web y PDF que genera la app. No se modificó la tesis, el modelo ni los relatos guardados de la cuenta usada por Matías.

## Cambios observables

- Apertura personal negra en el resultado, con tres hojas ilustradas que conectan relato, interpretación y actividad. Ciclo de ocho segundos con pausa explícita, suspensión fuera de pantalla o con pestaña oculta y respeto por movimiento reducido.
- Diagramas de capítulos con gestos propios, ilustraciones de actividades que reaccionan a interacción y marcador vinculado al desplazamiento real. No se altera la velocidad del scroll ni se inventa un puntaje de lectura.
- La cortina parcial de 960 ms fue retirada. La transición actual vive directamente en el documento y cubre todo el viewport: negro, símbolo que se abre y palabra «umbra» que aparece, en 1240 ms. Se cancela con interacción, foco, pestaña oculta, impresión y movimiento reducido; la navegación y los formularios no se recrean.
- Glosario: Escape cierra la explicación sin que el cursor la reabra inmediatamente. Sigue funcionando con foco y toque. El índice usa un icono Phosphor, no glifos de texto.
- Informe orientado a la persona: portada negra, guía de lectura, contenido guardado íntegro, símbolos y ejemplos cotidianos de las ocho funciones de Jung, actividades ilustradas y espacio para notas. Los ejemplos generales no se presentan como inferencias individuales.
- La vista previa del informe es blanca, sin reborde ni relleno oliva. A4 mantiene su ancho en móvil con desplazamiento horizontal indicado. Los valores sin validación siguen sin mostrarse como resultados individuales fiables.

## Verificación

- 294/294 pruebas de aplicación en 52 archivos; lint y TypeScript sin errores. `git diff --check` del alcance limpio. No se agregaron dependencias.
- 12/12 checks sintéticos en Chromium y WebKit: lectura, glosario, actividades, movimiento/pausa/reduced-motion, dimensiones móviles/escritorio, axe en las superficies seleccionadas y descarga real del PDF. Esto no certifica accesibilidad de toda la app.
- Tras el ajuste final de espaciado de impresión se repitieron 4/4 checks de recorrido/PDF en ambos motores. Informe habitual: 9 páginas A4; variante extensa: 11. Se renderizaron con Poppler y se revisaron las 20 páginas finales. Sin hojas vacías, títulos aislados ni contenido descartado. Los archivos anteriores de revisión no son los definitivos.
- Las capturas de la transición fijan su instante medio para inspeccionar cobertura; no se presentan como prueba de reproducción nativa. Esta se verifica por separado en `e2e/workspace-motion.spec.ts` con autenticación local.
- Compilación de producción real local: `4_c2CSU2ObXCgmJdteoge`, distribución `.next-personal-candidate`, sin modo de ejemplo sintético. Activada en `http://localhost:3000`, PID observado `52921`. Inicio HTTP 200 y build ID cotejado en el HTML. Los 4/4 checks de ingreso y movimiento nativo pasaron tanto en 3024 como repetidos en 3000, en Chromium/WebKit a 390/1440 px. Borradores del formulario sin guardar; sin leer ni exportar narrativas personales.
- 7/7 tests del empaquetador. La instalación desde cero del nuevo incremento no se repitió.
- Servicio ML respondió `ok: true`, `model_loaded: true`. No hubo reentrenamiento ni revalidación, llamadas pagas de Anthropic, compras, cambios de cuenta o migraciones en este incremento.

## Revisión de diseño y límites

Impeccable orientó el movimiento controlable y la continuidad de la experiencia. La revisión visual independiente cerró `ship / remaining clear` sobre los defectos y capturas acordados, tras corregir paginación, centrado de siglas, icono del índice, captura móvil, cobertura de transición y marco del informe. La aceptación visual de Matías sigue pendiente; no es aprobación académica ni certificación de toda la app. Stoic es referencia de dirección, no una comparación 1:1 ni un comp aprobado.

El detector de Impeccable se ejecutó una sola vez; la salida excedió el presupuesto de lectura. No se declara un escaneo limpio ni una revisión completa de todos sus avisos. El control de procedencia existente encontró una imagen raster con procedencia y ninguna sin ella; este incremento sólo agrega SVG propios. Se actualiza el sistema de diseño existente mediante mezcla, no sustitución.

El PDF conserva la exportación por imagen: el cuerpo no es texto seleccionable ni PDF etiquetado para lector de pantalla. El informe sintético entregado no es una lectura personal ni el documento de tesis. No se publicó ni subió ningún archivo a Canvas o a un servidor remoto.

Los candidatos 3023/3024 se detuvieron tras la activación; sólo 3000 quedó escuchando entre esos puertos. Se conserva `.next-reading-candidate` para volver atrás. Los procesos no tienen arranque automático después de reiniciar el equipo.

## Copia de entrega

El ejemplo final se conserva fuera de la carpeta temporal como `INFORME_UMBRA_PERSONAL_EJEMPLO.pdf`, en `/Users/matiasvelez/Documents/Umbra-Reentrega-2026-09-07`. SHA-256: `ef7aa296db7e42ae17b40af7a6be6b0fd1be1026f2742badb0b2fecc8302c1c8`. Los informes anteriores y el Word/PDF académico se conservaron. El código de este incremento se identifica como `Umbra_Codigo_Experiencia_2026-09-07.zip`; el manifiesto externo registra el hash y el alcance de verificación final del paquete.

ZIP creado con 339 fuentes seleccionadas y 347 archivos de contenido, guías incluidas; CRC y escaneo de patrones de secretos correctos. SHA-256: `ed8250c3481d11770eec5cd36ed82be2851e25ac1f2caa54272b9359701d6f81`. Guía de diseño y sidecar actualizados antes de empaquetar. No se repitió una instalación desde cero ni se entregaron credenciales, cachés o datos de cuentas. La comprobación de patrones no es una auditoría integral de privacidad.

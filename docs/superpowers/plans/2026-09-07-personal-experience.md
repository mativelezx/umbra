# Experiencia visual y cuaderno personal

Alcance autorizado: UI/UX web escritorio/móvil y PDF que genera la app. Continuar sobre el clon de entrega; conservar localhost:3000 hasta verificar el candidato. Datos: fixture Ana Demo para capturas y PDF; autenticación real local sólo para continuidad, sin regenerar lecturas ni guardar datos personales. Sin cambios de ML, Supabase, tesis o dependencias.

Dirección: ampliar tinta y papel, Bricolage y marca aprobada como punto de partida, con mayor contraste negro. La observación del usuario de que sigue demasiado estático prevalece sobre el cierre visual anterior.

- Foco: una apertura negra donde tres hojas se despliegan, representando historia, interpretación y acción. Animación repetible, con pausa explícita, detenida fuera de pantalla/pestaña y con movimiento reducido.
- Continuidad: por indicación posterior del usuario, retirar la cortina parcial y usar un interludio de marca a pantalla completa de 1240 ms, en portal al body. Símbolo y wordmark animados, cancelación inmediata al interactuar. Conservar lector por capítulos, foco y scroll nativo. Gestos distintos del libro, camino, tensión, valores y puerta; no mover párrafos mientras se leen.
- Feedback: tinta al seleccionar un capítulo, símbolos al interactuar y actividad/progreso respondiendo a casilleros reales. No simular indicadores del modelo.
- Presupuesto: SVG/CSS existentes y observadores de visibilidad; sin nuevas dependencias, canvas pesado o temporizadores por cuadro para decoración. Sin movimiento en PDF.
- PDF: portada personal negra, guía de lectura, ejemplos de siglas, pictogramas de dimensiones y actividades, preguntas de reflexión y espacio para escribir. Eliminar el reborde oliva del preview a pedido posterior: hoja blanca sin padding ni borde coloreado. Preservar todo el texto guardado y los límites del modelo. PDF habitual/extenso, Chromium/WebKit, render completo.

Gate: tests, tipos, lint, build aislada; capturas escritorio/móvil, teclado/reduced-motion, axe; revisión independiente fresca y documentación del sistema. Aceptación visual final de Matías, no aprobación académica.

Ejecución: implementación y verificaciones cerradas; revisión independiente `ship / remaining clear`. Build `4_c2CSU2ObXCgmJdteoge` activa en 3000, candidatos detenidos. 294 tests, 12 checks sintéticos y 4 repeticiones de PDF; 4 checks reales locales repetidos en 3000. PDF final 9/11 páginas de ejemplo/variante extensa. Detalle y límites en `docs/EXPERIENCIA-VERIFICACION-2026-09-07.md`.

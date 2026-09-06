# Umbra — dirección de marca e interfaz para la demo

Fecha: 6 de septiembre de 2026.
Estado: dirección aprobada por Matías el 6 de septiembre de 2026: «dale para adelante con stoic direcatmaente dale con la interfaz y lo revisamos». Construcción directa en código autorizada; revisión visual del resultado pendiente.

## Decisiones confirmadas

- Recorrido principal: consentimiento → preguntas → resultado experimental comprensible → actividad de reflexión. Chat complementario.
- Redefinir branding e interfaz sin sumar funciones ni complejidad arquitectónica.
- Objetivo de marca: autoconocimiento y reflexión, dentro del campo de bienestar no clínico.
- Referencia principal: Stoic, elegida por Matías al observar sus pantallas en Mobbin.
- Mantener Umbra como nombre. No se pidió renombrar el proyecto.
- El requisito de software funcional y preparado para grabar sigue abierto: esta investigación no lo resuelve ni reemplaza.

## Fuentes e inspección

Acceso a Mobbin mediante sesión existente en navegador. Solo lectura; no se guardaron referencias en la cuenta, descargaron bibliotecas ni copiaron capturas o activos al repositorio. Las notas siguientes son análisis transformado, no reproducción de pantallas. Las capturas examinadas son las versiones archivadas por Mobbin, no pruebas ejecutadas dentro de esas aplicaciones.

| Fuente y superficie examinada | Observación | Adaptación propuesta para Umbra | Límite |
| --- | --- | --- | --- |
| [Headspace: ingreso](https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e) | Se observaron bienvenida, registro, selección de objetivo y explicación de la siguiente etapa. Acción principal estable y selección distinguible por texto y marca. | Una pregunta visible, selección explícita, botón de avance predecible y explicación breve de lo que sigue. | No copiar personajes, paleta, secuencia exacta, suscripción ni afirmaciones de eficacia. No se afirma haber ejecutado el flujo completo. |
| [Stoic: pantallas](https://mobbin.com/apps/stoic-ios-621f0be7-8046-45cd-b667-97add5f9c3c7/e20c833d-975b-401c-8601-74d135883e25/screens) y [flujos](https://mobbin.com/apps/stoic-ios-621f0be7-8046-45cd-b667-97add5f9c3c7/e20c833d-975b-401c-8601-74d135883e25/flows) | Se observaron portada, inicio, opciones de reflexión matutina, pregunta sobre descanso y presentación explícita de prestaciones con IA. Predominan superficies claras, contraste negro/blanco, títulos directos y bloques con una tarea reconocible. | Separar responder, leer y elegir actividad; jerarquía tipográfica breve; controles legibles; intervención de IA identificada junto al texto correspondiente. | No copiar el pájaro, el monograma, sus ilustraciones, textos, rachas ni estructura exacta. No adoptar seguimiento de salud o nuevas métricas. |
| [Oura: pantallas destacadas](https://mobbin.com/apps/oura-ios-a3164d3a-474c-4ecb-8180-67acda881aa6/601b4b29-6c80-4544-8c4f-28e8c9a8f0bc/screens) | Se observaron identificación de una fuente de datos, selección de actividad, datos de actividad y un chat que advierte posibles errores. | Explicar de dónde sale cada bloque de resultado y hacer visible el límite de la interpretación. | Umbra no posee sensores ni evidencia equivalente. No adoptar puntuaciones de salud, anillos de precisión, biometría ni promesas de recuperación. |

Fuentes públicas complementarias: [Stoic](https://www.getstoic.com/) y [Day One](https://dayoneapp.com/) muestran el diario como tarea central. Day One explica exportación y controles de privacidad; no trasladar sus afirmaciones de cifrado de extremo a extremo a Umbra, cuyo contrato técnico es distinto.

También se consultaron dos casos de branding publicados por sus autores: [BRINK-BERLIN, Adam Cayir](https://www.adamcayir.com/brink-berlin) y [the WELL, AFOTIK](https://www.afotik.com/portfolio/the-well). Sirven como contraste entre un lenguaje tipográfico austero y uno sensorial. the WELL se declara marca conceptual; ninguno constituye evidencia de eficacia sobre el bienestar. La preferencia posterior de Matías por Stoic cierra la búsqueda de otra dirección estética.

## Lectura del problema actual

`tailwind.config.ts`, `app/globals.css` y `docs/DESIGN_SYSTEM.md` describen o implementan un mundo oscuro/violeta con brillos, transparencias y títulos cursivos. El documento anterior incluso prioriza profundidad sobre claridad. Esa dirección ya no se toma como autoridad visual para el rediseño pedido.

La auditoría y revisión de la rama candidata identificaron etiquetas pequeñas, navegación parcialmente en inglés y una presentación porcentual de certeza no respaldada como precisión individual validada. Estos problemas requieren diseño y lenguaje, no solo sustituir colores.

## Propuesta: Umbra como espacio personal de reflexión

Esta es una aplicación propia de los principios observados en Stoic, no una réplica.

### Marca

- Nombre: **Umbra**.
- Frase de presentación propuesta: **Un espacio para mirarte con atención.**
- Explicación funcional: **Respondé preguntas sobre vos, explorá una lectura experimental y elegí una actividad para reflexionar.**
- Voz: cercana y concreta, con voseo; explicar siglas cuando aparecen. No presentarse como terapeuta ni como autoridad sobre quién es la persona.
- Firma visual propuesta: palabra Umbra con un símbolo geométrico propio derivado de una U abierta y una pequeña zona de sombra. Debe funcionar en un color y a tamaño pequeño. Se aprobará en el boceto, sin iconografía prestada.

### Apariencia

- Modo claro como propuesta principal: fondo gris muy claro, superficies blancas y texto grafito; el acento cromático queda mínimo y no determina estados por sí solo.
- Una familia sans legible con jerarquía por tamaño y peso; títulos sin cursivas, cuerpo cómodo de leer y etiquetas sin mayúsculas diminutas espaciadas.
- Márgenes generosos y agrupaciones sobrias. Reservar las tarjetas para contenido con una unidad funcional, no envolver cada fragmento.
- Iconos de la familia ya instalada y decoraciones originales mínimas. Sin mascota nueva, animación continua, partículas, esferas luminosas ni recursos 3D.
- Movimiento breve únicamente para cambios de estado; la información permanece disponible con movimiento reducido.

### Recorrido

1. **Ingreso:** explicar qué es Umbra y qué recibirá la persona; acceso y consentimiento con lenguaje funcional.
2. **Preguntas:** una pregunta protagonista, instrucciones persistentes, avance veraz y respuesta conservada ante errores cuando el sistema lo permita. No simular progreso de análisis.
3. **Resultado:** comenzar por la lectura y sus límites. Separar explícitamente estimación experimental, interpretación generada por IA y actividades propuestas. Eliminar de la presentación el porcentaje de certeza no calibrado; no inventar métricas sustitutivas.
4. **Actividad:** una próxima acción clara con detalle opcional; conservar las actividades existentes, sin agregar rachas ni premios.
5. **Informe:** exportación legible y coherente con la pantalla, con la misma explicación de límites.

Nombres de navegación propuestos, conservando rutas: **Mi resultado · Actividades · Chat · Informe**; cuenta en el control de perfil. Su aplicación y la ubicación definitiva se confirman en el diseño. No usar nombres poéticos como únicas instrucciones operativas.

### Primera pantalla que debe probar la dirección

La pantalla de resultado es la prueba principal del sistema visual: marca y navegación discretas, título breve, contexto del análisis, lectura en una columna de ancho cómodo y una acción clara para ver las actividades. Los detalles técnicos se despliegan sin ocultar el carácter experimental. En móvil, orden lineal y acciones alcanzables; sin forzar el encabezado a competir con un botón lateral.

## Implementación autorizada

Reutilizar Next.js, Tailwind y componentes existentes. Secuencia: fundaciones compartidas → navegación → preguntas → resultado → actividades → exportación. Evitar una segunda aplicación, una nueva biblioteca de componentes o una pantalla falsa solo para grabar.

La base candidata es `entrega-tribunal` en `c3fff06`; preservar el árbol `beta` y sus cambios ML. Resolver la implementación en un entorno aislado antes de integrar.

Matías eligió construir directamente la interfaz y revisarla: `buildPath: code`. Se trabaja en la copia aislada de `entrega-tribunal`, rama `codex/stoic-demo`, sin alterar el árbol original `beta`, sus cambios ML ni producción.

## Criterio de listo para grabar

- Diseño elegido y aplicado coherentemente a las pantallas del recorrido.
- Pruebas estáticas y automatizadas relevantes aprobadas, más revisión visual en escritorio y móvil.
- Cuenta de prueba y contenido sintético identificados; autenticación, consentimiento, inferencia ML, narrativa, persistencia, actividades y PDF comprobados con servicios reales en el entorno acordado.
- Carga, resultado no disponible y error permiten entender lo ocurrido y cómo continuar.
- Guion consistente con el comportamiento observado y con las limitaciones que declara la tesis.
- Separar qué quedó verificado, qué utiliza un mecanismo local de desarrollo y qué no forma parte de la demostración. No anunciar aprobación CAE ni validación clínica.

## Registro del proceso de diseño

Impeccable: exploración de dirección `29378ec1`, modo Operate. La preferencia explícita del usuario por Stoic prevalece sobre la asignación exploratoria. No se presentan alternativas ajenas a esa preferencia ni se toma el sorteo como aprobación humana. La consulta accidental de ayuda generó antes una exploración de superficie sin contexto (`033426b1`), que no se utiliza para decidir este rediseño.

La fase de investigación no modificó software. La implementación posterior se registra en `docs/superpowers/plans/2026-09-06-stoic-ui.md`. No se autoriza cambiar prompts, modelos, políticas, datos ni despliegues. La aprobación de la dirección no constituye aceptación visual del resultado ni autorización para grabar un recorrido real sin verificar servicios.

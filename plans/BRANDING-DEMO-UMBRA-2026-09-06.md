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

Acceso a Mobbin mediante sesión existente en navegador. Solo lectura; no se guardaron referencias en la cuenta, descargaron bibliotecas ni copiaron capturas o activos al producto. Las notas siguientes son análisis transformado, no reproducción de pantallas. Las capturas examinadas son las versiones archivadas por Mobbin, no pruebas ejecutadas dentro de esas aplicaciones. La segunda revisión conserva capturas de referencia únicamente en el directorio de QA ignorado, para contrastar el resultado; no se distribuyen como recursos de Umbra.

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

### Revisión pedida durante la implementación

Matías observó que la primera versión resultaba demasiado austera y pidió «la misma fuente, más SVGs, vectores, animaciones». Se verificó el 6 de septiembre de 2026 que el sitio oficial de Stoic declara `Visuelt Pro` (pesos 400, 500 y 700) en los estilos calculados de su navegación, títulos y párrafos. Esto verifica la web, no identifica la fuente de las capturas nativas de Mobbin. Visuelt se comercializa con licencia; no se descargaron sus archivos.

Matías aprobó después «usa una similar gratis pero así estilada». Se selecciona **DM Sans**, distribuida por Google Fonts con SIL Open Font License, como interpretación cercana, no como fuente idéntica. Carga con el mecanismo Next/font existente; sustituye a Inter, no agrega una segunda familia. Ajustar títulos compactos, cuerpo legible y jerarquía consistente.

La revisión amplía la expresión gráfica dentro de la misma dirección: vectores geométricos originales de luz, sombra y reflexión en portada, elección de entrada, resultado y actividades. No se copia el pájaro ni los activos de Stoic. Un movimiento de composición finito en portada y transiciones breves de selección, avance y tarea completada; sin bucles, nuevas dependencias ni demoras obligatorias. Con movimiento reducido la geometría permanece estática y la confirmación de estados sigue visible. Los flujos, límites académicos, datos sintéticos y controles de privacidad no cambian.

Fuentes de tipografía: [sitio oficial de Stoic](https://www.getstoic.com/), [Visuelt — distribuidor oficial](https://www.myfonts.com/collections/visuelt-font-colophon-foundry), [DM Sans](https://fonts.google.com/specimen/DM+Sans), [licencia de DM Sans](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt).

### Segunda revisión visual solicitada

Matías pidió después el logo `umbra` en minúsculas, un hero oscuro, fluido y animado que muestre el alcance de la app, y trasladar los patrones de Stoic a toda la experiencia. Esto reemplaza la primera portada clara, no el alcance funcional ni los límites académicos. La identidad visible del logo pasa a minúsculas; el nombre del proyecto en prosa continúa siendo Umbra.

Nueva inspección visual directa de Mobbin, 6 de septiembre de 2026:

| Referencia observada | Patrón que se traslada | Superficie Umbra |
| --- | --- | --- |
| [Today](https://mobbin.com/flows/b72044fc-f724-4356-9805-2a17626668bd) | Encabezado compacto, acción principal oscura y módulos claros de distinto énfasis; navegación inferior discreta sin grandes bloques activos. | Resultado y navegación compartida. Sin calendario, rachas o métricas nuevas. |
| [Reflexión matutina](https://mobbin.com/flows/3c1b50df-db4c-4db4-ab62-8c334a0adbd6) | Una tarea central, avance segmentado, espacio limpio para responder y control de continuidad claro. | Preguntas existentes, incluida lectura por teclado y estados de recuperación. |
| [Library](https://mobbin.com/flows/c5ea06fa-93c5-4b43-ba3f-a5c03b79e87c) | Colección de piezas claras y oscuras, jerarquía entre propuesta y detalle. | Actividades existentes. No agregar biblioteca, búsqueda ni funciones de meditación. |
| [Journey](https://mobbin.com/flows/f338c549-c18a-45db-81f1-12819c1eadfa) | Resumen oscuro reconocible, contenido de lectura claro y listas agrupadas. | Resultado y su lectura, distinguiendo fuentes y límites. No inventar historial o estadísticas. |
| [Profile](https://mobbin.com/flows/eee28256-463d-467a-85da-a28fa4a20ddd) | Filas de configuración agrupadas sobre fondo claro, acciones de cuenta localizables. | Cuenta y derechos de datos, sin cambiar contratos. |
| [Lectura asistida por IA](https://mobbin.com/flows/a84f10c7-df4b-4efa-add8-7d7f8438196d) | Editor despejado, contexto visible y acciones próximas al contenido. | Chat y texto de reflexión existentes. No copiar mentores, gradientes ni nuevas funciones. |

El sitio oficial muestra una gran composición editorial de diario y tipografía compacta. La nueva portada de Umbra adopta esa presencia, con el contraste oscuro y fluidez solicitados expresamente: geometría/ondas originales en movimiento, contenido legible, controles para pausar cualquier movimiento continuo y alternativa estática con movimiento reducido. Mostrar preguntas, lectura experimental, actividades, chat e informe sin aparentar que una vista ilustrativa es un análisis real. No descargar ni reutilizar ilustraciones o fuentes propietarias de Stoic.

### Revisión de tipografía e ilustración

Al revisar la nueva portada, Matías pidió otra fuente con más personalidad y más ilustraciones de lo que hace la aplicación. Se reemplaza DM Sans por **Bricolage Grotesque**, manteniendo una sola familia con pesos de lectura e interfaz y ajuste óptico automático. Se verificaron la muestra y la licencia SIL OFL en el [sitio de Atelier Triay](https://ateliertriay.github.io/bricolage/) y en el [repositorio oficial de la fuente](https://github.com/ateliertriay/bricolage). Su carácter más expresivo es una elección visual para Umbra, no una atribución tipográfica a Stoic.

Los vectores pasan de arcos abstractos a escenas propias de tinta y papel: cuaderno y lápiz para responder, persona y página para explorar una lectura, caminata para actividades y hojas para el informe. Se reutiliza una familia de SVG en el ejemplo de portada, la explicación del recorrido y las pantallas interiores; no se crean métricas, servicios ni funciones por ilustrarlos. La animación ambiental del hero mantiene pausa, suspensión fuera de pantalla y movimiento reducido.

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

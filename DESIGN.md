---
name: umbra
description: "Un espacio personal de reflexión: tinta, papel y acciones concretas."
colors:
  text-1: "#242424"
  text-2: "#53534F"
  text-3: "#62625C"
  text-4: "#696962"
  umbra-void: "#F7F7F4"
  umbra-abyss: "#FFFFFF"
  umbra-fog: "#F0F0EB"
  umbra-shadow: "#E6E6E0"
  umbra-mist: "#DEDED8"
  control-stroke: "#4B4B47"
  landing-ink: "#171918"
  landing-paper: "#f2f1eb"
  landing-muted: "#bcbfb8"
  landing-line: "#d9dbd4"
  landing-body: "#555951"
  accent-emerald: "#34624D"
  accent-amber: "#805720"
  accent-rose: "#A13D3D"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(3.6rem, 6.35vw, 6rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
rounded:
  sm: "8px"
  md: "14px"
  lg: "16px"
  full: "9999px"
spacing:
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.text-1}"
    textColor: "{colors.umbra-abyss}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1.25rem"
  button-secondary:
    backgroundColor: "{colors.umbra-abyss}"
    textColor: "{colors.text-1}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1.25rem"
  button-ghost:
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1.25rem"
  button-danger:
    backgroundColor: "rgba(161, 61, 61, 0.9)"
    textColor: "{colors.umbra-abyss}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1.25rem"
  input:
    backgroundColor: "rgba(230, 230, 224, 0.5)"
    textColor: "{colors.text-1}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  card:
    backgroundColor: "{colors.umbra-abyss}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  badge-default:
    backgroundColor: "rgba(230, 230, 224, 0.5)"
    textColor: "{colors.text-2}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  navigation-item:
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.75rem"
  example-tabs:
    backgroundColor: "#e4e5de"
    rounded: "{rounded.sm}"
    padding: "4px"
---

# Design System: umbra

## Overview

**Creative North Star: "Un espacio personal de reflexión"**

Umbra se presenta como un cuaderno personal de tinta y papel: cercano, expresivo y legible. La marca visible es `umbra`, en minúsculas. Bricolage Grotesque aporta personalidad a títulos compactos; las escenas de escribir, leer y caminar explican acciones reconocibles. Esta dirección aplica los principios de contraste, foco y agrupación elegidos por Matías al revisar Stoic, con identidad e ilustraciones propias.

La portada usa un campo oscuro de contornos fluidos y una vista clara del recorrido. Las pantallas de trabajo conservan fondo claro, paneles de lectura blancos y bloques oscuros de énfasis. Las preguntas, la interpretación experimental y las actividades se distinguen visualmente y mantienen sus límites junto al contenido. La ilustración acompaña; el texto y los controles explican qué hacer.

**Key Characteristics:**

- Tinta grafito y papel claro, con contraste invertido en portada y bloques principales.
- Una familia tipográfica gratuita con personalidad, pesos legibles y ajuste óptico automático.
- Ilustraciones SVG propias de escribir, leer, caminar y guardar un informe.
- Navegación compacta, tareas agrupadas y detalle elegido por la persona.
- Movimiento ambiental controlable y estados comprensibles también sin animación.

Registro derivado del código `c9bf16a`, rama `codex/stoic-demo`, el 6 de septiembre de 2026 (Argentina). Clasificación: documentación del sistema visual; canales: web de escritorio y móvil; datos: ejemplo local sintético. No es una declaración de aceptación visual final, aprobación CAE, validez clínica ni disponibilidad de servicios reales. La evidencia y las limitaciones de QA se registran por separado en [la verificación de la demo](docs/DEMO-UI-VERIFICACION-2026-09-06.md).

Fuentes de implementación: [configuración de Tailwind](tailwind.config.ts), [estilos globales](app/globals.css), [fuente de la aplicación](app/layout.tsx), [estilos de portada](components/landing/Landing.module.css), primitivas en `components/ui/` y navegación en `components/layout/`. Este frontmatter es la extracción normativa para consumidores de DESIGN.md; los cambios futuros deben reconciliarse con esas fuentes. El [sidecar](.impeccable/design.json) agrega comportamiento, muestras y contexto, sin una segunda colección de primitivas. [PRODUCT.md](PRODUCT.md) y la [dirección aprobada](plans/BRANDING-DEMO-UMBRA-2026-09-06.md) aportan las decisiones vigentes; sus revisiones más recientes sustituyen la portada exclusivamente clara, DM Sans y el arte abstracto previo.

## Colors

La paleta combina grises de papel ligeramente cálidos y tinta oscura; el color semántico aparece en estados concretos.

### Primary

- **Grafito de trabajo** (`text-1`): texto principal, botones y bloques interiores con contraste invertido.
- **Tinta de portada** (`landing-ink`): apertura editorial, texto de su vista de ejemplo y pestaña seleccionada.

### Neutral

- **Papel de fondo** (`umbra-void`): lienzo de la aplicación y continuación clara de la portada.
- **Hoja blanca** (`umbra-abyss`): tarjetas, lectura, vista de informe y navegación móvil.
- **Papel suave** (`umbra-fog`): ayudas de ejemplo y mensajes de lectura.
- **Papel de control** (`umbra-shadow`): campos, estados de interacción y marcas móviles.
- **Línea de papel** (`umbra-mist`): bordes y separación discreta.
- **Grafitos secundarios** (`text-2`, `text-3`, `text-4`): explicación, metadatos y apoyo; conservan su rol contextual, no sustituyen el texto de una acción.
- **Trazo de control** (`control-stroke`): valor actual del alias `violet-400`; se usa con distintas opacidades en bordes y estados.
- **Papeles y texto de portada** (`landing-paper`, `landing-muted`, `landing-line`, `landing-body`): contraste sobre tinta, divisores y texto de apoyo en la composición editorial.

### Estados

`accent-emerald` acompaña confirmaciones y conteos; `accent-amber`, avisos; `accent-rose`, errores y acciones destructivas. Los estados conservan texto, icono o marca además del color. La documentación no crea nuevos estados ni certifica el comportamiento del pipeline de seguridad.

**The Tinta y papel Rule.** El énfasis principal se construye con contraste entre tinta y papel; los acentos de estado conservan su significado funcional.

Los nombres `violet-*` son aliases heredados que ahora resuelven a grises. No definen una marca violeta ni autorizan recuperar el sistema anterior. Los valores locales de la portada se mantienen en su módulo CSS: no se extienden automáticamente a todas las pantallas.

## Typography

**Display Font:** Bricolage Grotesque, con respaldo sans-serif.
**Body Font:** la misma familia. Los aliases `display`, `heading`, `body` y `mono` apuntan a ella; `mono` no constituye una segunda familia monoespaciada.

**Character:** títulos expresivos de ancho normal, peso definido y espaciado compacto; cuerpo directo, sin cursiva ornamental. La carga actual usa `next/font/google`, peso variable y eje `opsz`, con `font-optical-sizing: auto`, `display: swap` y ancho predeterminado (100). El resultado de Next/font se sirve desde la propia aplicación; no hay una fuente propietaria de Stoic incorporada.

La familia gratuita y su licencia SIL OFL están registradas en la [fuente oficial de Atelier Triay](https://github.com/ateliertriay/bricolage) y su [muestra de autor](https://ateliertriay.github.io/bricolage/), examinadas durante la selección tipográfica.

### Hierarchy

- **Display:** título de portada; toma el rol `display` del frontmatter. La composición editorial utiliza una escala fluida, con ajustes específicos en los cortes de portada.
- **Headline:** encabezado principal de las pantallas dentro de `app-content`; la regla compartida prevalece sobre clases de tamaño aisladas. La elección de entrada y el bloque de lectura destacado tienen sus tamaños responsivos propios.
- **Title:** títulos habituales de sección. También aparecen encabezados de bloque de 20 px y títulos destacados de 30–36 px; no se impone una razón matemática que el código no usa.
- **Body:** base de lectura de la aplicación. Los párrafos frecuentes usan interlineado relajado; las descripciones destacadas llegan a 18 px. La portada limita su explicación a 39 caracteres aproximados por línea (`ch`), y los interiores usan contenedores de lectura.
- **Label:** controles y navegación habituales. El tamaño `xs` de Tailwind está elevado a 14 px con interlineado 1.45; no es el `xs` predeterminado de Tailwind.

**The Título primero Rule.** El nombre del contenido encabeza el bloque; la procedencia o atribución se presenta como apoyo cercano y no como un rótulo ornamental que compite con él.

Las notas de portada y los estilos de impresión contienen tamaños locales menores. No se promueven a la escala de controles o cuerpo; deben revisarse en su contexto al modificar esas superficies. Tampoco se convierte la tipografía del PDF en un nuevo sistema global.

## Layout

El shell comparte navegación y contenido. En escritorio desde 1024 px muestra una barra lateral fija de 240 px; el contenido compensa ese ancho y se centra con máximo de 1024 px. Usa margen interior horizontal de 20 px y vertical de 24 px, que desde 768 px pasan a 40 px y 32 px. Los grupos suelen separarse por 24–32 px. La escala de espaciado extraída corresponde a pasos existentes de Tailwind, sin un generador de tokens nuevo.

Debajo de 1024 px la navegación pasa a cuatro destinos inferiores: Mi resultado, Actividades, Chat e Informe. Mi cuenta sigue accesible arriba. El shell reserva 80 px abajo y la barra incluye el área segura del dispositivo. La elección de entrada usa ancho máximo de 768 px y opciones de una columna; ilustración y contenido se adaptan dentro de cada opción.

La portada tiene contenedor máximo de 1280 px, márgenes iniciales de 48 px y una composición de dos columnas. A 1050 px reduce márgenes a 32 px; a 760 px pasa a una columna y márgenes de 20 px. Los tres pasos del recorrido pasan a una secuencia vertical. A 360 px se ajustan título, pestañas e ilustración. Estas medidas pertenecen a la portada; no reemplazan los cortes del shell.

La vista de ejemplo reserva la altura de sus tres paneles superpuestos. Cambiar de pestaña conserva el espacio y evita desplazar las acciones posteriores. La lectura y sus fuentes se agrupan; los detalles del resultado se abren mediante controles explícitos. Las filas de actividad, cuenta y exportación mantienen las acciones junto a su contenido.

## Elevation & Depth

La profundidad procede sobre todo del contraste de superficies, el espacio y los bordes suaves. Las escenas SVG usan siluetas rellenas y trazo para sugerir hojas y figuras. Los contornos de la portada emplean un degradado de opacidad dentro del SVG; esa técnica pertenece al campo ambiental, no a los paneles de lectura.

`Card` es blanco y su variante `glow` agrega el borde claro actual. `GlassCard` también es blanco: su nombre no implica transparencia, desenfoque ni vidrio. El alias `card-lift` solo modifica el color del borde durante el hover; no desplaza la tarjeta. Existe una sombra `glow` en la configuración, sin consumidores encontrados en la superficie revisada: no se promueve a una regla de elevación.

**The Superficie por tarea Rule.** Un bloque oscuro destaca una unidad de trabajo o lectura; los paneles claros y los divisores agrupan su contenido sin añadir elevación ornamental.

## Shapes

Los controles compartidos usan esquinas suaves del rol `md`; tarjetas y paneles usan `lg`. `xl` y el `2xl` predeterminado coinciden actualmente con ese radio de panel. Las formas totalmente redondas se reservan para marcas de estado, badges y controles circulares. El CTA de portada usa `sm`, y sus pestañas internas tienen un ajuste local más pequeño.

La marca `Brand` combina `umbra` con una U abierta y un trazo interior de opacidad reducida, dibujados en SVG con `currentColor`. El símbolo acompaña a la palabra, funciona en un solo color y conserva su nombre accesible. Los iconos operativos siguen la familia Phosphor instalada; las ilustraciones no reemplazan sus controles.

## Components

### Buttons

`Button` es el control compartido. Tiene variantes `primary`, `secondary`, `ghost` y `danger`; sus roles y valores base están en el frontmatter. El tamaño medio tiene altura mínima de 48 px; el pequeño, 44 px; el grande, altura de 48 px y texto de 16 px. El cambio de color dura 150 ms. `loading` deshabilita el botón y conserva la etiqueta junto al indicador; `disabled` reduce opacidad y cambia el cursor.

El foco general usa contorno de 2 px separado 4 px, claro sobre superficie oscura. Los enlaces compartidos de acción tienen altura mínima de 48 px. El CTA de portada invierte la relación papel/tinta, tiene altura mínima de 56 px y una flecha que se desplaza levemente al pasar el puntero; el movimiento reducido anula ese desplazamiento.

### Chips

`Badge` agrupa texto breve con fondo suave, borde fino y forma redonda. Incluye variantes de compatibilidad y estado; `violet` es gris en la implementación actual. No es un control de filtro por sí mismo y no recibe estados interactivos ficticios en la muestra del sidecar.

### Cards / Containers

`Card` usa el padding compartido `6`; `GlassCard` pasa de 24 a 32 px desde el corte medio. Las variantes con borde y las superficies oscuras se componen según la tarea. El resultado destacado, las opciones de entrada, las filas de actividad y el bloque de descarga utilizan esos materiales. No hace falta una tarjeta por cada párrafo.

### Inputs / Fields

`Input` y `Textarea` comparten fondo de papel translúcido, trazo gris y esquinas de control. La etiqueta se vincula al campo; el error modifica el borde y muestra texto con `aria-invalid`. El foco actual cambia borde y fondo y suprime el contorno del campo. Esta es una descripción del control existente, no una exención para omitir foco en otros controles.

`Textarea` permite redimensionar verticalmente y parte de una altura mínima de 160 px. El conteo de palabras permanece textual. Las respuestas seleccionables usan `aria-pressed`, inversión tinta/papel y un desplazamiento de 3 px; con movimiento reducido la selección conserva el contraste y elimina la traslación. La entrada de pregunta mantiene el foco en su encabezado según el flujo existente.

### Navigation

`Sidebar`, `TabBar`, `TopBar` y `LayoutShell` son las fuentes compartidas. El destino activo conserva texto y `aria-current="page"`; en escritorio resalta el icono circular con tinta y el título con peso fuerte. En móvil la marca activa usa papel gris. El enlace para saltar al contenido aparece con foco. Cuenta y cierre de sesión permanecen accesibles en la cabecera cuando corresponden.

### Vista de ejemplo y movimiento

`HeroExperience` muestra Preguntas, Lectura y Actividades como ejemplo estático identificado. Las pestañas tienen `tablist`, `tab`, `tabpanel`, foco itinerante y selección por flechas izquierda/derecha, Inicio y Fin. No rotan automáticamente. Los paneles no seleccionados reservan su lugar pero quedan invisibles y fuera de interacción.

El campo de `FluidField` contiene contornos SVG originales. Su ciclo ambiental solo corre si la persona no lo pausó, el ejemplo está en pantalla, el documento es visible y no hay preferencia de movimiento reducido. Sin `IntersectionObserver` permanece estático. La pausa manual y la reanudación son visibles; con movimiento reducido el control explica ese estado y queda deshabilitado. La alternativa de WebKit para motores sin interpolación de trazados usa una transformación suave bajo los mismos controles.

Las transiciones interiores recurrentes son breves: selección/entrada, confirmación de paso y revelado de ilustración. Los tiempos y curvas están en el sidecar. La regla global de movimiento reducido elimina el revelado y la entrada, reduce animaciones y transiciones, y conserva estados y contenido. El proveedor de Framer Motion respeta la preferencia del usuario. El antiguo helper `LandingReveal` no tiene consumidores actuales y no define la entrada de esta portada.

### Ilustraciones del recorrido

`ReflectionArt` es una familia original de SVG de tinta y papel: `dialogue` dibuja cuaderno y lápiz para responder; `mirror`, una persona leyendo; `steps`, una caminata con sendero y sol; `pages`, hojas para el informe. Los nombres son aliases de implementación, no nuevas funciones del producto. El trazo y los rellenos toman `currentColor`; `--art-paper` permite invertir el papel en fondos oscuros. Los SVG son decorativos (`aria-hidden`, sin foco) y el texto contiguo explica la acción.

Las escenas se reutilizan en la portada y las pantallas interiores. No se distribuyen raster de terceros. Las capturas Stoic guardadas en `.superpowers/sdd/2026-09-06-stoic-ui/references/` son referencias de QA y no activos de producto.

## Do's and Don'ts

### Do:

- **Do** mantener `umbra` en minúsculas en la marca visible y Bricolage Grotesque como familia compartida.
- **Do** empezar los bloques por su título y mantener la procedencia y los límites junto al contenido.
- **Do** reutilizar controles, navegación y escenas SVG existentes antes de crear variantes locales.
- **Do** conservar texto y marcas de estado además del color, con foco y operación por teclado.
- **Do** mantener pausa, suspensión fuera de pantalla y alternativa estática en el campo ambiental.
- **Do** contrastar los cambios de tokens con las pantallas de escritorio y móvil y actualizar este registro desde el código.

### Don't:

- **Don't** recuperar la paleta violeta, las transparencias o las fuentes anteriores a partir de nombres heredados.
- **Don't** copiar la identidad, tipografía propietaria, ilustraciones, textos o capturas de Stoic al producto.
- **Don't** usar ilustración, animación o una figura simbólica como evidencia de análisis real o validación clínica.
- **Don't** convertir notas pequeñas, estilos locales del PDF o helpers sin consumidores en reglas generales.
- **Don't** agregar funcionalidades, métricas o capas de tokens que el recorrido y la implementación no contienen.

No se canonizan como reglas futuras los rótulos pequeños aislados de portada/PDF, los aliases de efectos antiguos ni la sombra sin uso: son límites o compatibilidad de esta implementación, no decisiones para extender a otras pantallas.

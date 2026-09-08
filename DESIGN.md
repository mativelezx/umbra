---
name: umbra
description: "Reflexión sobre situaciones cotidianas: marco grafito, papel y lectura a tu ritmo."
colors:
  text-1: "#242424"
  text-2: "#53534F"
  text-3: "#62625C"
  text-4: "#696962"
  muted-paper: "#c4c4bc"
  reading-ink: "#45453f"
  personal-ink: "#1c201b"
  personal-paper: "#f4f3ec"
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
    fontSize: "clamp(3rem, 5.4vw, 5.2rem)"
    fontWeight: 600
    lineHeight: 1.045
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  reading-title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(1.8rem, 3vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.12
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
  reading:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
rounded:
  sm: "8px"
  focus: "12px"
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
    textColor: "{colors.muted-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.focus}"
    padding: "14px 12px"
  navigation-item-active:
    backgroundColor: "{colors.umbra-void}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.focus}"
    padding: "14px 12px"
  focus-button:
    backgroundColor: "{colors.text-1}"
    textColor: "{colors.umbra-void}"
    rounded: "{rounded.focus}"
    padding: "12px 20px"
  reading-panel:
    backgroundColor: "{colors.umbra-abyss}"
    textColor: "{colors.text-1}"
    padding: "24px 20px"
  activity-tile:
    backgroundColor: "{colors.umbra-abyss}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.md}"
  example-tabs:
    backgroundColor: "#e4e5de"
    rounded: "{rounded.sm}"
    padding: "4px"
---

# Design System: umbra

> Estado: registro de implementación actualizado el 7 de septiembre de 2026, incluida la extensión personal de lectura y PDF. Stoic es la referencia elegida por Matías; `29378ec1` es un identificador heredado, no una semilla aleatoria corroborada, un comp ni una aprobación visual. DESIGN.md y `.impeccable/design.json` describen el código actual. La revisión independiente cerró `ship / remaining clear` para los defectos y capturas acordados; la aceptación visual de Matías sigue pendiente.

## Overview

**Creative North Star: "Un espacio personal de reflexión"**

Umbra se presenta como un cuaderno personal de tinta y papel: cercano, expresivo y legible. La marca visible combina `umbra` en Young Serif Regular, convertida a contornos SVG con espaciado óptico, y un isotipo independiente de dos aperturas desplazadas sin formar letras. Bricolage Grotesque se conserva para los títulos y el texto de la interfaz. La composición aplica los principios de contraste, foco y agrupación elegidos por Matías al revisar Stoic Today y Library, con ilustraciones originales y la procedencia tipográfica declarada.

La portada usa un fondo oscuro, un libro ilustrado animado y una vista clara del recorrido. En el interior, un marco grafito continuo reúne navegación y cabecera alrededor de una hoja de trabajo clara. Una apertura personal negra enlaza historia, interpretación y acción mediante tres hojas SVG con reproducción controlable. Desde la decisión del 8 de septiembre, tres pestañas separan Tu cuestionario (primaria), Tu lectura (a demanda) y Otras miradas (Jung y desplegable ML). Los cinco resultados del autoinforme usan iconos, escala explícita y una entrada breve que respeta movimiento reducido; el ML no recibe puntuaciones decorativas. La lectura conserva capítulos, diagramas y definiciones. Las actividades se abren de a una. El interludio negro de marca se muestra una sola vez al entrar al espacio de trabajo por documento y cede al interactuar; no se repite entre pestañas ni páginas internas. El informe organiza cuestionario, lectura, actividades y apéndice ML en A4 blanco, con aperturas negras y espacio personal de reflexión.

**Key Characteristics:**

- Marco grafito continuo, hoja de trabajo clara y superficie blanca de lectura.
- Bricolage Grotesque para la interfaz y Young Serif en contornos para el logo, con procedencia y licencia.
- Isotipo independiente, tres hojas de reflexión, cinco diagramas de lectura y escenas propias de las actividades.
- Navegación con icono, nombre y ayuda; capítulos, glosario contextual y una actividad elegida a la vez.
- Interludio de marca finito, ambiente controlable en portada y apertura personal, y estados comprensibles sin animación.

Clasificación: documentación del sistema visual; canales: web de escritorio y móvil, con informe PDF; datos de las capturas interiores y de los informes de revisión: fixture sintético identificado como ejemplo. El contrato de dirección está en `DESIGN_CONTRACT` de `app/layout.tsx`. La extensión tiene capturas en `.impeccable/review/personal-2026-09-07/` e informes y páginas `closed-regular` y `closed-long` en `.impeccable/review/personal-pdf-2026-09-07/`. [La verificación de experiencia](docs/EXPERIENCIA-VERIFICACION-2026-09-07.md) registra el cierre de esta extensión; [la verificación de lectura](docs/LECTURA-VERIFICACION-2026-09-07.md) conserva el alcance previo. La insignia N de Next en capturas de desarrollo no es parte del producto.

El registro de verificación de esta extensión informa 294 pruebas en 52 archivos, typecheck y lint correctos, 12 comprobaciones Chromium/WebKit y cuatro comprobaciones PDF repetidas tras corregir paginación: nueve páginas habituales y once extensas. La revisión independiente examinó las veinte páginas definitivas y cerró `ship / remaining clear` sobre el alcance acordado. El build real local `4_c2CSU2ObXCgmJdteoge` pasó cuatro comprobaciones de ingreso/movimiento nativo en 3024, repetidas en 3000; ese dato describe la verificación local y no un despliegue remoto. Esta pasada documental contrasta componentes, estilos y artefactos existentes y no vuelve a ejecutar esas pruebas. El detector produjo salida truncada: no se declara limpio ni se repite desde documentación. Este registro no certifica la aplicación completa, validación psicométrica, accesibilidad integral, aprobación CAE ni publicación.

Fuentes de implementación: [configuración de Tailwind](tailwind.config.ts), [estilos globales](app/globals.css), [fuente y contrato de la aplicación](app/layout.tsx), [portada](components/landing/Landing.module.css), [resultado](components/dashboard/DashboardExperience.module.css), [lectura](app/reading-experience.css), [glosario](components/ui/ExplainedText.module.css), [actividades](components/plan/ActivityExperience.module.css), [informe](app/export/print.css), primitivas en `components/ui/` y navegación en `components/layout/`. Los consumidores y su cascada CSS definen el estado actual; los selectores antiguos sin uso no los sustituyen. Este frontmatter es la extracción normativa para consumidores de DESIGN.md; los cambios futuros deben reconciliarse con esas fuentes. El [sidecar](.impeccable/design.json) agrega comportamiento, muestras y contexto, sin una segunda colección de primitivas. [PRODUCT.md](PRODUCT.md) aporta el propósito y los compromisos de marca.

## Colors

La paleta combina grises de papel ligeramente cálidos y tinta oscura; el color semántico aparece en estados concretos.

### Primary

- **Grafito de trabajo** (`text-1`): texto principal sobre papel, marco de la aplicación, botones y escenas interiores con contraste invertido.
- **Tinta de portada** (`landing-ink`): apertura editorial, texto de su vista de ejemplo, pestaña seleccionada e interludio de marca.
- **Tinta personal** (`personal-ink`): apertura interior, cierre de reflexión y aperturas/citas del informe; conecta esos momentos mediante un mismo fondo casi negro.

### Neutral

- **Papel personal** (`personal-paper`): texto y hojas sobre tinta personal, compartidos por escena interior, interludio, diagramas e informe.
- **Papel de fondo** (`umbra-void`): hoja de trabajo, texto principal sobre grafito y continuación clara de la portada.
- **Hoja blanca** (`umbra-abyss`): paneles de lectura, actividad elegida, chat, tarjetas y vista de informe.
- **Papel secundario** (`muted-paper`): destinos y apoyo sobre el marco grafito.
- **Tinta de lectura** (`reading-ink`): párrafos extensos de la narrativa y descripción de actividad.
- **Papel suave** (`umbra-fog`): ayudas de ejemplo y mensajes de lectura.
- **Papel de control** (`umbra-shadow`): campos, estados de interacción y marcas móviles.
- **Línea de papel** (`umbra-mist`): bordes y separación discreta.
- **Grafitos secundarios** (`text-2`, `text-3`, `text-4`): explicación, metadatos y apoyo; conservan su rol contextual, no sustituyen el texto de una acción.
- **Trazo de control** (`control-stroke`): valor actual del alias `violet-400`; se usa con distintas opacidades en bordes y estados.
- **Papeles y texto de portada** (`landing-paper`, `landing-muted`, `landing-line`, `landing-body`): contraste sobre tinta, divisores y texto de apoyo en la composición editorial.

### Estados

`accent-emerald` acompaña confirmaciones y conteos; `accent-amber`, avisos; `accent-rose`, errores y acciones destructivas. Los estados conservan texto, icono o marca además del color. La documentación no crea nuevos estados ni certifica el comportamiento del pipeline de seguridad.

**The Tinta y papel Rule.** El énfasis principal se construye con contraste entre tinta y papel; los acentos de estado conservan su significado funcional.

Los estilos globales exponen las referencias `--ink`, `--paper`, `--white`, `--stone`, `--muted-ink` y `--muted-paper`, consumidas por `--surface-shell`, `--surface-reading`, `--surface-workspace`, `--text-on-shell`, `--text-secondary-shell` y `--control-border`. El borde de los controles del espacio de actividad usa `--muted-ink`; no es el alias de compatibilidad `control-stroke` de los campos antiguos. Los nombres `violet-*` son aliases heredados que ahora resuelven a grises. No definen una marca violeta ni autorizan recuperar el sistema anterior. Los valores locales de la portada se mantienen en su módulo CSS: no se extienden automáticamente a todas las pantallas.

La lectura incorpora verdes grisáceos en diagramas, énfasis del texto y posición de desplazamiento. El glosario invierte tinta y papel y su término activo usa un fondo verde suave. Estos colores viven en `reading-experience.css`, `ReadingArt` y `ExplainedText.module.css`; no son categorías psicológicas ni nuevos estados de confianza. La transición usa tinta de portada y papel personal. El informe y su vista previa tienen fondo blanco sin marco oliva; conservan verdes locales en ayudas, ejemplos y trazos, junto a las aperturas negras.

## Typography

**Display Font:** Bricolage Grotesque, con respaldo sans-serif.
**Body Font:** la misma familia. Los aliases `display`, `heading`, `body` y `mono` apuntan a ella; `mono` no constituye una segunda familia monoespaciada.

**Character:** títulos expresivos de ancho normal, peso definido y espaciado compacto; cuerpo directo, sin cursiva ornamental. La carga actual usa `next/font/google`, peso variable y eje `opsz`, con `font-optical-sizing: auto`, `display: swap` y ancho predeterminado (100). El resultado de Next/font se sirve desde la propia aplicación; no hay una fuente propietaria de Stoic incorporada.

La familia gratuita y su licencia SIL OFL están registradas en la [fuente oficial de Atelier Triay](https://github.com/ateliertriay/bricolage) y su [muestra de autor](https://ateliertriay.github.io/bricolage/), examinadas durante la selección tipográfica.

### Hierarchy

- **Display:** título de portada; toma el rol `display` del frontmatter. La composición editorial utiliza una escala fluida, con ajustes específicos en los cortes de portada.
- **Headline:** encabezado fluido compartido del marco, con el rol `headline` del frontmatter. Mi resultado lo ajusta a 1.5–2 rem; debajo, la apertura personal usa un título de 1.8–2.8 rem, peso 500 e interlineado 1.12, con énfasis cromático sin cursiva. En móvil ese título llega hasta 2.3 rem. La biblioteca usa encabezado compacto y una explicación destacada; la actividad abierta usa 1.8–2.75 rem, peso 600 e interlineado 1.15.
- **Reading title:** encabezado de cada capítulo, con ancho máximo de 20 `ch`; el contenido abre directamente con su título. El rol del frontmatter refleja la cascada de `reading-experience.css`; en móvil se ajusta a 26 px. El informe tiene su jerarquía propia, documentada con el componente de exportación.
- **Title:** títulos habituales de sección. Los grupos y tarjetas de actividades usan 23 px en escritorio; en móvil pasan a 20 y 19 px respectivamente. Las dimensiones Big Five usan 18 px, 17 px en móvil. Son variantes de sus componentes, no una razón matemática aplicada a toda la app.
- **Body:** base de texto de la aplicación. El rol `reading` distingue los párrafos extensos: tamaño base de 17 px, 18 px desde 768 px, interlineado 1.85 y ancho máximo de 70 `ch`. La explicación principal de pantalla usa una escala fluida de 1.2–1.75 rem e interlineado 1.35. La portada conserva su explicación limitada a 39 `ch`.
- **Label:** controles y navegación habituales. El tamaño `xs` de Tailwind está elevado a 14 px con interlineado 1.45; no es el `xs` predeterminado de Tailwind.

**The Título primero Rule.** El nombre del contenido encabeza el bloque; la procedencia o atribución se presenta como apoyo cercano y no como un rótulo ornamental que compite con él.

Las ayudas de navegación, descripciones de pestaña y metadatos usan tamaños locales de 11–13 px. La selección sigue identificada por su nombre y estado; esos tamaños auxiliares no definen el cuerpo ni una nueva escala global. Las notas de portada e impresión también conservan ajustes propios que deben revisarse en contexto. No se añaden tokens para legitimar cada valor señalado por el detector.

## Layout

El marco grafito comparte navegación y contenido. En escritorio desde 1024 px muestra una barra lateral fija de 232 px; el cuerpo compensa ese ancho y su contenido interior se centra con máximo de 1180 px. La hoja de trabajo parte de padding 28 px arriba, 20 px a los lados y 40 px abajo; desde 768 px usa 40 px, desde 1024 px usa 44 px verticales y 40 px horizontales, y desde 1280 px usa 36 px verticales y 48 px horizontales. La cabecera mide al menos 76 px en móvil y 68 px en escritorio. La escala de espaciado extraída corresponde a pasos existentes de Tailwind y medidas compartidas de CSS, sin un generador de tokens nuevo.

Debajo de 1024 px la navegación pasa a cuatro destinos inferiores: Mi resultado, Actividades, Chat e Informe. La barra mantiene el grafito, destinos con altura mínima de 76 px y el área segura del dispositivo; el marco reserva 88 px abajo. Mi cuenta está arriba en móvil y al pie de la barra lateral en escritorio. La hoja tiene esquinas superiores redondeadas y margen lateral de 8 px; en modo ejemplo, el aviso y la hoja comparten margen de 16 px, y la unión entre ambos queda recta.

Mi resultado abre con encabezado compacto y una apertura personal negra. Desde 768 px, texto/acción y escena de tres hojas ocupan dos columnas de proporción 1.1:1, separadas por 20 px, con padding de 32 × 36 px. Debajo de ese corte pasan a una columna con padding de 26 px arriba, 24 px laterales y 16 px abajo; la escena se centra con máximo de 280 px y diagrama de 170 px de alto. Las pestañas mantienen juntas las tres miradas. Cada capítulo reúne título e invitación junto a un diagrama en una columna de 210 px; en móvil la ilustración pasa a 98 px. Las cinco dimensiones Big Five forman una lista vertical a todos los anchos: icono y explicación, con el estado a la derecha en escritorio y debajo del texto en móvil. Los selectores antiguos `compactIntro`, bienvenida grande y recorrido en tres pasos carecen de consumidor en `DashboardIntro` y no describen su composición actual.

La biblioteca agrupa tarjetas por área. Desde 768 px usa dos columnas y una ilustración superior de altura mínima 170 px; debajo de ese corte usa una columna con ilustración lateral de 102 px, reducida a 78 px bajo 375 px. La actividad elegida pasa de una escena superior en móvil a una columna oscura lateral desde 768 px, con SVG de hasta 300 px. Las pantallas que todavía usan `experience-heading` conservan su composición figurativa de apoyo; ese helper no describe el dashboard ni la biblioteca actuales.

Acceso y registro usan fondo grafito y formulario de papel. Desde 960 px muestran a la izquierda un panel explicativo oscuro con el isotipo y tres posibilidades del recorrido, y a la derecha una columna de formulario de 400–480 px. En móvil ese panel se oculta y el formulario recibe el espacio disponible. Consentimiento, elección de entrada y preguntas usan fondo grafito y una hoja clara de hasta 768 px. El chat tiene superficie blanca flex, altura `min(820px, 88dvh)` y mínimo de 520 px; desde 768 px su altura pasa a `min(760px, 72dvh)`. Los mensajes tienen desplazamiento interno. Bajo 1280 px el historial se abre con un control; a partir de ese ancho ocupa una columna de 216 px.

La portada tiene contenedor máximo de 1280 px, márgenes iniciales de 48 px y una composición de dos columnas. A 1050 px reduce márgenes a 32 px; a 760 px pasa a una columna y márgenes de 20 px. Los tres pasos del recorrido pasan a una secuencia vertical. A 360 px se ajustan título, pestañas e ilustración. Estas medidas pertenecen a la portada; no reemplazan los cortes del shell.

La vista de ejemplo de portada reserva la altura de sus tres paneles superpuestos. Cambiar de pestaña conserva el espacio y evita desplazar las acciones posteriores. En el resultado interior, cada pestaña muestra su propio contenido; la lectura y sus fuentes se agrupan, y los detalles se abren mediante controles explícitos. Cuenta y exportación mantienen las acciones junto a su contenido.

## Elevation & Depth

La profundidad procede sobre todo del contraste de superficies, el espacio y los bordes suaves. Las geometrías interiores combinan círculo, apertura, intersección y trazo. Las escenas figurativas de portada combinan rellenos, contornos y capas de papel. Estas técnicas pertenecen a los SVG y no convierten los paneles de lectura en superficies translúcidas.

`Card` es blanco y su variante `glow` agrega el borde claro actual. `GlassCard` también es blanco: su nombre no implica transparencia, desenfoque ni vidrio. El alias `card-lift` solo modifica el color del borde durante el hover; no desplaza la tarjeta. Existe una sombra `glow` en la configuración, sin consumidores encontrados en la superficie revisada: no se promueve a una regla de elevación.

La vista de ejemplo sobre la portada usa `0 18px 40px #00000030` para separarse del libro y del fondo oscuro. Es una excepción localizada en `Landing.module.css`, no una sombra general para los módulos interiores.

El glosario usa `0 12px 36px #0003` para separar la definición flotante del pasaje. Es elevación funcional de una ayuda superpuesta, con posición fija y capa 100; no se aplica a tarjetas o citas.

**The Superficie por tarea Rule.** El grafito sostiene el marco y la escena; el papel organiza el trabajo y el blanco concentra la lectura o la actividad elegida, sin elevación ornamental.

## Shapes

Los controles compartidos, el glosario y las tarjetas de actividades usan esquinas suaves del rol `md`; navegación lateral y siguiente sección usan `focus`. Tarjetas generales, hoja de entrada, apertura personal y actividad abierta usan `lg`. Las pestañas de resultado redondean sus esquinas superiores a 12 px y el panel blanco sus esquinas inferiores a 16 px, formando una superficie continua. `xl` y el `2xl` predeterminado coinciden actualmente con el radio de tarjeta. Las formas totalmente redondas aparecen en marcas de estado, badges y geometrías ilustradas. El CTA de portada y el botón de entrada a la lectura usan `sm`.

La marca `Brand` combina `BrandWordmark` y `BrandMark`. El primero usa los cinco glifos de Young Serif Regular convertidos a contornos SVG, con espaciado óptico; no son letras dibujadas originalmente para Umbra. Su cuadrícula es de 234.71 × 60 y tamaño habitual de 132 × 36 px; no usa un elemento text ni descarga la fuente para mostrar el logo. La procedencia y licencia SIL OFL 1.1 están en [public/brand/README.md](public/brand/README.md) y [YOUNG-SERIF-LICENSE.txt](public/brand/YOUNG-SERIF-LICENSE.txt). El símbolo reúne dos aperturas desplazadas, sin letras, en cuadrícula de 48 × 48 y tamaño habitual de 40 × 40 px. Ambos usan currentColor. Se comparten en acceso, navegación, portada e informe; el favicon usa solo el isotipo. El enlace aporta el nombre accesible «Umbra, inicio», y la cabecera de informe «umbra»; los SVG son decorativos y no reciben foco. El lettering permanece quieto cuando se anima el símbolo. Los iconos operativos siguen la familia Phosphor instalada; las ilustraciones no reemplazan sus controles.

## Components

### Buttons

`Button` es el control compartido. Tiene variantes `primary`, `secondary`, `ghost` y `danger`; sus roles y valores base están en el frontmatter. El tamaño medio tiene altura mínima de 48 px; el pequeño, 44 px; el grande, altura de 48 px y texto de 16 px. El cambio de color dura 150 ms. `loading` deshabilita el botón y conserva la etiqueta junto al indicador; `disabled` reduce opacidad y cambia el cursor.

El foco general usa contorno de 2 px separado 4 px, claro sobre superficie oscura. Los enlaces compartidos de acción tienen altura mínima de 48 px. El CTA de portada invierte la relación papel/tinta, tiene altura mínima de 56 px y una flecha que se desplaza levemente al pasar el puntero; el movimiento reducido anula ese desplazamiento.

La acción de seguir leyendo usa el botón de foco: altura mínima de 48 px, texto de 15 px, cambio de fondo de 160 ms y escala de presión 0.98. Los controles discretos de lectura y regreso tienen altura mínima de 44 px y texto subrayado. El estado deshabilitado conserva la etiqueta, elimina el subrayado y reduce la opacidad. Las reducciones globales de movimiento afectan la duración de estas transiciones; no se afirma que eliminen toda transformación de hover o presión.

### Chips

`Badge` agrupa texto breve con fondo suave, borde fino y forma redonda. Incluye variantes de compatibilidad y estado; `violet` es gris en la implementación actual. No es un control de filtro por sí mismo y no recibe estados interactivos ficticios en la muestra del sidecar.

### Cards / Containers

`Card` usa el padding compartido `6`; `GlassCard` pasa de 24 a 32 px desde el corte medio. El módulo actual de resultado usa paneles de 24 × 20 px en móvil y 32 px desde 768 px. La apertura personal conserva el espaciado descrito en Layout. La actividad abierta compone una escena oscura y una zona blanca de instrucciones, con padding de 28 × 24 px en móvil y 40 px desde 768 px. Las variantes con borde y las superficies oscuras se componen según la tarea. No hace falta una tarjeta por cada párrafo.

### Inputs / Fields

`Input` y `Textarea` comparten fondo de papel translúcido y esquinas de control. La etiqueta se vincula al campo; el error modifica el borde y muestra texto con `aria-invalid`. `Input` usa borde `text-3`, cambia a borde `text-1` y fondo blanco al recibir foco, y conserva un contorno visible de 2 px separado 4 px. `Textarea` mantiene su borde de compatibilidad y un foco por cambio de borde/fondo sin contorno: ese comportamiento distinto es deuda local, no una regla para extender a otros controles.

`Textarea` permite redimensionar verticalmente y parte de una altura mínima de 160 px. El conteo de palabras permanece textual. Las respuestas seleccionables usan `aria-pressed`, inversión tinta/papel y un desplazamiento de 3 px; con movimiento reducido la selección conserva el contraste y elimina la traslación. La entrada de pregunta mantiene el foco en su encabezado según el flujo existente.

### Navigation

`Sidebar`, `TabBar`, `TopBar` y `LayoutShell` son las fuentes compartidas. En escritorio cada destino reúne icono Phosphor de 24 px, nombre y ayuda de tarea asociada mediante `aria-describedby`; sus filas tienen altura mínima de 68 px. El destino activo conserva `aria-current="page"`, invierte la fila a papel y tinta, y usa peso 600 e icono relleno. En móvil el destino activo conserva texto claro, peso 700 e icono relleno sobre una marca grafito más clara. El foco del marco es claro; el del papel es oscuro. El enlace para saltar al contenido aparece con foco. El cierre de sesión permanece en la cabecera cuando hay usuario.

### Lectura por secciones

`DashboardIntro` abre con «Hay más de una forma de mirarte» y puede anteponer el primer nombre disponible. Ofrece «Leer mi resultado» junto a la escena de tres hojas; la acción selecciona la lectura, enfoca el panel y lo lleva al comienzo de la vista. `ReflectionDiagram` es un SVG decorativo compartido con el informe: una hoja de historia, una apertura de interpretación y una hoja de acción, sin datos ni puntuación. `ReflectionScene` agrega pausa/reproducción local sin iniciar lecturas ni cambiar datos. El índice desplegable «Explorá los capítulos» muestra los títulos reales y permite ir directamente a cada sección; su estado activo usa `aria-current="step"`, tinta oscura y papel claro.

`ProfileWorkspace` separa Tu lectura, Datos del modelo y Lectura simbólica mediante icono, nombre y una descripción breve. Usa `tablist`, `tab`, `tabpanel`, foco itinerante, flechas izquierda/derecha, Inicio y Fin; los paneles inactivos conservan su estado React y quedan ocultos con `hidden`. La selección se reconoce por peso, superficie blanca y subrayado de 2 px. Los controles se reparten el ancho, miden al menos 86 px en escritorio y 92 px en móvil; en móvil se apilan icono y nombre y se oculta visualmente la descripción auxiliar. El enlace a Actividades aparece después del panel.

`SectionedNarrative` muestra una sección a la vez cuando hay varias, la generación terminó y no se pidió la lectura completa. El contador anuncia la sección, Anterior se deshabilita al inicio y Seguir leyendo se sustituye por un cierre textual al terminar. Ver lectura completa y Leer por secciones permiten cambiar el modo; durante generación y en `presentation="document"` se muestran todas las secciones. El contenido sin títulos conserva su texto.

Al avanzar, retroceder o elegir un capítulo, el pasaje recibe foco con `preventScroll`. Solo se desplaza si el nuevo encabezado queda fuera del área útil: arriba de 24 px o por debajo de la altura de ventana menos 96 px. El pasaje tiene margen de desplazamiento superior de 24 px y altura mínima de 240 px; no fuerza un salto cuando el encabezado ya está visible. `ReadingPosition` mide la posición real del pasaje al desplazar, redimensionar o cambiar su altura; su barra nativa y marcador SVG siguen esa posición. La barra permanece sticky; el marcador se oculta con movimiento reducido y ambos se retiran en impresión. No registra finalización, comprensión ni un puntaje de lectura.

Los cinco diagramas de `ReadingArt` acompañan el capítulo con libro, dirección, puente, facetas y apertura. Las negritas y citas reflejan únicamente marcas presentes en el texto recibido: no se inventan frases destacadas ni se modifica una narrativa histórica. Las citas usan papel verde suave y espacio, sin franja lateral decorativa. El cierre invierte a tinta personal y ofrece una pregunta de reflexión y copiar el pasaje visible; comunica éxito o fallo mediante un estado textual.

**The Posición verificable Rule.** La barra de lectura representa desplazamiento y la línea de actividad representa casilleros completados; ninguna se presenta como comprensión, capacidad o nueva puntuación personal.

`BigFiveDimensions` conserva las cinco dimensiones con icono y explicación en filas verticales. Solo el estado `ok` muestra cifra sobre 100 y barra con semántica `progressbar`. `low_confidence` y los demás estados insuficientes muestran texto sin cifra ni barra. La vista sintética revisada presenta las cinco filas con evidencia insuficiente; ese estado no se convierte en una puntuación implícita.

### Actividad elegida

`ActivityWorkspace` parte de tarjetas agrupadas por área, con cantidad de propuestas en el encabezado. Cada tarjeta conserva ilustración contextual, título, descripción, conteo de pasos completados y flecha. Las miniaturas alternan papel oscuro y claro; el bloque de texto sigue blanco durante hover y foco. El título se subraya y, cuando no se solicita movimiento reducido, la ilustración aumenta a escala 1.06. Elegir una tarjeta abre la misma escena, instrucciones, pasos y explicación desplegable. El encabezado general de Actividades deja lugar a la actividad abierta. El título recibe foco; al volver se recuperan la posición previa de desplazamiento y el foco de la tarjeta elegida.

Los pasos son checkboxes nativos con etiqueta visible y marca de 24 px; selección y confirmación conservan el signo de verificación. Durante guardado se deshabilitan y aparece un mensaje de estado. La explicación de por qué se propone una actividad queda en un `details` con su límite de interpretación orientativa. Estos estados describen el componente, no prueban persistencia real en la demo.

Las superficies sintéticas conservan el aviso de ejemplo. `CartaFuturaCard` recibe `example` explícito: muestra que la carta es ficticia, sin atribuir una fecha personal, guardado ni apertura programada a la persona.

### Glosario contextual

`ExplainedText` reconoce Big Five, arquetipo y las ocho siglas de Jung en narrativa, actividades, mensajes y ejes simbólicos. Cada término usa un botón de texto con subrayado punteado y foco visible. Hover, foco de teclado o toque abren definición, ejemplo general y límite de interpretación. La ayuda se mantiene al pasar el puntero hacia ella; Escape, pérdida de foco, toque exterior o desplazamiento la cierran. Usa `aria-expanded`, `aria-describedby` y `role="tooltip"`, sin convertirla en un diálogo ni mover el foco.

La definición mide hasta 320 px, deja 16 px laterales en pantallas estrechas y tiene altura máxima relativa a la ventana con desplazamiento interno. La entrada dura 160 ms solo sin movimiento reducido. Las palabras ambiguas Se, Si, Ni y Te se expanden únicamente ante contexto explícito de función, para conservar el español ordinario. El modo documento amplía las siglas a sus nombres sin botones ni ventanas emergentes. El renderizador interpreta las marcas de negrita y texto; no inserta HTML generado.

### Informe en papel

`ReportContent` y `app/export/print.css` definen una composición única de 182 mm de ancho sobre A4, con márgenes superior/derecho/inferior/izquierdo de 16/14/18/14 mm. La vista previa conserva ese ancho en escritorio y móvil y permite desplazarse dentro de su marco enfocable; el dispositivo no vuelve a componer el documento.

El informe reúne portada personal, narrativa íntegra, explicación Big Five, las ocho funciones de Jung divididas en dos grupos con nombre completo, definición, ejemplo cotidiano y valor guardado identificado como simbólico, y actividades completas con casilleros para papel. Cierra con tres preguntas y espacio para notas. Los ejemplos explican conceptos sin afirmar que describen a la persona. Los casilleros y notas impresos no reflejan ni cambian el progreso de la app. Los estados sin evidencia conservan su texto y no dibujan barras vacías. Las aperturas negras, figuras compartidas y secuencia editorial organizan el contenido sin retirar narrativa ni propuestas guardadas.

La portada usa título de 55 px, interlineado 1.04 y tracking de -.025 em sobre tinta personal. El texto narrativo usa 14 px e interlineado 1.7; las aperturas de capítulo tienen título de 24 px junto a su diagrama. La cabecera y el primer bloque se agrupan; el resto del capítulo puede fluir entre páginas. El nombre y la explicación de un área se agrupan con su primera actividad. Una acción de tamaño habitual mantiene juntos título, descripción y pasos mediante `pdf-keep`; una acción mayor que una página puede dividirse. Párrafos y elementos de lista evitan cortes internos y usan tres líneas huérfanas/viudas. Las citas usan contraste negro/papel y las ayudas un relleno verde suave, sin franjas laterales decorativas. En impresión se retiran controles, barra de posición, animación y marco de navegación.

El método actual de descarga rasteriza la composición. Este registro no lo presenta como un PDF etiquetado o con texto accesible/seleccionable; esa limitación permanece en la verificación de lectura. Los ajustes del informe no se promueven a tamaños de la interfaz.

La composición actual elimina márgenes finales de las secciones y usa aperturas explícitas de página para datos, grupos de funciones, actividades y notas. El ajuste evita que espacio vacío posterior cuente como otra página al rasterizar el A4. La verificación y la revisión independiente confirman nueve páginas en el informe habitual y once en el extenso: veinte páginas sin hojas vacías, títulos aislados ni contenido descartado. Las páginas finales están en los conjuntos `closed-regular` y `closed-long`.

### Vista de ejemplo y movimiento

`HeroExperience` muestra Preguntas, Lectura y Actividades como ejemplo estático identificado. Las pestañas tienen `tablist`, `tab`, `tabpanel`, foco itinerante y selección por flechas izquierda/derecha, Inicio y Fin. No rotan automáticamente. Los paneles no seleccionados reservan su lugar pero quedan invisibles y fuera de interacción.

`StoryScene` reemplaza el campo ambiental `FluidField` en esta portada. Su libro SVG original enlaza escritura, lectura y próximos pasos con las tres pestañas. Sus ciclos solo corren si la persona no los pausó, el ejemplo está en pantalla, el documento es visible y no hay preferencia de movimiento reducido. Sin `IntersectionObserver` permanece estático. La pausa manual y la reanudación son visibles; con movimiento reducido el control explica ese estado y queda deshabilitado. La información y la navegación siguen disponibles sin movimiento.

`WorkspaceTransition` monta un portal en `document.body`: una capa negra fija cubre todo el viewport con símbolo y wordmark, sin desplazar ni remontar página o navegación. Se reproduce una sola vez al entrar al espacio de trabajo por documento: `MotionProvider` conserva la entrada consumida entre rutas y remontajes de página; movimiento reducido también la consume. Usa Web Animations durante 1240 ms con `ease-in-out`: entrada, breve permanencia y salida por opacidad. El símbolo llega con giro/escala durante 1000 ms y el wordmark se revela por recorte durante 900 ms; no se deforman sus contornos. La capa es decorativa, sin foco ni captura del puntero, y parte oculta si la animación no está disponible. Se cancela ante tecla, toque/presión, foco en contenido, documento oculto, impresión o movimiento reducido. Editar, recibir texto o cambiar una query no remonta los hijos. No modifica la velocidad del scroll. Paneles, pasajes y actividades conservan el despliegue finito de 420 ms con `cubic-bezier(.16, 1, .3, 1)`.

`ReflectionScene` despliega y reúne sus tres hojas en ciclos de ocho segundos con `cubic-bezier(.37, 0, .25, 1)`. El ciclo requiere reproducción habilitada, al menos 15 % de la escena visible, pestaña visible y ausencia de preferencia de movimiento reducido; sin observador de intersección permanece estático. El control tiene altura mínima de 44 px y con movimiento reducido informa «Sin movimiento». Los capítulos usan `SvgArtwork` para suspender sus gestos finitos fuera de pantalla o con la pestaña oculta: detalle de tinta en 1400 ms y gesto propio de libro, dirección, puente, facetas o puerta en 1600 ms. Estos tiempos reflejan la cascada efectiva, que supera la regla genérica anterior de 1000 ms. La escena de actividad elegida llega en 480 ms; las miniaturas responden en 300 ms y sus trazos específicos reaccionan a hover/foco en 650 ms. La línea inferior cambia en 800 ms según casilleros completados. En acceso, el isotipo y sus círculos llegan una vez en 1000 y 1200 ms. Las dos aperturas de la marca se separan y giran levemente en 420 ms al pasar el puntero o recibir foco. `SvgArtwork` conserva gestos de 2400 ms para lápiz, hoja y caminata, y los arquetipos una llegada de 1200 ms. Los iconos operativos responden al puntero, foco y presión. Las ilustraciones quedan estáticas con movimiento reducido y al imprimir. El color de las pestañas de portada cambia sin interpolación para conservar contraste durante la selección; el indicador de espera mantiene su pulso mientras corresponde.

La regla global de movimiento reducido lleva animaciones y transiciones a .01 ms, una iteración y desplazamiento automático. El revelado anterior de ilustración, la entrada de pregunta y la confirmación anterior se eliminan; la selección de respuesta pierde su traslación. Se mantienen contenido, controles y estados seleccionados. El proveedor de Framer Motion respeta la preferencia del usuario. El antiguo helper `LandingReveal` no tiene consumidores actuales y no define la entrada de esta portada.

### Ilustraciones del recorrido

`ReadingArt` aporta cinco diagramas originales asociados por orden a los capítulos; acompañan el título y no representan una medición. `ActivityIllustration` selecciona escenas de caminata, comida, escritura o conversación según el título, con una apertura y camino como alternativa. Las miniaturas reutilizan esas mismas escenas con dos tonos de fondo. La única parte vinculada al estado es la línea inferior: refleja el conteo de pasos completados que recibe el componente, sin un nuevo puntaje ni un registro de lectura.

`ReflectionArt` conserva las escenas figurativas del resto del recorrido: `dialogue` dibuja cuaderno y lápiz para responder; `mirror`, una persona leyendo; `steps`, una caminata con sendero y sol; `pages`, hojas para el informe. Los nombres son aliases de implementación, no nuevas funciones del producto. El trazo y los rellenos toman `currentColor`; `--art-paper` permite invertir el papel en fondos oscuros. Los SVG son decorativos (`aria-hidden`, sin foco) y el texto contiguo explica la acción.

Las escenas se reutilizan en la portada y las pantallas interiores. No se distribuyen raster de terceros. Las capturas Stoic guardadas en `.superpowers/sdd/2026-09-06-stoic-ui/references/` son referencias de QA y no activos de producto.

### Correos transaccionales

`lib/email/templates.ts` extiende la identidad existente a diez mensajes de cuenta: bienvenida, confirmación, invitación, recuperación, enlace de acceso, confirmación de cambio de email, reautenticación, contraseña actualizada, email actualizado y confirmación de eliminación. El mismo renderer produce HTML y texto plano; `scripts/build-email-templates.ts` genera las ocho plantillas de Supabase Auth y las diez vistas locales. La composición se comparte y el contenido corresponde al evento. El [brief de correos](.impeccable/surfaces/lib-email-templates-ts.md) guarda el modo de uso, el contrato de dirección y el alcance de verificación.

La carta tiene ancho fluido con máximo de 600 px, tablas de presentación y estilos inline. Sobre el fondo de papel suave, la cabecera grafito local (`#171a18`) reúne la marca a la izquierda, el isotipo decorativo a la derecha y el título debajo; el cuerpo blanco concentra explicación, acción o código, y nota de seguridad. El pie vuelve a papel y conserva el límite no terapéutico junto a Privacidad y Términos de uso. Son superficies planas, sin sombras ni movimiento. La marca usa `email-lockup.png` y `email-aperture.png`, rasterizados de `BrandWordmark` y `BrandMark`; ambos tienen registros `.provenance.json`. El lettering conserva la atribución Young Serif y su licencia. El logo tiene texto alternativo «umbra» y el isotipo un alt vacío. Los datos sensibles del cuestionario, perfil y modelos no forman parte de estos mensajes.

La tipografía es una adaptación al correo: Georgia, con Times New Roman y serif de respaldo, para títulos; Arial, con Helvetica y sans-serif, para cuerpo y acciones. El título compartido mide 44 px, peso 400 e interlineado 1.13; el cuerpo, 17 px e interlineado 1.75; las notas, 14 px e interlineado 1.7. Hasta 620 px el título baja a 36 px, el padding interior pasa a 28 × 24 px, la marca a 156 px y el isotipo a 58 px. Estas fuentes y medidas pertenecen al canal email; Bricolage permanece como tipografía de la interfaz. El botón enlazado usa texto blanco sobre tinta, radio de 8 px, padding de 17 × 24 px y texto de 16 px en negrita. El foco de enlaces tiene contorno ámbar de 3 px separado 4 px donde el cliente respeta esa regla; no se introduce animación de interacción.

La reautenticación muestra un código textual centrado sobre papel suave; los otros mensajes presentan una acción principal y su enlace completo de respaldo con corte de líneas. Bienvenida y confirmación agregan tres pasos numerados del recorrido. Las notas distinguen solicitud, cambio realizado y confirmación pendiente; en eliminación explican que abrir el enlace lleva a otra pantalla de confirmación. La vista de diseño identifica datos ficticios y acciones sin efecto sobre cuentas. La versión de texto conserva evento, acción o código, nota y enlaces legales aunque no carguen imágenes.

**The Acción de cuenta Rule.** En los correos, la marca encuadra el evento; el texto explica qué ocurrió y conserva una acción principal o un código, con su nota de seguridad y alternativa de texto.

La pasada de navegador reportó veinte comprobaciones de las diez variantes a 720 y 390 px, con imágenes cargadas, ausencia de desborde horizontal y axe sin violaciones en el alcance configurado; las veinte capturas están en `.impeccable/review/emails/`. La revisión visual independiente `email_finish_review` cerró `SHIP` sin correcciones materiales. Este registro documental contrasta la fuente y las capturas existentes; no repite esas pruebas ni certifica Gmail, Outlook, modo oscuro de clientes o accesibilidad integral del correo. Las plantillas de Supabase/configuración local y el envío Resend son alcances operativos separados: el cierre visual no demuestra instalación remota ni SMTP de Supabase; el sandbox de Resend permanece limitado al destinatario propio habilitado. No se promueven estos límites de proveedor, los tamaños auxiliares ni el fallback tipográfico del correo a reglas generales de la aplicación.

## Do's and Don'ts

### Cuestionario opcional y procedencia del resultado

`components/assessment` conserva el lenguaje visual de papel y tinta y la tipografía Bricolage. La intervención se limita a introducción con aceptación, cinco bloques de seis preguntas y resumen. Se mantienen sin reescritura las afirmaciones, orden y opciones del BFI-2-S español publicado. No hay respuestas preseleccionadas ni persistencia de borradores. El error de guardado conserva las respuestas en memoria y permite reintentar; omitir el cuestionario continúa el recorrido.

Las opciones se representan con radios nativos y etiquetas completas, foco visible y áreas táctiles amplias. El avance no interpola el ancho. Los cinco resultados usan escala explícita de 1 a 5 con texto, punto sobre regla y explicación; no son porcentajes, baremos ni cifras del ML. El resumen del autoinforme no reemplaza la pestaña de datos experimentales. Se repite su procedencia en el PDF. Los tamaños auxiliares y radio de 4 px del formulario son decisiones locales, no nuevos tokens globales.

Se realizó una pasada manual de detección Impeccable y se retiró la animación de ancho señalada. Las advertencias estilísticas restantes no certifican ni invalidan el diseño. Se revisaron escritorio y móvil, teclado, error con reintento y análisis axe en navegador; la aceptación visual final corresponde al autor.

### Lenguaje de entrada — 7 de septiembre, revisión de copy

El lema aprobado por el autor es «Tu cabeza, en palabras.», que sustituye «Entendete mejor. Elegí tu próximo paso». Debajo se explica la acción: «Respondé preguntas sobre tus decisiones y hábitos. Recibí una lectura de tus respuestas y actividades para probar en tu día». El lema identifica la propuesta, no reemplaza los nombres funcionales de botones y pantallas. Se conserva el límite visible sobre IA y el carácter no terapéutico. Portada, metadatos y diccionario usan el mismo texto.

La vista ficticia conecta pregunta, lectura y actividad sobre una misma decisión. Big Five aparece con ejemplos y con el cuestionario opcional separado del ML experimental; Jung, primero con preguntas comprensibles y después con sus nombres. Se mantiene Bricolage, la regla base `clamp(3rem, 5.4vw, 5.2rem)`, las adaptaciones móviles y el subrayado vectorial animado. El título tiene un corte después de «cabeza,» con separación también en su texto accesible.

Se revisaron hero, Big Five y Jung a 390 y 1440 px y pasaron 22 pruebas públicas de navegación, formulario, FAQ y axe en ambos motores. Estos controles no reemplazan una prueba de comprensión con personas. Las futuras generaciones reciben pautas de lenguaje común; los contenidos ya guardados no se reescriben automáticamente. Detalle y límites: `docs/PRUEBAS-Y-COPY-2026-09-07.md`.

Tras aprobar el lema se repitieron las 22 pruebas públicas sobre la build `1h2Vy_dfpCzct3nnEnMeo`. La revisión visual por el agente a 390, 768 y 1440 px confirmó título en dos líneas, explicación legible y controles accesibles sin desborde horizontal. No hizo falta cambiar CSS, marca ni movimiento. Evidencia: `artifacts/audits/tagline-2026-09-07/`. Se conserva la identidad siguiendo Impeccable; no se interpreta este control como aceptación visual final del autor ni como prueba de comprensión.

### Do:

- **Do** mantener `umbra` en contornos Young Serif con su atribución y licencia, el isotipo independiente de dos aperturas y Bricolage Grotesque para la interfaz.
- **Do** empezar los bloques por su título y mantener la procedencia y los límites junto al contenido.
- **Do** reutilizar controles, navegación y escenas SVG existentes antes de crear variantes locales.
- **Do** conservar las pestañas que separan narrativa, datos del modelo y lectura simbólica, y ofrecer control del ritmo de lectura.
- **Do** explicar las siglas mediante el glosario compartido y conservar los énfasis y citas del texto recibido.
- **Do** abrir una actividad elegida con sus pasos y permitir regresar a la opción y posición previas.
- **Do** conservar texto y marcas de estado además del color, con foco y operación por teclado.
- **Do** mantener pausa, suspensión fuera de pantalla y alternativa estática en el libro de portada y las tres hojas de la apertura personal.
- **Do** cancelar el interludio al interactuar y conservar lectura completa, glosario, actividades y espacio de notas en el informe.
- **Do** contrastar los cambios de tokens con las pantallas de escritorio y móvil y actualizar este registro desde el código.

### Don't:

- **Don't** recuperar la paleta violeta, las transparencias o las fuentes anteriores a partir de nombres heredados.
- **Don't** copiar la identidad, tipografía propietaria, ilustraciones, textos o capturas de Stoic al producto.
- **Don't** usar ilustración, animación o una figura simbólica como evidencia de análisis real o validación clínica.
- **Don't** presentar posición de desplazamiento como lectura completada ni conteos de casilleros como una nueva puntuación personal.
- **Don't** convertir notas pequeñas, estilos locales del PDF o helpers sin consumidores en reglas generales.
- **Don't** agregar funcionalidades, métricas o capas de tokens que el recorrido y la implementación no contienen.

No se canonizan como reglas futuras los tamaños auxiliares aislados, el foco sin contorno de `Textarea`, los aliases de efectos antiguos, `compactIntro`, la pseudo-cortina anterior de 960 ms, los selectores sin consumidores ni la sombra global sin uso: son límites o compatibilidad de esta implementación. Tampoco se canonizan rótulos decorativos, franjas laterales de llamada, espaciado que perjudica legibilidad, el ajuste óptico aislado de las siglas PDF para html2canvas ni la falsa atribución de letras originales. La revisión independiente de esta extensión cerró el alcance acordado; no sustituye la aceptación visual pendiente de Matías ni certifica la aplicación completa o su aprobación académica.

---
version: 1
slug: "lib-email-templates-ts"
primary_target: "lib/email/templates.ts"
related_targets: ["lib/email/resend.ts", "scripts/build-email-templates.ts", "supabase/config.toml", "supabase/templates/confirmation.html", "supabase/templates/invite.html", "supabase/templates/recovery.html", "supabase/templates/magic_link.html", "supabase/templates/email_change.html", "supabase/templates/reauthentication.html", "supabase/templates/password_changed.html", "supabase/templates/email_changed.html", "e2e/email-preview.spec.ts", "artifacts/email-preview/index.html"]
---

# Correos de cuenta de Umbra

Alcance: extensión construida de la marca vigente a diez correos transaccionales. Clasificación: documentación UI/UX del canal email HTML y texto plano, revisado en navegador de escritorio y móvil. Modo: Operate; la persona entiende un evento de su cuenta y sigue la acción correspondiente o usa un código. Datos de revisión: fixtures sintéticos identificados y enlaces locales sin operaciones sobre una cuenta.

La persona destinataria reconoce Umbra desde la cabecera y encuentra el motivo del mensaje, la acción o el código, y una nota de seguridad. Bienvenida y confirmación orientan el primer recorrido; los avisos de cambios de cuenta explican cómo revisar el acceso. Las instrucciones operativas y los límites permanecen en texto visible. Los correos no llevan respuestas, perfil, lecturas ni resultados de modelos.

La dirección preserva la identidad de DESIGN.md. No hubo cambio de mundo visual, ronda de conceptos ni comp nuevo: el pedido fue aplicar la marca existente a todos los correos. El momento reconocible es la apertura oscura con el logo de Umbra y su isotipo, seguida por una carta clara. Georgia/Arial son adaptaciones del canal; no cambian la tipografía web. Las dos imágenes son rasterizaciones de los SVG propios existentes, con atribución del lettering y registros de procedencia; no hay imágenes generadas.

Contrato emitido como primer comentario del body de `renderUmbraEmail`:

- THESIS: correo de cuenta Umbra, una acción clara.
- OWN-WORLD: isotipo de apertura y logo en minúsculas en contornos; grafito y papel.
- STORY: entender el evento y actuar con seguridad.
- FIRST VIEWPORT: carta de hasta 600 px, cabecera negra con marca, título amplio, cuerpo legible y acción en orden de lectura. En móvil, el cuerpo y la acción pueden continuar debajo del primer viewport según la longitud del mensaje.
- FORM: extensión de la identidad vigente, sin mundo visual nuevo.

Los diez tipos son `welcome`, `confirmation`, `invite`, `recovery`, `magic_link`, `email_change`, `reauthentication`, `password_changed`, `email_changed` y `delete_confirmation`. Comparten renderer HTML/texto; ocho se generan como plantillas Auth. La reautenticación usa código, bienvenida y confirmación agregan tres pasos, y los mensajes con acción ofrecen URL de respaldo. El mensaje de eliminación declara que el enlace abre una confirmación posterior.

Evidencia recibida: veinte comprobaciones de navegador y capturas de los diez tipos a 720 y 390 px en `.impeccable/review/emails/`, con verificación de imágenes, desborde y axe; revisión independiente `email_finish_review`: `SHIP`, sin correcciones materiales. El documenter contrastó código y una captura móvil representativa sin repetir QA. Las capturas permiten revisar diseño; no prueban entrega ni compatibilidad Gmail/Outlook, modo oscuro de correo o accesibilidad integral.

Pendiente operativo, separado del cierre visual: confirmar la instalación de las plantillas y el SMTP en el proyecto remoto de Supabase. La configuración comprobada aquí es local; el sandbox de Resend limita el envío al destinatario propio habilitado. La aceptación visual final corresponde a Matías. No hay una decisión de nueva marca pendiente dentro de esta extensión.

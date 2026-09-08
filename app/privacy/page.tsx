import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <Link
        href="/"
        className="font-body text-xs normal-case tracking-normal text-text-3 hover:text-text-1"
      >
        ← Volver
      </Link>
      <h1 className="mt-6 text-balance font-heading font-semibold text-5xl not-italic text-text-1 md:text-6xl">
        Política de privacidad
      </h1>
      <p className="mt-3 font-body text-xs tabular-nums text-text-3">
        Revisión local: 7 de septiembre de 2026 · pendiente de aprobación para publicación
      </p>
      <p className="mt-6 max-w-2xl text-pretty font-body text-base leading-relaxed text-text-2">
        Vamos al grano: lo que escribís en Umbra es tuyo. Esto explica qué hacemos con tus datos, dónde viven, quién los toca y cómo te los podés llevar.
      </p>

      <article className="prose prose-invert mt-10 space-y-8 font-body leading-relaxed text-text-2">
        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Quién es responsable</h2>
          <p className="mt-2 text-pretty">
            Matías Velez. TFG de Ingeniería en Software, Universidad Siglo 21 (Córdoba, Argentina).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Qué guardamos</h2>
          <p className="mt-2 text-pretty">
            Solo lo necesario para devolverte tu perfil: tu email, un nombre para saludarte, el texto que escribís durante el onboarding y en el chat, el perfil que el sistema arma con eso (puntajes Big Five, lectura de funciones cognitivas, arquetipo orientador), y datos técnicos mínimos (IP seudonimizada con HMAC y user agent) para auditoría de seguridad.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Por qué podemos guardarlo</h2>
          <p className="mt-2 text-pretty">
            El prototipo registra tu aceptación, versión y hash SHA-256 del mismo texto que presenta la pantalla de consentimiento. Las versiones anteriores permanecen en el historial. Estas funciones no acreditan por sí solas cumplimiento integral de la Ley 25.326.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Quién tiene acceso</h2>
          <p className="mt-2 text-pretty">
            Supabase guarda la cuenta y los datos con políticas de acceso por usuario. El responsable técnico puede acceder para mantenimiento y soporte. Anthropic recibe texto y contexto para onboarding, interpretación, narrativa, chat y actividades; el módulo propio de aprendizaje automático procesa texto para Big Five. Hosting y correo dependen de la configuración del entorno. Tus textos pueden contener datos identificatorios aunque no enviemos tu nombre en un campo separado.
          </p>
          <p className="mt-2 text-pretty">
            Están pendientes de verificar la región efectiva, las condiciones de retención de los proveedores, los respaldos y su restauración. No se garantiza que los proveedores borren el contenido inmediatamente después de procesarlo. Esta revisión local debe aprobarse y completarse antes de habilitar un entorno para personas usuarias reales.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Cuánto tiempo</h2>
          <p className="mt-2 text-pretty">
            Los datos de cuenta se conservan hasta solicitar su eliminación. Las contribuciones de investigación permanecen si no pedís también su purga. El código incluye purgas previstas a 30 días de ciertos payloads técnicos; su ejecución real requiere verificación. El borrado puede fallar parcialmente entre servicios: la pantalla informa el error y permite reintentar con un enlace vigente.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Tus derechos</h2>
          <p className="mt-2 text-pretty">
            Configuración reúne descarga de datos, cambio del nombre visible, participación en investigación y solicitud de eliminación. Otros pedidos se gestionan con el responsable del proyecto. Revisá el alcance y las condiciones completas en el texto de consentimiento antes de aceptar.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Umbra no es terapia</h2>
          <p className="mt-2 text-pretty">
            Este servicio es una herramienta de autoconocimiento. No reemplaza la atención profesional de salud mental. Si estás en crisis, llamá al 135 (Centro de Asistencia al Suicida, Argentina), al 911 o al 0800-999-0091 (Salud Mental Responde).
          </p>
        </section>
      </article>
    </main>
  );
}

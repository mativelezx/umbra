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
        Última actualización: 27 de abril de 2026
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
            Ley 25.326 de Protección de Datos Personales (Argentina). El tratamiento se apoya en tu consentimiento explícito, que firmás al registrarte y que registramos como hash SHA-256 del texto que viste, así podés probar mañana qué firmaste hoy.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Quién tiene acceso</h2>
          <p className="mt-2 text-pretty">
            Tres lugares, ninguno con tu identidad pegada al texto. Supabase (PostgreSQL en Brasil) guarda los datos con políticas de acceso por usuario; solo vos podés leer lo tuyo. Anthropic recibe tu texto solo para escribir tu narrativa y no lo guarda más allá del procesamiento. Nuestro módulo propio de aprendizaje automático infiere los puntajes Big Five sin guardar tu texto. Para hosting y mail transaccional usamos Vercel y Resend.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Cuánto tiempo</h2>
          <p className="mt-2 text-pretty">
            Mientras tu cuenta esté activa. Podés eliminarla cuando quieras desde Configuración y borramos todo en cascada. Algunos payloads técnicos (debug y auditoría) se purgan solos a los 30 días.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Tus derechos</h2>
          <p className="mt-2 text-pretty">
            Tenés derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos. Cualquiera de esas acciones está disponible en Configuración. El tiempo de respuesta es de 10 días hábiles. Para reclamos formales tenés derecho a presentarte ante la Agencia de Acceso a la Información Pública (AAIP).
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

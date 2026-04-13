import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wider text-text-3 hover:text-text-1"
      >
        ← Volver
      </Link>
      <h1 className="mt-6 font-display text-5xl italic text-text-1 md:text-6xl">
        Política de privacidad
      </h1>
      <p className="mt-3 font-mono text-xs text-text-3">
        Última actualización: 13 de abril de 2026
      </p>

      <article className="prose prose-invert mt-10 font-body text-text-2 leading-relaxed space-y-8">
        <section>
          <h2 className="font-display text-2xl text-text-1">Responsable del tratamiento</h2>
          <p className="mt-2">
            Matías Velez. TFG de Ingeniería en Software, Universidad Siglo 21 (Argentina).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Datos que recolectamos</h2>
          <p className="mt-2">
            Umbra recolecta únicamente los datos necesarios para prestar el servicio: email
            para autenticación, textos introspectivos que vos ingresás voluntariamente, el
            perfil psicológico generado por el análisis de IA, y datos técnicos mínimos (IP
            seudonimizada, user agent) para seguridad y auditoría.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Base legal</h2>
          <p className="mt-2">
            Ley 25.326 de Protección de Datos Personales (Argentina). El tratamiento se basa
            en tu consentimiento explícito e informado, manifestado en el flujo de consent al
            registrarte.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Uso de terceros</h2>
          <p className="mt-2">
            Supabase (autenticación y base de datos). Anthropic Claude (análisis de IA). Vercel
            (hosting). Resend (email transaccional). Ninguno recibe datos más allá de los
            estrictamente necesarios para cumplir su función, y ninguno tiene permiso para
            usar tus datos con fines propios.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Retención</h2>
          <p className="mt-2">
            Tus datos permanecen mientras tu cuenta esté activa. Podés eliminar tu cuenta y
            todos tus datos personales en cualquier momento desde Configuración. Algunos
            payloads técnicos (debug y auditoría) se purgan automáticamente a los 30 días.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Tus derechos (Ley 25.326)</h2>
          <p className="mt-2">
            Tenés derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus
            datos. Podés ejercer estos derechos desde la sección Configuración. El tiempo de
            respuesta es de 10 días hábiles.
          </p>
          <p className="mt-2">
            Para reclamos formales podés presentarte ante la Agencia de Acceso a la
            Información Pública (AAIP).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Umbra no es terapia</h2>
          <p className="mt-2">
            Este servicio es una herramienta de autoconocimiento, no reemplaza ni pretende
            reemplazar atención de salud mental profesional. Si estás en crisis emocional,
            contactá inmediatamente al 135 (Centro de Asistencia al Suicida, Argentina) o al
            911.
          </p>
        </section>
      </article>
    </main>
  );
}

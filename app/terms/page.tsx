import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <Link
        href="/"
        className="font-body text-xs normal-case tracking-normal text-text-3 hover:text-text-1"
      >
        ← Volver
      </Link>
      <h1 className="mt-6 text-balance font-heading font-semibold text-5xl not-italic text-text-1 md:text-6xl">
        Términos de uso
      </h1>
      <p className="mt-3 font-body text-xs tabular-nums text-text-3">
        Última actualización: 27 de abril de 2026
      </p>
      <p className="mt-6 max-w-2xl text-pretty font-body text-base leading-relaxed text-text-2">
        Estos términos explican cómo se usa Umbra y qué asumimos cuando entrás. Cortos, en castellano de verdad.
      </p>

      <article className="prose prose-invert mt-10 space-y-8 font-body leading-relaxed text-text-2">
        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Qué es Umbra</h2>
          <p className="mt-2 text-pretty">
            Una plataforma de autoconocimiento que usa un módulo propio de inteligencia artificial para inferir tus puntajes Big Five sobre el texto que escribís, y un proveedor externo de IA generativa para escribir un retrato narrativo y un plan personal. Marcos teóricos: Goldberg (1999) IPIP-NEO, Jung (1921), Pearson (1991), Calvo y Peters (2014).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Lo que no es</h2>
          <p className="mt-2 text-pretty">
            Umbra no es terapia. No reemplaza atención profesional de salud mental. Si estás en crisis emocional, llamá al 135 (Argentina), al 911 o al 0800-999-0091 (Salud Mental Responde, Lun a Vie 8 a 20 h).
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Uso responsable</h2>
          <p className="mt-2 text-pretty">
            Necesitás al menos 18 años para usar Umbra. No publiques contenido ilegal, abusivo u ofensivo. No intentes extracción masiva de datos ni ingeniería inversa del sistema.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Propiedad intelectual</h2>
          <p className="mt-2 text-pretty">
            Umbra es un Trabajo Final de Grado académico. El código fuente y la base de conocimiento se apoyan en fuentes académicas públicas. Tus textos son tuyos.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Sin garantías</h2>
          <p className="mt-2 text-pretty">
            El servicio se provee tal cual. No garantizamos que el análisis sea correcto, completo o apropiado para algún fin particular. Es experimental y forma parte de un proyecto académico.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-2xl text-text-1">Jurisdicción</h2>
          <p className="mt-2 text-pretty">
            Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se resolverá ante los tribunales ordinarios de la Ciudad de Córdoba.
          </p>
        </section>
      </article>
    </main>
  );
}

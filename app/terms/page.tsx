import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wider text-text-3 hover:text-text-1"
      >
        ← Volver
      </Link>
      <h1 className="mt-6 font-display text-5xl italic text-text-1 md:text-6xl">
        Términos de uso
      </h1>
      <p className="mt-3 font-mono text-xs text-text-3">
        Última actualización: 13 de abril de 2026
      </p>

      <article className="prose prose-invert mt-10 font-body text-text-2 leading-relaxed space-y-8">
        <section>
          <h2 className="font-display text-2xl text-text-1">Descripción del servicio</h2>
          <p className="mt-2">
            Umbra es una plataforma de autoconocimiento que usa IA para generar perfiles
            psicológicos, narrativas personalizadas, y conversaciones reflexivas, basándose en
            marcos teóricos de Jung, Big Five (IPIP-NEO) y Positive Computing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Umbra NO es terapia</h2>
          <p className="mt-2">
            Umbra es una herramienta de autoconocimiento. No reemplaza ni pretende reemplazar
            atención psicológica profesional. Si estás en crisis emocional, llamá al 135
            (Argentina) o al 911.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Uso responsable</h2>
          <p className="mt-2">
            Es necesario tener al menos 18 años para usar Umbra. No publiques contenido
            ilegal, abusivo, ofensivo, o que viole derechos de terceros. No intentes
            extracción de datos a gran escala o ingeniería inversa del sistema.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Propiedad intelectual</h2>
          <p className="mt-2">
            Umbra es un Trabajo Final de Grado académico. El código fuente y la knowledge base
            se basan en fuentes académicas públicas (IPIP-NEO de Goldberg 1999, Tipos
            Psicológicos de Jung 1921, Positive Computing de Calvo & Peters 2014, arquetipos
            aplicados de Pearson 1991). Tus textos son tuyos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Limitación de responsabilidad</h2>
          <p className="mt-2">
            Umbra se provee "tal cual". No garantizamos que el análisis sea correcto,
            completo, o apropiado para ningún fin particular. El servicio es experimental y
            forma parte de un proyecto académico.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-text-1">Jurisdicción</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de la República Argentina. Cualquier
            disputa se resolverá ante los tribunales ordinarios de la Ciudad de Córdoba.
          </p>
        </section>
      </article>
    </main>
  );
}

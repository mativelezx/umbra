export default function LandingPage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-text-3">
        Umbra · Fase 1 — scaffolding
      </p>
      <h1 className="mt-8 font-display text-6xl leading-[1.05] text-text-1 md:text-8xl">
        Conocé tu sombra.
        <br />
        <span className="italic text-violet-300">Iluminá tu camino.</span>
      </h1>
      <p className="mt-8 max-w-2xl font-body text-lg text-text-2">
        Plataforma de autoconocimiento que triangula Jung, Big Five y Positive
        Computing. Esta pantalla existe solo para validar el scaffolding — las
        fases siguientes completan el landing, el onboarding y el análisis.
      </p>
      <div className="mt-12 inline-flex items-center gap-3 rounded-full border border-violet-400/20 bg-violet-400/5 px-6 py-3 font-heading text-sm text-text-2 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(180,102,255,0.8)]" />
        Fase 1 — scaffolding + config listo
      </div>
    </main>
  );
}

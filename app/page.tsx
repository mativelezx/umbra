import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/layout/Brand';
import { ReflectionArt } from '@/components/ui/ReflectionArt';
import { t } from '@/lib/i18n/dict';

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-7 md:px-10">
        <Brand />
        <Link href="/login" className="secondary-link">Ingresar</Link>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:px-10 md:pb-28 md:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.035em] md:text-6xl lg:text-7xl">Un espacio para mirarte con atención.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-text-2">Respondé preguntas sobre vos, explorá una lectura experimental y elegí una actividad para reflexionar. A tu ritmo.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="primary-link">Empezar <ArrowRight size={20} /></Link>
            <Link href="#como" className="secondary-link">Cómo funciona</Link>
          </div>
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <Link href="/onboarding" className="mt-5 inline-flex min-h-11 items-center text-sm underline">Recorrer el ejemplo local</Link>}
          <p className="mt-7 max-w-lg text-sm leading-relaxed text-text-3">Un proyecto académico de autoconocimiento. No reemplaza el acompañamiento profesional.</p>
        </div>
        <div className="mx-auto w-full max-w-[300px] md:max-w-[420px] lg:max-w-none">
          <ReflectionArt reveal />
          <p className="mx-auto mt-4 max-w-xs text-center text-base font-medium leading-relaxed text-text-2">¿En qué momentos sentís que podés ser vos?</p>
          <p className="mt-2 text-center text-sm text-text-3">Una pregunta de reflexión como ejemplo.</p>
        </div>
      </section>
      <section id="como" className="border-y border-violet-400/20 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">De tus respuestas a una próxima acción.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ['Respondé', 'Compartí tus respuestas después de revisar el consentimiento. Elegí conversar o traer un texto que ya tengas.'],
              ['Explorá tu lectura', 'Leé el resultado con su origen y sus límites: estimación experimental de Big Five e interpretación de IA inspirada en Jung.'],
              ['Elegí una actividad', 'Encontrá una sugerencia para reflexionar y marcá los pasos que vas haciendo. También podés descargar tu informe.'],
            ].map(([title, body], i) => <li key={title} className="border-t border-violet-400/20 pt-5"><span className="text-sm tabular-nums text-text-3">Paso {i + 1}</span><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-text-2">{body}</p></li>)}
          </ol>
        </div>
      </section>
      <section id="pilares" className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_1.4fr] md:px-10">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Una lectura para pensar. Con sus límites a la vista.</h2>
        <div className="space-y-8">
          {[
            ['Big Five experimental', 'El módulo de aprendizaje automático estima dimensiones a partir de texto. No es un test validado de precisión individual; las dimensiones sin respaldo quedan sin cifra.'],
            ['Jung como interpretación', 'La IA propone una lectura simbólica, no una etiqueta definitiva sobre quién sos. Puede equivocarse.'],
            ['Actividades de reflexión', 'Sugerencias vinculadas con Positive Computing para explorar lo que te resulte útil, sin promesas de resultados.'],
            ['Tus datos y tus decisiones', 'Podés consultar los controles de acceso, exportación y eliminación de datos. Revisá el alcance en la política de privacidad.'],
          ].map(([title, body]) => <article key={title} className="border-b border-violet-400/20 pb-8"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-text-2">{body}</p></article>)}
        </div>
      </section>
      <footer className="border-t border-violet-400/20 px-6 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-6"><Brand /><nav aria-label="Información" className="flex gap-6 text-sm"><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link><Link href="/login">Ingresar</Link></nav></div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-3">{t('landing.footer_not_therapy')}</p>
          <p className="mt-4 text-sm text-text-3">Umbra · Trabajo Final de Graduación · Universidad Siglo 21</p>
        </div>
      </footer>
    </main>
  );
}

'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { Brand } from '@/components/layout/Brand';
import { ReflectionArt } from '@/components/ui/ReflectionArt';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';
interface ModeSelectorProps { onPick: (mode: OnboardingEntryMode) => void; }

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return <main className="mx-auto max-w-3xl px-6 py-8 md:py-12">
    <Brand />
    <header className="mb-10 mt-14">
      <h1 className="text-4xl font-bold tracking-[-0.025em] md:text-5xl">¿Cómo querés empezar?</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-2">Elegí cómo compartir tus respuestas. No hay una forma correcta de contar quién sos.</p>
    </header>
    {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="mb-6 rounded-md border border-violet-400/20 p-4 text-sm leading-relaxed text-text-2">Ejemplo local. Las preguntas y el resultado están preparados con datos ficticios; tus respuestas no generan un análisis real.</p>}
    <div className="space-y-4">
      {[
        { mode: 'dynamic' as const, title: 'Responder preguntas', body: 'Una pregunta por vez, con espacio para escribir y elegir. Podés revisar tus respuestas.', art: 'dialogue' as const },
        { mode: 'chatgpt-seed' as const, title: 'Traer un texto de ChatGPT', body: 'Copiá un texto que ya tengas, revisalo y completá algunas preguntas para darle contexto.', art: 'pages' as const },
      ].map(({ mode, title, body, art }) => <button key={mode} type="button" onClick={() => onPick(mode)} className="mode-choice group grid w-full grid-cols-[64px_1fr] items-center gap-x-5 gap-y-4 rounded-lg border border-violet-400/20 bg-white p-5 text-left md:grid-cols-[100px_1fr_24px] md:p-7">
        <ReflectionArt variant={art} className="w-16 md:w-24" />
        <span className="min-w-0"><span className="block text-xl font-bold tracking-tight md:text-2xl">{title}</span><span className="mt-2 block text-sm leading-relaxed text-text-2 md:text-base">{body}</span></span>
        <ArrowRight size={22} className="col-start-2 justify-self-end md:col-start-3 md:row-start-1" />
      </button>)}
    </div>
    <p className="mt-8 text-sm leading-relaxed text-text-3">Umbra ofrece una lectura experimental para reflexionar. No es terapia ni un diagnóstico.</p>
  </main>;
}

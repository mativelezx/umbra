'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { Brand } from '@/components/layout/Brand';
import { ReflectionArt } from '@/components/ui/ReflectionArt';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';
interface ModeSelectorProps { onPick: (mode: OnboardingEntryMode) => void; }

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return <div className="focus-backdrop"><main className="focus-entry mx-auto max-w-3xl px-6 py-8 md:py-12">
    <Brand />
    <header className="mb-6 mt-8 md:mt-12">
      <h1 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">¿Cómo querés empezar?</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-text-2">Podés responder desde cero o traer un texto que ya tengas. Lo importante es sumar tu propia experiencia.</p>
    </header>
    {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="mb-6 rounded-md border border-violet-400/20 p-4 text-sm leading-relaxed text-text-2">Ejemplo local. Las preguntas y el resultado están preparados con datos ficticios; tus respuestas no generan un análisis real.</p>}
    <div className="space-y-4">
      {[
        { mode: 'dynamic' as const, title: 'Responder preguntas', body: 'Si es tu primera vez, empezá acá. Hasta 8 preguntas sobre situaciones cotidianas, para escribir o elegir una respuesta.', art: 'dialogue' as const },
        { mode: 'chatgpt-seed' as const, title: 'Traer un texto de ChatGPT', body: 'Si ya tenés un texto sobre vos, pegalo y revisalo. Después respondés hasta 3 preguntas, incluida una con tus propias palabras.', art: 'pages' as const },
      ].map(({ mode, title, body, art }) => <button key={mode} type="button" onClick={() => onPick(mode)} className={`mode-choice group grid w-full grid-cols-[1fr_72px] items-center gap-x-5 gap-y-4 rounded-2xl p-6 text-left md:grid-cols-[1fr_112px] md:p-8 ${mode === 'dynamic' ? 'dark-surface' : 'bg-white'}`}>
        <span className="min-w-0"><span className="block text-2xl font-bold tracking-tight">{title}</span><span className={`mt-3 block text-sm leading-relaxed md:text-base ${mode === 'dynamic' ? 'text-white/80' : 'text-text-2'}`}>{body}</span></span>
        <ReflectionArt variant={art} className="w-full" />
        <span aria-hidden="true" className={`flex h-11 w-11 items-center justify-center rounded-full ${mode === 'dynamic' ? 'bg-white text-text-1' : 'bg-umbra-shadow'}`}><ArrowRight size={22} /></span>
      </button>)}
    </div>
    <p className="mt-8 text-sm leading-relaxed text-text-3">Después podés sumar un cuestionario opcional y ver tu lectura. La IA puede equivocarse: vos decidís qué te representa. No es terapia ni diagnóstico.</p>
  </main></div>;
}

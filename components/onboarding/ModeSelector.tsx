'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { Brand } from '@/components/layout/Brand';
import { ReflectionArt } from '@/components/ui/ReflectionArt';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';
interface ModeSelectorProps { onPick: (mode: OnboardingEntryMode) => void; }

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return <main className="mx-auto max-w-3xl px-6 py-8 md:py-12">
    <Brand />
    <header className="mb-6 mt-8 md:mt-12">
      <h1 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">¿Cómo querés empezar?</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-text-2">Elegí cómo compartir tus respuestas. No hay una forma correcta de contar quién sos.</p>
    </header>
    {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="mb-6 rounded-md border border-violet-400/20 p-4 text-sm leading-relaxed text-text-2">Ejemplo local. Las preguntas y el resultado están preparados con datos ficticios; tus respuestas no generan un análisis real.</p>}
    <div className="space-y-4">
      {[
        { mode: 'dynamic' as const, title: 'Responder preguntas', body: 'Una pregunta por vez, con espacio para escribir y elegir. Podés revisar tus respuestas.', art: 'dialogue' as const },
        { mode: 'chatgpt-seed' as const, title: 'Traer un texto de ChatGPT', body: 'Copiá un texto que ya tengas, revisalo y completá algunas preguntas para darle contexto.', art: 'pages' as const },
      ].map(({ mode, title, body, art }) => <button key={mode} type="button" onClick={() => onPick(mode)} className={`mode-choice group grid w-full grid-cols-[1fr_72px] items-center gap-x-5 gap-y-4 rounded-2xl p-6 text-left md:grid-cols-[1fr_112px] md:p-8 ${mode === 'dynamic' ? 'dark-surface' : 'bg-white'}`}>
        <span className="min-w-0"><span className="block text-2xl font-bold tracking-tight">{title}</span><span className={`mt-3 block text-sm leading-relaxed md:text-base ${mode === 'dynamic' ? 'text-white/80' : 'text-text-2'}`}>{body}</span></span>
        <ReflectionArt variant={art} className="w-full" />
        <span aria-hidden="true" className={`flex h-11 w-11 items-center justify-center rounded-full ${mode === 'dynamic' ? 'bg-white text-text-1' : 'bg-umbra-shadow'}`}><ArrowRight size={22} /></span>
      </button>)}
    </div>
    <p className="mt-8 text-sm leading-relaxed text-text-3">Umbra ofrece una lectura experimental para reflexionar. No es terapia ni un diagnóstico.</p>
  </main>;
}

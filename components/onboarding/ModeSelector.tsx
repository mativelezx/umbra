'use client';

import { ArrowRight, ChatCircle, Note } from '@phosphor-icons/react';
import { Brand } from '@/components/layout/Brand';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';
interface ModeSelectorProps { onPick: (mode: OnboardingEntryMode) => void; }

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return <main className="mx-auto max-w-3xl px-6 py-8 md:py-12">
    <Brand />
    <header className="mb-10 mt-14">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">¿Cómo querés empezar?</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-2">Elegí cómo compartir tus respuestas. No hay una forma correcta de contar quién sos.</p>
    </header>
    {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="mb-6 rounded-md border border-violet-400/20 p-4 text-sm leading-relaxed text-text-2">Ejemplo local. Las preguntas y el resultado están preparados con datos ficticios; tus respuestas no generan un análisis real.</p>}
    <div className="divide-y divide-violet-400/20 border-y border-violet-400/20">
      {[
        { mode: 'dynamic' as const, title: 'Responder preguntas', body: 'Una pregunta por vez, con espacio para escribir y elegir. Podés revisar tus respuestas.', Icon: ChatCircle },
        { mode: 'chatgpt-seed' as const, title: 'Traer un texto de ChatGPT', body: 'Copiá un texto que ya tengas, revisalo y completá algunas preguntas para darle contexto.', Icon: Note },
      ].map(({ mode, title, body, Icon }) => <button key={mode} type="button" onClick={() => onPick(mode)} className="group flex w-full items-start gap-5 rounded-md px-2 py-8 text-left transition-colors hover:bg-umbra-fog">
        <Icon size={28} className="mt-1 shrink-0" />
        <span className="flex-1"><span className="block text-xl font-semibold">{title}</span><span className="mt-2 block leading-relaxed text-text-2">{body}</span></span>
        <ArrowRight size={22} className="mt-1 shrink-0" />
      </button>)}
    </div>
    <p className="mt-8 text-sm leading-relaxed text-text-3">Umbra ofrece una lectura experimental para reflexionar. No es terapia ni un diagnóstico.</p>
  </main>;
}

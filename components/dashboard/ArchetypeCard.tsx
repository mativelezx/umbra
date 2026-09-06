import type { Archetype } from '@/types';
import { ARCHETYPE_INFO } from '@/types';
import { ReflectionArt } from '@/components/ui/ReflectionArt';

interface ArchetypeCardProps {
  archetype: Archetype;
  secondary?: string;
  confidence?: number | null;
  turnsCount?: number | null;
}

export function ArchetypeCard({ archetype, secondary, turnsCount }: ArchetypeCardProps) {
  const info = ARCHETYPE_INFO[archetype];
  return (
    <section className="grid items-center gap-x-8 gap-y-5 border-y border-violet-400/20 py-6 md:grid-cols-[180px_1fr] md:py-8">
      <ReflectionArt className="mx-auto w-36 md:w-full" />
      <div className="min-w-0">
        <h2 className="text-4xl font-bold tracking-[-0.025em] md:text-5xl">{info.name}</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-text-2">{info.description}</p>
        {secondary && <p className="mt-3 text-sm text-text-2">También aparece: {secondary}.</p>}
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-3">Interpretación de IA inspirada en Jung. Este arquetipo es una figura simbólica, no un diagnóstico ni una descripción definitiva de vos.</p>
        {typeof turnsCount === 'number' && turnsCount > 0 && <p className="mt-2 text-sm text-text-3">A partir de {turnsCount} respuestas.</p>}
      </div>
    </section>
  );
}

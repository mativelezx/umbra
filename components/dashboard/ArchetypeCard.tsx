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
    <section className="dark-surface relative overflow-hidden rounded-2xl p-6 md:p-8">
      <ReflectionArt className="float-right -mr-2 -mt-1 ml-4 w-20 md:ml-8 md:w-36" />
      <div className="min-w-0">
        <h2 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">{info.name}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{info.description}</p>
        {secondary && <p className="mt-3 text-sm text-white/80">También aparece: {secondary}.</p>}
        <div className="clear-both pt-5"><p className="max-w-2xl border-t border-white/20 pt-4 text-sm leading-relaxed text-white/80">Interpretación de IA inspirada en Jung. Este arquetipo es una figura simbólica, no un diagnóstico ni una descripción definitiva de vos.</p>
        {typeof turnsCount === 'number' && turnsCount > 0 && <p className="mt-2 text-sm text-white/80">A partir de {turnsCount} respuestas.</p>}</div>
      </div>
    </section>
  );
}

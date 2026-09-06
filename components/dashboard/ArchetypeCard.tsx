import type { Archetype } from '@/types';
import { ARCHETYPE_INFO } from '@/types';
import { PhosphorIcon } from '@/components/onboarding/cards/PhosphorIcon';

interface ArchetypeCardProps {
  archetype: Archetype;
  secondary?: string;
  confidence?: number | null;
  turnsCount?: number | null;
}

export function ArchetypeCard({ archetype, secondary, turnsCount }: ArchetypeCardProps) {
  const info = ARCHETYPE_INFO[archetype];
  return (
    <section className="grid gap-6 border-y border-violet-400/20 py-8 md:grid-cols-[72px_1fr] md:py-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-umbra-shadow text-text-1">
        <PhosphorIcon name={info.icon} size={32} weight="regular" />
      </div>
      <div>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{info.name}</h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-text-2">{info.description}</p>
        {secondary && <p className="mt-3 text-sm text-text-2">También aparece: {secondary}.</p>}
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-3">Interpretación de IA inspirada en Jung. Este arquetipo es una figura simbólica, no un diagnóstico ni una descripción definitiva de vos.</p>
        {typeof turnsCount === 'number' && turnsCount > 0 && <p className="mt-2 text-sm text-text-3">A partir de {turnsCount} respuestas.</p>}
      </div>
    </section>
  );
}

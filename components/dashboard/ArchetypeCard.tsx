import type { Archetype } from '@/types';
import { ARCHETYPE_INFO } from '@/types';
import { ArchetypeSvg } from './archetypes';
import { Badge } from '@/components/ui/Badge';

interface ArchetypeCardProps {
  archetype: Archetype;
  secondary?: string;
}

export function ArchetypeCard({ archetype, secondary }: ArchetypeCardProps) {
  const info = ARCHETYPE_INFO[archetype];

  return (
    <section className="card-glow relative overflow-hidden rounded-lg p-8 md:p-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-3">
        Tu arquetipo dominante
      </p>
      <div className="mt-6 flex flex-col items-start gap-8 md:flex-row md:items-center">
        <div className="shrink-0">
          <ArchetypeSvg archetype={archetype} size={140} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-5xl italic text-text-1 md:text-6xl">
            {info.name}
          </h2>
          <p className="mt-4 max-w-md font-body text-base leading-relaxed text-text-2">
            {info.description}
          </p>
          {secondary && (
            <div className="mt-5">
              <Badge variant="violet">+ {secondary}</Badge>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import type { Archetype } from '@/types';
import { ARCHETYPE_INFO } from '@/types';
import { ArchetypeSvg } from './archetypes';
import { Badge } from '@/components/ui/Badge';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface ArchetypeCardProps {
  archetype: Archetype;
  secondary?: string;
  confidence?: number | null;
  turnsCount?: number | null;
}

export function ArchetypeCard({
  archetype,
  secondary,
  confidence,
  turnsCount,
}: ArchetypeCardProps) {
  const info = ARCHETYPE_INFO[archetype];
  const showCertainty = typeof confidence === 'number';

  return (
    <section className="card-glow relative overflow-hidden rounded-2xl p-8 md:p-10">
      <div className="flex items-center gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-3">
          Tu arquetipo orientador
        </p>
        <InfoPopover
          title="¿Qué es un arquetipo orientador?"
          body="Una figura simbólica que organiza tu retrato escrito. No es un diagnóstico ni una etiqueta: es una lectura interpretativa que la capa narrativa propone a partir de tu perfil. Tomalo como punto de partida, no como destino."
        />
      </div>
      <div className="mt-6 flex flex-col items-start gap-8 md:flex-row md:items-center">
        <div className="shrink-0">
          <ArchetypeSvg archetype={archetype} size={140} />
        </div>
        <div className="flex-1">
          <h2 className="text-balance font-display text-5xl italic text-text-1 md:text-6xl">
            {info.name}
          </h2>
          <p className="mt-4 max-w-md text-pretty font-body text-lg leading-relaxed text-text-2">
            {info.description}
          </p>
          {secondary && (
            <div className="mt-5">
              <Badge variant="violet">Con un toque de {secondary}</Badge>
            </div>
          )}
        </div>
      </div>

      {showCertainty && (
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-violet-400/10 pt-5">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
              Certeza del retrato
            </p>
            <InfoPopover
              title="¿Qué es la certeza del retrato?"
              body="Es qué tan seguro está el análisis de tu perfil, basándose en la cantidad y claridad de los textos que compartiste. No es una nota: un valor bajo significa que podemos refinar con más contexto, no que el retrato sea incorrecto."
              example="Con pocas respuestas cortas la certeza suele quedar entre 40 y 60; con respuestas más largas y matizadas sube a 75-90."
            />
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative h-1.5 w-40 overflow-hidden rounded-full bg-umbra-shadow/70"
              role="progressbar"
              aria-label="Certeza del retrato"
              aria-valuenow={confidence ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-violet-200"
                style={{ width: `${Math.min(100, Math.max(0, confidence ?? 0))}%` }}
              />
            </div>
            <span className="font-mono text-sm tabular-nums text-violet-200">
              {confidence}%
            </span>
          </div>
          {typeof turnsCount === 'number' && turnsCount > 0 && (
            <p className="font-mono text-[10px] text-text-3">
              basado en {turnsCount}{' '}
              {turnsCount === 1 ? 'respuesta' : 'respuestas'}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

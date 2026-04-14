'use client';

import { useEffect, useState } from 'react';
import { Card, GlassCard } from '@/components/ui/Card';
import { DimensionBar } from '@/components/ui/DimensionBar';
import { cn } from '@/lib/utils';
import { ARCHETYPE_INFO } from '@/types';
import { BIG_FIVE_LABELS, JUNG_LABELS } from '@/lib/dimensions/labels';
import type {
  BigFiveDimension,
  InsightPing as InsightPingType,
  JungFunctionKey,
  WorkingProfile,
} from '@/types';
import { InsightPing } from './InsightPing';
import { PhosphorIcon } from './cards/PhosphorIcon';

const BIG_FIVE_SHORT: Record<BigFiveDimension, string> = {
  openness: BIG_FIVE_LABELS.openness.label,
  conscientiousness: BIG_FIVE_LABELS.conscientiousness.label,
  extraversion: BIG_FIVE_LABELS.extraversion.label,
  agreeableness: BIG_FIVE_LABELS.agreeableness.label,
  neuroticism: BIG_FIVE_LABELS.neuroticism.label,
};

const JUNG_SHORT: Record<JungFunctionKey, string> = {
  Se: JUNG_LABELS.Se.label,
  Si: JUNG_LABELS.Si.label,
  Ne: JUNG_LABELS.Ne.label,
  Ni: JUNG_LABELS.Ni.label,
  Te: JUNG_LABELS.Te.label,
  Ti: JUNG_LABELS.Ti.label,
  Fe: JUNG_LABELS.Fe.label,
  Fi: JUNG_LABELS.Fi.label,
};

interface LiveProfilePanelProps {
  workingProfile: WorkingProfile | null;
  insights: InsightPingType[];
  turnNumber: number;
  maxTurns: number;
  onExpireInsight: (id: string) => void;
}

export function LiveProfilePanel({
  workingProfile,
  insights,
  turnNumber,
  maxTurns,
  onExpireInsight,
}: LiveProfilePanelProps) {
  const progress = Math.min(100, Math.round(((turnNumber - 1) / maxTurns) * 100));

  return (
    <aside className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Tu perfil en vivo
          </p>
          <span className="font-mono text-[10px] text-text-3">
            turno {turnNumber}/{maxTurns}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-umbra-shadow/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <section className="flex min-h-[72px] flex-col gap-2">
        {insights.length === 0 ? (
          <p className="font-body text-xs italic text-text-3/70">
            Todavía no hay descubrimientos. Respondé la primera pregunta y aparecen.
          </p>
        ) : (
          insights.map((p) => (
            <InsightPing key={p.id} ping={p} onExpire={onExpireInsight} />
          ))
        )}
      </section>

      {workingProfile && (
        <>
          <GlassCard className="flex flex-col gap-3 p-5">
            <h3 className="font-heading text-xs uppercase tracking-wider text-text-3">
              Big Five
            </h3>
            {(Object.keys(BIG_FIVE_SHORT) as BigFiveDimension[]).map((k) => {
              const est = workingProfile.bigFive[k];
              const emphasized = est.confidence > 60;
              return (
                <DimensionBar
                  key={k}
                  label={BIG_FIVE_SHORT[k]}
                  value={est.value}
                  emphasized={emphasized}
                  className={cn(est.confidence < 20 && 'opacity-40')}
                />
              );
            })}
          </GlassCard>

          <GlassCard className="flex flex-col gap-2.5 p-5">
            <h3 className="font-heading text-xs uppercase tracking-wider text-text-3">
              Funciones Jung
            </h3>
            {(Object.keys(JUNG_SHORT) as JungFunctionKey[]).map((k) => {
              const est = workingProfile.jungFunctions[k];
              const emphasized = est.confidence > 60 && est.value > 60;
              return (
                <CompactBar
                  key={k}
                  label={JUNG_SHORT[k]}
                  value={est.value}
                  emphasized={emphasized}
                  dimmed={est.confidence < 20}
                />
              );
            })}
          </GlassCard>

          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-xs uppercase tracking-wider text-text-3">
              Arquetipos candidatos
            </h3>
            {workingProfile.archetypeCandidates.length === 0 ? (
              <p className="font-body text-xs italic text-text-3/70">
                Se definen a medida que respondés.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {workingProfile.archetypeCandidates.map((cand, idx) => {
                  const info = ARCHETYPE_INFO[cand.key];
                  const top = idx === 0;
                  return (
                    <li key={cand.key}>
                      <Card
                        glow={top}
                        className={cn(
                          'flex items-center gap-3 p-4 transition-all duration-500',
                          !top && 'opacity-70',
                        )}
                      >
                        <PhosphorIcon
                          name={info.icon}
                          size={top ? 26 : 20}
                          weight={top ? 'duotone' : 'thin'}
                          className={cn(
                            'shrink-0',
                            top ? 'text-violet-200' : 'text-text-3',
                          )}
                        />
                        <div className="flex flex-1 flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                'font-display text-sm italic',
                                top ? 'text-text-1' : 'text-text-2',
                              )}
                            >
                              {info.name}
                            </span>
                            <span className="font-mono text-[10px] text-text-3">
                              {cand.confidence}%
                            </span>
                          </div>
                          {top && (
                            <p className="font-body text-[11px] leading-snug text-text-3">
                              {cand.rationale}
                            </p>
                          )}
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border border-violet-400/15 bg-umbra-shadow/40 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-3">
              Confianza global
            </span>
            <span className="font-mono text-sm tabular-nums text-violet-200">
              {workingProfile.overallConfidence}
            </span>
          </div>
        </>
      )}
    </aside>
  );
}

function CompactBar({
  label,
  value,
  emphasized,
  dimmed,
}: {
  label: string;
  value: number;
  emphasized: boolean;
  dimmed: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('flex flex-col gap-1', dimmed && 'opacity-40')}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'font-mono text-[10px]',
            emphasized ? 'text-violet-200' : 'text-text-3',
          )}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-3">{value}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-umbra-shadow/70">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            emphasized
              ? 'bg-gradient-to-r from-violet-500 to-violet-200'
              : 'bg-gradient-to-r from-violet-600/70 to-violet-400/70',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Intentionally unused export kept for potential future use in SignalBadge ping stack.
export type { LiveProfilePanelProps };

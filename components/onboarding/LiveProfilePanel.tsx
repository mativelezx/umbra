'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Card, GlassCard } from '@/components/ui/Card';
import { DimensionBar } from '@/components/ui/DimensionBar';
import { InfoPopover } from '@/components/ui/InfoPopover';
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
  /**
   * Deprecated. Insights no longer auto-expire — they accumulate in a
   * collapsible list so the user can re-read them any time. The callback
   * is retained for backward compatibility with existing callers but is
   * not invoked.
   */
  onExpireInsight?: (id: string) => void;
}

export function LiveProfilePanel({
  workingProfile,
  insights,
  turnNumber,
  maxTurns,
}: LiveProfilePanelProps) {
  const progress = Math.min(100, Math.round(((turnNumber - 1) / maxTurns) * 100));
  const [insightsExpanded, setInsightsExpanded] = useState(true);

  return (
    <aside className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Tu perfil en vivo
            <span className="ml-2 normal-case tracking-normal text-text-4">
              — estimación provisoria de la conversación, no la medición final
            </span>
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

      <section className="flex flex-col gap-2">
        {insights.length === 0 ? (
          <p className="font-body text-xs italic text-text-3/70">
            Todavía no hay descubrimientos. Respondé la primera pregunta y aparecen.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setInsightsExpanded((v) => !v)}
              aria-expanded={insightsExpanded}
              className="flex items-center justify-between gap-2 rounded-md border border-violet-400/15 bg-umbra-shadow/30 px-3 py-2 text-left transition-colors hover:border-violet-400/30 hover:bg-umbra-shadow/50"
            >
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
                  Descubrimientos
                </span>
                <span className="font-mono text-xs tabular-nums text-violet-200">
                  {insights.length}
                </span>
              </span>
              <CaretDown
                size={14}
                weight="bold"
                className={cn(
                  'text-text-3 transition-transform duration-300',
                  insightsExpanded ? 'rotate-180' : 'rotate-0',
                )}
              />
            </button>
            {insightsExpanded && (
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {insights.map((p) => (
                  <InsightPing key={p.id} ping={p} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {workingProfile && (
        <>
          <GlassCard className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-xs uppercase tracking-wider text-text-3">
                Big Five
              </h3>
              <InfoPopover
                title="Big Five (OCEAN)"
                body="Cinco dimensiones de personalidad validadas empíricamente (Goldberg, IPIP-NEO). No son tipos: son gradientes. Cada persona está en algún punto de cada uno, y las combinaciones definen matices, no categorías rígidas."
              />
            </div>
            {(Object.keys(BIG_FIVE_SHORT) as BigFiveDimension[]).map((k) => {
              const est = workingProfile.bigFive[k];
              const emphasized = est.confidence > 60;
              const labelInfo = BIG_FIVE_LABELS[k];
              return (
                <DimensionBar
                  key={k}
                  label={BIG_FIVE_SHORT[k]}
                  value={est.value}
                  emphasized={emphasized}
                  className={cn(est.confidence < 20 && 'opacity-40')}
                  info={{
                    title: labelInfo.label,
                    body: labelInfo.long,
                    example:
                      est.value >= 50
                        ? labelInfo.highExample
                        : labelInfo.lowExample,
                  }}
                />
              );
            })}
          </GlassCard>

          <GlassCard className="flex flex-col gap-2.5 p-5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-xs uppercase tracking-wider text-text-3">
                Funciones Jung
              </h3>
              <InfoPopover
                title="Funciones cognitivas de Jung"
                body="Ocho modos distintos de procesar información según Jung (Tipos Psicológicos, 1921). Cada persona usa las ocho, pero algunas se vuelven dominantes y otras permanecen en desarrollo. Umbra las usa directamente, no vía MBTI."
              />
            </div>
            {(Object.keys(JUNG_SHORT) as JungFunctionKey[]).map((k) => {
              const est = workingProfile.jungFunctions[k];
              const emphasized = est.confidence > 60 && est.value > 60;
              const labelInfo = JUNG_LABELS[k];
              return (
                <CompactBar
                  key={k}
                  label={JUNG_SHORT[k]}
                  value={est.value}
                  emphasized={emphasized}
                  dimmed={est.confidence < 20}
                  info={{
                    title: `${labelInfo.label} · ${labelInfo.code}`,
                    body: labelInfo.long,
                    example: labelInfo.example,
                  }}
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
  info,
}: {
  label: string;
  value: number;
  emphasized: boolean;
  dimmed: boolean;
  info?: { title: string; body: string; example?: string };
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('flex flex-col gap-1', dimmed && 'opacity-40')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-mono text-[10px]',
              emphasized ? 'text-violet-200' : 'text-text-3',
            )}
          >
            {label}
          </span>
          {info && <InfoPopover {...info} />}
        </div>
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

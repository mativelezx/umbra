import {
  Compass,
  Flame,
  HandHeart,
  Lightbulb,
  Mountains,
  Target,
  Waves,
} from '@phosphor-icons/react/dist/ssr';
import type { BigFive, JungFunctions } from '@/types';
import {
  BIG_FIVE_LABELS,
  JUNG_LABELS,
  bigFivePosition,
} from '@/lib/dimensions/labels';
import { InfoPopover } from '@/components/ui/InfoPopover';
import {
  quantitativeDimensions,
  RIDGE_V1_STATUS,
  type PerDimensionStatus,
} from '@/lib/profile/dimension-display';

interface QuickGlanceProps {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetypeName: string;
  confidence?: number | null;
  turnsCount?: number | null;
  perDimensionStatus?: PerDimensionStatus;
}

const BIG_FIVE_ICON: Record<keyof BigFive, React.ReactNode> = {
  openness: <Compass size={18} weight="duotone" />,
  conscientiousness: <Target size={18} weight="duotone" />,
  extraversion: <Flame size={18} weight="duotone" />,
  agreeableness: <HandHeart size={18} weight="duotone" />,
  neuroticism: <Waves size={18} weight="duotone" />,
};

export function QuickGlance({
  bigFive,
  jungFunctions,
  archetypeName,
  confidence,
  turnsCount,
  perDimensionStatus = RIDGE_V1_STATUS,
}: QuickGlanceProps) {
  // Big Five: pick the most deviated dimension AMONG those the ML module
  // measured with committed confidence (HU-06 / ADR-027) — a dimension in
  // low-confidence or not-applicable state never headlines the glance.
  const measured = new Set(quantitativeDimensions(perDimensionStatus));
  const bfDev = (
    Object.entries(bigFive) as Array<[keyof BigFive, number]>
  )
    .filter(([k]) => measured.has(k))
    .map(([k, v]) => ({ key: k, value: v, dev: Math.abs(v - 50) }))
    .sort((a, b) => b.dev - a.dev);
  const topBf = bfDev[0] ?? null;
  const topBfLabel = topBf ? BIG_FIVE_LABELS[topBf.key] : null;
  const topBfPos = topBf ? bigFivePosition(topBf.key, topBf.value) : null;

  // Top Jung function by value
  const jungSorted = (
    Object.entries(jungFunctions) as Array<[keyof JungFunctions, number]>
  ).sort(([, a], [, b]) => b - a);
  const [topJungKey, topJungVal] = jungSorted[0];
  const topJungLabel = JUNG_LABELS[topJungKey];

  const showCertaintyBanner = typeof confidence === 'number';

  return (
    <section aria-label="Perfil en un vistazo" className="flex flex-col gap-4">
      {showCertaintyBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-400/10 bg-umbra-shadow/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-3">
              Vistazo rápido
            </p>
            <InfoPopover
              title="¿Qué mido en el vistazo rápido?"
              body="Elegimos automáticamente tu dimensión Big Five más distintiva entre las medidas con confianza, tu función cognitiva dominante y tu arquetipo. Son tres puntos de entrada — no un resumen completo del perfil."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-3">
              Certeza de la lectura
            </span>
            <InfoPopover
              title="Certeza de la lectura"
              body="Estimación heurística de la capa interpretativa sobre su propia lectura (Jung y arquetipo). No es una métrica del módulo de medición: la confianza de cada dimensión Big Five se declara por separado, dimensión por dimensión."
            />
            <div
              className="relative h-1 w-24 overflow-hidden rounded-full bg-umbra-shadow/70"
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
            <span className="font-mono text-xs tabular-nums text-violet-200">
              {confidence}%
            </span>
            {typeof turnsCount === 'number' && turnsCount > 0 && (
              <span className="font-mono text-[10px] text-text-3">
                · {turnsCount}{' '}
                {turnsCount === 1 ? 'respuesta' : 'respuestas'}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topBf && topBfLabel && topBfPos ? (
          <GlanceCard
            label="Tu rasgo más marcado (medido con confianza)"
            icon={BIG_FIVE_ICON[topBf.key]}
            title={topBfLabel.label}
            value={topBf.value}
            caption={topBfPos.phrase}
            popover={{
              title: topBfLabel.label,
              body: topBfLabel.long,
              example: topBf.value >= 50 ? topBfLabel.highExample : topBfLabel.lowExample,
            }}
          />
        ) : (
          <GlanceCard
            label="Big Five"
            icon={BIG_FIVE_ICON.openness}
            title="Sin dimensión medida"
            caption="ninguna dimensión superó los umbrales comprometidos"
          />
        )}
        <GlanceCard
          label="Cómo tu mente capta el mundo"
          icon={<Lightbulb size={18} weight="duotone" />}
          title={topJungLabel.label}
          value={topJungVal}
          caption="tu función dominante"
          technicalCode={topJungLabel.code}
          popover={{
            title: `${topJungLabel.label} · ${topJungLabel.code}`,
            body: topJungLabel.long,
            example: topJungLabel.example,
          }}
        />
        <GlanceCard
          label="Arquetipo dominante"
          icon={<Mountains size={18} weight="duotone" />}
          title={archetypeName}
          subtitleValue={confidence != null ? `${confidence}%` : 'confirmado'}
          caption="confianza en el retrato"
          accent
        />
      </div>
    </section>
  );
}

interface GlanceCardProps {
  label: string;
  icon: React.ReactNode;
  title: string;
  value?: number;
  subtitleValue?: string;
  caption: string;
  accent?: boolean;
  technicalCode?: string;
  popover?: { title: string; body: string; example?: string };
}

function GlanceCard({
  label,
  icon,
  title,
  value,
  subtitleValue,
  caption,
  accent = false,
  technicalCode,
  popover,
}: GlanceCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 ${
        accent
          ? 'border-violet-400/30 bg-violet-400/5 shadow-[0_0_0_1px_rgba(180,102,255,0.18),0_8px_32px_-12px_rgba(180,102,255,0.25)] hover:shadow-[0_0_0_1px_rgba(180,102,255,0.28),0_12px_36px_-12px_rgba(180,102,255,0.32)]'
          : 'border-violet-400/10 bg-umbra-shadow/40 hover:border-violet-400/25 hover:shadow-[0_0_0_1px_rgba(180,102,255,0.15),0_8px_24px_-12px_rgba(180,102,255,0.2)]'
      }`}
    >
      <div className="flex items-center justify-between text-text-3">
        <div className="flex items-center gap-2">
          <span className="text-violet-300">{icon}</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
            {label}
          </p>
        </div>
        {popover && <InfoPopover {...popover} />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-balance font-display text-2xl italic text-text-1 md:text-3xl">
          {title}
        </h3>
        {technicalCode && (
          <span className="font-mono text-[10px] text-text-4">
            · {technicalCode}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl tabular-nums text-violet-200">
          {value != null ? value : subtitleValue}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-3">
          {caption}
        </span>
      </div>
    </div>
  );
}

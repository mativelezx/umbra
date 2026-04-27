import {
  Compass,
  Flame,
  HandHeart,
  Lightbulb,
  Mountains,
  Target,
  Waves,
} from '@phosphor-icons/react/dist/ssr';
import type { BigFive, BigFiveDimension, JungFunctions } from '@/types';
import {
  BIG_FIVE_LABELS,
  JUNG_LABELS,
  bigFivePosition,
} from '@/lib/dimensions/labels';
import { InfoPopover } from '@/components/ui/InfoPopover';

type PerDimensionStatus = Record<BigFiveDimension, 'ok' | 'low_confidence'>;

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
  perDimensionStatus,
}: QuickGlanceProps) {
  // Big Five: pick the dimension that deviates most from 50 — most
  // informative for a quick glance. Cuando el módulo ML marca dimensiones
  // como `low_confidence` (ADR-027), preferimos elegir entre las `ok`;
  // solo caemos a una `low_confidence` si todas lo están — y en ese caso
  // la card destacada muestra el badge "Preliminar".
  const bfDev = (
    Object.entries(bigFive) as Array<[keyof BigFive, number]>
  )
    .map(([k, v]) => ({
      key: k,
      value: v,
      dev: Math.abs(v - 50),
      isLow: perDimensionStatus?.[k] === 'low_confidence',
    }))
    .sort((a, b) => b.dev - a.dev);
  const okDevs = bfDev.filter((d) => !d.isLow);
  const topBf = okDevs.length > 0 ? okDevs[0] : bfDev[0];
  const topBfLabel = BIG_FIVE_LABELS[topBf.key];
  const topBfPos = bigFivePosition(topBf.key, topBf.value);

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
              body="Elegimos automáticamente tu dimensión Big Five más distintiva, tu función cognitiva dominante y tu arquetipo. Son tres puntos de entrada — no un resumen completo del perfil."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-3">
              Certeza
            </span>
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
        <GlanceCard
          label="Tu rasgo Big Five más marcado"
          icon={BIG_FIVE_ICON[topBf.key]}
          title={topBfLabel.label}
          value={topBf.value}
          caption={topBfPos.phrase}
          lowConfidence={topBf.isLow}
          popover={{
            title: topBfLabel.label,
            body: topBfLabel.long,
            example: topBf.value >= 50 ? topBfLabel.highExample : topBfLabel.lowExample,
          }}
        />
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
  lowConfidence?: boolean;
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
  lowConfidence = false,
  popover,
}: GlanceCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        accent
          ? 'border-violet-400/30 bg-violet-400/5 shadow-[0_0_32px_rgba(180,102,255,0.15)]'
          : 'border-violet-400/10 bg-umbra-shadow/40'
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
        <h3 className="font-display text-2xl italic text-text-1 md:text-3xl">
          {title}
        </h3>
        {technicalCode && (
          <span className="font-mono text-[10px] text-text-4">
            · {technicalCode}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`font-mono text-2xl tabular-nums ${
            lowConfidence ? 'text-text-3/80' : 'text-violet-200'
          }`}
        >
          {value != null ? value : subtitleValue}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-3">
          {caption}
        </span>
        {lowConfidence && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-200/90">
            Preliminar
            <InfoPopover
              title="¿Por qué 'Preliminar'?"
              body="Esta dimensión todavía no llega al umbral de confianza estadística del módulo ML (R² > 0.20 y r > 0.30 sobre el corpus rioplatense, ADR-027). El valor es informativo pero estimativo: la dirección general (alta o baja) es robusta, el número exacto puede moverse cuando ampliemos los datos de entrenamiento."
              className="text-amber-300/80"
            />
          </span>
        )}
      </div>
    </div>
  );
}

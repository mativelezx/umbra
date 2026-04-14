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

interface QuickGlanceProps {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetypeName: string;
  confidence?: number;
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
}: QuickGlanceProps) {
  // Big Five: pick the dimension that deviates most from 50 — most
  // informative for a quick glance.
  const bfDev = (
    Object.entries(bigFive) as Array<[keyof BigFive, number]>
  )
    .map(([k, v]) => ({ key: k, value: v, dev: Math.abs(v - 50) }))
    .sort((a, b) => b.dev - a.dev);
  const topBf = bfDev[0];
  const topBfLabel = BIG_FIVE_LABELS[topBf.key];
  const topBfPos = bigFivePosition(topBf.key, topBf.value);

  // Top Jung function by value
  const jungSorted = (
    Object.entries(jungFunctions) as Array<[keyof JungFunctions, number]>
  ).sort(([, a], [, b]) => b - a);
  const [topJungKey, topJungVal] = jungSorted[0];
  const topJungLabel = JUNG_LABELS[topJungKey];

  return (
    <section
      aria-label="Perfil en un vistazo"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <GlanceCard
        label="Tu mayor fuerza Big Five"
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

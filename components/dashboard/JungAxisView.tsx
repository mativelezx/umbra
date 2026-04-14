import { Eye, Lightbulb, Gear, Heart } from '@phosphor-icons/react/dist/ssr';
import type { JungFunctions } from '@/types';
import {
  JUNG_LABELS,
  JUNG_AXIS_LABEL,
  JUNG_AXIS_DESCRIPTION,
} from '@/lib/dimensions/labels';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface JungAxisViewProps {
  jungFunctions: JungFunctions;
}

type AxisKey = 'sensorial' | 'intuitivo' | 'pensamiento' | 'sentimiento';

interface AxisConfig {
  key: AxisKey;
  icon: React.ReactNode;
  left: keyof JungFunctions;
  right: keyof JungFunctions;
}

const AXES: AxisConfig[] = [
  {
    key: 'sensorial',
    icon: <Eye size={16} weight="duotone" />,
    left: 'Se',
    right: 'Si',
  },
  {
    key: 'intuitivo',
    icon: <Lightbulb size={16} weight="duotone" />,
    left: 'Ne',
    right: 'Ni',
  },
  {
    key: 'pensamiento',
    icon: <Gear size={16} weight="duotone" />,
    left: 'Te',
    right: 'Ti',
  },
  {
    key: 'sentimiento',
    icon: <Heart size={16} weight="duotone" />,
    left: 'Fe',
    right: 'Fi',
  },
];

export function JungAxisView({ jungFunctions }: JungAxisViewProps) {
  return (
    <div className="flex flex-col gap-7">
      {AXES.map((axis) => (
        <AxisBar key={axis.key} axis={axis} jungFunctions={jungFunctions} />
      ))}
    </div>
  );
}

function AxisBar({
  axis,
  jungFunctions,
}: {
  axis: AxisConfig;
  jungFunctions: JungFunctions;
}) {
  const leftVal = jungFunctions[axis.left];
  const rightVal = jungFunctions[axis.right];
  const total = leftVal + rightVal;
  const leftPct = total === 0 ? 50 : Math.round((leftVal / total) * 100);
  const leftDominates = leftVal >= rightVal;

  const leftLabel = JUNG_LABELS[axis.left];
  const rightLabel = JUNG_LABELS[axis.right];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-text-3">
        <span className="text-violet-300">{axis.icon}</span>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
          {JUNG_AXIS_LABEL[axis.key]}
        </p>
        <InfoPopover
          title={JUNG_AXIS_LABEL[axis.key]}
          body={JUNG_AXIS_DESCRIPTION[axis.key]}
        />
      </div>

      <div className="flex items-start justify-between gap-4 text-xs">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-heading text-xs ${
                leftDominates ? 'text-violet-200' : 'text-text-3'
              }`}
            >
              {leftLabel.label}
            </span>
            <InfoPopover
              title={leftLabel.label}
              body={leftLabel.long}
              example={leftLabel.example}
            />
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 font-body text-[10px] italic text-text-3">
            <span className="font-mono text-text-4">{axis.left}</span>
            <span className="font-mono tabular-nums">{leftVal}/100</span>
          </p>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <InfoPopover
              title={rightLabel.label}
              body={rightLabel.long}
              example={rightLabel.example}
            />
            <span
              className={`font-heading text-xs ${
                !leftDominates ? 'text-violet-200' : 'text-text-3'
              }`}
            >
              {rightLabel.label}
            </span>
          </div>
          <p className="mt-0.5 flex items-center justify-end gap-1.5 font-body text-[10px] italic text-text-3">
            <span className="font-mono tabular-nums">{rightVal}/100</span>
            <span className="font-mono text-text-4">{axis.right}</span>
          </p>
        </div>
      </div>

      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-umbra-shadow/70">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500/80 to-violet-300/80"
          style={{ width: `${leftPct}%` }}
        />
        <div className="absolute inset-y-0 left-1/2 h-full w-px bg-violet-400/30" />
      </div>
    </div>
  );
}

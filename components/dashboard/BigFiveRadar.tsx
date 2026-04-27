'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { BigFive, BigFiveDimension } from '@/types';
import { InfoPopover } from '@/components/ui/InfoPopover';

type PerDimensionStatus = Record<BigFiveDimension, 'ok' | 'low_confidence'>;

interface BigFiveRadarProps {
  bigFive: BigFive;
  perDimensionStatus?: PerDimensionStatus;
}

const LABELS: Record<keyof BigFive, string> = {
  openness: 'Apertura',
  conscientiousness: 'Responsabilidad',
  extraversion: 'Extraversión',
  agreeableness: 'Amabilidad',
  neuroticism: 'Sensibilidad',
};

export function BigFiveRadar({ bigFive, perDimensionStatus }: BigFiveRadarProps) {
  const dims = Object.keys(LABELS) as Array<keyof BigFive>;
  const data = dims.map((key) => {
    const isLow = perDimensionStatus?.[key] === 'low_confidence';
    return {
      subject: isLow ? `${LABELS[key]}*` : LABELS[key],
      value: bigFive[key],
      fullMark: 100,
    };
  });

  const lowDims = dims.filter((k) => perDimensionStatus?.[k] === 'low_confidence');

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="rgba(180,102,255,0.18)" strokeDasharray="2 4" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#A8A0C8', fontSize: 11, fontFamily: 'Space Grotesk' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#6B6490', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              stroke="rgba(107,100,144,0.3)"
            />
            <Radar
              name="tu perfil"
              dataKey="value"
              stroke="#B466FF"
              fill="#B466FF"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {lowDims.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-violet-400/10 bg-umbra-shadow/30 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
            *Preliminar
          </span>
          <span className="font-mono text-[10px] text-text-4">
            {lowDims.map((d) => LABELS[d]).join(' · ')}
          </span>
          <InfoPopover
            title="¿Qué quiere decir 'Preliminar'?"
            body="Estas dimensiones se calculan sobre un corpus en validación. El módulo de medición no llega todavía al umbral de confianza estadística (R² > 0.20 y r > 0.30 sobre el corpus rioplatense). Tomá el valor como estimativo: la dirección general (alta o baja) es informativa, el número exacto puede moverse cuando ampliemos los datos."
          />
        </div>
      )}
    </div>
  );
}

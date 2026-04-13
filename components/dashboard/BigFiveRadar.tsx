'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { BigFive } from '@/types';

interface BigFiveRadarProps {
  bigFive: BigFive;
}

const LABELS: Record<keyof BigFive, string> = {
  openness: 'Apertura',
  conscientiousness: 'Responsabilidad',
  extraversion: 'Extraversión',
  agreeableness: 'Amabilidad',
  neuroticism: 'Sensibilidad',
};

export function BigFiveRadar({ bigFive }: BigFiveRadarProps) {
  const data = (Object.keys(LABELS) as Array<keyof BigFive>).map((key) => ({
    subject: LABELS[key],
    value: bigFive[key],
    fullMark: 100,
  }));

  return (
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
  );
}

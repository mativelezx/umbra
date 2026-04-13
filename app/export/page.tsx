'use client';

import { useEffect, useRef, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import { formatDateEs } from '@/lib/utils';
import { ARCHETYPE_INFO } from '@/types';
import type { Archetype, BigFive, JungFunctions, PsychologicalProfile } from '@/types';
import './print.css';

const BIG_FIVE_LABELS: Record<keyof BigFive, string> = {
  openness: 'Apertura',
  conscientiousness: 'Responsabilidad',
  extraversion: 'Extraversión',
  agreeableness: 'Amabilidad',
  neuroticism: 'Sensibilidad',
};

const BIG_FIVE_ORDER: Array<keyof BigFive> = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

function BigFiveRadar({ values }: { values: BigFive }) {
  // Wide viewBox: 520x360 with radius ~120. Extra horizontal room (260 on
  // each side of center) leaves space for the longest axis labels
  // ("Responsabilidad · 100") without clipping, while the vertical extent
  // stays compact for PDF page flow.
  const width = 520;
  const height = 360;
  const center = { x: width / 2, y: height / 2 };
  const radius = 120;
  const axes = BIG_FIVE_ORDER.length;

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / axes;
  const point = (i: number, value: number) => {
    const angle = angleFor(i);
    const r = (value / 100) * radius;
    return [center.x + r * Math.cos(angle), center.y + r * Math.sin(angle)] as const;
  };

  const polygon = BIG_FIVE_ORDER.map((key, i) => point(i, values[key]).join(','))
    .join(' ');

  const gridRings = [20, 40, 60, 80, 100].map((pct) => {
    const points = Array.from({ length: axes }, (_, i) => {
      const angle = angleFor(i);
      const r = (pct / 100) * radius;
      return `${center.x + r * Math.cos(angle)},${center.y + r * Math.sin(angle)}`;
    }).join(' ');
    return (
      <polygon
        key={pct}
        points={points}
        fill="none"
        stroke="#d4b3ff"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
    );
  });

  const axisLines = BIG_FIVE_ORDER.map((_, i) => {
    const [x, y] = point(i, 100);
    return (
      <line
        key={i}
        x1={center.x}
        y1={center.y}
        x2={x}
        y2={y}
        stroke="#d4b3ff"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
    );
  });

  const labels = BIG_FIVE_ORDER.map((key, i) => {
    const angle = angleFor(i);
    const labelRadius = radius + 22;
    const x = center.x + labelRadius * Math.cos(angle);
    const y = center.y + labelRadius * Math.sin(angle);
    const anchor =
      Math.abs(Math.cos(angle)) < 0.1
        ? 'middle'
        : Math.cos(angle) > 0
          ? 'start'
          : 'end';
    return (
      <text
        key={key}
        x={x}
        y={y}
        fontSize={11}
        fontFamily="Inter, Arial, sans-serif"
        fill="#3d1575"
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        {BIG_FIVE_LABELS[key]} · {values[key]}
      </text>
    );
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Radar Big Five"
      role="img"
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
    >
      {gridRings}
      {axisLines}
      <polygon
        points={polygon}
        fill="#b466ff"
        fillOpacity="0.25"
        stroke="#7a2eff"
        strokeWidth="2"
      />
      {BIG_FIVE_ORDER.map((key, i) => {
        const [x, y] = point(i, values[key]);
        return <circle key={key} cx={x} cy={y} r={4} fill="#7a2eff" />;
      })}
      {labels}
    </svg>
  );
}

const JUNG_LABELS: Record<keyof JungFunctions, string> = {
  Se: 'Sensación extravertida',
  Si: 'Sensación introvertida',
  Ne: 'Intuición extravertida',
  Ni: 'Intuición introvertida',
  Te: 'Pensamiento extravertido',
  Ti: 'Pensamiento introvertido',
  Fe: 'Sentimiento extravertido',
  Fi: 'Sentimiento introvertido',
};

interface ExportData {
  profile: PsychologicalProfile;
  narrative: string | null;
  plan: { areas: Array<{ id: string; name: string; rationale: string; actions: Array<{ id: string; title: string; description: string; microGoals: Array<{ text: string }> }> }> } | null;
  userName: string | null;
}

export default function ExportPage() {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      // Demo mode: load seed
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        const seed = await import('@/lib/demo/seed');
        setData({
          profile: seed.DEMO_PROFILE,
          narrative: seed.DEMO_NARRATIVE,
          plan: { areas: seed.DEMO_PLAN.areas as unknown as ExportData['plan'] extends { areas: infer A } ? A : never },
          userName: seed.DEMO_USER.full_name,
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('No autenticado');
        setLoading(false);
        return;
      }

      const { data: profileMeta } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: profileRow } = await supabase
        .from('psychological_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('version', 1)
        .maybeSingle();

      if (!profileRow) {
        setError('Primero completá el onboarding.');
        setLoading(false);
        return;
      }

      const { data: narrativeRow } = await supabase
        .from('narratives')
        .select('content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: planRow } = await supabase
        .from('development_plans')
        .select('areas')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setData({
        profile: {
          id: profileRow.id,
          userId: profileRow.user_id,
          bigFive: {
            openness: profileRow.openness ?? 50,
            conscientiousness: profileRow.conscientiousness ?? 50,
            extraversion: profileRow.extraversion ?? 50,
            agreeableness: profileRow.agreeableness ?? 50,
            neuroticism: profileRow.neuroticism ?? 50,
          },
          jungFunctions: profileRow.jung_functions ?? { Se: 50, Si: 50, Ne: 50, Ni: 50, Te: 50, Ti: 50, Fe: 50, Fi: 50 },
          archetype: profileRow.archetype,
          archetypeSecondary: profileRow.archetype_secondary ?? '',
          inputMode: profileRow.input_mode,
          inputTexts: profileRow.input_texts ?? [],
          createdAt: profileRow.created_at,
          updatedAt: profileRow.updated_at,
        },
        narrative: narrativeRow?.content ?? null,
        plan: planRow ? { areas: planRow.areas as ExportData['plan'] extends { areas: infer A } ? A : never } : null,
        userName: profileMeta?.full_name ?? null,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function downloadPdf() {
    if (!pdfRef.current || !data) return;
    setDownloading(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default as any) ?? html2pdfModule;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `umbra-perfil-${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(pdfRef.current)
        .save();
    } catch (e) {
      console.error('[export] PDF generation failed', e);
      setError('No pudimos generar el PDF. Probá de nuevo.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64" />
        </div>
      </LayoutShell>
    );
  }

  if (error || !data) {
    return (
      <LayoutShell>
        <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 p-6 font-body text-text-2">
          {error ?? 'Error al cargar tu perfil.'}
        </div>
      </LayoutShell>
    );
  }

  const info = ARCHETYPE_INFO[data.profile.archetype];

  return (
    <LayoutShell>
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Descargar tu perfil
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
            Tu informe en PDF
          </h1>
          <p className="mt-3 max-w-2xl font-body text-text-2">
            Un informe con tu perfil, tu narrativa y tu plan de desarrollo. Podés
            guardarlo, imprimirlo, volver a él cuando quieras.
          </p>
        </div>

        <div className="flex justify-start">
          <Button onClick={downloadPdf} loading={downloading} size="lg">
            <DownloadSimple size={18} />
            Descargar PDF
          </Button>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-violet-400/20 bg-white p-0 overflow-hidden">
          <div ref={pdfRef} className="pdf-root">
            <div className="pdf-section">
              <h1 style={{ fontSize: '48px', margin: '0 0 8px', fontStyle: 'italic' }}>
                Umbra
              </h1>
              <p style={{ fontSize: '14px', color: '#6b6490', margin: 0 }}>
                Tu perfil — {formatDateEs(new Date())}
                {data.userName && ` · ${data.userName}`}
              </p>
            </div>

            <div className="pdf-section pdf-card">
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                Tu arquetipo dominante
              </p>
              <h2 style={{ fontSize: '36px', margin: '8px 0 4px', fontStyle: 'italic' }}>
                {info.name}
              </h2>
              {data.profile.archetypeSecondary && (
                <p style={{ fontSize: '13px', margin: 0 }}>+ {data.profile.archetypeSecondary}</p>
              )}
              <p style={{ marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                {info.description}
              </p>
            </div>

            <div className="pdf-section pdf-card">
              <h3 style={{ margin: '0 0 16px' }}>Big Five (IPIP-NEO)</h3>
              <BigFiveRadar values={data.profile.bigFive} />
              <div style={{ height: '16px' }} />
              {(Object.keys(BIG_FIVE_LABELS) as Array<keyof BigFive>).map((key) => (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <span>{BIG_FIVE_LABELS[key]}</span>
                    <span style={{ fontFamily: 'monospace' }}>{data.profile.bigFive[key]}</span>
                  </div>
                  <div className="pdf-bar">
                    <div className="pdf-bar-fill" style={{ width: `${data.profile.bigFive[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pdf-section pdf-card">
              <h3 style={{ margin: '0 0 16px' }}>Funciones cognitivas Jung</h3>
              {(Object.keys(JUNG_LABELS) as Array<keyof JungFunctions>).map((key) => (
                <div key={key} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                    <span>{key} · {JUNG_LABELS[key]}</span>
                    <span style={{ fontFamily: 'monospace' }}>{data.profile.jungFunctions[key]}</span>
                  </div>
                  <div className="pdf-bar">
                    <div className="pdf-bar-fill" style={{ width: `${data.profile.jungFunctions[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {data.narrative && (
              <div className="pdf-section">
                <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontStyle: 'italic' }}>
                  Tu narrativa
                </h2>
                {data.narrative.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                    {p}
                  </p>
                ))}
              </div>
            )}

            {data.plan && (
              <div className="pdf-section">
                <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontStyle: 'italic' }}>
                  Tu plan de desarrollo
                </h2>
                {data.plan.areas.map((area, i) => (
                  <div key={area.id} className="pdf-card">
                    <h3 style={{ margin: '0 0 8px' }}>
                      {i + 1}. {area.name}
                    </h3>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', margin: '0 0 12px' }}>
                      {area.rationale}
                    </p>
                    {area.actions.map((action) => (
                      <div key={action.id} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '2px solid #d4b3ff' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{action.title}</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>{action.description}</div>
                        <ul style={{ fontSize: '12px', marginTop: '6px', paddingLeft: '16px' }}>
                          {action.microGoals.map((goal, gi) => (
                            <li key={gi}>{goal.text}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="pdf-footer">
              <p style={{ margin: 0 }}>
                Generado por Umbra · TFG Ingeniería en Software, Universidad Siglo 21
              </p>
              <p style={{ margin: '4px 0 0' }}>
                Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

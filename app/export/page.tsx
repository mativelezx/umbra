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
import {
  extractPerDimensionStatus,
  STATUS_LABEL,
} from '@/lib/profile/dimension-display';

/**
 * Minimal shape of the html2pdf.js chain — the library itself has no
 * bundled TypeScript types, so we declare the subset we actually use.
 * Keeps the call-site typed without pulling `any` into the codebase.
 */
interface Html2PdfChain {
  set(options: Record<string, unknown>): Html2PdfChain;
  from(element: HTMLElement): Html2PdfChain;
  save(): Promise<void>;
}

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
          analysisRaw: profileRow.analysis_raw ?? undefined,
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
      // html2pdf.js exports its factory as default in ESM and as the
      // module itself in CJS. We narrow the union to a callable without
      // leaking `any` — cast through `unknown` so TypeScript accepts
      // the dual shape. The library has no bundled types; this is the
      // minimum viable type contract (no implicit any).
      const html2pdfModule = (await import('html2pdf.js')) as unknown as
        | { default: () => Html2PdfChain }
        | (() => Html2PdfChain);
      const html2pdf =
        typeof html2pdfModule === 'function'
          ? html2pdfModule
          : html2pdfModule.default;
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
          <h1 className="mt-2 font-heading font-bold text-4xl not-italic text-text-1 md:text-5xl">
            Tu informe en PDF
          </h1>
          <p className="mt-3 max-w-2xl font-body text-text-2">
            Un informe con tu resultado, tu lectura y tus actividades. Podés
            guardarlo, imprimirlo, volver a él cuando quieras.
          </p>
        </div>

        <div className="dark-surface flex flex-wrap items-center justify-between gap-5 rounded-2xl p-6">
          <p className="text-lg font-semibold">Tu lectura, para volver a ella.</p>
          <Button onClick={downloadPdf} loading={downloading} size="lg" variant="secondary">
            <DownloadSimple size={18} />
            Descargar PDF
          </Button>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-violet-400/20 bg-white p-0 overflow-hidden">
          <div ref={pdfRef} className="pdf-root">
            <div className="pdf-section pdf-keep">
              <h1 style={{ fontSize: '48px', margin: '0 0 8px', fontStyle: 'normal' }}>
                umbra
              </h1>
              <p style={{ fontSize: '14px', color: '#62625c', margin: 0 }}>
                Tu perfil — {formatDateEs(new Date())}
                {data.userName && ` · ${data.userName}`}
              </p>
            </div>

            <div className="pdf-section pdf-card">
              <p style={{ fontSize: '11px', textTransform: 'none', letterSpacing: '0', margin: 0 }}>
                Arquetipo · interpretación de IA inspirada en Jung
              </p>
              <h2 style={{ fontSize: '36px', margin: '8px 0 4px', fontStyle: 'normal' }}>
                {info.name}
              </h2>
              {data.profile.archetypeSecondary && (
                <p style={{ fontSize: '13px', margin: 0 }}>+ {data.profile.archetypeSecondary}</p>
              )}
              <p style={{ marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                {info.description}
              </p>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>Figura simbólica para reflexionar. No es un diagnóstico ni una descripción definitiva de vos.</p>
            </div>

            <div className="pdf-section pdf-card">
              <h3 style={{ margin: '0 0 16px' }}>Big Five · estimación experimental de ML</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', lineHeight: '1.5', color: '#555' }}>
                Escala de 0 a 100. Solo se reporta la cifra de dimensiones habilitadas por los umbrales del modelo; las restantes se declaran con su estado, sin valor. No son percentiles ni permiten comparaciones con la población. No hay precisión individual validada.
              </p>
              {(() => {
                const dimStatus = extractPerDimensionStatus(data.profile.analysisRaw);
                return BIG_FIVE_ORDER.map((key) => {
                  const measured = dimStatus[key] === 'ok';
                  return (
                    <div key={key} className="pdf-row" style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span>{BIG_FIVE_LABELS[key]}</span>
                        {measured ? (
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{data.profile.bigFive[key]}</span>
                        ) : (
                          <span style={{ fontSize: '11px', textTransform: 'none', letterSpacing: '0', color: '#777' }}>
                            {STATUS_LABEL[dimStatus[key]]}
                          </span>
                        )}
                      </div>
                      {measured ? (
                        <div className="pdf-bar">
                          <div className="pdf-bar-fill" style={{ width: `${data.profile.bigFive[key]}%` }} />
                        </div>
                      ) : (
                        <div className="pdf-bar" style={{ background: 'transparent', border: '1px dashed #ccc' }} />
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pdf-section pdf-card">
              <h3 style={{ margin: '0 0 16px' }}>Funciones de Jung · interpretación de IA</h3>
              <p style={{ fontSize: '13px', marginBottom: '16px' }}>Valores de la capa interpretativa, en escala de 0 a 100. No son medidas psicométricas ni probabilidades.</p>
              {(Object.keys(JUNG_LABELS) as Array<keyof JungFunctions>).map((key) => (
                <div key={key} className="pdf-row" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                    <span>{key} · {JUNG_LABELS[key]}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{data.profile.jungFunctions[key]}</span>
                  </div>
                  <div className="pdf-bar">
                    <div className="pdf-bar-fill" style={{ width: `${data.profile.jungFunctions[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {data.narrative && (
              <div className="pdf-section">
                <div className="pdf-keep">
                <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontStyle: 'normal' }}>
                  Tu lectura
                </h2>
                <p style={{ fontSize: '13px', marginBottom: '16px' }}>Texto generado por IA. Puede equivocarse; revisá qué te resulta útil.</p>
                </div>
                {data.narrative.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                    {p}
                  </p>
                ))}
              </div>
            )}

            {data.plan && (
              <div className="pdf-section">
                {data.plan.areas.map((area, i) => (
                  <div key={area.id} className={i === 0 ? 'pdf-keep' : undefined}>
                  {i === 0 && <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontStyle: 'normal' }}>Actividades de reflexión</h2>}
                  <div className="pdf-card">
                    <h3 style={{ margin: '0 0 8px' }}>
                      {i + 1}. {area.name}
                    </h3>
                    <p style={{ fontSize: '12px', fontStyle: 'normal', margin: '0 0 12px' }}>
                      {area.rationale}
                    </p>
                    {area.actions.map((action) => (
                      <div key={action.id} className="pdf-action" style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '1px solid #deded8' }}>
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
                  </div>
                ))}
              </div>
            )}

            <div className="pdf-footer">
              {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p>Ejemplo local con datos ficticios. No representa un análisis real.</p>}
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

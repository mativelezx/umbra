'use client';

import { useEffect, useRef, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ReportContent } from '@/components/export/ReportContent';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import type { ReportExportData as ExportData } from '@/types';
import './print.css';

/**
 * Minimal shape of the html2pdf.js chain — the library itself has no
 * bundled TypeScript types, so we declare the subset we actually use.
 * Keeps the call-site typed without pulling `any` into the codebase.
 */
interface Html2PdfChain {
  set(options: Record<string, unknown>): Html2PdfChain;
  from(element: HTMLElement): Html2PdfChain;
  toPdf(): Html2PdfChain;
  get(key: 'pdf'): Promise<PdfDocument>;
  save(): Promise<void>;
}

interface PdfDocument {
  internal: { getNumberOfPages(): number };
  setPage(page: number): void;
  setFontSize(size: number): void;
  setTextColor(value: number): void;
  text(text: string, x: number, y: number, options?: { align: 'right' }): void;
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
        .eq('profile_id', profileRow.id)
        .gte('created_at', profileRow.updated_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: planRow } = await supabase
        .from('development_plans')
        .select('areas')
        .eq('user_id', user.id)
        .eq('profile_id', profileRow.id)
        .gte('created_at', profileRow.updated_at)
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
      await document.fonts.ready;
      const worker = html2pdf()
        .set({
          margin: [16, 14, 18, 14],
          filename: `umbra-perfil-${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            windowWidth: 1200,
            scrollY: 0,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(pdfRef.current)
        .toPdf();
      const pdf = await worker.get('pdf');
      const pageCount = pdf.internal.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(95);
        if (page > 1) pdf.text('umbra / cuaderno de autoconocimiento', 14, 10);
        pdf.text('Lectura orientativa · No es un diagnóstico', 14, 289);
        pdf.text(`${page} / ${pageCount}`, 196, 289, { align: 'right' });
      }
      await worker.save();
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

        <p className="report-preview-hint">Vista previa en formato A4. En pantallas pequeñas, deslizá el papel para recorrerlo.</p>
        <div className="report-preview" role="region" aria-label="Vista previa del informe A4" tabIndex={0}>
          <div ref={pdfRef} className="pdf-root"><ReportContent data={data} /></div>
        </div>
      </div>
    </LayoutShell>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DownloadSimple } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsExportPage() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch('/api/account/export', { method: 'GET' });
      if (!res.ok) throw new Error('export_failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `umbra-datos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('No pudimos generar tu export. Probá de nuevo.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <LayoutShell>
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <p className="font-body text-sm normal-case tracking-normal text-text-3">
            Configuración
          </p>
          <h1 className="mt-2 font-heading font-semibold text-4xl not-italic text-text-1 md:text-5xl">
            Exportar tus datos
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/settings/profile"
            className="rounded-md border border-violet-400/10 px-3 py-1.5 font-heading text-xs text-text-2 hover:text-text-1 hover:bg-violet-400/5"
          >
            Perfil
          </Link>
          <Link
            href="/settings/export"
            className="rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 font-heading text-xs text-violet-200"
          >
            Exportar datos
          </Link>
          <Link
            href="/settings/research-opt-out"
            className="rounded-md border border-violet-400/10 px-3 py-1.5 font-heading text-xs text-text-2 hover:text-text-1 hover:bg-violet-400/5"
          >
            Investigación
          </Link>
          <Link
            href="/settings/delete"
            className="rounded-md border border-accent-rose/20 px-3 py-1.5 font-heading text-xs text-accent-rose/80 hover:bg-accent-rose/5"
          >
            Eliminar cuenta
          </Link>
        </nav>

        <Card>
          <h2 className="font-heading font-semibold text-2xl not-italic text-text-1">
            Derecho de acceso (Ley 25.326)
          </h2>
          <p className="mt-3 font-body text-sm text-text-2 leading-relaxed">
            Descargá un archivo JSON con todos los datos que Umbra tiene sobre vos:
            tu perfil, narrativa, conversaciones, plan de desarrollo, carta al
            futuro, y tu historial de consentimientos.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Button onClick={handleDownload} loading={downloading} size="lg">
              <DownloadSimple size={18} />
              Descargar mis datos
            </Button>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}

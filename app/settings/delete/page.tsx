'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Warning } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsDeletePage() {
  const [confirm, setConfirm] = useState(false);
  const [purgeResearch, setPurgeResearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setLoading(true);
    setError(null);
    setDevLink(null);
    try {
      const res = await fetch('/api/account/delete/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purgeResearch }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'delete_request_failed');
      }
      if (data.data?.emailSent) {
        setMessage(
          'Te enviamos un email con un link de confirmación. El link vence en 5 minutos.',
        );
      } else if (data.data?.devMagicLink) {
        setMessage(
          'Modo desarrollo: no hay email configurado. Usá este link para confirmar (vence en 5 min):',
        );
        setDevLink(data.data.devMagicLink);
      } else {
        // Unreachable in production — any prod path must resolve to an error.
        setError('No pudimos procesar el pedido. Probá de nuevo.');
      }
    } catch (e) {
      setError('No pudimos procesar el pedido. Probá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutShell>
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Configuración
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
            Eliminar tu cuenta
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
            className="rounded-md border border-violet-400/10 px-3 py-1.5 font-heading text-xs text-text-2 hover:text-text-1 hover:bg-violet-400/5"
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
            className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-3 py-1.5 font-heading text-xs text-accent-rose"
          >
            Eliminar cuenta
          </Link>
        </nav>

        <Card className="border-accent-rose/30">
          <div className="flex items-start gap-3">
            <Warning size={24} className="shrink-0 text-accent-rose mt-1" />
            <div>
              <h2 className="font-display text-2xl italic text-text-1">Esta acción es irreversible</h2>
              <p className="mt-3 font-body text-sm text-text-2 leading-relaxed">
                Vamos a eliminar tu cuenta y todos tus datos personales: perfil psicológico,
                narrativas, conversaciones, plan, carta al futuro, y tu historial de
                consentimientos. Esto cumple con tu derecho de cancelación bajo la Ley 25.326.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeResearch}
                onChange={(e) => setPurgeResearch(e.target.checked)}
                className="mt-1 h-5 w-5 accent-accent-rose cursor-pointer"
              />
              <span className="font-body text-sm text-text-2">
                También purgar mi contribución de investigación (si había optado por participar).
                Esta opción borra mis datos del dataset científico de Umbra.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-1 h-5 w-5 accent-accent-rose cursor-pointer"
              />
              <span className="font-body text-sm text-text-2">
                Entiendo que esta acción es irreversible y quiero proceder.
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 rounded-md border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3 font-body text-sm text-accent-emerald">
              {message}
              {devLink && (
                <div className="mt-3 break-all">
                  <a
                    href={devLink}
                    className="font-mono text-xs underline decoration-accent-emerald/50 hover:decoration-accent-emerald"
                  >
                    {devLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button
              variant="danger"
              disabled={!confirm || loading || !!message}
              loading={loading}
              onClick={handleRequest}
              size="lg"
            >
              Enviar link de confirmación
            </Button>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}

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
      <div className="flex max-w-2xl flex-col gap-8">
        <div>
          <p className="font-body text-sm normal-case tracking-normal text-text-3">
            Configuración
          </p>
          <h1 className="mt-2 text-balance font-heading font-semibold text-4xl not-italic text-text-1 md:text-5xl">
            Eliminar tu cuenta
          </h1>
          <p className="mt-3 max-w-xl text-pretty font-body leading-relaxed text-text-2">
            Te mandamos un link único de un solo uso a tu email. Confirmás vos haciendo clic, y desaparece todo en cascada. El link vence en 5 minutos para evitar borrados accidentales por email reenviado.
          </p>
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

        <Card className="rounded-2xl border-accent-rose/30">
          <div className="flex items-start gap-3">
            <Warning size={24} className="mt-1 shrink-0 text-accent-rose" />
            <div>
              <h2 className="text-balance font-heading font-semibold text-2xl not-italic text-text-1">Esto es irreversible</h2>
              <p className="mt-3 text-pretty font-body text-sm leading-relaxed text-text-2">
                Si confirmás, borramos tu cuenta y todos tus datos personales: perfil psicológico, narrativas, conversaciones, plan, carta al futuro y tu historial de consentimientos. Es tu derecho de cancelación bajo Ley 25.326.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/15 bg-umbra-fog/30 p-4 transition-[border-color] duration-150 hover:border-violet-400/30">
              <input
                type="checkbox"
                checked={purgeResearch}
                onChange={(e) => setPurgeResearch(e.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer accent-accent-rose"
              />
              <span className="text-pretty font-body text-sm leading-relaxed text-text-2">
                También quitar mi contribución del dataset de investigación (si había optado por participar). Sin esto, los datos de investigación quedan seudonimizados pero presentes.
              </span>
            </label>

            <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-accent-rose/25 bg-accent-rose/5 p-4 transition-[border-color] duration-150 hover:border-accent-rose/50">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer accent-accent-rose"
              />
              <span className="text-pretty font-body text-sm leading-relaxed text-text-1">
                Entiendo que es irreversible y quiero seguir adelante.
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
                    className="font-body text-xs underline decoration-accent-emerald/50 hover:decoration-accent-emerald"
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
              Mandame el link de confirmación
            </Button>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function SettingsResearchPage() {
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('research_opt_in')
          .eq('id', user.id)
          .single();
        setOptIn(data?.research_opt_in ?? false);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggle() {
    setSaving(true);
    setMessage(null);
    const newValue = !optIn;

    try {
      const res = await fetch('/api/account/research-opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_opt_in: newValue,
          // Cuando alguien sale, purgamos su contribución existente.
          purge_existing: !newValue,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setOptIn(newValue);
        setMessage(
          newValue
            ? 'Gracias por contribuir. Podés salir cuando quieras.'
            : `Listo, saliste de investigación.${
                json.data?.purged_records > 0
                  ? ` Borramos ${json.data.purged_records} registros previos.`
                  : ''
              }`,
        );
      } else {
        setMessage('No pudimos guardar el cambio. Probá de nuevo.');
      }
    } catch {
      setMessage('No pudimos guardar el cambio. Probá de nuevo.');
    } finally {
      setSaving(false);
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
            Modo investigación
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
            className="rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 font-heading text-xs text-violet-200"
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
          <h2 className="font-display text-2xl italic text-text-1">
            Contribución a la investigación
          </h2>
          <p className="mt-3 font-body text-sm text-text-2 leading-relaxed">
            Umbra es un proyecto de TFG con un componente académico abierto. Si
            elegís participar, tus textos y perfil generado se guardan
            seudonimizados (identificados por una clave criptográfica, no por tu
            nombre o email) en un dataset de investigación.
          </p>
          <p className="mt-3 font-body text-sm text-text-2 leading-relaxed">
            <strong className="text-text-1">Importante</strong>: seudonimización
            NO es anonimización irreversible. El responsable del tratamiento con
            acceso a la clave secreta podría técnicamente re-vincular los datos.
            En la práctica ese acceso es limitado. Podés retirarte en cualquier
            momento.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-md border border-violet-400/20 bg-umbra-shadow/30 p-4">
            <div>
              <div className="font-heading text-sm text-text-1">Estado actual</div>
              <div
                className={`mt-1 font-mono text-xs ${
                  optIn ? 'text-accent-emerald' : 'text-text-3'
                }`}
              >
                {optIn ? 'Participando · ✓' : 'No participando'}
              </div>
            </div>
            <Button
              onClick={toggle}
              disabled={loading || saving}
              loading={saving}
              variant={optIn ? 'ghost' : 'primary'}
            >
              {optIn ? 'Salir de investigación' : 'Entrar en investigación'}
            </Button>
          </div>

          {message && (
            <p className="mt-4 font-body text-sm text-accent-emerald">{message}</p>
          )}
        </Card>
      </div>
    </LayoutShell>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Warning, CheckCircle } from '@phosphor-icons/react';
import { GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store/onboarding-store';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [loading, setLoading] = useState(false);
  const [purgeResearch, setPurgeResearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, purgeResearch }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === 'token_expired') {
          throw new Error('Tu link venció. Pedí uno nuevo desde la configuración.');
        }
        if (data.error === 'token_already_used') {
          throw new Error('Este link ya fue usado.');
        }
        throw new Error(data.error ?? 'delete_failed');
      }
      useOnboardingStore.getState().bindUser(null);
      useOnboardingStore.persist.clearStorage();
      setDone(true);
      // Sign out and redirect
      const supabase = createClient();
      await supabase.auth.signOut();
      setTimeout(() => router.push('/'), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <GlassCard className="max-w-lg w-full">
        <div className="flex items-start gap-3">
          <CheckCircle size={24} className="text-accent-emerald mt-1" />
          <div>
            <h1 className="font-heading font-semibold text-3xl not-italic text-text-1">Cuenta eliminada</h1>
            <p className="mt-3 font-body text-sm text-text-2">
              Tus datos fueron borrados. Gracias por haber usado Umbra. Te estamos
              redirigiendo al inicio.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-lg w-full">
      <div className="flex items-start gap-3">
        <Warning size={24} className="text-accent-rose mt-1" />
        <div>
          <h1 className="font-heading font-semibold text-3xl not-italic text-text-1">
            Confirmá la eliminación
          </h1>
          <p className="mt-3 font-body text-sm text-text-2">
            Este link tiene validez de 5 minutos. Al confirmar, eliminamos
            irreversiblemente tu cuenta y todos los datos personales asociados.
          </p>
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={purgeResearch}
          onChange={(e) => setPurgeResearch(e.target.checked)}
          className="mt-1 h-5 w-5 accent-accent-rose cursor-pointer"
        />
        <span className="font-body text-sm text-text-2">
          También purgar mi contribución al dataset de investigación.
        </span>
      </label>

      {error && (
        <div className="mt-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="danger" onClick={handleConfirm} loading={loading} disabled={!token}>
          Eliminar ahora
        </Button>
        <Button variant="ghost" onClick={() => router.push('/settings/profile')}>
          Cancelar
        </Button>
      </div>
    </GlassCard>
  );
}

export default function DeleteConfirmPage() {
  return (
    <main className="relative mx-auto flex min-h-screen items-center justify-center px-6 py-16">
      <Suspense
        fallback={<div className="font-body text-text-3">Cargando...</div>}
      >
        <ConfirmContent />
      </Suspense>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/Card';
import { wordCount } from '@/lib/utils';

interface CartaFormProps {
  profileId: string;
}

export function CartaForm({ profileId }: CartaFormProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = wordCount(content) >= 20;
  const unlockDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString(
    'es-AR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  async function save() {
    setLoading(true);
    setError(null);

    // Demo mode: skip real API
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setTimeout(() => router.push('/dashboard'), 300);
      return;
    }

    const res = await fetch('/api/carta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, content }),
    });
    if (!res.ok) {
      setError('No pudimos guardar tu carta. Probá de nuevo.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  }

  function skip() {
    router.push('/dashboard');
  }

  return (
    <GlassCard className="w-full">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
          Una última cosa · opcional
        </p>
        <h2 className="mt-3 font-display text-3xl italic text-text-1 md:text-4xl">
          Escribile a tu vos de 6 meses
        </h2>
        <p className="mt-3 font-body text-text-2">
          ¿Qué querés que recuerde? ¿Qué te gustaría decirle a la persona que serás
          en {unlockDate}? La carta se guarda cifrada y se abre sola ese día.
        </p>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Querida yo del futuro..."
        rows={8}
        maxLength={1500}
      />

      {error && (
        <p className="mt-4 font-body text-xs text-accent-rose">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={skip} type="button">
          Saltear
        </Button>
        <Button
          variant="primary"
          onClick={save}
          disabled={!canSubmit || loading}
          loading={loading}
          type="button"
        >
          Guardar mi carta
        </Button>
      </div>
    </GlassCard>
  );
}

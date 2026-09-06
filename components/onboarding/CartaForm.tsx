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

    try {
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
    } catch {
      setError('No pudimos conectar. Tu texto sigue acá; intentá guardarlo otra vez.');
      setLoading(false);
    }
  }

  function skip() {
    router.push('/dashboard');
  }

  return (
    <GlassCard className="w-full">
      <div className="mb-6">
        <h2 className="mt-3 font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
          Escribile a tu vos de 6 meses
        </h2>
        <p className="mt-3 font-body text-text-2">
          ¿Qué querés que recuerde? ¿Qué te gustaría decirle a la persona que serás
          en {unlockDate}? Es opcional: también podés ir directo al resultado.
        </p>
      </div>

      <Textarea
        label="Tu carta para dentro de seis meses"
        minWords={20}
        showCount
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Querida yo del futuro..."
        rows={8}
        maxLength={1500}
      />
      <p className="mt-3 text-sm leading-relaxed text-text-3">Escribí al menos 20 palabras y hasta 1500 caracteres para poder continuar.</p>
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="mt-3 text-sm text-text-2">Ejemplo local: esta carta no se guarda. Al continuar vas al resultado ficticio.</p>}

      {error && (
        <p role="alert" className="mt-4 font-body text-sm text-accent-rose">{error}</p>
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
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'Continuar al ejemplo' : 'Guardar mi carta'}
        </Button>
      </div>
    </GlassCard>
  );
}

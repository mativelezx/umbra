'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-2xl flex-col items-start justify-center px-6 py-24 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">Algo no salió como esperabas</p>
      <h1 className="mt-4 font-display text-5xl italic text-text-1 md:text-6xl">
        Tropezamos con un error.
      </h1>
      <p className="mt-6 max-w-xl font-body text-lg text-text-2">
        No es tu culpa. Algo del lado de Umbra falló. Probá reintentar o volvé al inicio.
        Si el problema persiste, escribinos y lo revisamos.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-text-4">
          Código de referencia: <span className="text-text-3">{error.digest}</span>
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-4">
        <Button onClick={reset} size="lg">
          Reintentar
        </Button>
        <Link href="/">
          <Button variant="ghost" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
      <p className="mt-16 max-w-xl font-body text-xs text-text-4">
        Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911
      </p>
    </main>
  );
}

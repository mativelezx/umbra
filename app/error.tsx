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
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        Algo se rompió de nuestro lado
      </p>
      <h1 className="mt-4 text-balance font-heading font-semibold text-5xl not-italic text-text-1 md:text-6xl">
        Tropezamos con un error.
      </h1>
      <p className="mt-6 max-w-xl text-pretty font-body text-lg leading-relaxed text-text-2">
        No es tu culpa. Lo registramos y lo estamos mirando. Volvé a intentar o regresá al inicio.
      </p>
      {error.digest && (
        <p className="mt-4 font-body text-xs tabular-nums text-text-4">
          Código de referencia: <span className="text-text-3">{error.digest}</span>
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={reset} size="lg">
          Volver a intentar
        </Button>
        <Link href="/">
          <Button variant="ghost" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
      <p className="mt-16 max-w-xl text-pretty font-body text-xs text-text-4">
        Umbra no es terapia. Si estás en crisis: 135 (CABA y GBA), 911 o 0800-999-0091 (Argentina, 24 horas).
      </p>
    </main>
  );
}

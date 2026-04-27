import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-2xl flex-col items-start justify-center px-6 py-24 md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">404 — página no encontrada</p>
      <h1 className="mt-4 text-balance font-display text-6xl italic text-text-1 md:text-7xl">
        Te perdiste en la sombra.
      </h1>
      <p className="mt-6 max-w-xl text-pretty font-body text-lg leading-relaxed text-text-2">
        Esta página no existe, o se mudó. No es nada grave. Volvamos a algo conocido.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/">
          <Button size="lg">Volver al inicio</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="lg">
            Ir a tu perfil
          </Button>
        </Link>
      </div>
      <p className="mt-16 max-w-xl text-pretty font-body text-xs text-text-4">
        Umbra no es terapia. Si estás en crisis: 135 (Argentina), 911 o 0800-999-0091.
      </p>
    </main>
  );
}

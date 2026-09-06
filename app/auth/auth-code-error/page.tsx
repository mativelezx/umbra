import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'El link no funcionó · Umbra',
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

const REASON_COPY: Record<string, { title: string; body: string }> = {
  expired: {
    title: 'Este link ya venció',
    body: 'Los links de confirmación viven 5 minutos por seguridad. Pedile uno nuevo.',
  },
  used: {
    title: 'Este link ya se usó',
    body: 'Los links son de un solo uso. Si necesitás otro, pedilo de nuevo.',
  },
  pkce: {
    title: 'No pudimos verificar el link',
    body: 'Algo se rompió en el camino entre el email y nosotros. Volvé a empezar el flujo.',
  },
};

export default async function AuthCodeErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason ?? 'pkce';
  const copy = REASON_COPY[reason] ?? REASON_COPY.pkce;

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-2xl flex-col items-start justify-center px-6 py-24 md:px-10">
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        Link de confirmación
      </p>
      <h1 className="mt-4 text-balance font-heading font-semibold text-5xl not-italic text-text-1 md:text-6xl">
        {copy.title}
      </h1>
      <p className="mt-6 max-w-xl text-pretty font-body text-lg leading-relaxed text-text-2">
        {copy.body}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/login">
          <Button size="lg">Ir a ingresar</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>

      <p className="mt-16 max-w-xl text-pretty font-body text-xs text-text-4">
        Umbra no es terapia. Si estás en crisis: 135 (Argentina), 911 o 0800-999-0091.
      </p>
    </main>
  );
}

import Link from 'next/link';
import type { Icon } from '@phosphor-icons/react';
import {
  UserCircle,
  DownloadSimple,
  Flask,
  Trash,
  ArrowRight,
} from '@phosphor-icons/react/dist/ssr';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Configuración',
};

interface SettingsEntry {
  href: string;
  icon: Icon;
  title: string;
  description: string;
  accent?: 'danger';
}

const ENTRIES: SettingsEntry[] = [
  {
    href: '/settings/profile',
    icon: UserCircle,
    title: 'Perfil',
    description: 'Tu nombre visible y email.',
  },
  {
    href: '/settings/export',
    icon: DownloadSimple,
    title: 'Exportar mis datos',
    description:
      'Descargar todo lo que Umbra tiene sobre vos en JSON. Cumple con tu derecho de acceso bajo la Ley 25.326.',
  },
  {
    href: '/settings/research-opt-out',
    icon: Flask,
    title: 'Modo investigación',
    description:
      'Activar o desactivar la contribución seudonimizada al dataset de investigación académica.',
  },
  {
    href: '/settings/delete',
    icon: Trash,
    title: 'Eliminar mi cuenta',
    description:
      'Borra tu perfil, narrativa, conversaciones, plan y carta. Irreversible. Derecho de cancelación bajo Ley 25.326.',
    accent: 'danger',
  },
];

export default function SettingsPage() {
  return (
    <LayoutShell>
      <div className="flex flex-col gap-10 max-w-3xl">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Tu espacio
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
            Configuración
          </h1>
          <p className="mt-4 max-w-2xl font-body text-text-2">
            Gestioná tus datos, tu participación en investigación, y tu cuenta. Todo acá
            está pensado para que vos tengas control total.
          </p>
        </div>

        <div className="grid gap-4">
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const isDanger = entry.accent === 'danger';
            return (
              <Link key={entry.href} href={entry.href} className="group">
                <Card
                  className={
                    isDanger
                      ? 'border-accent-rose/20 transition-colors group-hover:border-accent-rose/40'
                      : 'transition-colors group-hover:border-violet-400/30'
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        isDanger
                          ? 'mt-1 shrink-0 rounded-md bg-accent-rose/10 p-2.5 text-accent-rose'
                          : 'mt-1 shrink-0 rounded-md bg-violet-400/10 p-2.5 text-violet-300'
                      }
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h2
                        className={
                          isDanger
                            ? 'font-display text-xl text-accent-rose'
                            : 'font-display text-xl text-text-1'
                        }
                      >
                        {entry.title}
                      </h2>
                      <p className="mt-1.5 font-body text-sm leading-relaxed text-text-2">
                        {entry.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="mt-2 shrink-0 text-text-3 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="max-w-2xl font-body text-xs text-text-4">
          Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911. Si necesitás
          ayuda con tu cuenta o querés ejercer otro derecho de la Ley 25.326, contactá al
          responsable del tratamiento desde la página de privacidad.
        </p>
      </div>
    </LayoutShell>
  );
}

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
    title: 'Tu perfil',
    description: 'Tu nombre visible y tu email.',
  },
  {
    href: '/settings/export',
    icon: DownloadSimple,
    title: 'Bajar todos mis datos',
    description:
      'Un JSON con todo lo que Umbra tiene sobre vos. Cumple con tu derecho de acceso bajo Ley 25.326.',
  },
  {
    href: '/settings/research-opt-out',
    icon: Flask,
    title: 'Modo investigación',
    description:
      'Activar o desactivar la contribución seudonimizada al dataset de investigación académica. Es reversible.',
  },
  {
    href: '/settings/delete',
    icon: Trash,
    title: 'Eliminar mi cuenta',
    description:
      'Borra tu perfil, narrativa, conversaciones, plan y carta al futuro. Irreversible. Derecho de cancelación bajo Ley 25.326.',
    accent: 'danger',
  },
];

export default function SettingsPage() {
  return (
    <LayoutShell>
      <div className="flex max-w-3xl flex-col gap-10">
        <div>
          <p className="font-body text-sm normal-case tracking-normal text-text-3">
            Tu espacio
          </p>
          <h1 className="mt-2 text-balance font-heading font-semibold text-4xl not-italic text-text-1 md:text-5xl">
            Configuración
          </h1>
          <p className="mt-4 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
            Tus datos, tu participación en investigación y tu cuenta. Todo está pensado para que tengas control. Cada acción se explica antes de ejecutarse.
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
                      ? 'rounded-2xl border-accent-rose/20 transition-[border-color,box-shadow] duration-200 ease-out group-hover:border-accent-rose/40 '
                      : 'rounded-2xl transition-[border-color,box-shadow] duration-200 ease-out group-hover:border-violet-400/30 '
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        isDanger
                          ? 'mt-1 shrink-0 rounded-xl bg-accent-rose/10 p-2.5 text-accent-rose'
                          : 'mt-1 shrink-0 rounded-xl bg-violet-400/10 p-2.5 text-violet-300'
                      }
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h2
                        className={
                          isDanger
                            ? 'text-balance font-heading font-semibold text-2xl text-accent-rose'
                            : 'text-balance font-heading font-semibold text-2xl text-text-1'
                        }
                      >
                        {entry.title}
                      </h2>
                      <p className="mt-1.5 text-pretty font-body text-base leading-relaxed text-text-2">
                        {entry.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="mt-2 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="max-w-2xl text-pretty font-body text-xs text-text-4">
          Umbra no es terapia. Si estás en crisis, llamá al 135 (Argentina), al 911 o al 0800-999-0091 (Salud Mental Responde, Lun a Vie 8 a 20 h). Para otros derechos de la Ley 25.326, contactá al responsable del tratamiento desde la página de privacidad.
        </p>
      </div>
    </LayoutShell>
  );
}

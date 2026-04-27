'use client';

import { ArrowRight, ChatCircle, Sparkle } from '@phosphor-icons/react';
import { GlassCard } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n/dict';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';

interface ModeSelectorProps {
  onPick: (mode: OnboardingEntryMode) => void;
}

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return (
    <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 md:px-10 md:py-24">
      <header className="flex flex-col gap-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
          {t('onboarding.selector_eyebrow')}
        </p>
        <h1 className="text-balance font-display text-5xl italic text-text-1 md:text-6xl">
          {t('onboarding.selector_title')}
        </h1>
        <p className="mx-auto max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
          {t('onboarding.selector_subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ModeCard
          icon={<ChatCircle size={28} weight="duotone" />}
          eyebrow={t('onboarding.selector_chat_eyebrow')}
          title={t('onboarding.selector_chat_title')}
          description={t('onboarding.selector_chat_desc')}
          meta={t('onboarding.selector_chat_pill')}
          onClick={() => onPick('dynamic')}
          accent
        />
        <ModeCard
          icon={<Sparkle size={28} weight="duotone" />}
          eyebrow={t('onboarding.selector_chatgpt_eyebrow')}
          title={t('onboarding.selector_chatgpt_title')}
          description={t('onboarding.selector_chatgpt_desc')}
          meta={t('onboarding.selector_chatgpt_pill')}
          onClick={() => onPick('chatgpt-seed')}
        />
      </div>

      <p className="mx-auto max-w-xl text-pretty text-center font-body text-xs italic text-text-3">
        Las dos rutas llegan al mismo lugar: tu perfil completo, una narrativa y un plan. Elegí la que te resulte más natural.
      </p>
    </div>
  );
}

interface ModeCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  onClick: () => void;
  accent?: boolean;
}

function ModeCard({
  icon,
  eyebrow,
  title,
  description,
  meta,
  onClick,
  accent = false,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group rounded-2xl text-left transition-[scale] duration-150 ease-out active:scale-[0.985]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-umbra-void',
      )}
    >
      <GlassCard
        className={cn(
          'relative flex h-full flex-col gap-5 rounded-2xl border border-violet-400/10 p-7',
          'transition-[border-color,box-shadow,transform] duration-200 ease-out',
          'group-hover:-translate-y-0.5 group-hover:border-violet-400/35',
          accent
            ? 'shadow-[0_0_0_1px_rgba(180,102,255,0.18),0_8px_36px_-16px_rgba(180,102,255,0.35)] group-hover:shadow-[0_0_0_1px_rgba(180,102,255,0.30),0_12px_44px_-16px_rgba(180,102,255,0.45)]'
            : 'group-hover:shadow-[0_0_0_1px_rgba(180,102,255,0.20),0_8px_28px_-14px_rgba(180,102,255,0.25)]',
        )}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            {eyebrow}
          </p>
          <span className="text-text-3 transition-colors duration-200 group-hover:text-violet-200">
            {icon}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-balance font-display text-3xl italic text-text-1">{title}</h2>
          <p className="text-pretty font-body text-base leading-relaxed text-text-2">
            {description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-2">
            {meta}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-3 transition-colors duration-200 group-hover:text-violet-200">
            Elegir
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </GlassCard>
    </button>
  );
}

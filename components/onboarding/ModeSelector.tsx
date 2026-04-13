'use client';

import { NotePencil, Path, Target } from '@phosphor-icons/react';
import type { OnboardingMode } from '@/types';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n/dict';

const MODES: Array<{
  key: OnboardingMode;
  Icon: typeof NotePencil;
  titleKey: string;
  descKey: string;
  recommended?: boolean;
}> = [
  {
    key: 'guided',
    Icon: NotePencil,
    titleKey: 'onboarding.mode_guided',
    descKey: 'onboarding.mode_guided_desc',
    recommended: true,
  },
  {
    key: 'freetext',
    Icon: Path,
    titleKey: 'onboarding.mode_freetext',
    descKey: 'onboarding.mode_freetext_desc',
  },
  {
    key: 'hybrid',
    Icon: Target,
    titleKey: 'onboarding.mode_hybrid',
    descKey: 'onboarding.mode_hybrid_desc',
  },
];

interface ModeSelectorProps {
  selected: OnboardingMode | null;
  onSelect: (mode: OnboardingMode) => void;
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {MODES.map(({ key, Icon, titleKey, descKey, recommended }) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              'group relative flex flex-col items-start gap-4 rounded-lg p-6 text-left transition-all duration-300',
              isActive
                ? 'glass border-violet-400 shadow-[0_0_60px_rgba(180,102,255,0.15)]'
                : 'glass hover:border-violet-400/40',
            )}
            aria-pressed={isActive}
          >
            {recommended && (
              <span className="absolute top-4 right-4 rounded-full bg-violet-400/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-violet-300">
                Recomendado
              </span>
            )}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-md transition-colors',
                isActive ? 'bg-violet-400/20 text-violet-200' : 'bg-violet-400/5 text-violet-300',
              )}
            >
              <Icon size={24} weight="regular" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-text-1">{t(titleKey)}</h3>
              <p className="mt-2 font-body text-sm text-text-2 leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

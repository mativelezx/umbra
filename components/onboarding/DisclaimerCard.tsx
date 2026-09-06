import { Warning } from '@phosphor-icons/react/dist/ssr';
import { t } from '@/lib/i18n/dict';

export function DisclaimerCard() {
  return (
    <aside
      role="note"
      className="flex items-start gap-3 border-y border-violet-400/15 py-4"
    >
      <Warning size={20} weight="regular" className="mt-0.5 shrink-0 text-accent-amber" />
      <div>
        <h3 className="font-heading text-sm font-semibold text-text-1">
          {t('onboarding.disclaimer_title')}
        </h3>
        <p className="mt-1 font-body text-sm text-text-2 leading-relaxed">
          {t('onboarding.disclaimer_text')}
        </p>
      </div>
    </aside>
  );
}

import { Phone, Warning } from '@phosphor-icons/react/dist/ssr';

export function CrisisBanner() {
  return (
    <div
      role="complementary"
      aria-label="Aviso de seguridad permanente"
      className="sticky top-0 z-10 flex items-start gap-3 border-b border-accent-amber/30 bg-amber-400/5 px-4 py-3  md:items-center"
    >
      <Warning size={18} weight="regular" className="mt-0.5 shrink-0 text-accent-amber md:mt-0" />
      <p className="font-body text-xs leading-relaxed text-text-2">
        <span className="font-heading font-semibold text-text-1">Umbra no es terapia.</span>{' '}
        Si estás en crisis, llamá al{' '}
        <a href="tel:135" className="inline-flex items-center gap-1 font-heading text-accent-amber hover:underline">
          <Phone size={12} /> 135
        </a>{' '}
        (Argentina) o al{' '}
        <a href="tel:911" className="font-heading text-accent-amber hover:underline">
          911
        </a>
        .
      </p>
    </div>
  );
}

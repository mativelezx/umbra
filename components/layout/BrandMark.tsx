/** Original Umbra mark: two offset apertures; no letterform or borrowed asset. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`brand-mark ${className}`} width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path className="brand-aperture-left" d="M27.3 3.5C13.7 1.3 3.5 10.1 3.5 23.4c0 10.9 7.8 19.8 18.2 21.1-6.8-5.1-9.3-11.2-6.4-18.8C18 18.7 26 13.5 27.3 3.5Z" fill="currentColor" />
      <path className="brand-aperture-right" d="M26.3 3.5c6.8 5.1 9.3 11.2 6.4 18.8-2.7 7-10.7 12.2-12 22.2 13.6 2.2 23.8-6.6 23.8-19.9 0-10.9-7.8-19.8-18.2-21.1Z" fill="currentColor" />
    </svg>
  );
}

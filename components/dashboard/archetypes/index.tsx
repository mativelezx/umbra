import type { Archetype } from '@/types';
import { SvgArtwork } from '@/components/motion/SvgArtwork';

interface ArchetypeSvgProps {
  size?: number;
  className?: string;
}

const VIEWBOX = '0 0 256 256';
const STROKE = '#454543';
const ACCENT = '#53534f';

// Hero — a shield with ascending arrow (conquest, protection)
function Hero({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="100" stroke={STROKE} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="128" cy="128" r="60" stroke={ACCENT} strokeOpacity="0.4" strokeWidth="1" />
      <path
        d="M128 60 L180 90 L180 140 C180 170, 156 188, 128 198 C100 188, 76 170, 76 140 L76 90 Z"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M128 90 L128 160 M108 120 L128 100 L148 120"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sage — concentric circles + an eye (vision, depth)
function Sage({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="108" stroke={STROKE} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="1 3" />
      <circle cx="128" cy="128" r="80" stroke={STROKE} strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="128" cy="128" r="50" stroke={STROKE} strokeWidth="2" />
      <circle cx="128" cy="128" r="18" fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="2" />
      <circle cx="128" cy="128" r="4" fill={STROKE} />
      <path d="M128 20 L128 50 M236 128 L206 128 M128 236 L128 206 M20 128 L50 128"
        stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Explorer — compass star with trajectory
function Explorer({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="96" stroke={STROKE} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
      <path
        d="M128 40 L148 128 L128 216 L108 128 Z"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M40 128 L128 108 L216 128 L128 148 Z"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />
      <circle cx="128" cy="128" r="6" fill={STROKE} />
      <path
        d="M60 60 Q90 90 128 88"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeOpacity="0.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Creator — overlapping geometric shapes becoming something new
function Creator({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="104" stroke={STROKE} strokeOpacity="0.2" strokeWidth="1" />
      <rect x="70" y="70" width="90" height="90" stroke={ACCENT} strokeWidth="2" strokeOpacity="0.6" transform="rotate(15 115 115)" />
      <circle cx="148" cy="148" r="50" stroke={STROKE} strokeWidth="2" />
      <path
        d="M80 80 L176 176 M176 80 L80 176"
        stroke={ACCENT}
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <circle cx="128" cy="128" r="6" fill={STROKE} />
      <circle cx="128" cy="128" r="14" stroke={STROKE} strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}

// Caregiver — embracing arcs (protection, enclosure)
function Caregiver({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="100" stroke={STROKE} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="1 4" />
      <path
        d="M60 128 Q60 60 128 60 Q196 60 196 128"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M70 128 Q70 180 128 200 Q186 180 186 128"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="128" cy="128" r="22" stroke={ACCENT} strokeWidth="1.5" fill={ACCENT} fillOpacity="0.1" />
      <circle cx="128" cy="128" r="8" fill={STROKE} />
      <path
        d="M96 128 L160 128 M128 96 L128 160"
        stroke={STROKE}
        strokeOpacity="0.3"
        strokeWidth="1"
      />
    </svg>
  );
}

// Rebel — fracturing grid, lightning
function Rebel({ size = 128, className }: ArchetypeSvgProps) {
  return (
    <svg viewBox={VIEWBOX} width={size} height={size} className={className} fill="none">
      <circle cx="128" cy="128" r="100" stroke={STROKE} strokeOpacity="0.2" strokeWidth="1" />
      <line x1="40" y1="60" x2="216" y2="60" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="40" y1="100" x2="100" y2="100" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="156" y1="100" x2="216" y2="100" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="40" y1="156" x2="100" y2="156" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="156" y1="156" x2="216" y2="156" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="40" y1="196" x2="216" y2="196" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.3" />
      <path
        d="M140 50 L100 130 L140 130 L110 210"
        stroke={STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const MAP: Record<Archetype, (props: ArchetypeSvgProps) => JSX.Element> = {
  hero: Hero,
  sage: Sage,
  explorer: Explorer,
  creator: Creator,
  caregiver: Caregiver,
  rebel: Rebel,
};

export function ArchetypeSvg({
  archetype,
  size = 128,
  className,
}: {
  archetype: Archetype;
  size?: number;
  className?: string;
}) {
  const Component = MAP[archetype];
  return <SvgArtwork className={`archetype-art archetype-${archetype}`}><Component size={size} className={className} /></SvgArtwork>;
}

import { useId } from 'react';
import type { CSSProperties } from 'react';
import styles from './Landing.module.css';

/** Identical Bézier commands let CSS interpolate the current's contours
 * without a canvas, animation timer, external asset or filter pass. */
export function FluidField() {
  const gradientId = useId();
  return (
    <svg className={styles.fluidField} viewBox="0 0 900 1000" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="80" y1="0" x2="770" y2="1000" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1f0e9" stopOpacity=".05" />
          <stop offset=".25" stopColor="#f1f0e9" stopOpacity=".8" />
          <stop offset=".6" stopColor="#f1f0e9" stopOpacity=".18" />
          <stop offset=".83" stopColor="#f1f0e9" stopOpacity=".7" />
          <stop offset="1" stopColor="#f1f0e9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 28 }, (_, index) => {
        const from = `M -180 ${80 + index * 10} C 350 ${-170 + index * 5} 1080 ${160 + index * 12} 610 ${350 + index * 8} S -80 ${670 + index * 4} 930 ${840 + index * 10}`;
        const to = `M -160 ${150 + index * 12} C 500 ${-260 + index * 9} 940 ${360 + index * 4} 530 ${430 + index * 6} S 80 ${720 + index * 10} 990 ${800 + index * 9}`;
        return (
          <path key={index} d={from} stroke={`url(#${gradientId})`} strokeWidth={index % 7 === 0 ? 1.8 : 1}
            className={styles.fluidContour}
            style={{ '--flow-from': `path("${from}")`, '--flow-to': `path("${to}")` } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}

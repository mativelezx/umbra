import { useId } from 'react';
import styles from './Landing.module.css';

/** Authored vector paper study. Decorative: never a measured profile or progress indicator. */
export function StoryScene({ selected }: { selected: number }) {
  const id = useId();
  return (
    <div className={styles.storyScene} data-story-scene={['questions', 'reading', 'activities'][selected]} aria-hidden="true">
      <svg viewBox="0 0 600 440" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${id}-paper`} x1="132" y1="116" x2="319" y2="283" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffef8" /><stop offset=".8" stopColor="#e6e4d8" /><stop offset="1" stopColor="#b8b9aa" />
          </linearGradient>
          <linearGradient id={`${id}-fold`} x1="315" y1="176" x2="490" y2="251" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9c9f90" /><stop offset=".15" stopColor="#e4e3d7" /><stop offset="1" stopColor="#f8f6ed" />
          </linearGradient>
        </defs>
        <g className={styles.storyThreads} stroke="#b9bdac" strokeWidth="1.2">
          <path d="M-30 142C56 62 87 170 122 127S146 61 200 98" />
          <path d="M-20 176C28 113 77 228 126 169S134 102 213 122" />
          <path d="M401 148C492 58 427 39 394 58S492 105 624 14" />
          <path d="M418 314C510 385 528 208 632 300" />
          <path d="M412 328C486 399 551 245 615 338" />
        </g>
        <g className={styles.storyBook}>
          <path d="m126 126 170 43 188-75-8 243-182 74-171-55 3-230Z" fill="#888d7b" />
          <path d="M134 117c76-18 119 2 172 48 56-54 111-77 184-67l-14 229c-65-3-121 17-181 68-44-36-96-49-169-44l8-234Z" fill="#d4d7c9" />
          <g className={styles.storyLeftPage}>
            <path d="M130 98c60-5 122 10 176 55l-11 232c-49-41-113-65-178-51l13-236Z" fill={`url(#${id}-paper)`} />
            <path d="M151 122c51 0 100 17 137 43M148 132c51 1 99 18 135 44" stroke="#bbbcae" strokeWidth=".8" />
            <g className={styles.storyHandwriting} stroke="#4c5548" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path pathLength="100" d="M153 180c15-14 9 21 20 10s10-4 19 2 8-12 15-2 19-1 28 8 13 0 25 8" />
              <path pathLength="100" d="M150 203c9-14 6 12 15 8s10-10 21 3 7-7 17 1 11-1 26 9 10-5 29 7" />
              <path pathLength="100" d="M148 228c12-6 7 17 19 8s13 7 22 4 8 8 23 7 19 13 33 11" />
              <path pathLength="100" d="M148 256c19 10 19-8 34 3s14 9 25 6" />
            </g>
            <path d="M147 298c40-3 79 18 111 30" stroke="#929b83" strokeWidth="1" />
          </g>
          <g className={styles.storyRightPage}>
            <path d="M306 153c66-58 116-79 189-72l-11 236c-66-8-128 21-189 68l11-232Z" fill={`url(#${id}-fold)`} />
            <path d="M307 163c-4 67-6 149-12 210" stroke="#858d7a" strokeOpacity=".45" />
            <g className={styles.storyReading} stroke="#626b59" strokeWidth="1.5" strokeLinecap="round">
              <path pathLength="100" d="M337 173c40-28 80-42 119-43M337 190c40-28 78-42 117-43M335 207c33-24 59-31 83-36" />
              <path pathLength="100" d="M332 245c40-28 80-42 119-43M331 262c40-28 80-42 119-43M329 279c33-24 59-31 83-36" />
            </g>
            <g className={styles.storyPath} stroke="#3e523c" strokeWidth="2.5" strokeLinecap="round">
              <path pathLength="100" d="M346 318c-24-48 27-36 48-64s-27-46-10-74c11-18 31-22 51-23" />
              <path d="m427 151 11 5-7 10" />
            </g>
          </g>
          <path d="m291 389 4 30 13-12 12 3-3-39-26 18Z" fill="#8c9e7b" />
        </g>
        <g className={styles.storyPen}>
          <path d="m191 231 100-142 12 9-101 141-19 12 8-20Z" fill="#b8c4a5" />
          <path d="m196 231 98-137m-101 143-7 10" stroke="#35412d" strokeWidth="2" />
          <path d="m291 89 6-8c6-6 17 2 12 9l-6 8-12-9Z" fill="#e9eddf" />
        </g>
        <g className={styles.storyWords} fill="#c4cabb" fontSize="13" fontWeight="400">
          <text x="32" y="98" transform="rotate(-9 32 98)">lo que pienso</text>
          <text x="409" y="45" transform="rotate(7 409 45)">lo que siento</text>
          <text x="450" y="393" transform="rotate(-7 450 393)">lo que elijo</text>
        </g>
      </svg>
    </div>
  );
}

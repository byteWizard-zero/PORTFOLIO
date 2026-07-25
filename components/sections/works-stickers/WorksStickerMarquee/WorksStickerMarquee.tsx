'use client';

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksStickerMarquee.module.css';

export interface WorksStickerMarqueeProps {
  title: string;
  
  durationSec: number;
  
  outline?: boolean;
  
  paused?: boolean;
  
  inverted?: boolean;
  
  repeats?: number;
}

export function WorksStickerMarquee({
  title,
  durationSec,
  outline = false,
  paused = false,
  inverted = false,
  repeats = 6,
}: WorksStickerMarqueeProps) {
  const reduced = useReducedMotion();

  const trackStyle = cssVars({ '--marquee-dur': `${durationSec}s` });

  const chunkClass = `${styles.chunk}${outline ? ` ${styles.outline}` : ''}`;
  const isPaused = paused || reduced;
  const trackClass = `${styles.track}${isPaused ? ` ${styles.paused}` : ''}`;
  const viewportClass = `${styles.viewport}${inverted ? ` ${styles.inverted}` : ''}`;

  const renderCopy = (copyKey: string) => (
    <div key={copyKey} className={styles.copy} aria-hidden="true">
      {Array.from({ length: repeats }, (_, i) => (
        <span key={i} className={styles.unit}>
          <span className={chunkClass}>{title}</span>
          <span className={styles.star}>
            <StarIcon variant={i % 2 === 0 ? 'outline' : 'filled'} />
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={viewportClass} aria-hidden="true">
      <div className={trackClass} style={trackStyle}>
        {renderCopy('a')}
        {renderCopy('b')}
      </div>
    </div>
  );
}

'use client';

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksRowMarquee.module.css';

export interface WorksRowMarqueeProps {
  title: string;
  discipline: string;
  year: number;
  
  durationSec: number;
  
  outline?: boolean;
  
  paused?: boolean;
  
  inverted?: boolean;
  
  repeats?: number;
}

export function WorksRowMarquee({
  title,
  discipline,
  year,
  durationSec,
  outline = false,
  paused = false,
  inverted = false,
  repeats = 4,
}: WorksRowMarqueeProps) {
  const reduced = useReducedMotion();
  const trackStyle = cssVars({ '--marquee-dur': `${durationSec}s` });

  const chunkClass = `${styles.chunk}${outline ? ` ${styles.outline}` : ''}`;
  const isPaused = paused || reduced;
  const trackClass = `${styles.track}${isPaused ? ` ${styles.paused}` : ''}`;
  const viewportClass = `${styles.viewport}${inverted ? ` ${styles.inverted}` : ''}`;

  const renderCopy = (copyKey: string) => (
    <div key={copyKey} className={styles.copy} aria-hidden="true">
      {Array.from({ length: repeats }, (_, i) => (
        <span key={i} className={chunkClass}>
          {title}
          <span className={styles.star}>
            <StarIcon variant="outline" />
          </span>
          <span className={styles.tag}>{discipline}</span>
          <span className={styles.star}>
            <StarIcon variant="filled" />
          </span>
          <span className={styles.tag}>{year}</span>
          <span className={styles.star}>
            <StarIcon variant="outline" />
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

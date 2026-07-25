'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksPreview.module.css';

export interface WorksPreviewEntry {
  id: string;
  image: string;
  alt: string;
  accent: string;
}

export interface WorksPreviewProps {
  
  entries: WorksPreviewEntry[];
  
  activeIndex: number;
  
  visible: boolean;
}

export function WorksPreview({ entries, activeIndex, visible }: WorksPreviewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const xToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const reduced = useReducedMotion();

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const canHover =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover || reduced) return undefined;

    xToRef.current = gsap.quickTo(el, 'left', { duration: 0.55, ease: 'power3' });
    yToRef.current = gsap.quickTo(el, 'top', { duration: 0.55, ease: 'power3' });

    const onMove = (e: MouseEvent) => {

      const snap = !visibleRef.current;
      if (snap) {
        xToRef.current?.(e.clientX, e.clientX);
        yToRef.current?.(e.clientY, e.clientY);
      } else {
        xToRef.current?.(e.clientX);
        yToRef.current?.(e.clientY);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.killTweensOf(el);
    };
  }, [reduced]);

  const rootClass = `${styles.preview}${visible ? ` ${styles.visible}` : ''}`;

  const activeAccent = entries[activeIndex]?.accent;
  const rootStyle = activeAccent ? cssVars({ '--preview-accent': activeAccent }) : undefined;
  const sliderStyle: CSSProperties = {
    transform: `translateY(-${activeIndex * 100}%)`,
  };

  return (
    <div ref={rootRef} className={rootClass} style={rootStyle} aria-hidden="true">
      <div className={styles.slider} style={sliderStyle}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.card}>
            <Image
              className={styles.image}
              src={entry.image}
              alt={entry.alt}
              width={1600}
              height={1000}
              sizes="(min-width: 1024px) 360px, 280px"
              priority={false}
              unoptimized
            />
          </div>
        ))}
      </div>
      <span className={styles.badge}>View<br />Case</span>
    </div>
  );
}

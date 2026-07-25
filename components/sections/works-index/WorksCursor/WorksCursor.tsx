'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksCursor.module.css';

export interface WorksCursorProps {
  
  hovered: boolean;
  
  accent: string | null;
  
  label?: string;
}

export function WorksCursor({ hovered, accent, label = 'Open' }: WorksCursorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  
  const quickXRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickYRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return undefined;
    }

    quickXRef.current = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' });
    quickYRef.current = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      quickXRef.current?.(e.clientX);
      quickYRef.current?.(e.clientY);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced]);

  const className = `${styles.cursor}${hovered ? ` ${styles.onRow}` : ''}`;
  const style = accent ? cssVars({ '--cursor-accent': accent }) : undefined;

  return (
    <div ref={ref} className={className} style={style} aria-hidden="true">
      <span className={styles.label}>{label}</span>
    </div>
  );
}

'use client';

import React, { useRef, useSyncExternalStore } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal/ScrollReveal';
import styles from './QuoteReveal.module.css';

const QUOTE_LINES = [
  "Every developer learns this eventually.",
  "The loudest bug is rarely the worst one.",
  "It’s the silent bug…",
  "The one hiding deep inside the system…",
  "That costs you the most.",
  "The same is true for unspoken pain…",
  "//NO ERRORS LOGGED. ▒▒░░█[0x44]DΔMAGE DETECTED..."
];

const MOBILE_QUERY = '(max-width: 1024px)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getSnapshot = () =>
  typeof window !== 'undefined' && !!window.matchMedia &&
  window.matchMedia(MOBILE_QUERY).matches;

const getServerSnapshot = () => false;

export function QuoteReveal() {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <div ref={wrapperRef} className={styles.quoteWrapper}>
      <section ref={sectionRef} className={styles.section}>
        <div className={styles.glow} />
        <div className={styles.container}>
          <ScrollReveal
            triggerRef={sectionRef}
            wrapperRef={wrapperRef}
            scrollMultiplier={0.45}
            enableBlur={!isMobile}
            blurStrength={10}
            baseRotation={isMobile ? 3 : 8}
            baseOpacity={0.25}
            containerClassName={styles.revealContainer}
            textClassName={styles.revealText}
            lineAnimationStart="top 88%"
            lineAnimationEnd="top 45%"
          >
            {QUOTE_LINES.join('\n\n')}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

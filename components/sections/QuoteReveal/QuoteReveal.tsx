'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export function QuoteReveal() {
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div ref={wrapperRef} className={styles.quoteWrapper}>
      <section ref={sectionRef} className={styles.section}>
        <div className={styles.glow} />
        <div className={styles.container}>
          <ScrollReveal
            triggerRef={sectionRef}
            wrapperRef={wrapperRef}
            pin={true}
            pinSpacing={true}
            scrollMultiplier={0.45}
            enableBlur={true}
            blurStrength={10}
            baseRotation={isMobile ? 3 : 8}
            baseOpacity={0.3}
            start="top top"
            end="+=160%"
            scrub={0.8}
            containerClassName={styles.revealContainer}
            textClassName={styles.revealText}
          >
            {QUOTE_LINES.join('\n\n')}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, ANIMATION_CONFIG } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content } from '@/data';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { RevealText } from './RevealText';
import styles from './Philosophy.module.css';

const PHILOSOPHY_PIN_VH = 1.0;

export function Philosophy() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;
    if (!wrapperRef.current || !sectionRef.current || !labelRef.current) return;

    const labelTween = gsap.from(labelRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
      x: -50,
      opacity: 0,
      duration: 1.5,
      ease: ANIMATION_CONFIG.ease.outQuart,
    });

    const pinTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => '+=' + window.innerHeight * PHILOSOPHY_PIN_VH,
      pin: sectionRef.current,
      pinSpacing: true,
      onEnter: () => {
        if (window.lenis) {
          window.lenis.options.wheelMultiplier = 0.08;
        }
      },
      onLeave: () => {
        if (window.lenis) {
          window.lenis.options.wheelMultiplier = 0.45;
        }
      },
      onEnterBack: () => {
        if (window.lenis) {
          window.lenis.options.wheelMultiplier = 0.08;
        }
      },
      onLeaveBack: () => {
        if (window.lenis) {
          window.lenis.options.wheelMultiplier = 0.45;
        }
      },
    });

    return () => {
      pinTrigger.kill();
      if (labelTween.scrollTrigger) labelTween.scrollTrigger.kill();
      if (window.lenis) {
        window.lenis.options.wheelMultiplier = 0.45;
      }
    };
  }, { scope: wrapperRef, dependencies: [reducedMotion] });

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section ref={sectionRef} className={styles.section} id="philosophy">
        <MetaLabel ref={labelRef}>{content.philosophy.label}</MetaLabel>
        <RevealText
          text={content.philosophy.statement}
          highlights={content.philosophy.highlights}
        />
      </section>
    </div>
  );
}

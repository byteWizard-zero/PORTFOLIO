'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './ViewportFrame.module.css';

export function ViewportFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const revealFrame = (immediate = false) => {
      if (immediate || reducedMotion) {
        gsap.set(frame, { opacity: 1, scale: 1 });
        return;
      }
      gsap.to(frame, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        force3D: true,
      });
    };

    const welcomeScreenExists = !!document.querySelector('[data-welcome-wrapper]');
    const isHandedOff = typeof window !== 'undefined' && window.__welcomeHandoff;

    if (!welcomeScreenExists || isHandedOff || reducedMotion) {
      revealFrame(true);
    } else {
      gsap.set(frame, { opacity: 0, scale: 1.01 });

      const onHandoff = () => revealFrame(false);
      window.addEventListener('welcome-handoff', onHandoff, { once: true });
      window.addEventListener('welcome-complete', onHandoff, { once: true });

      return () => {
        window.removeEventListener('welcome-handoff', onHandoff);
        window.removeEventListener('welcome-complete', onHandoff);
      };
    }
  }, { scope: frameRef, dependencies: [reducedMotion] });

  return (
    <div className={styles.frameContainer} aria-hidden="true">
      <div ref={frameRef} className={styles.frameInner} />
    </div>
  );
}

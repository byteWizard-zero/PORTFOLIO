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

    let revealed = false;

    const revealFrame = (immediate = false) => {
      if (revealed) return;
      revealed = true;

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

    const welcomeWrapper = document.querySelector('[data-welcome-wrapper]') as HTMLElement | null;
    const isWelcomeWrapperVisible = welcomeWrapper &&
      welcomeWrapper.style.display !== 'none' &&
      welcomeWrapper.getAttribute('aria-hidden') !== 'true';

    const isFinished = typeof window !== 'undefined' &&
      (window.__welcomeHandoff || window.__welcomeComplete);

    if (!isWelcomeWrapperVisible || isFinished || reducedMotion) {
      revealFrame(true);
      return;
    }

    // Set initial hidden state while welcome animation plays
    gsap.set(frame, { opacity: 0, scale: 1.01 });

    const onHandoff = () => revealFrame(false);
    window.addEventListener('welcome-handoff', onHandoff, { once: true });
    window.addEventListener('welcome-complete', onHandoff, { once: true });

    // Safety fallback timeout: guarantee frame is visible even if animation fails or event is missed
    const fallbackTimer = setTimeout(() => {
      revealFrame(false);
    }, 3500);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('welcome-handoff', onHandoff);
      window.removeEventListener('welcome-complete', onHandoff);
    };
  }, { scope: frameRef, dependencies: [reducedMotion] });

  return (
    <div className={styles.frameContainer} aria-hidden="true">
      <div ref={frameRef} className={styles.frameInner} />
    </div>
  );
}


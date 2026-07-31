'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScrollLock } from '@/lib/useScrollLock';
import { content, features } from '@/data';
import styles from './WelcomeScreen.module.css';

const GREETINGS = content.welcomeScreen.greetings;
const INITIALS = content.welcomeScreen.initials;

export const WelcomeScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const [welcomeActive, setWelcomeActive] = useState(true);
  useScrollLock(welcomeActive, { compensateScrollbar: true });

  useGSAP(() => {
    const notifyComplete = () => {
      const _g = document.getElementById('welcome-gate');
      if (_g) { _g.style.opacity = '0'; setTimeout(() => _g.remove(), 350); }
      window.__welcomeHandoff = true;
      window.__welcomeComplete = true;
      window.dispatchEvent(new CustomEvent('welcome-handoff'));
      window.dispatchEvent(new CustomEvent('welcome-complete'));
    };

    if (features.welcomeScreen.skipOnReturn && !window.__freshLoad) {
      
      setWelcomeActive(false);
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      const handoffTimer = setTimeout(() => {
        notifyComplete();
      }, 0);
      return () => clearTimeout(handoffTimer);
    }

    const freshLoadTimer = setTimeout(() => {
      delete window.__freshLoad;
    }, 1000);

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    if (reducedMotion) {
      
      setWelcomeActive(false);
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      
      const handoffTimer = setTimeout(() => {
        notifyComplete();
      }, 0);
      return () => clearTimeout(handoffTimer);
    }

    const flightCtx = gsap.context(() => {});

    let handoffCall: gsap.core.Tween | null = null;

    const bailOut = (err: unknown) => {

      console.error('[WelcomeScreen] Animation setup failed, bailing out:', err);

      setWelcomeActive(false);
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      notifyComplete();
    };

    const tl = gsap.timeline({
      onComplete: () => {
        setWelcomeActive(false);

        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
        notifyComplete();
      }
    });

    try {

    const greetingElements = containerRef.current?.querySelectorAll(`.${styles.greeting}`);

    if (greetingElements && greetingElements.length > 0) {
        
        gsap.set(greetingElements, { 
            x: 0, 
            y: 15, 
            opacity: 0, 
            scale: 0.95,
            position: 'absolute',
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50
        });

        const totalGreetings = greetingElements.length;
        const targetTotalTime = totalGreetings > 10 ? 3.6 : 2.5; 
        const totalWordDuration = targetTotalTime / totalGreetings;

        const animDuration = totalWordDuration * 0.38;
        const fadeOutDuration = totalWordDuration * 0.38;
        const displayDuration = totalWordDuration * 0.24;

        greetingElements.forEach((el, index) => {
            const startTime = index * totalWordDuration;

            tl.to(el, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: animDuration,
                ease: "power2.out"
            }, startTime)
            .to(el, {
                opacity: 0,
                y: -15,
                scale: 1.05,
                duration: fadeOutDuration,
                ease: "power2.in",
                delay: displayDuration
            }, startTime + animDuration);
        });

        gsap.set(initialsRef.current, {
            xPercent: -50,
            yPercent: -50,
        });
        tl.fromTo(initialsRef.current,
            {
                scale: 1.2,
                opacity: 0,
                xPercent: -50,
                yPercent: -50,
            },
            {
                scale: 1,
                opacity: 1,
                xPercent: -50,
                yPercent: -50,
                duration: 0.5,
                ease: "power2.out"
            }
        );

        tl.addLabel("initialsRevealed");

        tl.call(() => {
          initialsRef.current?.classList.add(styles.glitching);
        }, undefined, "initialsRevealed+=0.2");

        tl.call(() => {
          initialsRef.current?.classList.remove(styles.glitching);
        }, undefined, "initialsRevealed+=0.65");
    }

      tl.addLabel("flightStart", "initialsRevealed+=0.65");

      tl.call(() => {
        const targetM = document.getElementById('target-m');
        const targetA = document.getElementById('target-a');

        if (!targetM || !targetA) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[WelcomeScreen] Target elements not found:', {
              targetM: !!targetM,
              targetA: !!targetA
            });
          }
          
          notifyComplete();
          return;
        }

        if (!mRef.current || !aRef.current) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[WelcomeScreen] Letter refs not available');
          }
          document.body.style.visibility = '';
          notifyComplete();
          return;
        }

        const rects = {
          targetM: targetM.getBoundingClientRect(),
          targetA: targetA.getBoundingClientRect(),
          currentM: mRef.current.getBoundingClientRect(),
          currentA: aRef.current.getBoundingClientRect()
        };

        const deltaMx = rects.targetM.left - rects.currentM.left;
        const deltaMy = rects.targetM.top - rects.currentM.top;
        const deltaAx = rects.targetA.left - rects.currentA.left;
        const deltaAy = rects.targetA.top - rects.currentA.top;

        const flightDuration = 1.2;
        const handoffDuration = 0.3;

        flightCtx.add(() => {
          
          gsap.to(mRef.current, {
            x: deltaMx,
            y: deltaMy,
            duration: flightDuration,
            ease: "power4.inOut"
          });

          gsap.to(aRef.current, {
            x: deltaAx,
            y: deltaAy,
            duration: flightDuration,
            ease: "power4.inOut"
          });

          gsap.to([mRef.current, aRef.current], {
            opacity: 0,
            duration: handoffDuration,
            ease: "power1.in",
            delay: flightDuration - handoffDuration
          });

          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
              delay: 0.4
            });
          }
        });

        handoffCall = gsap.delayedCall(flightDuration - handoffDuration, () => {
          notifyComplete();
        });
      }, [], "flightStart");

      tl.to({}, { duration: 1.3 }, "flightStart");
    } catch (err) {
      bailOut(err);
    }

    return () => {
      clearTimeout(freshLoadTimer);
      handoffCall?.kill();
      tl.kill();
      flightCtx.revert();
    };
  }, { scope: containerRef, dependencies: [reducedMotion] });

  return (
    <div
      ref={containerRef}
      data-welcome-wrapper
      className={styles.welcomeWrapper}
      style={{ visibility: 'visible' }}
    >
      <div className={styles.textContainer}>
        
        {GREETINGS.map((text, i) => (
          <div key={i} className={styles.greeting}>
            {text}
          </div>
        ))}

        <div ref={initialsRef} data-initials-container className={styles.initialsContainer}>
          <span ref={mRef} className={styles.letterM} data-text={INITIALS.first}>{INITIALS.first}</span>
          <span style={{ width: '0.1em' }}></span> 
          <span ref={aRef} className={styles.letterA} data-text={INITIALS.last}>{INITIALS.last}</span>
        </div>
      </div>
    </div>
  );
};

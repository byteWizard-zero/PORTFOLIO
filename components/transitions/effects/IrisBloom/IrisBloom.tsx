'use client';

import { useGSAP } from '@gsap/react';
import { useEffect, useRef } from 'react';
import { gsap, ANIMATION_CONFIG } from '@/lib/gsap';
import { getAccentColors, transitionsConfig } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { TransitionEffectProps } from '../../types';
import styles from './IrisBloom.module.css';

const DISC_OVERSIZE = 2.2;

const LAYER_SHRINK = 0.04;

const DISC_STAGGER = 0.08;

function getIrisConfig() {
  const cfg = (transitionsConfig.effects?.['iris-bloom'] ?? {}) as Record<
    string,
    unknown
  >;
  const num = (k: string, d: number) =>
    typeof cfg[k] === 'number' ? (cfg[k] as number) : d;
  return {
    exitDuration: num('exitDuration', 0.8),
    enterDuration: num('enterDuration', 1.4),
  };
}

function buildRingColors(accent: string): string[] {
  const palette = getAccentColors();
  const others = palette.filter((c) => c.toLowerCase() !== accent.toLowerCase());
  
  return [
    '#1b2028', // ink (always outer)
    others[0] ?? palette[1] ?? '#93b99e',
    others[1] ?? palette[2] ?? '#ff990a',
    accent,    // innermost = destination accent
  ];
}

function diagDist(cx: number, cy: number): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  return Math.sqrt(
    Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2
  ) * DISC_OVERSIZE;
}

export function IrisBloom({ phase, origin, payload, onComplete }: TransitionEffectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const colors = buildRingColors(payload.accent);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const reduceMotionRef = useRef(reduceMotion);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const discs = root.querySelectorAll<HTMLDivElement>(`.${styles.disc}`);
      if (discs.length === 0) return;

      if (phase === 'exit') reduceMotionRef.current = reduceMotion;

      const fireComplete = () => onCompleteRef.current();
      const reduce = reduceMotionRef.current;

      if (reduce) {
        if (phase === 'exit') {
          gsap.set(discs, { display: 'none' });
          gsap.fromTo(
            root,
            { opacity: 0 },
            {
              opacity: 1,
              duration: transitionsConfig.reducedMotionDuration,
              ease: 'power2.out',
              onComplete: fireComplete,
            }
          );
        } else {
          gsap.to(root, {
            opacity: 0,
            duration: transitionsConfig.reducedMotionDuration,
            ease: 'power2.in',
            onComplete: fireComplete,
          });
        }
        return;
      }

      gsap.set(discs, { clearProps: 'display' });

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = origin?.x ?? w / 2;
      const cy = origin?.y ?? h / 2;
      const D = diagDist(cx, cy);

      const sizeFor = (i: number) => D * (1 - i * LAYER_SHRINK);
      const sizeDiscs = (anchorX: number, anchorY: number) => {
        discs.forEach((d, i) => {
          gsap.set(d, {
            left: `${anchorX}px`,
            top: `${anchorY}px`,
            width: `${sizeFor(i)}px`,
            height: `${sizeFor(i)}px`,
            xPercent: -50,
            yPercent: -50,
            background: colors[i],
          });
        });
      };

      sizeDiscs(cx, cy);

      const exitEase = ANIMATION_CONFIG.ease.outExpo;     
      const enterEase = ANIMATION_CONFIG.ease.inOutQuart; 
      const irisCfg = getIrisConfig();

      if (phase === 'exit') {
        
        gsap.set(discs, { scale: 0 });
        gsap.to(discs, {
          scale: 1,
          duration: irisCfg.exitDuration,
          ease: exitEase,
          stagger: DISC_STAGGER,
          onComplete: fireComplete,
        });
      } else {

        sizeDiscs(w / 2, h / 2);
        gsap.set(discs, { scale: 1 });
        gsap.to([...discs].reverse(), {
          scale: 0,
          duration: irisCfg.enterDuration,
          ease: enterEase,
          stagger: DISC_STAGGER,
          onComplete: fireComplete,
        });
      }
    },
    { scope: rootRef, dependencies: [phase] }
  );

  return (
    <div ref={rootRef} className={styles.root}>
      
      <div className={styles.disc} />
      <div className={styles.disc} />
      <div className={styles.disc} />
      <div className={styles.disc} />
    </div>
  );
}

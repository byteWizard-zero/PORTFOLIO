'use client';

import { useRef, useMemo, useCallback, useEffect, Fragment } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, ANIMATION_CONFIG } from '@/lib/gsap';
import { hexToRgb } from '@/lib/colorUtils';
import styles from './RevealText.module.css';
import { useAccentColor } from '@/lib/AccentColorContext';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  getRandomDirection,
  getDirectionTransform,
  triggerPortalLoop,
} from '@/lib/portalAnimation';

interface RevealTextProps {
  text: string;
  highlights: string[];
}

const readPrimaryTextColor = (): string => {
  if (typeof window === 'undefined') return '#1b2028';
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-text')
    .trim() || '#1b2028';
};

type Rgb = readonly [number, number, number];

const colorToRgb = (color: string): Rgb => {
  const { r, g, b } = hexToRgb(color);
  return [r, g, b] as const;
};

const interpolateRgb = (c1: Rgb, c2: Rgb, progress: number): string => {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * progress);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * progress);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * progress);
  return `rgb(${r}, ${g}, ${b})`;
};

export function RevealText({ text, highlights }: RevealTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  const animationIntervals = useRef<number[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const staggerCall = useRef<gsap.core.Tween | null>(null);
  const reducedMotion = useReducedMotion();
  const { color: accentColor } = useAccentColor();
  const phase2TriggerRef = useRef<ScrollTrigger | null>(null);
  const highlightWordsRef = useRef<NodeListOf<Element> | null>(null);
  
  const cachedLettersRef = useRef<Map<Element, HTMLElement[]>>(new Map());

  const primaryRgbRef = useRef<Rgb>([27, 32, 40]);
  const accentRgbRef = useRef<Rgb>([98, 182, 203]);

  const words = useMemo(() => {
    return text.split(' ').map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isHighlight = highlights.some(h => h.toLowerCase() === cleanWord);
      return { word, index, isHighlight };
    });
  }, [text, highlights]);

  const handleLetterHover = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const portalLetter = e.currentTarget.querySelector(`.${styles.portalLetter}`) as HTMLElement;
    if (portalLetter) {
      triggerPortalLoop(portalLetter);
    }
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    const normalWords = containerRef.current.querySelectorAll(`.${styles.word}:not(.${styles.highlightWord})`);
    const highlightWords = containerRef.current.querySelectorAll(`.${styles.highlightWord}`);
    const highlightLetters = containerRef.current.querySelectorAll(`.${styles.portalLetter}`);

    if (reducedMotion) {
      gsap.set(normalWords, { opacity: 1, clearProps: 'transform' });
      gsap.set(highlightWords, { opacity: 1 });
      gsap.set(highlightLetters, { x: '0%', y: '0%' });
      (normalWords as NodeListOf<HTMLElement>).forEach((word) => {
        word.style.opacity = '1';
      });
      return;
    }

    gsap.set(highlightWords, { opacity: 0 });

    highlightLetters.forEach((letter) => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    const startAsyncAnimations = () => {
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const letters = Array.from(highlightLetters) as HTMLElement[];

      letters.forEach((letter) => {
        
        const scheduleNext = () => {
          
          if (signal.aborted) return;

          const randomDelay = 3000 + Math.random() * 3000;
          const intervalId = window.setTimeout(() => {
            
            if (signal.aborted) return;
            triggerPortalLoop(letter);
            scheduleNext();
          }, randomDelay);
          animationIntervals.current.push(intervalId);
        };

        const initialDelay = Math.random() * 3000;
        const initialId = window.setTimeout(() => {
          
          if (signal.aborted) return;
          triggerPortalLoop(letter);
          scheduleNext();
        }, initialDelay);
        animationIntervals.current.push(initialId);
      });
    };

    const triggerLetterStagger = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      gsap.to(highlightWords, {
        opacity: 1,
        duration: 0.01,
      });

      const letterDuration = 0.4;
      const maxRandomDelay = 0.25; 

      highlightLetters.forEach((letter) => {
        const randomDelay = Math.random() * maxRandomDelay;
        gsap.to(letter, {
          x: '0%',
          y: '0%',
          duration: letterDuration,
          delay: randomDelay,
          ease: 'power2.out',
        });
      });

      staggerCall.current = gsap.delayedCall(
        letterDuration + maxRandomDelay + 0.3,
        startAsyncAnimations
      );
    };

    let revealTriggered = false;

    const MAX_STAGGER_OFFSET = 0.85;
    const normalCount = normalWords.length;
    const wordStep = normalCount > 1
      ? Math.min(ANIMATION_CONFIG.stagger.words, MAX_STAGGER_OFFSET / (normalCount - 1))
      : 0;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 95%',
      end: 'top 35%',
      scrub: 2.5,
      onUpdate: (self) => {
        
        const progress = self.progress;
        normalWords.forEach((word, index) => {
          const offset = index * wordStep;
          const wordProgress = Math.max(0, Math.min(1,
            (progress - offset) / (1 - offset)
          ));
          (word as HTMLElement).style.opacity = String(0.15 + wordProgress * 0.85);
        });

        if (progress >= 0.9 && !revealTriggered) {
          revealTriggered = true;
          triggerLetterStagger();
        }
      },
    });

    primaryRgbRef.current = colorToRgb(readPrimaryTextColor());
    accentRgbRef.current = colorToRgb(accentColor);

    highlightWordsRef.current = highlightWords;

    cachedLettersRef.current.clear();
    highlightWords.forEach((wordEl) => {
      const letters = Array.from(wordEl.querySelectorAll(`.${styles.portalLetter}`)) as HTMLElement[];
      cachedLettersRef.current.set(wordEl, letters);
    });

    phase2TriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 50%',
      end: 'top 20%',
      scrub: 2.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalHighlights = highlightWords.length;
        const primaryRgb = primaryRgbRef.current;
        const accentRgb = accentRgbRef.current;
        highlightWords.forEach((wordEl, index) => {
          const staggerDelay = totalHighlights > 1 ? (index / (totalHighlights - 1)) * 0.3 : 0;
          const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
          const easedProgress = adjustedProgress < 0.5
            ? 2 * adjustedProgress * adjustedProgress
            : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;
          const color = interpolateRgb(primaryRgb, accentRgb, easedProgress);
          
          (wordEl as HTMLElement).style.setProperty('--highlight-color', color);
        });
      },
    });

    return () => {

      staggerCall.current?.kill();
      staggerCall.current = null;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      animationIntervals.current.forEach((id) => window.clearTimeout(id));
      animationIntervals.current = [];

      gsap.killTweensOf(highlightLetters);

      hasAnimated.current = false;
    };

  }, { scope: containerRef, dependencies: [words, reducedMotion] });

  useEffect(() => {
    primaryRgbRef.current = colorToRgb(readPrimaryTextColor());
    accentRgbRef.current = colorToRgb(accentColor);
    if (!phase2TriggerRef.current || !highlightWordsRef.current) return;

    const progress = phase2TriggerRef.current.progress;
    const totalHighlights = highlightWordsRef.current.length;
    const primaryRgb = primaryRgbRef.current;
    const accentRgb = accentRgbRef.current;

    highlightWordsRef.current.forEach((wordEl, index) => {
      const staggerDelay = totalHighlights > 1 ? (index / (totalHighlights - 1)) * 0.3 : 0;
      const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      const easedProgress = adjustedProgress < 0.5
        ? 2 * adjustedProgress * adjustedProgress
        : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;
      const color = interpolateRgb(primaryRgb, accentRgb, easedProgress);
      (wordEl as HTMLElement).style.setProperty('--highlight-color', color);
    });
  }, [accentColor]);

  return (
    <h2 ref={containerRef} className={styles.statementText} aria-label={text}>
      
      <span className="sr-only">{text}</span>
      {words.map(({ word, index, isHighlight }, i) => {
        const wordEl = isHighlight ? (
          <span
            className={`${styles.word} ${styles.highlightWord} ${styles.highlight}`}
            aria-hidden="true"
          >
            {word.split('').map((letter, letterIdx) => (
              <span
                key={letterIdx}
                className={styles.portalMask}
                onMouseEnter={handleLetterHover}
              >
                <span className={styles.portalLetter}>{letter}</span>
              </span>
            ))}
          </span>
        ) : (
          <span className={styles.word} aria-hidden="true">
            {word}
          </span>
        );

        return (
          <Fragment key={index}>
            {i > 0 && ' '}
            {wordEl}
          </Fragment>
        );
      })}
    </h2>
  );
}

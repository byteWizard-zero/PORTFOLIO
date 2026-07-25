'use client';

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap, ANIMATION_CONFIG } from '@/lib/gsap';
import { content, transitionsConfig, getAccentColors } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { TransitionEffectProps } from '../../types';
import styles from './ColorCurtainStack.module.css';

const STAR_PATH =
  'M12 0C12 0 14.5 9.5 24 12C14.5 14.5 12 24 12 24C12 24 9.5 14.5 0 12C9.5 9.5 12 0 12 0Z';

function Star({ variant }: { variant: 'outline' | 'filled' }) {
  return (
    <svg
      className={styles.star}
      viewBox="0 0 24 24"
      fill={variant === 'filled' ? 'currentColor' : 'none'}
      stroke={variant === 'outline' ? 'currentColor' : undefined}
      strokeWidth={variant === 'outline' ? 1.5 : undefined}
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

const INK = '#111416';

const LABEL_FADE_IN = 0.45; 
const LABEL_STAGGER = 0.08; 
const LABEL_FADE_OUT = 0.2; 
const LABEL_OFFSET = 0.35; 

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function resolvePanelColor(): string {
  const palette = getAccentColors();
  if (palette.length === 0) return INK;
  if (typeof window === 'undefined') return palette[0];
  const current = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent-purple')
    .trim()
    .toLowerCase();
  if (current && palette.some((c) => c.toLowerCase() === current)) {
    return current;
  }
  return palette[0];
}

interface CurtainConfig {
  background: string;
  textWord: string;
  textTone: 'ink' | 'paper';
  labelTone: 'ink' | 'paper';
  scrollClass: string;
  labels: { tl?: string; tr?: string; bl?: string; br?: string };
}

function sampleSkills(seed: number): [string, string, string] {
  const all = content.skills.marqueeItems;
  if (all.length < 3) {
    
    return [all[0] ?? 'DESIGN', all[1] ?? 'CODE', all[2] ?? 'CRAFT'];
  }
  const rand = mulberry32(seed);
  
  const pool = [...all];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1], pool[2]];
}

function buildCurtains(payload: TransitionEffectProps['payload']): CurtainConfig[] {
  const hasTitle = !!payload.title?.trim();
  const panelColor = resolvePanelColor();

  if (!hasTitle) {

    const seedSource = payload.slug || payload.accent || 'back-to-home';
    const [s1, s2, s3] = sampleSkills(hashString(seedSource));
    return [
      {
        background: INK,
        textWord: s1,
        textTone: 'ink',
        labelTone: 'paper',
        scrollClass: styles.trackScrollLeft,
        labels: { br: 'Z.S · Studio' },
      },
      {
        background: panelColor,
        textWord: s2,
        textTone: 'paper',
        labelTone: 'ink',
        scrollClass: styles.trackScrollRight,
        labels: { tr: 'Skill · 02', bl: 'Zenith Soumya' },
      },
      {
        background: INK,
        textWord: s3,
        textTone: 'ink',
        labelTone: 'paper',
        scrollClass: styles.trackScrollLeftFast,
        labels: { br: 'Now' },
      },
    ];
  }

  const title = payload.title!.trim();
  const year = payload.year || '';
  const category = payload.category || 'Case Study';
  const titleHead = title.split(/\s+/)[0] || title;
  const titleTail = title.split(/\s+/).slice(1).join(' ') || category;

  return [
    {
      background: INK,
      textWord: titleHead,
      textTone: 'ink',
      labelTone: 'paper',
      scrollClass: styles.trackScrollLeft,
      labels: { tl: 'Curtain · 01', br: 'Z.S · Studio' },
    },
    {
      background: panelColor,
      textWord: titleTail || titleHead,
      textTone: 'paper',
      labelTone: 'ink',
      scrollClass: styles.trackScrollRight,
      labels: {
        tr: [year, category].filter(Boolean).join(' · '),
        bl: title,
      },
    },
    {
      background: INK,
      textWord: titleHead,
      textTone: 'ink',
      labelTone: 'paper',
      scrollClass: styles.trackScrollLeftFast,
      labels: { tl: title, br: year || 'Now' },
    },
  ];
}

function getCurtainConfig() {
  const root =
    (transitionsConfig.effects?.['color-curtain-stack'] ?? {}) as Record<
      string,
      unknown
    >;
  const num = (k: string, fallback: number): number =>
    typeof root[k] === 'number' ? (root[k] as number) : fallback;
  return {
    exitDuration: num('exitDuration', 1.4),
    enterDuration: num('enterDuration', 1.4),
    holdDuration: num('holdDuration', 0.35),
    stagger: num('stagger', 0.18),
  };
}

export function ColorCurtainStack({
  phase,
  payload,
  onComplete,
}: TransitionEffectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const curtains = useMemo(() => buildCurtains(payload), [payload]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const reduceMotionSnapshotRef = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (phase === 'exit' || reduceMotionSnapshotRef.current === null) {
      reduceMotionSnapshotRef.current = reduceMotion;
    }
    const reduceMotionForTransition = reduceMotionSnapshotRef.current;

    const cur1 = root.querySelector<HTMLDivElement>(`.${styles.cur1}`);
    const cur2 = root.querySelector<HTMLDivElement>(`.${styles.cur2}`);
    const cur3 = root.querySelector<HTMLDivElement>(`.${styles.cur3}`);
    if (!cur1 || !cur2 || !cur3) return;

    const allLabels = root.querySelectorAll<HTMLDivElement>(`.${styles.label}`);
    const labelsOf = (c: HTMLElement) =>
      c.querySelectorAll<HTMLDivElement>(`.${styles.label}`);

    const fireComplete = () => onCompleteRef.current();
    const animations: Array<gsap.core.Tween | gsap.core.Timeline> = [];

    if (reduceMotionForTransition) {
      const tween = phase === 'exit'
        ? gsap.fromTo(
            root,
            { opacity: 0 },
            {
              opacity: 1,
              duration: transitionsConfig.reducedMotionDuration,
              ease: 'power2.out',
              onComplete: fireComplete,
            }
          )
        : gsap.to(root, {
            opacity: 0,
            duration: transitionsConfig.reducedMotionDuration,
            ease: 'power2.in',
            onComplete: fireComplete,
          });
      if (phase === 'exit') {
        gsap.set([cur1, cur2, cur3], { xPercent: 0, yPercent: 0 });
      }
      animations.push(tween);
      return () => animations.forEach((a) => a.kill());
    }

    const cfg = getCurtainConfig();
    const slide = Math.max(0.5, cfg.exitDuration - cfg.stagger * 2);
    const ease = ANIMATION_CONFIG.ease.inOutQuart;

    if (phase === 'exit') {
      gsap.set(cur1, { yPercent: -101 });
      gsap.set(cur2, { xPercent: 101 });
      gsap.set(cur3, { yPercent: 101 });
      gsap.set(allLabels, { opacity: 0, y: 8 });

      const tl = gsap.timeline({ onComplete: fireComplete });
      animations.push(tl);

      tl.to(cur1, { yPercent: 0, duration: slide, ease }, 0);
      tl.to(labelsOf(cur1), { opacity: 1, y: 0, duration: LABEL_FADE_IN, stagger: LABEL_STAGGER }, LABEL_OFFSET);

      tl.to(cur2, { xPercent: 0, duration: slide, ease }, cfg.stagger);
      tl.to(labelsOf(cur2), { opacity: 1, y: 0, duration: LABEL_FADE_IN, stagger: LABEL_STAGGER }, cfg.stagger + LABEL_OFFSET);

      tl.to(cur3, { yPercent: 0, duration: slide, ease }, cfg.stagger * 2);
      tl.to(labelsOf(cur3), { opacity: 1, y: 0, duration: LABEL_FADE_IN, stagger: LABEL_STAGGER }, cfg.stagger * 2 + LABEL_OFFSET);

      tl.to({}, { duration: cfg.holdDuration });
    } else {
      
      gsap.set([cur1, cur2, cur3], { xPercent: 0, yPercent: 0 });
      gsap.set(allLabels, { opacity: 1, y: 0 });

      const enterSlide = Math.max(0.5, cfg.enterDuration - cfg.stagger * 2);
      const tl = gsap.timeline({ onComplete: fireComplete });
      animations.push(tl);

      tl.to(cur3, { yPercent: -101, duration: enterSlide, ease }, 0);
      tl.to(labelsOf(cur3), { opacity: 0, duration: LABEL_FADE_OUT }, 0);

      tl.to(cur2, { xPercent: -101, duration: enterSlide, ease }, cfg.stagger * 0.6);
      tl.to(labelsOf(cur2), { opacity: 0, duration: LABEL_FADE_OUT }, cfg.stagger * 0.6);

      tl.to(cur1, { yPercent: 101, duration: enterSlide, ease }, cfg.stagger * 1.2);
      tl.to(labelsOf(cur1), { opacity: 0, duration: LABEL_FADE_OUT }, cfg.stagger * 1.2);
    }

    return () => {
      animations.forEach((a) => a.kill());

      if (phase === 'enter') {
        reduceMotionSnapshotRef.current = null;
      }
    };
  }, [phase, reduceMotion]);

  const renderTrack = (
    word: string,
    tone: 'ink' | 'paper',
    scrollClass: string
  ) => {
    const REPEAT = 8;
    return (
      <div
        className={[
          styles.track,
          tone === 'ink' ? styles.inkText : styles.paperText,
          scrollClass,
        ].join(' ')}
      >
        {Array.from({ length: REPEAT }).map((_, i) => (
          <Fragment key={`p-${i}`}>
            <span className={styles.word}>{word}</span>
            <Star variant={i % 2 === 0 ? 'outline' : 'filled'} />
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <div ref={rootRef} className={styles.root}>
      {curtains.map((c, i) => {
        const cls = [styles.curtain, [styles.cur1, styles.cur2, styles.cur3][i]].join(' ');
        const labelToneCls = c.labelTone === 'ink' ? styles.labelOnAccent : styles.labelOnInk;
        return (
          <div
            key={`curtain-${i}`}
            className={cls}
            style={{ background: c.background }}
          >
            {renderTrack(c.textWord, c.textTone, c.scrollClass)}
            {c.labels.tl && (
              <div className={`${styles.label} ${styles.labelTL} ${labelToneCls}`}>
                {c.labels.tl}
              </div>
            )}
            {c.labels.tr && (
              <div className={`${styles.label} ${styles.labelTR} ${labelToneCls}`}>
                {c.labels.tr}
              </div>
            )}
            {c.labels.bl && (
              <div className={`${styles.label} ${styles.labelBL} ${labelToneCls}`}>
                {c.labels.bl}
              </div>
            )}
            {c.labels.br && (
              <div className={`${styles.label} ${styles.labelBR} ${labelToneCls}`}>
                {c.labels.br}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

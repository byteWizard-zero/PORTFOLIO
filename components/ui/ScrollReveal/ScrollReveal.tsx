'use client';

import React, { useRef, useMemo, useCallback, ReactNode, RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { triggerPortalLoop } from '@/lib/portalAnimation';
import './ScrollReveal.css';

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  wrapperRef?: RefObject<HTMLElement | null>;
  scrollMultiplier?: number;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  lineAnimationStart?: string;
  lineAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  triggerRef,
  wrapperRef,
  scrollMultiplier = 1.0,
  enableBlur = true,
  baseOpacity = 0.25,
  baseRotation = 8,
  blurStrength = 10,
  containerClassName = '',
  textClassName = '',
  lineAnimationStart = 'top 88%',
  lineAnimationEnd = 'top 45%',
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const handleLetterHover = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const portalLetter = e.currentTarget.querySelector('.portal-letter') as HTMLElement;
    if (portalLetter) {
      triggerPortalLoop(portalLetter);
    }
  }, []);

  const splitLines = useMemo(() => {
    const rawLines: string[] = [];

    React.Children.toArray(children).forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        const childText = String(child).trim();
        if (!childText) return;

        if (childText.startsWith('//')) {
          rawLines.push(childText);
        } else {
          let lines = childText
            .replace(/\r\n/g, '\n')
            .split(/\n+/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          if (lines.length <= 1) {
            lines = childText
              .split(/(?<=[.!?…\u2026])\s+(?=[A-Z0-9/])/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
          }
          rawLines.push(...lines);
        }
      }
    });

    return rawLines.map((lineText, lineIdx) => {
      const isGlitchLine = lineText.startsWith('//');

      if (isGlitchLine) {
        const chars = lineText.split('').map((char, charIdx) => {
          const isHighlightLetter = ['d', 'δ', 'Δ', 'a', 'm', 'g', 'e'].includes(char.toLowerCase());

          if (isHighlightLetter) {
            return (
              <span className="typewriter-char highlight-word" key={charIdx}>
                <span className="portal-mask" onMouseEnter={handleLetterHover}>
                  <span className="portal-letter">{char}</span>
                </span>
              </span>
            );
          }

          return (
            <span className="typewriter-char" key={charIdx}>
              {char}
            </span>
          );
        });

        return (
          <div className="reveal-line glitch-line" key={lineIdx}>
            {chars}
            <span className="terminal-cursor">█</span>
          </div>
        );
      }

      const words = lineText.split(/(\s+)/).map((word, wordIdx) => {
        if (word.match(/^\s+$/)) return word;

        const clean = word.toLowerCase();

        if (
          clean.includes('forgotten') ||
          clean.includes('developer') ||
          clean.includes('bug') ||
          clean.includes('system')
        ) {
          return (
            <span className="word highlight-word" key={wordIdx}>
              {word.split('').map((char, charIdx) => (
                <span
                  key={charIdx}
                  className="portal-mask"
                  onMouseEnter={handleLetterHover}
                >
                  <span className="portal-letter">{char}</span>
                </span>
              ))}
            </span>
          );
        }

        return (
          <span className="word" key={wordIdx}>
            {word}
          </span>
        );
      });

      return (
        <div className="reveal-line" key={lineIdx}>
          {words}
        </div>
      );
    });
  }, [children, handleLetterHover]);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const textWrapper = el.querySelector<HTMLElement>('.scroll-reveal-text') || el;
    const allWords = el.querySelectorAll<HTMLElement>('.word');
    const lines = el.querySelectorAll<HTMLElement>('.reveal-line:not(.glitch-line)');
    const typewriterChars = el.querySelectorAll<HTMLElement>('.typewriter-char');
    const cursor = el.querySelector<HTMLElement>('.terminal-cursor');
    const glitchLine = el.querySelector<HTMLElement>('.glitch-line');
    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const parentSection = el.closest('section');
    const trigger = triggerRef?.current || parentSection || el;

    const setLenisMultiplier = (val: number) => {
      if (typeof window !== 'undefined' && (window as unknown as { lenis?: { options: { wheelMultiplier: number } } }).lenis?.options) {
        (window as unknown as { lenis: { options: { wheelMultiplier: number } } }).lenis.options.wheelMultiplier = val;
      }
    };

    // Scroll damping trigger: activates when the section is about to show in the viewport
    if (scrollMultiplier < 1.0 && typeof window !== 'undefined') {
      const dampTarget = wrapperRef?.current || parentSection?.parentElement || parentSection || trigger;
      ScrollTrigger.create({
        trigger: dampTarget,
        scroller,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: () => setLenisMultiplier(scrollMultiplier),
        onLeave: () => setLenisMultiplier(1.0),
        onEnterBack: () => setLenisMultiplier(scrollMultiplier),
        onLeaveBack: () => setLenisMultiplier(1.0),
      });
    }

    const mm = gsap.matchMedia();

    // Reduced motion accessibility fallback
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(textWrapper, { rotate: 0 });
      gsap.set(allWords, { opacity: 1, filter: 'none' });
      if (typewriterChars.length > 0) gsap.set(typewriterChars, { opacity: 1 });
      if (cursor) gsap.set(cursor, { opacity: 1 });
    });

    // High fidelity animation sequence: line-by-line reveal as lines scroll up
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Container rotation: smoothly straightens from baseRotation to 0 deg as it enters
      gsap.fromTo(
        textWrapper,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 90%',
            end: 'top 30%',
            scrub: true
          }
        }
      );

      // 2. Line-by-line reveal: each line un-blurs and brightens as it rises up into view
      lines.forEach((lineEl) => {
        const wordsInLine = lineEl.querySelectorAll<HTMLElement>('.word');
        if (wordsInLine.length === 0) return;

        gsap.fromTo(
          wordsInLine,
          {
            opacity: baseOpacity,
            filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
            willChange: 'opacity, filter'
          },
          {
            ease: 'none',
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.02,
            scrollTrigger: {
              trigger: lineEl,
              scroller,
              start: lineAnimationStart,
              end: lineAnimationEnd,
              scrub: true,
              onLeave: () => {
                gsap.set(wordsInLine, { filter: 'none', willChange: 'auto' });
              },
              onLeaveBack: () => {
                if (enableBlur) {
                  gsap.set(wordsInLine, { filter: `blur(${blurStrength}px)` });
                }
              }
            }
          }
        );
      });

      // 3. Glitch terminal line: typewrites character-by-character as it scrolls into view
      if (typewriterChars.length > 0 && glitchLine) {
        gsap.set(typewriterChars, { opacity: 0 });
        if (cursor) gsap.set(cursor, { opacity: 0 });

        gsap.timeline({
          scrollTrigger: {
            trigger: glitchLine,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        })
        .set(cursor, { opacity: 1 })
        .to(typewriterChars, {
          opacity: 1,
          duration: 0.01,
          stagger: 0.03,
          ease: 'none'
        });
      }
    });

    return () => {
      setLenisMultiplier(1.0);
    };
  }, {
    scope: containerRef,
    dependencies: [
      scrollContainerRef,
      triggerRef,
      wrapperRef,
      scrollMultiplier,
      enableBlur,
      baseRotation,
      baseOpacity,
      blurStrength,
      lineAnimationStart,
      lineAnimationEnd
    ]
  });

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <div className={`scroll-reveal-text ${textClassName}`}>{splitLines}</div>
    </h2>
  );
};

export default ScrollReveal;

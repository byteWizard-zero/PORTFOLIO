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
  pin?: boolean;
  pinSpacing?: boolean;
  scrollMultiplier?: number;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  triggerRef,
  wrapperRef,
  pin = false,
  pinSpacing = true,
  scrollMultiplier = 1.0,
  enableBlur = true,
  baseOpacity = 0.3,
  baseRotation = 8,
  blurStrength = 10,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  start,
  end,
  scrub = 0.8
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
    const wordElements = el.querySelectorAll<HTMLElement>('.word');
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
        end: 'bottom top',
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
      gsap.set(wordElements, { opacity: 1, filter: 'none' });
      if (typewriterChars.length > 0) gsap.set(typewriterChars, { opacity: 1 });
      if (cursor) gsap.set(cursor, { opacity: 1 });
    });

    // High fidelity animation sequence
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (pin) {
        // Coordinated master timeline for pinned section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            scroller,
            start: start || 'top top',
            end: end || '+=160%',
            pin: true,
            pinSpacing: pinSpacing !== false,
            anticipatePin: 1,
            scrub: typeof scrub === 'number' ? scrub : 0.8,
            onLeave: () => {
              gsap.set(wordElements, { filter: 'none', willChange: 'auto' });
            },
            onLeaveBack: () => {
              if (enableBlur) {
                gsap.set(wordElements, { filter: `blur(${blurStrength}px)` });
              }
            }
          }
        });

        // 1. Rotation: settles from baseRotation to 0 deg
        tl.fromTo(
          textWrapper,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          { ease: 'none', rotate: 0, duration: 0.6 },
          0
        );

        // 2. Word reveal: un-blur and fade from baseOpacity
        tl.fromTo(
          wordElements,
          {
            opacity: baseOpacity,
            filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
            willChange: 'opacity, filter'
          },
          {
            ease: 'none',
            opacity: 1,
            filter: 'blur(0px)',
            stagger: {
              each: 0.02,
              ease: 'none'
            },
            duration: 0.8
          },
          0
        );

        // 3. Glitch line typewriter reveal towards end of scrub
        if (typewriterChars.length > 0) {
          gsap.set(typewriterChars, { opacity: 0 });
          if (cursor) gsap.set(cursor, { opacity: 0 });

          tl.set(cursor, { opacity: 1 }, 0.65)
            .to(
              typewriterChars,
              {
                opacity: 1,
                duration: 0.25,
                stagger: 0.015,
                ease: 'none'
              },
              0.7
            );
        }
      } else {
        // Standard unpinned mode
        gsap.fromTo(
          textWrapper,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          {
            ease: 'none',
            rotate: 0,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: start || 'top bottom',
              end: rotationEnd || 'bottom bottom',
              scrub: true
            }
          }
        );

        gsap.fromTo(
          wordElements,
          {
            opacity: baseOpacity,
            filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
            willChange: 'opacity, filter'
          },
          {
            ease: 'none',
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: start || 'top bottom-=20%',
              end: wordAnimationEnd || 'bottom bottom',
              scrub: true,
              onLeave: () => {
                gsap.set(wordElements, { filter: 'none', willChange: 'auto' });
              }
            }
          }
        );

        if (typewriterChars.length > 0 && glitchLine) {
          gsap.set(typewriterChars, { opacity: 0 });
          if (cursor) gsap.set(cursor, { opacity: 0 });

          gsap.timeline({
            scrollTrigger: {
              trigger: glitchLine,
              scroller,
              start: 'top bottom-=10%',
              toggleActions: 'play none none none'
            }
          })
          .set(cursor, { opacity: 1 })
          .to(typewriterChars, {
            opacity: 1,
            duration: 0.01,
            stagger: 0.035,
            ease: 'none'
          });
        }
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
      pin,
      pinSpacing,
      scrollMultiplier,
      enableBlur,
      baseRotation,
      baseOpacity,
      rotationEnd,
      wordAnimationEnd,
      blurStrength,
      start,
      end,
      scrub
    ]
  });

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <div className={`scroll-reveal-text ${textClassName}`}>{splitLines}</div>
    </h2>
  );
};

export default ScrollReveal;

'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content, getHeroLetters } from '@/data';
import { cursorBus } from '@/lib/cursorBus';
import {
  getRandomDirection,
  getDirectionTransform,
  triggerPortalLoop,
} from '@/lib/portalAnimation';
import styles from './HeroText.module.css';

const { firstName, lastName } = getHeroLetters();
const MOHED_LETTERS = firstName;
const ABBAS_LETTERS_CONFIG = lastName.map((letter, index) => ({
  letter,
  color: index % 2 === 1 ? 'purple' : 'dark',
}));
const TAGLINE_WORDS = content.hero.tagline;
const TAGLINE_HIDDEN_WORDS = content.hero.taglineHidden;

const SPOTLIGHT_SIZE = 80;

export function HeroText() {
  const sectionRef = useRef<HTMLElement>(null);
  const mohedRef = useRef<HTMLHeadingElement>(null);
  const abbasRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const taglineContainerRef = useRef<HTMLDivElement>(null);
  const taglineHiddenRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  const handleLetterHover = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    
    if (reducedMotion) return;
    const portalLetter = e.currentTarget.querySelector(`.${styles.portalLetter}`) as HTMLElement;
    if (portalLetter) {
      triggerPortalLoop(portalLetter);
    }
  }, [reducedMotion]);

  const cachedRect = useRef<DOMRect | null>(null);
  
  const spotlightTickerRef = useRef<(() => void) | null>(null);
  const spotlightTickerActiveRef = useRef(false);

  const updateRectRef = useRef<(() => void) | null>(null);

  useGSAP(() => {
    const container = taglineContainerRef.current;
    if (!container) return;

    const updateRect = () => {
      cachedRect.current = container.getBoundingClientRect();
    };
    updateRect();
    updateRectRef.current = updateRect;

    window.addEventListener('resize', updateRect);

    const updateSpotlight = () => {
      if (!cachedRect.current) return;

      const x = cursorBus.x - cachedRect.current.left;
      const y = cursorBus.y - cachedRect.current.top;

      container.style.setProperty('--spotlight-x', `${x}px`);
      container.style.setProperty('--spotlight-y', `${y}px`);
    };

    spotlightTickerRef.current = updateSpotlight;

    return () => {
      
      if (spotlightTickerActiveRef.current && spotlightTickerRef.current) {
        gsap.ticker.remove(spotlightTickerRef.current);
        spotlightTickerActiveRef.current = false;
      }
      
      if (taglineContainerRef.current) {
        taglineContainerRef.current.classList.remove(styles.spotlightActive);
      }
      window.removeEventListener('resize', updateRect);

      window.removeEventListener('scroll', updateRect);
      updateRectRef.current = null;
    };
  }, []); 

  const handleTaglineMouseEnter = useCallback(() => {
    const container = taglineContainerRef.current;
    if (!container) return;

    gsap.killTweensOf(container, '--spotlight-size');
    gsap.to(container, {
      '--spotlight-size': `${SPOTLIGHT_SIZE}px`,
      duration: 0.45,
      ease: 'power2.out',
    });

    container.classList.add(styles.spotlightActive);

    if (updateRectRef.current) {
      updateRectRef.current();
      window.addEventListener('scroll', updateRectRef.current, { passive: true });
    }

    if (!spotlightTickerActiveRef.current && spotlightTickerRef.current) {
      gsap.ticker.add(spotlightTickerRef.current);
      spotlightTickerActiveRef.current = true;
    }

    window.dispatchEvent(new CustomEvent('tagline-spotlight-enter', {
      detail: { size: SPOTLIGHT_SIZE * 2 }
    }));
  }, []);

  const handleTaglineMouseLeave = useCallback(() => {
    const container = taglineContainerRef.current;
    if (!container) return;

    gsap.killTweensOf(container, '--spotlight-size');
    gsap.to(container, {
      '--spotlight-size': '0px',
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        container.classList.remove(styles.spotlightActive);
      }
    });

    if (spotlightTickerActiveRef.current && spotlightTickerRef.current) {
      gsap.ticker.remove(spotlightTickerRef.current);
      spotlightTickerActiveRef.current = false;
    }

    if (updateRectRef.current) {
      window.removeEventListener('scroll', updateRectRef.current);
    }

    window.dispatchEvent(new CustomEvent('tagline-spotlight-leave'));
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !mohedRef.current || !abbasRef.current || !taglineRef.current || !taglineHiddenRef.current) return;

    const targetM = mohedRef.current.querySelector('#target-m');
    const targetA = abbasRef.current.querySelector('#target-a');

    const mohedExpansionMasks = mohedRef.current.querySelectorAll('.portal-expansion');
    const abbasExpansionMasks = abbasRef.current.querySelectorAll('.portal-expansion');

    const mohedExpansionLetters = Array.from(mohedExpansionMasks).map(
      mask => mask.querySelector(`.${styles.portalLetter}`)
    ).filter(Boolean) as HTMLElement[];

    const abbasExpansionLetters = Array.from(abbasExpansionMasks).map(
      mask => mask.querySelector(`.${styles.portalLetter}`)
    ).filter(Boolean) as HTMLElement[];

    const taglineWords = taglineRef.current.querySelectorAll(`.${styles.taglineWord}`);
    const taglineHiddenWords = taglineHiddenRef.current.querySelectorAll(`.${styles.taglineWord}`);

    gsap.set([mohedExpansionMasks, abbasExpansionMasks], {
      opacity: 0,
    });

    mohedExpansionLetters.forEach(letter => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    abbasExpansionLetters.forEach(letter => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    gsap.set([taglineWords, taglineHiddenWords], { opacity: 0 });

    gsap.set([targetM, targetA], { opacity: 0 });

    const startAnimation = () => {

      if (reducedMotion) {
        gsap.set([targetM, targetA], { opacity: 1 });
        gsap.set([mohedExpansionMasks, abbasExpansionMasks], { opacity: 1 });
        gsap.set([...mohedExpansionLetters, ...abbasExpansionLetters], { x: '0%', y: '0%' });
        gsap.set([taglineWords, taglineHiddenWords], { opacity: 1, y: 0, rotateX: 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.to([targetM, targetA], {
        opacity: 1,
        duration: 0.3,
        ease: "power1.inOut"
      })

      // 2. Reveal expansion masks
      .to([mohedExpansionMasks, abbasExpansionMasks], {
        opacity: 1,
        duration: 0.01,
      }, ">-0.1")

      // 3. Portal Slide-In Animation for OHED
      .add(() => {
        mohedExpansionLetters.forEach((letter, index) => {
          gsap.to(letter, {
            x: '0%',
            y: '0%',
            duration: 0.5,
            delay: index * 0.08,
            ease: 'power2.out',
          });
        });
      }, "<")

      // 4. Portal Slide-In Animation for BBAS (slight offset)
      .add(() => {
        abbasExpansionLetters.forEach((letter, index) => {
          gsap.to(letter, {
            x: '0%',
            y: '0%',
            duration: 0.5,
            delay: index * 0.08 + 0.1,
            ease: 'power2.out',
          });
        });
      }, "<+0.05")

      // 5. Tagline Animation
      // PERF: Removed filter: blur() animation - very expensive in Chrome
      // Using opacity + scale + transform for similar visual effect
      .fromTo(
        taglineWords,
        {
          opacity: 0,
          y: 40,
          rotateX: -60,
          scale: 0.85,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            each: 0.06,
            ease: 'power2.out',
          },
          ease: 'back.out(1.2)',
        },
        "-=0.3"
      )
      .fromTo(
        taglineHiddenWords,
        {
          opacity: 0,
          y: 40,
          rotateX: -60,
          scale: 0.85,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            each: 0.06,
            ease: 'power2.out',
          },
          ease: 'back.out(1.2)',
        },
        "<"
      );
    };

    if (window.__welcomeHandoff) {
      startAnimation();
    } else {
      window.addEventListener('welcome-handoff', startAnimation, { once: true });
    }
    return () => window.removeEventListener('welcome-handoff', startAnimation);
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <section ref={sectionRef} className={styles.textAndArm}>
      
      <h1 ref={mohedRef} data-hero-mohed className={`${styles.heroText} ${styles.heroTextMohed}`}>
        {MOHED_LETTERS.map((letter, index) => {
          const isTarget = index === 0;

          if (isTarget) {
            
            return (
              <span
                key={index}
                className={`${styles.letter} ${styles.portalMask}`}
                id="target-m"
                onMouseEnter={handleLetterHover}
              >
                <span className={styles.portalLetter}>{letter}</span>
              </span>
            );
          }

          return (
            <span
              key={index}
              className={`${styles.letter} ${styles.portalMask} portal-expansion`}
              onMouseEnter={handleLetterHover}
            >
              <span className={styles.portalLetter}>{letter}</span>
            </span>
          );
        })}
      </h1>

      <h1 ref={abbasRef} data-hero-abbas className={`${styles.heroText} ${styles.heroTextAbbas}`}>
        {ABBAS_LETTERS_CONFIG.map((item, index) => {
          const isTarget = index === 0;
          const colorClass = item.color === 'purple' ? styles.textPurple : styles.textDark;

          if (isTarget) {
            
            return (
              <span
                key={index}
                id="target-a"
                className={`${styles.abbasLetter} ${styles.portalMask} ${colorClass}`}
                onMouseEnter={handleLetterHover}
              >
                <span className={styles.portalLetter}>{item.letter}</span>
              </span>
            );
          }

          return (
            <span
              key={index}
              className={`${styles.abbasLetter} ${styles.portalMask} ${colorClass} portal-expansion`}
              onMouseEnter={handleLetterHover}
            >
              <span className={styles.portalLetter}>{item.letter}</span>
            </span>
          );
        })}
      </h1>

      <div
        ref={taglineContainerRef}
        data-tagline
        className={styles.taglineContainer}
        onMouseEnter={handleTaglineMouseEnter}
        onMouseLeave={handleTaglineMouseLeave}
      >
        
        <div className={styles.spotlightBg} />

        <p ref={taglineRef} className={styles.tagline}>
          {TAGLINE_WORDS.map((word, index) =>
            word === '<br>' ? (
              <span key={index} className={styles.lineBreak} aria-hidden="true" />
            ) : (
              <span key={index} className={styles.taglineWord}>
                {word}
              </span>
            )
          )}
        </p>

        <p ref={taglineHiddenRef} className={styles.taglineHidden}>
          {TAGLINE_HIDDEN_WORDS.map((word, index) =>
            word === '<br>' ? (
              <span key={index} className={styles.lineBreak} aria-hidden="true" />
            ) : (
              <span key={index} className={styles.taglineWord}>
                {word}
              </span>
            )
          )}
        </p>
      </div>
    </section>
  );
}

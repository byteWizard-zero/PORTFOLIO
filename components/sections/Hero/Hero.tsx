'use client';

import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content } from '@/data';
import { HeroText } from './HeroText';
import { SkillsBar } from './SkillsBar';
import styles from './Hero.module.css';

const INITIALS = content.welcomeScreen.initials;

const SCROLL_RANGE_VH = 1;

const DOCKING_PROGRESS = 0.25;

const SCRUB_SMOOTHING = 1.75;
const SKILLS_EXIT_YPERCENT = 300;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const flyingMRef = useRef<HTMLSpanElement>(null);
  const flyingARef = useRef<HTMLSpanElement>(null);

  const [welcomeDone, setWelcomeDone] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (welcomeDone) return;

    if (window.__welcomeComplete) {
      queueMicrotask(() => setWelcomeDone(true));
      return;
    }

    const onComplete = () => setWelcomeDone(true);
    window.addEventListener('welcome-complete', onComplete, { once: true });

    const wrapper = document.querySelector('[data-welcome-wrapper]');
    if (wrapper && (wrapper as HTMLElement).style.display === 'none') {
      queueMicrotask(() => setWelcomeDone(true));
    }

    return () => window.removeEventListener('welcome-complete', onComplete);
  }, [welcomeDone]);

  useGSAP(() => {
    if (!welcomeDone || !heroRef.current || !spacerRef.current || !flyingMRef.current || !flyingARef.current) return;

    const hero = heroRef.current;
    const spacer = spacerRef.current;
    const flyingM = flyingMRef.current;
    const flyingA = flyingARef.current;

    const scrollRange = window.innerHeight * SCROLL_RANGE_VH;
    spacer.style.height = `${scrollRange * DOCKING_PROGRESS + window.innerHeight}px`;

    const targetM = document.getElementById('target-m');
    const targetA = document.getElementById('target-a');
    const navBrand = document.getElementById('navbar-brand');
    const navBrandM = document.getElementById('navbar-brand-m');
    const navBrandA = document.getElementById('navbar-brand-a');

    if (!targetM || !targetA || !navBrand || !navBrandM || !navBrandA) return;

    const mohedExps = hero.querySelectorAll('[data-hero-mohed] .portal-expansion');
    const abbasExps = hero.querySelectorAll('[data-hero-abbas] .portal-expansion');
    const taglineContainer = hero.querySelector('[data-tagline]');
    const skillsBar = hero.querySelector('[data-skills]');

    if (reducedMotion) {
      gsap.set([flyingM, flyingA], { opacity: 0 });
      gsap.set(navBrand, { opacity: 1 });
      gsap.set([targetM, targetA], { opacity: 0 });
      if (mohedExps.length > 0) gsap.set(mohedExps, { opacity: 0 });
      if (abbasExps.length > 0) gsap.set(abbasExps, { opacity: 0 });
      if (taglineContainer) gsap.set(taglineContainer, { opacity: 0 });
      if (skillsBar) gsap.set(skillsBar, { yPercent: SKILLS_EXIT_YPERCENT });
      return;
    }

    const getRelPos = (el: Element) => {
      const r = el.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      return { x: r.left - h.left, y: r.top - h.top };
    };

    const seedFlyingLetterTypography = () => {
      gsap.set(flyingM, {
        fontSize: parseFloat(getComputedStyle(targetM).fontSize),
        transformOrigin: '0% 0%',
      });
      gsap.set(flyingA, {
        fontSize: parseFloat(getComputedStyle(targetA).fontSize),
        transformOrigin: '0% 0%',
      });
    };
    seedFlyingLetterTypography();

    let scaleRatioM = 1;
    let scaleRatioA = 1;
    const recomputeScaleRatios = () => {
      scaleRatioM = parseFloat(getComputedStyle(navBrandM).fontSize)
        / parseFloat(getComputedStyle(targetM).fontSize);
      scaleRatioA = parseFloat(getComputedStyle(navBrandA).fontSize)
        / parseFloat(getComputedStyle(targetA).fontSize);
    };
    recomputeScaleRatios();

    const tl = gsap.timeline();

    tl.to(flyingM, {
      x: () => getRelPos(targetM).x,
      y: () => getRelPos(targetM).y,
      duration: 0.001,
    }, 0)
    .to(flyingA, {
      x: () => getRelPos(targetA).x,
      y: () => getRelPos(targetA).y,
      duration: 0.001,
    }, 0);

    tl.to(flyingM, { opacity: 1, duration: 0.02 }, 0.002)
      .to(flyingA, { opacity: 1, duration: 0.02 }, 0.002)
      .to(targetM, { opacity: 0, duration: 0.02 }, 0.002)
      .to(targetA, { opacity: 0, duration: 0.02 }, 0.002);

    tl.to(flyingM, { scale: 1.05, duration: 0.04, ease: 'back.out(2)' }, 0.02)
      .to(flyingA, { scale: 1.05, duration: 0.04, ease: 'back.out(2)' }, 0.02);

    if (mohedExps.length > 0) {
      tl.to(mohedExps, {
        opacity: 0, stagger: 0.025, duration: 0.12, ease: 'power2.in',
      }, 0.01);
    }
    if (abbasExps.length > 0) {
      tl.to(abbasExps, {
        opacity: 0, stagger: 0.025, duration: 0.12, ease: 'power2.in',
      }, 0.03);
    }

    if (taglineContainer) {
      tl.to(taglineContainer, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.08);
    }
    if (skillsBar) {

      tl.to(skillsBar, { yPercent: SKILLS_EXIT_YPERCENT, duration: 0.12, ease: 'power2.in' }, 0.15);
    }

    tl.to(flyingM, {
      x: () => getRelPos(navBrandM).x,
      y: () => getRelPos(navBrandM).y,
      scale: () => scaleRatioM,
      duration: 0.65,
      ease: 'power2.inOut',
    }, 0.06)
    .to(flyingA, {
      x: () => getRelPos(navBrandA).x,
      y: () => getRelPos(navBrandA).y,
      scale: () => scaleRatioA,
      duration: 0.65,
      ease: 'power2.inOut',
    }, 0.06);

    tl.to(navBrand, { opacity: 1, duration: 0.1, ease: 'power1.inOut' }, 0.71)
      .to([flyingM, flyingA], { opacity: 0, duration: 0.1, ease: 'power1.in' }, 0.71);

    ScrollTrigger.create({
      trigger: spacer,
      start: 'top top',
      end: () => `+=${window.innerHeight * SCROLL_RANGE_VH}`,
      scrub: SCRUB_SMOOTHING,
      animation: tl,
      invalidateOnRefresh: true,
      onRefresh: () => {
        
        spacer.style.height = `${window.innerHeight * SCROLL_RANGE_VH * DOCKING_PROGRESS + window.innerHeight}px`;

        seedFlyingLetterTypography();
        recomputeScaleRatios();
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

  }, { dependencies: [welcomeDone, reducedMotion] });

  return (
    <>
      <main ref={heroRef} className={styles.hero}>
        <HeroText />
        <SkillsBar />

        <span ref={flyingMRef} className={styles.flyingLetter} aria-hidden="true">
          {INITIALS.first}
        </span>
        <span ref={flyingARef} className={styles.flyingLetter} aria-hidden="true">
          {INITIALS.last}
        </span>
      </main>

      <div ref={spacerRef} className={styles.heroScrollSpacer} />
    </>
  );
}

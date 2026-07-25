"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { TransitionLink, useTransition } from "@/components/transitions";
import { useAccentColor } from "@/lib/AccentColorContext";
import type { CaseStudyHeroContent } from "@/data";
import styles from "./Hero.module.css";

const HERO_PIN_VH = 1.35;

const HERO_BADGE_FADE_VH = 0.5;

const HERO_EXIT_END_VH = 2.35;

const HERO_PARALLAX_PX = 6;

const HERO_LETTER_STAGGER = 0.08;

const HERO_LEDE_HIDE_YPCT = 110;

const PORTAL_DIRECTIONS = [
  { x: 0, y: -110 },
  { x: 0, y: 110 },
  { x: -110, y: 0 },
  { x: 110, y: 0 },
] as const;

const randomPortalDirection = () =>
  PORTAL_DIRECTIONS[Math.floor(Math.random() * PORTAL_DIRECTIONS.length)];

export function Hero({
  title,
  lede,
  image,
  alt,
  pills,
  badge,
  backHref,
}: CaseStudyHeroContent) {
  const ledeWords = lede.split(" ");
  const { color: currentAccent } = useAccentColor();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { hasEntered } = useTransition();

  useGSAP(
    () => {
      if (!hasEntered) return;
      const title = titleRef.current;
      const lede = ledeRef.current;
      if (!title) return;

      const innerLetters = title.querySelectorAll<HTMLElement>(
        `.${styles.titleLetterInner}`
      );
      const ledeMasks = lede
        ? lede.querySelectorAll<HTMLElement>(`.${styles.ledeWord}`)
        : null;
      const ledeInners = lede
        ? lede.querySelectorAll<HTMLElement>(`.${styles.ledeWordInner}`)
        : null;

      if (!innerLetters.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        
        innerLetters.forEach((el) => {
          const dir = randomPortalDirection();
          gsap.set(el, { xPercent: dir.x, yPercent: dir.y });
        });

        const titleTween = gsap.to(innerLetters, {
          xPercent: 0,
          yPercent: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: HERO_LETTER_STAGGER,
          delay: 0.1,
        });

        const backEl = backRef.current;
        let backTween: gsap.core.Tween | null = null;
        if (backEl) {
          gsap.set(backEl, { autoAlpha: 0, y: 8 });
          backTween = gsap.to(backEl, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            delay: 0,
            clearProps: "transform",
          });
        }

        const pillEls = metaRef.current
          ? metaRef.current.querySelectorAll<HTMLElement>(`.${styles.pill}`)
          : null;
        let pillsTween: gsap.core.Tween | null = null;
        if (pillEls && pillEls.length) {
          gsap.set(pillEls, { autoAlpha: 0, y: 12 });
          pillsTween = gsap.to(pillEls, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.07,
            delay: 0.05,
            clearProps: "transform",
          });
        }

        const badge = badgeRef.current;
        let badgeTween: gsap.core.Tween | null = null;
        if (badge) {
          gsap.set(badge, { autoAlpha: 0, scale: 0, rotation: -45 });
          badgeTween = gsap.to(badge, {
            autoAlpha: 1,
            scale: 1,
            rotation: 8,
            duration: 0.7,
            ease: "back.out(1.4)",
            delay: 0.6,

            clearProps: "transform",
          });
        }

        let ledeTL: gsap.core.Timeline | null = null;
        if (ledeMasks && ledeInners && ledeMasks.length) {
          const lineMap = new Map<number, HTMLElement[]>();
          ledeMasks.forEach((mask, i) => {
            const key = Math.round(mask.offsetTop);
            if (!lineMap.has(key)) lineMap.set(key, []);
            lineMap.get(key)!.push(ledeInners[i]);
          });
          const lineGroups = [...lineMap.entries()]
            .sort(([a], [b]) => a - b)
            .map(([, els]) => els);

          gsap.set(ledeInners, { yPercent: HERO_LEDE_HIDE_YPCT });

          ledeTL = gsap.timeline({ delay: 0.4 });
          lineGroups.forEach((group, lineIdx) => {
            ledeTL!.to(
              group,
              { yPercent: 0, duration: 0.7, ease: "power2.out" },
              lineIdx * 0.12
            );
          });
        }

        return () => {
          titleTween.kill();
          gsap.set(innerLetters, { clearProps: "transform" });
          if (backTween) backTween.kill();
          if (backEl) gsap.set(backEl, { clearProps: "all" });
          if (pillsTween) pillsTween.kill();
          if (pillEls) gsap.set(pillEls, { clearProps: "all" });
          if (badgeTween) badgeTween.kill();
          if (badge) gsap.set(badge, { clearProps: "all" });
          if (ledeTL) ledeTL.kill();
          if (ledeInners) gsap.set(ledeInners, { clearProps: "transform" });
        };
      });
    },
    { scope: sectionRef, dependencies: [hasEntered] }
  );

  useGSAP(
    () => {
      const inner = innerRef.current;
      if (!inner) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const xTo = gsap.quickTo(inner, "x", {
            duration: 0.7,
            ease: "power2.out",
          });
          const yTo = gsap.quickTo(inner, "y", {
            duration: 0.7,
            ease: "power2.out",
          });

          const handleMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            xTo(nx * HERO_PARALLAX_PX);
            yTo(ny * HERO_PARALLAX_PX);
          };

          window.addEventListener("mousemove", handleMove, { passive: true });

          return () => {
            window.removeEventListener("mousemove", handleMove);
            gsap.set(inner, { clearProps: "x,y" });
          };
        }
      );
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {

        const originalParent = card.parentElement;

        const initialRadiusPx =
          parseFloat(getComputedStyle(card).borderRadius) || 0;

        const placeholder = document.createElement("div");
        placeholder.className = card.className;

        placeholder.setAttribute("role", "img");
        placeholder.setAttribute("aria-label", alt);

        card.setAttribute("aria-hidden", "true");
        card.setAttribute("role", "presentation");

        placeholder.style.visibility = "hidden";
        placeholder.style.boxShadow = "none";
        placeholder.style.borderRadius = "0";
        placeholder.style.pointerEvents = "none";

        placeholder.style.willChange = "auto";
        if (originalParent) {
          originalParent.insertBefore(placeholder, card);
        }
        document.body.appendChild(card);

        const placeCard = () => {
          const r = placeholder.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          gsap.set(card, {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            y: 0,
          });
        };

        gsap.set(card, {
          position: "fixed",
          margin: 0,
          zIndex: 5,
          autoAlpha: 0,

          pointerEvents: "none",
          "--card-radius": initialRadiusPx + "px",
        });
        placeCard();

        const cardEntranceTween = gsap.to(card, {
          autoAlpha: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        });

        const masterTL = gsap
          .timeline()
          // Intro fade — plays in the first 0.5 units of the timeline.
          // Explicit fromTo (with immediateRender:false on the FROM
          // vars so the entrance tweens still own the initial paint).
          // Why explicit: the master ScrollTrigger has
          // invalidateOnRefresh:true, which on every resize calls
          // .invalidate() on these tweens. A lazy `to(...)` would then
          // re-record its FROM by reading the DOM at the *exact* frame
          // the pin is being rebuilt — capturing the un-pinned, mid-
          // reflow position — and render one bad frame at progress~0
          // before settling. fromTo's FROM is config, not DOM-derived,
          // so invalidate is a no-op for the start state and the text
          // stays put through pin-spacer churn.
          .fromTo(
            [metaRef.current, ledeRef.current],
            { autoAlpha: 1, y: 0, immediateRender: false },
            { autoAlpha: 0, y: -20, ease: "power2.in", duration: 0.5 },
            0
          )
          .fromTo(
            titleRef.current,
            { autoAlpha: 1, y: 0, immediateRender: false },
            { autoAlpha: 0, y: 60, ease: "power2.in", duration: 0.5 },
            0.05
          )
          // Grow — starts as the intro is finishing so the transition
          // feels continuous. Runs for 1 unit (≈ 1 vh of scroll).
          .to(
            card,
            {
              left: 0,
              top: 0,
              width: () => window.innerWidth,
              height: () => window.innerHeight,
              ease: "power2.inOut",
              duration: 1,
            },
            0.25
          )
          .fromTo(
            innerRef.current,
            { scale: 1.04 },
            { scale: 1, ease: "none", duration: 1 },
            0.25
          )
          // Fade box-shadow out as the card reaches full-bleed — at full
          // scale there's no surrounding canvas for a shadow to land on.
          .to(
            card,
            {
              boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
              ease: "power2.inOut",
              duration: 1,
            },
            0.25
          )
          // Hold rounded corners until ~80% of the grow, then snap.
          // Explicit fromTo with immediateRender:false. Why: the master
          // ScrollTrigger has invalidateOnRefresh:true, which on every
          // refresh wipes recorded from/to and lookahead-renders each
          // tween to re-capture them. A lazy `to({--card-radius:'0px'})`
          // has no explicit FROM, so the lookahead pass writes TO ('0px')
          // to the DOM and never undoes it — leaving the card flat-
          // cornered at progress 0. fromTo's FROM is config, so the
          // lookahead can't override it, and immediateRender:false keeps
          // the value untouched until the tween's time-1.05 slot
          // actually plays during scrub.
          .fromTo(
            card,
            { "--card-radius": initialRadiusPx + "px", immediateRender: false },
            {
              "--card-radius": "0px",
              ease: "power2.out",
              duration: 0.22,
            },
            1.05
          );

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * HERO_PIN_VH,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          animation: masterTL,
          anticipatePin: 1,

          invalidateOnRefresh: true,
        });

        const badgeFadeTL = gsap.fromTo(
          badgeRef.current,
          { autoAlpha: 1, scale: 1, immediateRender: false },
          { autoAlpha: 0, scale: 0.6, ease: "power2.in" }
        );

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * HERO_BADGE_FADE_VH,
          scrub: 0.5,
          animation: badgeFadeTL,
          invalidateOnRefresh: true,
        });

        const exitTL = gsap.timeline().to(
          card,
          {
            y: () => -window.innerHeight,
            ease: "none",
            duration: 1,
          },
          0
        );

        ScrollTrigger.create({
          trigger: section,
          start: () => window.innerHeight * HERO_PIN_VH,
          end: () => window.innerHeight * HERO_EXIT_END_VH,
          scrub: true,
          animation: exitTL,
          invalidateOnRefresh: true,
        });

        const onRefresh = () => {
          placeCard();
        };
        ScrollTrigger.addEventListener("refresh", onRefresh);

        return () => {
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          cardEntranceTween.kill();

          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === section || st.pin === card) st.kill(true);
          });
          gsap.set(card, { clearProps: "all" });

          card.removeAttribute("aria-hidden");
          card.removeAttribute("role");
          if (placeholder.isConnected) {
            placeholder.remove();
          }
          if (originalParent?.isConnected && card.parentElement !== originalParent) {
            originalParent.appendChild(card);
          } else if (card.parentElement === document.body) {

            card.remove();
          }
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.hero}>
      
      <span className={styles.titleSizer} aria-hidden="true">
        
        {title.split("").map((letter, i) => (
          <span key={i} className={styles.titleLetter}>
            {letter}
          </span>
        ))}
      </span>
      <div className={styles.top}>
        <div ref={metaRef} className={styles.metaRow}>
          <TransitionLink
            ref={backRef}
            href={backHref ?? "/"}
            className={styles.backLink}
            aria-label="Back to home"
            payload={{ accent: currentAccent }}
          >
            <span aria-hidden="true">←</span>
          </TransitionLink>
          {pills?.map((pillText, i) => {
            const isLast = i === pills.length - 1;
            return (
              <span
                key={pillText}
                className={
                  isLast
                    ? `${styles.pill} ${styles.pillSolid}`
                    : styles.pill
                }
              >
                {pillText}
              </span>
            );
          })}
        </div>
        <p ref={ledeRef} className={styles.lede}>
          
          {ledeWords.map((word, i) => (
            <Fragment key={i}>
              <span className={styles.ledeWord}>
                <span className={styles.ledeWordInner}>{word}</span>
              </span>
              {i < ledeWords.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>
      </div>

      <div className={styles.middle}>
        <figure ref={cardRef} className={styles.imageCard}>
          <div ref={innerRef} className={styles.imageInner}>
            <Image
              src={image}
              alt={alt}
              width={2400}
              height={1500}
              sizes="(min-width: 1512px) 1400px, 90vw"
              priority
              unoptimized
            />
          </div>
          {badge && (
            <span ref={badgeRef} className={styles.badge} aria-hidden="true">
              {badge.split("\n").map((line, i, arr) => (
                <Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </Fragment>
              ))}
            </span>
          )}
        </figure>
      </div>

      <h1 ref={titleRef} className={styles.titleText} aria-label={title}>
        
        {title.split("").map((letter, index) => (
          <span
            key={index}
            className={styles.titleLetter}
            aria-hidden="true"
          >
            <span className={styles.titleLetterInner}>{letter}</span>
          </span>
        ))}
      </h1>
    </section>
  );
}

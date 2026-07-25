"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { TransitionLink, useTransition } from "@/components/transitions";
import { useAccentColor } from "@/lib/AccentColorContext";
import styles from "./Echo.module.css";

const WORD = "ABOUT ME"; 

const TOP_ROWS = ["ink", "accent", "ink"] as const;
const BOTTOM_ROWS = ["ink", "accent", "ink"] as const;

export function AboutPageHeroEcho() {
  const { color: currentAccent } = useAccentColor();
  const { hasEntered } = useTransition();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!hasEntered) return;
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const echoes = gsap.utils.toArray<HTMLElement>("[data-echo]", section);
        const cells = gsap.utils.toArray<HTMLElement>("[data-echo-cell]", section);
        const solidRow = section.querySelector<HTMLElement>(
          '[data-band="solid"]',
        );

        const cellDy = (cell: HTMLElement) => {
          const row = cell.querySelector<HTMLElement>("[data-echo]");
          if (!row || !solidRow || !section) return 0;
          const sectionTop = section.getBoundingClientRect().top;
          const solidCenter = solidRow.getBoundingClientRect().top - sectionTop + solidRow.getBoundingClientRect().height / 2;
          const rowCenter = row.getBoundingClientRect().top - sectionTop + row.getBoundingClientRect().height / 2;
          return solidCenter - rowCenter;
        };

        gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });
        gsap.set("[data-solid]", { yPercent: 115 });

        gsap.set(cells, {
          y: (_i: number, el: HTMLElement) => cellDy(el),
          clipPath: (_i: number, el: HTMLElement) =>
            el.dataset.dir === "up"
              ? "inset(0% 0% 100% 0%)"
              : "inset(100% 0% 0% 0%)",
        });

        const intro = gsap.timeline({ delay: 0.1 });
        intro
          .to("[data-solid]", { yPercent: 0, duration: 1, ease: "expo.out" })
          .to(
            cells,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              ease: "power3.out",

              onComplete: () => {
                gsap.set(cells, { clearProps: "clipPath,transform" });
                merge.scrollTrigger?.refresh();
              },
            },
            "-=0.65",
          )
          .to(
            "[data-reveal]",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "expo.out",
              stagger: 0.12,
            },
            "-=0.8",
          );

        const merge = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        merge.fromTo(
          echoes,
          { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
          {

            clipPath: (_i: number, el: HTMLElement) =>
              el.dataset.dir === "up"
                ? "inset(0% 0% 100% 0%)"
                : "inset(100% 0% 0% 0%)",

            y: (_i: number, el: HTMLElement) => {
              if (!solidRow || !section) return 0;
              const sectionTop = section.getBoundingClientRect().top;
              const solidCenter = solidRow.getBoundingClientRect().top - sectionTop + solidRow.getBoundingClientRect().height / 2;
              const elCenter = el.getBoundingClientRect().top - sectionTop + el.getBoundingClientRect().height / 2;
              return solidCenter - elCenter;
            },
            ease: "power1.in",
            duration: 1,
            immediateRender: false,
          },
          0,
        );

        return () => {
          intro.kill();
          merge.scrollTrigger?.kill();
          merge.kill();
          gsap.set("[data-reveal]", { clearProps: "all" });
          gsap.set("[data-solid]", { clearProps: "all" });
          gsap.set(cells, { clearProps: "all" });
        };
      });
    },
    { scope: sectionRef, dependencies: [hasEntered] },
  );

  return (
    <section ref={sectionRef} className={styles.hero}>
      <h1 className={styles.srOnly}>About — Zenith Soumya</h1>

      <div className={styles.top} data-reveal>
        <TransitionLink
          href="/"
          className={styles.backLink}
          aria-label="Back to home"
          payload={{ accent: currentAccent }}
        >
          <span aria-hidden="true">←</span>
        </TransitionLink>
      </div>

      <div className={styles.stage} aria-hidden="true">
        <div className={styles.stack}>
          <div className={styles.echoGroup} data-group="top">
            {TOP_ROWS.map((tone, i) => (
              <div
                key={`t${i}`}
                className={styles.echoCell}
                data-echo-cell
                data-dir="up"
              >
                <div
                  className={`${styles.echoRow} ${styles[tone]}`}
                  data-band="top"
                  data-echo
                  data-dir="up"
                >
                  <span className={styles.echoText}>{WORD}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.solid} data-band="solid">
            <span className={styles.solidText} data-solid>
              <span className={styles.solidInk}>ABOUT</span>{" "}
              <span className={styles.solidAccent}>ME</span>
            </span>
          </div>

          <div className={styles.echoGroup} data-group="bottom">
            {BOTTOM_ROWS.map((tone, i) => (
              <div
                key={`b${i}`}
                className={styles.echoCell}
                data-echo-cell
                data-dir="down"
              >
                <div
                  className={`${styles.echoRow} ${styles[tone]}`}
                  data-band="bottom"
                  data-echo
                  data-dir="down"
                >
                  <span className={styles.echoText}>{WORD}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { useBlockFadeIn } from "@/lib/useBlockFadeIn";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import { useEnterReveal } from "@/lib/useEnterReveal";
import { animationConfig, content } from "@/data";
import { SectionLabel } from "@/components/sections/case-study/SectionLabel";
import styles from "./Experience.module.css";

const cs = animationConfig.caseStudy;

export function AboutPageExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const { experience } = content.about;

  useBlockFadeIn(sectionRef, {
    start: cs.scrollTrigger.early,
    groups: [
      { targets: [headRef], y: cs.blockFade.yShort, duration: cs.blockFade.durationShort },
    ],
  });

  useWordLineReveal(listRef, {
    scope: sectionRef,
    exclude: "[data-point], [data-pill]",
  });

  useEnterReveal(sectionRef, [
    {
      selector: "[data-point]",
      from: { opacity: 0 },
      innerSelector: "[data-point-inner]",
      innerFrom: { yPercent: 110 },
      duration: 0.7,
      stagger: 0.07,
    },
    {
      selector: "[data-pill]",
      from: { opacity: 0, scale: 0.8 },
      ease: "back.out(1.7)",
      duration: 0.45,
      stagger: 0.05,
    },
  ]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div ref={headRef} className={styles.head}>
          <SectionLabel className={styles.eyebrow}>Experience</SectionLabel>
          <span className={styles.count}>{String(experience.length).padStart(2, "0")}</span>
        </div>

        <ol ref={listRef} className={styles.list}>
          {experience.map((e, i) => (
            <li className={styles.row} key={e.role + e.org}>
              <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
              <div className={styles.main}>
                <h3 className={styles.role}>
                  {e.role}
                  {e.placeholder && <i className={styles.dagger}>†</i>}
                </h3>
                <p className={styles.summary}>{e.summary}</p>
                {e.points && (
                  <ul className={styles.points}>
                    {e.points.map((pt) => (
                      <li key={pt} className={styles.point} data-point>
                        <span className={styles.pointInner} data-point-inner>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {e.tags && (
                  <ul className={styles.tags}>
                    {e.tags.map((t) => (
                      <li className={styles.tag} key={t} data-pill>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.aside}>
                <span className={styles.org}>{e.org}</span>
                <span className={styles.period}>{e.period}</span>
                <span className={styles.kind}>{e.kind}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

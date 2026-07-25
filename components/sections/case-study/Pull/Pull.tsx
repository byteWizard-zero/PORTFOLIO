"use client";

import { useRef } from "react";
import { useScrubbedActsReveal } from "@/lib/useScrubbedActsReveal";
import type { PullContent } from "@/data";
import styles from "./Pull.module.css";

export const Pull = ({ attribution, act2, act3 }: PullContent) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const act1Ref = useRef<HTMLElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);

  useScrubbedActsReveal({
    scope: sectionRef,
    sticky: stickyRef,
    act1: act1Ref,
    act2: act2Ref,
    act3: act3Ref,
  });

  const attributionLabel = [attribution.name, attribution.role, attribution.location]
    .filter(Boolean)
    .join(", ");
  const attributionSecondary = [attribution.role, attribution.location]
    .filter(Boolean)
    .join(", ");
  const quoteLabel = [...act2, ...act3]
    .map((line) => line.text)
    .join(" ")
    .replace(/^[“”"'']+|[“”"'']+$/g, "")
    .trim();

  return (
    <section
      ref={sectionRef}
      className={styles.pull}
      aria-label="User testimonial"
    >
      <figure className={styles.figure}>
        <div ref={stickyRef} className={styles.sticky}>
          
          <figcaption
            ref={act1Ref}
            className={styles.act1}
            aria-label={attributionLabel}
          >
            <span className={styles.avatar} aria-hidden="true" />
            <span className={styles.attrText}>
              <b>{attribution.name}</b>
              <span>{attributionSecondary}</span>
            </span>
          </figcaption>

          <blockquote
            className={styles.quote}
            aria-label={quoteLabel}
          >
            <div ref={act2Ref} className={styles.act2} aria-hidden="true">
              
              {act2.map((line, i) => (
                <span
                  key={i}
                  className={
                    line.accent
                      ? `${styles.quoteLine} ${styles.accent}`
                      : styles.quoteLine
                  }
                >
                  {line.text}
                </span>
              ))}
            </div>
            <div ref={act3Ref} className={styles.act3} aria-hidden="true">
              
              {act3.map((line, i) => (
                <span
                  key={i}
                  className={
                    line.accent
                      ? `${styles.quoteLine} ${styles.accent}`
                      : styles.quoteLine
                  }
                >
                  {line.text}
                </span>
              ))}
            </div>
          </blockquote>
        </div>
      </figure>
    </section>
  );
};

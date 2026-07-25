"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { TransitionLink } from "@/components/transitions";
import { StarIcon } from "@/components/sections/Hero/StarIcon";
import { getProjectThemeColor } from "@/data";
import type { CaseStudyHeroContent, NextCaseContent } from "@/data";
import styles from "./NextCase.module.css";

type NextCaseProps = NextCaseContent & {
  target?: Pick<CaseStudyHeroContent, "title" | "image" | "alt" | "year">;
};

export const NextCase = ({ slug, counter, target }: NextCaseProps) => {

  const inner: ReactNode = (
    <>
      <div className={styles.left}>
        <span className={styles.eyebrow}>
          <StarIcon variant="outline" baseClassName={styles.starIcon} />
          {counter}
        </span>
        <h2 className={styles.title}>
          {target?.title ?? ""}
          <span className={styles.titleAccent}>.</span>
        </h2>
        <div className={styles.metaPills}>
          {target?.year && <span className={styles.pill}>{target.year}</span>}
          <span className={`${styles.pill} ${styles.pillSolid}`}>
            Read case →
          </span>
        </div>
      </div>
      <div className={styles.imageWrap}>
        {target?.image && (
          <Image
            className={styles.image}
            src={target.image}
            alt={target.alt ?? target.title}
            width={2400}
            height={1500}
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
          />
        )}
        <span className={styles.badge} aria-hidden>
          Live
          <br />
          Demo
        </span>
      </div>
    </>
  );

  if (target) {
    return (
      <nav className={styles.next} aria-label="Next case study">
        <TransitionLink
          href={`/work/${slug}`}
          className={styles.link}
          payload={{
            accent: getProjectThemeColor(slug),
            title: target.title,
            slug,
            year: target.year,
          }}
        >
          {inner}
        </TransitionLink>
      </nav>
    );
  }

  return (
    <section className={styles.next} aria-label="Next case study (coming soon)">
      <div className={styles.link} aria-disabled="true" role="group">
        {inner}
      </div>
    </section>
  );
};

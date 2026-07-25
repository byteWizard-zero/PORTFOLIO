'use client';

import { Fragment, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Image from 'next/image';
import { TransitionLink } from '@/components/transitions';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content, caseStudies, getCaseStudySlugs } from '@/data';
import styles from './CurrentProject.module.css';

const SLUG = 'tasktrox';
const hasCaseStudy = new Set(getCaseStudySlugs()).has(SLUG);

const OPEN_THRESHOLD = 0.6;

export function AboutPageCurrentProject() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const project = content.projects.items.find((p) => p.id === SLUG);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !project) return;

      const gateClicks = !reducedMotion;
      if (gateClicks) container.dataset.splitGated = 'true';

      const ctx = gsap.context(() => {
        const section = container.querySelector<HTMLElement>(`.${styles.projectSection}`);
        if (!section) return;

        const topPart = section.querySelector(`.${styles.textTop}`);
        const botPart = section.querySelector(`.${styles.textBottom}`);
        const imgCard = section.querySelector(`.${styles.imageCard}`);
        const imgWrapper = section.querySelector(`.${styles.projectImgWrapper}`);
        const badge = section.querySelector(`.${styles.funkyBadge}`);
        const meta = section.querySelector(`.${styles.projectMeta}`);
        const metaLabel = section.querySelector(`.${styles.metaLabel}`);
        const stickyContainer = section.querySelector(`.${styles.projectSticky}`);

        const setOpen = (open: boolean) => {
          if (stickyContainer)
            (stickyContainer as HTMLElement).dataset.open = open ? 'true' : 'false';
        };
        const openFromTimeline = (self: ScrollTrigger) =>
          setOpen((self.animation?.progress() ?? 0) >= OPEN_THRESHOLD);
        setOpen(false); 

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2.5,
            pin: stickyContainer,
            onUpdate: openFromTimeline,
          },
        });

        if (metaLabel) {
          tl.to(
            metaLabel,
            { y: -60, opacity: 0, duration: 0.2, force3D: true, ease: 'power2.inOut' },
            'start',
          );
        }

        tl.to(
          topPart,
          { yPercent: -45, rotation: -5, force3D: true, ease: 'power2.inOut' },
          'start',
        ).to(
          botPart,
          { yPercent: 45, rotation: 5, force3D: true, ease: 'power2.inOut' },
          'start',
        );

        tl.to(
          imgCard,
          { scale: 1, rotation: 0, opacity: 1, force3D: true, ease: 'back.out(1.2)' },
          'start+=0.05',
        );

        tl.to(imgWrapper, { scale: 1.0, force3D: true, ease: 'none' }, 'start');

        tl.to(
          badge,
          { scale: 1, rotation: 360, force3D: true, ease: 'elastic.out(1, 0.5)' },
          'start+=0.3',
        );

        tl.to(meta, { opacity: 1, y: 0, force3D: true, duration: 0.2 }, 'start+=0.4');
      }, containerRef);

      return () => {

        const savedScrollY = window.scrollY;
        ctx.revert();
        delete container.dataset.splitGated;
        if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);
      };
    },
    { scope: containerRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  if (!project) return null;

  const cardInner = (
    <>
      <MetaLabel className={styles.metaLabel} aria-hidden="true">
        Current Project
      </MetaLabel>

      <div className={styles.imageCard}>
        <div className={styles.projectImgWrapper}>
          <Image
            src={project.image}
            alt={project.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'top' }}
            sizes="(max-width: 768px) 100vw, 80vw"
            unoptimized
          />
        </div>
      </div>

      <div
        className={styles.funkyBadge}
        style={{
          backgroundColor: project.badgeColor,
          color: project.badgeTextColor,
          boxShadow: `5px 5px 0px ${project.badgeShadowColor || 'black'}`,
        }}
      >
        <span>
          {project.badge.split(/<br\s*\/?>/i).map((line, i, arr) => (
            <Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </Fragment>
          ))}
        </span>
      </div>

      <div className={styles.titleWrapper}>
        <div className={styles.textTop}>
          <div className={styles.textBacking}></div>
          <div className={styles.textContent}>{project.title}</div>
        </div>
        <div className={styles.textBottom}>
          <div className={styles.textBacking}></div>
          <div className={styles.textContent}>{project.title}</div>
        </div>
      </div>

      <div className={styles.projectMeta}>
        <div className={styles.pill}>
          {caseStudies[project.id]?.hero?.pills?.[1] ?? project.year}
        </div>
        <div className={styles.pill}>{project.category}</div>
      </div>
    </>
  );

  return (
    <div ref={containerRef} className={styles.section}>
      <div className={styles.projectSection}>
        {hasCaseStudy ? (
          <TransitionLink
            href={`/work/${project.id}`}
            className={styles.projectSticky}
            aria-label={`Open ${project.title} case study`}
            payload={{
              accent: project.themeColor,
              title: project.title,
              slug: project.id,
              year: project.year,
              category: project.category,
            }}
          >
            {cardInner}
          </TransitionLink>
        ) : (
          <div className={styles.projectSticky}>{cardInner}</div>
        )}
      </div>
    </div>
  );
}


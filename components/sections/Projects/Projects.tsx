'use client';

import { Fragment, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Image from 'next/image';
import { TransitionLink } from '@/components/transitions';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './Projects.module.css';
import { content, getCaseStudySlugs, caseStudies } from '@/data';

const caseStudySlugs = new Set(getCaseStudySlugs());

const SPLIT_RUNWAY_VH = 1.4;

const HANDOFF_SCRUB = 2.5;

const OPEN_THRESHOLD = 0.6;

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { projects } = content;
  const featuredProjects = projects.items.filter((project) => project.featured);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const archiveWrapper = document.getElementById('archive-wrapper');
    const overlapEnabled = !reducedMotion && !!archiveWrapper && featuredProjects.length > 0;

    if (overlapEnabled) {
      if (archiveWrapper) archiveWrapper.dataset.overlap = 'true';
      container.dataset.overlapActive = 'true';
    }

    const gateClicks = !reducedMotion;
    if (gateClicks) container.dataset.splitGated = 'true';

    const ctx = gsap.context(() => {
        const sections = container.querySelectorAll<HTMLElement>(`.${styles.projectSection}`);

        sections.forEach((section) => {
            const topPart = section.querySelector(`.${styles.textTop}`);
            const botPart = section.querySelector(`.${styles.textBottom}`);
            const imgCard = section.querySelector(`.${styles.imageCard}`);
            const imgWrapper = section.querySelector(`.${styles.projectImgWrapper}`);
            const badge = section.querySelector(`.${styles.funkyBadge}`);
            const meta = section.querySelector(`.${styles.projectMeta}`);
            const metaLabel = section.querySelector(`.${styles.metaLabel}`); 
            const stickyContainer = section.querySelector(`.${styles.projectSticky}`);

            const isLast = section.dataset.last === 'true';
            const handoff = isLast && overlapEnabled;

            gsap.set(badge, { scale: 0, rotation: 0 });

            const setOpen = (open: boolean) => {
                if (stickyContainer) (stickyContainer as HTMLElement).dataset.open = open ? 'true' : 'false';
            };
            const openFromTimeline = (self: ScrollTrigger) =>
                setOpen((self.animation?.progress() ?? 0) >= OPEN_THRESHOLD);
            setOpen(false); 

            if (handoff && stickyContainer) {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top top",
                    endTrigger: archiveWrapper,
                    end: "top top",
                    pin: stickyContainer,
                    pinSpacing: true,
                    pinType: "fixed",
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                });
            }

            const tl = gsap.timeline({
                scrollTrigger: handoff
                    ? {

                        trigger: section,
                        start: "top top",
                        end: () => "+=" + window.innerHeight * SPLIT_RUNWAY_VH,
                        scrub: HANDOFF_SCRUB,
                        invalidateOnRefresh: true,
                        onUpdate: openFromTimeline,
                    }
                    : {
                        trigger: section,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 2.5,
                        pin: stickyContainer,
                        onUpdate: openFromTimeline,
                        // No background color changes - InteractiveBackground shows through entirely
                    }
            });

            if (metaLabel) {
                tl.to(metaLabel, {
                    y: -60,
                    opacity: 0,
                    duration: 0.2,
                    force3D: true,
                    ease: "power2.inOut",
                }, "start");
            }

            tl.to(topPart, {
                yPercent: -45,
                rotation: -5, // Rotate Left
                force3D: true,
                ease: "power2.inOut",
            }, "start")
            .to(botPart, {
                yPercent: 45,
                rotation: 5, // Rotate Right
                force3D: true,
                ease: "power2.inOut",
            }, "start");

            tl.to(imgCard, {
                scale: 1,
                rotation: 0, // Straighten out
                opacity: 1,
                force3D: true,
                ease: "back.out(1.2)" 
            }, "start+=0.05");

            tl.to(imgWrapper, {
                scale: 1.0,
                force3D: true,
                ease: "none"
            }, "start");

            tl.to(badge, {
                scale: 1,
                rotation: 360,
                force3D: true,
                ease: "elastic.out(1, 0.5)"
            }, "start+=0.3");

            tl.to(meta, {
                opacity: 1,
                y: 0,
                force3D: true,
                duration: 0.2
            }, "start+=0.4");

            if (handoff && stickyContainer) {
                gsap.to(stickyContainer, {
                    opacity: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: archiveWrapper,
                        start: "top 35%", // Archive has covered 65% of the screen
                        end: "top top",   // Archive fully covers the viewport
                        scrub: true,
                        invalidateOnRefresh: true,

                        onUpdate: (self) => setOpen(self.progress <= 0.05),
                    },
                });
            }
        });
    }, containerRef);

    let rafId = 0;
    if (overlapEnabled) {
        rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    return () => {

        const savedScrollY = window.scrollY;
        if (rafId) cancelAnimationFrame(rafId);
        ctx.revert();
        if (archiveWrapper) delete archiveWrapper.dataset.overlap;
        delete container.dataset.overlapActive;
        delete container.dataset.splitGated;
        if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);
    };
  }, { scope: containerRef, dependencies: [projects, reducedMotion, featuredProjects.length], revertOnUpdate: true });

  return (
    <div ref={containerRef} className={styles.section} id='projects'>
       {featuredProjects.map((project, index) => {
           const isFirst = index === 0;
           const isLast = index === featuredProjects.length - 1;
           const cardInner = (
               <>
                   {isFirst && (
                     <MetaLabel className={styles.metaLabel} aria-hidden="true">
                       {projects.label}
                     </MetaLabel>
                   )}

                   <div className={styles.cardFrame}>
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
                            transform: 'scale(0)'
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
                       <div className={styles.pill}>{caseStudies[project.id]?.hero?.pills?.[1] ?? project.year}</div>
                       <div className={styles.pill}>{project.category}</div>
                   </div>
               </>
           );

           return (
               <div
                 key={project.id}
                 className={styles.projectSection}
                 data-last={isLast ? 'true' : undefined}
                 data-first={isFirst ? 'true' : undefined}
               >
                   {caseStudySlugs.has(project.id) ? (
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
                       <div className={styles.projectSticky}>
                           {cardInner}
                       </div>
                   )}
               </div>
           );
       })}

       <div className={styles.spacer}></div>
    </div>
  );
};

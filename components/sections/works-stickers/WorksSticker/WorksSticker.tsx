'use client';

import { type ReactNode, useState } from 'react';
import { TransitionLink } from '@/components/transitions';
import type { WorksIndexProject } from '@/data';
import { WorksStickerMarquee } from '@/components/sections/works-stickers/WorksStickerMarquee';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksSticker.module.css';

export interface WorksStickerProps {
  
  index: number;
  project: WorksIndexProject;
  
  hasCaseStudy: boolean;
  
  decal: string;
  
  onHoverChange: (hovered: boolean, project: WorksIndexProject) => void;
  
  currentAccent: string;
}

const TILT_SEQ = [-2.4, 1.6, -1.2, 2.8, -3, 1.2, -2, 2.2, -1.6, 2.6];

const OFFSET_SEQ = [0, 6, -4, 3, 0, 7, -5, 0, 4, -3];

const WOBBLE_DUR_SEQ = [5, 6, 4.5, 5.5, 4, 6, 5, 4.5, 5.5, 4];

export function WorksSticker({
  index,
  project,
  hasCaseStudy,
  decal,
  onHoverChange,
  currentAccent,
}: WorksStickerProps) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  const tilt = TILT_SEQ[index % TILT_SEQ.length];
  const offset = OFFSET_SEQ[index % OFFSET_SEQ.length];
  const wobbleDur = WOBBLE_DUR_SEQ[index % WOBBLE_DUR_SEQ.length];
  const wobbleSign = index % 2 === 0 ? 1 : -1;

  const className = `${styles.sticker}${hovered ? ` ${styles.isHover}` : ''}`;
  const style = cssVars({
    '--sticker-accent': project.accent,
    '--tilt': `${tilt}deg`,
    '--offset': `${offset}%`,
    '--wobble-dur': `${wobbleDur}s`,
    '--wobble-amp': `${wobbleSign * 0.6}deg`,
    
    '--wobble-delay': `${(index % 4) * -0.7}s`,
  });

  const handleEnter = () => {
    setHovered(true);
    onHoverChange(true, project);
  };
  const handleLeave = () => {
    setHovered(false);
    onHoverChange(false, project);
  };

  const inner: ReactNode = (
    <>
      <div className={styles.num}>{num}</div>
      <div className={styles.marquee}>
        <WorksStickerMarquee
          title={project.title}
          durationSec={project.marqueeDurationSec}
          outline={index % 2 === 1}
          paused={hovered}
          inverted={hovered}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.discipline}>{project.discipline}</span>
        <span className={styles.year}>{project.year}</span>
      </div>
      <div className={styles.decal} aria-hidden="true">{decal}</div>
    </>
  );

  if (hasCaseStudy) {
    return (
      <TransitionLink
        href={`/work/${project.id}`}
        className={className}
        style={style}

        aria-label={`Open ${project.title} case study`}
        payload={{

          accent: currentAccent,
          title: project.title,
          slug: project.id,
          year: String(project.year),
          category: project.discipline,
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {inner}
      </TransitionLink>
    );
  }

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      
      <span className="sr-only">
        {project.title} — case study coming soon
      </span>
      {inner}
    </div>
  );
}

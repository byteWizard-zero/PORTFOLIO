'use client';

import { type ReactNode, useState } from 'react';
import { TransitionLink } from '@/components/transitions';
import type { WorksIndexProject } from '@/data';
import { WorksRowMarquee } from '@/components/sections/works-index/WorksRowMarquee';
import { cssVars } from '@/lib/cssVars';
import styles from './WorksRow.module.css';

export interface WorksRowProps {
  
  index: number;
  project: WorksIndexProject;
  
  hasCaseStudy: boolean;
  
  dimmed?: boolean;
  
  onHoverChange: (hovered: boolean, project: WorksIndexProject) => void;
}

export function WorksRow({
  index,
  project,
  hasCaseStudy,
  dimmed = false,
  onHoverChange,
}: WorksRowProps) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');
  const className = `${styles.row}${hovered ? ` ${styles.isHover}` : ''}`;
  const style = cssVars({ '--row-accent': project.accent });

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
      <div className={styles.num}>№ {num}</div>
      <WorksRowMarquee
        title={project.title}
        discipline={project.discipline}
        year={project.year}
        durationSec={project.marqueeDurationSec}
        outline={index % 2 === 1}
        paused={hovered}
        inverted={hovered}
      />
      <div className={styles.meta}>
        <span className={styles.discipline}>{project.discipline}</span>
        <span className={styles.year}>{project.year}</span>
        <span className={styles.arrow}>View case →</span>
      </div>
    </>
  );

  const dataDim = dimmed && !hovered ? 'true' : undefined;

  if (hasCaseStudy) {
    return (
      <TransitionLink
        href={`/work/${project.id}`}
        className={className}
        style={style}
        data-dim={dataDim}

        aria-label={`Open ${project.title} case study`}
        payload={{
          accent: project.accent,
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
      data-dim={dataDim}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      
      <span className="sr-only">{project.title} — case study coming soon</span>
      {inner}
    </div>
  );
}

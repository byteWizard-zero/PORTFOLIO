'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorksIndexContent, WorksIndexProject } from '@/data';
import { WorksRow } from '@/components/sections/works-index/WorksRow';
import styles from './WorksIndex.module.css';

export interface WorksIndexProps {
  projects: WorksIndexProject[];
  legend: WorksIndexContent['legend'];
  
  caseStudySlugs: ReadonlySet<string>;
  
  onRowHoverChange: (hovered: boolean, project: WorksIndexProject | null) => void;
}

const LEAVE_DEFER_MS = 60;

export function WorksIndex({
  projects,
  legend,
  caseStudySlugs,
  onRowHoverChange,
}: WorksIndexProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleHover = useCallback(
    (project: WorksIndexProject, hovered: boolean) => {
      if (hovered) {

        if (leaveTimerRef.current !== null) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        setHoveredId(project.id);
        onRowHoverChange(true, project);
      } else {
        
        setHoveredId((current) => (current === project.id ? null : current));

        if (leaveTimerRef.current !== null) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = setTimeout(() => {
          leaveTimerRef.current = null;
          onRowHoverChange(false, null);
        }, LEAVE_DEFER_MS);
      }
    },
    [onRowHoverChange]
  );

  return (
    <section className={styles.root}>
      <div className={styles.legend}>
        <div>{legend.number}</div>
        <div>{legend.project}</div>
        <div>{legend.meta}</div>
      </div>

      {projects.map((project, i) => (
        <WorksRow
          key={project.id}
          index={i}
          project={project}
          hasCaseStudy={caseStudySlugs.has(project.id)}
          dimmed={hoveredId !== null && hoveredId !== project.id}
          onHoverChange={(hovered) => handleHover(project, hovered)}
        />
      ))}
    </section>
  );
}

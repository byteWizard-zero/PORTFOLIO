'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { WorksIndexProject } from '@/data';
import { WorksSticker } from '@/components/sections/works-stickers/WorksSticker';
import styles from './WorksStickerList.module.css';

export interface WorksStickerListProps {
  projects: WorksIndexProject[];
  
  caseStudySlugs: ReadonlySet<string>;
  
  onStickerHoverChange: (hovered: boolean, project: WorksIndexProject | null) => void;
  
  currentAccent: string;
}

const DECAL_SEQ = ['01', '★', '▲', '✦', '✱', '◐', '■', '⟢', '◇', '✚'];

const LEAVE_DEFER_MS = 60;

export function WorksStickerList({
  projects,
  caseStudySlugs,
  onStickerHoverChange,
  currentAccent,
}: WorksStickerListProps) {
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleHover = useCallback(
    (hovered: boolean, project: WorksIndexProject) => {
      if (hovered) {
        if (leaveTimerRef.current !== null) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        onStickerHoverChange(true, project);
      } else {
        if (leaveTimerRef.current !== null) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = setTimeout(() => {
          leaveTimerRef.current = null;
          onStickerHoverChange(false, null);
        }, LEAVE_DEFER_MS);
      }
    },
    [onStickerHoverChange]
  );

  return (
    <section className={styles.stack}>
      {projects.map((project, i) => (
        <WorksSticker
          key={project.id}
          index={i}
          project={project}
          hasCaseStudy={caseStudySlugs.has(project.id)}
          decal={DECAL_SEQ[i % DECAL_SEQ.length]}
          onHoverChange={handleHover}
          currentAccent={currentAccent}
        />
      ))}
    </section>
  );
}

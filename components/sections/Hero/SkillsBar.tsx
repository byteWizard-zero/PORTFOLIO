'use client';

import { useRef, useEffect } from 'react';
import { content } from '@/data';
import { StarIcon } from './StarIcon';
import styles from './SkillsBar.module.css';

const baseSkills = content.skills.marqueeItems;
const skills = [...baseSkills, ...baseSkills];

export function SkillsBar() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureWidth = () => {
      const node = contentRef.current;
      if (!node) return;

      const kids = node.children;
      if (kids.length < 2) return;
      const seam = kids[kids.length / 2];
      const distance =
        seam.getBoundingClientRect().left - kids[0].getBoundingClientRect().left;
      node.style.setProperty('--scroll-width', `${distance}px`);
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  const renderSkillItem = (skill: string, index: number, keyPrefix: string = '') => (
    <div key={`${keyPrefix}${index}`} className={styles.skillItem}>
      <span className={styles.skillText}>{skill}</span>
      <span className={styles.separator}>
        <StarIcon variant={index % 2 === 0 ? 'outline' : 'filled'} />
      </span>
    </div>
  );

  return (
    <div data-skills className={styles.skillsBar} aria-hidden="true">
      <div className={styles.skillsBarInner}>
        <div className={styles.skillsWrapper}>
          <div ref={contentRef} className={styles.skillsContent}>
            {skills.map((skill, index) => renderSkillItem(skill, index))}
            
            {skills.map((skill, index) => renderSkillItem(skill, index, 'dup-'))}
          </div>
        </div>
      </div>
    </div>
  );
}

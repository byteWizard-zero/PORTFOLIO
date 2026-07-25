import { type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { StarIcon } from '@/components/sections/Hero/StarIcon';
import styles from './MetaLabel.module.css';

interface MetaLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function MetaLabel({ className, children, ref, ...rest }: MetaLabelProps) {
  return (
    <div
      ref={ref}
      className={`${styles.metaLabel}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      <StarIcon variant="outline" baseClassName={styles.starIcon} />
      {children}
    </div>
  );
}

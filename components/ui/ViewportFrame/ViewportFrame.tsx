'use client';

import styles from './ViewportFrame.module.css';

export function ViewportFrame() {
  return (
    <div className={styles.frameContainer} aria-hidden="true">
      <div className={styles.frameInner} />
    </div>
  );
}

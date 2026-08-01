"use client";

import React from 'react';
import styles from './MobileBlockOverlay.module.css';

export function MobileBlockOverlay() {
  const handleRedirect = () => {
    window.open(
      'https://www.google.com/search?q=budget+friendly+laptops',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className={styles.overlay} aria-hidden="false">
      {/* Top Status Bar */}
      <header className={styles.header}>
        <span className={styles.statusBadge}>
          <span className={styles.dot} />
          DESKTOP VIEWPORT REQUIRED
        </span>
        <span className={styles.metaInfo}>1024px+</span>
      </header>

      {/* Main Content Area */}
      <main className={styles.content}>
        <div className={styles.quoteCard}>
          <p className={styles.quoteText}>
            &quot;the admin is fu*ked up making the site responsive for mobile, please open the site on a desktop -thank you&quot;
          </p>
        </div>

        <div className={styles.actionGroup}>
          <p className={styles.subtext}>
            No desktop setup? Consider this alternative:
          </p>

          <button
            onClick={handleRedirect}
            className={styles.button}
            type="button"
          >
            <span>CLICK HERE</span>
            <svg
              className={styles.arrow}
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.66699 11.3333L11.3337 4.66663M11.3337 4.66663H4.66699M11.3337 4.66663V11.3333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className={styles.footer}>
        <span>Z.S STUDIO</span>
        <span>·</span>
        <span>CURATED EXPERIENCE</span>
      </footer>
    </div>
  );
}

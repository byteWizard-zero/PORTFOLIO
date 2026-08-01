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
    <div className={styles.mobileBlockOverlay} aria-hidden="false">
      {/* Subtle Background Layer */}
      <div className={styles.bgGrid} />

      {/* Top Telemetry Header */}
      <header className={styles.hudHeader}>
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot} />
          <span className={styles.statusLabel}>SYSTEM // COMPATIBILITY LOCK</span>
        </div>
        <div className={styles.viewportBadge}>
          <span>VIEWPORT &lt; 1024PX</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.quoteCard}>
          <div className={styles.quoteHeader}>
            <span className={styles.quoteTag}>MESSAGE FROM ARCHITECT</span>
          </div>
          <p className={styles.warningMessage}>
            &quot;the lord Artificer is fu*ked up making the site responsive for mobile, please open the site on a desktop -thank you&quot;
          </p>
        </div>

        <div className={styles.actionContainer}>
          <span className={styles.actionSubtext}>ALTERNATIVE DESKTOP ROUTE</span>
          <button
            onClick={handleRedirect}
            className={styles.primaryButton}
            type="button"
            aria-label="Redirect to budget friendly laptops search"
          >
            <span className={styles.buttonLabel}>CLICK HERE</span>
            <svg
              className={styles.buttonArrow}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </div>
      </main>

      {/* Bottom Metadata Footer */}
      <footer className={styles.hudFooter}>
        <span>ZENITH SOUMYA</span>
        <span className={styles.footerSeparator}>·</span>
        <span>STUDIO ARCHITECTURE</span>
        <span className={styles.footerSeparator}>·</span>
        <span>2026</span>
      </footer>
    </div>
  );
}

"use client";

import React from 'react';
import styles from './MobileBlockOverlay.module.css';

export function MobileBlockOverlay() {
  const handleRedirect = () => {
    window.open('https://www.google.com/search?q=budget+friendly+laptops', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.mobileBlockOverlay} aria-hidden="false">
      {/* Ambient background glows & grid */}
      <div className={styles.ambientGlowTeal} />
      <div className={styles.ambientGlowPurple} />
      <div className={styles.gridOverlay} />
      <div className={styles.scanlines} />

      {/* Cybernetic HUD Corner Stats */}
      <div className={styles.cornerTopLeft}>
        <span className={styles.hudLabel}>SYS.STATUS //</span>
        <span className={styles.blinkText}>UNSUPPORTED_VIEWPORT</span>
      </div>
      <div className={styles.cornerTopRight}>
        <span className={styles.hudLabel}>MATRIX //</span> 1024px MAX
      </div>
      <div className={styles.cornerBottomLeft}>
        <span className={styles.hudLabel}>ARCHITECT //</span> ZENITH SOUMYA
      </div>
      <div className={styles.cornerBottomRight}>
        <span className={styles.hudLabel}>PORT //</span> 3000
      </div>

      {/* Main Terminal Frame */}
      <div className={styles.terminalCard}>
        {/* Frame Brackets */}
        <div className={`${styles.cornerBracket} ${styles.tl}`} />
        <div className={`${styles.cornerBracket} ${styles.tr}`} />
        <div className={`${styles.cornerBracket} ${styles.bl}`} />
        <div className={`${styles.cornerBracket} ${styles.br}`} />

        {/* Header */}
        <div className={styles.terminalHeader}>
          <div className={styles.statusGroup}>
            <span className={styles.pulseDot} />
            <span className={styles.headerTitle}>SYSTEM COMPATIBILITY DIAGNOSTIC</span>
          </div>
          <span className={styles.errorCode}>ERR_MOBILE_VIEWPORT</span>
        </div>

        {/* Content Body */}
        <div className={styles.terminalBody}>
          <div className={styles.quoteBox}>
            <span className={styles.quoteTag}>SYS.MSG &gt;</span>
            <p className={styles.warningMessage}>
              &quot;the lord Artificer is fu*ked up making the site responsive for mobile, please open the site on a desktop -thank you&quot;
            </p>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerBadge}>ACTION REQUIRED</span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.hintMessage}>
            If you do not have a desktop terminal setup yet, please consider this alternative route:
          </p>

          <button
            onClick={handleRedirect}
            className={styles.actionButton}
            type="button"
          >
            <span className={styles.buttonText}>CLICK HERE</span>
            <svg
              className={styles.buttonIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </div>

        {/* Footer info bar inside card */}
        <div className={styles.terminalFooter}>
          <span className={styles.footerText}>DESKTOP VIEWPORT RECOMMENDED (≥1025PX)</span>
        </div>
      </div>
    </div>
  );
}

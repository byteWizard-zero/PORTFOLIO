"use client";

import React, { useState, useEffect } from 'react';
import styles from './MobileBlockOverlay.module.css';

export function MobileBlockOverlay() {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Telemetry check steps
  const telemetrySteps = [
    { pending: "Analyzing touch latency...", done: "Touch latency matches standard human delay." },
    { pending: "Checking browser tab count...", done: "Found 47 open tabs. Highly human." },
    { pending: "Inspecting developer settings...", done: "Dark mode confirmed. VIM keybindings detected." },
    { pending: "Finalizing hardware search...", done: "Redirecting to budget-friendly laptops..." }
  ];

  useEffect(() => {
    if (isChecked && step < telemetrySteps.length) {
      const timer = setTimeout(() => {
        // Add the completed log
        setLogs(prev => [...prev, `✓ ${telemetrySteps[step].done}`]);
        setStep(prev => prev + 1);
      }, 900); // Paced telemetry step intervals

      return () => clearTimeout(timer);
    } else if (isChecked && step === telemetrySteps.length) {
      // All steps completed! Redirect after a short delay
      const redirectTimer = setTimeout(() => {
        window.open("https://www.google.com/search?q=budget+friendly+laptops", "_blank");
        // Reset states
        setShowCaptcha(false);
        setIsChecked(false);
        setStep(0);
        setLogs([]);
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isChecked, step]);

  const handleCheckboxClick = () => {
    if (isChecked) return;
    setIsChecked(true);
    setLogs([`⌛ ${telemetrySteps[0].pending}`]);
  };

  // When step updates, push the next pending step into logs
  useEffect(() => {
    if (isChecked && step > 0 && step < telemetrySteps.length) {
      setLogs(prev => [...prev, `⌛ ${telemetrySteps[step].pending}`]);
    }
  }, [step, isChecked]);

  return (
    <div className={styles.mobileBlockOverlay} aria-hidden="false">
      {!showCaptcha ? (
        <>
          <div className={styles.warningBadge}>
            [ SYSTEM BLOCK: MOBILE VIEWPORT ]
          </div>
          <p className={styles.message}>
            "the lord Artificer is fu*ked up making the site responsive for mobile, please open the site on a desktop -thank you"
          </p>
          <div className={styles.separator} />
          <p className={styles.secondaryMessage}>
            if you dont have any desktop yet please consider this
          </p>
          <div className={styles.arrowContainer}>
            <svg className={styles.arrowSvg} viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          <button 
            onClick={() => setShowCaptcha(true)}
            className={styles.shopButton}
          >
            Click Here
          </button>
        </>
      ) : (
        <div className={styles.captchaCard}>
          <div className={styles.captchaHeader}>
            <span className={styles.captchaIcon}>🛡️</span>
            <div>
              <h4 className={styles.captchaTitle}>Security Verification</h4>
              <p className={styles.captchaSubtitle}>Confirm you are a carbon-based developer.</p>
            </div>
          </div>

          <div className={styles.captchaBody}>
            {!isChecked ? (
              <button 
                onClick={handleCheckboxClick}
                className={styles.checkboxWrapper}
              >
                <div className={styles.checkboxSquare} />
                <span className={styles.checkboxLabel}>I am not a robot</span>
              </button>
            ) : (
              <div className={styles.telemetryLogs}>
                {logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={
                      log.startsWith('✓') 
                        ? styles.logSuccess 
                        : styles.logPending
                    }
                  >
                    {log}
                  </div>
                ))}
                {step < telemetrySteps.length && (
                  <div className={styles.loaderRow}>
                    <div className={styles.spinnerInline} />
                    <span className={styles.loadingText}>Running diagnostics...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              setShowCaptcha(false);
              setIsChecked(false);
              setStep(0);
              setLogs([]);
            }}
            className={styles.captchaCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

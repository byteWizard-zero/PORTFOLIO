'use client';

import { useState, useEffect } from 'react';
import { isSoundEnabled, setSoundEnabled, playClick } from '@/lib/audio';
import styles from './SoundToggle.module.css';

export function SoundToggle() {
  const [soundOn, setSoundOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSoundOn(isSoundEnabled());
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !soundOn) return;

    const handleGlobalClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;
        if (!target || typeof target.closest !== 'function') return;

        const interactive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]');
        if (interactive) {
          playClick();
        }
      } catch (err) {
        console.warn('[Audio] Global click listener error:', err);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [mounted, soundOn]);

  const toggle = () => {
    const nextState = !soundOn;
    setSoundEnabled(nextState);
    setSoundOn(nextState);
    
    // Play a click confirmation if sound is turned ON
    if (nextState) {
      setTimeout(() => {
        playClick();
      }, 50);
    }
  };

  if (!mounted) return null;

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={soundOn ? 'Mute telemetry audio' : 'Unmute telemetry audio'}
      title={soundOn ? 'Mute telemetry audio' : 'Unmute telemetry audio'}
      data-menu-passthrough=""
    >
      {soundOn ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}

'use client';

let soundEnabled = false;

if (typeof window !== 'undefined') {
  soundEnabled = localStorage.getItem('portfolio_sound') === 'true';
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_sound', enabled ? 'true' : 'false');
  }
}

export function playClick(): void {
  // disabled
}

export function playSweep(): void {
  // disabled
}

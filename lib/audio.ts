'use client';

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Safely read from localStorage on the client
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

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a low-latency mechanical click (analogous to an electrical relay click).
 */
export function playClick(): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
    
    // Very quiet, fast impulse
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.warn('[Audio] Failed to play click sound:', e);
  }
}

/**
 * Synthesizes a micro data transmission sweep (rising sine frequency).
 */
export function playSweep(): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
    
    // Soft volume curve to prevent clicking artifacts
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.015, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.warn('[Audio] Failed to play sweep sound:', e);
  }
}

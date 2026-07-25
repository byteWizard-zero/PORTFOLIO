'use client';

import { useContext } from 'react';
import { TransitionContext } from './TransitionProvider';
import type { TransitionContextValue } from './types';

export function useTransition(): TransitionContextValue {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error('useTransition must be used within <TransitionProvider>');
  }

  return {
    isTransitioning: ctx.isTransitioning,
    triggerTransition: ctx.triggerTransition,
    markPageReady: ctx.markPageReady,
    isPageReady: ctx.isPageReady,
    hasEntered: ctx.hasEntered,
  };
}

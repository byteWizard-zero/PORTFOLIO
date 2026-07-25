

import type { TransitionEffectName } from './registry';

export type TransitionPhase = 'exit' | 'enter';

export interface TransitionPayload {
  
  accent: string;
  
  title?: string;
  slug?: string;
  year?: string;
  category?: string;
}

export interface TransitionEffectProps {
  
  phase: TransitionPhase;
  
  origin: { x: number; y: number } | null;
  
  payload: TransitionPayload;
  
  onComplete: () => void;
}

export type TransitionEffect = React.ComponentType<TransitionEffectProps>;

export interface TriggerTransitionArgs {
  href: string;
  origin?: { x: number; y: number } | null;
  payload: TransitionPayload;
  
  effect?: TransitionEffectName | (string & {});
}

export interface TransitionContextValue {
  isTransitioning: boolean;
  triggerTransition: (args: TriggerTransitionArgs) => void;
  markPageReady: (path: string) => void;
  isPageReady: boolean;
  hasEntered: boolean;
}

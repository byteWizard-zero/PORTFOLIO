import type { TransitionEffect } from './types';
import { IrisBloom } from './effects/IrisBloom';
import { ColorCurtainStack } from './effects/ColorCurtainStack';

export const TRANSITION_EFFECTS = {
  'iris-bloom': IrisBloom,
  'color-curtain-stack': ColorCurtainStack,
} as const satisfies Record<string, TransitionEffect>;

export type TransitionEffectName = keyof typeof TRANSITION_EFFECTS;

export const TRANSITION_EFFECT_NAMES = Object.keys(
  TRANSITION_EFFECTS
) as TransitionEffectName[];

export const isKnownEffect = (name: string): name is TransitionEffectName =>
  Object.prototype.hasOwnProperty.call(TRANSITION_EFFECTS, name);

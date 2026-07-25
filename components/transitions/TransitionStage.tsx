'use client';

import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { TransitionContext } from './TransitionProvider';
import { TRANSITION_EFFECTS } from './registry';
import styles from './TransitionStage.module.css';
import type { TransitionPhase } from './types';

export function TransitionStage() {
  const ctx = useContext(TransitionContext);
  const pathname = usePathname();

  if (!ctx || ctx.state.kind === 'idle') return null;

  if (typeof document === 'undefined') return null;

  const { effect, origin, payload, kind, target } = ctx.state;

  const phase: TransitionPhase =
    kind === 'pending' && pathname === target && ctx.isPageReady ? 'enter' : 'exit';

  const Effect = TRANSITION_EFFECTS[effect];
  if (!Effect) return null;

  const onComplete = () => ctx.onPhaseComplete(phase);

  return createPortal(
    <div className={styles.stage} aria-hidden>
      <Effect
        phase={phase}
        origin={origin}
        payload={payload}
        onComplete={onComplete}
      />
    </div>,
    document.body
  );
}

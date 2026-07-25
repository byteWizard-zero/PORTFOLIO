'use client';

import Link from 'next/link';
import { forwardRef, useCallback, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useTransition } from './useTransition';
import type { TransitionPayload } from './types';
import type { TransitionEffectName } from './registry';

export interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  
  href: string;
  payload: TransitionPayload;
  
  effect?: TransitionEffectName;
  
  prefetch?: boolean;
  
  onBeforeTransition?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

function isModifiedClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
    
    e.button !== 0
  );
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    { href, payload, effect, onBeforeTransition, children, ...rest },
    ref
  ) {
    const { triggerTransition, isTransitioning } = useTransition();

    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        onBeforeTransition?.(e);
        if (e.defaultPrevented) return;
        if (isModifiedClick(e)) return;
        if (isTransitioning) {
          
          e.preventDefault();
          return;
        }

        const currentPath = window.location.pathname;
        const targetPath = (() => {
          try { return new URL(href, window.location.origin).pathname; }
          catch { return href; }
        })();
        if (targetPath === currentPath) return;

        e.preventDefault();
        triggerTransition({
          href,
          origin: { x: e.clientX, y: e.clientY },
          payload,
          effect,
        });
      },
      [href, payload, effect, onBeforeTransition, triggerTransition, isTransitioning]
    );

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </Link>
    );
  }
);

TransitionLink.displayName = 'TransitionLink';

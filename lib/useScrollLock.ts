'use client';

import { useEffect } from 'react';

let lockCount = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

function acquire(compensateScrollbar: boolean) {
  if (lockCount === 0) {
    const body = document.body;
    saved = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    
    if (compensateScrollbar) {
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    }
    body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function release() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0 && saved) {
    document.body.style.overflow = saved.overflow;
    document.body.style.paddingRight = saved.paddingRight;
    saved = null;
  }
}

export function useScrollLock(
  active: boolean,
  options?: { compensateScrollbar?: boolean }
) {
  const compensateScrollbar = options?.compensateScrollbar ?? false;
  useEffect(() => {
    if (!active) return;
    acquire(compensateScrollbar);
    return release;
  }, [active, compensateScrollbar]);
}

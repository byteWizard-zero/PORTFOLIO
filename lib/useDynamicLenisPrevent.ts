'use client';

import { useEffect, type RefObject } from 'react';

export function useDynamicLenisPrevent(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkScroll = () => {
      const isScrollable = el.scrollHeight > el.clientHeight;
      if (isScrollable) {
        el.setAttribute('data-lenis-prevent', '');
      } else {
        el.removeAttribute('data-lenis-prevent');
      }
    };

    checkScroll();

    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true, characterData: true });

    window.addEventListener('resize', checkScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [ref]);
}

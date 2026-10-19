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

    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const onResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      checkScroll();
    };

    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [ref]);
}

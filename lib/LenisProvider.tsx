'use client';

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface LenisContextValue {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number; easing?: (t: number) => number }) => void;
}

const LenisContext = createContext<LenisContextValue>({
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const initialPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    const lenis = new Lenis({
      lerp: 0.09,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReduced,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    if (typeof window !== 'undefined') {
      window.lenis = lenis;
    }

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      if (!document.hidden) {
        lenis.raf(time * 1000);
      }
    };

    gsap.ticker.add(tick);
    // Keep standard lag smoothing to avoid abrupt skips/teleporting on GC or frame hiccups
    gsap.ticker.lagSmoothing(500, 33);

    const handleVisibilityChange = () => {
      if (!document.hidden) ScrollTrigger.update();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        window.lenis = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (initialPathRef.current === null) {
      initialPathRef.current = pathname;
      return;
    }
    if (initialPathRef.current === pathname) {
      return;
    }
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    ScrollTrigger.refresh();
    ScrollTrigger.update();
  }, [pathname]);

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number; easing?: (t: number) => number }) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);

  const contextValue = useMemo<LenisContextValue>(() => ({
    scrollTo,
  }), [scrollTo]);

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}

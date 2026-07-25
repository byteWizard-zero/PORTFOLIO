'use client';

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

let originalLagSmoothing: number | null = null;
function snapshotLagSmoothing(): number {
  if (originalLagSmoothing === null && typeof window !== 'undefined') {
    const fn = gsap.ticker.lagSmoothing as (threshold?: number, adjustedLag?: number) => number;
    originalLagSmoothing = fn();
  }
  return originalLagSmoothing ?? 500;
}

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

    const lenis = new Lenis({
      lerp: 0.05, // Direct interpolation factor (between 0 and 1) for a heavy, consistent, and symmetric kinetic feel
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.45, // Decreased scroll density (scroll is slightly faster/lighter than before)
      touchMultiplier: 0.65,  // Adjusted Touch/Trackpad multiplier
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
    const prevLagSmoothing = snapshotLagSmoothing();
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); 

    const handleVisibilityChange = () => {
      if (!document.hidden) ScrollTrigger.update();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(prevLagSmoothing);
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

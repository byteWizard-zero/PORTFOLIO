'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useStaticFallback } from './useStaticFallback';
import { StaticServicesV2 } from './StaticServicesV2';

const DialServicesV2 = dynamic(
  () => import('./DialServicesV2').then((mod) => mod.DialServicesV2),
  { ssr: false }
);

const emptySubscribe = () => () => {};

export function ServicesV2() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const reducedMotion = useReducedMotion();
  const isCoarseOrSmall = useStaticFallback();

  const useStaticLayout = reducedMotion || isCoarseOrSmall;

  // SSR and initial client hydration render matching StaticServicesV2 for SEO & zero hydration mismatch
  if (!mounted) {
    return <StaticServicesV2 />;
  }

  return useStaticLayout ? <StaticServicesV2 /> : <DialServicesV2 />;
}

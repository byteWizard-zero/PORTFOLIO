'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useStaticFallback } from './useStaticFallback';
import { StaticServicesV2 } from './StaticServicesV2';

const DialServicesV2 = dynamic(
  () => import('./DialServicesV2').then((mod) => mod.DialServicesV2),
  { ssr: false }
);

export function ServicesV2() {
  const reducedMotion = useReducedMotion();
  const isCoarseOrSmall = useStaticFallback();
  const useStaticLayout = reducedMotion || isCoarseOrSmall;
  return useStaticLayout ? <StaticServicesV2 /> : <DialServicesV2 />;
}

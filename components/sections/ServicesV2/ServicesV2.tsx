'use client';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { useStaticFallback } from './useStaticFallback';
import { StaticServicesV2 } from './StaticServicesV2';
import { DialServicesV2 } from './DialServicesV2';

export function ServicesV2() {
  const reducedMotion = useReducedMotion();
  const isCoarseOrSmall = useStaticFallback();
  const useStaticLayout = reducedMotion || isCoarseOrSmall;
  return useStaticLayout ? <StaticServicesV2 /> : <DialServicesV2 />;
}

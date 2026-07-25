'use client';

import { useSyncExternalStore } from 'react';

const STATIC_QUERY = '(pointer: coarse), (max-width: 767px)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(STATIC_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getSnapshot = () =>
  typeof window !== 'undefined' && !!window.matchMedia &&
  window.matchMedia(STATIC_QUERY).matches;

const getServerSnapshot = () => false;

export function useStaticFallback(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

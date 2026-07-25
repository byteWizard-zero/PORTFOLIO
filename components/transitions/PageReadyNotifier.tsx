'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from './useTransition';

export function PageReadyNotifier({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { markPageReady } = useTransition();

  useEffect(() => {
    
    markPageReady(pathname);
  }, [pathname, markPageReady]);

  return <>{children}</>;
}

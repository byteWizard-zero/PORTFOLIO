'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { DEFAULT_VARIANT, isVariant, type WorkflowVariant } from './variants';
import { EclipseWorkflow } from './EclipseWorkflow';
import { EclipticWorkflow } from './EclipticWorkflow';

const DEV = process.env.NODE_ENV !== 'production';

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}
function getSnapshot(): WorkflowVariant {
  if (!DEV) return DEFAULT_VARIANT;
  const param = new URLSearchParams(window.location.search).get('wf');
  return isVariant(param) ? param : DEFAULT_VARIANT;
}
function getServerSnapshot(): WorkflowVariant {
  return DEFAULT_VARIANT;
}

export function Workflow() {
  const variant = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [variant]);

  return variant === 'ecliptic' ? <EclipticWorkflow /> : <EclipseWorkflow />;
}

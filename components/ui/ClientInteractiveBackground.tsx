'use client';

import dynamic from 'next/dynamic';

const InteractiveBackground = dynamic(
  () => import('@/components/sections/Hero').then((mod) => mod.InteractiveBackground),
  { ssr: false }
);

export function ClientInteractiveBackground() {
  return <InteractiveBackground />;
}

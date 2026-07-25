import type { Metadata } from 'next';
import { ArcadePageView } from '@/components/sections/arcade-page';

export const metadata: Metadata = {
  title: 'Arcade · Zenith Soumya',
  description:
    'Interactive simulations, Java/DSA complexity engines, and agentic AI prompt routing pipelines.',
  alternates: { canonical: '/arcade' },
};

export default function ArcadeRoute() {
  return <ArcadePageView />;
}

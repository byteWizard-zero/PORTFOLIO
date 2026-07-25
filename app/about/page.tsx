import type { Metadata } from 'next';
import { AboutPageView } from '@/components/sections/about-page';

export const metadata: Metadata = {
  title: 'About · Zenith Soumya',
  description:
    'Zenith Soumya builds next-gen IoT systems, optimized Java/DSA engines, and agentic AI full-stack applications.',
  alternates: { canonical: '/about' },
};

export default function AboutRoute() {
  return <AboutPageView />;
}

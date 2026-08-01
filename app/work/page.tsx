import type { Metadata } from 'next';
import { WorksPage } from '@/components/sections/works-index';

export const metadata: Metadata = {
  title: 'Works · Zenith Soumya',
  description: 'Selected projects and case studies by Zenith Soumya.',
  alternates: { canonical: '/work' },
  robots: { index: false, follow: true },
};

export default function WorksRoute() {
  return <WorksPage />;
}

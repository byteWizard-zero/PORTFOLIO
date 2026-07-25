import type { Metadata } from 'next';
import { WorksPage } from '@/components/sections/works-index';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function WorksRoute() {
  return <WorksPage />;
}

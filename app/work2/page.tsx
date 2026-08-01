import type { Metadata } from 'next';
import { WorksStickersPage } from '@/components/sections/works-stickers';

export const metadata: Metadata = {
  title: 'Works · Zenith Soumya',
  description: 'Interactive sticker-style project showcase by Zenith Soumya.',
  alternates: { canonical: '/work2' },
};

export default function Work2Route() {
  return <WorksStickersPage />;
}

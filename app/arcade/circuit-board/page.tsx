import type { Metadata } from 'next';
import { CircuitBoard } from '@/components/sections/CircuitBoard/CircuitBoard';

export const metadata: Metadata = {
  title: 'Logic Circuit Board Simulator · Zenith Soumya',
  description:
    'Design, simulate, and analyze digital logic gate networks. Build half adders, latches, and custom circuits in real-time.',
  alternates: { canonical: '/arcade/circuit-board' },
};

export default function CircuitBoardRoute() {
  return <CircuitBoard />;
}

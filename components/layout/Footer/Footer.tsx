'use client';

import dynamic from 'next/dynamic';
import type { MenuItem } from '@/components/ui/InfiniteMenu';
import styles from './Footer.module.css';

const InfiniteMenu = dynamic(
  () => import('@/components/ui/InfiniteMenu').then((mod) => mod.InfiniteMenu),
  { ssr: false }
);

const DEMO_ITEMS: MenuItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=600&h=600&fit=crop&sat=-100&auto=format',
    link: 'https://google.com/',
    title: 'Item 1',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=600&h=600&fit=crop&sat=-100&auto=format',
    link: 'https://google.com/',
    title: 'Item 2',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=600&h=600&fit=crop&sat=-100&auto=format',
    link: 'https://google.com/',
    title: 'Item 3',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=600&h=600&fit=crop&sat=-100&auto=format',
    link: 'https://google.com/',
    title: 'Item 4',
    description: 'This is pretty cool, right?'
  }
];

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo" id="footer" aria-label="Footer">
      <div className={styles.container}>
        <div className={styles.blackBlock}>
          <InfiniteMenu items={DEMO_ITEMS} scale={1} backgroundColor="#000000" />
        </div>
      </div>
    </footer>
  );
}

'use client';

import dynamic from 'next/dynamic';
import type { MenuItem } from '@/components/ui/InfiniteMenu';
import styles from './Footer.module.css';

const InfiniteMenu = dynamic(
  () => import('@/components/ui/InfiniteMenu').then((mod) => mod.InfiniteMenu),
  { ssr: false }
);

const HANDLE_ITEMS: MenuItem[] = [
  {
    image: '/github.jpg',
    link: 'https://github.com/byteWizard-zero',
    title: 'GitHub',
    description: 'Open-source repositories, system architecture & full-stack experiments.',
    platform: 'github',
    buttonColor: '#24292e',
    buttonTextColor: '#ffffff',
  },
  {
    image: '/instagram.jpg',
    link: 'https://www.instagram.com/zenith.soumya',
    title: 'Instagram',
    description: 'Visual design, engineering life & behind-the-scenes moments.',
    platform: 'instagram',
    buttonColor: '#E1306C',
    buttonTextColor: '#ffffff',
  },
  {
    image: '/whatsapp.jpg',
    link: 'https://wa.me/?text=Hi%20Zenith%2C%20I%20came%20across%20your%20portfolio!',
    title: 'WhatsApp',
    description: 'Direct communications, rapid inquiries & high-priority collabs.',
    platform: 'whatsapp',
    buttonColor: '#25D366',
    buttonTextColor: '#ffffff',
  },
  {
    image: '/profile1.png',
    link: 'https://leetcode.com/u/zenithsoumya',
    title: 'LeetCode',
    description: 'Algorithms, Data Structures & high-performance problem solving.',
    platform: 'leetcode',
    buttonColor: '#FFA116',
    buttonTextColor: '#1a1a1a',
  },
];

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo" id="footer" aria-label="Footer">
      <div className={styles.container}>
        <div className={styles.blackBlock}>
          <InfiniteMenu items={HANDLE_ITEMS} scale={1} backgroundColor="#000000" />
        </div>
      </div>
    </footer>
  );
}

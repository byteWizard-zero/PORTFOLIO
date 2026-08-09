'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './Footer.module.css';

const SUB_FOOTER_GRID = [
  {
    label: 'DESIGNED BY',
    items: [
      { text: '© Zenith Soumya', href: '#' },
    ],
  },
  {
    label: 'WEB DESIGN',
    items: [
      { text: 'FreeLLMProxy', href: '#projects' },
      { text: 'PineCarve', href: '#projects' },
      { text: 'Stead', href: '#projects' },
    ],
  },
  {
    label: 'PRODUCT DESIGN',
    items: [
      { text: 'IoT Mesh', href: '#services' },
      { text: 'Xwana', href: '#services' },
      { text: 'CaseCoach', href: '#services' },
    ],
  },
  {
    label: 'SOCIAL MEDIA',
    items: [
      { text: 'Instagram', href: 'https://www.instagram.com/zenith.soumya' },
      { text: 'GitHub', href: 'https://github.com/byteWizard-zero' },
      { text: 'LinkedIn', href: 'https://www.linkedin.com/in/soumya-ranjan-jana-414586370' },
      { text: 'LeetCode', href: 'https://leetcode.com/u/byteWizard-zero/' },
    ],
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState<boolean>(false);

  // Custom Cursor Mode Events
  const handleMouseEnter = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('footer-hover-enter'));
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('footer-hover-leave'));
    }
  };

  // GSAP Entrance Animations
  useGSAP(() => {
    if (!footerRef.current || reducedMotion) return;

    const elements = footerRef.current.querySelectorAll(`.${styles.revealItem}`);

    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, { scope: footerRef, dependencies: [reducedMotion] });

  // Quick Copy Email
  const handleCopyEmail = async () => {
    const email = 'soumyaranjanjana810@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <footer
      ref={footerRef}
      className={styles.footer}
      role="contentinfo"
      id="footer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.inner}>
        
        {/* Massive Stacked Hero Title ("Get In Touch") */}
        <div className={`${styles.heroSection} ${styles.revealItem}`}>
          <div className={styles.textLine}>
            <span className={styles.heroText}>Get In</span>
          </div>

          {/* Floating Contact Email Pill Badge */}
          <div className={styles.pillContainer}>
            <button
              ref={pillRef}
              type="button"
              className={styles.contactPill}
              onClick={handleCopyEmail}
              aria-label="Copy email address contact@karunsuresh.com"
              title="Click to copy email address"
            >
              <div className={styles.avatarWrapper}>
                <Image
                  src="/profile1.png"
                  alt="Soumya (Asher)"
                  width={32}
                  height={32}
                  priority
                  className={styles.avatarImg}
                />
              </div>
              <span className={styles.emailText}>
                {copied ? 'copied ✓' : 'soumyaranjanjana810@gmail.com'}
              </span>
            </button>
          </div>

          <div className={styles.textLine}>
            <span className={styles.heroText}>Touch</span>
          </div>
        </div>

        {/* Separator Divider Line */}
        <div className={`${styles.divider} ${styles.revealItem}`} aria-hidden="true" />

        {/* 4-Column Sub-Footer Metadata Grid */}
        <div className={`${styles.subFooterGrid} ${styles.revealItem}`}>
          {SUB_FOOTER_GRID.map((col, idx) => (
            <div key={idx} className={styles.gridCol}>
              <span className={styles.colLabel}>{col.label}</span>
              <div className={styles.colItems}>
                {col.items.map((item, itemIdx) => (
                  <span key={itemIdx} className={styles.itemSpan}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : '_self'}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={styles.itemLink}
                    >
                      {item.text}
                    </a>
                    {itemIdx < col.items.length - 1 && (
                      <span className={styles.pipeSeparator}>|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}

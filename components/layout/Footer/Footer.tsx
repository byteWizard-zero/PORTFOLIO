'use client';

import { useState, useRef, useEffect } from 'react';
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
  const heroRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Mouse Tracking & Graceful Entrance/Exit Animations for Email Pill
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || !footerRef.current || !pillRef.current) return;

    const rect = footerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pillHeight = pillRef.current.offsetHeight || 44;
    const targetX = mouseX + 8;
    const targetY = mouseY - pillHeight + 6;

    gsap.to(pillRef.current, {
      x: targetX,
      y: targetY,
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    setIsHovered(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('footer-hover-enter'));
    }

    if (pillRef.current && footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const pillHeight = pillRef.current.offsetHeight || 44;
      const targetX = mouseX + 8;
      const targetY = mouseY - pillHeight + 6;

      // Position at mouse entry point & pop into view gracefully
      gsap.set(pillRef.current, { x: targetX, y: targetY });
      gsap.to(pillRef.current, {
        opacity: 1,
        scale: 1,
        autoAlpha: 1,
        duration: 0.35,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('footer-hover-leave'));
    }

    // Gracefully scale down & fade out on mouse exit
    if (pillRef.current) {
      gsap.to(pillRef.current, {
        opacity: 0,
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: 'auto',
      });
    }
  };

  // Hide pill initially on mount
  useEffect(() => {
    if (pillRef.current) {
      gsap.set(pillRef.current, { opacity: 0, scale: 0.85, autoAlpha: 0 });
    }
  }, []);

  // GSAP Entrance Reveal Animations
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

  // Quick Copy Email Action
  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.inner}>
        
        {/* Massive Stacked Hero Title ("Get In Touch") */}
        <div ref={heroRef} className={`${styles.heroSection} ${styles.revealItem}`}>
          <div className={styles.textLine}>
            <span className={styles.heroText}>Get In</span>
          </div>
          <div className={styles.textLine}>
            <span className={styles.heroText}>Touch</span>
          </div>

          {/* Floating Cursor-Following Email Pill Badge */}
          <div className={`${styles.pillWrapper} ${isHovered ? styles.pillTracking : ''}`}>
            <button
              ref={pillRef}
              type="button"
              className={styles.contactPill}
              onClick={handleCopyEmail}
              aria-label="Copy email address soumyaranjanjana810@gmail.com"
              title="Click to copy email address"
            >
              {/* Pointer Arrow Cursor attached at bottom-left */}
              <div className={styles.pointerArrowWrap} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 3L10.07 19.97L13.58 12.58L20.97 9.07L3 3Z"
                    fill="#171717"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Avatar Image from ScratchCard */}
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

              {/* Email Text & Status */}
              <span className={styles.emailText}>
                {copied ? 'copied ✓' : 'soumyaranjanjana810@gmail.com'}
              </span>
            </button>
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

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './Footer.module.css';

interface NavLinkItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
}

interface FooterColumn {
  title: string;
  links: NavLinkItem[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'INDEX',
    links: [
      { label: 'Overview / Home', href: '/' },
      { label: 'Selected Works', href: '/work' },
      { label: 'Profile & Experience', href: '/about' },
      { label: 'Hardware Arcade', href: '/arcade' },
    ],
  },
  {
    title: 'FEATURED WORKS',
    links: [
      { label: 'Furina AI Companion', href: '/work/furina', badge: 'AI' },
      { label: 'CartSnap Architecture', href: '/work/cartsnap', badge: 'IoT' },
      { label: 'Flavr Food Experience', href: '/work/flavr' },
      { label: 'FreeLLMProxy Engine', href: '/work' },
    ],
  },
  {
    title: 'CAPABILITIES',
    links: [
      { label: 'IoT Mesh & Embedded Systems', href: '/about' },
      { label: 'Java & High-Performance DSA', href: '/about' },
      { label: 'Agentic AI & Prompt Pipelines', href: '/about' },
      { label: 'Offline-First Systems', href: '/about' },
    ],
  },
  {
    title: 'NETWORK & SOCIAL',
    links: [
      { label: 'GitHub', href: 'https://github.com/byteWizard-zero', isExternal: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/soumya-ranjan-jana-414586370', isExternal: true },
      { label: 'LeetCode', href: 'https://leetcode.com/u/byteWizard-zero/', isExternal: true, badge: '290+' },
      { label: 'Instagram', href: 'https://www.instagram.com/zenith.soumya', isExternal: true },
    ],
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [copied, setCopied] = useState<boolean>(false);
  const [istTime, setIstTime] = useState<string>('');

  const email = 'soumyaranjanjana810@gmail.com';

  // Live IST Clock (Bhubaneswar, India: UTC+5:30)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setIstTime(now.toLocaleTimeString('en-US', options) + ' IST');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick Copy Email
  const handleCopyEmail = async () => {
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
      setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    }
  };

  // Back to top scroll handler
  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // GSAP Entrance Reveal Animations
  useGSAP(() => {
    if (!footerRef.current || reducedMotion) return;

    const revealItems = footerRef.current.querySelectorAll(`.${styles.reveal}`);

    gsap.fromTo(
      revealItems,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, { scope: footerRef, dependencies: [reducedMotion] });

  return (
    <footer ref={footerRef} className={styles.footer} role="contentinfo" id="footer">
      <div className={styles.container}>
        {/* Double-Bezel Architectural Enclosure */}
        <div ref={cardRef} className={styles.bezelCard}>
          {/* Subtle Ambient Radial Highlight */}
          <div className={styles.ambientGlow} aria-hidden="true" />

          {/* Top Eyebrow / Availability Row */}
          <div className={`${styles.topRow} ${styles.reveal}`}>
            <div className={styles.statusPill}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.statusText}>AVAILABLE FOR AMBITIOUS BUILDS · 2026</span>
            </div>
            <div className={styles.locationTag}>
              <span className={styles.coordDot} aria-hidden="true" />
              <span>BHUBANESWAR, IN · 20.2488° N, 85.8007° E</span>
            </div>
          </div>

          {/* Hero Section: Editorial Headline & Action Capsule */}
          <div className={`${styles.heroSection} ${styles.reveal}`}>
            <div className={styles.headlineCol}>
              <h2 className={styles.headline}>
                LET’S BUILD SOMETHING <br />
                <span className={styles.accentText}>EXTRAORDINARY.</span>
              </h2>
              <p className={styles.subheadline}>
                Bridging hardware microcontrollers, high-performance Java/DSA systems,
                and agentic AI applications with zero lag.
              </p>
            </div>

            {/* Transmission / Direct Contact Card */}
            <div className={styles.actionCol}>
              <div className={styles.avatarCard}>
                <div className={styles.avatarGroup}>
                  <div className={styles.avatarWrap}>
                    <Image
                      src="/profile1.png"
                      alt="Zenith Soumya"
                      width={48}
                      height={48}
                      className={styles.avatarImg}
                    />
                    <span className={styles.onlineBadge} title="Active System" />
                  </div>
                  <div className={styles.avatarInfo}>
                    <span className={styles.avatarName}>Zenith Soumya</span>
                    <span className={styles.avatarRole}>IoT & AI Systems Architect</span>
                  </div>
                </div>

                <div className={styles.emailActionWrap}>
                  <button
                    type="button"
                    className={`${styles.copyButton} ${copied ? styles.copySuccess : ''}`}
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                  >
                    <span className={styles.emailAddress}>{email}</span>
                    <span className={styles.copyIconBadge}>
                      {copied ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </span>
                    <span className={styles.feedbackTooltip}>
                      {copied ? 'Copied to Clipboard!' : 'Click to Copy'}
                    </span>
                  </button>

                  <a
                    href={`mailto:${email}`}
                    className={styles.directMailLink}
                    aria-label="Send direct email"
                  >
                    <span>Send Direct Email</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Divider */}
          <div className={`${styles.divider} ${styles.reveal}`} aria-hidden="true" />

          {/* 4-Column Navigation Matrix */}
          <div className={`${styles.columnsGrid} ${styles.reveal}`}>
            {FOOTER_COLUMNS.map((col, idx) => (
              <div key={idx} className={styles.navColumn}>
                <span className={styles.columnHeading}>{col.title}</span>
                <ul className={styles.linksList}>
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx} className={styles.linkItem}>
                      {link.isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.navLink}
                        >
                          <span>{link.label}</span>
                          <svg className={styles.externalArrow} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                          {link.badge && <span className={styles.linkBadge}>{link.badge}</span>}
                        </a>
                      ) : (
                        <Link href={link.href} className={styles.navLink}>
                          <span>{link.label}</span>
                          {link.badge && <span className={styles.linkBadge}>{link.badge}</span>}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Telemetry / Bottom Bar */}
          <div className={`${styles.bottomBar} ${styles.reveal}`}>
            <div className={styles.colophonLeft}>
              <span className={styles.clockPill}>
                <span className={styles.clockIcon} aria-hidden="true">⏱</span>
                <span>{istTime || '20:30:00 IST'}</span>
              </span>
              <span className={styles.uptimeBadge}>
                <span className={styles.greenDot} aria-hidden="true" />
                <span>99.98% OPERATIONAL</span>
              </span>
            </div>

            <div className={styles.colophonCenter}>
              <span className={styles.copyrightText}>
                © 2026 ZENITH SOUMYA · ARCHITECTED WITH PRECISION
              </span>
            </div>

            <div className={styles.colophonRight}>
              <button
                type="button"
                className={styles.backTopBtn}
                onClick={handleBackToTop}
                aria-label="Back to top of page"
              >
                <span>BACK TO TOP</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

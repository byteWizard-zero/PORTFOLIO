'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './Footer.module.css';

const DIRECTORY_LINKS = [
  { label: 'Work', href: '#projects' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '#services' },
  { label: 'Arcade', href: '/arcade' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/byteWizard-zero' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/soumya-ranjan-jana-414586370' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/byteWizard-zero/' },
  { label: 'Twitter / X', href: 'https://x.com/byte_wizard1' },
  { label: 'Instagram', href: 'https://www.instagram.com/zenith.soumya' },
];

const TECH_TAGS = [
  'Next.js 14',
  'TypeScript',
  'GSAP & ScrollTrigger',
  'Lenis Scroll',
  'Java / DSA',
  'IoT Architecture',
  'Gemini AI',
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [timeString, setTimeString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Live Bhubaneswar (Asia/Kolkata) Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTimeString(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP ScrollTrigger reveal animation
  useGSAP(() => {
    if (!footerRef.current || reducedMotion) return;

    const elements = footerRef.current.querySelectorAll(`.${styles.revealItem}`);

    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 88%',
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

  // Scroll to Top Handler
  const handleScrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer ref={footerRef} className={styles.footer} role="contentinfo" id="footer">
      <div className={styles.inner}>
        
        {/* Top Status & Telemetry Clock Bar */}
        <div className={`${styles.topBar} ${styles.revealItem}`}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>AVAILABLE FOR SELECT PROJECTS</span>
          </div>

          <div className={styles.clockContainer}>
            <span className={styles.locationText}>Bhubaneswar, IN</span>
            <span className={styles.clockDivider} aria-hidden="true">·</span>
            <span className={styles.clockValue}>
              {timeString ? `${timeString} IST` : '--:--:-- IST'}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className={styles.grid}>
          
          {/* Column 1: Brand & Persona */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <h2 className={styles.brandName}>Zenith Soumya</h2>
            <p className={styles.brandTitle}>IoT & AI Systems Architect · CS Engineer</p>
            <p className={styles.brandDesc}>
              Architecting resilient IoT frameworks, dynamic full-stack applications, and high-performance agentic AI systems with sub-millisecond precision.
            </p>

            <div className={styles.emailActionWrap}>
              <button
                type="button"
                className={styles.emailBtn}
                onClick={handleCopyEmail}
                aria-label="Copy email address to clipboard"
              >
                <span className={styles.emailText}>soumyaranjanjana810@gmail.com</span>
                <span className={styles.copyBadge}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Column 2: Directory */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>Directory</div>
            <ul className={styles.linkList}>
              {DIRECTORY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.linkItem}>
                    <span>{link.label}</span>
                    <span className={styles.arrowIcon} aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social Protocol */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>Social Protocol</div>
            <ul className={styles.linkList}>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <span>{link.label}</span>
                    <span className={styles.arrowIcon} aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Engineered Stack */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>Engineered With</div>
            <div className={styles.tagGroup}>
              {TECH_TAGS.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Back To Top Bar */}
        <div className={`${styles.bottomBar} ${styles.revealItem}`}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Zenith Soumya · All Rights Reserved
          </p>

          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={handleScrollTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <span className={styles.scrollTopIcon} aria-hidden="true">↑</span>
          </button>
        </div>

      </div>
    </footer>
  );
}

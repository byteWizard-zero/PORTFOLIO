'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Menu } from './Menu';
import { useAccentColor } from '@/lib/AccentColorContext';
import { content } from '@/data';
import styles from './Navbar.module.css';

const INITIALS = content.welcomeScreen.initials;

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [keepElevated, setKeepElevated] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerLinesRef = useRef<HTMLSpanElement[]>([]);
  const brandWrapperRef = useRef<HTMLDivElement>(null);
  const { cycleColor } = useAccentColor();
  const pathname = usePathname();
  const isHome = pathname === '/';

  useGSAP(() => {
    const brand = document.getElementById('navbar-brand');
    if (brand) gsap.set(brand, { clearProps: 'opacity' });
  }, { dependencies: [isHome] });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    const intersecting = new Set<Element>();

    const applyTheme = () => {
      if (intersecting.size > 0) nav.setAttribute('data-nav-theme', 'dark');
      else nav.removeAttribute('data-nav-theme');
    };

    const buildObserver = () => {
      observer?.disconnect();
      intersecting.clear();

      applyTheme();

      const rect = nav.getBoundingClientRect();

      const top = Math.max(0, rect.top);
      const bottom = Math.max(0, window.innerHeight - rect.bottom);
      const rootMargin = `-${top}px 0px -${bottom}px 0px`;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) intersecting.add(entry.target);
            else intersecting.delete(entry.target);
          }
          applyTheme();
        },
        { rootMargin, threshold: 0 }
      );

      document
        .querySelectorAll('[data-nav-theme="dark"]')
        .forEach((el) => observer!.observe(el));
    };

    buildObserver();

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(buildObserver);
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      // Intentionally do NOT removeAttribute here: on a pathname-change
      // re-run, this cleanup fires before the new effect's buildObserver,
      // which would briefly flash the navbar to light mode. The new
      // buildObserver's applyTheme() call handles the reset cleanly.
      // On true unmount, the navbar element is going away anyway.
    };
  }, [pathname]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (!prev) {
        
        setKeepElevated(true);
      }
      return !prev;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    // Keep navbar elevated - will be lowered by onCloseComplete
  }, []);

  const handleCloseComplete = useCallback(() => {
    
    setKeepElevated(false);
  }, []);

  useGSAP(() => {
    if (!navRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    });

    tl.fromTo(
      menuButtonRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }
    );
  }, { scope: navRef });

  useGSAP(() => {
    if (!menuButtonRef.current || hamburgerLinesRef.current.length < 3) return;

    const [line1, line2, line3] = hamburgerLinesRef.current;

    const menuChars = menuButtonRef.current.querySelectorAll(`.${styles.navTextMenu} .${styles.navChar}`);
    const closeChars = menuButtonRef.current.querySelectorAll(`.${styles.navTextClose} .${styles.navChar}`);
    const closeTextItem = menuButtonRef.current.querySelector(`.${styles.navTextClose}`);

    gsap.killTweensOf([line1, line2, line3, menuChars, closeChars, closeTextItem]);

    const brandWrapper = brandWrapperRef.current;

    if (isMenuOpen) {

      if (brandWrapper) {
        gsap.to(brandWrapper, { opacity: 0, duration: 0.3, ease: 'power2.in' });
      }

      gsap.to(line1, {
        rotation: 45,
        y: 8,
        backgroundColor: 'var(--color-background)',
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(line2, {
        opacity: 0,
        x: 20,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(line3, {
        rotation: -45,
        y: -8,
        backgroundColor: 'var(--color-background)',
        duration: 0.4,
        ease: 'power2.out',
      });

      if (closeTextItem) gsap.set(closeTextItem, { visibility: 'visible' });
      
      gsap.to(menuChars, {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in',
      });
      
      gsap.fromTo(closeChars, 
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1, // Slight delay to sync with hamburger
        }
      );

    } else {

      if (brandWrapper) {
        gsap.to(brandWrapper, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.5 });
      }

      gsap.to(line1, {
        rotation: 0,
        y: 0,
        backgroundColor: 'var(--nav-fg)',
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => { gsap.set(line1, { clearProps: 'backgroundColor' }); },
      });
      gsap.to(line2, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.1,
      });
      gsap.to(line3, {
        rotation: 0,
        y: 0,
        backgroundColor: 'var(--nav-fg)',
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => { gsap.set(line3, { clearProps: 'backgroundColor' }); },
      });

      if (closeTextItem) gsap.set(closeTextItem, { visibility: 'visible' });

      gsap.to(closeChars, {
        y: '100%',
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => {
          if (closeTextItem) gsap.set(closeTextItem, { visibility: 'hidden' });
        }
      });
      
      gsap.fromTo(menuChars,
        { y: '-100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1,
        }
      );
    }
  }, { dependencies: [isMenuOpen] });

  return (
    <>
      <nav ref={navRef} className={`${styles.navbar} ${(isMenuOpen || keepElevated) ? styles.menuOpen : ''}`}>
        <button
          ref={menuButtonRef}
          className={styles.navLeft}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
        >
          <span className={styles.hamburgerMenu}>
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[0] = el; }}
              className={styles.hamburgerLine}
            />
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[1] = el; }}
              className={`${styles.hamburgerLine} ${styles.hamburgerLineAccent}`}
            />
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[2] = el; }}
              className={styles.hamburgerLine}
            />
          </span>
          <div className={styles.navTextContainer}>
            <span className={`${styles.navTextItem} ${styles.navTextMenu}`}>
              {'MENU'.split('').map((char, i) => (
                <span key={`m-${char}-${i}`} className={styles.navChar}>{char}</span>
              ))}
            </span>
            <span className={`${styles.navTextItem} ${styles.navTextClose}`}>
              {'CLOSE'.split('').map((char, i) => (
                <span key={`c-${char}-${i}`} className={styles.navChar}>{char}</span>
              ))}
            </span>
          </div>
        </button>

        <div ref={brandWrapperRef} className={styles.navCenterWrapper}>
          <div
            id="navbar-brand"
            className={styles.navCenter}
            data-on-home={String(isHome)}
          >
            <span id="navbar-brand-m" className={styles.brandLetter}>{INITIALS.first}</span>
            <span className={styles.brandSpacer} />
            <span id="navbar-brand-a" className={styles.brandLetter}>{INITIALS.last}</span>
          </div>
        </div>
      </nav>
      <Menu isOpen={isMenuOpen} onClose={closeMenu} onCloseComplete={handleCloseComplete} onRevealStart={cycleColor} />
    </>
  );
}

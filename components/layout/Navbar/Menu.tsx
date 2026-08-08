'use client';

import { useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { navigation } from '@/data';
import { useLenis } from '@/lib/LenisProvider';
import { scrollToContactReveal } from '@/lib/scrollToContactReveal';
import { scrollToProjectsReveal } from '@/lib/scrollToProjectsReveal';
import { useAccentColor } from '@/lib/AccentColorContext';
import { useTransition } from '@/components/transitions';
import { useScrollLock } from '@/lib/useScrollLock';
import styles from './Menu.module.css';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onRevealStart?: () => void;
}

const menuLinks = navigation.mainLinks.map(link => ({
  label: link.label,
  href: link.href,
  desc: link.description,
}));

const socialLinks = navigation.socialLinks.map(link => ({
  label: link.label,
  href: link.href,
}));

const MENU_EASE = 'power4.inOut';

export function Menu({ isOpen, onClose, onCloseComplete, onRevealStart }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLUListElement>(null);
  const socialSectionRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const pendingNavRef = useRef<{ href: string; accent: string; x: number; y: number } | null>(null);
  const { scrollTo } = useLenis();
  const pathname = usePathname();
  const { triggerTransition } = useTransition();
  const { color: currentAccent } = useAccentColor();

  useScrollLock(isOpen);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (isOpen) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const menuAncestor = (() => {
        let n: Node | null = menu;
        while (n && n.parentNode && n.parentNode !== document.body) n = n.parentNode;
        return n as HTMLElement | null;
      })();
      const inertedSiblings: HTMLElement[] = [];
      Array.from(document.body.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        if (child === menuAncestor) return;
        if (child.hasAttribute('inert')) return;

        if (child.querySelector('[aria-controls="main-menu"]')) return;

        if (child.matches('[data-menu-passthrough]')) return;
        if (child.querySelector('[data-menu-passthrough]')) return;
        child.setAttribute('inert', '');
        inertedSiblings.push(child);
      });

      const focusFrame = requestAnimationFrame(() => {
        const firstLink = menu.querySelector<HTMLElement>(
          `.${styles.link}, .${styles.backButton}`,
        );
        firstLink?.focus({ preventScroll: true });
      });

      const FOCUSABLE_SELECTOR =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';
      const handleTrapKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(
          menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !menu.contains(active)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else {
          if (active === last || !menu.contains(active)) {
            e.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
      };
      document.addEventListener('keydown', handleTrapKey);

      return () => {
        cancelAnimationFrame(focusFrame);
        document.removeEventListener('keydown', handleTrapKey);
        inertedSiblings.forEach((el) => el.removeAttribute('inert'));
        
        previouslyFocusedRef.current?.focus({ preventScroll: true });
        previouslyFocusedRef.current = null;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAnimating.current) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleExternalClose = () => {
      if (isOpen && !isAnimating.current) onClose();
    };
    document.addEventListener('menu:close', handleExternalClose);
    return () => document.removeEventListener('menu:close', handleExternalClose);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!menuRef.current || !overlayRef.current || !linksContainerRef.current || !socialSectionRef.current) return;

    const links = linksContainerRef.current.querySelectorAll(`.${styles.linkInner}`);
    const linkNumbers = linksContainerRef.current.querySelectorAll(`.${styles.linkNumber}`);
    if (links.length === 0) return;

    const socialLabels = socialSectionRef.current.querySelectorAll(`.${styles.socialLabel}`);
    const socialLinks = socialSectionRef.current.querySelectorAll(`.${styles.socialLink}`);
    const locationText = socialSectionRef.current.querySelector(`.${styles.locationText}`);
    
    gsap.killTweensOf([
      menuRef.current, overlayRef.current, links, linkNumbers,
      socialLabels, socialLinks, locationText
    ]);

    isAnimating.current = true;

    if (isOpen) {

      gsap.set(menuRef.current, { visibility: 'visible' });

      gsap.set(overlayRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(links, { y: '110%' });
      gsap.set(linkNumbers, { opacity: 0, x: -20 });

      gsap.set(socialLabels, { opacity: 0, x: 20 });
      gsap.set(socialLinks, { opacity: 0, y: 30 });
      gsap.set(locationText, { opacity: 0 });
      
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
          if (pendingNavRef.current) {
            const nav = pendingNavRef.current;
            pendingNavRef.current = null;
            triggerTransition({ href: nav.href, origin: { x: nav.x, y: nav.y }, payload: { accent: nav.accent } });
          }
        }
      });

      tl.to(overlayRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.7,
        ease: MENU_EASE,
      })
      // 2. Links stagger up (starts 0.3s after overlay begins)
      .to(links, {
        y: '0%',
        duration: 0.8,
        stagger: 0.1,
        ease: MENU_EASE,
      }, 0.3)
      // 3. Numbers fade in
      .to(linkNumbers, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.5)
      // 4. Social labels slide in from right
      .to(socialLabels, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
      }, 0.4)
      // 5. Social links stagger up
      .to(socialLinks, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: MENU_EASE,
      }, 0.5)
      // 6. Location text fades in
      .to(locationText, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.7);

    } else {

      const currentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-purple').trim();
      overlayRef.current.style.backgroundColor = currentColor;

      onRevealStart?.();

      const tl = gsap.timeline({
        onComplete: () => {
          if (menuRef.current) {
            gsap.set(menuRef.current, { visibility: 'hidden' });
          }
          
          if (overlayRef.current) {
            overlayRef.current.style.backgroundColor = '';
          }
          isAnimating.current = false;
          if (pendingNavRef.current) {
            const nav = pendingNavRef.current;
            pendingNavRef.current = null;
            onClose();
            triggerTransition({ href: nav.href, origin: { x: nav.x, y: nav.y }, payload: { accent: nav.accent } });
          }
          
          onCloseComplete?.();
        }
      });

      tl.to(locationText, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 0.05)
      // 3. Social links stagger out
      .to(socialLinks, {
        opacity: 0,
        y: 30,
        duration: 0.3,
        stagger: { each: 0.04, from: 'end' },
        ease: 'power2.in',
      }, 0.1)
      // 4. Social labels slide out
      .to(socialLabels, {
        opacity: 0,
        x: 20,
        duration: 0.3,
        stagger: { each: 0.05, from: 'end' },
        ease: 'power2.in',
      }, 0.15)
      // 5. Numbers fade out
      .to(linkNumbers, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        stagger: { each: 0.03, from: 'end' },
        ease: 'power2.in',
      }, 0.1)
      // 6. Links stagger down (reverse order)
      .to(links, {
        y: '110%',
        duration: 0.5,
        stagger: { each: 0.05, from: 'end' },
        ease: MENU_EASE,
      }, 0.2)
      // 7. Overlay clips out (delayed until content exits)
      .to(overlayRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.7,
        ease: MENU_EASE,
      }, 0.5);
    }
  }, [isOpen, onClose, onCloseComplete, onRevealStart, triggerTransition]);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isAnimating.current) {
      e.preventDefault();
      pendingNavRef.current = { href, accent: currentAccent, x: e.clientX, y: e.clientY };
      return;
    }

    if (!href.startsWith('#')) {
      e.preventDefault();
      onClose();
      if (href !== pathname) {
        triggerTransition({
          href,
          origin: { x: e.clientX, y: e.clientY },
          payload: { accent: currentAccent },
        });
      }
      return;
    }

    if (href.startsWith('#') && pathname !== '/') {
      e.preventDefault();
      onClose();
      triggerTransition({
        href: '/' + href,
        origin: { x: e.clientX, y: e.clientY },
        payload: { accent: currentAccent },
      });
      return;
    }

    e.preventDefault();
    onClose();

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
      if (href === '#contact') {

        scrollTimeoutRef.current = scrollToContactReveal(scrollTo) ?? null;
      } else if (href === '#projects') {

        scrollTimeoutRef.current = scrollToProjectsReveal(scrollTo) ?? null;
      } else {
        scrollTo(href, { duration: 1.8 }); 
      }
    }, 800);
  }, [onClose, scrollTo, pathname, triggerTransition, currentAccent]);

  return (
    <div ref={menuRef} id="main-menu" className={`${styles.menu} ${isOpen ? styles.isOpen : ''}`}>
      <div ref={overlayRef} className={styles.overlay} />

      <div className={styles.menuContent} data-lenis-prevent="">
        <nav className={styles.nav} role="navigation" aria-label="Main menu">
          <ul ref={linksContainerRef} className={styles.linkList}>
            {menuLinks.map((link, index) => (
              <li key={link.href} className={styles.linkItem}>
                <div className={styles.linkMask}>
                  <a
                    href={link.href}
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <span className={styles.linkNumber}>0{index + 1}</span>
                    <span className={styles.linkInner}>
                      <span className={styles.linkText}>{link.label}</span>
                      <span className={styles.linkFill} aria-hidden="true">{link.label}</span>
                    </span>
                  </a>
                </div>
                <p className={styles.linkDesc}>{link.desc}</p>
              </li>
            ))}
          </ul>
        </nav>

        <aside ref={socialSectionRef} className={styles.socialSection}>
          <div className={styles.socialGroup}>
            <span className={styles.socialLabel}>
              Social Presence
              <span className={styles.socialSubLabel}>[currently in a deprecated situation]</span>
            </span>
            <ul className={styles.socialList}>
              {socialLinks.map((social) => (
                <li key={social.label} className={styles.socialItem}>
                  <a
                    href={social.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isOpen ? 0 : -1}
                    aria-label={`${social.label} (opens in a new tab)`}
                  >
                    
                    <span className={styles.socialTextBase}>
                      {social.label.split('').map((char, index) => (
                        <span
                          key={`${char}-${index}`}
                          className={styles.socialChar}
                          style={{ transitionDelay: `${index * 0.025}s` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                    
                    <span className={styles.socialTextClone} aria-hidden="true">
                      {social.label.split('').map((char, index) => (
                        <span
                          key={`${char}-${index}`}
                          className={styles.socialChar}
                          style={{ transitionDelay: `${index * 0.025}s` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.locationGroup}>
            <span className={styles.socialLabel}>Location</span>
            <p className={styles.locationText}>
              {navigation.location.split(',').map((part, i) => (
                <span key={i}>{part.trim()}{i === 0 && <br />}</span>
              ))}
              <span className={styles.flirtyLine}>
                basically in your heart baby...
                <span className={styles.flirtyEmoji}>
                  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                    <ellipse className={styles.emojiBlush} cx="26" cy="58" rx="10" ry="5" fill="#ff7597" />
                    <ellipse className={styles.emojiBlush} cx="74" cy="58" rx="10" ry="5" fill="#ff7597" />
                    <circle className={styles.emojiLeftEyeOpen} cx="30" cy="45" r="7" fill="currentColor" />
                    <path className={styles.emojiLeftEyeWink} d="M 20 48 Q 30 40 40 48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    <circle className={styles.emojiRightEye} cx="70" cy="45" r="7" fill="currentColor" />
                    <path className={styles.emojiMouthSmile} d="M 38 65 Q 50 78 62 65" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    <path className={styles.emojiMouthKiss} d="M 44 67 Q 50 61 56 67" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                    <path className={styles.emojiHeart} d="M 50 60 C 47.5 56.5, 41 56.5, 41 61.5 C 41 66, 50 71.5, 50 71.5 C 50 71.5, 59 66, 59 61.5 C 59 56.5, 52.5 56.5, 50 60" fill="#ff3b30" />
                  </svg>
                </span>
              </span>
            </p>
          </div>

        </aside>
      </div>
    </div>
  );
}

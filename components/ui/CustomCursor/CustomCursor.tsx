'use client';

import { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { features } from '@/data';
import { cursorBus } from '@/lib/cursorBus';
import styles from './CustomCursor.module.css';

const cursorConfig = features.customCursor;
const TRAIL_CONFIG = {
  count: cursorConfig.trail.count,
  colors: [
    cursorConfig.trail.colors.primary,
    'var(--color-accent-purple)', // Uses CSS variable for dynamic accent
    cursorConfig.trail.colors.secondary,
    cursorConfig.trail.colors.tertiary,
  ],
  sizes: cursorConfig.trail.sizes,
  lerpFactors: cursorConfig.trail.lerpFactors,
};

interface TrailSphere {
  element: HTMLDivElement | null;
  pos: { x: number; y: number };
  lerpFactor: number;
}

export function CustomCursor() {
  const pathname = usePathname();
  const isArcade = pathname?.startsWith('/arcade') || false;

  const cursorRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const trailSpheresRef = useRef<TrailSphere[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const isHoveringRef = useRef(false);

  const isArcadeRef = useRef(isArcade);
  useEffect(() => {
    isArcadeRef.current = isArcade;
  }, [isArcade]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (isArcade) {
      
      gsap.to(cursor, {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      
      gsap.to(cursor, {
        xPercent: -50,
        yPercent: -50,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [isArcade]);

  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const hasMovedMouse = useRef(false);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMoving = useRef(false);
  const isSpotlightActive = useRef(false);
  const movementTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBurst = useRef(false);

  const tickerActiveRef = useRef(false);
  const animateFnRef = useRef<(() => void) | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trailVisibleRef = useRef(false);

  const lerpFactor = 0.15;

  useEffect(() => {
    const cursor = cursorRef.current;
    const trailContainer = trailContainerRef.current;

    if (!cursor || !trailContainer) return;

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const triggerBurst = () => {
      if (hasBurst.current || isSpotlightActive.current) return;
      hasBurst.current = true;

      trailVisibleRef.current = false;

      trailSpheresRef.current.forEach((sphere, index) => {
        if (sphere.element) {
          const delay = index * 0.03;

          gsap.to(sphere.element, {
            x: cursorPos.current.x,
            y: cursorPos.current.y,
            scale: 0,
            opacity: 0,
            duration: 0.3,
            delay,
            ease: 'power3.in',
          });
        }
      });

      gsap.timeline()
        .to(cursor, {
          scale: 1.5,
          transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
          duration: 0.15,
          delay: 0.1,
          ease: 'power2.out',
        })
        .to(cursor, {
          scale: 1,
          transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorBus.x = e.clientX;
      cursorBus.y = e.clientY;

      if (!hasMovedMouse.current) {
        hasMovedMouse.current = true;
        cursorPos.current = { x: e.clientX, y: e.clientY };

        trailSpheresRef.current.forEach(sphere => {
          sphere.pos = { x: e.clientX, y: e.clientY };
        });

        setIsVisible(true);
      }

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        isMoving.current = true;
        hasBurst.current = false;

        if (!isSpotlightActive.current && !trailVisibleRef.current) {
          trailVisibleRef.current = true;
          trailSpheresRef.current.forEach(sphere => {
            if (sphere.element) {

              gsap.killTweensOf(sphere.element, 'opacity,scale');
              gsap.to(sphere.element, {
                opacity: 1,
                scale: 1,
                duration: 0.2,
                ease: 'power2.out',
              });
            }
          });
        }

        if (movementTimeout.current) {
          clearTimeout(movementTimeout.current);
        }

        movementTimeout.current = setTimeout(() => {
          isMoving.current = false;
          triggerBurst();
        }, 100);
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };

      startTicker();
    };

    trailSpheresRef.current = TRAIL_CONFIG.colors.map((color, index) => {
      const element = document.createElement('div');
      element.className = styles.trailSphere;
      element.style.backgroundColor = color;
      element.style.width = `${TRAIL_CONFIG.sizes[index]}px`;
      element.style.height = `${TRAIL_CONFIG.sizes[index]}px`;
      element.style.opacity = '0';
      trailContainer.appendChild(element);

      return {
        element,
        pos: { x: 0, y: 0 },
        lerpFactor: TRAIL_CONFIG.lerpFactors[index],
      };
    });

    const handleMouseDown = () => {
      if (isArcadeRef.current) {
        gsap.to(cursor, {
          scale: 0.85,
          transformOrigin: '0% 0%',
          duration: 0.1,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseUp = () => {
      if (isArcadeRef.current) {
        gsap.to(cursor, {
          scale: isHoveringRef.current ? 1.15 : 1,
          transformOrigin: '0% 0%',
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('pointerup', handleMouseUp);

    gsap.set(cursor, {
      xPercent: isArcadeRef.current ? 0 : -50,
      yPercent: isArcadeRef.current ? 0 : -50,
    });
    trailSpheresRef.current.forEach(sphere => {
      if (sphere.element) gsap.set(sphere.element, { xPercent: -50, yPercent: -50 });
    });

    type QuickSetter = (value: number) => void;
    const setCursorX = gsap.quickSetter(cursor, 'x', 'px') as QuickSetter;
    const setCursorY = gsap.quickSetter(cursor, 'y', 'px') as QuickSetter;
    const trailSetters = trailSpheresRef.current.map(sphere => ({
      setX: sphere.element ? (gsap.quickSetter(sphere.element, 'x', 'px') as QuickSetter) : null,
      setY: sphere.element ? (gsap.quickSetter(sphere.element, 'y', 'px') as QuickSetter) : null,
    }));

    window.addEventListener('mousemove', handleMouseMove);

    const startTicker = () => {
      if (!tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.add(animateFnRef.current);
        tickerActiveRef.current = true;
      }
    };

    const stopTicker = () => {
      if (tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
        tickerActiveRef.current = false;
      }
    };

    const scheduleIdleCheck = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {

        const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
        const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
        if (dx < 1 && dy < 1) {
          stopTicker();
        }
      }, 150);
    };

    const SUBPIXEL = 0.1;
    const animate = () => {
      if (!hasMovedMouse.current) return;

      const newCx = cursorPos.current.x + (mousePos.current.x - cursorPos.current.x) * lerpFactor;
      const newCy = cursorPos.current.y + (mousePos.current.y - cursorPos.current.y) * lerpFactor;
      if (Math.abs(newCx - cursorPos.current.x) > SUBPIXEL || Math.abs(newCy - cursorPos.current.y) > SUBPIXEL) {
        cursorPos.current.x = newCx;
        cursorPos.current.y = newCy;
        setCursorX(newCx);
        setCursorY(newCy);

        if (isSpotlightActive.current) {
          document.documentElement.style.setProperty('--cursor-x', `${newCx}px`);
          document.documentElement.style.setProperty('--cursor-y', `${newCy}px`);
        }
      }

      trailSpheresRef.current.forEach((sphere, index) => {
        const setters = trailSetters[index];
        if (!sphere.element || !setters?.setX || !setters?.setY) return;

        const target = index === 0
          ? cursorPos.current
          : trailSpheresRef.current[index - 1].pos;

        const newX = sphere.pos.x + (target.x - sphere.pos.x) * sphere.lerpFactor;
        const newY = sphere.pos.y + (target.y - sphere.pos.y) * sphere.lerpFactor;
        if (Math.abs(newX - sphere.pos.x) > SUBPIXEL || Math.abs(newY - sphere.pos.y) > SUBPIXEL) {
          sphere.pos.x = newX;
          sphere.pos.y = newY;
          setters.setX(newX);
          setters.setY(newY);
        }
      });

      const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
      const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
      if (dx < 1 && dy < 1) {
        scheduleIdleCheck();
      }
    };

    animateFnRef.current = animate;

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorPos.current = { x: e.clientX, y: e.clientY };
      trailSpheresRef.current.forEach(sphere => {
        sphere.pos = { x: e.clientX, y: e.clientY };
      });
      setIsVisible(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const handleLinkHover = () => {
      if (isArcadeRef.current) {
        gsap.to(cursor, {
          rotation: -70,
          scale: 1.15,
          transformOrigin: '0% 0%',
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(cursor, {
          scale: 2,
          transformOrigin: '50% 50%',
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      trailSpheresRef.current.forEach((sphere, index) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            scale: 1.5,
            duration: 0.3,
            delay: index * 0.02,
            ease: 'power2.out',
          });
        }
      });
    };

    const handleLinkLeave = () => {
      if (isArcadeRef.current) {
        gsap.to(cursor, {
          rotation: 0,
          scale: 1,
          transformOrigin: '0% 0%',
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(cursor, {
          scale: 1,
          transformOrigin: '50% 50%',
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      trailSpheresRef.current.forEach((sphere) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    };

    const handleSpotlightEnter = (e: Event) => {
      const customEvent = e as CustomEvent<{ size: number }>;
      const spotlightSize = customEvent.detail?.size || 100;

      isSpotlightActive.current = true;

      document.documentElement.style.setProperty('--spotlight-active', '1');
      document.documentElement.style.setProperty('--spotlight-size', `${spotlightSize / 2}px`);

      cursorPos.current.x = mousePos.current.x;
      cursorPos.current.y = mousePos.current.y;
      document.documentElement.style.setProperty('--cursor-x', `${mousePos.current.x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${mousePos.current.y}px`);
      
      startTicker();

      gsap.to(cursor, {
        scale: 1.5, // Slight scale up before disappearing for effect
        opacity: 0,
        transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
        duration: 0.2,
        ease: 'power2.out',
      });

      trailSpheresRef.current.forEach((sphere) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            opacity: 0,
            scale: 0.5,
            duration: 0.2,
            ease: 'power2.out',
          });
        }
      });

      trailVisibleRef.current = false;
    };

    const handleSpotlightLeave = () => {
      isSpotlightActive.current = false;

      document.documentElement.style.setProperty('--spotlight-active', '0');
      document.documentElement.style.setProperty('--spotlight-size', '0px');

      gsap.to(cursor, {
        scale: 1,
        opacity: 1,
        transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
        duration: 0.3,
        ease: 'power2.out',
      });

      // Trail will reappear naturally on next movement
    };

    const handleScratchcardEnter = () => {
      gsap.to(cursor, {
        opacity: 0,
        transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
        duration: 0.2,
        ease: 'power2.out',
      });

      trailSpheresRef.current.forEach((sphere) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
          });
        }
      });
    };

    const handleScratchcardLeave = () => {
      gsap.to(cursor, {
        opacity: 1,
        transformOrigin: isArcadeRef.current ? '0% 0%' : '50% 50%',
        duration: 0.3,
        ease: 'power2.out',
      });
      trailVisibleRef.current = false;
    };

    window.addEventListener('tagline-spotlight-enter', handleSpotlightEnter);
    window.addEventListener('tagline-spotlight-leave', handleSpotlightLeave);
    window.addEventListener('scratchcard-hover-enter', handleScratchcardEnter);
    window.addEventListener('scratchcard-hover-leave', handleScratchcardLeave);
    window.addEventListener('canvas-hover-enter', handleScratchcardEnter);
    window.addEventListener('canvas-hover-leave', handleScratchcardLeave);

    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select';

    const handleInteractiveEnter = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const entered = target.closest(INTERACTIVE_SELECTOR);
      if (!entered) return;
      
      const related = e.relatedTarget;
      if (related instanceof Element && related.closest(INTERACTIVE_SELECTOR) === entered) return;
      isHoveringRef.current = true;
      handleLinkHover();
    };

    const handleInteractiveLeave = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const left = target.closest(INTERACTIVE_SELECTOR);
      if (!left) return;

      const related = e.relatedTarget;
      if (related instanceof Element) {
        const relatedInteractive = related.closest(INTERACTIVE_SELECTOR);
        if (relatedInteractive === left) return;
        if (relatedInteractive) return;
      }
      isHoveringRef.current = false;
      handleLinkLeave();
    };

    document.addEventListener('pointerover', handleInteractiveEnter);
    document.addEventListener('pointerout', handleInteractiveLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('tagline-spotlight-enter', handleSpotlightEnter);
      window.removeEventListener('tagline-spotlight-leave', handleSpotlightLeave);
      window.removeEventListener('scratchcard-hover-enter', handleScratchcardEnter);
      window.removeEventListener('scratchcard-hover-leave', handleScratchcardLeave);
      window.removeEventListener('canvas-hover-enter', handleScratchcardEnter);
      window.removeEventListener('canvas-hover-leave', handleScratchcardLeave);

      if (animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
      }
      tickerActiveRef.current = false;

      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }

      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      document.removeEventListener('pointerover', handleInteractiveEnter);
      document.removeEventListener('pointerout', handleInteractiveLeave);

      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointerup', handleMouseUp);

      trailSpheresRef.current.forEach(sphere => {
        if (sphere.element && sphere.element.parentNode) {
          sphere.element.parentNode.removeChild(sphere.element);
        }
      });
    };
  }, []);

  return (
    <>
      
      <div
        ref={trailContainerRef}
        className={styles.trailContainer}
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        aria-hidden="true"
      />
      
      <div
        className={`${styles.cursorWrapper} ${isArcade ? styles.arcadeWrapper : ''}`}
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
          mixBlendMode: isArcade ? 'normal' : undefined
        }}
        aria-hidden="true"
      >
        <div
          ref={cursorRef}
          className={`${styles.cursor} ${isArcade ? styles.arcadeCursor : ''}`}
          style={isArcade ? {
            backgroundColor: 'transparent',
            borderRadius: '0',
            width: '64px',
            height: '64px'
          } : undefined}
        >
          {isArcade && (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="metallicTip" x1="0" y1="0" x2="12" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3d40" />
                  <stop offset="50%" stopColor="#5d6368" />
                  <stop offset="100%" stopColor="#181a1b" />
                </linearGradient>
                <linearGradient id="bodyGradient" x1="15" y1="0" x2="47" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#222325" />
                  <stop offset="40%" stopColor="#43484c" />
                  <stop offset="70%" stopColor="#2d3032" />
                  <stop offset="100%" stopColor="#111213" />
                </linearGradient>
                <linearGradient id="transmitterGradient" x1="47" y1="0" x2="55" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(0, 240, 255, 0.4)" />
                  <stop offset="100%" stopColor="rgba(189, 0, 255, 0.4)" />
                </linearGradient>
              </defs>
              <g transform="rotate(45)">
                
                <path d="M 0 0 L 12 -4 L 12 4 Z" fill="url(#metallicTip)" />

                <path d="M 0 0 L 10 -1 L 10 1 Z" fill="#00f0ff" />

                <rect x="12" y="-4.5" width="3" height="9" fill="#151617" stroke="#00f0ff" strokeWidth="0.5" />

                <rect x="15" y="-5" width="32" height="10" rx="1.5" fill="url(#bodyGradient)" />

                <line x1="18" y1="-2.5" x2="35" y2="-2.5" stroke="#00f0ff" strokeWidth="0.75" strokeDasharray="3,1" />

                <line x1="21" y1="2.5" x2="38" y2="2.5" stroke="#bd00ff" strokeWidth="0.75" strokeDasharray="4,2" />

                <rect x="26" y="-2" width="6" height="4" rx="0.5" className={styles.pulseLed} />

                <rect x="47" y="-4" width="8" height="8" rx="2" fill="url(#transmitterGradient)" stroke="#00f0ff" strokeWidth="0.5" />

                <path d="M 49 0 L 51 -2 L 53 2 L 55 0" fill="none" stroke="#bd00ff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsap';
import { transitionsConfig, features, getAccentColors } from '@/data';
import { useScrollLock } from '@/lib/useScrollLock';
import { useLenis } from '@/lib/LenisProvider';
import { scrollToContactReveal } from '@/lib/scrollToContactReveal';
import { scrollToProjectsReveal } from '@/lib/scrollToProjectsReveal';
import {
  isKnownEffect,
  TRANSITION_EFFECT_NAMES,
  type TransitionEffectName,
} from './registry';
import type {
  TransitionContextValue,
  TransitionPayload,
  TransitionPhase,
  TriggerTransitionArgs,
} from './types';

type State =
  | { kind: 'idle' }
  | {
      kind: 'exit' | 'pending';
      effect: TransitionEffectName;
      href: string;
      target: string; 
      origin: { x: number; y: number } | null;
      payload: TransitionPayload;
    };

interface InternalContextValue extends TransitionContextValue {
  state: State;
  onPhaseComplete: (phase: TransitionPhase) => void;
}

export const TransitionContext = createContext<InternalContextValue | null>(null);

const CSS_VAR = features.accentColorRotation.cssVariableName;

const EFFECT_OVERRIDE_KEY = 'transition-effect-override';

export const readEffectOverride = (): TransitionEffectName | null => {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(EFFECT_OVERRIDE_KEY);
    return v && isKnownEffect(v) ? v : null;
  } catch {
    return null;
  }
};

export const writeEffectOverride = (
  name: TransitionEffectName | null
): void => {
  if (typeof window === 'undefined') return;
  try {
    if (name === null) {
      window.localStorage.removeItem(EFFECT_OVERRIDE_KEY);
    } else {
      window.localStorage.setItem(EFFECT_OVERRIDE_KEY, name);
    }
  } catch {
    /* localStorage unavailable — silently no-op */
  }
};

export const resolveDefaultEffect = (): TransitionEffectName => {
  const o = readEffectOverride();
  if (o) return o;
  if (isKnownEffect(transitionsConfig.defaultEffect)) {
    return transitionsConfig.defaultEffect;
  }
  return TRANSITION_EFFECT_NAMES[0] ?? ('iris-bloom' as TransitionEffectName);
};

const normalizePath = (href: string): string => {
  
  try {

    const u = new URL(href, 'http://_');
    return u.pathname || '/';
  } catch {
    return href;
  }
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [isPageReady, setIsPageReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { scrollTo } = useLenis();

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useScrollLock(state.kind !== 'idle', { compensateScrollbar: true });

  useEffect(() => {
    if (state.kind === 'idle') return;
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      setIsPageReady(false);
      setState({ kind: 'idle' });
    }, 6000);
    return () => clearTimeout(t);
  }, [state.kind]);

  const triggerTransition = useCallback(
    ({ href, origin = null, payload, effect }: TriggerTransitionArgs) => {
      if (state.kind !== 'idle') return; 

      if (normalizePath(href) === normalizePath(pathnameRef.current ?? '/')) {
        router.push(href);
        return;
      }

      const resolved: TransitionEffectName = (() => {
        
        if (effect && isKnownEffect(effect)) return effect;
        
        const override = readEffectOverride();
        if (override) return override;
        
        if (isKnownEffect(transitionsConfig.defaultEffect)) {
          return transitionsConfig.defaultEffect;
        }

        router.push(href);
        return TRANSITION_EFFECT_NAMES[0] ?? ('iris-bloom' as TransitionEffectName);
      })();

      if (payload.accent) {
        const palette = getAccentColors();
        const incoming = payload.accent.toLowerCase();

        const canonical = palette.find((c) => c.toLowerCase() === incoming);
        if (canonical) {
          document.documentElement.style.setProperty(CSS_VAR, canonical);
        }
      }

      setIsPageReady(false);
      setState({
        kind: 'exit',
        effect: resolved,
        href,
        target: normalizePath(href),
        origin,
        payload,
      });
    },
    [state.kind, router]
  );

  const markPageReady = useCallback((path: string) => {
    const s = stateRef.current;
    if (s.kind !== 'idle' && normalizePath(path) === s.target) {
      setIsPageReady(true);
    }
  }, []);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onPhaseComplete = useCallback(
    (phase: TransitionPhase) => {
      const s = stateRef.current;
      if (s.kind === 'idle') return;

      if (phase === 'exit' && s.kind === 'exit') {

        setState({ ...s, kind: 'pending' });
        router.push(s.href);
        return;
      }

      if (phase === 'enter' && s.kind === 'pending') {

        ScrollTrigger.refresh();

        try {
          const u = new URL(s.href, 'http://_');
          if (u.hash) {
            requestAnimationFrame(() => {

              if (u.hash === '#contact') {
                scrollToContactReveal(scrollTo);
                return;
              }
              if (u.hash === '#projects') {

                scrollToProjectsReveal(scrollTo);
                return;
              }
              const el = document.querySelector(u.hash);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        } catch {
          /* malformed href — skip hash scroll */
        }

        setIsPageReady(false);
        setState({ kind: 'idle' });
      }
    },
    [router, scrollTo]
  );

  const triggerRef = useRef(triggerTransition);
  useEffect(() => {
    triggerRef.current = triggerTransition;
  }, [triggerTransition]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname || !pathname.startsWith('/work/')) return;

    const caseStudyUrl = window.location.href;

    const onPopState = () => {

      if (window.location.pathname.startsWith('/work/')) return;

      if (stateRef.current.kind !== 'idle') return;

      window.history.pushState(null, '', caseStudyUrl);

      const live = getComputedStyle(document.documentElement)
        .getPropertyValue(CSS_VAR)
        .trim();
      const palette = getAccentColors();

      triggerRef.current({
        href: '/',
        origin: null,
        payload: { accent: live || palette[0] || '#1b2028' },
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [pathname]);

  const hasEntered =
    state.kind === 'idle' ||
    (state.kind === 'pending' && normalizePath(pathname ?? '/') === state.target && isPageReady);

  useEffect(() => {
    if (!hasEntered) return;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [hasEntered]);

  const value = useMemo<InternalContextValue>(
    () => ({
      isTransitioning: state.kind !== 'idle',
      triggerTransition,
      markPageReady,
      isPageReady,
      hasEntered,
      state,
      onPhaseComplete,
    }),
    [state, triggerTransition, markPageReady, isPageReady, hasEntered, onPhaseComplete]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { designTokens, features } from '@/data';

const ACCENT_COLORS = designTokens.colors.accentPalette;

const DEFAULT_INDEX = Math.min(
  features.accentColorRotation.defaultColorIndex,
  ACCENT_COLORS.length - 1
);
const STORAGE_KEY = features.welcomeScreen.storageKey;
const CSS_VAR_NAME = features.accentColorRotation.cssVariableName;

interface AccentColorContextType {
  color: string;
  colorIndex: number;
  cycleColor: () => void;
}

const AccentColorContext = createContext<AccentColorContextType | null>(null);

export function AccentColorProvider({ children }: { children: ReactNode }) {

  const [colorIndex, setColorIndex] = useState(DEFAULT_INDEX);

  useEffect(() => {
    try {
      const hasLoaded = sessionStorage.getItem(STORAGE_KEY);
      if (hasLoaded) {

        setColorIndex(Math.floor(Math.random() * ACCENT_COLORS.length));
      }
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* storage unavailable — treat as in-memory fallback */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.getPropertyValue(CSS_VAR_NAME);
    const next = ACCENT_COLORS[colorIndex];
    if (next) {
      root.style.setProperty(CSS_VAR_NAME, next);
    }
    return () => {
      if (prev) {
        root.style.setProperty(CSS_VAR_NAME, prev);
      } else {
        root.style.removeProperty(CSS_VAR_NAME);
      }
    };
  }, [colorIndex]);

  const cycleColor = useCallback(() => {
    setColorIndex((prev) => (prev + 1) % ACCENT_COLORS.length);
  }, []);

  const value = useMemo<AccentColorContextType>(() => ({
    color: ACCENT_COLORS[colorIndex],
    colorIndex,
    cycleColor,
  }), [colorIndex, cycleColor]);

  return (
    <AccentColorContext.Provider value={value}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor(): AccentColorContextType {
  const context = useContext(AccentColorContext);

  if (!context) {
    throw new Error('useAccentColor must be used within AccentColorProvider');
  }

  return context;
}

export { ACCENT_COLORS };

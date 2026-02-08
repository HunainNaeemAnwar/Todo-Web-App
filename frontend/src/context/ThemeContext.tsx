'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

/**
 * ============================================================================
 * LUXURY THEME CONTEXT v2.0
 * Supports: Light, Dark, and Luxury (Midnight Blue) modes
 * ============================================================================
 */

export type ThemeMode = 'light' | 'dark' | 'luxury';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'taskflow-luxury-theme'
}: {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored) {
      // eslint-disable-next-line
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // eslint-disable-next-line
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);

    // Update color-scheme meta tag for system UI consistency
    const colorScheme = theme === 'light' ? 'light' : 'dark';
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', colorScheme);
  }, [theme, mounted, storageKey]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'luxury';
      return 'light';
    });
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

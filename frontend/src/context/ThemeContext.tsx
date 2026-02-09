'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

/**
 * ============================================================================
 * THEME CONTEXT v5.0 - FINAL
 * Supports: Luxury (Gold) | Dark (Electric) | Light (Clean)
 * Matches design-tokens.ts exactly
 * ============================================================================
 */

export type ThemeMode = 'luxury' | 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLuxury: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'app-theme-v5';

export function ThemeProvider({ 
  children, 
  defaultTheme = 'luxury' 
}: { 
  children: ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    
    if (stored && ['luxury', 'dark', 'light'].includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove old theme
    root.removeAttribute('data-theme');
    
    // Apply new theme
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update color-scheme meta
    const colorScheme = theme === 'light' ? 'light' : 'dark';
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', colorScheme);
    }

    // Toggle dark class for Tailwind
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      // Cycle: luxury -> dark -> light -> luxury
      if (prev === 'luxury') return 'dark';
      if (prev === 'dark') return 'light';
      return 'luxury';
    });
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark' || theme === 'luxury',
    isLuxury: theme === 'luxury',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
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
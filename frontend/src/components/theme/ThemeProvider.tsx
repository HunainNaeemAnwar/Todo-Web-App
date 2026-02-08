'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // eslint-disable-next-line
  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      // eslint-disable-next-line
      setThemeState(savedTheme);
    } else {
      // Check for system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // eslint-disable-next-line
      setThemeState(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'orange'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="glass-effect px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'orange' : 'light'} theme`}
    >
      {theme === 'light' && '☀️'}
      {theme === 'dark' && '🌙'}
      {theme === 'orange' && '🧡'}
    </button>
  );
}
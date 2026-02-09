'use client';

import { ThemeMode, useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Crown } from 'lucide-react';
import React from 'react';

/**
 * Theme Toggle Button
 * Cycles through: Luxury (Crown) -> Dark (Moon) -> Light (Sun) -> Luxury
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme, isDark } = useTheme();

  // Dynamic styles based on theme
  const getIcon = () => {
    switch (theme) {
      case 'luxury':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-blue-400" />;
      case 'light':
        return <Sun className="w-5 h-5 text-orange-500" />;
      default:
        return <Moon className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'luxury':
        return 'Luxury Mode';
      case 'dark':
        return 'Dark Mode';
      case 'light':
        return 'Light Mode';
      default:
        return 'Toggle Theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-xl 
        glass-interactive 
        border border-white/10
        transition-all duration-300
        hover:scale-105 active:scale-95
        ${isDark ? 'text-white hover:text-amber-300' : 'text-slate-800 hover:text-indigo-600'}
      `}
      title={getLabel()}
      aria-label={`Current theme: ${theme}. Click to switch.`}
    >
      <div className="relative flex items-center justify-center">
        {getIcon()}
        
        {/* Glow effect for luxury mode */}
        {theme === 'luxury' && (
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse" />
        )}
      </div>
      
      {/* Optional: Show theme name on hover */}
      <span className="sr-only">{getLabel()}</span>
    </button>
  );
}

/**
 * Alternative: Text-based toggle with full theme name
 */
export function ThemeToggleText() {
  const { theme, setTheme } = useTheme();

  const themes: ThemeMode[] = ['luxury', 'dark', 'light'];
  
  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'luxury': return '👑';
      case 'dark': return '🌙';
      case 'light': return '☀️';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'luxury': return 'Luxury';
      case 'dark': return 'Dark';
      case 'light': return 'Light';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full
        glass-btn text-sm font-medium
        transition-all duration-300
        hover:scale-105
      `}
      aria-label={`Switch theme. Current: ${theme}`}
    >
      <span>{getThemeIcon()}</span>
      <span className="capitalize">{getThemeLabel()}</span>
    </button>
  );
}
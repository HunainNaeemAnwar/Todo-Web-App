/**
 * ============================================================================
 * ULTRA-LUXURY DESIGN TOKENS v3.0
 * Aesthetic: Liquid Glass / Midnight Sapphire
 *
 * Built with specialized skills:
 * - frontend-design-pro: Bold Aesthetic Direction
 * - tailwindcss-advanced-design-systems: OKLCH & Semantic Tokens
 * ============================================================================
 */

export const tokens = {
  // We use OKLCH for high-fidelity colors with consistent perceived lightness
  colors: {
    // Primary Depth (Midnight Blue base)
    depth: {
      950: 'oklch(0.12 0.04 260)', // Deepest Void
      900: 'oklch(0.18 0.06 260)', // Midnight Base
      800: 'oklch(0.25 0.08 260)', // Dark Sapphire
      700: 'oklch(0.35 0.10 260)', // Navy Depth
    },

    // Vibrant Accents (Signature Detail)
    accent: {
      primary: 'oklch(0.75 0.25 190)',   // Radiant Electric Blue
      secondary: 'oklch(0.70 0.20 220)', // Sapphire Glow
      cyan: 'oklch(0.85 0.15 195)',      // Neon Cyan
      indigo: 'oklch(0.60 0.22 275)',    // Luxury Indigo
      glow: 'rgba(0, 238, 255, 0.4)',
    },

    // Modern Neutrals
    neutrals: {
      slate: 'oklch(0.45 0.02 260)',
      grey: 'oklch(0.65 0.02 260)',
      lavender: 'oklch(0.85 0.04 265)',
      glassBase: 'rgba(255, 255, 255, 0.03)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
    },

    // Semantic Status (OKLCH Optimized)
    status: {
      success: 'oklch(0.72 0.18 150)',
      warning: 'oklch(0.80 0.18 85)',
      error: 'oklch(0.65 0.22 25)',
      info: 'oklch(0.70 0.18 245)',
    },
  },

  // Premium Glassmorphism Blur (Exponential Scale)
  blur: {
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px', // Deep frosted effect
  },

  // High-End Radius Scale
  radius: {
    xs: '4px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    full: '9999px',
  },

  // Atmospheric Effects (The "Soul" of Glass)
  effects: {
    glow: {
      soft: '0 0 15px oklch(0.75 0.25 190 / 0.2)',
      vibrant: '0 0 30px oklch(0.75 0.25 190 / 0.4)',
      text: '0 0 12px oklch(0.75 0.25 190 / 0.6)',
    },
    shadow: {
      glass: '0 20px 50px rgba(0, 0, 0, 0.4)',
      glassElevated: '0 30px 100px rgba(0, 0, 0, 0.6)',
      inner: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
    },
  },

  // Professional Type System
  typography: {
    fontFamily: {
      display: '"Clash Display", "Inter", system-ui, sans-serif',
      body: '"Satoshi", "-apple-system", "BlinkMacSystemFont", "sans-serif"',
    },
    scale: {
      display: 'clamp(2.5rem, 8vw, 4.5rem)',
      heading1: 'clamp(2rem, 6vw, 3rem)',
      heading2: 'clamp(1.5rem, 4vw, 2.25rem)',
      body: '1rem',
      small: '0.875rem',
    }
  },

  // Cinematic Motion
  motion: {
    transition: {
      fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '400ms cubic-bezier(0.2, 0.8, 0.2, 1)', // Liquid curve
      slow: '700ms cubic-bezier(0.19, 1, 0.22, 1)',   // Cinematic entrance
      spring: '600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }
  }
} as const;

export type ThemeType = 'light' | 'dark' | 'luxury';

export const themeVariables = {
  luxury: {
    bg: '#000A1A', // Ultra Deep Navy
    bgSecondary: '#001226',
    glassBg: 'rgba(0, 10, 26, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#00EEFF',
  }
} as const;

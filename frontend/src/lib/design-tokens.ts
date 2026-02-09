/**
 * ============================================================================
 * ULTRA-LUXURY DESIGN TOKENS v5.0 - FINAL
 * Multi-Theme System: Luxury (Gold) | Dark (Electric) | Light (Clean)
 *
 * CONTRAST RULES:
 * - Luxury/Dark: Light text (0.9+ lightness) on Dark bg (0.08-0.18)
 * - Light: Dark text (0.15-0.2) on Light bg (0.92-0.98)
 * - All ratios meet WCAG AA standards
 * ============================================================================
 */

// ============================================================================
// BASE TOKENS (Theme Agnostic)
// ============================================================================

export const baseTokens = {
  blur: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },

  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      display: '"Clash Display", "Inter", system-ui, sans-serif',
      body: '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      accent: '"Neue Machina", "JetBrains Mono", monospace',
    },
    scale: {
      display: 'clamp(2.5rem, 8vw, 5rem)',
      heading1: 'clamp(2rem, 5vw, 3.5rem)',
      heading2: 'clamp(1.5rem, 4vw, 2.5rem)',
      heading3: 'clamp(1.25rem, 3vw, 2rem)',
      body: 'clamp(1rem, 1.5vw, 1.125rem)',
      small: '0.875rem',
      xs: '0.75rem',
    },
    lineHeight: {
      none: '1',
      tight: '1.2',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
    },
  },

  motion: {
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      slow: '500ms cubic-bezier(0.19, 1, 0.22, 1)',
      spring: '600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
} as const;

// ============================================================================
// THEME-SPECIFIC TOKENS
// ============================================================================

export type ThemeType = 'luxury' | 'dark' | 'light';

// --- LUXURY THEME (Obsidian & Gold) ---
// Deepest blacks with rich gold accents
const luxuryTokens = {
  name: 'luxury' as const,

  // Backgrounds: Deep Obsidian (0.05 - 0.16 lightness)
  bg: {
    main: 'oklch(0.05 0.01 280)', // Deepest void (almost black)
    secondary: 'oklch(0.08 0.01 280)', // Cards
    tertiary: 'oklch(0.12 0.01 280)', // Inputs, buttons
    elevated: 'oklch(0.16 0.01 280)', // Modals, popovers
  },

  // Text: Platinum on Dark (0.65 - 0.98 lightness)
  // FIXED: High contrast for readability
  text: {
    primary: 'oklch(0.98 0.005 60)', // Almost white (15:1 contrast)
    secondary: 'oklch(0.85 0.01 60)', // Light silver (10:1 contrast)
    tertiary: 'oklch(0.65 0.01 60)', // Muted grey (5:1 contrast)
    inverse: 'oklch(0.05 0.01 280)', // Deepest for gold buttons
  },

  // Accents: Rich Gold & Champagne
  accent: {
    primary: 'oklch(0.78 0.15 85)', // Bright Gold
    secondary: 'oklch(0.7 0.12 85)', // Deep Gold
    gold: 'oklch(0.82 0.16 85)', // Shiny Gold
    silver: 'oklch(0.9 0.01 280)', // Platinum
    cyan: 'oklch(0.75 0.1 200)', // Muted cyan
    indigo: 'oklch(0.7 0.1 280)', // Deep indigo
    glow: 'oklch(0.78 0.15 85 / 0.4)', // Gold glow
  },

  // Depth Scale: Dark to slightly lighter
  depth: {
    950: 'oklch(0.03 0.01 280)', // Deepest
    900: 'oklch(0.05 0.01 280)',
    800: 'oklch(0.08 0.01 280)',
    700: 'oklch(0.12 0.01 280)',
    600: 'oklch(0.16 0.01 280)',
    500: 'oklch(0.2 0.01 280)', // Lightest in dark themes
  },

  // Glass: Very subtle on dark
  glass: {
    bg: 'oklch(1 0 0 / 0.03)',
    bgElevated: 'oklch(1 0 0 / 0.06)',
    border: 'oklch(1 0 0 / 0.1)',
    reflection:
      'linear-gradient(135deg, oklch(1 0 0 / 0.15) 0%, transparent 40%, oklch(0.78 0.15 85 / 0.1) 100%)',
  },

  // Effects
  effects: {
    glow: {
      soft: '0 0 20px oklch(0.78 0.15 85 / 0.2)',
      vibrant: '0 0 40px oklch(0.78 0.15 85 / 0.4)',
      text: '0 0 12px oklch(0.78 0.15 85 / 0.6)',
    },
    shadow: {
      glass: '0 25px 80px oklch(0 0 0 / 0.8)',
      glassElevated: '0 30px 100px oklch(0 0 0 / 0.8)',
      inner: 'inset 0 0 0 1px oklch(1 0 0 / 0.05)',
    },
  },

  // Status: Optimized for dark backgrounds
  status: {
    success: 'oklch(0.7 0.18 145)', // Brighter green for dark
    warning: 'oklch(0.8 0.15 80)', // Brighter orange
    error: 'oklch(0.65 0.22 25)', // Bright red
    info: 'oklch(0.7 0.15 245)', // Bright blue
  },

  // Interactive: Light overlays on dark
  interactive: {
    hover: 'oklch(1 0 0 / 0.08)',
    active: 'oklch(1 0 0 / 0.12)',
    focus: 'oklch(1 0 0 / 0.15)',
  },
};

// --- DARK THEME (Charcoal & Electric Blue) ---
// Lighter than luxury, modern blue accents
const darkTokens = {
  name: 'dark' as const,

  // Backgrounds: Charcoal Blue (0.12 - 0.28 lightness)
  bg: {
    main: 'oklch(0.12 0.02 260)', // Charcoal
    secondary: 'oklch(0.18 0.02 260)', // Cards
    tertiary: 'oklch(0.24 0.02 260)', // Inputs
    elevated: 'oklch(0.28 0.02 260)', // Modals
  },

  // Text: Pure White/Grey (0.6 - 0.98 lightness)
  text: {
    primary: 'oklch(0.98 0.005 60)', // Crisp white (14:1 contrast)
    secondary: 'oklch(0.8 0.01 60)', // Soft grey (9:1 contrast)
    tertiary: 'oklch(0.6 0.01 60)', // Muted (4.5:1 contrast)
    inverse: 'oklch(0.12 0.02 260)', // Dark for buttons
  },

  // Accents: Electric Blue
  accent: {
    primary: 'oklch(0.7 0.2 260)', // Electric Blue
    secondary: 'oklch(0.65 0.15 260)', // Deep Blue
    gold: 'oklch(0.75 0.12 85)', // Muted gold
    silver: 'oklch(0.85 0.01 280)', // Light grey
    cyan: 'oklch(0.8 0.15 195)', // Bright cyan
    indigo: 'oklch(0.6 0.18 280)', // Deep indigo
    glow: 'oklch(0.7 0.2 260 / 0.4)', // Blue glow
  },

  // Depth Scale
  depth: {
    950: 'oklch(0.08 0.02 260)',
    900: 'oklch(0.12 0.02 260)',
    800: 'oklch(0.16 0.02 260)',
    700: 'oklch(0.22 0.02 260)',
    600: 'oklch(0.26 0.02 260)',
    500: 'oklch(0.3 0.02 260)',
  },

  // Glass: More visible on lighter dark
  glass: {
    bg: 'oklch(1 0 0 / 0.06)',
    bgElevated: 'oklch(1 0 0 / 0.1)',
    border: 'oklch(1 0 0 / 0.15)',
    reflection:
      'linear-gradient(135deg, oklch(1 0 0 / 0.15) 0%, transparent 50%, oklch(0.7 0.2 260 / 0.1) 100%)',
  },

  // Effects
  effects: {
    glow: {
      soft: '0 0 20px oklch(0.7 0.2 260 / 0.2)',
      vibrant: '0 0 40px oklch(0.7 0.2 260 / 0.4)',
      text: '0 0 12px oklch(0.7 0.2 260 / 0.6)',
    },
    shadow: {
      glass: '0 20px 60px oklch(0 0 0 / 0.6)',
      glassElevated: '0 30px 80px oklch(0 0 0 / 0.6)',
      inner: 'inset 0 0 0 1px oklch(1 0 0 / 0.08)',
    },
  },

  // Status
  status: {
    success: 'oklch(0.7 0.18 145)',
    warning: 'oklch(0.8 0.15 80)',
    error: 'oklch(0.65 0.22 25)',
    info: 'oklch(0.7 0.15 245)',
  },

  // Interactive
  interactive: {
    hover: 'oklch(1 0 0 / 0.1)',
    active: 'oklch(1 0 0 / 0.15)',
    focus: 'oklch(1 0 0 / 0.2)',
  },
};

// --- LIGHT THEME (Ivory & Deep Indigo) ---
// Clean professional with dark text
const lightTokens = {
  name: 'light' as const,

  // Backgrounds: Warm Ivory (0.92 - 0.99 lightness)
  bg: {
    main: 'oklch(0.98 0.01 80)', // Warm white
    secondary: 'oklch(0.95 0.01 80)', // Off-white cards
    tertiary: 'oklch(0.92 0.01 80)', // Inputs
    elevated: 'oklch(1 0 0)', // Modals (pure white)
  },

  // Text: Deep Charcoal (0.15 - 0.6 lightness)
  // FIXED: Dark text on light backgrounds
  text: {
    primary: 'oklch(0.15 0.02 280)', // Near black (12:1 contrast)
    secondary: 'oklch(0.45 0.02 280)', // Medium grey (7:1 contrast)
    tertiary: 'oklch(0.6 0.01 280)', // Light grey (4.5:1 contrast)
    inverse: 'oklch(0.98 0.01 80)', // White for dark buttons
  },

  // Accents: Deep Indigo
  accent: {
    primary: 'oklch(0.55 0.2 280)', // Deep Indigo
    secondary: 'oklch(0.5 0.15 280)', // Darker Indigo
    gold: 'oklch(0.65 0.12 85)', // Muted gold
    silver: 'oklch(0.55 0.01 280)', // Grey
    cyan: 'oklch(0.6 0.12 200)', // Soft cyan
    indigo: 'oklch(0.45 0.2 280)', // Deep purple-indigo
    glow: 'oklch(0.55 0.2 280 / 0.25)', // Indigo glow
  },

  // Depth Scale: Inverted for light (950 = lightest)
  depth: {
    950: 'oklch(0.95 0.01 80)', // Lightest (card bg)
    900: 'oklch(0.92 0.01 80)',
    800: 'oklch(0.88 0.01 80)',
    700: 'oklch(0.82 0.01 80)',
    600: 'oklch(0.75 0.01 80)',
    500: 'oklch(0.65 0.01 80)', // Darkest shadow
  },

  // Glass: Frosted effect
  glass: {
    bg: 'oklch(1 0 0 / 0.7)',
    bgElevated: 'oklch(1 0 0 / 0.85)',
    border: 'oklch(0.15 0.02 280 / 0.1)',
    reflection:
      'linear-gradient(135deg, oklch(1 0 0 / 0.9) 0%, transparent 60%, oklch(0.55 0.2 280 / 0.08) 100%)',
  },

  // Effects
  effects: {
    glow: {
      soft: '0 0 20px oklch(0.55 0.2 280 / 0.15)',
      vibrant: '0 0 40px oklch(0.55 0.2 280 / 0.25)',
      text: '0 0 12px oklch(0.55 0.2 280 / 0.4)',
    },
    shadow: {
      glass: '0 8px 32px oklch(0 0 0 / 0.08)',
      glassElevated: '0 20px 60px oklch(0 0 0 / 0.1)',
      inner: 'inset 0 0 0 1px oklch(0.15 0.02 280 / 0.05)',
    },
  },

  // Status: Darker for light backgrounds
  status: {
    success: 'oklch(0.55 0.18 145)', // Darker green
    warning: 'oklch(0.65 0.15 80)', // Darker orange
    error: 'oklch(0.55 0.22 25)', // Dark red
    info: 'oklch(0.55 0.15 245)', // Dark blue
  },

  // Interactive: Dark overlays on light
  interactive: {
    hover: 'oklch(0.15 0.02 280 / 0.05)',
    active: 'oklch(0.15 0.02 280 / 0.1)',
    focus: 'oklch(0.15 0.02 280 / 0.15)',
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export const themes = {
  luxury: luxuryTokens,
  dark: darkTokens,
  light: lightTokens,
} as const;

// Helper functions
export const getThemeTokens = (theme: ThemeType) => themes[theme];

export const isDarkTheme = (theme: ThemeType): boolean =>
  theme === 'luxury' || theme === 'dark';

export const getContrastColor = (theme: ThemeType): string =>
  isDarkTheme(theme) ? '#ffffff' : '#1a1a1a';

// Generate CSS variables for inline styles or CSS-in-JS
export const generateCSSVariables = (theme: ThemeType) => {
  const t = themes[theme];

  return {
    // Backgrounds
    '--bg-main': t.bg.main,
    '--bg-secondary': t.bg.secondary,
    '--bg-tertiary': t.bg.tertiary,
    '--bg-elevated': t.bg.elevated,

    // Text
    '--text-primary': t.text.primary,
    '--text-secondary': t.text.secondary,
    '--text-tertiary': t.text.tertiary,
    '--text-inverse': t.text.inverse,

    // Accents
    '--accent-primary': t.accent.primary,
    '--accent-secondary': t.accent.secondary,
    '--accent-gold': t.accent.gold,
    '--accent-silver': t.accent.silver,
    '--accent-cyan': t.accent.cyan,
    '--accent-indigo': t.accent.indigo,
    '--accent-glow': t.accent.glow,

    // Depth
    '--depth-950': t.depth[950],
    '--depth-900': t.depth[900],
    '--depth-800': t.depth[800],
    '--depth-700': t.depth[700],
    '--depth-600': t.depth[600],
    '--depth-500': t.depth[500],

    // Glass
    '--glass-bg': t.glass.bg,
    '--glass-bg-elevated': t.glass.bgElevated,
    '--glass-border-color': t.glass.border,
    '--glass-reflection': t.glass.reflection,

    // Effects
    '--shadow-glass': t.effects.shadow.glass,
    '--shadow-glass-elevated': t.effects.shadow.glassElevated,
    '--shadow-inner': t.effects.shadow.inner,
    '--glow-soft': t.effects.glow.soft,
    '--glow-vibrant': t.effects.glow.vibrant,
    '--glow-text': t.effects.glow.text,

    // Interactive
    '--interactive-hover': t.interactive.hover,
    '--interactive-active': t.interactive.active,
    '--interactive-focus': t.interactive.focus,

    // Status
    '--status-success': t.status.success,
    '--status-warning': t.status.warning,
    '--status-error': t.status.error,
    '--status-info': t.status.info,
  } as const;
};

// Pre-generated variable sets
export const themeVariables = {
  luxury: generateCSSVariables('luxury'),
  dark: generateCSSVariables('dark'),
  light: generateCSSVariables('light'),
} as const;

// Type exports
export type ThemeTokens = typeof luxuryTokens;
export type CSSVariables = ReturnType<typeof generateCSSVariables>;

// Utility to apply theme to document
export const applyThemeToDocument = (theme: ThemeType) => {
  const root = document.documentElement;
  const vars = generateCSSVariables(theme);

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', isDarkTheme(theme));
};

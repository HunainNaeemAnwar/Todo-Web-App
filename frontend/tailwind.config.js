/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // Fixed: Only dark mode class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        background: 'var(--bg-main)',
        foreground: 'var(--text-primary)',

        // Text colors - FIXED: Consistent naming
        text: {
          primary: 'var(--text-primary)', // Main text (adaptive)
          secondary: 'var(--text-secondary)', // Muted text
          tertiary: 'var(--text-tertiary)', // Subtle text
          inverse: 'var(--text-inverse)', // For buttons/accents
        },

        // Depth scale - FIXED: Consistent across themes
        depth: {
          950: 'var(--depth-950)', // Deepest
          900: 'var(--depth-900)',
          800: 'var(--depth-800)',
          700: 'var(--depth-700)',
          600: 'var(--depth-600)',
          500: 'var(--depth-500)', // Lightest in dark, darkest in light
        },

        // Accents - FIXED: Theme-specific but consistent structure
        accent: {
          primary: 'var(--accent-primary)', // Main accent
          secondary: 'var(--accent-secondary)', // Secondary accent
          gold: 'var(--accent-gold)', // Luxury specific
          silver: 'var(--accent-silver)', // Luxury specific
          cyan: 'var(--accent-cyan)',
          indigo: 'var(--accent-indigo)',
          glow: 'var(--accent-glow)', // Glow color
        },

        // Glass system
        glass: {
          DEFAULT: 'var(--glass-bg)',
          elevated: 'var(--glass-bg-elevated)',
          border: 'var(--glass-border-color)',
        },

        // Status colors - FIXED: Consistent semantic meaning
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          error: 'var(--status-error)',
          info: 'var(--status-info)',
        },

        // Neutrals
        neutral: {
          slate: 'var(--neutral-slate)',
          grey: 'var(--neutral-grey)',
          lavender: 'var(--neutral-lavender)',
        },

        // Interactive states
        interactive: {
          hover: 'var(--interactive-hover)',
          active: 'var(--interactive-active)',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'monospace'],
      },

      backdropBlur: {
        sm: 'var(--blur-sm)',
        md: 'var(--blur-md)',
        lg: 'var(--blur-lg)',
        xl: 'var(--blur-xl)',
      },

      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      boxShadow: {
        glass: 'var(--shadow-glass)',
        glow: 'var(--shadow-glow)',
      },

      animation: {
        shimmer: 'shimmer 3s linear infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        fadeInUp: 'fadeInUp 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },

      transitionTimingFunction: {
        liquid: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        cinematic: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
};

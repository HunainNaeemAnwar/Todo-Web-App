/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        foreground: 'var(--text-primary)',

        // Ultra-Luxury Depth
        depth: {
          950: 'var(--depth-950)',
          900: 'var(--depth-900)',
          800: 'var(--depth-800)',
          700: 'var(--depth-700)',
        },

        // Vibrant Accents
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          cyan: 'var(--accent-cyan)',
          indigo: 'var(--accent-indigo)',
          glow: 'var(--accent-glow)',
        },

        // Glass System
        glass: {
          DEFAULT: 'var(--glass-bg)',
          border: 'var(--glass-border-color)',
        },

        // Semantic Status
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
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
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
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        glow: 'var(--effects-glow-vibrant)',
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        glow: 'pulse-glow 4s ease-in-out infinite',
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
}

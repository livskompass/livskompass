// Shared Tailwind CSS preset for Livskompass V2
// Used by both packages/web and packages/admin for identical rendering

import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const preset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Rubik', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // ── Palette (raw channels, defined in index.css) ──
        forest: {
          50: 'rgb(var(--forest-50) / <alpha-value>)',
          100: 'rgb(var(--forest-100) / <alpha-value>)',
          200: 'rgb(var(--forest-200) / <alpha-value>)',
          300: 'rgb(var(--forest-300) / <alpha-value>)',
          400: 'rgb(var(--forest-400) / <alpha-value>)',
          500: 'rgb(var(--forest-500) / <alpha-value>)',
          600: 'rgb(var(--forest-600) / <alpha-value>)',
          700: 'rgb(var(--forest-700) / <alpha-value>)',
          800: 'rgb(var(--forest-800) / <alpha-value>)',
          900: 'rgb(var(--forest-900) / <alpha-value>)',
          950: 'rgb(var(--forest-950) / <alpha-value>)',
        },
        stone: {
          50: 'rgb(var(--stone-50) / <alpha-value>)',
          100: 'rgb(var(--stone-100) / <alpha-value>)',
          200: 'rgb(var(--stone-200) / <alpha-value>)',
          300: 'rgb(var(--stone-300) / <alpha-value>)',
          400: 'rgb(var(--stone-400) / <alpha-value>)',
          500: 'rgb(var(--stone-500) / <alpha-value>)',
          600: 'rgb(var(--stone-600) / <alpha-value>)',
          700: 'rgb(var(--stone-700) / <alpha-value>)',
          800: 'rgb(var(--stone-800) / <alpha-value>)',
          900: 'rgb(var(--stone-900) / <alpha-value>)',
          950: 'rgb(var(--stone-950) / <alpha-value>)',
        },
        amber: {
          50: 'rgb(var(--amber-50) / <alpha-value>)',
          100: 'rgb(var(--amber-100) / <alpha-value>)',
          200: 'rgb(var(--amber-200) / <alpha-value>)',
          300: 'rgb(var(--amber-300) / <alpha-value>)',
          400: 'rgb(var(--amber-400) / <alpha-value>)',
          500: 'rgb(var(--amber-500) / <alpha-value>)',
          600: 'rgb(var(--amber-600) / <alpha-value>)',
        },

        // ── Semantic role-based colors (reference CSS vars → palette) ──
        foreground: {
          DEFAULT: 'rgb(var(--foreground) / <alpha-value>)',
          strong: 'rgb(var(--foreground-strong) / <alpha-value>)',
        },
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        heading: 'rgb(var(--heading) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          soft: 'rgb(var(--forest-50) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
        },
        highlight: {
          DEFAULT: 'rgb(var(--highlight) / <alpha-value>)',
          soft: 'rgb(var(--highlight-soft) / <alpha-value>)',
        },
        mist: 'rgb(var(--mist) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          alt: 'rgb(var(--surface-alt) / <alpha-value>)',
          elevated: '#ffffff',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      borderColor: {
        DEFAULT: 'rgb(var(--border-default) / <alpha-value>)',
        strong: 'rgb(var(--border-strong) / <alpha-value>)',
        accent: 'rgb(var(--forest-300) / <alpha-value>)',
        focus: 'rgb(var(--accent) / <alpha-value>)',
      },
      boxShadow: {
        xs: '0 1px 2px rgb(var(--forest-950) / 0.05)',
        sm: '0 2px 4px rgb(var(--forest-950) / 0.04), 0 1px 2px rgb(var(--forest-950) / 0.06)',
        md: '0 4px 12px rgb(var(--forest-950) / 0.05), 0 2px 4px rgb(var(--forest-950) / 0.06)',
        lg: '0 8px 24px rgb(var(--forest-950) / 0.07), 0 4px 8px rgb(var(--forest-950) / 0.05)',
        xl: '0 16px 48px rgb(var(--forest-950) / 0.1), 0 8px 16px rgb(var(--forest-950) / 0.05)',
        glow: '0 0 0 1px rgb(var(--stone-500) / 0.15), 0 4px 16px rgb(var(--stone-500) / 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        content: '1280px',
        wide: '1440px',
        narrow: '720px',
        prose: '65ch',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'hero-enter': {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'line-expand': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'warm-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        'hero-enter': 'hero-enter 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
        'line-expand': 'line-expand 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        'warm-pulse': 'warm-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out-smooth': 'cubic-bezier(0.45, 0, 0.55, 1)',
        gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        normal: '350ms',
        slow: '500ms',
        reveal: '700ms',
        dramatic: '1000ms',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--stone-800))',
            '--tw-prose-headings': 'rgb(var(--forest-950))',
            '--tw-prose-links': 'rgb(var(--forest-600))',
            '--tw-prose-bold': 'rgb(var(--stone-950))',
            '--tw-prose-quotes': 'rgb(var(--stone-600))',
            '--tw-prose-quote-borders': 'rgb(var(--forest-300))',
            '--tw-prose-code': 'rgb(var(--stone-800))',
            '--tw-prose-hr': 'rgb(var(--stone-200))',
            maxWidth: '65ch',
            fontSize: '1.0625rem',
            lineHeight: '1.65',
            'h1, h2': {
              fontFamily: "'Rubik', system-ui, -apple-system, sans-serif",
              fontWeight: '400',
            },
            h1: {
              fontSize: 'clamp(2.25rem, 1.625rem + 2.083vw, 3.5rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.025em',
            },
            h2: {
              fontSize: 'clamp(1.75rem, 1.417rem + 1.111vw, 2.5rem)',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            },
            'h3, h4, h5, h6': {
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontWeight: '600',
            },
            h3: {
              fontSize: 'clamp(1.375rem, 1.208rem + 0.556vw, 1.75rem)',
              lineHeight: '1.25',
              letterSpacing: '-0.015em',
            },
            h4: {
              fontSize: 'clamp(1.125rem, 1.042rem + 0.278vw, 1.3125rem)',
              lineHeight: '1.3',
              letterSpacing: '-0.01em',
            },
            a: {
              color: 'rgb(var(--forest-600))',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              textDecorationThickness: '1.5px',
              textDecorationColor: 'rgb(var(--forest-300))',
              '&:hover': {
                textDecorationColor: 'rgb(var(--forest-600))',
              },
            },
            blockquote: {
              borderLeftColor: 'rgb(var(--forest-300))',
              borderLeftWidth: '3px',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'rgb(var(--stone-600))',
            },
            code: {
              backgroundColor: 'rgb(var(--stone-100))',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.9em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            hr: {
              borderColor: 'rgb(var(--stone-200))',
            },
            img: {
              borderRadius: '14px',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}

export default preset

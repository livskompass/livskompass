// Shared Tailwind CSS preset for Livskompass V2
// Used by both packages/web and packages/admin for identical rendering

import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const preset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#ECF5EF',
          100: '#D7E9DD',
          200: '#B0D1BC',
          300: '#84B496',
          400: '#5C9873',
          500: '#3E7B57',
          600: '#326647',
          700: '#275137',
          800: '#1C3D29',
          900: '#132B1C',
          950: '#0A1A10',
        },
        stone: {
          50: '#F8F6F2',
          100: '#EFECE7',
          200: '#E2DFD9',
          300: '#C8C4BC',
          400: '#A9A49B',
          500: '#8A847A',
          600: '#6E685E',
          700: '#575249',
          800: '#403C36',
          900: '#2C2924',
          950: '#1A1816',
        },
        amber: {
          50: '#FBF5EC',
          100: '#F4EADB',
          200: '#EAD5B5',
          300: '#D5B68A',
          400: '#C0955F',
          500: '#B08350', // warmer chroma per UI review R5
          600: '#8C6534',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(28, 25, 23, 0.05)',
        sm: '0 2px 4px rgba(28, 25, 23, 0.04), 0 1px 2px rgba(28, 25, 23, 0.06)',
        md: '0 4px 12px rgba(28, 25, 23, 0.05), 0 2px 4px rgba(28, 25, 23, 0.06)',
        lg: '0 8px 24px rgba(28, 25, 23, 0.07), 0 4px 8px rgba(28, 25, 23, 0.05)',
        xl: '0 16px 48px rgba(28, 25, 23, 0.1), 0 8px 16px rgba(28, 25, 23, 0.05)',
        glow: '0 0 0 1px rgba(138, 132, 122, 0.15), 0 4px 16px rgba(138, 132, 122, 0.1)',
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
            '--tw-prose-body': '#403C36',
            '--tw-prose-headings': '#0A1A10',
            '--tw-prose-links': '#326647',
            '--tw-prose-bold': '#1A1816',
            '--tw-prose-quotes': '#6E685E',
            '--tw-prose-quote-borders': '#84B496',
            '--tw-prose-code': '#403C36',
            '--tw-prose-hr': '#E2DFD9',
            maxWidth: '65ch',
            fontSize: '1.0625rem',
            lineHeight: '1.65',
            'h1, h2': {
              fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
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
              color: '#326647',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              textDecorationThickness: '1.5px',
              textDecorationColor: '#84B496',
              '&:hover': {
                textDecorationColor: '#326647',
              },
            },
            blockquote: {
              borderLeftColor: '#84B496',
              borderLeftWidth: '3px',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: '#6E685E',
            },
            code: {
              backgroundColor: '#EFECE7',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.9em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            hr: {
              borderColor: '#E2DFD9',
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

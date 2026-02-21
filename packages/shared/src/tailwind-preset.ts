// Shared Tailwind CSS preset for Livskompass
// Used by both packages/web and packages/admin for identical rendering

import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const preset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#F2F7F4',
          100: '#E0EDE5',
          200: '#C1DBC9',
          300: '#95C2A4',
          400: '#66A67B',
          500: '#3D6B50',
          600: '#325843',
          700: '#284636',
          800: '#1E352A',
          900: '#15261E',
        },
        accent: {
          50: '#FEF6EE',
          100: '#FCEBD6',
          200: '#F8D3AC',
          300: '#F2B476',
          400: '#E99544',
          500: '#C77E3F',
          600: '#A66733',
          700: '#854F28',
          800: '#653C1E',
          900: '#482B16',
        },
        neutral: {
          50: '#FAFAF7',
          100: '#F5F3EE',
          200: '#EBE8E0',
          300: '#DDD8CD',
          400: '#B8B1A4',
          500: '#8D867A',
          600: '#6B655B',
          700: '#504B43',
          800: '#38342E',
          900: '#231F1B',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [typography],
}

export default preset

// Design tokens for Livskompass V2 visual identity
// These constants can be used in JS/TS code outside of Tailwind

export const colors = {
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
    500: '#B08350',
    600: '#8C6534',
  },
  semantic: {
    success: { fg: '#2F7A42', bg: '#EFF7F1' },
    warning: { fg: '#A67B4A', bg: '#FBF5EC' },
    error: { fg: '#C43B32', bg: '#FEF1F0' },
    info: { fg: '#2E6FA0', bg: '#EFF5FB' },
  },
} as const

export const fonts = {
  display: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
} as const

export const fontUrl =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,400..600&display=swap'

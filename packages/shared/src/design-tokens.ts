// Design tokens for Livskompass visual identity
// These constants can be used in JS/TS code outside of Tailwind

export const colors = {
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
  semantic: {
    success: { fg: '#3D8B52', bg: '#F0F7F2' },
    warning: { fg: '#C89828', bg: '#FEF9EE' },
    error: { fg: '#C4463A', bg: '#FEF2F1' },
    info: { fg: '#3B6FA0', bg: '#F0F5FA' },
  },
} as const

export const fonts = {
  heading: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
} as const

export const fontUrl =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap'

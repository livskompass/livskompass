/** Shared section background system — used across all section-level blocks */

export type SectionBg =
  | 'transparent'
  | 'white'
  | 'surface'
  | 'surface-alt'
  | 'mist'
  | 'accent-soft'
  | 'brand'
  | 'highlight-soft'
  | 'gradient-down'
  | 'gradient-up'
  | 'gradient-mist-down'
  | 'gradient-forest-down'

export const sectionBgOptions = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'White', value: 'white' },
  { label: 'Light (stone-50)', value: 'surface' },
  { label: 'Subtle (stone-100)', value: 'surface-alt' },
  { label: 'Mist (teal)', value: 'mist' },
  { label: 'Accent soft (green-50)', value: 'accent-soft' },
  { label: 'Dark green', value: 'brand' },
  { label: 'Yellow', value: 'highlight-soft' },
  { label: 'Gradient ↓ (white → light)', value: 'gradient-down' },
  { label: 'Gradient ↑ (light → white)', value: 'gradient-up' },
  { label: 'Gradient ↓ mist (mist → white)', value: 'gradient-mist-down' },
  { label: 'Gradient ↓ green (green → white)', value: 'gradient-forest-down' },
]

/** Returns Tailwind className for section background */
export function sectionBgClass(bg: string = 'transparent'): string {
  const map: Record<string, string> = {
    transparent: '',
    white: 'bg-surface-elevated',
    surface: 'bg-surface',
    'surface-alt': 'bg-surface-alt',
    mist: 'bg-mist',
    'accent-soft': 'bg-accent-soft',
    brand: 'bg-brand',
    'highlight-soft': 'bg-highlight-soft',
  }
  return map[bg] || ''
}

/** Returns inline style for gradient backgrounds (Tailwind can't do arbitrary gradients) */
export function sectionBgStyle(bg: string = 'transparent'): React.CSSProperties | undefined {
  const gradients: Record<string, string> = {
    'gradient-down': 'linear-gradient(180deg, #ffffff 0%, rgb(var(--stone-50)) 100%)',
    'gradient-up': 'linear-gradient(180deg, rgb(var(--stone-50)) 0%, #ffffff 100%)',
    'gradient-mist-down': 'linear-gradient(180deg, rgb(var(--mist)) 0%, #ffffff 100%)',
    'gradient-forest-down': 'linear-gradient(180deg, rgb(var(--forest-50)) 0%, #ffffff 100%)',
  }
  if (gradients[bg]) return { background: gradients[bg] }
  return undefined
}

/** Returns text color class for dark backgrounds */
export function sectionTextClass(bg: string = 'transparent'): string {
  if (bg === 'brand') return 'text-white'
  return ''
}

/** Puck field definition for sectionBg prop */
export const sectionBgField = {
  type: 'select' as const,
  label: 'Section background',
  options: sectionBgOptions,
}

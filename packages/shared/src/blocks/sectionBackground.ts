/** Shared section background system — used across all section-level blocks */

export type SectionBg = string

export const sectionBgOptions = [
  // ── Solids ──
  { label: 'Transparent', value: 'transparent' },
  { label: 'White', value: 'white' },
  { label: 'Light (stone-50)', value: 'surface' },
  { label: 'Subtle (stone-100)', value: 'surface-alt' },
  { label: 'Mist (teal)', value: 'mist' },
  { label: 'Light green (forest-50)', value: 'accent-soft' },
  { label: 'Dark green (forest-800)', value: 'brand' },
  { label: 'Darkest green (forest-950)', value: 'darkest' },
  { label: 'Yellow (amber-300)', value: 'highlight-soft' },
  // ── Neutral gradients ──
  { label: '↓ White → Light', value: 'grad-white-light' },
  { label: '↑ Light → White', value: 'grad-light-white' },
  // ── Dark green gradients ──
  { label: '↓ Dark green → Transparent', value: 'grad-brand-transparent' },
  { label: '↑ Transparent → Dark green', value: 'grad-transparent-brand' },
  { label: '↓ Dark green → White', value: 'grad-brand-white' },
  { label: '↑ White → Dark green', value: 'grad-white-brand' },
  { label: '↓ Dark green → Mist', value: 'grad-brand-mist' },
  { label: '↑ Mist → Dark green', value: 'grad-mist-brand' },
  { label: '↓ Dark green → Light green', value: 'grad-brand-accent' },
  // ── Mist (teal) gradients ──
  { label: '↓ Mist → Transparent', value: 'grad-mist-transparent' },
  { label: '↑ Transparent → Mist', value: 'grad-transparent-mist' },
  { label: '↓ Mist → White', value: 'grad-mist-white' },
  { label: '↑ White → Mist', value: 'grad-white-mist' },
  // ── Light green gradients ──
  { label: '↓ Light green → Transparent', value: 'grad-accent-transparent' },
  { label: '↑ Transparent → Light green', value: 'grad-transparent-accent' },
  { label: '↓ Light green → White', value: 'grad-accent-white' },
  // ── Yellow gradients ──
  { label: '↓ Yellow → Transparent', value: 'grad-amber-transparent' },
  { label: '↑ Transparent → Yellow', value: 'grad-transparent-amber' },
  { label: '↓ Yellow → White', value: 'grad-amber-white' },
  // ── Darkest green (forest-950) gradients ──
  { label: '↓ Darkest green → Transparent', value: 'grad-darkest-transparent' },
  { label: '↑ Transparent → Darkest green', value: 'grad-transparent-darkest' },
  { label: '↓ Darkest green → White', value: 'grad-darkest-white' },
  { label: '↓ Darkest green → Mist', value: 'grad-darkest-mist' },
  // ── Cross-color combos ──
  { label: '↓ Mist → Light green', value: 'grad-mist-accent' },
  { label: '↓ Yellow → Mist', value: 'grad-amber-mist' },
  { label: '↓ Dark green → Yellow', value: 'grad-brand-amber' },
  { label: '↓ Darkest green → Yellow', value: 'grad-darkest-amber' },
]

// Gradient CSS definitions — uses CSS custom properties
const gradients: Record<string, string> = {
  // Neutral
  'grad-white-light':           'linear-gradient(180deg, #ffffff 0%, rgb(var(--stone-50)) 100%)',
  'grad-light-white':           'linear-gradient(180deg, rgb(var(--stone-50)) 0%, #ffffff 100%)',
  // Dark green
  'grad-brand-transparent':     'linear-gradient(180deg, rgb(var(--forest-800)) 0%, transparent 100%)',
  'grad-transparent-brand':     'linear-gradient(180deg, transparent 0%, rgb(var(--forest-800)) 100%)',
  'grad-brand-white':           'linear-gradient(180deg, rgb(var(--forest-800)) 0%, #ffffff 100%)',
  'grad-white-brand':           'linear-gradient(180deg, #ffffff 0%, rgb(var(--forest-800)) 100%)',
  'grad-brand-mist':            'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--mist)) 100%)',
  'grad-mist-brand':            'linear-gradient(180deg, rgb(var(--mist)) 0%, rgb(var(--forest-800)) 100%)',
  'grad-brand-accent':          'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--forest-50)) 100%)',
  // Mist
  'grad-mist-transparent':      'linear-gradient(180deg, rgb(var(--mist)) 0%, transparent 100%)',
  'grad-transparent-mist':      'linear-gradient(180deg, transparent 0%, rgb(var(--mist)) 100%)',
  'grad-mist-white':            'linear-gradient(180deg, rgb(var(--mist)) 0%, #ffffff 100%)',
  'grad-white-mist':            'linear-gradient(180deg, #ffffff 0%, rgb(var(--mist)) 100%)',
  // Light green
  'grad-accent-transparent':    'linear-gradient(180deg, rgb(var(--forest-50)) 0%, transparent 100%)',
  'grad-transparent-accent':    'linear-gradient(180deg, transparent 0%, rgb(var(--forest-50)) 100%)',
  'grad-accent-white':          'linear-gradient(180deg, rgb(var(--forest-50)) 0%, #ffffff 100%)',
  // Yellow
  'grad-amber-transparent':     'linear-gradient(180deg, rgb(var(--amber-300)) 0%, transparent 100%)',
  'grad-transparent-amber':     'linear-gradient(180deg, transparent 0%, rgb(var(--amber-300)) 100%)',
  'grad-amber-white':           'linear-gradient(180deg, rgb(var(--amber-300)) 0%, #ffffff 100%)',
  // Darkest green (forest-950)
  'grad-darkest-transparent':   'linear-gradient(180deg, rgb(var(--forest-950)) 0%, transparent 100%)',
  'grad-transparent-darkest':   'linear-gradient(180deg, transparent 0%, rgb(var(--forest-950)) 100%)',
  'grad-darkest-white':         'linear-gradient(180deg, rgb(var(--forest-950)) 0%, #ffffff 100%)',
  'grad-darkest-mist':          'linear-gradient(180deg, rgb(var(--forest-950)) 0%, rgb(var(--mist)) 100%)',
  'grad-darkest-amber':         'linear-gradient(180deg, rgb(var(--forest-950)) 0%, rgb(var(--amber-300)) 100%)',
  // Cross-color
  'grad-mist-accent':           'linear-gradient(180deg, rgb(var(--mist)) 0%, rgb(var(--forest-50)) 100%)',
  'grad-amber-mist':            'linear-gradient(180deg, rgb(var(--amber-300)) 0%, rgb(var(--mist)) 100%)',
  'grad-brand-amber':           'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--amber-300)) 100%)',
}

/** Dark backgrounds that need white text */
const darkBgs = new Set([
  'brand', 'darkest', 'grad-brand-transparent', 'grad-brand-white', 'grad-brand-mist', 'grad-brand-accent', 'grad-brand-amber',
  'grad-transparent-brand', 'grad-white-brand', 'grad-mist-brand',
  'grad-darkest-transparent', 'grad-darkest-white', 'grad-darkest-mist', 'grad-darkest-amber', 'grad-transparent-darkest',
])

/** Returns Tailwind className for solid section backgrounds */
export function sectionBgClass(bg: string = 'transparent'): string {
  const map: Record<string, string> = {
    transparent: '',
    white: 'bg-surface-elevated',
    surface: 'bg-surface',
    'surface-alt': 'bg-surface-alt',
    mist: 'bg-mist',
    'accent-soft': 'bg-accent-soft',
    brand: 'bg-brand',
    darkest: '',
    'highlight-soft': 'bg-highlight-soft',
  }
  return map[bg] || ''
}

/** Returns inline style for gradient backgrounds */
export function sectionBgStyle(bg: string = 'transparent'): React.CSSProperties | undefined {
  if (bg === 'darkest') return { background: 'rgb(var(--forest-950))' }
  if (gradients[bg]) return { background: gradients[bg] }
  return undefined
}

/** Returns text color class for dark backgrounds */
export function sectionTextClass(bg: string = 'transparent'): string {
  if (darkBgs.has(bg)) return 'text-white'
  return ''
}

/** Puck field definition for sectionBg prop */
export const sectionBgField = {
  type: 'select' as const,
  label: 'Section background',
  options: sectionBgOptions,
}

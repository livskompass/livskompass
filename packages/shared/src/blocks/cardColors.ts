/** Shared card color variants — used across all card-type blocks */

export type CardColor = 'white' | 'yellow' | 'mist' | 'dark'

export const cardColorOptions = [
  { label: 'White', value: 'white' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Mist', value: 'mist' },
  { label: 'Dark green', value: 'dark' },
]

export const cardColorStyles: Record<CardColor, {
  bg: string
  text: string
  textMuted: string
  border: string
  badge: string
  btnVariant: 'default' | 'secondary' | 'outline'
}> = {
  white: {
    bg: 'bg-white border border-stone-200',
    text: 'text-forest-800',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    badge: 'bg-forest-50 text-forest-700',
    btnVariant: 'default',
  },
  yellow: {
    bg: 'bg-amber-300',
    text: 'text-forest-800',
    textMuted: 'text-forest-800/60',
    border: 'border-transparent',
    badge: 'bg-forest-800/10 text-forest-800',
    btnVariant: 'default',
  },
  mist: {
    bg: 'bg-[#C7DDDC]',
    text: 'text-forest-800',
    textMuted: 'text-forest-800/60',
    border: 'border-transparent',
    badge: 'bg-forest-800/10 text-forest-800',
    btnVariant: 'default',
  },
  dark: {
    bg: 'bg-forest-800',
    text: 'text-amber-300',
    textMuted: 'text-amber-300/60',
    border: 'border-transparent',
    badge: 'bg-amber-300/20 text-amber-300',
    btnVariant: 'secondary',
  },
}

export function getCardColors(color: string = 'white') {
  return cardColorStyles[color as CardColor] || cardColorStyles.white
}

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
  // `heading-on-light` / `heading-on-dark` (defined in index.css) reset the
  // inherited --heading-color on each card so child text-h3/h4 elements
  // (card titles, Price) render against the card's own surface, not the
  // surrounding section's. Without this, a white card inside a dark section
  // inherits --heading-color: white and titles/prices become invisible.
  white: {
    bg: 'bg-surface-elevated heading-on-light',
    text: 'text-brand',
    textMuted: 'text-muted',
    border: 'border-default',
    badge: 'bg-accent-soft text-accent-hover',
    btnVariant: 'default',
  },
  yellow: {
    bg: 'bg-highlight-soft heading-on-light',
    text: 'text-brand',
    textMuted: 'text-brand/60',
    border: 'border-transparent',
    badge: 'bg-brand/10 text-brand',
    btnVariant: 'default',
  },
  mist: {
    bg: 'bg-mist heading-on-light',
    text: 'text-brand',
    textMuted: 'text-brand/60',
    border: 'border-transparent',
    badge: 'bg-brand/10 text-brand',
    btnVariant: 'default',
  },
  dark: {
    bg: 'bg-brand heading-on-dark',
    text: 'text-highlight-soft',
    textMuted: 'text-highlight-soft/60',
    border: 'border-transparent',
    badge: 'bg-highlight-soft/20 text-highlight-soft',
    btnVariant: 'secondary',
  },
}

export function getCardColors(color: string = 'white') {
  return cardColorStyles[color as CardColor] || cardColorStyles.white
}

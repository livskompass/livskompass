import { cn } from '../ui/utils'

export interface SeparatorBlockProps {
  variant: 'line' | 'dots' | 'space-only' | 'gradient'
  spacing: 'small' | 'medium' | 'large' | 'extra-large'
  lineColor: 'light' | 'medium' | 'dark'
  maxWidth: 'narrow' | 'medium' | 'full'
  gradientType?: string
}

const spacingMap = {
  small: 'py-4',
  medium: 'py-8',
  large: 'py-16',
  'extra-large': 'py-24',
} as const

const maxWidthMap = {
  narrow: 'max-w-md',
  medium: 'max-w-2xl',
  full: 'max-w-full',
} as const

const colorMap = {
  light: 'border-default',
  medium: 'border-strong',
  dark: 'border-stone-500',
} as const

const gradientHeightMap = {
  small: 'h-8',
  medium: 'h-16',
  large: 'h-32',
  'extra-large': 'h-48',
} as const

const gradientStyles: Record<string, string> = {
  // Neutral
  'white-light':           'linear-gradient(180deg, #ffffff 0%, rgb(var(--stone-50)) 100%)',
  'light-white':           'linear-gradient(180deg, rgb(var(--stone-50)) 0%, #ffffff 100%)',
  // Dark green
  'brand-transparent':     'linear-gradient(180deg, rgb(var(--forest-800)) 0%, transparent 100%)',
  'transparent-brand':     'linear-gradient(180deg, transparent 0%, rgb(var(--forest-800)) 100%)',
  'brand-white':           'linear-gradient(180deg, rgb(var(--forest-800)) 0%, #ffffff 100%)',
  'white-brand':           'linear-gradient(180deg, #ffffff 0%, rgb(var(--forest-800)) 100%)',
  'brand-mist':            'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--mist)) 100%)',
  'mist-brand':            'linear-gradient(180deg, rgb(var(--mist)) 0%, rgb(var(--forest-800)) 100%)',
  'brand-accent':          'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--forest-50)) 100%)',
  // Mist
  'mist-transparent':      'linear-gradient(180deg, rgb(var(--mist)) 0%, transparent 100%)',
  'transparent-mist':      'linear-gradient(180deg, transparent 0%, rgb(var(--mist)) 100%)',
  'mist-white':            'linear-gradient(180deg, rgb(var(--mist)) 0%, #ffffff 100%)',
  'white-mist':            'linear-gradient(180deg, #ffffff 0%, rgb(var(--mist)) 100%)',
  // Light green
  'accent-transparent':    'linear-gradient(180deg, rgb(var(--forest-50)) 0%, transparent 100%)',
  'transparent-accent':    'linear-gradient(180deg, transparent 0%, rgb(var(--forest-50)) 100%)',
  'accent-white':          'linear-gradient(180deg, rgb(var(--forest-50)) 0%, #ffffff 100%)',
  // Yellow
  'amber-transparent':     'linear-gradient(180deg, rgb(var(--amber-300)) 0%, transparent 100%)',
  'transparent-amber':     'linear-gradient(180deg, transparent 0%, rgb(var(--amber-300)) 100%)',
  'amber-white':           'linear-gradient(180deg, rgb(var(--amber-300)) 0%, #ffffff 100%)',
  // Cross-color
  'mist-accent':           'linear-gradient(180deg, rgb(var(--mist)) 0%, rgb(var(--forest-50)) 100%)',
  'amber-mist':            'linear-gradient(180deg, rgb(var(--amber-300)) 0%, rgb(var(--mist)) 100%)',
  'brand-amber':           'linear-gradient(180deg, rgb(var(--forest-800)) 0%, rgb(var(--amber-300)) 100%)',
}

export function SeparatorBlock({
  variant = 'line',
  spacing = 'medium',
  lineColor = 'light',
  maxWidth = 'full',
  gradientType = 'white-light',
}: SeparatorBlockProps) {
  // Gradient variant — full-width color transition
  if (variant === 'gradient') {
    return (
      <div
        className={cn('w-full', gradientHeightMap[spacing])}
        style={{ background: gradientStyles[gradientType] || gradientStyles['white-light'] }}
      />
    )
  }

  return (
    <div
      className={cn(
        'mx-auto',
        spacingMap[spacing],
        maxWidthMap[maxWidth]
      )}
    >
      {variant === 'line' && (
        <hr className={cn('border-t', colorMap[lineColor])} />
      )}
      {variant === 'dots' && (
        <div className="flex justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        </div>
      )}
    </div>
  )
}

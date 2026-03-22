import { cn } from '../ui/utils'

export interface SeparatorBlockProps {
  variant: 'line' | 'dots' | 'space-only' | 'gradient'
  spacing: 'small' | 'medium' | 'large' | 'extra-large'
  lineColor: 'light' | 'medium' | 'dark'
  maxWidth: 'narrow' | 'medium' | 'full'
  gradientType?: 'fade-down' | 'fade-up' | 'mist-down' | 'mist-up' | 'forest-down' | 'forest-up' | 'amber-down' | 'amber-up'
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
  'fade-down': 'linear-gradient(180deg, #ffffff 0%, rgb(var(--stone-50)) 100%)',
  'fade-up': 'linear-gradient(180deg, rgb(var(--stone-50)) 0%, #ffffff 100%)',
  'mist-down': 'linear-gradient(180deg, rgb(var(--mist)) 0%, transparent 100%)',
  'mist-up': 'linear-gradient(180deg, transparent 0%, rgb(var(--mist)) 100%)',
  'forest-down': 'linear-gradient(180deg, rgb(var(--forest-50)) 0%, transparent 100%)',
  'forest-up': 'linear-gradient(180deg, transparent 0%, rgb(var(--forest-50)) 100%)',
  'amber-down': 'linear-gradient(180deg, rgb(var(--amber-50)) 0%, transparent 100%)',
  'amber-up': 'linear-gradient(180deg, transparent 0%, rgb(var(--amber-50)) 100%)',
}

export function SeparatorBlock({
  variant = 'line',
  spacing = 'medium',
  lineColor = 'light',
  maxWidth = 'full',
  gradientType = 'fade-down',
}: SeparatorBlockProps) {
  // Gradient variant — full-width color transition
  if (variant === 'gradient') {
    return (
      <div
        className={cn('w-full', gradientHeightMap[spacing])}
        style={{ background: gradientStyles[gradientType] || gradientStyles['fade-down'] }}
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

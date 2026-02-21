import { cn } from '../ui/utils'

export interface SeparatorBlockProps {
  variant: 'line' | 'dots' | 'space-only'
  spacing: 'small' | 'medium' | 'large' | 'extra-large'
  lineColor: 'light' | 'medium' | 'dark'
  maxWidth: 'narrow' | 'medium' | 'full'
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
  light: 'border-stone-200',
  medium: 'border-stone-300',
  dark: 'border-stone-500',
} as const

export function SeparatorBlock({
  variant = 'line',
  spacing = 'medium',
  lineColor = 'light',
  maxWidth = 'full',
}: SeparatorBlockProps) {
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

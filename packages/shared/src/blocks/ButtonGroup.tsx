import { cn } from '../ui/utils'
import { Button } from '../ui/button'

export interface ButtonItem {
  text: string
  link: string
  variant: 'primary' | 'secondary' | 'outline'
}

export interface ButtonGroupProps {
  buttons: ButtonItem[]
  alignment: 'left' | 'center' | 'right'
  direction: 'horizontal' | 'vertical'
  size: 'small' | 'medium' | 'large'
}

const alignmentMap = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const directionMap = {
  horizontal: 'flex-row',
  vertical: 'flex-col',
} as const

const sizeMap = {
  small: 'sm' as const,
  medium: 'default' as const,
  large: 'lg' as const,
}

const variantMap = {
  primary: 'default' as const,
  secondary: 'secondary' as const,
  outline: 'outline' as const,
}

export function ButtonGroup({
  buttons = [],
  alignment = 'center',
  direction = 'horizontal',
  size = 'medium',
}: ButtonGroupProps) {
  if (buttons.length === 0) {
    return (
      <div className="py-4 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
        Lägg till knappar i inställningarna...
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-3',
        alignmentMap[alignment],
        directionMap[direction]
      )}
    >
      {buttons.map((btn, i) => (
        <a key={i} href={btn.link || '#'}>
          <Button
            variant={variantMap[btn.variant] || 'default'}
            size={sizeMap[size]}
            type="button"
          >
            {btn.text || 'Knapp'}
          </Button>
        </a>
      ))}
    </div>
  )
}

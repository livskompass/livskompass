import { cn } from '../ui/utils'
import { Button } from '../ui/button'
import { useEditableText } from '../context'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

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

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function ButtonItem({ btn, index, size, totalItems }: { btn: ButtonItem; index: number; size: 'small' | 'medium' | 'large'; totalItems: number }) {
  const textEdit = useEditableText(`buttons[${index}].text`, btn.text)

  return (
    <ArrayItemControls fieldName="buttons" itemIndex={index} totalItems={totalItems}>
    <a href={btn.link || '#'}>
      <Button
        variant={variantMap[btn.variant] || 'default'}
        size={sizeMap[size]}
        type="button"
      >
        <span {...editHandlers(textEdit)} className={textEdit?.className}>{btn.text || 'Knapp'}</span>
      </Button>
    </a>
    </ArrayItemControls>
  )
}

export function ButtonGroup({
  buttons = [],
  alignment = 'center',
  direction = 'horizontal',
  size = 'medium',
}: ButtonGroupProps) {
  if (buttons.length === 0) {
    return (
      <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
        <div className="py-4 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add buttons in settings...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
      <ArrayDragProvider fieldName="buttons">
      <div
        className={cn(
          'flex flex-wrap gap-3',
          alignmentMap[alignment],
          directionMap[direction]
        )}
      >
        {buttons.map((btn, i) => (
          <ButtonItem key={i} btn={btn} index={i} size={size} totalItems={buttons.length} />
        ))}
      </div>
      </ArrayDragProvider>
      <AddItemButton fieldName="buttons" label="Add button" />
    </div>
  )
}

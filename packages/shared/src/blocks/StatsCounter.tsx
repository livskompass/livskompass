import { cn } from '../ui/utils'
import { useScrollReveal } from '../helpers'
import { useEditableText } from '../context'
import { ArrayItemControls } from './ArrayItemControls'

export interface StatsCounterProps {
  items: Array<{ value: string; label: string; prefix: string; suffix: string }>
  columns: 2 | 3 | 4
  style: 'default' | 'bordered'
}

const colMap = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function StatItem({ item, index, style, totalItems }: { item: { value: string; label: string; prefix: string; suffix: string }; index: number; style: 'default' | 'bordered'; totalItems: number }) {
  const valueEdit = useEditableText(`items[${index}].value`, item.value)
  const labelEdit = useEditableText(`items[${index}].label`, item.label)
  const prefixEdit = useEditableText(`items[${index}].prefix`, item.prefix)
  const suffixEdit = useEditableText(`items[${index}].suffix`, item.suffix)

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    <div
      className={cn(
        'text-center reveal',
        `reveal-stagger-${Math.min(index + 1, 5)}`,
        style === 'bordered' && 'bg-white rounded-xl border border-stone-200 shadow-sm p-6'
      )}
    >
      <div className="text-h1 text-forest-600 mb-2">
        <span {...editHandlers(prefixEdit)} className={prefixEdit?.className}>{item.prefix}</span>
        <span {...editHandlers(valueEdit)} className={valueEdit?.className}>{item.value}</span>
        <span {...editHandlers(suffixEdit)} className={suffixEdit?.className}>{item.suffix}</span>
      </div>
      <div {...editHandlers(labelEdit)} className={cn('text-sm text-stone-500 font-medium uppercase tracking-wide', labelEdit?.className)}>
        {item.label}
      </div>
    </div>
    </ArrayItemControls>
  )
}

export function StatsCounter({
  items = [],
  columns = 4,
  style = 'default',
}: StatsCounterProps) {
  const revealRef = useScrollReveal()

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add stats in settings...
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className={cn('grid gap-8', colMap[columns] || colMap[4])}>
        {items.map((item, i) => (
          <StatItem key={i} item={item} index={i} style={style} totalItems={items.length} />
        ))}
      </div>
    </div>
  )
}

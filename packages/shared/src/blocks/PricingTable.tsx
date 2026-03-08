import { cn } from '../ui/utils'
import { Check } from 'lucide-react'
import { useScrollReveal } from '../helpers'
import { useInlineEdit, useEditableText } from '../context'

export interface PricingTableProps {
  heading: string
  items: Array<{
    name: string
    price: string
    description: string
    features: string[] | string
    highlighted: boolean
    ctaText: string
    ctaLink: string
  }>
  columns: 2 | 3
  highlightLabel: string
  emptyText: string
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function PricingTierItem({ item, index, highlightLabel }: { item: PricingTableProps['items'][number]; index: number; highlightLabel: string }) {
  const nameEdit = useEditableText(`items[${index}].name`, item.name)
  const descEdit = useEditableText(`items[${index}].description`, item.description)

  return (
    <div
      className={cn(
        'rounded-xl p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1',
        item.highlighted
          ? 'bg-white border-2 border-amber-400 shadow-lg hover:shadow-xl'
          : 'bg-white border border-stone-200 shadow-sm hover:shadow-md'
      )}
    >
      {item.highlighted && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(176, 131, 80, 0.08) 0%, transparent 70%)' }} />
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">{highlightLabel}</span>
        </>
      )}
      <h3 {...editHandlers(nameEdit)} className={cn('text-h4 text-stone-800', nameEdit?.className)}>{item.name}</h3>
      <div className="mt-4 mb-2">
        <span className="font-display text-h2 text-stone-900">{item.price}</span>
        {item.price && !item.price.toLowerCase().includes('gratis') && (
          <span className="text-stone-500 ml-1">kr</span>
        )}
      </div>
      {(item.description || descEdit) && (
        <p {...editHandlers(descEdit)} className={cn('text-stone-600 text-sm mb-6', descEdit?.className)}>{item.description}</p>
      )}
      {item.features && (typeof item.features === 'string' ? item.features.split('\n').filter(Boolean) : item.features).length > 0 && (
        <ul className="space-y-3 mb-8 flex-1">
          {(typeof item.features === 'string' ? item.features.split('\n').filter(Boolean) : item.features).map((feature, j) => (
            <li key={j} className="flex items-start gap-3 text-sm text-stone-600">
              <Check className="h-5 w-5 text-forest-500 flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      {item.ctaText && (
        <a
          href={item.ctaLink || '#'}
          className={cn(
            'mt-auto inline-flex items-center justify-center h-12 px-7 rounded-full font-semibold text-sm transition-all w-full active:scale-[0.98]',
            item.highlighted
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-forest-500 text-white hover:bg-forest-600'
          )}
        >
          {item.ctaText}
        </a>
      )}
    </div>
  )
}

export function PricingTable({
  heading = '',
  items = [],
  columns = 2,
  highlightLabel = 'Populärt val',
  emptyText = 'Lägg till priser i inställningarna...',
  id,
}: PricingTableProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          {emptyText}
        </div>
      </div>
    )
  }

  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-stone-800 text-center mb-10 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      <div className={cn('grid grid-cols-1 gap-6 items-start reveal', colMap[columns] || colMap[2])}>
        {items.map((item, i) => (
          <PricingTierItem key={i} item={item} index={i} highlightLabel={highlightLabel} />
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { cn } from '../ui/utils'
import { ChevronDown } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { ArrayItemControls } from './ArrayItemControls'

export interface AccordionItem {
  question: string
  answer: string
}

export interface AccordionProps {
  heading: string
  items: AccordionItem[]
  defaultOpen: 'none' | 'first' | 'all'
  style: 'default' | 'bordered' | 'minimal'
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function AccordionItemComponent({
  item,
  index,
  isOpen,
  onToggle,
  style,
  totalItems,
}: {
  item: AccordionItem
  index: number
  isOpen: boolean
  onToggle: () => void
  style: AccordionProps['style']
  totalItems: number
}) {
  const questionEdit = useEditableText(`items[${index}].question`, item.question)
  const answerEdit = useEditableText(`items[${index}].answer`, item.answer)

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    <div className={cn(style !== 'minimal' && 'overflow-hidden')}>
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between py-4 px-5 text-left font-medium text-stone-800 hover:bg-stone-50 transition-colors',
          style === 'minimal' && 'px-0'
        )}
        aria-expanded={isOpen}
      >
        <span {...editHandlers(questionEdit)} className={questionEdit?.className}>{item.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-stone-400 shrink-0 ml-4 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div
            {...editHandlers(answerEdit)}
            className={cn(
              'pb-4 text-stone-600 leading-relaxed',
              style === 'minimal' ? 'px-0' : 'px-5',
              answerEdit?.className
            )}
          >
            {item.answer}
          </div>
        </div>
      </div>
    </div>
    </ArrayItemControls>
  )
}

export function Accordion({
  heading = '',
  items = [],
  defaultOpen = 'none',
  style = 'default',
  id,
}: AccordionProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
    if (defaultOpen === 'all') return new Set(items.map((_, i) => i))
    if (defaultOpen === 'first' && items.length > 0) return new Set([0])
    return new Set()
  })

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
        <div className="py-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add questions in settings...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h3 text-stone-800 mb-6', headingEdit?.className)}>{heading}</h2>
      )}
      <div
        className={cn(
          style !== 'minimal' && 'divide-y divide-stone-200',
          style === 'default' && 'border border-stone-200 rounded-xl overflow-hidden bg-white',
          style === 'bordered' && 'border-2 border-stone-300 rounded-xl overflow-hidden bg-white',
          style === 'minimal' && 'divide-y divide-stone-200'
        )}
      >
        {items.map((item, index) => (
          <AccordionItemComponent
            key={index}
            item={item}
            index={index}
            isOpen={openIndices.has(index)}
            onToggle={() => toggle(index)}
            style={style}
            totalItems={items.length}
          />
        ))}
      </div>
    </div>
  )
}

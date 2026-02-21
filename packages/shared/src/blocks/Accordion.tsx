import { useState } from 'react'
import { cn } from '../ui/utils'
import { ChevronDown } from 'lucide-react'

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

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
  style,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
  style: AccordionProps['style']
}) {
  return (
    <div className={cn(style !== 'minimal' && 'overflow-hidden')}>
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between py-4 px-5 text-left font-medium text-neutral-800 hover:bg-neutral-50 transition-colors',
          style === 'minimal' && 'px-0'
        )}
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-neutral-400 shrink-0 ml-4 transition-transform duration-300',
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
            className={cn(
              'pb-4 text-neutral-600 leading-relaxed',
              style === 'minimal' ? 'px-0' : 'px-5'
            )}
          >
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Accordion({
  heading = '',
  items = [],
  defaultOpen = 'none',
  style = 'default',
}: AccordionProps) {
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
      <div className="py-8 text-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
        Lägg till frågor i inställningarna...
      </div>
    )
  }

  return (
    <div>
      {heading && (
        <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-6">{heading}</h2>
      )}
      <div
        className={cn(
          style !== 'minimal' && 'divide-y divide-neutral-200',
          style === 'default' && 'border border-neutral-200 rounded-xl overflow-hidden bg-white',
          style === 'bordered' && 'border-2 border-neutral-300 rounded-xl overflow-hidden bg-white',
          style === 'minimal' && 'divide-y divide-neutral-200'
        )}
      >
        {items.map((item, index) => (
          <AccordionItemComponent
            key={index}
            item={item}
            isOpen={openIndices.has(index)}
            onToggle={() => toggle(index)}
            style={style}
          />
        ))}
      </div>
    </div>
  )
}

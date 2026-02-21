import { cn } from '../ui/utils'
import { useScrollReveal } from '../helpers'

export interface StatsCounterProps {
  items: Array<{ value: string; label: string; prefix: string; suffix: string }>
  columns: 2 | 3 | 4
  style: 'default' | 'bordered'
}

const colMap = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }

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
          Lägg till statistik i inställningarna...
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className={cn('grid gap-8', colMap[columns] || colMap[4])}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'text-center reveal',
              `reveal-stagger-${Math.min(i + 1, 5)}`,
              style === 'bordered' && 'bg-white rounded-xl border border-stone-200 shadow-sm p-6'
            )}
          >
            <div className="text-h1 text-forest-600 mb-2">
              {item.prefix}{item.value}{item.suffix}
            </div>
            <div className="text-sm text-stone-500 font-medium uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

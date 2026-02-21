import { cn } from '../ui/utils'

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
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
          Lägg till statistik i inställningarna...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className={cn('grid gap-8', colMap[columns] || colMap[4])}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'text-center',
              style === 'bordered' && 'bg-white rounded-xl border border-neutral-200 shadow-sm p-6'
            )}
          >
            <div className="font-heading text-4xl md:text-5xl font-bold text-primary-600 mb-2">
              {item.prefix}{item.value}{item.suffix}
            </div>
            <div className="text-sm text-neutral-500 font-medium uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

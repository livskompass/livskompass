import { cn } from '../ui/utils'
import { Check } from 'lucide-react'

export interface PricingTableProps {
  heading: string
  items: Array<{
    name: string
    price: string
    description: string
    features: string[]
    highlighted: boolean
    ctaText: string
    ctaLink: string
  }>
  columns: 2 | 3
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }

export function PricingTable({
  heading = '',
  items = [],
  columns = 2,
}: PricingTableProps) {
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
          Lägg till priser i inställningarna...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {heading && (
        <h2 className="font-heading text-3xl font-bold text-neutral-800 text-center mb-10 tracking-tight">{heading}</h2>
      )}
      <div className={cn('grid grid-cols-1 gap-6 items-start', colMap[columns] || colMap[2])}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl p-8 flex flex-col',
              item.highlighted
                ? 'bg-white border-2 border-accent-400 shadow-lg ring-1 ring-accent-100'
                : 'bg-white border border-neutral-200 shadow-sm'
            )}
          >
            {item.highlighted && (
              <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">Populärt val</span>
            )}
            <h3 className="font-heading text-xl font-bold text-neutral-800">{item.name}</h3>
            <div className="mt-4 mb-2">
              <span className="font-heading text-4xl font-bold text-neutral-900">{item.price}</span>
              {item.price && !item.price.toLowerCase().includes('gratis') && (
                <span className="text-neutral-500 ml-1">kr</span>
              )}
            </div>
            {item.description && (
              <p className="text-neutral-600 text-sm mb-6">{item.description}</p>
            )}
            {item.features && item.features.length > 0 && (
              <ul className="space-y-3 mb-8 flex-1">
                {item.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-neutral-600">
                    <Check className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            {item.ctaText && (
              <a
                href={item.ctaLink || '#'}
                className={cn(
                  'mt-auto inline-flex items-center justify-center h-11 px-6 rounded-lg font-semibold text-sm transition-all w-full active:scale-[0.98]',
                  item.highlighted
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                )}
              >
                {item.ctaText}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

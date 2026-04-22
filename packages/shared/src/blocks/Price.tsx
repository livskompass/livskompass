import { cn } from '../ui/utils'

export type PriceSize = 'sm' | 'md' | 'lg'

interface PriceProps {
  value: number
  currency?: string
  size?: PriceSize
  /** Tailwind class for the colour applied to BOTH the amount and the suffix. */
  colorClass?: string
  className?: string
}

const SIZE_CLASS: Record<PriceSize, string> = {
  sm: 'text-body',     // inline with body copy (CourseInfo, table cells)
  md: 'text-h4',       // standard card price
  lg: 'text-h3',       // hero/featured price
}

/**
 * Unified price display. Amount and currency suffix share the same colour and
 * weight so "16 500 kr" reads as one coherent value, not two competing tokens.
 */
export function Price({ value, currency = 'kr', size = 'md', colorClass = 'text-brand', className }: PriceProps) {
  return (
    <span className={cn('font-semibold', SIZE_CLASS[size], colorClass, className)}>
      {value.toLocaleString('sv-SE')} {currency}
    </span>
  )
}

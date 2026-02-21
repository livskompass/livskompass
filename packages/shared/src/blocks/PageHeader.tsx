import { cn } from '../ui/utils'

export interface PageHeaderProps {
  heading: string
  subheading: string
  alignment: 'left' | 'center'
  size: 'small' | 'large'
  showDivider: boolean
}

export function PageHeader({
  heading = 'Rubrik',
  subheading = '',
  alignment = 'left',
  size = 'large',
  showDivider = false,
}: PageHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-10">
      <div className={cn(alignment === 'center' && 'text-center')}>
        <h1
          className={cn(
            'font-heading font-bold tracking-tight text-neutral-900',
            size === 'large' ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-2xl md:text-3xl'
          )}
        >
          {heading}
        </h1>
        {subheading && (
          <p className={cn(
            'mt-4 text-lg text-neutral-600 leading-relaxed',
            size === 'large' ? 'md:text-xl max-w-3xl' : 'max-w-2xl',
            alignment === 'center' && 'mx-auto'
          )}>
            {subheading}
          </p>
        )}
        {showDivider && (
          <div className={cn('mt-6', alignment === 'center' && 'flex justify-center')}>
            <div className="w-16 h-1 rounded-full bg-accent-400" />
          </div>
        )}
      </div>
    </div>
  )
}

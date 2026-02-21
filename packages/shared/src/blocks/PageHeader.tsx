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
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingTop: 'var(--section-md)', paddingBottom: 'var(--section-xs)' }}>
      <div className={cn(alignment === 'center' && 'text-center')}>
        <h1
          className={cn(
            'font-display tracking-tight text-forest-950',
            size === 'large' ? 'text-h1' : 'text-h2'
          )}
        >
          {heading}
        </h1>
        {subheading && (
          <p className={cn(
            'mt-4 text-body-lg text-stone-600 leading-relaxed',
            size === 'large' ? 'max-w-3xl' : 'max-w-2xl',
            alignment === 'center' && 'mx-auto'
          )}>
            {subheading}
          </p>
        )}
        {showDivider && (
          <div className={cn('mt-6', alignment === 'center' && 'flex justify-center')}>
            <div className="w-16 h-1 rounded-full bg-forest-300" />
          </div>
        )}
      </div>
    </div>
  )
}

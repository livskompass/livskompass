import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'

export interface HeroProps {
  heading: string
  subheading: string
  variant: 'gradient' | 'image' | 'light'
  textAlignment: 'left' | 'center' | 'right'
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  fullHeight: 'full-viewport' | 'auto'
  backgroundImage?: string
}

const alignmentMap = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
} as const

export function Hero({
  heading = 'Rubrik här',
  subheading = '',
  variant = 'gradient',
  textAlignment = 'center',
  ctaPrimaryText = '',
  ctaPrimaryLink = '',
  ctaSecondaryText = '',
  ctaSecondaryLink = '',
  fullHeight = 'auto',
  backgroundImage,
}: HeroProps) {
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-forest-950' : 'text-white'
  const subTextColor = isLight ? 'text-stone-600' : 'text-white/75'
  const hasButtons = ctaPrimaryText || ctaSecondaryText

  const heightClass =
    fullHeight === 'full-viewport'
      ? 'min-h-[85vh] flex items-center'
      : ''

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        heightClass,
        textColor,
        variant === 'gradient' && 'bg-[image:var(--gradient-hero)]',
        variant === 'light' && 'bg-[var(--surface-primary)]',
      )}
      style={{
        ...(variant !== 'light'
          ? { paddingTop: 'var(--section-xl)', paddingBottom: 'var(--section-xl)' }
          : { paddingTop: 'var(--section-md)', paddingBottom: 'var(--section-sm)' }),
        ...(variant === 'image' && backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
    >
      {/* Radial glow accent for gradient hero */}
      {variant === 'gradient' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--gradient-glow)' }}
        />
      )}

      {/* Image overlay */}
      {variant === 'image' && (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(var(--color-forest-950-rgb, 10,26,16), 0.75), rgba(var(--color-forest-950-rgb, 10,26,16), 0.2), rgba(var(--color-forest-950-rgb, 10,26,16), 0.35))' }}
        />
      )}

      <div
        className={cn(
          'relative flex flex-col',
          alignmentMap[textAlignment]
        )}
        style={{
          maxWidth: 'var(--width-content)',
          marginInline: 'auto',
          paddingInline: 'var(--container-px)',
        }}
      >
        <h1
          className={cn('text-display max-w-[24ch]', textAlignment === 'center' && 'mx-auto')}
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          {heading}
        </h1>

        {subheading && (
          <p
            className={cn(
              'text-body-lg mt-6 max-w-[540px] leading-relaxed',
              subTextColor,
              textAlignment === 'center' && 'mx-auto'
            )}
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            {subheading}
          </p>
        )}

        {hasButtons && (
          <div
            className={cn(
              'flex flex-col sm:flex-row gap-4 mt-10',
              textAlignment === 'center' && 'justify-center',
              textAlignment === 'right' && 'justify-end'
            )}
            style={{ animationDelay: '500ms', animationFillMode: 'both' }}
          >
            {ctaPrimaryText && ctaPrimaryLink && (
              <a
                href={ctaPrimaryLink}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 transition-all',
                  isLight
                    ? 'bg-forest-600 text-white shadow-[0_1px_3px_rgba(50,102,71,0.2)] hover:bg-forest-500 hover:-translate-y-px'
                    : 'bg-white text-forest-700 shadow-lg hover:shadow-xl hover:-translate-y-px'
                )}
              >
                {ctaPrimaryText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <a
                href={ctaSecondaryLink}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 transition-all',
                  isLight
                    ? 'border-[1.5px] border-stone-300 text-stone-700 hover:bg-stone-100'
                    : 'border-[1.5px] border-white/40 text-white hover:bg-white/10'
                )}
              >
                {ctaSecondaryText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

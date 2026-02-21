import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'

export interface HeroProps {
  heading: string
  subheading: string
  variant: 'gradient' | 'image' | 'solid'
  backgroundColor: string
  backgroundImage?: string
  textAlignment: 'left' | 'center' | 'right'
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  fullHeight: 'full-viewport' | 'auto'
}

const bgColorMap = {
  primary: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900',
  dark: 'bg-neutral-900',
  light: 'bg-neutral-100',
} as const

const solidBgMap = {
  primary: 'bg-primary-700',
  dark: 'bg-neutral-900',
  light: 'bg-neutral-100',
} as const

const alignmentMap = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
} as const

export function Hero({
  heading = 'Rubrik här',
  subheading = '',
  variant = 'gradient',
  backgroundColor = 'primary',
  backgroundImage,
  textAlignment = 'center',
  ctaPrimaryText = '',
  ctaPrimaryLink = '',
  ctaSecondaryText = '',
  ctaSecondaryLink = '',
  fullHeight = 'auto',
}: HeroProps) {
  const isLight = variant === 'solid' && backgroundColor === 'light'
  const textColor = isLight ? 'text-neutral-900' : 'text-white'
  const subTextColor = isLight ? 'text-neutral-600' : 'text-white/80'

  const sectionBg =
    variant === 'gradient'
      ? bgColorMap[backgroundColor as keyof typeof bgColorMap] || bgColorMap.primary
      : variant === 'solid'
        ? solidBgMap[backgroundColor as keyof typeof solidBgMap] || solidBgMap.primary
        : ''

  const hasButtons = ctaPrimaryText || ctaSecondaryText
  const heightClass = fullHeight === 'full-viewport' ? 'min-h-screen flex items-center' : 'py-24 md:py-32'

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        heightClass,
        textColor,
        variant !== 'image' && sectionBg
      )}
      style={
        variant === 'image' && backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptLTEyLTZ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMzZ2Nmg2di02aC02em0tMTIgMjR2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptMC0yNHY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      )}
      {variant === 'image' && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div
        className={cn(
          'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col',
          alignmentMap[textAlignment]
        )}
      >
        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          {heading}
        </h1>
        {subheading && (
          <p
            className={cn(
              'text-xl md:text-2xl mb-10 max-w-3xl leading-relaxed',
              subTextColor,
              textAlignment === 'center' && 'mx-auto'
            )}
          >
            {subheading}
          </p>
        )}
        {hasButtons && (
          <div
            className={cn(
              'flex flex-col sm:flex-row gap-4',
              textAlignment === 'center' && 'justify-center',
              textAlignment === 'right' && 'justify-end'
            )}
          >
            {ctaPrimaryText && ctaPrimaryLink && (
              <a
                href={ctaPrimaryLink}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold text-base h-12 px-8 transition-all active:scale-[0.98]',
                  isLight
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-white text-primary-700 hover:bg-primary-50'
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
                  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold text-base h-12 px-8 transition-all active:scale-[0.98]',
                  isLight
                    ? 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    : 'border-2 border-white/80 text-white hover:bg-white/10 bg-transparent'
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

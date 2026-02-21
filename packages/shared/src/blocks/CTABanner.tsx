import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'

export interface CTABannerProps {
  heading: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundColor: 'primary' | 'dark' | 'light' | 'gradient'
  alignment: 'left' | 'center'
}

const bgMap: Record<string, string> = {
  primary: 'bg-forest-600 text-white',
  dark: 'bg-stone-900 text-white',
  light: 'bg-stone-100 text-stone-900 border border-stone-200',
  gradient: 'text-white',
}

const buttonStyleMap: Record<string, string> = {
  primary: 'bg-white text-forest-700 hover:bg-forest-50 shadow-lg hover:shadow-xl',
  dark: 'bg-white text-stone-900 hover:bg-stone-100 shadow-lg hover:shadow-xl',
  light: 'bg-forest-500 text-white hover:bg-forest-600 shadow-md hover:shadow-lg',
  gradient: 'bg-white text-forest-700 hover:bg-forest-50 shadow-lg hover:shadow-xl',
}

export function CTABanner({
  heading = 'Redo att börja?',
  description = '',
  buttonText = 'Boka nu',
  buttonLink = '/utbildningar',
  backgroundColor = 'primary',
  alignment = 'center',
}: CTABannerProps) {
  const bg = bgMap[backgroundColor] || bgMap.primary
  const btnStyle = buttonStyleMap[backgroundColor] || buttonStyleMap.primary
  const isGradient = backgroundColor === 'gradient'

  return (
    <section
      className={cn('rounded-2xl relative overflow-hidden', bg)}
      style={{
        paddingBlock: 'var(--section-md)',
        paddingInline: 'var(--container-px)',
        ...(isGradient ? { background: 'var(--gradient-hero)' } : {}),
      }}
    >
      {isGradient && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      )}
      <div
        className={cn(
          'relative max-w-3xl mx-auto',
          alignment === 'center' ? 'text-center' : 'text-left'
        )}
      >
        <h2 className="text-h2 mb-4">{heading}</h2>
        {description && (
          <p className="text-lg mb-8 opacity-90 leading-relaxed">{description}</p>
        )}
        {buttonText && (
          <a
            href={buttonLink || '#'}
            className={cn(
              'inline-flex items-center justify-center h-12 px-8 font-semibold text-base rounded-full transition-all hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
              btnStyle
            )}
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        )}
      </div>
    </section>
  )
}

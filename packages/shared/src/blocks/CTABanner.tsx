import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'

export interface CTABannerProps {
  heading: string
  description: string
  buttonText: string
  buttonLink: string
  variant: 'primary' | 'secondary' | 'outline'
  backgroundColor: string
  alignment: 'left' | 'center'
  fullWidth: boolean
}

const bgMap: Record<string, string> = {
  primary: 'bg-primary-600 text-white',
  dark: 'bg-neutral-900 text-white',
  light: 'bg-neutral-100 text-neutral-900 border border-neutral-200',
}

const buttonStyleMap: Record<string, string> = {
  primary: 'bg-white text-primary-700 hover:bg-primary-50',
  dark: 'bg-white text-neutral-900 hover:bg-neutral-100',
  light: 'bg-primary-500 text-white hover:bg-primary-600',
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

  return (
    <section className={cn('py-16 px-8 rounded-xl', bg)}>
      <div
        className={cn(
          'max-w-3xl mx-auto',
          alignment === 'center' ? 'text-center' : 'text-left'
        )}
      >
        <h2 className="font-heading text-3xl font-bold mb-4">{heading}</h2>
        {description && (
          <p className="text-lg mb-8 opacity-90">{description}</p>
        )}
        {buttonText && (
          <a
            href={buttonLink || '#'}
            className={cn(
              'inline-flex items-center justify-center h-11 px-8 font-semibold text-base rounded-lg transition-colors',
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

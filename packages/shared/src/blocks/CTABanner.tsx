import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { AddItemButton } from './ArrayItemControls'

export interface CTAButton {
  text: string
  link: string
  variant: 'primary' | 'secondary' | 'outline'
}

export interface CTABannerProps {
  heading: string
  description: string
  buttonText: string
  buttonLink: string
  buttons?: CTAButton[]
  backgroundColor: 'primary' | 'dark' | 'light' | 'gradient'
  alignment: 'left' | 'center' | 'right'
  width?: 'full' | 'contained' | 'narrow'
  padding?: 'small' | 'medium' | 'large'
}

const bgMap: Record<string, string> = {
  primary: 'bg-forest-600 text-white',
  dark: 'bg-stone-900 text-white',
  light: 'bg-stone-100 text-stone-900 border border-stone-200',
  gradient: 'text-white',
}

const widthMap: Record<string, string> = {
  full: 'rounded-none',
  contained: 'rounded-2xl',
  narrow: 'rounded-2xl max-w-3xl mx-auto',
}


/** Button styles based on banner background + button variant */
function getButtonClass(bgColor: string, variant: string): string {
  if (variant === 'outline') {
    return bgColor === 'light'
      ? 'border-2 border-stone-400 text-stone-800 hover:bg-stone-200'
      : 'border-2 border-white/40 text-white hover:bg-white/10'
  }
  if (variant === 'secondary') {
    return bgColor === 'light'
      ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
      : 'bg-white/20 text-white hover:bg-white/30'
  }
  // primary
  const btnStyleMap: Record<string, string> = {
    primary: 'bg-white text-forest-700 hover:bg-forest-50 shadow-lg hover:shadow-xl',
    dark: 'bg-white text-stone-900 hover:bg-stone-100 shadow-lg hover:shadow-xl',
    light: 'bg-forest-500 text-white hover:bg-forest-600 shadow-md hover:shadow-lg',
    gradient: 'bg-white text-forest-700 hover:bg-forest-50 shadow-lg hover:shadow-xl',
  }
  return btnStyleMap[bgColor] || btnStyleMap.primary
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function CTABanner({
  heading = 'Ready to get started?',
  description = '',
  buttonText = '',
  buttonLink = '',
  buttons,
  backgroundColor = 'primary',
  alignment = 'center',
  width = 'contained',
  padding = 'medium',
  id,
}: CTABannerProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const descriptionPuck = useInlineEdit('description', description, id || '')
  const buttonTextPuck = useInlineEdit('buttonText', buttonText, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const descriptionEditCtx = useEditableText('description', description)
  const buttonTextEditCtx = useEditableText('buttonText', buttonText)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const descriptionEdit = descriptionPuck || descriptionEditCtx
  const buttonTextEdit = buttonTextPuck || buttonTextEditCtx

  const bg = bgMap[backgroundColor] || bgMap.primary
  const isGradient = backgroundColor === 'gradient'

  // Use buttons array if available, otherwise fall back to single button
  const renderButtons = buttons && buttons.length > 0
    ? buttons
    : buttonText ? [{ text: buttonText, link: buttonLink, variant: 'primary' as const }] : []

  const alignClass = alignment === 'center' ? 'text-center items-center' : alignment === 'right' ? 'text-right items-end' : 'text-left items-start'

  return (
    <div className={cn('mx-auto px-4 sm:px-6', width === 'full' ? '' : '')} style={{ maxWidth: width === 'narrow' ? 'var(--width-narrow)' : 'var(--width-content)' }}>
    <section
      className={cn('relative overflow-hidden', bg, widthMap[width] || widthMap.contained)}
      style={{
        paddingBlock: padding === 'small' ? 'var(--section-xs)' : padding === 'large' ? 'var(--section-lg)' : 'var(--section-md)',
        paddingInline: 'var(--container-px)',
        ...(isGradient ? { background: 'var(--gradient-hero)' } : {}),
      }}
    >
      {isGradient && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      )}
      <div className={cn('relative max-w-3xl flex flex-col', alignClass, alignment === 'center' && 'mx-auto')}>
        <h2 {...editHandlers(headingEdit)} className={cn('text-h2 mb-4', headingEdit?.className)}>{heading}</h2>
        {(description || descriptionEdit) && (
          <p {...editHandlers(descriptionEdit)} className={cn('text-lg mb-8 opacity-90 leading-relaxed', descriptionEdit?.className)}>{description}</p>
        )}
        {renderButtons.length > 0 && (
          <div className={cn('flex flex-wrap gap-3', alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start')}>
            {renderButtons.map((btn, i) => (
              <a
                key={i}
                href={btn.link || '#'}
                className={cn(
                  'inline-flex items-center justify-center h-12 px-8 font-semibold text-base rounded-full transition-all hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
                  getButtonClass(backgroundColor, btn.variant || 'primary')
                )}
              >
                {i === 0 ? (
                  <span {...editHandlers(buttonTextEdit)} className={buttonTextEdit?.className}>{btn.text}</span>
                ) : (
                  btn.text
                )}
                {btn.variant !== 'outline' && <ArrowRight className="ml-2 h-4 w-4" />}
              </a>
            ))}
          </div>
        )}
        <AddItemButton fieldName="buttons" label="Add button" />
      </div>
    </section>
    </div>
  )
}

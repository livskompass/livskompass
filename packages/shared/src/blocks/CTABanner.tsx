import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'

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

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function CTABanner({
  heading = 'Redo att börja?',
  description = '',
  buttonText = 'Boka nu',
  buttonLink = '/utbildningar',
  backgroundColor = 'primary',
  alignment = 'center',
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
  const btnStyle = buttonStyleMap[backgroundColor] || buttonStyleMap.primary
  const isGradient = backgroundColor === 'gradient'

  return (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
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
        <h2 {...editHandlers(headingEdit)} className={cn('text-h2 mb-4', headingEdit?.className)}>{heading}</h2>
        {(description || descriptionEdit) && (
          <p {...editHandlers(descriptionEdit)} className={cn('text-lg mb-8 opacity-90 leading-relaxed', descriptionEdit?.className)}>{description}</p>
        )}
        {buttonText && (
          <a
            href={buttonLink || '#'}
            className={cn(
              'inline-flex items-center justify-center h-12 px-8 font-semibold text-base rounded-full transition-all hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
              btnStyle
            )}
          >
            <span {...editHandlers(buttonTextEdit)} className={buttonTextEdit?.className}>{buttonText}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        )}
      </div>
    </section>
    </div>
  )
}

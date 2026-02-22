import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'
import { useInlineEdit } from '../context'

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
  id,
}: CTABannerProps & { puck?: { isEditing: boolean }; id?: string }) {
  const headingEdit = useInlineEdit('heading', heading, id || '')
  const descriptionEdit = useInlineEdit('description', description, id || '')
  const buttonTextEdit = useInlineEdit('buttonText', buttonText, id || '')

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
        <h2 {...(headingEdit ? { contentEditable: headingEdit.contentEditable, suppressContentEditableWarning: headingEdit.suppressContentEditableWarning, onBlur: headingEdit.onBlur, onKeyDown: headingEdit.onKeyDown, 'data-inline-edit': 'heading' } : {})} className={cn('text-h2 mb-4', headingEdit?.className)}>{heading}</h2>
        {(description || descriptionEdit) && (
          <p {...(descriptionEdit ? { contentEditable: descriptionEdit.contentEditable, suppressContentEditableWarning: descriptionEdit.suppressContentEditableWarning, onBlur: descriptionEdit.onBlur, onKeyDown: descriptionEdit.onKeyDown, 'data-inline-edit': 'description' } : {})} className={cn('text-lg mb-8 opacity-90 leading-relaxed', descriptionEdit?.className)}>{description}</p>
        )}
        {buttonText && (
          <a
            href={buttonLink || '#'}
            className={cn(
              'inline-flex items-center justify-center h-12 px-8 font-semibold text-base rounded-full transition-all hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
              btnStyle
            )}
          >
            <span {...(buttonTextEdit ? { contentEditable: buttonTextEdit.contentEditable, suppressContentEditableWarning: buttonTextEdit.suppressContentEditableWarning, onBlur: buttonTextEdit.onBlur, onKeyDown: buttonTextEdit.onKeyDown, 'data-inline-edit': 'buttonText' } : {})} className={buttonTextEdit?.className}>{buttonText}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        )}
      </div>
    </section>
    </div>
  )
}

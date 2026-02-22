import { Quote } from 'lucide-react'
import { useScrollReveal } from '../helpers'
import { useInlineEdit } from '../context'
import { cn } from '../ui/utils'

export interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar: string
  style: 'card' | 'minimal' | 'featured'
}

/** Helper: extract handlers from inline edit props */
function editHandlers(edit: ReturnType<typeof useInlineEdit>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function Testimonial({
  quote = 'Ett fantastiskt citat här...',
  author = '',
  role = '',
  style = 'card',
  id,
}: TestimonialProps & { puck?: { isEditing: boolean }; id?: string }) {
  const revealRef = useScrollReveal()
  const quoteEdit = useInlineEdit('quote', quote, id || '')
  const authorEdit = useInlineEdit('author', author, id || '')
  const roleEdit = useInlineEdit('role', role, id || '')

  const qHandlers = editHandlers(quoteEdit)
  const aHandlers = editHandlers(authorEdit)
  const rHandlers = editHandlers(roleEdit)

  if (style === 'minimal') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <blockquote className="border-l-[3px] border-forest-400 pl-6 py-2">
          <p {...qHandlers} className={cn('text-lg italic text-stone-700 leading-relaxed', quoteEdit?.className)}>{quote}</p>
          {(author || authorEdit) && (
            <footer className="mt-3 text-sm text-stone-500">
              — <span {...aHandlers} className={authorEdit?.className}>{author}</span>{(role || roleEdit) && <>, <span {...rHandlers} className={roleEdit?.className}>{role}</span></>}
            </footer>
          )}
        </blockquote>
      </div>
    )
  }

  if (style === 'featured') {
    return (
      <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="bg-forest-50 rounded-2xl p-8 md:p-12 border border-forest-100 relative overflow-hidden reveal">
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(62, 123, 87, 0.08) 0%, transparent 70%)' }} />
          <Quote className="absolute top-6 left-6 h-10 w-10 text-forest-200" />
          <blockquote className="relative z-10">
            <p {...qHandlers} className={cn('font-display text-h3 text-stone-800 italic leading-relaxed mb-6', quoteEdit?.className)}>
              &ldquo;{quote}&rdquo;
            </p>
            {(author || authorEdit) && (
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-200 flex items-center justify-center text-forest-700 font-semibold text-sm">
                  {author.charAt(0)}
                </div>
                <div>
                  <div {...aHandlers} className={cn('font-medium text-stone-800', authorEdit?.className)}>{author}</div>
                  {(role || roleEdit) && <div {...rHandlers} className={cn('text-sm text-stone-500', roleEdit?.className)}>{role}</div>}
                </div>
              </footer>
            )}
          </blockquote>
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm border-l-[3px] border-l-amber-400 reveal">
        <p {...qHandlers} className={cn('text-lg text-stone-700 italic mb-4 leading-relaxed', quoteEdit?.className)}>"{quote}"</p>
        {(author || authorEdit) && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium text-xs">
              {author.charAt(0)}
            </div>
            <div>
              <div {...aHandlers} className={cn('font-medium text-stone-800', authorEdit?.className)}>{author}</div>
              {(role || roleEdit) && <div {...rHandlers} className={cn('text-sm text-stone-500', roleEdit?.className)}>{role}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

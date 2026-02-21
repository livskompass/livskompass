import { Quote } from 'lucide-react'
import { useScrollReveal } from '../helpers'

export interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar: string
  style: 'card' | 'minimal' | 'featured'
}

export function Testimonial({
  quote = 'Ett fantastiskt citat här...',
  author = '',
  role = '',
  style = 'card',
}: TestimonialProps) {
  const revealRef = useScrollReveal()

  if (style === 'minimal') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <blockquote className="border-l-[3px] border-forest-400 pl-6 py-2">
          <p className="text-lg italic text-stone-700 leading-relaxed">{quote}</p>
          {author && (
            <footer className="mt-3 text-sm text-stone-500">
              — {author}{role && `, ${role}`}
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
            <p className="font-display text-h3 text-stone-800 italic leading-relaxed mb-6">
              &ldquo;{quote}&rdquo;
            </p>
            {author && (
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-200 flex items-center justify-center text-forest-700 font-semibold text-sm">
                  {author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-stone-800">{author}</div>
                  {role && <div className="text-sm text-stone-500">{role}</div>}
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
        <p className="text-lg text-stone-700 italic mb-4 leading-relaxed">"{quote}"</p>
        {author && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium text-xs">
              {author.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-stone-800">{author}</div>
              {role && <div className="text-sm text-stone-500">{role}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { Quote } from 'lucide-react'

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
  if (style === 'minimal') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <blockquote className="border-l-4 border-primary-400 pl-6 py-2">
          <p className="text-lg italic text-neutral-700 leading-relaxed">{quote}</p>
          {author && (
            <footer className="mt-3 text-sm text-neutral-500">
              — {author}{role && `, ${role}`}
            </footer>
          )}
        </blockquote>
      </div>
    )
  }

  if (style === 'featured') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-primary-50 rounded-xl p-8 md:p-12 border border-primary-100 relative">
          <Quote className="absolute top-6 left-6 h-10 w-10 text-primary-200" />
          <blockquote className="relative z-10">
            <p className="font-heading text-xl md:text-2xl text-neutral-800 italic leading-relaxed mb-6">
              "{quote}"
            </p>
            {author && (
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-neutral-800">{author}</div>
                  {role && <div className="text-sm text-neutral-500">{role}</div>}
                </div>
              </footer>
            )}
          </blockquote>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-sm border-l-4 border-l-accent-400">
        <p className="text-lg text-neutral-700 italic mb-4 leading-relaxed">"{quote}"</p>
        {author && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-medium text-xs">
              {author.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-neutral-800">{author}</div>
              {role && <div className="text-sm text-neutral-500">{role}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

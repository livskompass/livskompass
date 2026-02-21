import { cn } from '../ui/utils'
import { rewriteHtmlMediaUrls } from '../helpers'

export interface RichTextProps {
  content: string
  maxWidth: 'narrow' | 'medium' | 'full'
}

const maxWidthMap = {
  narrow: 'max-w-[65ch]',
  medium: 'max-w-[80ch]',
  full: 'max-w-none',
} as const

export function RichText({
  content = '',
  maxWidth = 'medium',
}: RichTextProps) {
  if (!content) {
    return (
      <div className="py-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
        Klicka för att lägga till text...
      </div>
    )
  }

  return (
    <div
      className={cn(
        'prose prose-lg prose-headings:font-display prose-headings:tracking-tight prose-a:text-forest-600 prose-neutral',
        maxWidthMap[maxWidth]
      )}
      dangerouslySetInnerHTML={{ __html: rewriteHtmlMediaUrls(content) }}
    />
  )
}

import { useCallback, useRef } from 'react'
import { cn } from '../ui/utils'
import { rewriteHtmlMediaUrls } from '../helpers'
import { useInlineEditBlock } from '../context'

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
  const editCtx = useInlineEditBlock()
  const originalRef = useRef(content)

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!editCtx) return
      const newHtml = e.currentTarget.innerHTML
      if (newHtml !== originalRef.current) {
        editCtx.saveBlockProp(editCtx.blockIndex, 'content', newHtml)
        originalRef.current = newHtml
      }
    },
    [editCtx],
  )

  if (!content) {
    return (
      <div className="py-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
        Klicka för att lägga till text...
      </div>
    )
  }

  const baseClass = cn(
    'prose prose-lg prose-headings:font-display prose-headings:tracking-tight prose-a:text-forest-600 prose-neutral',
    maxWidthMap[maxWidth],
  )

  if (editCtx) {
    return (
      <div
        className={cn(baseClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow cursor-text')}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: rewriteHtmlMediaUrls(content) }}
      />
    )
  }

  return (
    <div
      className={baseClass}
      dangerouslySetInnerHTML={{ __html: rewriteHtmlMediaUrls(content) }}
    />
  )
}

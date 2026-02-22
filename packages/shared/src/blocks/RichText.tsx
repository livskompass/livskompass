import { useCallback, useRef } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '../ui/utils'
import { rewriteHtmlMediaUrls } from '../helpers'
import { useInlineEditBlock, useInlineEditHtml } from '../context'

function sanitize(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

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
  id,
}: RichTextProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const puckEdit = useInlineEditHtml('content', content, id || '')

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

  const baseClass = cn(
    'prose prose-lg prose-headings:font-display prose-headings:tracking-tight prose-a:text-forest-600 prose-neutral',
    maxWidthMap[maxWidth],
  )

  const wrapContent = (inner: React.ReactNode) => (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
      {inner}
    </div>
  )

  if (puckEdit) {
    if (!content) {
      return wrapContent(
        <div
          className={cn(baseClass, puckEdit.className, 'min-h-[3em]')}
          contentEditable={puckEdit.contentEditable}
          suppressContentEditableWarning={puckEdit.suppressContentEditableWarning}
          onBlur={puckEdit.onBlur}
          data-placeholder="Klicka för att lägga till text..."
        />
      )
    }
    return wrapContent(
      <div
        className={cn(baseClass, puckEdit.className)}
        contentEditable={puckEdit.contentEditable}
        suppressContentEditableWarning={puckEdit.suppressContentEditableWarning}
        onBlur={puckEdit.onBlur}
        dangerouslySetInnerHTML={{ __html: rewriteHtmlMediaUrls(content) }}
      />
    )
  }

  if (editCtx) {
    return wrapContent(
      <div
        className={cn(baseClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow cursor-text', !content && 'min-h-[3em]')}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        {...(content
          ? { dangerouslySetInnerHTML: { __html: rewriteHtmlMediaUrls(content) } }
          : { 'data-placeholder': 'Klicka för att lägga till text...' }
        )}
      />
    )
  }

  if (!content) return null

  return wrapContent(
    <div
      className={baseClass}
      dangerouslySetInnerHTML={{ __html: sanitize(rewriteHtmlMediaUrls(content)) }}
    />
  )
}

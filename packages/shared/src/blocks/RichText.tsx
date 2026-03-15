import { useContext, useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '../ui/utils'
import { rewriteHtmlMediaUrls } from '../helpers'
import { useInlineEditBlock, useInlineEditHtml, InlineRichTextContext } from '../context'

function sanitize(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

export interface RichTextProps {
  content: string
  maxWidth: 'narrow' | 'medium' | 'full'
  alignment?: 'left' | 'center'
  fontSize?: 'small' | 'normal' | 'large'
}

const maxWidthMap = {
  narrow: 'max-w-[65ch]',
  medium: 'max-w-[80ch]',
  full: 'max-w-none',
} as const

const fontSizeMap = {
  small: 'prose-sm',
  normal: 'prose-lg',
  large: 'prose-xl',
} as const

export function RichText({
  content = '',
  maxWidth = 'medium',
  alignment = 'left',
  fontSize = 'normal',
  id,
}: RichTextProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const puckEdit = useInlineEditHtml('content', content, id || '')

  const editCtx = useInlineEditBlock()
  const rtCtx = useContext(InlineRichTextContext)

  // Click-to-edit state for Tiptap
  const [editing, setEditing] = useState(false)
  const [localContent, setLocalContent] = useState(content)

  // Sync local content when prop changes from parent
  useEffect(() => { setLocalContent(content) }, [content])

  const baseClass = cn(
    'prose prose-headings:font-display prose-headings:tracking-tight prose-a:text-forest-600 prose-neutral',
    fontSizeMap[fontSize] || fontSizeMap.normal,
    maxWidthMap[maxWidth],
    alignment === 'center' && 'text-center',
  )

  const wrapContent = (inner: React.ReactNode) => (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
      {inner}
    </div>
  )

  // Puck iframe editing (legacy contentEditable for Puck compatibility)
  if (puckEdit) {
    if (!content) {
      return wrapContent(
        <div
          className={cn(baseClass, puckEdit.className, 'min-h-[3em]')}
          contentEditable={puckEdit.contentEditable}
          suppressContentEditableWarning={puckEdit.suppressContentEditableWarning}
          onBlur={puckEdit.onBlur}
          data-placeholder="Click to add text..."
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

  // Admin inline editor with Tiptap
  if (editCtx && rtCtx) {
    if (editing) {
      const Editor = rtCtx.Editor
      return wrapContent(
        <Editor
          content={rewriteHtmlMediaUrls(localContent)}
          className={cn(baseClass, 'outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow', !localContent && 'min-h-[3em]')}
          placeholder="Click to add text..."
          onSave={(html) => {
            setLocalContent(html)
            editCtx.saveBlockProp(editCtx.blockIndex, 'content', html)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      )
    }

    // Static HTML with click-to-edit
    return wrapContent(
      <div
        className={cn(baseClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 rounded-sm transition-shadow cursor-text', !localContent && 'min-h-[3em]')}
        onClick={() => setEditing(true)}
        {...(localContent
          ? { dangerouslySetInnerHTML: { __html: rewriteHtmlMediaUrls(localContent) } }
          : {}
        )}
        data-placeholder={!localContent ? 'Click to add text...' : undefined}
      />
    )
  }

  // Admin without Tiptap context — fallback to contentEditable (shouldn't happen but safe)
  if (editCtx) {
    return wrapContent(
      <div
        className={cn(baseClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow cursor-text', !content && 'min-h-[3em]')}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const newHtml = e.currentTarget.innerHTML
          if (newHtml !== content) {
            editCtx.saveBlockProp(editCtx.blockIndex, 'content', newHtml)
          }
        }}
        {...(content
          ? { dangerouslySetInnerHTML: { __html: rewriteHtmlMediaUrls(content) } }
          : { 'data-placeholder': 'Click to add text...' }
        )}
      />
    )
  }

  // Public site: render static HTML
  if (!content) return null

  return wrapContent(
    <div
      className={baseClass}
      dangerouslySetInnerHTML={{ __html: sanitize(rewriteHtmlMediaUrls(content)) }}
    />
  )
}

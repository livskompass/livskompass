import { useState, useContext, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '../ui/utils'
import { ChevronDown } from 'lucide-react'
import { rewriteHtmlMediaUrls } from '../helpers'
import { useInlineEdit, useEditableText, useInlineEditBlock, InlineRichTextContext, InlineArrayOpsContext } from '../context'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

function sanitize(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

export interface AccordionItem {
  question: string
  answer: string
}

export interface AccordionProps {
  heading: string
  items: AccordionItem[]
  defaultOpen: 'none' | 'first' | 'all'
  style: 'default' | 'bordered' | 'minimal'
  iconPosition?: 'left' | 'right'
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function AccordionItemComponent({
  item,
  index,
  isOpen,
  onToggle,
  style,
  iconPosition = 'right',
  totalItems,
}: {
  item: AccordionItem
  index: number
  isOpen: boolean
  onToggle: () => void
  style: AccordionProps['style']
  iconPosition?: 'left' | 'right'
  totalItems: number
}) {
  const questionEdit = useEditableText(`items[${index}].question`, item.question)

  // Answers are rich HTML (links, paragraphs) — edited with the Tiptap editor
  // in admin, rendered sanitized on the public site. Legacy plain-text answers
  // pass through unchanged (text without tags is valid HTML).
  const editCtx = useInlineEditBlock()
  const rtCtx = useContext(InlineRichTextContext)
  const [editingAnswer, setEditingAnswer] = useState(false)
  const [localAnswer, setLocalAnswer] = useState(item.answer)
  useEffect(() => { setLocalAnswer(item.answer) }, [item.answer])

  const answerClass = cn(
    'pb-4 text-secondary leading-relaxed',
    style === 'minimal' ? 'px-0' : 'px-5',
    // Rich-text niceties: paragraph spacing + accent-colored links
    '[&_p+p]:mt-3 [&_a]:text-accent [&_a]:underline [&_a:hover]:opacity-80 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
  )

  const saveAnswer = (html: string) => {
    setLocalAnswer(html)
    editCtx?.saveBlockProp(editCtx.blockIndex, `items[${index}].answer`, html)
  }

  let answerContent: React.ReactNode
  if (editCtx && rtCtx && editingAnswer) {
    const Editor = rtCtx.Editor
    answerContent = (
      <Editor
        content={rewriteHtmlMediaUrls(localAnswer)}
        className={cn(answerClass, 'outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow', !localAnswer && 'min-h-[2em]')}
        placeholder="Skriv svaret..."
        onSave={(html) => { saveAnswer(html); setEditingAnswer(false) }}
        onCancel={() => setEditingAnswer(false)}
      />
    )
  } else if (editCtx && rtCtx) {
    answerContent = (
      <div
        className={cn(answerClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 rounded-sm transition-shadow cursor-text', !localAnswer && 'min-h-[2em]')}
        onClick={() => setEditingAnswer(true)}
        {...(localAnswer ? { dangerouslySetInnerHTML: { __html: sanitize(rewriteHtmlMediaUrls(localAnswer)) } } : {})}
      />
    )
  } else if (editCtx) {
    // Admin without Tiptap context (e.g. the public-site edit overlay) —
    // contentEditable HTML keeps existing links intact while allowing text edits.
    answerContent = (
      <div
        className={cn(answerClass, 'outline-none hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow cursor-text', !localAnswer && 'min-h-[2em]')}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const html = e.currentTarget.innerHTML
          if (html !== localAnswer) saveAnswer(html)
        }}
        {...(localAnswer ? { dangerouslySetInnerHTML: { __html: sanitize(rewriteHtmlMediaUrls(localAnswer)) } } : {})}
      />
    )
  } else {
    answerContent = (
      <div
        className={answerClass}
        dangerouslySetInnerHTML={{ __html: sanitize(rewriteHtmlMediaUrls(item.answer)) }}
      />
    )
  }

  const chevron = (
    <ChevronDown
      className={cn(
        'h-5 w-5 text-faint shrink-0 transition-transform duration-300',
        isOpen && 'rotate-180',
        iconPosition === 'right' ? 'ml-4' : 'mr-4'
      )}
    />
  )

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    <div className={cn(style !== 'minimal' && 'overflow-hidden')}>
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center py-4 px-5 text-left font-medium text-foreground hover:bg-surface transition-colors',
          iconPosition === 'right' ? 'justify-between' : 'flex-row',
          style === 'minimal' && 'px-0'
        )}
        aria-expanded={isOpen}
      >
        {iconPosition === 'left' && chevron}
        <span {...editHandlers(questionEdit)} className={questionEdit?.className}>{item.question}</span>
        {iconPosition === 'right' && chevron}
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">{answerContent}</div>
      </div>
    </div>
    </ArrayItemControls>
  )
}

export function Accordion({
  heading = '',
  items = [],
  defaultOpen = 'none',
  style = 'default',
  iconPosition = 'right',
  id,
}: AccordionProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  // When item controls are shown (admin editor), the drag grips hang outside
  // the rounded container — overflow-hidden would clip them and make the
  // drag handle unclickable, so only clip on the public site.
  const rootEditCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)
  const showsItemControls = !!(rootEditCtx && arrayOps)

  const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
    if (defaultOpen === 'all') return new Set(items.map((_, i) => i))
    if (defaultOpen === 'first' && items.length > 0) return new Set([0])
    return new Set()
  })

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
        <div className="py-8 text-center text-faint border-2 border-dashed border-default rounded-lg">
          Add questions in settings...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h3 mb-6', headingEdit?.className)}>{heading}</h2>
      )}
      <div
        className={cn(
          style !== 'minimal' && 'divide-y divide-default',
          style === 'default' && 'border border-default rounded-xl bg-surface-elevated',
          style === 'bordered' && 'border-2 border-strong rounded-xl bg-surface-elevated',
          style !== 'minimal' && (showsItemControls ? 'overflow-visible' : 'overflow-hidden'),
          style === 'minimal' && 'divide-y divide-default'
        )}
      >
        <ArrayDragProvider fieldName="items">
        {items.map((item, index) => (
          <AccordionItemComponent
            key={index}
            item={item}
            index={index}
            isOpen={openIndices.has(index)}
            onToggle={() => toggle(index)}
            style={style}
            iconPosition={iconPosition}
            totalItems={items.length}
          />
        ))}
        </ArrayDragProvider>
      </div>
      <AddItemButton fieldName="items" label="Add question" />
    </div>
  )
}

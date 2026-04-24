import { useScrollReveal } from '../helpers'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { cn } from '../ui/utils'
import { InlineImage } from './InlineImage'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

export interface TestimonialItem {
  quote: string
  author: string
  role: string
  avatar: string
}

export interface TestimonialProps {
  /** Legacy single-item props (backward compat) */
  quote?: string
  author?: string
  role?: string
  avatar?: string
  /** Multi-testimonial items array */
  items?: TestimonialItem[]
  style: 'card' | 'minimal' | 'featured'
  showQuoteIcon?: boolean
  displayMode?: 'single' | 'carousel' | 'grid'
  autoPlaySpeed?: number
}

/** Helper: extract handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText> | ReturnType<typeof useInlineEdit>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

/** Detect empty / placeholder ("Test") values so we can render sample copy in their place. */
function isPlaceholder(v?: string) {
  const s = (v || '').trim()
  if (!s) return true
  if (s.length < 6 && /^test\b/i.test(s)) return true
  return false
}

const DUMMY_QUOTE = 'Kursen gav mig konkreta verktyg jag använder varje dag — både i mitt arbete och i mitt privatliv.'
const DUMMY_AUTHOR = 'Exempel Namn'
const DUMMY_ROLE = 'Deltagare, ACT-utbildning'

function displayValues(item: TestimonialItem) {
  return {
    quote: isPlaceholder(item.quote) ? DUMMY_QUOTE : item.quote,
    author: isPlaceholder(item.author) ? DUMMY_AUTHOR : item.author,
    role: isPlaceholder(item.role) ? DUMMY_ROLE : item.role,
  }
}

// ── Single testimonial card (reused by all display modes) ──

function TestimonialCard({
  item,
  index,
  style,
  showQuoteIcon: _showQuoteIcon = true,
  totalItems,
  isArrayItem,
}: {
  item: TestimonialItem
  index: number
  style: TestimonialProps['style']
  showQuoteIcon?: boolean
  totalItems: number
  /** Whether this is rendered inside the items array (enables ArrayItemControls) */
  isArrayItem: boolean
}) {
  const quoteEdit = useEditableText(`items[${index}].quote`, item.quote)
  const authorEdit = useEditableText(`items[${index}].author`, item.author)
  const roleEdit = useEditableText(`items[${index}].role`, item.role)

  const qHandlers = editHandlers(quoteEdit)
  const aHandlers = editHandlers(authorEdit)
  const rHandlers = editHandlers(roleEdit)

  // Swap in sample copy for empty/"Test" values so every card reads as a
  // real testimonial at a glance. Editing still writes the user's real text.
  const d = displayValues(item)

  const content = (
    <>
      {style === 'minimal' ? (
        <blockquote className="border-l-[3px] border-forest-400 pl-6 py-2">
          <p
            {...qHandlers}
            className={cn('text-body-lg italic text-foreground leading-relaxed', quoteEdit?.className)}
          >
            {d.quote}
          </p>
          <footer className="mt-3 text-body-sm text-muted">
            &mdash;{' '}
            <span {...aHandlers} className={authorEdit?.className}>
              {d.author}
            </span>
            ,{' '}
            <span {...rHandlers} className={roleEdit?.className}>
              {d.role}
            </span>
          </footer>
        </blockquote>
      ) : style === 'featured' ? (
        <div className="bg-accent-soft rounded-2xl p-8 md:p-12 border border-forest-100 relative overflow-hidden h-full">
          <div
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: 'var(--gradient-testimonial-glow)' }}
          />
          <blockquote className="relative z-10">
            <p
              {...qHandlers}
              className={cn(
                'font-display text-h3 text-foreground italic leading-relaxed mb-6',
                quoteEdit?.className,
              )}
            >
              {d.quote}
            </p>
            <footer className="flex items-center gap-3">
              {item.avatar ? (
                <InlineImage
                  src={item.avatar}
                  propName={`items[${index}].avatar`}
                  alt={d.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-forest-200 flex items-center justify-center text-accent-hover font-semibold text-body-sm">
                  {d.author.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div
                  {...aHandlers}
                  className={cn('font-medium text-foreground', authorEdit?.className)}
                >
                  {d.author}
                </div>
                <div
                  {...rHandlers}
                  className={cn('text-body-sm text-muted', roleEdit?.className)}
                >
                  {d.role}
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      ) : (
        /* card style (default) */
        <div className="bg-surface-elevated rounded-xl p-8 border border-default shadow-sm border-l-[3px] border-l-amber-400 h-full flex flex-col">
          <p
            {...qHandlers}
            className={cn(
              'text-body-lg text-foreground italic mb-4 leading-relaxed flex-1',
              quoteEdit?.className,
            )}
          >
            {d.quote}
          </p>
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-default">
            {item.avatar ? (
              <InlineImage
                src={item.avatar}
                propName={`items[${index}].avatar`}
                alt={d.author}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-secondary font-medium text-caption">
                {d.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div
                {...aHandlers}
                className={cn('font-medium text-foreground', authorEdit?.className)}
              >
                {d.author}
              </div>
              <div
                {...rHandlers}
                className={cn('text-body-sm text-muted', roleEdit?.className)}
              >
                {d.role}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (isArrayItem) {
    return (
      <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
        {content}
      </ArrayItemControls>
    )
  }
  return content
}

// ── Main Testimonial block ──

export function Testimonial({
  quote,
  author,
  role,
  avatar,
  items = [],
  style = 'card',
  showQuoteIcon: _showQuoteIcon = true,
  displayMode = 'carousel',
  autoPlaySpeed = 5,
  id: _id,
}: TestimonialProps & { puck?: { isEditing: boolean }; id?: string }) {
  const revealRef = useScrollReveal()

  // Backward compatibility: if items is empty but legacy props exist, build a single item
  const resolvedItems: TestimonialItem[] =
    items && items.length > 0
      ? items
      : quote || author
        ? [{ quote: quote || '', author: author || '', role: role || '', avatar: avatar || '' }]
        : []

  // For single mode or only 1 item, show single (with legacy inline-edit support)
  if (displayMode === 'single' || resolvedItems.length <= 1) {
    const item = resolvedItems[0]
    if (!item) {
      return (
        <div
          className="mx-auto"
          style={{
            maxWidth: 'var(--width-narrow)',
            paddingInline: 'var(--container-px)',
            paddingBlock: 'var(--section-md)',
          }}
        >
          <div className="py-8 text-center text-faint border-2 border-dashed border-default rounded-lg">
            Add testimonials in settings...
          </div>
          <AddItemButton fieldName="items" label="Add testimonial" />
        </div>
      )
    }

    return (
      <div
        ref={revealRef}
        className="mx-auto reveal"
        style={{
          maxWidth: 'var(--width-narrow)',
          paddingInline: 'var(--container-px)',
          paddingBlock: style === 'minimal' ? 'var(--section-sm)' : 'var(--section-md)',
        }}
      >
        <ArrayDragProvider fieldName="items">
          <TestimonialCard
            item={item}
            index={0}
            style={style}
            showQuoteIcon={false}
            totalItems={resolvedItems.length}
            isArrayItem={resolvedItems.length > 0 && items && items.length > 0}
          />
        </ArrayDragProvider>
        <AddItemButton fieldName="items" label="Add testimonial" />
      </div>
    )
  }

  // Carousel mode — infinite horizontal marquee
  if (displayMode === 'carousel') {
    // Fill enough cards to cover 2x viewport width (400px card + 24px gap = 424px each)
    const minCards = Math.ceil(3200 / 424)
    const repeatCount = Math.max(Math.ceil(minCards / resolvedItems.length), 2)
    const oneSet = Array.from({ length: repeatCount }, () => resolvedItems).flat()
    const marqueeItems = [...oneSet, ...oneSet] // duplicate full set for seamless loop
    const speed = Math.max(autoPlaySpeed, 1) * oneSet.length * 3 // scale with item count

    return (
      <div
        ref={revealRef}
        className="reveal"
        style={{ paddingBlock: 'var(--section-md)', overflow: 'hidden', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
      >
        <div
          className="flex gap-6 hover:[animation-play-state:paused]"
          style={{
            animation: `testimonial-marquee ${speed}s linear infinite`,
            width: 'max-content',
          }}
        >
          {marqueeItems.map((item, i) => {
            const d = displayValues(item)
            return (
              <div
                key={i}
                className="w-[400px] flex-shrink-0 rounded-lg p-8 flex flex-col bg-mist"
              >
                <p className="text-body-lg text-brand italic leading-relaxed mb-6 flex-1">
                  {d.quote}
                </p>
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img src={item.avatar} alt={d.author} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-forest-300 flex items-center justify-center text-brand font-semibold text-body-sm">
                      {d.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-brand">{d.author}</div>
                    <div className="text-body-sm text-accent">{d.role}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* In editor only — show compact editable list */}
        {typeof window !== 'undefined' && (window.location.port === '3001' || window.location.hostname.includes('admin')) && (
        <div className="mt-4 puck-overlay" data-edit-overlay="" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          <ArrayDragProvider fieldName="items">
            <EditableItemsList
              items={resolvedItems}
              style="featured"
              showQuoteIcon={false}
            />
          </ArrayDragProvider>
          <AddItemButton fieldName="items" label="Add testimonial" />
        </div>
        )}
      </div>
    )
  }

  // Grid mode
  return (
    <div
      ref={revealRef}
      className="mx-auto reveal"
      style={{
        maxWidth: 'var(--width-content)',
        paddingInline: 'var(--container-px)',
        paddingBlock: 'var(--section-md)',
      }}
    >
      <ArrayDragProvider fieldName="items">
        <div
          className={cn(
            'grid grid-cols-1 gap-6',
            resolvedItems.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {resolvedItems.map((item, i) => (
            <TestimonialCard
              key={i}
              item={item}
              index={i}
              style={style}
              showQuoteIcon={false}
              totalItems={resolvedItems.length}
              isArrayItem
            />
          ))}
        </div>
      </ArrayDragProvider>
      <AddItemButton fieldName="items" label="Add testimonial" />
    </div>
  )
}

// ── Editable items list (visible only in editor for carousel mode) ──

function EditableItemsList({
  items,
  style,
  showQuoteIcon: _sqi,
}: {
  items: TestimonialItem[]
  style: TestimonialProps['style']
  showQuoteIcon?: boolean
}) {
  const editCtx = useInlineEditBlock()

  // Only show in editor mode
  if (!editCtx) return null

  return (
    <div className="space-y-3 border-2 border-dashed border-default rounded-lg p-4 bg-surface/50">
      <div className="text-caption font-medium text-faint uppercase tracking-wider mb-2">
        All testimonials (edit here)
      </div>
      {items.map((item, i) => (
        <TestimonialCard
          key={i}
          item={item}
          index={i}
          style={style}
          showQuoteIcon={false}
          totalItems={items.length}
          isArrayItem
        />
      ))}
    </div>
  )
}

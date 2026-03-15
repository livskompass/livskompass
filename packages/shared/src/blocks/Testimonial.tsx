import { useState, useEffect, useCallback, useRef } from 'react'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
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

// ── Single testimonial card (reused by all display modes) ──

function TestimonialCard({
  item,
  index,
  style,
  showQuoteIcon = true,
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

  const content = (
    <>
      {style === 'minimal' ? (
        <blockquote className="border-l-[3px] border-forest-400 pl-6 py-2">
          <p
            {...qHandlers}
            className={cn('text-lg italic text-stone-700 leading-relaxed', quoteEdit?.className)}
          >
            {item.quote}
          </p>
          {(item.author || authorEdit) && (
            <footer className="mt-3 text-sm text-stone-500">
              &mdash;{' '}
              <span {...aHandlers} className={authorEdit?.className}>
                {item.author}
              </span>
              {(item.role || roleEdit) && (
                <>
                  ,{' '}
                  <span {...rHandlers} className={roleEdit?.className}>
                    {item.role}
                  </span>
                </>
              )}
            </footer>
          )}
        </blockquote>
      ) : style === 'featured' ? (
        <div className="bg-forest-50 rounded-2xl p-8 md:p-12 border border-forest-100 relative overflow-hidden h-full">
          <div
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: 'var(--gradient-testimonial-glow)' }}
          />
          {showQuoteIcon !== false && (
            <Quote className="absolute top-6 left-6 h-10 w-10 text-forest-200" />
          )}
          <blockquote className="relative z-10">
            <p
              {...qHandlers}
              className={cn(
                'font-display text-h3 text-stone-800 italic leading-relaxed mb-6',
                quoteEdit?.className,
              )}
            >
              &ldquo;{item.quote}&rdquo;
            </p>
            {(item.author || authorEdit) && (
              <footer className="flex items-center gap-3">
                {item.avatar ? (
                  <InlineImage
                    src={item.avatar}
                    propName={`items[${index}].avatar`}
                    alt={item.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-forest-200 flex items-center justify-center text-forest-700 font-semibold text-sm">
                    {item.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div
                    {...aHandlers}
                    className={cn('font-medium text-stone-800', authorEdit?.className)}
                  >
                    {item.author}
                  </div>
                  {(item.role || roleEdit) && (
                    <div
                      {...rHandlers}
                      className={cn('text-sm text-stone-500', roleEdit?.className)}
                    >
                      {item.role}
                    </div>
                  )}
                </div>
              </footer>
            )}
          </blockquote>
        </div>
      ) : (
        /* card style (default) */
        <div className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm border-l-[3px] border-l-amber-400 h-full flex flex-col">
          {showQuoteIcon !== false && (
            <Quote className="h-6 w-6 text-amber-300 mb-3 shrink-0" />
          )}
          <p
            {...qHandlers}
            className={cn(
              'text-lg text-stone-700 italic mb-4 leading-relaxed flex-1',
              quoteEdit?.className,
            )}
          >
            &ldquo;{item.quote}&rdquo;
          </p>
          {(item.author || authorEdit) && (
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-stone-100">
              {item.avatar ? (
                <InlineImage
                  src={item.avatar}
                  propName={`items[${index}].avatar`}
                  alt={item.author}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium text-xs">
                  {item.author.charAt(0)}
                </div>
              )}
              <div>
                <div
                  {...aHandlers}
                  className={cn('font-medium text-stone-800', authorEdit?.className)}
                >
                  {item.author}
                </div>
                {(item.role || roleEdit) && (
                  <div
                    {...rHandlers}
                    className={cn('text-sm text-stone-500', roleEdit?.className)}
                  >
                    {item.role}
                  </div>
                )}
              </div>
            </div>
          )}
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

// ── Carousel component ──

function TestimonialCarousel({
  items,
  style,
  showQuoteIcon,
  autoPlaySpeed = 5,
}: {
  items: TestimonialItem[]
  style: TestimonialProps['style']
  showQuoteIcon?: boolean
  autoPlaySpeed?: number
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (isTransitioning) return
      setDirection(dir)
      setIsTransitioning(true)
      // After fade-out, switch slide
      setTimeout(() => {
        setActiveIndex(index)
        // After switching, start fade-in
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    },
    [isTransitioning],
  )

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % items.length, 'right')
  }, [activeIndex, items.length, goTo])

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + items.length) % items.length, 'left')
  }, [activeIndex, items.length, goTo])

  // Auto-play
  useEffect(() => {
    if (isHovered || items.length <= 1) return
    timerRef.current = setInterval(goNext, autoPlaySpeed * 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isHovered, goNext, autoPlaySpeed, items.length])

  if (items.length === 0) return null

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide container */}
      <div className="overflow-hidden">
        <div
          className="transition-all duration-500 ease-in-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning
              ? `translateX(${direction === 'right' ? '-20px' : '20px'})`
              : 'translateX(0)',
          }}
        >
          <TestimonialCard
            item={items[activeIndex]}
            index={activeIndex}
            style={style}
            showQuoteIcon={showQuoteIcon}
            totalItems={items.length}
            isArrayItem={false}
          />
        </div>
      </div>

      {/* Arrow buttons (visible on hover) */}
      {items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg border border-stone-200 text-stone-600 hover:text-stone-900 z-20"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2.5 shadow-lg border border-stone-200 text-stone-600 hover:text-stone-900 z-20"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots navigation */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > activeIndex ? 'right' : 'left')}
              className={cn(
                'rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-8 h-2.5 bg-forest-500'
                  : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400',
              )}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Testimonial block ──

export function Testimonial({
  quote,
  author,
  role,
  avatar,
  items = [],
  style = 'card',
  showQuoteIcon = true,
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
          <div className="py-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
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
            showQuoteIcon={showQuoteIcon}
            totalItems={resolvedItems.length}
            isArrayItem={resolvedItems.length > 0 && items && items.length > 0}
          />
        </ArrayDragProvider>
        <AddItemButton fieldName="items" label="Add testimonial" />
      </div>
    )
  }

  // Carousel mode
  if (displayMode === 'carousel') {
    return (
      <div
        ref={revealRef}
        className="mx-auto reveal"
        style={{
          maxWidth: 'var(--width-narrow)',
          paddingInline: 'var(--container-px)',
          paddingBlock: 'var(--section-md)',
        }}
      >
        <TestimonialCarousel
          items={resolvedItems}
          style={style}
          showQuoteIcon={showQuoteIcon}
          autoPlaySpeed={autoPlaySpeed}
        />
        {/* In editor, show all items below the carousel for editing */}
        <div className="mt-4">
          <ArrayDragProvider fieldName="items">
            <EditableItemsList
              items={resolvedItems}
              style={style}
              showQuoteIcon={showQuoteIcon}
            />
          </ArrayDragProvider>
          <AddItemButton fieldName="items" label="Add testimonial" />
        </div>
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
              showQuoteIcon={showQuoteIcon}
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
  showQuoteIcon,
}: {
  items: TestimonialItem[]
  style: TestimonialProps['style']
  showQuoteIcon?: boolean
}) {
  const editCtx = useInlineEditBlock()

  // Only show in editor mode
  if (!editCtx) return null

  return (
    <div className="space-y-3 border-2 border-dashed border-stone-200 rounded-lg p-4 bg-stone-50/50">
      <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
        All testimonials (edit here)
      </div>
      {items.map((item, i) => (
        <TestimonialCard
          key={i}
          item={item}
          index={i}
          style={style}
          showQuoteIcon={showQuoteIcon}
          totalItems={items.length}
          isArrayItem
        />
      ))}
    </div>
  )
}

import { cn } from '../ui/utils'
import { useFetchJson, useScrollReveal } from '../helpers'
import { EditItemBadge } from './EditItemBadge'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { getCardColors } from './cardColors'
import { getButtonStyle } from './buttonUtils'

export interface CourseListProps {
  heading: string
  maxItems: number
  columns: 2 | 3
  showBookButton: boolean
  compactMode: boolean
  showLocation?: boolean
  showPrice?: boolean
  readMoreText: string
  bookButtonText: string
  fullLabel: string
  spotsText: string
  emptyText: string
  cardColor?: string
}

interface Course {
  id: string
  slug: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
  current_participants: number
  status: string
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function formatDateRange(start: string, end: string | null): string {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (!end) {
    return s.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })
  }
  const e = new Date(end)
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })}`
  }
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })
  }
  return `${s.toLocaleDateString('sv-SE', opts)} – ${e.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })}`
}

export function CourseList({
  heading = '',
  maxItems = 0,
  columns = 2,
  showBookButton = true,
  compactMode = false,
  showLocation = true,
  showPrice = true,
  readMoreText = 'Read more',
  bookButtonText = 'Book a spot',
  fullLabel = 'Fully booked',
  spotsText = 'spots left',
  emptyText = 'There are no courses scheduled right now.',
  cardColor = 'mist',
  id,
}: CourseListProps & { puck?: { isEditing: boolean }; id?: string }) {
  const colors = getCardColors(cardColor)
  const { data, loading } = useFetchJson<{ courses: Course[] }>('/courses')
  const courses = data?.courses || []
  const displayed = maxItems > 0 ? courses.slice(0, maxItems) : courses
  const revealRef = useScrollReveal()
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  // Template text inline editing
  const readMoreEdit = useEditableText('readMoreText', readMoreText)
  const bookBtnEdit = useEditableText('bookButtonText', bookButtonText)
  const fullLabelEdit = useEditableText('fullLabel', fullLabel)
  const emptyTextEdit = useEditableText('emptyText', emptyText)

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const { variantClass: bookBtnClass, Icon: BookBtnIcon } = getButtonStyle(btnStyles, 'bookButtonText', 'primary', 'arrow-right')
  const { variantClass: readMoreClass, Icon: ReadMoreIcon } = getButtonStyle(btnStyles, 'readMoreText', 'ghost', '')

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-foreground mb-8 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[2])}>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-default bg-surface-elevated p-6 animate-pulse">
              <div className="h-5 bg-surface-alt rounded w-1/4 mb-3" />
              <div className="h-6 bg-surface-alt rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-alt rounded w-full mb-2" />
              <div className="h-4 bg-surface-alt rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className={cn('grid grid-cols-1 gap-6 reveal', colMap[columns] || colMap[2])}>
          {displayed.map((course) => {
            const isFull = course.status === 'full'
            const hasCapacity = course.max_participants != null
            const spotsLeft = hasCapacity ? course.max_participants - course.current_participants : null
            return (
              <div key={course.slug} className={cn('relative group rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', colors.bg)}>
                <EditItemBadge cmsRoute="courses" entityId={course.id} label="Edit course" />
                <div className="p-6">
                  {(isFull || hasCapacity) && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-caption font-semibold px-2.5 py-1 rounded-full',
                      isFull
                        ? 'bg-amber-50 text-highlight'
                        : colors.badge
                    )}>
                      {isFull ? <span {...editHandlers(fullLabelEdit)} className={fullLabelEdit?.className}>{fullLabel}</span> : `${spotsLeft} ${spotsText}`}
                    </span>
                  </div>
                  )}
                  <h3 className={cn('text-h4 mb-2', colors.text)}>{course.title}</h3>
                  {!compactMode && course.description && (
                    <p className={cn('text-body-sm line-clamp-2 mb-4', colors.textMuted)}>{course.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p>
                  )}
                  <div className={cn('flex flex-wrap gap-4 text-body-sm', colors.textMuted, compactMode ? 'mb-3' : 'mb-5')}>
                    {showLocation !== false && course.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />{course.location}
                      </span>
                    )}
                    {course.start_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDateRange(course.start_date, course.end_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {showPrice !== false && course.price_sek != null ? (
                    <span className={cn('font-display text-h3', colors.text)}>
                      {course.price_sek.toLocaleString('sv-SE')} <span className={cn('font-normal', colors.textMuted)}>kr</span>
                    </span>
                    ) : <span />}
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={`/utbildningar/${course.slug}`}
                        className={cn('inline-flex items-center h-9 px-4 text-body-sm font-medium rounded-lg transition-colors', btnStyles ? readMoreClass : (cardColor === 'dark' ? 'text-highlight-soft hover:text-amber-200 hover:bg-amber-300/10' : 'text-accent hover:text-accent-hover hover:bg-accent-soft'))}
                      >
                        <span {...editHandlers(readMoreEdit)} className={readMoreEdit?.className}>{readMoreText}</span>
                        {ReadMoreIcon && <ReadMoreIcon className="ml-1.5 h-3.5 w-3.5" />}
                      </a>
                      {showBookButton && !isFull && (
                        <a
                          href={`/utbildningar/${course.slug}/boka`}
                          className={cn('inline-flex items-center h-9 px-4 text-body-sm font-medium rounded-lg transition-all active:scale-[0.97]', btnStyles ? bookBtnClass : (cardColor === 'dark' ? 'bg-highlight-soft text-brand hover:bg-amber-200' : 'bg-forest-500 text-white hover:bg-forest-600'))}
                        >
                          <span {...editHandlers(bookBtnEdit)} className={bookBtnEdit?.className}>{bookButtonText}</span>
                          {BookBtnIcon ? <BookBtnIcon className="ml-1.5 h-3.5 w-3.5" /> : (!btnStyles && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-faint border-2 border-dashed border-default rounded-xl">
          <span {...editHandlers(emptyTextEdit)} className={emptyTextEdit?.className}>{emptyText}</span>
        </div>
      )}
    </div>
  )
}

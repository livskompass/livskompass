import { cn } from '../ui/utils'
import { useFetchJson, useScrollReveal, formatSwedishDateRange, extractCourseImage, resolveMediaUrl } from '../helpers'
import { EditItemBadge } from './EditItemBadge'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { getCardColors } from './cardColors'
import { Price } from './Price'

export interface CourseListProps {
  heading: string
  maxItems: number
  columns: 2 | 3
  showBookButton?: boolean
  compactMode: boolean
  showLocation?: boolean
  showPrice?: boolean
  readMoreText?: string
  bookButtonText?: string
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
  content_blocks?: string | null
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
  current_participants: number
  status: string
}

const colMap: Record<number, string> = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function CourseList({
  heading = '',
  maxItems = 0,
  columns = 2,
  compactMode = false,
  showLocation = true,
  showPrice = true,
  readMoreText = 'View course',
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
  const readMoreEdit = useEditableText('readMoreText', readMoreText || 'View course')
  const fullLabelEdit = useEditableText('fullLabel', fullLabel)
  const emptyTextEdit = useEditableText('emptyText', emptyText)

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h3 mb-8 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] ?? colMap[2])}>
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
        <div className={cn('grid grid-cols-1 gap-6 reveal', colMap[columns] ?? colMap[2])}>
          {displayed.map((course) => {
            const isFull = course.status === 'full'
            const hasCapacity = course.max_participants != null
            const spotsLeft = hasCapacity ? course.max_participants - course.current_participants : null
            // Reuse the banner image the admin set on the course page as the
            // card thumbnail — single source of truth, no duplicate upload.
            const thumbSrc = extractCourseImage(course.content_blocks)
            return (
              <a
                key={course.slug}
                href={`/utbildningar/${course.slug}`}
                className={cn(
                  // Horizontal card: image flush-left, content column fills
                  // the remaining space. Common on list-style course pages
                  // (Coursera, LinkedIn Learning, Eventbrite's list view).
                  'relative group grid rounded-2xl overflow-hidden',
                  'transition-[transform,box-shadow] duration-300 ease-out',
                  'hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]',
                  colors.bg,
                  // Mobile: stack vertically (image on top, content below).
                  // sm+: horizontal — reserve ~42% of the card for the image
                  // (min 220px so it stays substantial). Without an image,
                  // single content column at all sizes.
                  thumbSrc ? 'grid-cols-1 sm:grid-cols-[minmax(220px,_42%)_1fr]' : 'grid-cols-1',
                )}
              >
                <EditItemBadge cmsRoute="courses" entityId={course.id} slug={course.slug} label="Edit course" />

                {/* Image column — on mobile (stacked) the container needs an
                    explicit aspect ratio because the grid row would otherwise
                    collapse to 0 (no intrinsic height from absolute children).
                    On sm+ (horizontal) it stretches to match the content
                    column via min-h. */}
                {thumbSrc && (
                  <div className="relative overflow-hidden aspect-[16/9] sm:aspect-auto sm:min-h-[160px]">
                    <img
                      src={resolveMediaUrl(thumbSrc)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                {/* Content column — tightened padding + footer spacing so
                    the overall card height is compact while the image gets
                    more visual weight. */}
                <div className="flex flex-col p-4 sm:p-5 relative min-w-0">
                  {/* Spots / full badge — top-right of the content column so
                      it stays on a readable background regardless of the
                      image tone. */}
                  {(isFull || hasCapacity) && (
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                      <span className={cn(
                        'text-caption font-semibold px-2.5 py-1 rounded-full',
                        isFull ? 'bg-amber-50 text-highlight' : colors.badge,
                      )}>
                        {isFull
                          ? <span {...editHandlers(fullLabelEdit)} className={fullLabelEdit?.className}>{fullLabel}</span>
                          : `${spotsLeft} ${spotsText}`}
                      </span>
                    </div>
                  )}

                  {/* Meta row — editorial caption style above the title. */}
                  {(course.location || course.start_date) && (
                    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-caption uppercase tracking-wide mb-1.5', colors.textMuted)}>
                      {showLocation !== false && course.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />{course.location}
                        </span>
                      )}
                      {course.location && course.start_date && <span aria-hidden className="text-faint">·</span>}
                      {course.start_date && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {formatSwedishDateRange(course.start_date, course.end_date)}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className={cn('text-h4 font-display break-words text-balance mb-1.5', colors.text)}>{course.title}</h3>

                  {!compactMode && course.description && (
                    <p className={cn('text-body-sm line-clamp-2', colors.textMuted)}>
                      {course.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                    </p>
                  )}

                  {/* Footer pinned to the bottom — aligned price rows across
                      siblings in the same grid, even if titles wrap differently. */}
                  <div className="flex items-center justify-between gap-3 mt-auto pt-4">
                    {showPrice !== false && course.price_sek != null ? (
                      <Price value={course.price_sek} size="md" colorClass={colors.text} />
                    ) : <span />}
                    <span className={cn('inline-flex items-center gap-1.5 text-body-sm font-medium', cardColor === 'dark' ? 'text-highlight-soft' : 'text-accent group-hover:text-accent-hover')}>
                      <span {...editHandlers(readMoreEdit)} className={readMoreEdit?.className}>{readMoreText || 'View course'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </a>
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

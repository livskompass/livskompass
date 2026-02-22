import { cn } from '../ui/utils'
import { useFetchJson, useScrollReveal } from '../helpers'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useInlineEdit } from '../context'

export interface CourseListProps {
  heading: string
  maxItems: number
  columns: 2 | 3
  showBookButton: boolean
  compactMode: boolean
  readMoreText: string
  bookButtonText: string
  fullLabel: string
  emptyText: string
}

interface Course {
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
  readMoreText = 'Läs mer',
  bookButtonText = 'Boka plats',
  fullLabel = 'Fullbokad',
  emptyText = 'Det finns inga utbildningar planerade just nu.',
  id,
}: CourseListProps & { puck?: { isEditing: boolean }; id?: string }) {
  const { data, loading } = useFetchJson<{ courses: Course[] }>('/courses')
  const courses = data?.courses || []
  const displayed = maxItems > 0 ? courses.slice(0, maxItems) : courses
  const revealRef = useScrollReveal()
  const headingEdit = useInlineEdit('heading', heading, id || '')

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && (
        <h2 {...(headingEdit ? { contentEditable: headingEdit.contentEditable, suppressContentEditableWarning: headingEdit.suppressContentEditableWarning, onBlur: headingEdit.onBlur, onKeyDown: headingEdit.onKeyDown, 'data-inline-edit': 'heading' } : {})} className={cn('text-h2 text-stone-800 mb-8 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[2])}>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-6 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-1/4 mb-3" />
              <div className="h-6 bg-stone-100 rounded w-3/4 mb-4" />
              <div className="h-4 bg-stone-100 rounded w-full mb-2" />
              <div className="h-4 bg-stone-100 rounded w-2/3" />
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
              <div key={course.slug} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className="p-6">
                  {(isFull || hasCapacity) && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      isFull
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-forest-50 text-forest-700'
                    )}>
                      {isFull ? fullLabel : `${spotsLeft} platser kvar`}
                    </span>
                  </div>
                  )}
                  <h3 className="text-h4 text-stone-800 mb-2">{course.title}</h3>
                  {!compactMode && course.description && (
                    <p className="text-stone-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                  )}
                  <div className={cn('flex flex-wrap gap-4 text-sm text-stone-500', compactMode ? 'mb-3' : 'mb-5')}>
                    {course.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-stone-400" />{course.location}
                      </span>
                    )}
                    {course.start_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-stone-400" />
                        {formatDateRange(course.start_date, course.end_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {course.price_sek != null ? (
                    <span className="font-display text-h3 text-stone-800">
                      {course.price_sek.toLocaleString('sv-SE')} <span className="text-base font-normal text-stone-500">kr</span>
                    </span>
                    ) : <span />}
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={`/utbildningar/${course.slug}`}
                        className="inline-flex items-center h-9 px-4 text-sm font-medium text-forest-600 hover:text-forest-700 hover:bg-forest-50 rounded-full transition-colors"
                      >
                        {readMoreText}
                      </a>
                      {showBookButton && !isFull && (
                        <a
                          href={`/utbildningar/${course.slug}/boka`}
                          className="inline-flex items-center h-9 px-4 text-sm font-medium bg-forest-500 text-white hover:bg-forest-600 rounded-full transition-all active:scale-[0.97]"
                        >
                          {bookButtonText}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
        <div className="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
          {emptyText}
        </div>
      )}
    </div>
  )
}

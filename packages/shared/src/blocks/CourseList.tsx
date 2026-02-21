import { cn } from '../ui/utils'
import { useFetchJson } from '../helpers'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'

export interface CourseListProps {
  heading: string
  maxItems: number
  columns: 2 | 3
  showBookButton: boolean
  compactMode: boolean
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

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('sv-SE', opts)} – ${e.toLocaleDateString('sv-SE', { ...opts, year: 'numeric' })}`
}

export function CourseList({
  heading = '',
  maxItems = 0,
  columns = 2,
  showBookButton = true,
  compactMode = false,
}: CourseListProps) {
  const { data, loading } = useFetchJson<{ courses: Course[] }>('/courses')
  const courses = data?.courses || []
  const displayed = maxItems > 0 ? courses.slice(0, maxItems) : courses

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {heading && (
        <h2 className="font-heading text-3xl font-bold text-neutral-800 mb-8 tracking-tight">{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[2])}>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 animate-pulse">
              <div className="h-5 bg-neutral-100 rounded w-1/4 mb-3" />
              <div className="h-6 bg-neutral-100 rounded w-3/4 mb-4" />
              <div className="h-4 bg-neutral-100 rounded w-full mb-2" />
              <div className="h-4 bg-neutral-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[2])}>
          {displayed.map((course) => {
            const isFull = course.status === 'full'
            const spotsLeft = course.max_participants - course.current_participants
            return (
              <div key={course.slug} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden card-hover">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      isFull
                        ? 'bg-accent-50 text-accent-700'
                        : 'bg-primary-50 text-primary-700'
                    )}>
                      {isFull ? 'Fullbokad' : `${spotsLeft} platser kvar`}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-neutral-800 mb-2">{course.title}</h3>
                  {!compactMode && course.description && (
                    <p className="text-neutral-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                  )}
                  <div className={cn('flex flex-wrap gap-4 text-sm text-neutral-500', compactMode ? 'mb-3' : 'mb-5')}>
                    {course.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-neutral-400" />{course.location}
                      </span>
                    )}
                    {course.start_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        {formatDateRange(course.start_date, course.end_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-2xl font-bold text-neutral-800">
                      {course.price_sek?.toLocaleString('sv-SE')} <span className="text-base font-normal text-neutral-500">kr</span>
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={`/utbildningar/${course.slug}`}
                        className="inline-flex items-center h-9 px-4 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Läs mer
                      </a>
                      {showBookButton && !isFull && (
                        <a
                          href={`/utbildningar/${course.slug}/boka`}
                          className="inline-flex items-center h-9 px-4 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
                        >
                          Boka plats
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
        <div className="text-center py-16 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
          Det finns inga utbildningar planerade just nu.
        </div>
      )}
    </div>
  )
}

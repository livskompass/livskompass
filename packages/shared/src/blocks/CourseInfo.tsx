import { cn } from '../ui/utils'
import { useCourseData, useEditableText } from '../context'
import { MapPin, Calendar, CreditCard, Users, Clock } from 'lucide-react'
import { formatSwedishDate, formatSwedishDateRange } from '../helpers'

export interface CourseInfoProps {
  showDeadline: boolean
  showEmpty?: boolean
  layout: 'grid' | 'stacked'
  locationLabel: string
  dateLabel: string
  priceLabel: string
  spotsLabel: string
  deadlineLabel: string
  fullLabel: string
  spotsOfText: string
  spotsRemainingText: string
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-surface rounded-xl border border-dashed border-strong p-8 text-center">
        <p className="text-faint text-body-sm">Course details are shown when a course is selected.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {['Location', 'Date', 'Price', 'Spots'].map((label) => (
            <div key={label} className="bg-surface-elevated rounded-lg border border-default p-3">
              <div className="h-4 bg-surface-alt rounded w-1/2 mx-auto mb-2" />
              <div className="text-caption text-faint">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function CourseInfo({
  showDeadline = true,
  showEmpty = false,
  layout = 'grid',
  locationLabel = 'Location',
  dateLabel = 'Date',
  priceLabel = 'Price',
  spotsLabel = 'Spots',
  deadlineLabel = 'Registration deadline',
  fullLabel = 'Fully booked',
  spotsOfText = 'of',
  spotsRemainingText = 'remaining',
}: CourseInfoProps) {
  const course = useCourseData()

  // Inline editing for labels
  const locationLabelEdit = useEditableText('locationLabel', locationLabel)
  const dateLabelEdit = useEditableText('dateLabel', dateLabel)
  const priceLabelEdit = useEditableText('priceLabel', priceLabel)
  const spotsLabelEdit = useEditableText('spotsLabel', spotsLabel)
  const deadlineLabelEdit = useEditableText('deadlineLabel', deadlineLabel)

  if (!course) return <Placeholder />

  const isFull = course.status === 'full'
  const hasCapacity = course.max_participants != null
  const spotsLeft = hasCapacity ? course.max_participants! - course.current_participants : null

  const dateValue = formatSwedishDateRange(course.start_date, course.end_date)

  const spotsValue = isFull
    ? fullLabel
    : hasCapacity
      ? `${spotsLeft} ${spotsOfText} ${course.max_participants} ${spotsRemainingText}`
      : ''

  const items = [
    { icon: MapPin, label: locationLabel, value: course.location, labelEdit: locationLabelEdit },
    { icon: Calendar, label: dateLabel, value: dateValue, labelEdit: dateLabelEdit },
    { icon: CreditCard, label: priceLabel, value: course.price_sek != null ? `${course.price_sek.toLocaleString('sv-SE')} kr` : '', labelEdit: priceLabelEdit },
    ...(spotsValue ? [{ icon: Users, label: spotsLabel, value: spotsValue, labelEdit: spotsLabelEdit }] : []),
  ]

  if (showDeadline && course.registration_deadline) {
    items.push({ icon: Clock, label: deadlineLabel, value: formatSwedishDate(course.registration_deadline), labelEdit: deadlineLabelEdit })
  }

  const visibleItems = showEmpty ? items : items.filter(i => i.value)

  if (layout === 'stacked') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-surface-elevated rounded-xl border border-default shadow-sm divide-y divide-stone-100">
          {visibleItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4">
              <item.icon className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <div className="text-caption text-faint uppercase tracking-wide">
                  <span {...editHandlers(item.labelEdit)} className={item.labelEdit?.className}>{item.label}</span>
                </div>
                <div className="text-foreground font-medium">{item.value || <span className="text-faint">—</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6">
        <div className={cn(
          'grid gap-6',
          visibleItems.length <= 2 ? 'grid-cols-2' : visibleItems.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        )}>
          {visibleItems.map((item, idx) => (
            <div key={idx} className="text-center">
              <item.icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <div className="text-caption text-faint uppercase tracking-wide mb-1">
                <span {...editHandlers(item.labelEdit)} className={item.labelEdit?.className}>{item.label}</span>
              </div>
              <div className={cn(
                'font-medium',
                item.label === spotsLabel && isFull ? 'text-highlight' : 'text-foreground'
              )}>{item.value || <span className="text-faint">—</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

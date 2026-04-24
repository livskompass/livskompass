import { cn } from '../ui/utils'
import { useCourseData, useEditableText } from '../context'
import { MapPin, Calendar, CreditCard, Users, Clock } from 'lucide-react'
import { formatSwedishDate, formatSwedishDateRange } from '../helpers'
import { Price } from './Price'
import { useInColumn } from './Columns'

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

// CourseInfo is filtered out of non-course block panels, so the "no context"
// case shouldn't appear in normal admin flow. Return null rather than chrome.

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

  if (!course) return null

  const isFull = course.status === 'full'
  const hasCapacity = course.max_participants != null
  const spotsLeft = hasCapacity ? course.max_participants! - course.current_participants : null

  const dateValue = formatSwedishDateRange(course.start_date, course.end_date)

  const spotsValue = isFull
    ? fullLabel
    : hasCapacity
      ? `${spotsLeft} ${spotsOfText} ${course.max_participants} ${spotsRemainingText}`
      : ''

  // In admin (any label edit context is non-null), show contextual placeholder
  // text for missing values so the admin sees which fields aren't filled in yet.
  // `useEditableText` returns null on the public site, so visitors still see "—".
  const isAdmin = Boolean(locationLabelEdit || dateLabelEdit || priceLabelEdit)
  const adminPlaceholders: Record<string, string> = {
    [locationLabel]: 'Ange plats',
    [dateLabel]: 'Ange datum',
    [priceLabel]: 'Ange pris',
    [spotsLabel]: 'Ange max antal',
    [deadlineLabel]: 'Ange sista anmälan',
  }
  const placeholderFor = (labelKey: string) => (isAdmin ? (adminPlaceholders[labelKey] || 'Ange värde') : '—')

  // Price gets a React node so it matches the CourseList card's Price component
  const priceNode = course.price_sek != null
    ? <Price value={course.price_sek} size="sm" colorClass="text-foreground" />
    : null

  const items: Array<{ icon: any; label: string; value: string; node?: React.ReactNode; labelEdit: any; placeholder: string }> = [
    { icon: MapPin, label: locationLabel, value: course.location, labelEdit: locationLabelEdit, placeholder: placeholderFor(locationLabel) },
    { icon: Calendar, label: dateLabel, value: dateValue, labelEdit: dateLabelEdit, placeholder: placeholderFor(dateLabel) },
    { icon: CreditCard, label: priceLabel, value: course.price_sek != null ? String(course.price_sek) : '', node: priceNode, labelEdit: priceLabelEdit, placeholder: placeholderFor(priceLabel) },
    ...(spotsValue || isAdmin ? [{ icon: Users, label: spotsLabel, value: spotsValue, labelEdit: spotsLabelEdit, placeholder: placeholderFor(spotsLabel) }] : []),
  ]

  if (showDeadline && (course.registration_deadline || isAdmin)) {
    items.push({ icon: Clock, label: deadlineLabel, value: course.registration_deadline ? formatSwedishDate(course.registration_deadline) : '', labelEdit: deadlineLabelEdit, placeholder: placeholderFor(deadlineLabel) })
  }

  const visibleItems = showEmpty || isAdmin ? items : items.filter(i => i.value)
  const inColumn = useInColumn()
  // Inside a column, skip the full-bleed section wrapper — the parent Columns
  // already provides container max-width and padding.
  const SectionWrap: React.FC<{ children: React.ReactNode }> = inColumn
    ? ({ children }) => <>{children}</>
    : ({ children }) => (
        <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
          {children}
        </div>
      )

  if (layout === 'stacked') {
    return (
      <SectionWrap>
        <div className="bg-surface-elevated rounded-xl border border-default shadow-sm divide-y divide-stone-100">
          {visibleItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4">
              <item.icon className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <div className="text-caption text-faint uppercase tracking-wide">
                  <span {...editHandlers(item.labelEdit)} className={item.labelEdit?.className}>{item.label}</span>
                </div>
                <div className="text-foreground font-medium">{item.node || item.value || <span className="text-faint italic">{item.placeholder}</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrap>
    )
  }

  return (
    <SectionWrap>
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
              )}>{item.node || item.value || <span className="text-faint italic">{item.placeholder}</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrap>
  )
}

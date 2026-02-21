import { cn } from '../ui/utils'
import { useCourseData } from '../context'
import { MapPin, Calendar, CreditCard, Users, Clock } from 'lucide-react'

export interface CourseInfoProps {
  showDeadline: boolean
  layout: 'grid' | 'stacked'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 text-center">
        <p className="text-stone-400 text-sm">Kursdetaljer visas här (data-bunden)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {['Plats', 'Datum', 'Pris', 'Platser'].map((label) => (
            <div key={label} className="bg-white rounded-lg border border-stone-200 p-3">
              <div className="h-4 bg-stone-100 rounded w-1/2 mx-auto mb-2" />
              <div className="text-xs text-stone-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CourseInfo({
  showDeadline = true,
  layout = 'grid',
}: CourseInfoProps) {
  const course = useCourseData()

  if (!course) return <Placeholder />

  const spotsLeft = course.max_participants - course.current_participants
  const isFull = course.status === 'full'

  const items = [
    { icon: MapPin, label: 'Plats', value: course.location },
    { icon: Calendar, label: 'Datum', value: course.start_date ? `${formatDate(course.start_date)} – ${formatDate(course.end_date)}` : '' },
    { icon: CreditCard, label: 'Pris', value: course.price_sek ? `${course.price_sek.toLocaleString('sv-SE')} kr` : '' },
    { icon: Users, label: 'Platser', value: isFull ? 'Fullbokad' : `${spotsLeft} av ${course.max_participants} kvar` },
  ]

  if (showDeadline && course.registration_deadline) {
    items.push({ icon: Clock, label: 'Sista anmälningsdag', value: formatDate(course.registration_deadline) })
  }

  if (layout === 'stacked') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
          {items.filter(i => i.value).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4">
              <item.icon className="h-5 w-5 text-forest-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-stone-400 uppercase tracking-wide">{item.label}</div>
                <div className="text-stone-800 font-medium">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <div className={cn(
          'grid gap-6',
          items.filter(i => i.value).length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        )}>
          {items.filter(i => i.value).map((item, idx) => (
            <div key={idx} className="text-center">
              <item.icon className="h-5 w-5 text-forest-500 mx-auto mb-2" />
              <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{item.label}</div>
              <div className={cn(
                'font-medium',
                item.label === 'Platser' && isFull ? 'text-amber-600' : 'text-stone-800'
              )}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

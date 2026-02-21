import { useCourseData } from '../context'
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export interface BookingCTAProps {
  style: 'card' | 'inline'
}

function Placeholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-neutral-400 text-sm">Boknings-CTA visas här (data-bunden)</p>
      </div>
    </div>
  )
}

export function BookingCTA({ style = 'card' }: BookingCTAProps) {
  const course = useCourseData()

  if (!course) return <Placeholder />

  if (course.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-neutral-100 rounded-xl p-6 flex items-center gap-4">
          <CheckCircle className="h-6 w-6 text-neutral-400 flex-shrink-0" />
          <p className="text-neutral-500">Denna utbildning har genomförts.</p>
        </div>
      </div>
    )
  }

  if (course.status === 'full') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-accent-50 border border-accent-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-accent-500 flex-shrink-0" />
          <div>
            <p className="text-accent-800 font-medium">Denna utbildning är fullbokad.</p>
            <p className="text-accent-600 text-sm mt-1">Kontakta oss om du vill ställas i kö.</p>
          </div>
        </div>
      </div>
    )
  }

  if (style === 'inline') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <a
          href={`/utbildningar/${course.slug}/boka`}
          className="inline-flex items-center h-12 px-8 bg-accent-500 text-white hover:bg-accent-600 font-semibold rounded-lg transition-colors text-base"
        >
          Boka plats
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-primary-800 mb-2">Intresserad av att delta?</h3>
        <p className="text-primary-600 mb-6">Boka din plats redan idag</p>
        <a
          href={`/utbildningar/${course.slug}/boka`}
          className="inline-flex items-center h-12 px-8 bg-accent-500 text-white hover:bg-accent-600 font-semibold rounded-lg transition-colors text-base"
        >
          Boka plats
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

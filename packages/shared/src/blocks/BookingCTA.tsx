import { useCourseData, useInlineEdit } from '../context'
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '../ui/utils'

export interface BookingCTAProps {
  style: 'card' | 'inline'
  buttonText: string
  heading: string
  description: string
  completedMessage: string
  fullMessage: string
  fullSubMessage: string
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 text-center">
        <p className="text-stone-400 text-sm">Boknings-CTA visas när en utbildning är vald.</p>
      </div>
    </div>
  )
}

/** Helper: extract handlers from inline edit props */
function editHandlers(edit: ReturnType<typeof useInlineEdit>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function BookingCTA({
  style = 'card',
  buttonText = 'Boka plats',
  heading = 'Intresserad av att delta?',
  description = 'Boka din plats redan idag',
  completedMessage = 'Denna utbildning har genomförts.',
  fullMessage = 'Denna utbildning är fullbokad.',
  fullSubMessage = 'Kontakta oss om du vill ställas i kö.',
  id,
}: BookingCTAProps & { puck?: { isEditing: boolean }; id?: string }) {
  const course = useCourseData()
  const headingEdit = useInlineEdit('heading', heading, id || '')
  const descriptionEdit = useInlineEdit('description', description, id || '')
  const buttonTextEdit = useInlineEdit('buttonText', buttonText, id || '')

  const hHandlers = editHandlers(headingEdit)
  const dHandlers = editHandlers(descriptionEdit)
  const bHandlers = editHandlers(buttonTextEdit)

  if (!course) return <Placeholder />

  if (course.status === 'completed') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-stone-100 rounded-xl p-6 flex items-center gap-4">
          <CheckCircle className="h-6 w-6 text-stone-400 flex-shrink-0" />
          <p className="text-stone-500">{completedMessage}</p>
        </div>
      </div>
    )
  }

  if (course.status === 'full') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-amber-800 font-medium">{fullMessage}</p>
            <p className="text-amber-600 text-sm mt-1">{fullSubMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  if (style === 'inline') {
    return (
      <div className="mx-auto text-center" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <a
          href={`/utbildningar/${course.slug}/boka`}
          className="inline-flex items-center h-12 px-8 bg-amber-500 text-white hover:bg-amber-600 font-semibold rounded-full transition-colors text-base"
        >
          <span {...bHandlers} className={buttonTextEdit?.className}>{buttonText}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-forest-50 border border-forest-200 rounded-xl p-8 text-center">
        <h3 {...hHandlers} className={cn('text-h3 text-forest-800 mb-2', headingEdit?.className)}>{heading}</h3>
        <p {...dHandlers} className={cn('text-forest-600 mb-6', descriptionEdit?.className)}>{description}</p>
        <a
          href={`/utbildningar/${course.slug}/boka`}
          className="inline-flex items-center h-12 px-8 bg-amber-500 text-white hover:bg-amber-600 font-semibold rounded-full transition-colors text-base"
        >
          <span {...bHandlers} className={buttonTextEdit?.className}>{buttonText}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

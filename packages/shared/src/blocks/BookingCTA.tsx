import { useCourseData, useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '../ui/utils'
import { getButtonStyle } from './buttonUtils'

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
      <div className="bg-surface rounded-xl border border-dashed border-strong p-8 text-center">
        <p className="text-faint text-body-sm">Booking CTA is shown when a course is selected.</p>
      </div>
    </div>
  )
}

/** Helper: extract handlers from inline edit props */
function editHandlers(edit: ReturnType<typeof useInlineEdit> | ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function BookingCTA({
  style = 'card',
  buttonText = 'Book a spot',
  heading = 'Interested in participating?',
  description = 'Book your spot today',
  completedMessage = 'This course has been completed.',
  fullMessage = 'This course is fully booked.',
  fullSubMessage = 'Contact us to be placed on the waiting list.',
  id,
}: BookingCTAProps & { puck?: { isEditing: boolean }; id?: string }) {
  const course = useCourseData()

  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const descriptionPuck = useInlineEdit('description', description, id || '')
  const buttonTextPuck = useInlineEdit('buttonText', buttonText, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const descriptionEditCtx = useEditableText('description', description)
  const buttonTextEditCtx = useEditableText('buttonText', buttonText)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const descriptionEdit = descriptionPuck || descriptionEditCtx
  const buttonTextEdit = buttonTextPuck || buttonTextEditCtx

  const hHandlers = editHandlers(headingEdit)
  const dHandlers = editHandlers(descriptionEdit)
  const bHandlers = editHandlers(buttonTextEdit)

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const { variantClass: btnClass, Icon: BtnIcon } = getButtonStyle(btnStyles, 'buttonText', 'primary', 'arrow-right')

  if (!course) return <Placeholder />

  if (course.status === 'completed') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-surface-alt rounded-xl p-6 flex items-center gap-4">
          <CheckCircle className="h-6 w-6 text-faint flex-shrink-0" />
          <p className="text-muted">{completedMessage}</p>
        </div>
      </div>
    )
  }

  if (course.status === 'full') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-highlight flex-shrink-0" />
          <div>
            <p className="text-highlight font-medium">{fullMessage}</p>
            <p className="text-highlight text-body-sm mt-1">{fullSubMessage}</p>
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
          className={cn('inline-flex items-center h-12 px-8 font-semibold rounded-lg transition-colors', btnStyles ? btnClass : 'bg-amber-500 text-white hover:bg-amber-600')}
        >
          <span {...bHandlers} className={buttonTextEdit?.className}>{buttonText}</span>
          {BtnIcon ? <BtnIcon className="ml-2 h-4 w-4" /> : (!btnStyles && <ArrowRight className="ml-2 h-4 w-4" />)}
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-accent-soft border border-forest-200 rounded-xl p-8 text-center">
        <h3 {...hHandlers} className={cn('text-h3 text-brand mb-2', headingEdit?.className)}>{heading}</h3>
        <p {...dHandlers} className={cn('text-accent mb-6', descriptionEdit?.className)}>{description}</p>
        <a
          href={`/utbildningar/${course.slug}/boka`}
          className={cn('inline-flex items-center h-12 px-8 font-semibold rounded-lg transition-colors', btnStyles ? btnClass : 'bg-amber-500 text-white hover:bg-amber-600')}
        >
          <span {...bHandlers} className={buttonTextEdit?.className}>{buttonText}</span>
          {BtnIcon ? <BtnIcon className="ml-2 h-4 w-4" /> : (!btnStyles && <ArrowRight className="ml-2 h-4 w-4" />)}
        </a>
      </div>
    </div>
  )
}

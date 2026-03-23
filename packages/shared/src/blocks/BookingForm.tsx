import { useState } from 'react'
import { useCourseData, useEditableText, useInlineEditBlock } from '../context'
import { getApiBase } from '../helpers'
import { Calendar, MapPin, CreditCard, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '../ui/utils'
import { UI_STRINGS } from '../ui-strings'
import { getButtonStyle } from './buttonUtils'

export interface BookingFormProps {
  showOrganization: boolean
  showNotes: boolean
  submitButtonText: string
  processingText: string
  fullMessage: string
  completedMessage: string
  totalLabel: string
  nameLabel: string
  emailLabel: string
  phoneLabel: string
  organizationLabel: string
  participantsLabel: string
  notesLabel: string
  priceSuffix: string
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className="bg-surface rounded-xl border border-dashed border-strong p-8 text-center">
        <p className="text-faint text-body-sm">The booking form is shown when a course is selected.</p>
      </div>
    </div>
  )
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function BookingForm({
  showOrganization = true,
  showNotes = true,
  submitButtonText = 'Proceed to payment',
  processingText = 'Processing...',
  fullMessage = 'This course is fully booked.',
  completedMessage = 'This course has been completed.',
  totalLabel = 'Total',
  nameLabel = 'Name *',
  emailLabel = 'Email *',
  phoneLabel = 'Phone',
  organizationLabel = 'Organization',
  participantsLabel = 'Number of participants *',
  notesLabel = 'Message',
  priceSuffix = 'SEK/person',
}: BookingFormProps) {
  const course = useCourseData()
  const isEditor = typeof window !== 'undefined' && window.frameElement !== null

  // Inline editing for form labels
  const nameLabelEdit = useEditableText('nameLabel', nameLabel)
  const emailLabelEdit = useEditableText('emailLabel', emailLabel)
  const phoneLabelEdit = useEditableText('phoneLabel', phoneLabel)
  const orgLabelEdit = useEditableText('organizationLabel', organizationLabel)
  const participantsLabelEdit = useEditableText('participantsLabel', participantsLabel)
  const notesLabelEdit = useEditableText('notesLabel', notesLabel)
  const submitBtnEdit = useEditableText('submitButtonText', submitButtonText)
  const totalLabelEdit = useEditableText('totalLabel', totalLabel)

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const { variantClass: submitBtnClass, Icon: SubmitBtnIcon } = getButtonStyle(btnStyles, 'submitButtonText', 'primary', 'arrow-right')

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    organization: '',
    participants: 1,
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!course) return <Placeholder />

  const isFull = course.status === 'full'
  const isCompleted = course.status === 'completed'
  const hasCapacity = course.max_participants != null
  const spotsLeft = hasCapacity ? course.max_participants! - course.current_participants : 10
  const totalPrice = (course.price_sek || 0) * formData.participants

  if (isFull || isCompleted) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="bg-surface-alt rounded-xl p-8 text-center">
          <p className="text-muted">
            {isFull ? fullMessage : completedMessage}
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditor) return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(`${getApiBase()}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerOrganization: formData.organization,
          participants: formData.participants,
          notes: formData.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || UI_STRINGS.bookingForm.errorCreate)

      // Redirect to checkout
      const bookingId = data.booking?.id || data.id
      const checkoutRes = await fetch(`${getApiBase()}/bookings/${bookingId}/checkout`, { method: 'POST' })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong')
    }
  }

  return (
    <div id="boka" className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {/* Course summary */}
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-5 mb-6">
        <h3 className="text-h4 text-foreground mb-3">{course.title}</h3>
        <div className="flex flex-wrap gap-4 text-body-sm text-muted">
          {course.start_date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-faint" />
              {formatDate(course.start_date)}{course.end_date && course.end_date !== course.start_date ? ` – ${formatDate(course.end_date)}` : ''}
            </span>
          )}
          {course.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-faint" />{course.location}
            </span>
          )}
          {course.price_sek != null && (
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-faint" />
            {course.price_sek.toLocaleString('sv-SE')} {priceSuffix}
          </span>
          )}
        </div>
      </div>

      {/* Booking form */}
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6">
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2 text-body-sm text-red-700">
            <AlertCircle className="h-4 w-4" />{errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1.5">
                <span {...editHandlers(nameLabelEdit)} className={nameLabelEdit?.className}>{nameLabel}</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
                disabled={isEditor}
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1.5">
                <span {...editHandlers(emailLabelEdit)} className={emailLabelEdit?.className}>{emailLabel}</span>
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData((f) => ({ ...f, customerEmail: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
                disabled={isEditor}
              />
            </div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1.5">
              <span {...editHandlers(phoneLabelEdit)} className={phoneLabelEdit?.className}>{phoneLabel}</span>
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData((f) => ({ ...f, customerPhone: e.target.value }))}
              className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
              disabled={isEditor}
            />
          </div>
          {showOrganization && (
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1.5">
                <span {...editHandlers(orgLabelEdit)} className={orgLabelEdit?.className}>{organizationLabel}</span>
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData((f) => ({ ...f, organization: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
                disabled={isEditor}
              />
            </div>
          )}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1.5">
              <span {...editHandlers(participantsLabelEdit)} className={participantsLabelEdit?.className}>{participantsLabel}</span>
            </label>
            <div className="relative">
              <select
                value={formData.participants}
                onChange={(e) => setFormData((f) => ({ ...f, participants: Number(e.target.value) }))}
                className="w-full h-12 px-4 pr-10 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors appearance-none"
                disabled={isEditor}
              >
                {Array.from({ length: Math.min(spotsLeft, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-faint" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          {showNotes && (
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1.5">
                <span {...editHandlers(notesLabelEdit)} className={notesLabelEdit?.className}>{notesLabel}</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors resize-none"
                disabled={isEditor}
              />
            </div>
          )}

          {/* Price summary */}
          <div className="bg-surface rounded-lg p-4 flex items-center justify-between">
            <span className="text-secondary font-medium">
              <span {...editHandlers(totalLabelEdit)} className={totalLabelEdit?.className}>{totalLabel}</span>
            </span>
            <span className="font-display text-h3 text-foreground">
              {totalPrice.toLocaleString('sv-SE')} kr
            </span>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || isEditor}
            className={cn('w-full inline-flex items-center justify-center h-12 font-semibold rounded-lg transition-colors disabled:opacity-50', btnStyles ? submitBtnClass : 'bg-amber-500 text-white hover:bg-amber-600')}
          >
            <span {...editHandlers(submitBtnEdit)} className={submitBtnEdit?.className}>
              {status === 'submitting' ? processingText : submitButtonText}
            </span>
            {SubmitBtnIcon ? <SubmitBtnIcon className="ml-2 h-4 w-4" /> : (!btnStyles && <ArrowRight className="ml-2 h-4 w-4" />)}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useCourseData } from '../context'
import { getApiBase } from '../helpers'
import { Calendar, MapPin, CreditCard, AlertCircle, ArrowRight } from 'lucide-react'

export interface BookingFormProps {
  showOrganization: boolean
  showNotes: boolean
  submitButtonText: string
  processingText: string
  fullMessage: string
  completedMessage: string
  totalLabel: string
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 text-center">
        <p className="text-stone-400 text-sm">Bokningsformulär visas här (data-bunden)</p>
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
  submitButtonText = 'Gå till betalning',
  processingText = 'Bearbetar...',
  fullMessage = 'Denna utbildning är fullbokad.',
  completedMessage = 'Denna utbildning har genomförts.',
  totalLabel = 'Totalt',
}: BookingFormProps) {
  const course = useCourseData()
  const isEditor = typeof window !== 'undefined' && window.frameElement !== null

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
  const spotsLeft = course.max_participants - course.current_participants
  const totalPrice = (course.price_sek || 0) * formData.participants

  if (isFull || isCompleted) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="bg-stone-100 rounded-xl p-8 text-center">
          <p className="text-stone-500">
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
      if (!res.ok) throw new Error(data.error || 'Kunde inte skapa bokning')

      // Redirect to checkout
      const bookingId = data.booking?.id || data.id
      const checkoutRes = await fetch(`${getApiBase()}/bookings/${bookingId}/checkout`, { method: 'POST' })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Något gick fel')
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-narrow)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {/* Course summary */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-6">
        <h3 className="text-h4 text-stone-800 mb-3">{course.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
          {course.start_date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-stone-400" />
              {formatDate(course.start_date)} – {formatDate(course.end_date)}
            </span>
          )}
          {course.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-stone-400" />{course.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-stone-400" />
            {course.price_sek?.toLocaleString('sv-SE')} kr/person
          </span>
        </div>
      </div>

      {/* Booking form */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />{errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Namn *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
                disabled={isEditor}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">E-post *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData((f) => ({ ...f, customerEmail: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
                disabled={isEditor}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Telefon</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData((f) => ({ ...f, customerPhone: e.target.value }))}
              className="w-full h-12 px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
              disabled={isEditor}
            />
          </div>
          {showOrganization && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Organisation</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData((f) => ({ ...f, organization: e.target.value }))}
                className="w-full h-12 px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
                disabled={isEditor}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Antal deltagare *</label>
            <select
              value={formData.participants}
              onChange={(e) => setFormData((f) => ({ ...f, participants: Number(e.target.value) }))}
              className="w-full h-12 px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
              disabled={isEditor}
            >
              {Array.from({ length: Math.min(spotsLeft, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          {showNotes && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Meddelande</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors resize-none"
                disabled={isEditor}
              />
            </div>
          )}

          {/* Price summary */}
          <div className="bg-stone-50 rounded-lg p-4 flex items-center justify-between">
            <span className="text-stone-600 font-medium">{totalLabel}</span>
            <span className="font-display text-h3 text-stone-800">
              {totalPrice.toLocaleString('sv-SE')} kr
            </span>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || isEditor}
            className="w-full inline-flex items-center justify-center h-12 bg-amber-500 text-white hover:bg-amber-600 font-semibold rounded-full transition-colors disabled:opacity-50 text-base"
          >
            {status === 'submitting' ? processingText : submitButtonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useCourseData } from '../context'
import { getApiBase } from '../helpers'
import { Calendar, MapPin, CreditCard, AlertCircle, ArrowRight } from 'lucide-react'

export interface BookingFormProps {
  showOrganization: boolean
  showNotes: boolean
}

function Placeholder() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-neutral-400 text-sm">Bokningsformulär visas här (data-bunden)</p>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-neutral-100 rounded-xl p-8 text-center">
          <p className="text-neutral-500">
            {isFull ? 'Denna utbildning är fullbokad.' : 'Denna utbildning har genomförts.'}
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Course summary */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 mb-6">
        <h3 className="font-heading text-lg font-bold text-neutral-800 mb-3">{course.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
          {course.start_date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-neutral-400" />
              {formatDate(course.start_date)} – {formatDate(course.end_date)}
            </span>
          )}
          {course.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-neutral-400" />{course.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-neutral-400" />
            {course.price_sek?.toLocaleString('sv-SE')} kr/person
          </span>
        </div>
      </div>

      {/* Booking form */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        {status === 'error' && (
          <div className="bg-[#FEF2F1] border border-[#F5C6C2] rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-[#C4463A]">
            <AlertCircle className="h-4 w-4" />{errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Namn *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                disabled={isEditor}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">E-post *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData((f) => ({ ...f, customerEmail: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                disabled={isEditor}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Telefon</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData((f) => ({ ...f, customerPhone: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
              disabled={isEditor}
            />
          </div>
          {showOrganization && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Organisation</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData((f) => ({ ...f, organization: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                disabled={isEditor}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Antal deltagare *</label>
            <select
              value={formData.participants}
              onChange={(e) => setFormData((f) => ({ ...f, participants: Number(e.target.value) }))}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
              disabled={isEditor}
            >
              {Array.from({ length: Math.min(spotsLeft, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          {showNotes && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Meddelande</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors resize-none"
                disabled={isEditor}
              />
            </div>
          )}

          {/* Price summary */}
          <div className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between">
            <span className="text-neutral-600 font-medium">Totalt</span>
            <span className="font-heading text-2xl font-bold text-neutral-800">
              {totalPrice.toLocaleString('sv-SE')} kr
            </span>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || isEditor}
            className="w-full inline-flex items-center justify-center h-12 bg-accent-500 text-white hover:bg-accent-600 font-semibold rounded-lg transition-colors disabled:opacity-50 text-base"
          >
            {status === 'submitting' ? 'Bearbetar...' : 'Gå till betalning'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

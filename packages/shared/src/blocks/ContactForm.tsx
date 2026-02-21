import { useState } from 'react'
import { getApiBase } from '../helpers'
import { Send, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react'

export interface ContactFormProps {
  heading: string
  description: string
  showPhone: boolean
  showSubject: boolean
  layout: 'full' | 'split'
  contactName: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
}

export function ContactForm({
  heading = 'Kontakta oss',
  description = '',
  showPhone = true,
  showSubject = true,
  layout = 'full',
  contactName = 'Fredrik Livheim',
  contactTitle = 'Legitimerad psykolog och ACT-utbildare',
  contactEmail = 'livheim@gmail.com',
  contactPhone = '070-694 03 64',
}: ContactFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Detect if we're inside the Puck editor
  const isEditor = typeof window !== 'undefined' && window.frameElement !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditor) return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(`${getApiBase()}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Kunde inte skicka meddelandet')
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Något gick fel')
    }
  }

  const formElement = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Namn *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
            disabled={isEditor}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">E-post *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
            disabled={isEditor}
          />
        </div>
      </div>
      {showPhone && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
            disabled={isEditor}
          />
        </div>
      )}
      {showSubject && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ämne</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
            disabled={isEditor}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Meddelande *</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors resize-none"
          disabled={isEditor}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'submitting' || isEditor}
        className="inline-flex items-center h-11 px-6 bg-primary-500 text-white hover:bg-primary-600 font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? 'Skickar...' : 'Skicka meddelande'}
        <Send className="ml-2 h-4 w-4" />
      </button>
    </form>
  )

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
          <CheckCircle className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h3 className="font-heading text-2xl font-bold text-primary-800 mb-2">Tack för ditt meddelande!</h3>
          <p className="text-primary-600">Vi återkommer så snart vi kan.</p>
        </div>
      </div>
    )
  }

  if (layout === 'split') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {heading && <h2 className="font-heading text-3xl font-bold text-neutral-800 mb-2 tracking-tight">{heading}</h2>}
        {description && <p className="text-neutral-600 mb-8">{description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <h3 className="font-semibold text-neutral-800 mb-1">{contactName}</h3>
              <p className="text-sm text-neutral-500 mb-4">{contactTitle}</p>
              <div className="space-y-3">
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                    <Mail className="h-4 w-4 text-primary-500" />{contactEmail}
                  </a>
                )}
                {contactPhone && (
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                    <Phone className="h-4 w-4 text-primary-500" />{contactPhone}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            {status === 'error' && (
              <div className="bg-[#FEF2F1] border border-[#F5C6C2] rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-[#C4463A]">
                <AlertCircle className="h-4 w-4" />{errorMsg}
              </div>
            )}
            {formElement}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {heading && <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-2 tracking-tight">{heading}</h2>}
      {description && <p className="text-neutral-600 mb-6">{description}</p>}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        {status === 'error' && (
          <div className="bg-[#FEF2F1] border border-[#F5C6C2] rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-[#C4463A]">
            <AlertCircle className="h-4 w-4" />{errorMsg}
          </div>
        )}
        {formElement}
      </div>
    </div>
  )
}

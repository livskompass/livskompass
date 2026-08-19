import { useState } from 'react'
import { subscribeNewsletter } from '../lib/api'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Set when a visitor subscribes, so the popup never shows for them again. */
export const NEWSLETTER_SUBSCRIBED_KEY = 'newsletter_subscribed'

interface NewsletterSignupProps {
  /** Where the form is rendered — stored with the signup and used for styling. */
  source: 'popup' | 'footer'
  /** GDPR consent line under the button — editable in admin Settings → Newsletter. */
  consentText?: string
  onSubscribed?: () => void
}

export function NewsletterSignup({ source, consentText, onSubscribed }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const dark = source === 'footer'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus('error')
      setMessage('Ange en giltig e-postadress.')
      return
    }
    setStatus('sending')
    try {
      const res = await subscribeNewsletter(trimmed, source)
      setStatus('success')
      setMessage(res.message || 'Tack! Du är nu anmäld till nyhetsbrevet.')
      try { localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, '1') } catch { /* private mode */ }
      onSubscribed?.()
    } catch {
      setStatus('error')
      setMessage('Något gick fel. Försök igen om en stund.')
    }
  }

  if (status === 'success') {
    return (
      <p className={dark ? 'text-white font-medium' : 'text-forest-800 font-medium'} role="status">
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          E-postadress
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="din@epost.se"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          className={
            dark
              ? 'flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-body-sm placeholder:text-white/40 outline-none focus:border-white/50 focus:bg-white/15 transition-colors'
              : 'flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-white border border-stone-300 text-foreground text-body-sm placeholder:text-stone-400 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-colors'
          }
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className={
            dark
              ? 'shrink-0 px-5 py-2.5 rounded-lg bg-white text-stone-950 text-body-sm font-medium hover:bg-stone-200 disabled:opacity-60 transition-colors'
              : 'shrink-0 px-5 py-2.5 rounded-lg bg-forest-700 text-white text-body-sm font-medium hover:bg-forest-800 disabled:opacity-60 transition-colors'
          }
        >
          {status === 'sending' ? 'Skickar…' : 'Anmäl mig'}
        </button>
      </div>
      {status === 'error' && (
        <p className={dark ? 'text-red-300 text-body-sm mt-2' : 'text-red-600 text-body-sm mt-2'} role="alert">
          {message}
        </p>
      )}
      <p className={dark ? 'text-white/50 text-caption mt-3' : 'text-muted text-caption mt-3'}>
        {consentText ||
          'Genom att anmäla dig samtycker du till att vi sparar din e-postadress för att skicka nyhetsbrev. Du kan avsluta prenumerationen när som helst.'}
      </p>
    </form>
  )
}

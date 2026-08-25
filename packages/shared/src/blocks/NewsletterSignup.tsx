import { useState } from 'react'
import { getApiBase } from '../helpers'
import { cn } from '../ui/utils'
import { useEditableText, useInlineEditBlock, useBlockDisplayProps } from '../context'
import { getButtonStyle } from './buttonUtils'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface NewsletterSignupProps {
  heading: string
  description: string
  buttonText: string
  placeholder: string
  consentText: string
}

/** Helper: extract handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function NewsletterSignup({
  heading = 'Nyhetsbrev',
  description = '',
  buttonText = 'Anmäl mig',
  placeholder = 'din@epost.se',
  consentText = '',
}: NewsletterSignupProps & { puck?: { isEditing: boolean }; id?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const editCtx = useInlineEditBlock()
  const headingEdit = useEditableText('heading', heading)
  const descriptionEdit = useEditableText('description', description)
  const buttonTextEdit = useEditableText('buttonText', buttonText)
  const consentTextEdit = useEditableText('consentText', consentText)

  const btnStyles = useBlockDisplayProps()?._buttonStyles as Record<string, string> | undefined
  const { variantClass: btnClass, Icon: BtnIcon } = getButtonStyle(btnStyles, 'buttonText', 'primary', '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // No real signups from inside the editors
    if (editCtx || (typeof window !== 'undefined' && window.frameElement !== null)) return

    const trimmed = email.trim()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus('error')
      setMessage('Ange en giltig e-postadress.')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(`${getApiBase()}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'page' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json().catch(() => ({}))
      setStatus('success')
      setMessage(data.message || 'Tack! Du är nu anmäld till nyhetsbrevet.')
      try { localStorage.setItem('newsletter_subscribed', '1') } catch { /* private mode */ }
    } catch {
      setStatus('error')
      setMessage('Något gick fel. Försök igen om en stund.')
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: '42rem', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6 sm:p-8">
        {(heading || headingEdit) && (
          <h2 {...editHandlers(headingEdit)} className={cn('text-h3 mb-2', headingEdit?.className)}>{heading}</h2>
        )}
        {(description || descriptionEdit) && (
          <p {...editHandlers(descriptionEdit)} className={cn('text-secondary mb-5', descriptionEdit?.className)}>{description}</p>
        )}

        {status === 'success' ? (
          <p className="text-accent font-medium" role="status">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-email-block" className="sr-only">E-postadress</label>
              <input
                id="newsletter-email-block"
                type="email"
                required
                autoComplete="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                disabled={!!editCtx}
                className="flex-1 min-w-0 h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground placeholder:text-faint focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'sending' || !!editCtx}
                className={cn(
                  'shrink-0 inline-flex items-center justify-center h-12 px-7 font-semibold rounded-lg transition-colors disabled:opacity-60',
                  btnStyles ? btnClass : 'bg-forest-500 text-white hover:bg-forest-600',
                )}
              >
                <span {...editHandlers(buttonTextEdit)} className={buttonTextEdit?.className}>
                  {status === 'sending' ? 'Skickar…' : buttonText}
                </span>
                {BtnIcon && <BtnIcon className="ml-2 h-4 w-4" />}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-red-600 text-body-sm mt-2" role="alert">{message}</p>
            )}
            {(consentText || consentTextEdit) && (
              <p {...editHandlers(consentTextEdit)} className={cn('text-muted text-caption mt-3', consentTextEdit?.className)}>{consentText}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

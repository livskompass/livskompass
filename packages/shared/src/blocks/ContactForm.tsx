import { useState } from 'react'
import { getApiBase } from '../helpers'
import { Send, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { cn } from '../ui/utils'
import { UI_STRINGS } from '../ui-strings'
import { getButtonStyle } from './buttonUtils'

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
  submitButtonText: string
  submittingText: string
  successHeading: string
  successMessage: string
  nameLabel: string
  emailLabel: string
  phoneLabel: string
  subjectLabel: string
  messageLabel: string
}

/** Helper: extract handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText> | ReturnType<typeof useInlineEdit>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function ContactForm({
  heading = 'Contact us',
  description = '',
  showPhone = true,
  showSubject = true,
  layout = 'full',
  contactName = 'Fredrik Livheim',
  contactTitle = 'Licensed psychologist and ACT trainer',
  contactEmail = 'livheim@gmail.com',
  contactPhone = '070-694 03 64',
  submitButtonText = 'Send message',
  submittingText = 'Sending...',
  successHeading = 'Thank you for your message!',
  successMessage = 'We will get back to you as soon as we can.',
  nameLabel = 'Name *',
  emailLabel = 'Email *',
  phoneLabel = 'Phone',
  subjectLabel = 'Subject',
  messageLabel = 'Message *',
  id,
}: ContactFormProps & { puck?: { isEditing: boolean }; id?: string }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const descriptionPuck = useInlineEdit('description', description, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const descriptionEditCtx = useEditableText('description', description)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const descriptionEdit = descriptionPuck || descriptionEditCtx

  // Inline editing for form labels and contact info
  const nameLabelEdit = useEditableText('nameLabel', nameLabel)
  const emailLabelEdit = useEditableText('emailLabel', emailLabel)
  const phoneLabelEdit = useEditableText('phoneLabel', phoneLabel)
  const subjectLabelEdit = useEditableText('subjectLabel', subjectLabel)
  const messageLabelEdit = useEditableText('messageLabel', messageLabel)
  const submitBtnEdit = useEditableText('submitButtonText', submitButtonText)
  const contactNameEdit = useEditableText('contactName', contactName)
  const contactTitleEdit = useEditableText('contactTitle', contactTitle)
  const contactEmailEdit = useEditableText('contactEmail', contactEmail)
  const contactPhoneEdit = useEditableText('contactPhone', contactPhone)

  const hHandlers = editHandlers(headingEdit)
  const dHandlers = editHandlers(descriptionEdit)

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const { variantClass: submitBtnClass, Icon: SubmitBtnIcon } = getButtonStyle(btnStyles, 'submitButtonText', 'primary', '')

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
      if (!res.ok) throw new Error(UI_STRINGS.contact.errorSend)
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || UI_STRINGS.contact.errorGeneric)
    }
  }

  const formElement = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-body-sm font-medium text-foreground mb-1.5">
            <span {...editHandlers(nameLabelEdit)} className={nameLabelEdit?.className}>{nameLabel}</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
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
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
            className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
            disabled={isEditor}
          />
        </div>
      </div>
      {showPhone && (
        <div>
          <label className="block text-body-sm font-medium text-foreground mb-1.5">
            <span {...editHandlers(phoneLabelEdit)} className={phoneLabelEdit?.className}>{phoneLabel}</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
            className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
            disabled={isEditor}
          />
        </div>
      )}
      {showSubject && (
        <div>
          <label className="block text-body-sm font-medium text-foreground mb-1.5">
            <span {...editHandlers(subjectLabelEdit)} className={subjectLabelEdit?.className}>{subjectLabel}</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
            className="w-full h-12 px-4 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors"
            disabled={isEditor}
          />
        </div>
      )}
      <div>
        <label className="block text-body-sm font-medium text-foreground mb-1.5">
          <span {...editHandlers(messageLabelEdit)} className={messageLabelEdit?.className}>{messageLabel}</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 rounded-md border-[1.5px] border-strong bg-white text-foreground focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-accent/10 transition-colors resize-none"
          disabled={isEditor}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'submitting' || isEditor}
        className={cn('w-full inline-flex items-center justify-center h-12 px-7 font-semibold rounded-lg transition-colors disabled:opacity-50', btnStyles ? submitBtnClass : 'bg-forest-500 text-white hover:bg-forest-600')}
      >
        <span {...editHandlers(submitBtnEdit)} className={submitBtnEdit?.className}>
          {status === 'submitting' ? submittingText : submitButtonText}
        </span>
        {SubmitBtnIcon ? <SubmitBtnIcon className="ml-2 h-4 w-4" /> : <Send className="ml-2 h-4 w-4" />}
      </button>
    </form>
  )

  if (status === 'success') {
    return (
      <div className="mx-auto" style={{ maxWidth: '42rem', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="bg-accent-soft border border-forest-200 rounded-xl p-8 text-center">
          <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-h3 text-brand mb-2">{successHeading}</h3>
          <p className="text-accent">{successMessage}</p>
        </div>
      </div>
    )
  }

  if (layout === 'split') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        {heading && <h2 {...hHandlers} className={cn('text-h3 mb-2', headingEdit?.className)}>{heading}</h2>}
        {(description || descriptionEdit) && <p {...dHandlers} className={cn('text-secondary mb-8', descriptionEdit?.className)}>{description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6">
              <h3 {...editHandlers(contactNameEdit)} className={cn('font-semibold text-foreground mb-1', contactNameEdit?.className)}>{contactName}</h3>
              <p {...editHandlers(contactTitleEdit)} className={cn('text-body-sm text-muted mb-4', contactTitleEdit?.className)}>{contactTitle}</p>
              <div className="space-y-3">
                {(contactEmail || contactEmailEdit) && (
                  <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-body-sm text-secondary hover:text-accent transition-colors">
                    <Mail className="h-4 w-4 text-accent" />
                    <span {...editHandlers(contactEmailEdit)} className={contactEmailEdit?.className}>{contactEmail}</span>
                  </a>
                )}
                {(contactPhone || contactPhoneEdit) && (
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-body-sm text-secondary hover:text-accent transition-colors">
                    <Phone className="h-4 w-4 text-accent" />
                    <span {...editHandlers(contactPhoneEdit)} className={contactPhoneEdit?.className}>{contactPhone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2 text-body-sm text-red-700">
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
    <div className="mx-auto" style={{ maxWidth: '42rem', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {heading && <h2 {...hHandlers} className={cn('text-h3 mb-2', headingEdit?.className)}>{heading}</h2>}
      {(description || descriptionEdit) && <p {...dHandlers} className={cn('text-secondary mb-6', descriptionEdit?.className)}>{description}</p>}
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm p-6">
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2 text-body-sm text-red-700">
            <AlertCircle className="h-4 w-4" />{errorMsg}
          </div>
        )}
        {formElement}
      </div>
    </div>
  )
}

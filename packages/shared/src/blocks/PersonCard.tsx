import { Mail, Phone } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { cn } from '../ui/utils'
import { InlineImage } from './InlineImage'

export interface PersonCardProps {
  name: string
  title: string
  bio: string
  image: string
  email: string
  phone: string
  style: 'card' | 'horizontal'
}

/** Helper: extract handlers from inline edit props */
function editHandlers(edit: ReturnType<typeof useInlineEdit> | ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function PersonCard({
  name = 'Fredrik Livheim',
  title = 'Legitimerad psykolog',
  bio = '',
  image = '',
  email = '',
  phone = '',
  style = 'card',
  id,
}: PersonCardProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const namePuck = useInlineEdit('name', name, id || '')
  const titlePuck = useInlineEdit('title', title, id || '')
  const bioPuck = useInlineEdit('bio', bio, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const nameEditCtx = useEditableText('name', name)
  const titleEditCtx = useEditableText('title', title)
  const bioEditCtx = useEditableText('bio', bio)
  const emailEdit = useEditableText('email', email)
  const phoneEdit = useEditableText('phone', phone)

  // Puck takes priority
  const nameEdit = namePuck || nameEditCtx
  const titleEdit = titlePuck || titleEditCtx
  const bioEdit = bioPuck || bioEditCtx

  const nHandlers = editHandlers(nameEdit)
  const tHandlers = editHandlers(titleEdit)
  const bHandlers = editHandlers(bioEdit)
  const eHandlers = editHandlers(emailEdit)
  const pHandlers = editHandlers(phoneEdit)

  if (style === 'horizontal') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <InlineImage
            src={image}
            propName="image"
            alt={name}
            className="w-48 h-48 rounded-xl object-cover flex-shrink-0"
            fallback={
              <div className="w-48 h-48 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-4xl text-forest-600">{name.charAt(0)}</span>
              </div>
            }
          />
          <div>
            <h3 {...nHandlers} className={cn('text-h3 text-stone-800', nameEdit?.className)}>{name}</h3>
            {(title || titleEdit) && <p {...tHandlers} className={cn('text-amber-600 font-medium mt-1', titleEdit?.className)}>{title}</p>}
            {(bio || bioEdit) && <p {...bHandlers} className={cn('text-stone-600 mt-4 leading-relaxed max-w-prose', bioEdit?.className)}>{bio}</p>}
            {(email || phone || emailEdit || phoneEdit) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {(email || emailEdit) && (
                  <span className="inline-flex items-center gap-2 text-sm text-forest-600">
                    <Mail className="h-4 w-4" /><span {...eHandlers} className={emailEdit?.className}>{email}</span>
                  </span>
                )}
                {(phone || phoneEdit) && (
                  <span className="inline-flex items-center gap-2 text-sm text-forest-600">
                    <Phone className="h-4 w-4" /><span {...pHandlers} className={phoneEdit?.className}>{phone}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-center p-8">
        <InlineImage
          src={image}
          propName="image"
          alt={name}
          className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
          fallback={
            <div className="w-32 h-32 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-3xl text-forest-600">{name.charAt(0)}</span>
            </div>
          }
        />
        <h3 {...nHandlers} className={cn('text-h4 text-stone-800', nameEdit?.className)}>{name}</h3>
        {(title || titleEdit) && <p {...tHandlers} className={cn('text-amber-600 font-medium mt-1 text-sm', titleEdit?.className)}>{title}</p>}
        {(bio || bioEdit) && <p {...bHandlers} className={cn('text-stone-600 mt-3 text-sm leading-relaxed', bioEdit?.className)}>{bio}</p>}
        {(email || phone || emailEdit || phoneEdit) && (
          <div className="flex flex-col items-center gap-2 mt-4">
            {(email || emailEdit) && (
              <span className="inline-flex items-center gap-2 text-sm text-forest-600">
                <Mail className="h-4 w-4" /><span {...eHandlers} className={emailEdit?.className}>{email}</span>
              </span>
            )}
            {(phone || phoneEdit) && (
              <span className="inline-flex items-center gap-2 text-sm text-forest-600">
                <Phone className="h-4 w-4" /><span {...pHandlers} className={phoneEdit?.className}>{phone}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

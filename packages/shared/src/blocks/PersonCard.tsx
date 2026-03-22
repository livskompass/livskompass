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
  imageSize?: 'small' | 'medium' | 'large'
}

/** Helper: extract handlers from inline edit props */
function editHandlers(edit: ReturnType<typeof useInlineEdit> | ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

const imageSizeMap = {
  horizontal: { small: 'w-32 h-32', medium: 'w-48 h-48', large: 'w-64 h-64' },
  card: { small: 'w-24 h-24', medium: 'w-32 h-32', large: 'w-40 h-40' },
} as const

const fallbackSizeMap = {
  horizontal: { small: 'w-32 h-32', medium: 'w-48 h-48', large: 'w-64 h-64' },
  card: { small: 'w-24 h-24', medium: 'w-32 h-32', large: 'w-40 h-40' },
} as const

const fallbackTextMap = {
  horizontal: { small: 'text-h3', medium: 'text-h1', large: 'text-h1' },
  card: { small: 'text-h4', medium: 'text-h2', large: 'text-h1' },
} as const

export function PersonCard({
  name = 'Fredrik Livheim',
  title = 'Legitimerad psykolog',
  bio = '',
  image = '',
  email = '',
  phone = '',
  style = 'card',
  imageSize = 'medium',
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
            className={cn(imageSizeMap.horizontal[imageSize || 'medium'], 'rounded-xl object-cover flex-shrink-0')}
            fallback={
              <div className={cn(fallbackSizeMap.horizontal[imageSize || 'medium'], 'rounded-xl bg-accent-soft flex items-center justify-center flex-shrink-0')}>
                <span className={cn('font-display text-accent', fallbackTextMap.horizontal[imageSize || 'medium'])}>{name.charAt(0)}</span>
              </div>
            }
          />
          <div>
            <h3 {...nHandlers} className={cn('text-h3 text-foreground', nameEdit?.className)}>{name}</h3>
            {(title || titleEdit) && <p {...tHandlers} className={cn('text-highlight font-medium mt-1', titleEdit?.className)}>{title}</p>}
            {(bio || bioEdit) && <p {...bHandlers} className={cn('text-secondary mt-4 leading-relaxed max-w-prose', bioEdit?.className)}>{bio}</p>}
            {(email || phone || emailEdit || phoneEdit) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {(email || emailEdit) && (
                  <span className="inline-flex items-center gap-2 text-body-sm text-accent">
                    <Mail className="h-4 w-4" /><span {...eHandlers} className={emailEdit?.className}>{email}</span>
                  </span>
                )}
                {(phone || phoneEdit) && (
                  <span className="inline-flex items-center gap-2 text-body-sm text-accent">
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
      <div className="bg-surface-elevated rounded-xl border border-default shadow-sm overflow-hidden text-center p-8">
        <InlineImage
          src={image}
          propName="image"
          alt={name}
          className={cn(imageSizeMap.card[imageSize || 'medium'], 'rounded-full object-cover mx-auto mb-4')}
          fallback={
            <div className={cn(fallbackSizeMap.card[imageSize || 'medium'], 'rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4')}>
              <span className={cn('font-display text-accent', fallbackTextMap.card[imageSize || 'medium'])}>{name.charAt(0)}</span>
            </div>
          }
        />
        <h3 {...nHandlers} className={cn('text-h4 text-foreground', nameEdit?.className)}>{name}</h3>
        {(title || titleEdit) && <p {...tHandlers} className={cn('text-highlight font-medium mt-1 text-body-sm', titleEdit?.className)}>{title}</p>}
        {(bio || bioEdit) && <p {...bHandlers} className={cn('text-secondary mt-3 text-body-sm leading-relaxed', bioEdit?.className)}>{bio}</p>}
        {(email || phone || emailEdit || phoneEdit) && (
          <div className="flex flex-col items-center gap-2 mt-4">
            {(email || emailEdit) && (
              <span className="inline-flex items-center gap-2 text-body-sm text-accent">
                <Mail className="h-4 w-4" /><span {...eHandlers} className={emailEdit?.className}>{email}</span>
              </span>
            )}
            {(phone || phoneEdit) && (
              <span className="inline-flex items-center gap-2 text-body-sm text-accent">
                <Phone className="h-4 w-4" /><span {...pHandlers} className={phoneEdit?.className}>{phone}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

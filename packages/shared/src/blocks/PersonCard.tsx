import { Mail, Phone } from 'lucide-react'
import { resolveMediaUrl } from '../helpers'
import { useInlineEdit } from '../context'
import { cn } from '../ui/utils'

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
function editHandlers(edit: ReturnType<typeof useInlineEdit>) {
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
  const resolvedImage = image ? resolveMediaUrl(image) : ''
  const nameEdit = useInlineEdit('name', name, id || '')
  const titleEdit = useInlineEdit('title', title, id || '')
  const bioEdit = useInlineEdit('bio', bio, id || '')

  const nHandlers = editHandlers(nameEdit)
  const tHandlers = editHandlers(titleEdit)
  const bHandlers = editHandlers(bioEdit)

  if (style === 'horizontal') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {resolvedImage ? (
            <img src={resolvedImage} alt={name} loading="lazy" className="w-48 h-48 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-4xl text-forest-600">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 {...nHandlers} className={cn('text-h3 text-stone-800', nameEdit?.className)}>{name}</h3>
            {(title || titleEdit) && <p {...tHandlers} className={cn('text-amber-600 font-medium mt-1', titleEdit?.className)}>{title}</p>}
            {(bio || bioEdit) && <p {...bHandlers} className={cn('text-stone-600 mt-4 leading-relaxed max-w-prose', bioEdit?.className)}>{bio}</p>}
            {(email || phone) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700 transition-colors">
                    <Mail className="h-4 w-4" />{email}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700 transition-colors">
                    <Phone className="h-4 w-4" />{phone}
                  </a>
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
        {resolvedImage ? (
          <img src={resolvedImage} alt={name} loading="lazy" className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-3xl text-forest-600">{name.charAt(0)}</span>
          </div>
        )}
        <h3 {...nHandlers} className={cn('text-h4 text-stone-800', nameEdit?.className)}>{name}</h3>
        {(title || titleEdit) && <p {...tHandlers} className={cn('text-amber-600 font-medium mt-1 text-sm', titleEdit?.className)}>{title}</p>}
        {(bio || bioEdit) && <p {...bHandlers} className={cn('text-stone-600 mt-3 text-sm leading-relaxed', bioEdit?.className)}>{bio}</p>}
        {(email || phone) && (
          <div className="flex flex-col items-center gap-2 mt-4">
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700 transition-colors">
                <Mail className="h-4 w-4" />{email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700 transition-colors">
                <Phone className="h-4 w-4" />{phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

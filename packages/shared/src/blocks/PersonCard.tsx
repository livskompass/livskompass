import { Mail, Phone } from 'lucide-react'
import { resolveMediaUrl } from '../helpers'

export interface PersonCardProps {
  name: string
  title: string
  bio: string
  image: string
  email: string
  phone: string
  style: 'card' | 'horizontal'
}

export function PersonCard({
  name = 'Fredrik Livheim',
  title = 'Legitimerad psykolog',
  bio = '',
  image = '',
  email = '',
  phone = '',
  style = 'card',
}: PersonCardProps) {
  const resolvedImage = image ? resolveMediaUrl(image) : ''

  if (style === 'horizontal') {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {resolvedImage ? (
            <img src={resolvedImage} alt={name} className="w-48 h-48 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-4xl text-forest-600">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="text-h3 text-stone-800">{name}</h3>
            {title && <p className="text-amber-600 font-medium mt-1">{title}</p>}
            {bio && <p className="text-stone-600 mt-4 leading-relaxed">{bio}</p>}
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
          <img src={resolvedImage} alt={name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-3xl text-forest-600">{name.charAt(0)}</span>
          </div>
        )}
        <h3 className="text-h4 text-stone-800">{name}</h3>
        {title && <p className="text-amber-600 font-medium mt-1 text-sm">{title}</p>}
        {bio && <p className="text-stone-600 mt-3 text-sm leading-relaxed">{bio}</p>}
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

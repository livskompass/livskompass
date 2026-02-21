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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {resolvedImage ? (
            <img src={resolvedImage} alt={name} className="w-48 h-48 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-4xl text-primary-600">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-heading text-2xl font-bold text-neutral-800">{name}</h3>
            {title && <p className="text-accent-600 font-medium mt-1">{title}</p>}
            {bio && <p className="text-neutral-600 mt-4 leading-relaxed">{bio}</p>}
            {(email || phone) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors">
                    <Mail className="h-4 w-4" />{email}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors">
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
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden text-center p-8">
        {resolvedImage ? (
          <img src={resolvedImage} alt={name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <span className="font-heading text-3xl text-primary-600">{name.charAt(0)}</span>
          </div>
        )}
        <h3 className="font-heading text-xl font-bold text-neutral-800">{name}</h3>
        {title && <p className="text-accent-600 font-medium mt-1 text-sm">{title}</p>}
        {bio && <p className="text-neutral-600 mt-3 text-sm leading-relaxed">{bio}</p>}
        {(email || phone) && (
          <div className="flex flex-col items-center gap-2 mt-4">
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors">
                <Mail className="h-4 w-4" />{email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors">
                <Phone className="h-4 w-4" />{phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

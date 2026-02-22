import { useEffect, useState } from 'react'
import { cn } from '../ui/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import { getApiBase, useScrollReveal } from '../helpers'
import { useInlineEdit } from '../context'

export interface ManualCard {
  title: string
  description: string
  image: string
  link: string
  badge: string
}

export interface CardGridProps {
  heading: string
  subheading: string
  source: 'manual' | 'courses' | 'products' | 'posts'
  maxItems: number
  columns: 2 | 3 | 4
  cardStyle: 'default' | 'bordered' | 'shadow'
  manualCards: ManualCard[]
}

const columnsMap = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const

const cardStyleMap = {
  default: '',
  bordered: 'border-2',
  shadow: 'shadow-md',
} as const

interface DynamicItem {
  id: string
  slug: string
  title: string
  description?: string
  excerpt?: string
  image_url?: string
  featured_image?: string
  status?: string
  location?: string
  start_date?: string
  published_at?: string
}

export function CardGrid({
  heading = '',
  subheading = '',
  source = 'manual',
  maxItems = 3,
  columns = 3,
  cardStyle = 'default',
  manualCards = [],
  id,
}: CardGridProps & { puck?: { isEditing: boolean }; id?: string }) {
  const [dynamicItems, setDynamicItems] = useState<DynamicItem[]>([])
  const [dynamicLoading, setDynamicLoading] = useState(source !== 'manual')
  const revealRef = useScrollReveal()
  const headingEdit = useInlineEdit('heading', heading, id || '')
  const subheadingEdit = useInlineEdit('subheading', subheading, id || '')

  useEffect(() => {
    if (source === 'manual') return

    setDynamicLoading(true)
    const base = getApiBase()
    const endpointMap: Record<string, string> = {
      courses: `${base}/courses`,
      products: `${base}/products`,
      posts: `${base}/posts?limit=${maxItems}`,
    }

    const endpoint = endpointMap[source]
    if (!endpoint) { setDynamicLoading(false); return }

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        const items = data[source] || []
        setDynamicItems(items.slice(0, maxItems))
      })
      .catch(() => {})
      .finally(() => setDynamicLoading(false))
  }, [source, maxItems])

  const renderManualCards = () =>
    manualCards.slice(0, maxItems).map((card, i) => (
      <a key={i} href={card.link || '#'} className="block group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
        <Card className={cn('h-full hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', cardStyleMap[cardStyle])}>
          {card.image && (
            <div className="aspect-video overflow-hidden rounded-t-xl">
              <img
                src={card.image}
                alt={card.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <CardHeader>
            {card.badge && (
              <Badge variant="default" className="w-fit mb-1">
                {card.badge}
              </Badge>
            )}
            <CardTitle className="text-h4 group-hover:text-forest-600 transition-colors">
              {card.title}
            </CardTitle>
            {card.description && (
              <CardDescription className="line-clamp-2">
                {card.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      </a>
    ))

  const renderDynamicCards = () =>
    dynamicItems.map((item) => {
      const image = item.featured_image || item.image_url
      const description = item.description || item.excerpt || ''
      const linkBase =
        source === 'courses'
          ? '/utbildningar/'
          : source === 'posts'
            ? '/nyhet/'
            : '/produkter/'

      return (
        <a key={item.id} href={`${linkBase}${item.slug}`} className="block group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
          <Card className={cn('h-full hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', cardStyleMap[cardStyle])}>
            {image && (
              <div className="aspect-video overflow-hidden rounded-t-xl">
                <img
                  src={image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <CardHeader>
              {source === 'courses' && item.status && (
                <Badge
                  variant={item.status === 'full' ? 'destructive' : 'success'}
                  className="w-fit mb-1"
                >
                  {item.status === 'full' ? 'Fullbokad' : 'Platser kvar'}
                </Badge>
              )}
              {source === 'posts' && item.published_at && (
                <Badge variant="secondary" className="w-fit mb-1">
                  {new Date(item.published_at).toLocaleDateString('sv-SE')}
                </Badge>
              )}
              <CardTitle className="text-h4 group-hover:text-forest-600 transition-colors">
                {item.title}
              </CardTitle>
              {description && (
                <CardDescription className="line-clamp-2">
                  {description}
                </CardDescription>
              )}
            </CardHeader>
            {source === 'courses' && (item.location || item.start_date) && (
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-stone-500">
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-stone-400" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-400" />
                      <span>
                        {new Date(item.start_date).toLocaleDateString('sv-SE')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </a>
      )
    })

  const cards = source === 'manual' ? manualCards : dynamicItems
  const isEmpty = cards.length === 0

  return (
    <section ref={revealRef} style={{ paddingBlock: 'var(--section-md)', maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
      {(heading || subheading || headingEdit || subheadingEdit) && (
        <div className="text-center mb-10 reveal">
          {(heading || headingEdit) && (
            <h2 {...(headingEdit ? { contentEditable: headingEdit.contentEditable, suppressContentEditableWarning: headingEdit.suppressContentEditableWarning, onBlur: headingEdit.onBlur, onKeyDown: headingEdit.onKeyDown, 'data-inline-edit': 'heading' } : {})} className={cn('text-h2 text-stone-800 mb-3', headingEdit?.className)}>{heading}</h2>
          )}
          {(subheading || subheadingEdit) && (
            <p {...(subheadingEdit ? { contentEditable: subheadingEdit.contentEditable, suppressContentEditableWarning: subheadingEdit.suppressContentEditableWarning, onBlur: subheadingEdit.onBlur, onKeyDown: subheadingEdit.onKeyDown, 'data-inline-edit': 'subheading' } : {})} className={cn('text-stone-600 text-lg', subheadingEdit?.className)}>{subheading}</p>
          )}
        </div>
      )}
      {dynamicLoading && source !== 'manual' ? (
        <div className={cn('grid grid-cols-1 gap-6', columnsMap[columns])}>
          {Array.from({ length: Math.min(maxItems, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden animate-pulse">
              <div className="aspect-video bg-stone-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-stone-100 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          {source === 'manual'
            ? 'Lägg till kort i inställningarna...'
            : 'Inget innehåll tillgängligt.'}
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 gap-6 reveal', columnsMap[columns])}>
          {source === 'manual' ? renderManualCards() : renderDynamicCards()}
        </div>
      )}
    </section>
  )
}

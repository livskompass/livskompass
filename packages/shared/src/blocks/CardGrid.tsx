import { useEffect, useState } from 'react'
import { cn } from '../ui/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, MapPin } from 'lucide-react'

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
}: CardGridProps) {
  const [dynamicItems, setDynamicItems] = useState<DynamicItem[]>([])

  useEffect(() => {
    if (source === 'manual') return

    const endpointMap: Record<string, string> = {
      courses: '/api/courses',
      products: '/api/products',
      posts: '/api/posts?limit=' + maxItems,
    }

    const endpoint = endpointMap[source]
    if (!endpoint) return

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        const items = data[source] || []
        setDynamicItems(items.slice(0, maxItems))
      })
      .catch(() => {
        // Silently fail — shows empty grid
      })
  }, [source, maxItems])

  const renderManualCards = () =>
    manualCards.slice(0, maxItems).map((card, i) => (
      <a key={i} href={card.link || '#'} className="block group">
        <Card className={cn('h-full hover:shadow-md transition-all duration-200', cardStyleMap[cardStyle])}>
          {card.image && (
            <div className="aspect-video overflow-hidden rounded-t-xl">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader>
            {card.badge && (
              <Badge variant="default" className="w-fit mb-1">
                {card.badge}
              </Badge>
            )}
            <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
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
        <a key={item.id} href={`${linkBase}${item.slug}`} className="block group">
          <Card className={cn('h-full hover:shadow-md transition-all duration-200', cardStyleMap[cardStyle])}>
            {image && (
              <div className="aspect-video overflow-hidden rounded-t-xl">
                <img
                  src={image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
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
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
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
    <section className="py-12">
      {(heading || subheading) && (
        <div className="text-center mb-10">
          {heading && (
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{heading}</h2>
          )}
          {subheading && (
            <p className="text-gray-500 text-lg">{subheading}</p>
          )}
        </div>
      )}
      {isEmpty ? (
        <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          {source === 'manual'
            ? 'Lägg till kort i inställningarna...'
            : 'Laddar...'}
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 gap-6', columnsMap[columns])}>
          {source === 'manual' ? renderManualCards() : renderDynamicCards()}
        </div>
      )}
    </section>
  )
}

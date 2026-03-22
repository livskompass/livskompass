import { useEffect, useState } from 'react'
import { cn } from '../ui/utils'
// Card UI components no longer used directly — cardColors handles styling
import { Badge } from '../ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import { getApiBase, useScrollReveal } from '../helpers'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { InlineImage } from './InlineImage'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'
import { getCardColors } from './cardColors'

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
  fullBadgeText: string
  spotsAvailableText: string
  emptyManualText: string
  emptyDynamicText: string
  cardColor?: string
}

const columnsMap = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const


/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function ManualCardItem({ card, index, totalItems, cardColor }: { card: ManualCard; index: number; totalItems: number; cardColor?: string }) {
  const editCtx = useInlineEditBlock()
  const titleEdit = useEditableText(`manualCards[${index}].title`, card.title)
  const descEdit = useEditableText(`manualCards[${index}].description`, card.description)
  const badgeEdit = useEditableText(`manualCards[${index}].badge`, card.badge)
  const colors = getCardColors(cardColor)

  return (
    <ArrayItemControls fieldName="manualCards" itemIndex={index} totalItems={totalItems}>
    <a href={card.link || '#'} className="block group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2" onClick={editCtx ? (e: React.MouseEvent) => e.preventDefault() : undefined}>
      <div className={cn('rounded-lg overflow-hidden h-full hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', colors.bg)}>
        {(card.image || editCtx) && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <InlineImage
              src={card.image}
              propName={`manualCards[${index}].image`}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5">
          {(card.badge || badgeEdit) && (
            <Badge variant="default" className={cn('w-fit mb-1', colors.badge)}>
              <span {...editHandlers(badgeEdit)} className={badgeEdit?.className}>{card.badge}</span>
            </Badge>
          )}
          <h3 {...editHandlers(titleEdit)} className={cn('text-h4 transition-colors', colors.text, titleEdit?.className)}>
            {card.title}
          </h3>
          {(card.description || descEdit) && (
            <p {...editHandlers(descEdit)} className={cn('line-clamp-2 mt-1.5 text-body-sm', colors.textMuted, descEdit?.className)}>
              {card.description}
            </p>
          )}
        </div>
      </div>
    </a>
    </ArrayItemControls>
  )
}

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
  cardStyle: _cardStyle = 'default',
  manualCards = [],
  fullBadgeText = 'Fully booked',
  spotsAvailableText = 'Spots available',
  emptyManualText = 'Add cards in settings...',
  emptyDynamicText = 'No content available.',
  cardColor = 'mist',
  id,
}: CardGridProps & { puck?: { isEditing: boolean }; id?: string }) {
  const colors = getCardColors(cardColor)
  const [dynamicItems, setDynamicItems] = useState<DynamicItem[]>([])
  const [dynamicLoading, setDynamicLoading] = useState(source !== 'manual')
  const revealRef = useScrollReveal()
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx

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
      <ManualCardItem key={i} card={card} index={i} totalItems={manualCards.length} cardColor={cardColor} />
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
        <a key={item.id} href={`${linkBase}${item.slug}`} className="block group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
          <div className={cn('rounded-lg overflow-hidden h-full hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', colors.bg)}>
            {image && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-5">
              {source === 'courses' && item.status && (
                <Badge
                  variant={item.status === 'full' ? 'destructive' : 'success'}
                  className="w-fit mb-1"
                >
                  {item.status === 'full' ? fullBadgeText : spotsAvailableText}
                </Badge>
              )}
              {source === 'posts' && item.published_at && (
                <Badge variant="secondary" className="w-fit mb-1">
                  {new Date(item.published_at).toLocaleDateString('sv-SE')}
                </Badge>
              )}
              <h3 className={cn('text-h4 transition-colors', colors.text)}>
                {item.title}
              </h3>
              {description && (
                <p className={cn('line-clamp-2 mt-1.5 text-body-sm', colors.textMuted)}>
                  {description}
                </p>
              )}
            </div>
            {source === 'courses' && (item.location || item.start_date) && (
              <div className="px-5 pb-5">
                <div className={cn('flex flex-col gap-2 text-body-sm', colors.textMuted)}>
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(item.start_date).toLocaleDateString('sv-SE')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
            <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-foreground mb-3', headingEdit?.className)}>{heading}</h2>
          )}
          {(subheading || subheadingEdit) && (
            <p {...editHandlers(subheadingEdit)} className={cn('text-secondary text-body-lg', subheadingEdit?.className)}>{subheading}</p>
          )}
        </div>
      )}
      {dynamicLoading && source !== 'manual' ? (
        <div className={cn('grid grid-cols-1 gap-6', columnsMap[columns])}>
          {Array.from({ length: Math.min(maxItems, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-default bg-surface-elevated overflow-hidden animate-pulse">
              <div className="aspect-video bg-surface-alt" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-surface-alt rounded w-3/4" />
                <div className="h-4 bg-surface-alt rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-8 text-center text-faint border-2 border-dashed border-default rounded-lg">
          {source === 'manual' ? emptyManualText : emptyDynamicText}
        </div>
      ) : (
        <ArrayDragProvider fieldName="manualCards">
        <div className={cn('grid grid-cols-1 gap-6 reveal', columnsMap[columns])}>
          {source === 'manual' ? renderManualCards() : renderDynamicCards()}
        </div>
        </ArrayDragProvider>
      )}
      {source === 'manual' && <AddItemButton fieldName="manualCards" label="Add card" />}
    </section>
  )
}

import { cn } from '../ui/utils'
import { useFetchJson, resolveMediaUrl, useScrollReveal } from '../helpers'
import { EditItemBadge } from './EditItemBadge'
import { ExternalLink } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { getCardColors } from './cardColors'
import { getButtonStyle } from './buttonUtils'

export interface ProductListProps {
  heading: string
  filterType: string
  columns: 2 | 3
  maxItems?: number
  showImage?: boolean
  showPrice?: boolean
  buyButtonText: string
  freeLabel: string
  outOfStockLabel: string
  emptyText: string
  typeLabels: Record<string, string>
  cardColor?: string
}

interface Product {
  id: string
  slug: string
  title: string
  description: string
  type: string
  price_sek: number
  in_stock: boolean
  external_url: string
  image_url: string
}

const defaultTypeLabels: Record<string, string> = {
  book: 'Books',
  cd: 'CDs',
  cards: 'Cards',
  app: 'Apps',
  download: 'Downloads',
}

const colMap: Record<number, string> = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function ProductList({
  heading = '',
  filterType = '',
  columns = 3,
  maxItems = 0,
  showImage = true,
  showPrice = true,
  buyButtonText = 'Buy',
  freeLabel = 'Free',
  outOfStockLabel = 'Out of stock',
  emptyText = 'No products found.',
  typeLabels = defaultTypeLabels,
  cardColor = 'mist',
  id,
}: ProductListProps & { puck?: { isEditing: boolean }; id?: string }) {
  const colors = getCardColors(cardColor)
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  // Template text inline editing
  const buyBtnEdit = useEditableText('buyButtonText', buyButtonText)
  const freeLabelEdit = useEditableText('freeLabel', freeLabel)
  const outOfStockEdit = useEditableText('outOfStockLabel', outOfStockLabel)
  const emptyTextEdit = useEditableText('emptyText', emptyText)

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const { variantClass: buyBtnClass, Icon: BuyBtnIcon } = getButtonStyle(btnStyles, 'buyButtonText', 'primary', 'external-link')

  const { data, loading } = useFetchJson<{ products: Product[] }>('/products')
  const allProducts = data?.products || []
  const filtered = filterType ? allProducts.filter((p) => p.type === filterType) : allProducts
  const products = maxItems > 0 ? filtered.slice(0, maxItems) : filtered

  // Group products by type
  const grouped = new Map<string, Product[]>()
  for (const product of products) {
    const key = product.type || 'other'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(product)
  }

  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-foreground mb-8 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] ?? colMap[3])}>
          {Array.from({ length: Math.min(columns, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-default bg-surface-elevated overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-surface-alt" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-surface-alt rounded w-1/4" />
                <div className="h-5 bg-surface-alt rounded w-3/4" />
                <div className="h-4 bg-surface-alt rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-12 reveal">
          {Array.from(grouped.entries()).map(([type, typeProducts]) => (
            <div key={type}>
              {!filterType && grouped.size > 1 && typeLabels[type] && (
                <h3 className="text-h4 text-foreground mb-4">
                  {typeLabels[type]}
                </h3>
              )}
              <div className={cn('grid grid-cols-1 gap-6', colMap[columns] ?? colMap[3])}>
                {typeProducts.map((product) => (
                  <div key={product.slug} className={cn('relative group rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col', colors.bg)}>
                    <EditItemBadge cmsRoute="products" entityId={product.id} slug={product.slug} label="Edit product" />
                    {showImage !== false && product.image_url && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={resolveMediaUrl(product.image_url)}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <span className={cn('text-caption font-medium uppercase tracking-wide', cardColor === 'dark' ? 'text-amber-300/80' : 'text-highlight')}>
                        {typeLabels[product.type] || product.type}
                      </span>
                      <h4 className={cn('text-h3 break-words hyphens-auto text-balance mt-1 mb-2', colors.text)}>{product.title}</h4>
                      {product.description && (
                        <p className={cn('text-body-sm line-clamp-3 mb-4', colors.textMuted)}>{product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        {showPrice !== false ? (
                          product.price_sek ? (
                            <span className={cn('font-display text-h4', colors.text)}>
                              {product.price_sek.toLocaleString('sv-SE')} <span className={cn('text-body-sm font-normal', colors.textMuted)}>kr</span>
                            </span>
                          ) : (
                            <span className={cn('text-caption font-semibold px-2.5 py-1 rounded-full', colors.badge)}>
                              <span {...editHandlers(freeLabelEdit)} className={freeLabelEdit?.className}>{freeLabel}</span>
                            </span>
                          )
                        ) : <span />}
                        {!product.in_stock ? (
                          <span className={cn('text-caption font-medium', colors.textMuted)}>
                            <span {...editHandlers(outOfStockEdit)} className={outOfStockEdit?.className}>{outOfStockLabel}</span>
                          </span>
                        ) : product.external_url ? (
                          <a
                            href={product.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn('inline-flex items-center h-9 px-4 text-body-sm font-medium rounded-lg transition-colors', btnStyles ? buyBtnClass : (cardColor === 'dark' ? 'bg-highlight-soft text-brand hover:bg-amber-200' : 'bg-amber-500 text-white hover:bg-amber-600'))}
                          >
                            <span {...editHandlers(buyBtnEdit)} className={buyBtnEdit?.className}>{buyButtonText}</span>
                            {BuyBtnIcon ? <BuyBtnIcon className="ml-1.5 h-3.5 w-3.5" /> : (!btnStyles && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />)}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-faint border-2 border-dashed border-default rounded-xl">
          <span {...editHandlers(emptyTextEdit)} className={emptyTextEdit?.className}>{emptyText}</span>
        </div>
      )}
    </div>
  )
}

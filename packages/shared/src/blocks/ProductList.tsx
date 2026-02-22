import { cn } from '../ui/utils'
import { useFetchJson, resolveMediaUrl, useScrollReveal } from '../helpers'
import { ExternalLink } from 'lucide-react'
import { useInlineEdit } from '../context'

export interface ProductListProps {
  heading: string
  filterType: string
  columns: 2 | 3
  buyButtonText: string
  freeLabel: string
  outOfStockLabel: string
  emptyText: string
}

interface Product {
  slug: string
  title: string
  description: string
  type: string
  price_sek: number
  in_stock: boolean
  external_url: string
  image_url: string
}

const typeLabels: Record<string, string> = {
  book: 'Böcker',
  cd: 'CD-skivor',
  cards: 'Kort',
  app: 'Appar',
  download: 'Nedladdningar',
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3' }

export function ProductList({
  heading = '',
  filterType = '',
  columns = 3,
  buyButtonText = 'Köp',
  freeLabel = 'Gratis',
  outOfStockLabel = 'Slut i lager',
  emptyText = 'Inga produkter hittades.',
  id,
}: ProductListProps & { puck?: { isEditing: boolean }; id?: string }) {
  const headingEdit = useInlineEdit('heading', heading, id || '')
  const { data, loading } = useFetchJson<{ products: Product[] }>('/products')
  const allProducts = data?.products || []
  const products = filterType ? allProducts.filter((p) => p.type === filterType) : allProducts

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
        <h2 {...(headingEdit ? { contentEditable: headingEdit.contentEditable, suppressContentEditableWarning: headingEdit.suppressContentEditableWarning, onBlur: headingEdit.onBlur, onKeyDown: headingEdit.onKeyDown, 'data-inline-edit': 'heading' } : {})} className={cn('text-h2 text-stone-800 mb-8 reveal', headingEdit?.className)}>{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
          {Array.from({ length: Math.min(columns, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-stone-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-100 rounded w-1/4" />
                <div className="h-5 bg-stone-100 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-12 reveal">
          {Array.from(grouped.entries()).map(([type, typeProducts]) => (
            <div key={type}>
              {!filterType && grouped.size > 1 && (
                <h3 className="text-h4 text-stone-800 mb-4">
                  {typeLabels[type] || type}
                </h3>
              )}
              <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
                {typeProducts.map((product) => (
                  <div key={product.slug} className="group bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                    {product.image_url && (
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
                      <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                        {typeLabels[product.type] || product.type}
                      </span>
                      <h4 className="font-semibold text-stone-800 mt-1 mb-2">{product.title}</h4>
                      {product.description && (
                        <p className="text-sm text-stone-500 line-clamp-3 mb-4">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        {product.price_sek ? (
                          <span className="font-display text-h4 text-stone-800">
                            {product.price_sek.toLocaleString('sv-SE')} kr
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-forest-600 bg-forest-50 px-2 py-1 rounded">{freeLabel}</span>
                        )}
                        {!product.in_stock ? (
                          <span className="text-xs text-stone-400 font-medium">{outOfStockLabel}</span>
                        ) : product.external_url ? (
                          <a
                            href={product.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center h-9 px-4 text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 rounded-full transition-colors"
                          >
                            {buyButtonText}
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
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
        <div className="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
          {emptyText}
        </div>
      )}
    </div>
  )
}

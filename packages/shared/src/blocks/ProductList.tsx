import { cn } from '../ui/utils'
import { useFetchJson, resolveMediaUrl } from '../helpers'
import { ExternalLink } from 'lucide-react'

export interface ProductListProps {
  heading: string
  filterType: string
  columns: 2 | 3
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
}: ProductListProps) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {heading && (
        <h2 className="font-heading text-3xl font-bold text-neutral-800 mb-8 tracking-tight">{heading}</h2>
      )}
      {loading ? (
        <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-neutral-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-neutral-100 rounded w-1/4" />
                <div className="h-5 bg-neutral-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([type, typeProducts]) => (
            <div key={type}>
              {!filterType && grouped.size > 1 && (
                <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-4">
                  {typeLabels[type] || type}
                </h3>
              )}
              <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
                {typeProducts.map((product) => (
                  <div key={product.slug} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden card-hover">
                    {product.image_url && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={resolveMediaUrl(product.image_url)}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-medium text-accent-600 uppercase tracking-wide">
                        {typeLabels[product.type] || product.type}
                      </span>
                      <h4 className="font-semibold text-neutral-800 mt-1 mb-2">{product.title}</h4>
                      {product.description && (
                        <p className="text-sm text-neutral-500 line-clamp-3 mb-4">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        {product.price_sek ? (
                          <span className="font-heading text-lg font-bold text-neutral-800">
                            {product.price_sek.toLocaleString('sv-SE')} kr
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">Gratis</span>
                        )}
                        {!product.in_stock ? (
                          <span className="text-xs text-neutral-400 font-medium">Slut i lager</span>
                        ) : product.external_url ? (
                          <a
                            href={product.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center h-9 px-4 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 rounded-lg transition-colors"
                          >
                            Köp
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
        <div className="text-center py-16 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
          Inga produkter hittades.
        </div>
      )}
    </div>
  )
}

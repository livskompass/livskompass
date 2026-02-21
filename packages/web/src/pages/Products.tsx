import { useQuery } from '@tanstack/react-query'
import { getProducts, getMediaUrl } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

export default function Products() {
  useDocumentTitle('Material')
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  })

  const productTypes = [
    { key: 'book', label: 'Böcker' },
    { key: 'cd', label: 'CD-skivor' },
    { key: 'cards', label: 'Kort' },
    { key: 'app', label: 'Appar' },
    { key: 'download', label: 'Nedladdningar' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Material</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Böcker, CD-skivor och annat material om ACT och mindfulness
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.products && data.products.length > 0 ? (
        <>
          {productTypes.map(({ key, label }) => {
            const typeProducts = data.products.filter((p) => p.type === key)
            if (typeProducts.length === 0) return null

            return (
              <section key={key} className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {typeProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-md transition-all duration-200 group"
                    >
                      {product.image_url && (
                        <div className="aspect-video overflow-hidden bg-gray-50">
                          <img
                            src={getMediaUrl(product.image_url)}
                            alt={product.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{label.replace(/er$|or$/, '')}</Badge>
                          {product.in_stock === 0 && (
                            <Badge variant="destructive">Tillfälligt slut</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{product.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500 mb-4 line-clamp-3">{product.description}</p>

                        <div className="flex items-center justify-between">
                          {product.price_sek ? (
                            <span className="text-lg font-semibold text-gray-900">
                              {product.price_sek.toLocaleString('sv-SE')} kr
                            </span>
                          ) : (
                            <Badge variant="success">Gratis</Badge>
                          )}

                          {product.external_url && (
                            <Button size="sm" asChild>
                              <a
                                href={product.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {product.type === 'app' ? 'Öppna app' : 'Köp'}
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">
              Det finns inget material tillgängligt just nu.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

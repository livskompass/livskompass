import { useQuery } from '@tanstack/react-query'
import { getProducts, getMediaUrl } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

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
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Material</h1>
      <p className="text-xl text-gray-600 mb-12">
        Böcker, CD-skivor och annat material om ACT och mindfulness
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md p-6">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
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
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {product.image_url && (
                        <img
                          src={getMediaUrl(product.image_url)}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{product.description}</p>

                        <div className="flex items-center justify-between">
                          {product.price_sek ? (
                            <span className="text-lg font-semibold text-gray-900">
                              {product.price_sek.toLocaleString('sv-SE')} kr
                            </span>
                          ) : (
                            <span className="text-gray-500">Gratis</span>
                          )}

                          {product.external_url && (
                            <a
                              href={product.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                              {product.type === 'app' ? 'Öppna app' : 'Köp'}
                            </a>
                          )}
                        </div>

                        {product.in_stock === 0 && (
                          <p className="text-red-600 text-sm mt-2">
                            Tillfälligt slut
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Det finns inget material tillgängligt just nu.
          </p>
        </div>
      )}
    </div>
  )
}

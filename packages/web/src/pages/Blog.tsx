import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Blog() {
  useDocumentTitle('Nyheter')
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(20),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Nyheter</h1>
      <p className="text-xl text-gray-600 mb-12">
        Senaste nytt om ACT, mindfulness och våra utbildningar
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.posts && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <time className="text-sm text-gray-500">
                  {new Date(post.published_at).toLocaleDateString('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <Link
                  to={`/nyhet/${post.slug}`}
                  className="text-primary-600 font-semibold hover:text-primary-700"
                >
                  Läs mer &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Det finns inga nyheter just nu.
          </p>
        </div>
      )}
    </div>
  )
}

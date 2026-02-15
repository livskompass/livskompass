import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts, getMediaUrl } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Blog() {
  useDocumentTitle('Nyheter')
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(20),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Nyheter</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Senaste nytt om ACT, mindfulness och våra utbildningar
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.posts && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-md transition-all duration-200 group"
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={getMediaUrl(post.featured_image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {new Date(post.published_at).toLocaleDateString('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Badge>
                <CardTitle className="text-xl group-hover:text-primary-600 transition-colors mt-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4 line-clamp-3">{post.excerpt}</p>
                <Button variant="ghost" className="p-0 h-auto font-semibold text-primary-600 hover:text-primary-700 hover:bg-transparent" asChild>
                  <Link to={`/nyhet/${post.slug}`}>
                    Läs mer
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">
              Det finns inga nyheter just nu.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

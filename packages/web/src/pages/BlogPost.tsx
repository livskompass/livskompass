import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPost, getMediaUrl, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.post?.title)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-72 w-full rounded-xl mb-8" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    )
  }

  if (error || !data?.post) {
    return <NotFound />
  }

  const { post } = data
  const postAny = post as any

  return (
    <article>
      {/* Post chrome: back button, date, title, featured image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <Button variant="ghost" className="mb-6 -ml-2 text-gray-600 hover:text-primary-600" asChild>
          <Link to="/nyhet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Alla inlägg
          </Link>
        </Button>

        <header className="mb-8">
          <Badge variant="secondary" className="mb-3">
            {new Date(post.published_at).toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{post.title}</h1>
        </header>

        {post.featured_image && (
          <img
            src={getMediaUrl(post.featured_image)}
            alt={post.title}
            loading="lazy"
            className="w-full h-auto rounded-xl mb-8 shadow-sm"
          />
        )}
      </div>

      {/* Content: Puck blocks if available, otherwise legacy HTML */}
      {postAny.content_blocks ? (
        <BlockRenderer data={postAny.content_blocks} />
      ) : post.content ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div
            className="prose prose-lg max-w-none prose-headings:tracking-tight prose-a:text-primary-600"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(post.content)) }}
          />
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">Inget innehåll tillgängligt.</div>
      )}
    </article>
  )
}

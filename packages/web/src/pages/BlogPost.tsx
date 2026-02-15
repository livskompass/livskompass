import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPost, getMediaUrl, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.post) {
    return <NotFound />
  }

  const { post } = data

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        to="/nyhet"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Alla nyheter
      </Link>

      <header className="mb-8">
        <time className="text-gray-500">
          {new Date(post.published_at).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <h1 className="text-4xl font-bold text-gray-900 mt-2">{post.title}</h1>
      </header>

      {post.featured_image && (
        <img
          src={getMediaUrl(post.featured_image)}
          alt={post.title}
          className="w-full h-auto rounded-lg mb-8"
        />
      )}

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(post.content)) }}
      />
    </article>
  )
}

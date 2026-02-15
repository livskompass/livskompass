import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function Page() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPage(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.page?.title)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.page) {
    return <NotFound />
  }

  const { page } = data

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(page.content)) }}
      />
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ChevronRight } from 'lucide-react'

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
        <Skeleton className="h-10 w-3/4 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !data?.page) {
    return <NotFound />
  }

  const { page, children } = data
  const pageAny = page as any

  // ── Puck block rendering ─────────────────────────────────────────
  if (pageAny.editor_version === 'puck' && pageAny.content_blocks) {
    return <BlockRenderer data={pageAny.content_blocks} />
  }

  // ── Legacy HTML rendering ────────────────────────────────────────
  const hasChildren = children && children.length > 0
  const hasContent = page.content
    && page.content.replace(/&nbsp;/g, '').trim().length > 0
  const strippedContent = (page.content || '')
    .replace(/&nbsp;/g, '')
    .replace(/<a[^>]*>.*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
  const showChildCards = hasChildren && (!hasContent || strippedContent.length > 50)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">{page.title}</h1>

      {hasContent && (
        <div
          className="prose prose-lg max-w-none prose-headings:tracking-tight prose-a:text-primary-600"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(page.content)) }}
        />
      )}

      {showChildCards && (
        <div className={hasContent ? 'mt-12' : ''}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((child) => (
              <Link key={child.id} to={`/${child.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow group cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between group-hover:text-primary-600 transition-colors">
                      {child.title}
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </CardTitle>
                    {child.meta_description && (
                      <CardDescription>{child.meta_description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

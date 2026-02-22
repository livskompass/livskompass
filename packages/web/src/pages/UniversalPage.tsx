import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { setPageEditData } from '../components/InlineEditProvider'
import { defaultHomeTemplate, defaultPageTemplate } from '@livskompass/shared'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ChevronRight } from 'lucide-react'

function PageSkeleton() {
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

export default function UniversalPage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug || paramSlug

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPage(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.page?.title)

  // Register page data for inline editing
  useEffect(() => {
    if (data?.page?.id && data.page.content_blocks) {
      setPageEditData({
        pageId: String(data.page.id),
        contentBlocks: data.page.content_blocks,
        updatedAt: data.page.updated_at || '',
      })
    }
    return () => setPageEditData(null)
  }, [data?.page?.id, data?.page?.content_blocks, data?.page?.updated_at])

  if (isLoading) return <PageSkeleton />
  if (error || !data?.page) return <NotFound />

  const { page, children } = data

  // Puck blocks: render through BlockRenderer (skip empty Puck documents)
  if (page.content_blocks) {
    try {
      const parsed = JSON.parse(page.content_blocks)
      if (parsed.content && parsed.content.length > 0) {
        return <BlockRenderer data={page.content_blocks} />
      }
    } catch {
      // Invalid JSON — fall through to legacy/default
    }
  }

  // Homepage with empty blocks: use default home template
  if (slug === 'home-2' && (!page.content || page.content.trim() === '')) {
    return <BlockRenderer data={defaultHomeTemplate} />
  }

  // Non-home pages with no content_blocks: use default page template
  if (!page.content_blocks && (!page.content || page.content.trim() === '')) {
    const safeTitle = JSON.stringify(page.title || 'Sida').slice(1, -1)
    const template = defaultPageTemplate
      .replace('__PAGE_TITLE__', safeTitle)
      .replace('__LEGACY_CONTENT__', '<p></p>')
    return <BlockRenderer data={template} />
  }

  // Legacy fallback: old HTML content with child page cards
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1 text-forest-950 mb-8">{page.title}</h1>

      {page.content && (
        <div
          className="prose prose-lg max-w-none mb-10 prose-headings:tracking-tight prose-a:text-forest-600"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(page.content)) }}
        />
      )}

      {children && children.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <Link key={child.id} to={`/${child.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between group-hover:text-forest-600 transition-colors">
                    {child.title}
                    <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-forest-600 transition-colors" />
                  </CardTitle>
                  {child.meta_description && (
                    <CardDescription>{child.meta_description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

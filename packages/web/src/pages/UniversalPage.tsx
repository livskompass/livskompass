import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { setPageEditData } from '../components/InlineEditProvider'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ChevronRight } from 'lucide-react'

function PageSkeleton() {
  // Hero-shaped placeholder: full-bleed, tall, soft pulsing surface so the
  // real hero swaps in without a layout jump. Two faint bars hint at where
  // the heading and subheading will land.
  return (
    <div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 'max(70vh, 560px)',
          backgroundColor: 'rgb(var(--mist) / 0.5)',
        }}
      >
        <div
          className="absolute inset-0 animate-warm-pulse"
          style={{ backgroundColor: 'rgb(var(--mist) / 0.35)' }}
        />
        <div
          className="relative h-full mx-auto flex flex-col justify-end pb-[10vh] md:pb-[14vh]"
          style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}
        >
          <Skeleton className="h-10 md:h-14 w-2/3 max-w-xl mb-4" />
          <Skeleton className="h-4 md:h-5 w-1/2 max-w-md" />
        </div>
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
        contentType: 'page',
        contentBlocks: data.page.content_blocks,
        updatedAt: data.page.updated_at || '',
      })
    }
    return () => setPageEditData(null)
  }, [data?.page?.id, data?.page?.content_blocks, data?.page?.updated_at])

  if (isLoading) return <PageSkeleton />

  if (error || !data?.page) {
    return <NotFound />
  }

  const { page, children } = data

  // Puck blocks: render through BlockRenderer
  if (page.content_blocks) {
    try {
      const parsed = JSON.parse(page.content_blocks)
      if (parsed.content && parsed.content.length > 0) {
        return <BlockRenderer data={page.content_blocks} />
      }
    } catch {
      // Invalid JSON — fall through to legacy content
    }
  }

  // Legacy fallback: old HTML content with child page cards
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1 text-heading mb-8">{page.title}</h1>

      {page.content && (
        <div
          className="prose prose-lg max-w-none mb-10 prose-headings:tracking-tight prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(page.content)) }}
        />
      )}

      {children && children.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <Link key={child.id} to={`/${child.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-body-lg flex items-center justify-between group-hover:text-accent transition-colors">
                    {child.title}
                    <ChevronRight className="h-5 w-5 text-faint group-hover:text-accent transition-colors" />
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

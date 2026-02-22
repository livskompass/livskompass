import { useFetchJson, resolveMediaUrl, useScrollReveal } from '../helpers'
import { useInlineEdit } from '../context'
import { cn } from '../ui/utils'

export interface PostGridProps {
  heading: string
  subheading: string
  count: number
  columns: 2 | 3 | 4
  showImage: boolean
  showExcerpt: boolean
  showDate: boolean
  cardStyle: 'default' | 'minimal' | 'featured'
  emptyText: string
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

interface Post {
  slug: string
  title: string
  excerpt: string
  featured_image: string | null
  published_at: string
}

export function PostGrid({
  heading = '',
  subheading = '',
  count = 3,
  columns = 3,
  showImage = true,
  showExcerpt = true,
  showDate = true,
  emptyText = 'Inga inlägg hittades',
  id,
}: PostGridProps & { puck?: { isEditing: boolean }; id?: string }) {
  const limit = count || 3
  const { data, loading } = useFetchJson<{ posts: Post[] }>(`/posts?limit=${limit}`)
  const posts = data?.posts || []
  const revealRef = useScrollReveal()
  const headingEdit = useInlineEdit('heading', heading, id || '')
  const subheadingEdit = useInlineEdit('subheading', subheading, id || '')

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || subheading || headingEdit || subheadingEdit) && (
        <div className="mb-8 reveal">
          {(heading || headingEdit) && <h2 {...(headingEdit ? { contentEditable: headingEdit.contentEditable, suppressContentEditableWarning: headingEdit.suppressContentEditableWarning, onBlur: headingEdit.onBlur, onKeyDown: headingEdit.onKeyDown, 'data-inline-edit': 'heading' } : {})} className={cn('text-h2 text-stone-800 mb-2', headingEdit?.className)}>{heading}</h2>}
          {(subheading || subheadingEdit) && <p {...(subheadingEdit ? { contentEditable: subheadingEdit.contentEditable, suppressContentEditableWarning: subheadingEdit.suppressContentEditableWarning, onBlur: subheadingEdit.onBlur, onKeyDown: subheadingEdit.onKeyDown, 'data-inline-edit': 'subheading' } : {})} className={cn('text-lg text-stone-600', subheadingEdit?.className)}>{subheading}</p>}
        </div>
      )}
      {loading ? (
        <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-6`}>
          {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden animate-pulse">
              {showImage && <div className="aspect-video bg-stone-100" />}
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-5 bg-stone-100 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-6`}>
          {posts.map((post) => (
            <a key={post.slug} href={`/nyhet/${post.slug}`} className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group block outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
              {showImage && post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img src={resolveMediaUrl(post.featured_image)} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                {showDate && post.published_at && (
                  <span className="text-xs font-medium text-stone-400 mb-1 block">
                    {new Date(post.published_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
                <h3 className="text-h4 text-stone-800 group-hover:text-forest-600 transition-colors mb-1">{post.title}</h3>
                {showExcerpt && post.excerpt && (
                  <p className="text-sm text-stone-500 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          {emptyText}
        </div>
      )}
    </div>
  )
}

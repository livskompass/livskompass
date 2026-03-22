import { useFetchJson, resolveMediaUrl, useScrollReveal } from '../helpers'
import { EditItemBadge } from './EditItemBadge'
import { useInlineEdit, useEditableText } from '../context'
import { cn } from '../ui/utils'
import { getCardColors } from './cardColors'

export interface PostGridProps {
  heading: string
  subheading: string
  count: number
  columns: 2 | 3 | 4
  showImage: boolean
  showExcerpt: boolean
  showDate: boolean
  emptyText: string
  cardColor?: string
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

interface Post {
  id: string
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
  emptyText = 'No posts found',
  cardColor = 'mist',
  id,
}: PostGridProps & { puck?: { isEditing: boolean }; id?: string }) {
  const colors = getCardColors(cardColor)
  const limit = count || 3
  const { data, loading } = useFetchJson<{ posts: Post[] }>(`/posts?limit=${limit}`)
  const posts = data?.posts || []
  const revealRef = useScrollReveal()
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)
  const emptyTextEdit = useEditableText('emptyText', emptyText)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || subheading || headingEdit || subheadingEdit) && (
        <div className="mb-8 reveal">
          {(heading || headingEdit) && <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-stone-800 mb-2', headingEdit?.className)}>{heading}</h2>}
          {(subheading || subheadingEdit) && <p {...editHandlers(subheadingEdit)} className={cn('text-lg text-stone-600', subheadingEdit?.className)}>{subheading}</p>}
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
            <div key={post.slug} className={cn('relative group rounded-[16px] overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2', colors.bg)}>
              <EditItemBadge cmsRoute="posts" entityId={post.id} label="Edit post" />
              <a href={`/nyhet/${post.slug}`} className="block">
              {showImage && post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img src={resolveMediaUrl(post.featured_image)} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                {showDate && post.published_at && (
                  <span className={cn('text-xs font-medium mb-1 block', colors.textMuted)}>
                    {new Date(post.published_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
                <h3 className={cn('text-h4 transition-colors mb-1', colors.text)}>{post.title}</h3>
                {showExcerpt && post.excerpt && (
                  <p className={cn('text-sm line-clamp-2', colors.textMuted)}>{post.excerpt}</p>
                )}
              </div>
            </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          <span {...editHandlers(emptyTextEdit)} className={emptyTextEdit?.className}>{emptyText}</span>
        </div>
      )}
    </div>
  )
}

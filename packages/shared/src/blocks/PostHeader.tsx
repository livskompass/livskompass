import { usePostData } from '../context'
import { resolveMediaUrl } from '../helpers'
import { ArrowLeft } from 'lucide-react'

export interface PostHeaderProps {
  showBackLink: boolean
  backLinkText: string
  backLinkUrl: string
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 text-center">
        <p className="text-stone-400 text-sm">Inläggsrubrik visas här (data-bunden)</p>
      </div>
    </div>
  )
}

export function PostHeader({
  showBackLink = true,
  backLinkText = 'Alla inlägg',
  backLinkUrl = '/nyhet',
}: PostHeaderProps) {
  const post = usePostData()

  if (!post) return <Placeholder />

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingTop: 'var(--section-sm)', paddingBottom: 'var(--gap-lg)' }}>
      {showBackLink && (
        <a
          href={backLinkUrl}
          className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLinkText}
        </a>
      )}
      {post.published_at && (
        <span className="block text-sm text-stone-400 mb-2">
          {new Date(post.published_at).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      )}
      <h1 className="text-h1 text-forest-950 mb-6">
        {post.title}
      </h1>
      {post.featured_image && (
        <img
          src={resolveMediaUrl(post.featured_image)}
          alt={post.title}
          loading="lazy"
          className="w-full rounded-xl object-cover max-h-[28rem]"
        />
      )}
    </div>
  )
}

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-neutral-400 text-sm">Inläggsrubrik visas här (data-bunden)</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      {showBackLink && (
        <a
          href={backLinkUrl}
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLinkText}
        </a>
      )}
      {post.published_at && (
        <span className="block text-sm text-neutral-400 mb-2">
          {new Date(post.published_at).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      )}
      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
        {post.title}
      </h1>
      {post.featured_image && (
        <img
          src={resolveMediaUrl(post.featured_image)}
          alt={post.title}
          className="w-full rounded-xl object-cover max-h-[28rem]"
        />
      )}
    </div>
  )
}

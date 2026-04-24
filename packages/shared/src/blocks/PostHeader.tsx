import { usePostData, useEditableText } from '../context'
import { resolveMediaUrl, formatSwedishDate } from '../helpers'
import { ArrowLeft, Tag, Info } from 'lucide-react'

export interface PostHeaderProps {
  showBackLink: boolean
  backLinkText: string
  backLinkUrl: string
}

function Placeholder() {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <div className="bg-surface rounded-xl border-2 border-dashed border-default p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-lg bg-accent-soft p-2 flex-shrink-0">
            <Tag className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-medium text-foreground">Post Header</div>
            <div className="text-caption text-muted mt-0.5">Automatically renders the post's title, date, and featured image — plus an optional "back to posts" link.</div>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
          <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-caption text-amber-900">
            <strong>This block only works on post pages.</strong> Add it at the top of a post's content.
          </div>
        </div>
        <div className="space-y-3" aria-hidden>
          <div className="h-3 w-20 bg-surface-alt rounded" />
          <div className="h-7 w-3/4 bg-surface-alt rounded" />
          <div className="h-32 w-full bg-surface-alt rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function PostHeader({
  showBackLink = true,
  backLinkText = 'All posts',
  backLinkUrl = '/nyhet',
}: PostHeaderProps) {
  const post = usePostData()
  const backLinkTextEdit = useEditableText('backLinkText', backLinkText)

  if (!post) return <Placeholder />

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingTop: 'var(--section-sm)', paddingBottom: 'var(--gap-lg)' }}>
      {showBackLink && (
        <a
          href={backLinkUrl}
          className="inline-flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span {...editHandlers(backLinkTextEdit)} className={backLinkTextEdit?.className}>{backLinkText}</span>
        </a>
      )}
      {post.published_at && (
        <span className="block text-body-sm text-faint mb-2">
          {formatSwedishDate(post.published_at)}
        </span>
      )}
      <h1 className="text-h1 text-heading mb-6">
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

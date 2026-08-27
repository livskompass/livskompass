import { ChevronRight, ExternalLink } from 'lucide-react'
import { useFetchJson, formatSwedishDate } from '../helpers'
import { cn } from '../ui/utils'
import { useEditableText, useInlineEditBlock } from '../context'

export interface NewsletterArchiveProps {
  heading: string
  maxItems: number
  emptyText: string
}

interface Issue {
  id?: number | null
  subject: string
  date: string | null
  url: string
}

/** Helper: extract handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

/**
 * Auto-updating list of sent newsletters, fed by the Get a Newsletter API
 * via /api/newsletter/archive. Each row links to the newsletter's public
 * web version. Shows nothing to visitors until the API token is configured.
 */
export function NewsletterArchive({
  heading = 'Nyhetsbrev',
  maxItems = 0,
  emptyText = 'Inga nyhetsbrev ännu.',
}: NewsletterArchiveProps & { puck?: { isEditing: boolean }; id?: string }) {
  const { data, loading } = useFetchJson<{ issues: Issue[] }>('/newsletter/archive')
  const editCtx = useInlineEditBlock()
  const headingEdit = useEditableText('heading', heading)
  const emptyTextEdit = useEditableText('emptyText', emptyText)

  const all = data?.issues || []
  const issues = maxItems > 0 ? all.slice(0, maxItems) : all

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
      {(heading || headingEdit) && (
        <h2 {...editHandlers(headingEdit)} className={cn('text-h3 mb-6', headingEdit?.className)}>{heading}</h2>
      )}

      {loading ? (
        <div className="border border-default rounded-xl divide-y divide-default overflow-hidden bg-surface-elevated">
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-stone-200/70 mb-2" />
              <div className="h-3 w-24 rounded bg-stone-200/50" />
            </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <p {...editHandlers(emptyTextEdit)} className={cn('text-muted', emptyTextEdit?.className)}>{emptyText}</p>
      ) : (
        <div className="border border-default rounded-xl divide-y divide-default overflow-hidden bg-surface-elevated">
          {issues.map((issue, i) => {
            // With an id, the newsletter opens rendered on this site; the
            // external web version is only a fallback for older cache entries.
            const internal = issue.id != null
            return (
              <a
                key={i}
                href={internal ? `/nyhetsbrev/${issue.id}` : issue.url}
                {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                onClick={editCtx ? (e: React.MouseEvent) => e.preventDefault() : undefined}
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate group-hover:text-accent transition-colors">{issue.subject}</div>
                  {issue.date && <div className="text-body-sm text-muted mt-0.5">{formatSwedishDate(issue.date)}</div>}
                </div>
                {internal
                  ? <ChevronRight className="h-4 w-4 shrink-0 text-faint group-hover:text-accent transition-colors" />
                  : <ExternalLink className="h-4 w-4 shrink-0 text-faint group-hover:text-accent transition-colors" />}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

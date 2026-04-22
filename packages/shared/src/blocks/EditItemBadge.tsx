import { Pencil } from 'lucide-react'
import { useInlineEditBlock } from '../context'

interface EditItemBadgeProps {
  /** CMS route type: pages, posts, courses, products */
  cmsRoute: string
  /** Entity ID to link to */
  entityId: string
  /** Fallback slug for lookup when ID is missing */
  slug?: string
  /** Label shown on badge */
  label?: string
}

/**
 * Constructs the admin CMS URL for editing an entity.
 * On the admin site (port 3001 or admin domain), uses relative URL.
 * On the public site, constructs the admin URL.
 */
function getAdminEditUrl(cmsRoute: string, entityId: string): string {
  const loc = typeof window !== 'undefined' ? window.location : null
  if (!loc) return `/${cmsRoute}/${entityId}`

  // If we're already on the admin site, use relative URL
  const isAdmin = loc.port === '3001' || loc.hostname.includes('admin')
  if (isAdmin) return `/${cmsRoute}/${entityId}`

  // On the public site, construct admin URL
  // Dev: localhost:3000 → localhost:3001
  // Prod: livskompass-web.pages.dev → livskompass-admin.pages.dev
  const adminOrigin = loc.port === '3000'
    ? `${loc.protocol}//${loc.hostname}:3001`
    : loc.origin.replace('-web.', '-admin.')
  return `${adminOrigin}/${cmsRoute}/${entityId}`
}

/**
 * Small "Edit" badge on data-bound items (cards, list items).
 * Clicking opens the item's CMS editor in a new tab.
 * Only renders inside the admin/inline edit context.
 */
export function EditItemBadge({ cmsRoute, entityId, slug, label = 'Edit' }: EditItemBadgeProps) {
  // Prefer slug so admin URLs match public URLs (e.g. /courses/norge, not
  // /courses/course-norge-online-2026). Admin API accepts either.
  const linkId = slug || entityId || ''
  if (!linkId) return null
  const editCtx = useInlineEditBlock()
  // Only show on admin sites — never on public site for regular visitors
  const isAdminSite = typeof window !== 'undefined' && (window.location.port === '3001' || window.location.hostname.includes('admin'))
  if (!isAdminSite && !editCtx?.isAdmin) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(getAdminEditUrl(cmsRoute, linkId), '_blank')
  }

  return (
    <button
      onClick={handleClick}
      data-edit-badge=""
      className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium shadow-sm cursor-pointer"
      style={{
        background: 'var(--editor-blue, #2563EB)',
        color: '#fff',
      }}
      title={`${label} in CMS`}
    >
      <Pencil className="h-3 w-3" />
      {label}
    </button>
  )
}

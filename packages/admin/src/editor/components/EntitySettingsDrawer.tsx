import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Settings, Home } from 'lucide-react'
import { useEditor } from '../context'
import type { ContentType } from '../types'
import { MediaPickerField } from '../../components/MediaPickerField'

// ── Field definitions per content type ──

type FieldBadge = 'Card' | 'SEO'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'image'
  options?: { label: string; value: string }[]
  /** Pills shown next to the label. "Card" = visible on listing cards, "SEO" = used by search engines.
   *  Use an array when a field plays multiple roles (e.g. page meta_description is shown on PageCards
   *  AND in Google results). */
  badge?: FieldBadge | FieldBadge[]
  /** One-line help text shown under the input. Use it to explain non-obvious card/listing behavior. */
  hint?: string
}

const PAGE_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'URL slug', type: 'text' },
  { key: 'meta_description', label: 'Meta description', type: 'textarea', badge: ['Card', 'SEO'], hint: 'Shown on PageCards listings and in Google search results. Aim for 120–155 characters.' },
  { key: 'parent_slug', label: 'Section', type: 'text', hint: 'Slug of another page. Used for breadcrumbs and PageCards listings — does not change the URL.' },
  { key: 'sort_order', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first in PageCards listings of sibling pages.' },
]

const POST_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'URL slug', type: 'text' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', badge: 'Card', hint: 'HTML stripped, clamped to 3 lines.' },
  { key: 'featured_image', label: 'Featured image', type: 'image', badge: 'Card', hint: 'Square or 16:9 works best.' },
  { key: 'published_at', label: 'Published date', type: 'date', badge: 'Card', hint: 'Posts are sorted newest first.' },
]

const COURSE_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'URL slug', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Full', value: 'full' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ], hint: '"Full" shows a "Fullbokat" badge on cards and disables booking.' },
  { key: 'description', label: 'Short description', type: 'textarea', badge: 'Card', hint: 'Plain text only — HTML is stripped, clamped to 2 lines (~140 chars).' },
  { key: 'location', label: 'Location', type: 'text', badge: 'Card', hint: 'Shown with a pin icon.' },
  { key: 'start_date', label: 'Start date', type: 'date', badge: 'Card', hint: 'Shown with a calendar icon. Dated courses list before undated ones.' },
  { key: 'end_date', label: 'End date', type: 'date', badge: 'Card', hint: 'If set, the card date shows a range ("16 mar – 27 apr").' },
  { key: 'registration_deadline', label: 'Registration deadline', type: 'date', hint: 'Shown in the CourseInfo block on the detail page, not on cards.' },
  { key: 'price_sek', label: 'Price (SEK)', type: 'number', badge: 'Card', hint: 'Shown as "X kr". Leave blank to hide price.' },
  { key: 'max_participants', label: 'Max participants', type: 'number', badge: 'Card', hint: 'When set, cards show "N platser kvar". Leave blank to hide the badge.' },
]

const PRODUCT_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'URL slug', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ]},
  { key: 'description', label: 'Short description', type: 'textarea', badge: 'Card', hint: 'Also shown on the detail page header. Plain text recommended.' },
  { key: 'type', label: 'Type', type: 'select', options: [
    { label: 'Book', value: 'book' },
    { label: 'CD', value: 'cd' },
    { label: 'Cards', value: 'cards' },
    { label: 'App', value: 'app' },
    { label: 'Download', value: 'download' },
  ], hint: 'Used by ProductList "Filter by type". Not visible on cards.' },
  { key: 'price_sek', label: 'Price (SEK)', type: 'number', badge: 'Card', hint: 'Leave blank for "Gratis" label.' },
  { key: 'external_url', label: 'External URL', type: 'text', badge: 'Card', hint: 'Where the "Köp" button on the card sends visitors (typically a retailer page).' },
  { key: 'image_url', label: 'Product image', type: 'image', badge: 'Card', hint: 'Shown when "Show image" is enabled in ProductList.' },
  { key: 'in_stock', label: 'In stock', type: 'select', options: [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '0' },
  ], badge: 'Card', hint: 'When "No", cards show "Slut i lager" and the buy button is disabled.' },
]

const FIELDS_BY_TYPE: Record<ContentType, FieldDef[]> = {
  page: PAGE_FIELDS,
  post: POST_FIELDS,
  course: COURSE_FIELDS,
  product: PRODUCT_FIELDS,
}

// ── Trigger button for EditorTopBar ──

export function EntitySettingsButton({ onClick, contentType }: { onClick: () => void; contentType?: string }) {
  const label = contentType === 'course' ? 'Course details'
    : contentType === 'product' ? 'Product details'
    : contentType === 'post' ? 'Post details'
    : 'Page settings'
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
      style={{ color: 'var(--editor-text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--editor-text-primary)'; e.currentTarget.style.background = 'var(--editor-neutral-100)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-muted)'; e.currentTarget.style.background = 'transparent' }}
      aria-label={label}
      title={label}
    >
      <Settings className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// ── Homepage toggle ──

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function HomepageToggle({ slug }: { slug: string }) {
  const [homepageSlug, setHomepageSlug] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { setHomepageSlug('home-2'); return }
    fetch(`${API_BASE}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!data) { setHomepageSlug('home-2'); return }
        const settings = data.settings || []
        const hp = settings.find((s: any) => s.key === 'homepage_slug')
        setHomepageSlug(hp?.value || 'home-2')
      })
      .catch(() => setHomepageSlug('home-2'))
  }, [])

  const isHomepage = homepageSlug === slug

  const handleToggle = async () => {
    if (isHomepage || saving) return
    setSaving(true)
    const token = localStorage.getItem('admin_token')
    try {
      await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ homepage_slug: slug }),
      })
      setHomepageSlug(slug)
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (homepageSlug === null) return null

  return (
    <button
      onClick={handleToggle}
      disabled={isHomepage || saving}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
        isHomepage
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
      }`}
    >
      <Home className="h-4 w-4" />
      {isHomepage ? 'This is the homepage' : saving ? 'Setting...' : 'Set as homepage'}
    </button>
  )
}

// ── Drawer component ──

interface EntitySettingsDrawerProps {
  open: boolean
  onClose: () => void
  contentType: ContentType
}

export function EntitySettingsDrawer({ open, onClose, contentType }: EntitySettingsDrawerProps) {
  const { state, updateEntityMeta } = useEditor()
  const drawerRef = useRef<HTMLDivElement>(null)
  const entity = state.entity as Record<string, any> | null
  const fields = FIELDS_BY_TYPE[contentType]

  const updateField = useCallback((key: string, value: any) => {
    if (!entity) return
    updateEntityMeta({ [key]: value } as any)
  }, [entity, updateEntityMeta])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler) }
  }, [open, onClose])

  if (!open || !entity) return null

  const portalRoot = document.getElementById('editor-portals') || document.body

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 'var(--z-editor-popover, 1005)' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--editor-overlay, rgba(0,0,0,0.15))' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-[380px] max-w-[90vw] overflow-y-auto"
        style={{
          background: 'var(--editor-surface, #fff)',
          borderLeft: '1px solid var(--editor-border)',
          boxShadow: 'var(--editor-shadow-drawer, -4px 0 24px rgba(0,0,0,0.08))',
          animation: 'editor-slide-in-right 200ms ease forwards',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 border-b"
          style={{
            background: 'var(--editor-surface, #fff)',
            borderColor: 'var(--editor-border)',
          }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--editor-text-primary)' }}>
            Content Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'var(--editor-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--editor-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-muted)' }}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title field (all types) */}
        <div className="px-5 pt-4 pb-2">
          <FieldLabel label="Title" />
          <input
            type="text"
            className={INPUT_CLASS}
            value={entity.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        {/* Status badge (pages/posts only — courses/products have status in their fields) */}
        {(contentType === 'page' || contentType === 'post') && (
          <div className="px-5 pb-2">
            <FieldLabel label="Status" />
            <StatusBadge status={entity.status || 'draft'} />
          </div>
        )}

        {/* Homepage toggle (pages only) */}
        {contentType === 'page' && (
          <div className="px-5 pb-4">
            <HomepageToggle slug={entity.slug} />
          </div>
        )}

        <div className="border-t" style={{ borderColor: 'var(--editor-border)' }} />

        {/* Content-type-specific fields */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {fields.map((field) => (
            <EntityField
              key={field.key}
              field={field}
              value={entity[field.key]}
              onChange={(v) => updateField(field.key, v)}
              contentType={contentType}
            />
          ))}
        </div>
      </div>
    </div>,
    portalRoot,
  )
}

// ── Field components ──

const INPUT_CLASS =
  'w-full text-sm px-2.5 py-1.5 rounded-md border bg-white outline-none focus:ring-1 transition-colors'
    + ' border-zinc-200 text-zinc-800 focus:border-blue-400 focus:ring-blue-400/30 placeholder:text-zinc-300'

const BADGE_STYLE: Record<FieldBadge, { bg: string; text: string; title: string }> = {
  Card: { bg: '#dbeafe', text: '#1e40af', title: 'Visible on listing cards (CourseList, ProductList, PostGrid).' },
  SEO: { bg: '#fef3c7', text: '#92400e', title: 'Used by search engines.' },
}

function FieldLabel({ label, badge }: { label: string; badge?: FieldBadge | FieldBadge[] }) {
  const badges = badge ? (Array.isArray(badge) ? badge : [badge]) : []
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="block text-[11px] font-medium text-zinc-500">{label}</label>
      {badges.map((b) => (
        <span
          key={b}
          className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wide leading-none"
          style={{ background: BADGE_STYLE[b].bg, color: BADGE_STYLE[b].text }}
          title={BADGE_STYLE[b].title}
        >
          {b}
        </span>
      ))}
    </div>
  )
}

function FieldHint({ hint }: { hint?: string }) {
  if (!hint) return null
  return (
    <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--editor-text-subtle, #71717a)' }}>
      {hint}
    </p>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'var(--editor-status-draft-bg, #fef3c7)', text: 'var(--editor-status-draft-text, #92400e)' },
    published: { bg: 'var(--editor-status-published-bg, #d1fae5)', text: 'var(--editor-status-published-text, #065f46)' },
    active: { bg: 'var(--editor-status-published-bg, #d1fae5)', text: 'var(--editor-status-published-text, #065f46)' },
    full: { bg: 'var(--editor-status-info-bg, #dbeafe)', text: 'var(--editor-status-info-text, #1e40af)' },
    completed: { bg: 'var(--editor-status-neutral-bg, #e5e7eb)', text: 'var(--editor-status-neutral-text, #374151)' },
    cancelled: { bg: 'var(--editor-status-error-bg, #fee2e2)', text: 'var(--editor-status-error-text, #991b1b)' },
    inactive: { bg: 'var(--editor-status-neutral-bg, #e5e7eb)', text: 'var(--editor-status-neutral-text, #374151)' },
  }
  const colors = colorMap[status] || colorMap.draft
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  )
}

// URL prefix per content type — must mirror the API-side URL_PREFIX in admin.ts
// and the web routes in packages/web/src/App.tsx. Products have no detail page
// today, so no live preview link is shown.
const URL_PREFIX_BY_TYPE: Record<ContentType, string> = {
  page: '',
  post: '/nyhet',
  course: '/utbildningar',
  product: '/material',
}

const WEB_URL = (import.meta.env.VITE_WEB_URL || window.location.origin).replace(/\/$/, '')

function SlugField({ field, value, onChange, contentType }: { field: FieldDef; value: any; onChange: (v: any) => void; contentType: ContentType }) {
  const slug = (value || '').toString()
  const prefix = URL_PREFIX_BY_TYPE[contentType]
  const fullUrl = slug ? `${WEB_URL}${prefix}/${slug}` : ''

  return (
    <div>
      <FieldLabel label={field.label} badge={field.badge} />
      <input
        type="text"
        className={INPUT_CLASS}
        value={slug}
        onChange={(e) => onChange(e.target.value)}
      />
      {fullUrl && (
        <div className="mt-1.5 text-[11px] font-mono truncate" style={{ color: 'var(--editor-text-subtle, #71717a)' }} title={fullUrl}>
          {fullUrl}
        </div>
      )}
      <p className="mt-1 text-[11px]" style={{ color: 'var(--editor-text-subtle, #71717a)' }}>
        Changing the slug rewrites existing links on other pages automatically.
      </p>
    </div>
  )
}

function EntityField({ field, value, onChange, contentType }: { field: FieldDef; value: any; onChange: (v: any) => void; contentType: ContentType }) {
  if (field.key === 'slug') {
    return <SlugField field={field} value={value} onChange={onChange} contentType={contentType} />
  }
  switch (field.type) {
    case 'text':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <input type="text" className={INPUT_CLASS} value={value || ''} onChange={(e) => onChange(e.target.value)} />
          <FieldHint hint={field.hint} />
        </div>
      )
    case 'textarea':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <textarea className={INPUT_CLASS + ' resize-y min-h-[60px]'} rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} />
          <FieldHint hint={field.hint} />
        </div>
      )
    case 'number':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <input type="number" className={INPUT_CLASS + ' w-32'} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} />
          <FieldHint hint={field.hint} />
        </div>
      )
    case 'date':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <input type="date" className={INPUT_CLASS + ' w-44'} value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value || null)} />
          <FieldHint hint={field.hint} />
        </div>
      )
    case 'select':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <select className={INPUT_CLASS + ' appearance-none cursor-pointer'} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <FieldHint hint={field.hint} />
        </div>
      )
    case 'image':
      return (
        <div>
          <FieldLabel label={field.label} badge={field.badge} />
          <MediaPickerField value={value || ''} onChange={onChange} />
          <FieldHint hint={field.hint} />
        </div>
      )
    default:
      return null
  }
}

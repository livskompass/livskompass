import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Settings } from 'lucide-react'
import { useEditor } from '../context'
import type { ContentType } from '../types'
import { MediaPickerField } from '../../components/MediaPickerField'

// ── Field definitions per content type ──

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'image'
  options?: { label: string; value: string }[]
}

const PAGE_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'meta_description', label: 'Meta description', type: 'textarea' },
  { key: 'parent_slug', label: 'Parent slug', type: 'text' },
  { key: 'sort_order', label: 'Sort order', type: 'number' },
]

const POST_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
  { key: 'featured_image', label: 'Featured image', type: 'image' },
  { key: 'published_at', label: 'Published date', type: 'date' },
]

const COURSE_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Short description', type: 'textarea' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'start_date', label: 'Start date', type: 'date' },
  { key: 'end_date', label: 'End date', type: 'date' },
  { key: 'registration_deadline', label: 'Registration deadline', type: 'date' },
  { key: 'price_sek', label: 'Price (SEK)', type: 'number' },
  { key: 'max_participants', label: 'Max participants', type: 'number' },
]

const PRODUCT_FIELDS: FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Short description', type: 'textarea' },
  { key: 'type', label: 'Type', type: 'select', options: [
    { label: 'Book', value: 'book' },
    { label: 'CD', value: 'cd' },
    { label: 'Cards', value: 'cards' },
    { label: 'App', value: 'app' },
    { label: 'Download', value: 'download' },
  ]},
  { key: 'price_sek', label: 'Price (SEK)', type: 'number' },
  { key: 'external_url', label: 'External URL', type: 'text' },
  { key: 'image_url', label: 'Product image', type: 'image' },
  { key: 'in_stock', label: 'In stock', type: 'select', options: [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '0' },
  ]},
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

// ── Drawer component ──

interface EntitySettingsDrawerProps {
  open: boolean
  onClose: () => void
  contentType: ContentType
}

export function EntitySettingsDrawer({ open, onClose, contentType }: EntitySettingsDrawerProps) {
  const { state, dispatch } = useEditor()
  const drawerRef = useRef<HTMLDivElement>(null)
  const entity = state.entity as Record<string, any> | null
  const fields = FIELDS_BY_TYPE[contentType]

  const updateField = useCallback((key: string, value: any) => {
    if (!entity) return
    const updated = { ...entity, [key]: value }
    dispatch({ type: 'SET_ENTITY', entity: updated as any, contentType })
    dispatch({ type: 'MARK_DIRTY' })
  }, [entity, contentType, dispatch])

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
        style={{ background: 'rgba(0,0,0,0.15)' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-[380px] max-w-[90vw] overflow-y-auto"
        style={{
          background: 'var(--editor-surface, #fff)',
          borderLeft: '1px solid var(--editor-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
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

        {/* Status field (all types) */}
        <div className="px-5 pb-4">
          <FieldLabel label="Status" />
          <StatusBadge status={entity.status || 'draft'} />
        </div>

        <div className="border-t" style={{ borderColor: 'var(--editor-border)' }} />

        {/* Content-type-specific fields */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {fields.map((field) => (
            <EntityField
              key={field.key}
              field={field}
              value={entity[field.key]}
              onChange={(v) => updateField(field.key, v)}
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

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
      {label}
    </label>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#fef3c7', text: '#92400e' },
    published: { bg: '#d1fae5', text: '#065f46' },
    active: { bg: '#d1fae5', text: '#065f46' },
    full: { bg: '#dbeafe', text: '#1e40af' },
    completed: { bg: '#e5e7eb', text: '#374151' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
    inactive: { bg: '#e5e7eb', text: '#374151' },
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

function EntityField({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case 'text':
      return (
        <div>
          <FieldLabel label={field.label} />
          <input type="text" className={INPUT_CLASS} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case 'textarea':
      return (
        <div>
          <FieldLabel label={field.label} />
          <textarea className={INPUT_CLASS + ' resize-y min-h-[60px]'} rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case 'number':
      return (
        <div>
          <FieldLabel label={field.label} />
          <input type="number" className={INPUT_CLASS + ' w-32'} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} />
        </div>
      )
    case 'date':
      return (
        <div>
          <FieldLabel label={field.label} />
          <input type="date" className={INPUT_CLASS + ' w-44'} value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value || null)} />
        </div>
      )
    case 'select':
      return (
        <div>
          <FieldLabel label={field.label} />
          <select className={INPUT_CLASS + ' appearance-none cursor-pointer'} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )
    case 'image':
      return (
        <div>
          <FieldLabel label={field.label} />
          <MediaPickerField value={value || ''} onChange={onChange} />
        </div>
      )
    default:
      return null
  }
}

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { puckConfig } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'
import { MediaPickerField } from '../../components/MediaPickerField'

// ── Puck field type definitions ──

interface FieldOption {
  label: string
  value: string | number | boolean
}

interface BaseField {
  type: string
  label?: string
  metadata?: { isImage?: boolean; isPagePicker?: boolean }
}

interface TextField extends BaseField {
  type: 'text'
}

interface TextareaField extends BaseField {
  type: 'textarea'
}

interface SelectField extends BaseField {
  type: 'select'
  options: FieldOption[]
}

interface RadioField extends BaseField {
  type: 'radio'
  options: FieldOption[]
}

interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
}

interface ArrayField extends BaseField {
  type: 'array'
  arrayFields: Record<string, PuckField>
}

type PuckField = TextField | TextareaField | SelectField | RadioField | NumberField | ArrayField

// ── Known inline-editable fields per block (skip in settings) ──
// Fields that are editable directly on the canvas via useEditableText
const INLINE_FIELDS: Record<string, Set<string>> = {
  Hero: new Set(['heading', 'subheading', 'ctaPrimaryText', 'ctaSecondaryText', 'image', 'backgroundImage']),
  CTABanner: new Set(['heading', 'description', 'buttonText']),
  Testimonial: new Set(['quote', 'author', 'role', 'avatar']),
  PostGrid: new Set(['heading', 'subheading', 'emptyText']),
  PageCards: new Set(['heading', 'emptyText', 'emptyManualText']),
  CardGrid: new Set(['heading', 'subheading']),
  ContactForm: new Set(['heading', 'description', 'nameLabel', 'emailLabel', 'phoneLabel', 'subjectLabel', 'messageLabel', 'submitButtonText', 'contactName', 'contactTitle', 'contactEmail', 'contactPhone']),
  CourseList: new Set(['heading', 'readMoreText', 'bookButtonText', 'fullLabel', 'emptyText']),
  ProductList: new Set(['heading', 'buyButtonText', 'freeLabel', 'outOfStockLabel', 'emptyText']),
  Accordion: new Set(['heading']),
  ImageBlock: new Set(['caption', 'src']),
  VideoEmbed: new Set(['caption', 'url']),
  AudioEmbed: new Set(['caption', 'url']),
  FileEmbed: new Set(['caption', 'url', 'fileName']),
  EmbedBlock: new Set(['caption', 'url', 'html']),
  FeatureGrid: new Set(['heading', 'subheading']),
  PageHeader: new Set(['heading', 'subheading', 'breadcrumbHomeText']),
  PersonCard: new Set(['name', 'title', 'bio', 'email', 'phone', 'image']),
  BookingCTA: new Set(['heading', 'description', 'buttonText']),
  BookingForm: new Set(['nameLabel', 'emailLabel', 'phoneLabel', 'organizationLabel', 'participantsLabel', 'notesLabel', 'submitButtonText', 'totalLabel']),
  CourseInfo: new Set(['locationLabel', 'dateLabel', 'priceLabel', 'spotsLabel', 'deadlineLabel']),
  PricingTable: new Set(['heading']),
  PostHeader: new Set(['backLinkText']),
}

/** Check if a block type has any settings fields (not inline) */
export function hasSettingsFields(blockType: string): boolean {
  const comp = (puckConfig as any).components?.[blockType]
  const rawFields = comp?.fields
  const fieldConfig = (rawFields && typeof rawFields === 'object' && !Array.isArray(rawFields)) ? rawFields : {}
  const inlineSet = INLINE_FIELDS[blockType] || new Set()
  const settingsFields = Object.entries(fieldConfig).filter(
    ([key]) => !inlineSet.has(key),
  )
  return settingsFields.length > 0
}

// ── Main component ──

interface SettingsPopoverProps {
  blockId: string
  blockType: string
  blockIndex: number
  anchorRect: DOMRect | null
  onClose: () => void
}

// Access components with 'any' to bypass Puck's Config type which may strip fields
const components = (puckConfig as any).components as Record<
  string,
  { fields?: Record<string, PuckField>; label?: string; resolveFields?: any }
>

export function SettingsPopover({
  blockType,
  blockIndex,
  anchorRect,
  onClose,
}: SettingsPopoverProps) {
  const { state, updateData } = useEditor()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set())

  const puckData = state.puckData
  const block = puckData?.content?.[blockIndex]
  const blockProps = block?.props || {}
  // Access fields from the raw puck config (bypass TypeScript Config type which may strip fields)
  const comp = (puckConfig as any).components?.[blockType]
  const rawFields = comp?.fields
  const fieldConfig: Record<string, PuckField> = (rawFields && typeof rawFields === 'object' && !Array.isArray(rawFields)) ? rawFields : {}

  // Filter out inline-editable text/image fields — keep ALL layout/structural fields
  const inlineSet = INLINE_FIELDS[blockType] || new Set()
  const settingsFields = Object.entries(fieldConfig).filter(
    ([key]) => !inlineSet.has(key),
  )

  // Update a single prop
  const updateProp = useCallback(
    (propName: string, value: any) => {
      if (!puckData) return
      if (blockIndex < 0 || blockIndex >= puckData.content.length) return
      const content = [...puckData.content]
      const b = content[blockIndex]
      if (!b) return
      content[blockIndex] = { ...b, props: { ...b.props, [propName]: value } }
      updateData({ ...puckData, content } as Data)
    },
    [puckData, blockIndex, updateData],
  )

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid closing from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  if (!anchorRect) return null

  // Position: below the toolbar, centered on anchor
  const popoverWidth = 400
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  left = Math.max(8, Math.min(left, viewportW - popoverWidth - 8))

  let top = anchorRect.bottom + 8
  // If it would go off-screen bottom, position above and recalculate maxHeight
  let maxHeight = Math.min(600, viewportH - top - 16)
  const flippedAbove = maxHeight < 200
  if (flippedAbove) {
    // When flipped above, maxHeight is the space above the anchor
    maxHeight = Math.min(600, anchorRect.top - 16)
    top = anchorRect.top - 8
  }

  const toggleArray = (key: string) => {
    setExpandedArrays((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const portalRoot = document.getElementById('editor-portals') || document.body

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed"
      style={{
        left,
        top,
        width: popoverWidth,
        maxHeight,
        zIndex: 'var(--z-editor-popover, 1005)',
        animation: flippedAbove
          ? 'editor-slide-up 150ms var(--editor-ease, ease) forwards'
          : 'editor-slide-down 150ms var(--editor-ease, ease) forwards',
      }}
    >
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        role="dialog"
        aria-label={`${components[blockType]?.label || blockType} settings`}
        style={{
          background: 'var(--editor-surface-glass-heavy)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--editor-border-strong)',
          boxShadow: 'var(--editor-shadow-lg)',
          maxHeight: maxHeight - 2,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {components[blockType]?.label || blockType} Settings
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fields */}
        <div className="overflow-y-auto p-3 flex flex-col gap-3" style={{ maxHeight: maxHeight - 44 }}>
          {settingsFields.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-4">All fields are editable directly on the canvas</p>
          )}
          {settingsFields.map(([key, field]) => (
            <FieldRenderer
              key={key}
              fieldKey={key}
              field={field}
              value={blockProps[key]}
              onChange={(val) => updateProp(key, val)}
              expanded={expandedArrays.has(key)}
              onToggle={() => toggleArray(key)}
            />
          ))}
        </div>
      </div>
    </div>,
    portalRoot,
  )
}

// ── Field renderers ──

interface FieldRendererProps {
  fieldKey: string
  field: PuckField
  value: any
  onChange: (value: any) => void
  expanded?: boolean
  onToggle?: () => void
}

function FieldRenderer({ fieldKey, field, value, onChange, expanded, onToggle }: FieldRendererProps) {
  switch (field.type) {
    case 'text':
      return field.metadata?.isImage ? (
        <ImageField label={field.label || fieldKey} value={value || ''} onChange={onChange} />
      ) : field.metadata?.isPagePicker ? (
        <PagePicker label={field.label || fieldKey} value={value || ''} onChange={onChange} />
      ) : (
        <TextInput label={field.label || fieldKey} value={value || ''} onChange={onChange} />
      )
    case 'textarea':
      return <TextareaInput label={field.label || fieldKey} value={value || ''} onChange={onChange} />
    case 'select':
      return (
        <SelectInput
          label={field.label || fieldKey}
          value={value ?? ''}
          options={(field as SelectField).options}
          onChange={onChange}
        />
      )
    case 'radio':
      return (
        <RadioInput
          label={field.label || fieldKey}
          value={value}
          options={(field as RadioField).options}
          onChange={onChange}
        />
      )
    case 'number':
      return <NumberInput label={field.label || fieldKey} value={value ?? 0} onChange={onChange} />
    case 'array':
      return (
        <ArrayInput
          label={field.label || fieldKey}
          value={value || []}
          arrayFields={(field as ArrayField).arrayFields}
          onChange={onChange}
          expanded={expanded || false}
          onToggle={onToggle || (() => {})}
        />
      )
    default:
      return null
  }
}

// ── Atomic field components ──

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
      {label}
    </label>
  )
}

const INPUT_CLASS =
  'w-full text-sm px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-zinc-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors placeholder:text-zinc-300'

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel label={label} />
      <input
        type="text"
        className={INPUT_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function TextareaInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel label={label} />
      <textarea
        className={INPUT_CLASS + ' resize-y min-h-[60px]'}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: any
  options: FieldOption[]
  onChange: (v: any) => void
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <select
        className={INPUT_CLASS + ' appearance-none cursor-pointer'}
        value={String(value)}
        onChange={(e) => {
          // Try to preserve original type (number)
          const opt = options.find((o) => String(o.value) === e.target.value)
          onChange(opt ? opt.value : e.target.value)
        }}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function RadioInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: any
  options: FieldOption[]
  onChange: (v: any) => void
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isActive = value === opt.value || String(value) === String(opt.value)
          return (
            <button
              key={String(opt.value)}
              className="px-2.5 py-1 text-xs rounded-md border transition-colors"
              style={{
                borderColor: isActive ? 'var(--editor-blue)' : 'var(--editor-border-input)',
                background: isActive ? 'var(--editor-blue-lightest)' : 'var(--editor-surface)',
                color: isActive ? 'var(--editor-blue)' : 'var(--editor-text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <FieldLabel label={label} />
      <input
        type="number"
        className={INPUT_CLASS + ' w-24'}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel label={label} />
      <MediaPickerField value={value} onChange={onChange} />
    </div>
  )
}

/** Page picker — fetches pages from API and shows a searchable select */
function PagePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const apiBase = (typeof window !== 'undefined' && (window as any).__PUCK_API_BASE__) || '/api'
    fetch(`${apiBase}/pages`)
      .then((r) => r.json())
      .then((data: any) => {
        const list = (data.pages || []).map((p: any) => ({ slug: p.slug, title: p.title }))
        setPages(list)
      })
      .catch(() => {})
  }, [])

  const filtered = search
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase()))
    : pages

  return (
    <div>
      <FieldLabel label={label} />
      {value && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm text-zinc-700 flex-1 truncate">{pages.find((p) => p.slug === value)?.title || value}</span>
          <button
            onClick={() => onChange('')}
            className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
      <input
        type="text"
        placeholder="Search pages..."
        className={INPUT_CLASS}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {(search || !value) && filtered.length > 0 && (
        <div className="mt-1 max-h-[200px] overflow-y-auto rounded-md border border-zinc-200 bg-white">
          {filtered.slice(0, 20).map((p) => (
            <button
              key={p.slug}
              onClick={() => { onChange(p.slug); setSearch('') }}
              className={`w-full text-left px-2.5 py-1.5 text-sm hover:bg-blue-50 transition-colors ${p.slug === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-zinc-700'}`}
            >
              {p.title}
              <span className="text-[10px] text-zinc-400 ml-1.5">/{p.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Array field ──

function ArrayInput({
  label,
  value,
  arrayFields,
  onChange,
  expanded,
  onToggle,
}: {
  label: string
  value: any[]
  arrayFields: Record<string, PuckField>
  onChange: (v: any[]) => void
  expanded: boolean
  onToggle: () => void
}) {
  const addItem = () => {
    const newItem: Record<string, any> = {}
    for (const [k, f] of Object.entries(arrayFields)) {
      if (f.type === 'number') newItem[k] = 0
      else if (f.type === 'select' || f.type === 'radio') {
        const opts = (f as SelectField | RadioField).options
        newItem[k] = opts?.[0]?.value ?? ''
      } else newItem[k] = ''
    }
    onChange([...value, newItem])
  }

  const removeItem = (index: number) => {
    if (index < 0 || index >= value.length) return
    onChange(value.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, key: string, val: any) => {
    if (index < 0 || index >= value.length) return
    const updated = [...value]
    updated[index] = { ...updated[index], [key]: val }
    onChange(updated)
  }

  return (
    <div>
      <button
        className="flex items-center gap-1.5 w-full text-left"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-zinc-400" />
        )}
        <span className="text-[11px] font-medium text-zinc-500">
          {label}
        </span>
        <span className="text-[10px] text-zinc-300 ml-auto">
          {value.length} item{value.length !== 1 ? 's' : ''}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-md border border-zinc-100 bg-zinc-50/50 p-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-zinc-400">
                  #{index + 1}
                </span>
                <button
                  onClick={() => removeItem(index)}
                  className="p-0.5 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(arrayFields).map(([fieldKey, fieldDef]) => (
                  <FieldRenderer
                    key={fieldKey}
                    fieldKey={fieldKey}
                    field={fieldDef}
                    value={item[fieldKey]}
                    onChange={(val) => updateItem(index, fieldKey, val)}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-1 justify-center text-xs text-zinc-400 hover:text-blue-500 py-1.5 rounded-md border border-dashed border-zinc-200 hover:border-blue-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add {label.toLowerCase().replace(/s$/, '')}
          </button>
        </div>
      )}
    </div>
  )
}

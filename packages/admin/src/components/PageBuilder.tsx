import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, createEditorOverrides, defaultPageTemplate } from '@livskompass/shared'
import { getFilteredPuckConfig } from '../lib/puck-filter'
import { MediaPickerField } from './MediaPickerField'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { Settings, Trash2, ExternalLink, Loader2, Check, AlertTriangle, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn, generateSlug } from '../lib/utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface PageBuilderProps {
  page: {
    id?: string
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content?: string
    content_blocks?: string | null
  } | null
  isNew: boolean
  hasDraft?: boolean
  onAutoSave: (data: {
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content_blocks: string
    editor_version: string
  }) => void
  onStatusChange: (data: {
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content_blocks: string
    editor_version: string
  }) => void
  onCreate: (data: {
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content_blocks: string
    editor_version: string
  }) => void
  onDelete?: () => void
  saveStatus?: SaveStatus
  saveError?: string
  onRetry?: () => void
}

export default function PageBuilder({ page, isNew, hasDraft = false, onAutoSave, onStatusChange, onCreate, onDelete, saveStatus = 'idle', saveError, onRetry }: PageBuilderProps) {
  const navigateToInline = useNavigate()
  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || '')
  const [parentSlug, setParentSlug] = useState(page?.parent_slug || '')
  const [sortOrder, setSortOrder] = useState(page?.sort_order || 0)
  const [status, setStatus] = useState(page?.status || 'draft')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false)
  const canTrackDirtyRef = useRef(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ top: 0, right: 0 })

  // Refs for auto-save (avoids stale closures in debounced callback)
  const puckDataRef = useRef<Data | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const stateRef = useRef({ title, slug, metaDescription, parentSlug, sortOrder, status })
  stateRef.current = { title, slug, metaDescription, parentSlug, sortOrder, status }
  const cbRef = useRef({ onAutoSave, onStatusChange, onCreate })
  cbRef.current = { onAutoSave, onStatusChange, onCreate }

  // Sync from props when data loads
  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setSlug(page.slug)
      setMetaDescription(page.meta_description || '')
      setParentSlug(page.parent_slug || '')
      setSortOrder(page.sort_order || 0)
      setStatus(page.status)
      // Only SET from server draft, never clear — clearing happens on explicit publish/unpublish
      if (hasDraft && page.status === 'published') {
        setHasUnpublishedChanges(true)
      }
    }
  }, [page, hasDraft])

  // Enable dirty tracking after initial render settles
  useEffect(() => {
    const timer = setTimeout(() => { canTrackDirtyRef.current = true }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Warn before closing during active save or new items with content
  useEffect(() => {
    const shouldWarn = saveStatus === 'saving' || (isNew && title.trim().length > 0)
    if (!shouldWarn) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [saveStatus, isNew, title])

  // Click outside to close settings
  useEffect(() => {
    if (!settingsOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => clearTimeout(autoSaveTimerRef.current)
  }, [])

  const editorOverrides = useMemo(() => createEditorOverrides(), [])

  const initialData = useMemo<Data>(() => {
    if (page?.content_blocks) {
      try {
        return JSON.parse(page.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    if (page?.title) {
      try {
        const safeTitle = page.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        const legacyContent = page.content || ''
        const safeContent = legacyContent.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
        const template = defaultPageTemplate
          .replace('__PAGE_TITLE__', safeTitle)
          .replace('__LEGACY_CONTENT__', safeContent || '<p></p>')
        return JSON.parse(template) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [page?.content_blocks, page?.title, page?.content])

  // Debounced auto-save (2s after last change)
  const triggerAutoSave = useCallback(() => {
    if (isNew) return
    clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      const s = stateRef.current
      if (!s.title) return
      cbRef.current.onAutoSave({
        title: s.title,
        slug: s.slug,
        meta_description: s.metaDescription,
        parent_slug: s.parentSlug,
        sort_order: s.sortOrder,
        status: s.status,
        content_blocks: JSON.stringify(puckDataRef.current || initialData),
        editor_version: 'puck',
      })
    }, 2000)
  }, [isNew, initialData])

  const handlePuckChange = useCallback((data: Data) => {
    puckDataRef.current = data
    if (!canTrackDirtyRef.current) return
    if (status === 'published') setHasUnpublishedChanges(true)
    triggerAutoSave()
  }, [status, triggerAutoSave])

  // Settings change helper
  const onSettingsChange = useCallback(() => {
    if (status === 'published') setHasUnpublishedChanges(true)
    triggerAutoSave()
  }, [status, triggerAutoSave])

  const assemblePayload = useCallback(() => {
    const s = stateRef.current
    return {
      title: s.title,
      slug: s.slug,
      meta_description: s.metaDescription,
      parent_slug: s.parentSlug,
      sort_order: s.sortOrder,
      status: s.status,
      content_blocks: JSON.stringify(puckDataRef.current || initialData),
      editor_version: 'puck',
    }
  }, [initialData])

  // CTA: Create / Publish / Unpublish
  const handleCTA = useCallback(() => {
    clearTimeout(autoSaveTimerRef.current)
    const payload = assemblePayload()
    if (isNew) {
      cbRef.current.onCreate(payload)
    } else if (status === 'published') {
      cbRef.current.onStatusChange({ ...payload, status: 'draft' })
    } else {
      cbRef.current.onStatusChange({ ...payload, status: 'published' })
    }
    setHasUnpublishedChanges(false)
  }, [isNew, status, assemblePayload])

  const handlePublishChanges = useCallback(() => {
    clearTimeout(autoSaveTimerRef.current)
    const payload = assemblePayload()
    cbRef.current.onStatusChange({ ...payload, status: stateRef.current.status })
    setHasUnpublishedChanges(false)
  }, [assemblePayload])

  return (
    <div className="h-[100dvh]">
      <Puck
        config={getFilteredPuckConfig('page')}
        data={initialData}
        onChange={handlePuckChange}
        headerTitle={title || 'New page'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          ...editorOverrides,
          fieldTypes: {
            text: ({ field, value, onChange, children }: any) => {
              if (field?.metadata?.isImage) {
                return <MediaPickerField value={value || ''} onChange={onChange} label={field.label} />
              }
              return children
            },
          },
          headerActions: () => (
            <div className="flex items-center gap-1">
              {/* Auto-save feedback */}
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 px-2 py-0.5 animate-fade-in">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded animate-fade-in">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-600 px-2 py-0.5 bg-red-50 rounded animate-fade-in"
                  title={saveError}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Failed
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="text-[11px] font-semibold text-red-700 hover:text-red-900 underline underline-offset-2 decoration-red-300 hover:decoration-red-500 ml-0.5 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </span>
              )}

              {/* Status badge — one or the other */}
              {hasUnpublishedChanges && !isNew ? (
                <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600 animate-fade-in">
                  Unpublished changes
                </span>
              ) : (
                <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                  status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
              )}

              {/* CTA buttons */}
              {hasUnpublishedChanges && !isNew ? (
                <>
                  <button
                    onClick={handleCTA}
                    disabled={saveStatus === 'saving'}
                    className="h-8 px-3 text-[13px] font-medium rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={handlePublishChanges}
                    disabled={saveStatus === 'saving' || !title.trim()}
                    className="h-8 px-3 text-[13px] font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publish changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCTA}
                  disabled={saveStatus === 'saving' || !title.trim()}
                  className={cn(
                    "h-8 px-3 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    isNew
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : status === 'published'
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {isNew ? 'Create' : status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              )}

              <span className="w-px h-3.5 bg-zinc-200" />

              {/* Inline editor mode */}
              {page?.id && !isNew && (
                <button
                  onClick={() => navigateToInline(`/inline/sidor/${page.id}`)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Inline editor"
                >
                  <PenLine className="h-3.5 w-3.5" />
                </button>
              )}

              {/* View on site */}
              {page?.id && slug && (
                <a
                  href={`${window.location.origin.replace(':3001', ':3000').replace('admin', 'web')}/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="View on site"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {/* Settings dropdown */}
              <div ref={settingsRef} className="relative z-50">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (!settingsOpen && buttonRef.current) {
                      const rect = buttonRef.current.getBoundingClientRect()
                      const spaceBelow = window.innerHeight - rect.bottom - 16
                      const dropdownMaxH = 500
                      if (spaceBelow < dropdownMaxH) {
                        setDropdownStyle({ bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right })
                      } else {
                        setDropdownStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                      }
                    }
                    setSettingsOpen(!settingsOpen)
                  }}
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-md transition-all duration-100",
                    settingsOpen
                      ? "bg-zinc-100 text-zinc-700"
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                  )}
                  title="Page settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-[200] max-h-[80vh] overflow-y-auto animate-scale-in origin-top-right" style={dropdownStyle}>
                    <div className="p-5 space-y-5">
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Page settings</h3>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!page?.id) setSlug(generateSlug(e.target.value))
                              onSettingsChange()
                            }}
                            className="h-9 text-sm"
                            placeholder="Page title"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); onSettingsChange() }}
                            className="h-9 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Meta description</Label>
                          <Textarea
                            value={metaDescription}
                            onChange={(e) => { setMetaDescription(e.target.value); onSettingsChange() }}
                            className="min-h-0 resize-none"
                            rows={2}
                            placeholder="SEO description..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Parent slug</Label>
                            <Input
                              value={parentSlug}
                              onChange={(e) => { setParentSlug(e.target.value); onSettingsChange() }}
                              className="h-9 text-sm"
                              placeholder="parent-slug"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Sort order</Label>
                            <Input
                              type="number"
                              value={sortOrder}
                              onChange={(e) => { setSortOrder(Number(e.target.value)); onSettingsChange() }}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {onDelete && (
                        <div className="border-t border-stone-200 pt-4">
                          <button
                            onClick={() => {
                              setSettingsOpen(false)
                              setDeleteOpen(true)
                            }}
                            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2.5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete page
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ),
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false)
                onDelete?.()
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

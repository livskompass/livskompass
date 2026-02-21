import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, injectPreviewCSS } from '@livskompass/shared'
import { getFilteredPuckConfig } from '../lib/puck-filter'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { Settings, Trash2, ExternalLink } from 'lucide-react'

interface PageBuilderProps {
  page: {
    id?: string
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content_blocks?: string | null
  } | null
  onSave: (data: {
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
}

export default function PageBuilder({ page, onSave, onDelete }: PageBuilderProps) {
  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || '')
  const [parentSlug, setParentSlug] = useState(page?.parent_slug || '')
  const [sortOrder, setSortOrder] = useState(page?.sort_order || 0)
  const [status, setStatus] = useState(page?.status || 'draft')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setSlug(page.slug)
      setMetaDescription(page.meta_description || '')
      setParentSlug(page.parent_slug || '')
      setSortOrder(page.sort_order || 0)
      setStatus(page.status)
    }
  }, [page])

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

  const generateSlug = (t: string) =>
    t
      .replace(/[åÅ]/g, (c) => (c === 'å' ? 'a' : 'A'))
      .replace(/[äÄ]/g, (c) => (c === 'ä' ? 'a' : 'A'))
      .replace(/[öÖ]/g, (c) => (c === 'ö' ? 'o' : 'O'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const initialData = useMemo<Data>(() => {
    if (page?.content_blocks) {
      try {
        return JSON.parse(page.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [page?.content_blocks])

  const handlePublish = useCallback(
    (data: Data) => {
      onSave({
        title,
        slug,
        meta_description: metaDescription,
        parent_slug: parentSlug,
        sort_order: sortOrder,
        status,
        content_blocks: JSON.stringify(data),
        editor_version: 'puck',
      })
    },
    [title, slug, metaDescription, parentSlug, sortOrder, status, onSave],
  )

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Puck
        config={getFilteredPuckConfig('page')}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New page'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          iframe: ({ children, document: iframeDoc }) => {
            useEffect(() => {
              if (!iframeDoc) return
              injectPreviewCSS(iframeDoc)
            }, [iframeDoc])
            return <>{children}</>
          },
          headerActions: ({ children }) => (
            <div className="flex items-center gap-2">
              {/* View on site */}
              {page?.id && slug && (
                <a
                  href={`${window.location.origin.replace('admin', 'web')}/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-xs font-medium"
                  title="View on site"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </a>
              )}

              {/* Status badge */}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </span>

              {/* Settings dropdown */}
              <div ref={settingsRef} className="relative z-[999]">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (!settingsOpen && buttonRef.current) {
                      const rect = buttonRef.current.getBoundingClientRect()
                      setDropdownStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                    }
                    setSettingsOpen(!settingsOpen)
                  }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  title="Page settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-lg shadow-xl border border-stone-200 z-[9999] max-h-[80vh] overflow-y-auto" style={{ top: dropdownStyle.top, right: dropdownStyle.right }}>
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-stone-900">Page settings</h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-stone-500 mb-1 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!page?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-8 text-sm"
                            placeholder="Page title"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-stone-500 mb-1 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-stone-500 mb-1 block">Status</Label>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-8 text-sm"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs text-stone-500 mb-1 block">Meta description</Label>
                          <textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 resize-none"
                            rows={2}
                            placeholder="SEO description..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-stone-500 mb-1 block">Parent slug</Label>
                            <Input
                              value={parentSlug}
                              onChange={(e) => setParentSlug(e.target.value)}
                              className="h-8 text-sm"
                              placeholder="parent-slug"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-stone-500 mb-1 block">Sort order</Label>
                            <Input
                              type="number"
                              value={sortOrder}
                              onChange={(e) => setSortOrder(Number(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {onDelete && (
                        <div className="border-t border-stone-100 pt-3">
                          <button
                            onClick={() => {
                              setSettingsOpen(false)
                              setDeleteOpen(true)
                            }}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
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

              {/* Puck's built-in Publish/Save button */}
              {children}
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

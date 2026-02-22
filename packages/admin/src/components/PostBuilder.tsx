import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, createEditorOverrides, defaultPostTemplate } from '@livskompass/shared'
import { getFilteredPuckConfig } from '../lib/puck-filter'
import { getMediaUrl } from '../lib/api'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
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
import { Settings, Trash2, ExternalLink } from 'lucide-react'
import { cn, generateSlug } from '../lib/utils'

interface PostBuilderProps {
  post: {
    id?: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    status: string
    published_at: string | null
    content_blocks?: string | null
  } | null
  onSave: (data: {
    title: string
    slug: string
    excerpt: string
    featured_image: string
    status: string
    published_at: string
    content_blocks: string
    editor_version: string
  }) => void
  onDelete?: () => void
}

export default function PostBuilder({ post, onSave, onDelete }: PostBuilderProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [publishedAt, setPublishedAt] = useState(post?.published_at || '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ top: 0, right: 0 })

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt || '')
      setFeaturedImage(post.featured_image || '')
      setStatus(post.status)
      setPublishedAt(post.published_at || '')
    }
  }, [post])

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

  const editorOverrides = useMemo(() => createEditorOverrides(), [])

  const initialData = useMemo<Data>(() => {
    if (post?.content_blocks) {
      try {
        return JSON.parse(post.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    // Legacy post without Puck blocks: auto-populate from template
    if (post?.title) {
      try {
        const safeContent = (post as any).content
          ? (post as any).content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
          : '<p></p>'
        const template = defaultPostTemplate
          .replace('__LEGACY_CONTENT__', safeContent)
        return JSON.parse(template) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [post?.content_blocks, post?.title])

  const handlePublish = useCallback(
    (data: Data) => {
      const pa = status === 'published' && !publishedAt
        ? new Date().toISOString()
        : publishedAt

      onSave({
        title,
        slug,
        excerpt,
        featured_image: featuredImage,
        status,
        published_at: pa,
        content_blocks: JSON.stringify(data),
        editor_version: 'puck',
      })
    },
    [title, slug, excerpt, featuredImage, status, publishedAt, onSave],
  )

  return (
    <div className="h-[100dvh]">
      <Puck
        config={getFilteredPuckConfig('post')}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New post'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          ...editorOverrides,
          headerActions: ({ children }) => (
            <div className="flex items-center gap-2">
              {/* View on site */}
              {post?.id && slug && (
                <a
                  href={`${window.location.origin.replace(':3001', ':3000').replace('admin', 'web')}/nyhet/${slug}`}
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
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  status === 'published'
                    ? 'bg-stone-100 text-stone-700 border-stone-300'
                    : 'bg-stone-50 text-stone-500 border-stone-200'
                }`}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </span>

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
                    "inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150",
                    settingsOpen
                      ? "border-stone-400 bg-stone-100 text-stone-700"
                      : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  )}
                  title="Post settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-[200] max-h-[80vh] overflow-y-auto animate-scale-in origin-top-right" style={dropdownStyle}>
                    <div className="p-5 space-y-5">
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Post settings</h3>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!post?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-9 text-sm"
                            placeholder="Post title"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Status</Label>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 text-sm"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Excerpt</Label>
                          <Textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            className="min-h-0 resize-none"
                            rows={2}
                            placeholder="Short summary..."
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Featured image</Label>
                          <Input
                            value={featuredImage}
                            onChange={(e) => setFeaturedImage(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="/media/uploads/image.jpg"
                          />
                          {featuredImage && (
                            <img
                              src={getMediaUrl(featuredImage)}
                              alt=""
                              className="mt-2 w-full h-32 rounded-lg object-cover border border-stone-200"
                            />
                          )}
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
                            Delete post
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
            <DialogTitle>Delete post</DialogTitle>
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

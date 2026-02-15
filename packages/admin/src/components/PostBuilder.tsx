import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { puckConfig, emptyPuckData } from '@livskompass/shared'
import { getMediaUrl } from '../lib/api'
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
import { Settings, Trash2 } from 'lucide-react'

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

  const generateSlug = (t: string) =>
    t
      .replace(/[åÅ]/g, (c) => (c === 'å' ? 'a' : 'A'))
      .replace(/[äÄ]/g, (c) => (c === 'ä' ? 'a' : 'A'))
      .replace(/[öÖ]/g, (c) => (c === 'ö' ? 'o' : 'O'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const initialData = useMemo<Data>(() => {
    if (post?.content_blocks) {
      try {
        return JSON.parse(post.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [post?.content_blocks])

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
    <div className="h-[calc(100vh-4rem)]">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New post'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          iframe: ({ children, document: iframeDoc }) => {
            useEffect(() => {
              if (!iframeDoc) return
              // Extract actual CSS rules from all stylesheets (reliable in both dev & production)
              let cssText = ''
              Array.from(document.styleSheets).forEach((sheet) => {
                try {
                  Array.from(sheet.cssRules).forEach((rule) => {
                    cssText += rule.cssText + '\n'
                  })
                } catch {
                  // Cross-origin stylesheet - inject as link
                  if (sheet.href) {
                    const link = iframeDoc.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = sheet.href
                    iframeDoc.head.appendChild(link)
                  }
                }
              })
              if (cssText) {
                const style = iframeDoc.createElement('style')
                style.textContent = cssText
                iframeDoc.head.appendChild(style)
              }
              // Google Fonts
              const fontLink = iframeDoc.createElement('link')
              fontLink.rel = 'stylesheet'
              fontLink.href =
                'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
              iframeDoc.head.appendChild(fontLink)
              iframeDoc.body.style.fontFamily = "'Inter', system-ui, sans-serif"
            }, [iframeDoc])
            return <>{children}</>
          },
          headerActions: ({ children }) => (
            <div className="flex items-center gap-2">
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
              <div ref={settingsRef} className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  title="Post settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Post settings</h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!post?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-8 text-sm"
                            placeholder="Post title"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
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
                          <Label className="text-xs text-gray-500 mb-1 block">Excerpt</Label>
                          <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            rows={2}
                            placeholder="Short summary..."
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Featured image</Label>
                          <Input
                            value={featuredImage}
                            onChange={(e) => setFeaturedImage(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="/media/uploads/image.jpg"
                          />
                          {featuredImage && (
                            <img
                              src={getMediaUrl(featuredImage)}
                              alt=""
                              className="mt-2 w-full h-32 rounded-md object-cover border border-gray-200"
                            />
                          )}
                        </div>
                      </div>

                      {onDelete && (
                        <div className="border-t border-gray-100 pt-3">
                          <button
                            onClick={() => {
                              setSettingsOpen(false)
                              setDeleteOpen(true)
                            }}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
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

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { puckConfig, emptyPuckData } from '@livskompass/shared'
// Media base URL for resolving image paths in the editor
// Will be used when media picker is integrated
// import { MEDIA_BASE } from '../lib/api'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'

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
}

export default function PageBuilder({ page, onSave }: PageBuilderProps) {
  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || '')
  const [parentSlug, setParentSlug] = useState(page?.parent_slug || '')
  const [sortOrder, setSortOrder] = useState(page?.sort_order || 0)
  const [status, setStatus] = useState(page?.status || 'draft')

  // Keep metadata in sync if page prop changes (e.g. from async load)
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

  const generateSlug = (t: string) =>
    t
      .replace(/[åÅ]/g, (c) => (c === 'å' ? 'a' : 'A'))
      .replace(/[äÄ]/g, (c) => (c === 'ä' ? 'a' : 'A'))
      .replace(/[öÖ]/g, (c) => (c === 'ö' ? 'o' : 'O'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  // Parse initial puck data
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
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New page'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          // Inject Tailwind CSS into the preview iframe so blocks render correctly
          iframe: ({ children, document: iframeDoc }) => {
            useEffect(() => {
              if (!iframeDoc) return
              // Find the main Tailwind stylesheet from the parent and inject it
              const parentStyles = Array.from(
                window.document.querySelectorAll('link[rel="stylesheet"], style'),
              )
              parentStyles.forEach((node) => {
                const clone = node.cloneNode(true) as HTMLElement
                iframeDoc.head.appendChild(clone)
              })
              // Also inject Google Fonts
              const fontLink = iframeDoc.createElement('link')
              fontLink.rel = 'stylesheet'
              fontLink.href =
                'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
              iframeDoc.head.appendChild(fontLink)
              // Set base font
              iframeDoc.body.style.fontFamily = "'Inter', system-ui, sans-serif"
            }, [iframeDoc])
            return <>{children}</>
          },
          // Add page metadata fields in the header actions area
          headerActions: ({ children }) => (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-500 whitespace-nowrap">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!page?.id) setSlug(generateSlug(e.target.value))
                  }}
                  className="h-7 w-48 text-xs"
                  placeholder="Page title"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-500 whitespace-nowrap">Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-7 w-32 text-xs"
                  placeholder="url-slug"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-500 whitespace-nowrap">Status</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-7 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              {children}
            </div>
          ),
        }}
      />
    </div>
  )
}

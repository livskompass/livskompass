import { useCallback, useEffect, useMemo, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { puckConfig, emptyPuckData } from '@livskompass/shared'
import { getMediaUrl } from '../lib/api'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'

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
}

export default function PostBuilder({ post, onSave }: PostBuilderProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [publishedAt, setPublishedAt] = useState(post?.published_at || '')

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
              const parentStyles = Array.from(
                window.document.querySelectorAll('link[rel="stylesheet"], style'),
              )
              parentStyles.forEach((node) => {
                const clone = node.cloneNode(true) as HTMLElement
                iframeDoc.head.appendChild(clone)
              })
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-500 whitespace-nowrap">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!post?.id) setSlug(generateSlug(e.target.value))
                  }}
                  className="h-7 w-48 text-xs"
                  placeholder="Post title"
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
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-500 whitespace-nowrap">Image</Label>
                <Input
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="h-7 w-40 text-xs"
                  placeholder="URL or /media/..."
                />
                {featuredImage && (
                  <img
                    src={getMediaUrl(featuredImage)}
                    alt=""
                    className="h-7 w-7 rounded object-cover border"
                  />
                )}
              </div>
              {children}
            </div>
          ),
        }}
      />
    </div>
  )
}

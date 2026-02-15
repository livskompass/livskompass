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

interface ProductBuilderProps {
  product: {
    id?: string
    title: string
    slug: string
    description: string
    type: string
    price_sek: number
    external_url: string
    image_url: string
    in_stock: number
    status: string
    content_blocks?: string | null
  } | null
  onSave: (data: {
    title: string
    slug: string
    description: string
    type: string
    price_sek: number
    external_url: string
    image_url: string
    in_stock: number
    status: string
    content_blocks: string
    editor_version: string
  }) => void
  onDelete?: () => void
}

export default function ProductBuilder({ product, onSave, onDelete }: ProductBuilderProps) {
  const [title, setTitle] = useState(product?.title || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [description, setDescription] = useState(product?.description || '')
  const [type, setType] = useState(product?.type || 'book')
  const [priceSek, setPriceSek] = useState(product?.price_sek ?? 0)
  const [externalUrl, setExternalUrl] = useState(product?.external_url || '')
  const [imageUrl, setImageUrl] = useState(product?.image_url || '')
  const [inStock, setInStock] = useState(product?.in_stock ?? 0)
  const [status, setStatus] = useState(product?.status || 'inactive')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) {
      setTitle(product.title)
      setSlug(product.slug)
      setDescription(product.description || '')
      setType(product.type || 'book')
      setPriceSek(product.price_sek ?? 0)
      setExternalUrl(product.external_url || '')
      setImageUrl(product.image_url || '')
      setInStock(product.in_stock ?? 0)
      setStatus(product.status)
    }
  }, [product])

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
    if (product?.content_blocks) {
      try {
        return JSON.parse(product.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [product?.content_blocks])

  const handlePublish = useCallback(
    (data: Data) => {
      onSave({
        title,
        slug,
        description,
        type,
        price_sek: priceSek,
        external_url: externalUrl,
        image_url: imageUrl,
        in_stock: inStock,
        status,
        content_blocks: JSON.stringify(data),
        editor_version: 'puck',
      })
    },
    [title, slug, description, type, priceSek, externalUrl, imageUrl, inStock, status, onSave],
  )

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New product'}
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
                  status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {status === 'active' ? 'Active' : 'Inactive'}
              </span>

              {/* Settings dropdown */}
              <div ref={settingsRef} className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  title="Product settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Product settings</h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!product?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-8 text-sm"
                            placeholder="Product title"
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Type</Label>
                          <Select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="h-8 text-sm"
                          >
                            <option value="book">Book</option>
                            <option value="cd">CD</option>
                            <option value="cards">Cards</option>
                            <option value="app">App</option>
                            <option value="download">Download</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Price (SEK)</Label>
                          <Input
                            type="number"
                            value={priceSek}
                            onChange={(e) => setPriceSek(Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0 for free"
                            min={0}
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">In stock</Label>
                          <Input
                            type="number"
                            value={inStock}
                            onChange={(e) => setInStock(Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                            min={0}
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">External URL</Label>
                          <Input
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="https://example.com/buy"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Image URL</Label>
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="/media/uploads/image.jpg"
                          />
                          {imageUrl && (
                            <img
                              src={getMediaUrl(imageUrl)}
                              alt=""
                              className="mt-2 w-full h-32 rounded-md object-cover border border-gray-200"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            rows={2}
                            placeholder="Short description for listings..."
                          />
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
                            Delete product
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
            <DialogTitle>Delete product</DialogTitle>
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

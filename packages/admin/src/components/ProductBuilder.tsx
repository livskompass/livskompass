import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, injectPreviewCSS } from '@livskompass/shared'
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
import { cn } from '../lib/utils'

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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, right: 0 })

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
        config={getFilteredPuckConfig('product')}
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
              injectPreviewCSS(iframeDoc)
            }, [iframeDoc])
            return <>{children}</>
          },
          headerActions: ({ children }) => (
            <div className="flex items-center gap-2">
              {/* View on site */}
              {product?.id && slug && (
                <a
                  href={`${window.location.origin.replace('admin', 'web')}/material`}
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
                  status === 'active'
                    ? 'bg-forest-50 text-forest-700 border-forest-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {status === 'active' ? 'Active' : 'Inactive'}
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
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150",
                    settingsOpen
                      ? "border-forest-300 bg-forest-50 text-forest-700"
                      : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  )}
                  title="Product settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-[9999] max-h-[80vh] overflow-y-auto animate-scale-in origin-top-right" style={{ top: dropdownStyle.top, right: dropdownStyle.right }}>
                    <div className="p-5 space-y-5">
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Product settings</h3>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!product?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-9 text-sm"
                            placeholder="Product title"
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

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Status</Label>
                            <Select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="h-9 text-sm"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Type</Label>
                            <Select
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              className="h-9 text-sm"
                            >
                              <option value="book">Book</option>
                              <option value="cd">CD</option>
                              <option value="cards">Cards</option>
                              <option value="app">App</option>
                              <option value="download">Download</option>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Price (SEK)</Label>
                            <Input
                              type="number"
                              value={priceSek}
                              onChange={(e) => setPriceSek(Number(e.target.value))}
                              className="h-9 text-sm"
                              placeholder="0 for free"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">In stock</Label>
                            <Input
                              type="number"
                              value={inStock}
                              onChange={(e) => setInStock(Number(e.target.value))}
                              className="h-9 text-sm"
                              placeholder="0"
                              min={0}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">External URL</Label>
                          <Input
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="https://example.com/buy"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Image URL</Label>
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="/media/uploads/image.jpg"
                          />
                          {imageUrl && (
                            <img
                              src={getMediaUrl(imageUrl)}
                              alt=""
                              className="mt-2 w-full h-32 rounded-lg object-cover border border-stone-200"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Description</Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-0 resize-none"
                            rows={2}
                            placeholder="Short description for listings..."
                          />
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

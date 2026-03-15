import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InlineImagePickerContext } from '@livskompass/shared'
import { getMedia, uploadMedia, getMediaUrl } from '../../lib/api'
import { ImageIcon, Upload, Loader2 } from 'lucide-react'

/**
 * Provides InlineImagePickerContext to all blocks rendered inside the editor.
 * Renders a fullscreen overlay media picker when requestImagePick is called.
 */
export function InlineImagePickerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const callbackRef = useRef<((url: string) => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: getMedia,
    enabled: open,
  })

  const requestImagePick = useCallback((url: string, onPick: (url: string) => void) => {
    setCurrentUrl(url)
    callbackRef.current = onPick
    setOpen(true)
  }, [])

  const handleSelect = (url: string) => {
    callbackRef.current?.(url)
    callbackRef.current = null
    setOpen(false)
  }

  const handleClose = useCallback(() => {
    callbackRef.current = null
    setOpen(false)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, handleClose])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      let lastUrl = ''
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file)
        if (result.media) lastUrl = result.media.url
      }
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      if (lastUrl) {
        handleSelect(lastUrl)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <InlineImagePickerContext.Provider value={{ requestImagePick }}>
      {children}

      {/* Media picker overlay */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-editor-popover, 1005)' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          {/* Panel */}
          <div
            className="relative rounded-xl overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Choose image"
            style={{
              width: 640,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 64px)',
              background: 'var(--editor-surface-glass-heavy)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--editor-shadow-xl)',
              animation: 'editor-slide-down 200ms ease forwards',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
              <span className="text-sm font-semibold text-stone-700">Choose image</span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Upload</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-8 px-3 text-xs font-medium rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 p-4">
              {isLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-stone-100 animate-pulse" />
                  ))}
                </div>
              ) : data?.media && data.media.filter((m) => m.type?.startsWith('image')).length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {data.media
                    .filter((m) => m.type?.startsWith('image'))
                    .map((media) => {
                      const isSelected = currentUrl === media.url
                      return (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => handleSelect(media.url)}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-md focus:outline-none"
                          style={{
                            borderColor: isSelected ? 'var(--editor-blue, #2563EB)' : 'transparent',
                            boxShadow: isSelected ? 'var(--editor-blue-selection-ring)' : undefined,
                          }}
                        >
                          <img
                            src={getMediaUrl(media.url)}
                            alt={media.alt_text || media.filename}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950/60 to-transparent text-white text-[9px] p-1.5 pt-3 truncate">
                            {media.filename}
                          </div>
                        </button>
                      )
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-10 w-10 text-stone-300 mb-3" />
                  <p className="text-sm text-stone-500 font-medium">No images yet</p>
                  <p className="text-xs text-stone-400 mt-1">Upload an image to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </InlineImagePickerContext.Provider>
  )
}

import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedia, uploadMedia, getMediaUrl } from '../lib/api'
import type { Media } from '../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { ImageIcon, Upload, Loader2, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface MediaPickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function MediaPickerField({ value, onChange }: MediaPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: getMedia,
    enabled: open,
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      let lastMedia: Media | null = null
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file)
        lastMedia = result.media
      }
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      // Auto-select the last uploaded file
      if (lastMedia) {
        onChange(lastMedia.url)
        setOpen(false)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const resolvedUrl = value ? getMediaUrl(value) : ''

  return (
    <div>
      {/* Current value display */}
      {value ? (
        <div className="relative group">
          <img
            src={resolvedUrl}
            alt="Selected media preview"
            className="w-full h-28 rounded-lg object-cover border border-zinc-200 bg-zinc-50"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md px-3 py-1.5 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md px-2 py-1.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <ImageIcon className="h-5 w-5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">Choose image</span>
        </button>
      )}

      {/* Media picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Choose image</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-zinc-500">
              {data?.media ? `${data.media.length} files` : ''}
            </p>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : data?.media && data.media.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {data.media
                  .filter((m) => m.type?.startsWith('image'))
                  .map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => {
                        onChange(media.url)
                        setOpen(false)
                      }}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-md focus:outline-none',
                        value === media.url
                          ? 'border-zinc-900 ring-2 ring-zinc-400/20'
                          : 'border-transparent hover:border-zinc-300'
                      )}
                    >
                      <img
                        src={getMediaUrl(media.url)}
                        alt={media.alt_text || media.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/60 to-transparent text-white text-[9px] p-1.5 pt-3 truncate">
                        {media.filename}
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-500">No images yet</p>
                <p className="text-xs text-zinc-400 mt-1">Upload an image to get started.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InlineMediaPickerContext, type MediaPickerType } from '@livskompass/shared'
import { getMedia, uploadMedia, getMediaUrl } from '../../lib/api'
import { ImageIcon, Upload, Loader2, Search, Film, Music, FileText, FolderOpen } from 'lucide-react'

const TYPE_LABELS: Record<MediaPickerType, string> = {
  image: 'Choose image',
  video: 'Choose video',
  audio: 'Choose audio',
  document: 'Choose document',
  all: 'Choose file',
}

const TYPE_ACCEPT: Record<MediaPickerType, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv',
  all: '*',
}

const TYPE_ICONS: Record<MediaPickerType, React.ReactNode> = {
  image: <ImageIcon className="h-10 w-10 text-zinc-300" />,
  video: <Film className="h-10 w-10 text-zinc-300" />,
  audio: <Music className="h-10 w-10 text-zinc-300" />,
  document: <FileText className="h-10 w-10 text-zinc-300" />,
  all: <FolderOpen className="h-10 w-10 text-zinc-300" />,
}

function matchesTypeFilter(mediaType: string | undefined, filter: MediaPickerType): boolean {
  if (filter === 'all') return true
  if (!mediaType) return false
  if (filter === 'image') return mediaType.startsWith('image')
  if (filter === 'video') return mediaType.startsWith('video')
  if (filter === 'audio') return mediaType.startsWith('audio')
  if (filter === 'document') return mediaType === 'pdf' || mediaType === 'other' || mediaType.includes('document') || mediaType.includes('pdf')
  return true
}

export function InlineMediaPickerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<MediaPickerType>('all')
  const [currentUrl, setCurrentUrl] = useState('')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const callbackRef = useRef<((url: string) => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: getMedia,
    enabled: open,
  })

  const requestMediaPick = useCallback((type: MediaPickerType, url: string, onPick: (url: string) => void) => {
    setTypeFilter(type)
    setCurrentUrl(url)
    setSearch('')
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

  // Filter media by type and search
  const filtered = data?.media
    ?.filter((m) => matchesTypeFilter(m.type, typeFilter))
    ?.filter((m) => {
      if (!search) return true
      const q = search.toLowerCase()
      return m.filename?.toLowerCase().includes(q) || m.alt_text?.toLowerCase().includes(q)
    }) || []

  const isImage = (type: string | undefined) => type?.startsWith('image')

  return (
    <InlineMediaPickerContext.Provider value={{ requestMediaPick }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-editor-popover, 1005)' }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div
            className="relative rounded-xl overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={TYPE_LABELS[typeFilter]}
            style={{
              width: 720,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 64px)',
              background: 'var(--editor-surface-glass-heavy)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--editor-shadow-xl)',
              animation: 'editor-slide-down 200ms ease forwards',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <span className="text-sm font-semibold text-zinc-700">{TYPE_LABELS[typeFilter]}</span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={TYPE_ACCEPT[typeFilter]}
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
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
                  className="h-8 px-3 text-xs font-medium rounded-md text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-2 border-b border-zinc-50">
              <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="flex-1 text-sm bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 p-4">
              {isLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-zinc-100 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {filtered.map((media) => {
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
                        {isImage(media.type) ? (
                          <img
                            src={getMediaUrl(media.url)}
                            alt={media.alt_text || media.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center gap-1 p-2">
                            {media.type?.startsWith('video') ? <Film className="h-6 w-6 text-zinc-400" /> :
                             media.type?.startsWith('audio') ? <Music className="h-6 w-6 text-zinc-400" /> :
                             <FileText className="h-6 w-6 text-zinc-400" />}
                            <span className="text-[9px] text-zinc-500 font-medium uppercase">
                              {media.filename?.split('.').pop() || media.type}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/60 to-transparent text-white text-[9px] p-1.5 pt-3 truncate">
                          {media.filename}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  {TYPE_ICONS[typeFilter]}
                  <p className="text-sm text-zinc-500 font-medium mt-3">
                    {search ? 'No files match your search' : `No ${typeFilter === 'all' ? 'files' : typeFilter + ' files'} yet`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Upload a file to get started.</p>
                </div>
              )}
            </div>

            {/* Footer with count */}
            {filtered.length > 0 && (
              <div className="px-5 py-2 border-t border-zinc-100 text-[11px] text-zinc-400">
                {filtered.length} file{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </InlineMediaPickerContext.Provider>
  )
}

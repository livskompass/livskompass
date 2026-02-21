import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedia, uploadMedia, deleteMedia, getMediaUrl } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import { Upload, Trash2, Copy, ImageIcon, FileText, Film, Music, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

export default function MediaLibrary() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: getMedia,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      setSelectedMedia(null)
    },
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file)
      }
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = (id: string, filename: string) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  }

  const getFileIcon = (type: string | undefined) => {
    if (type?.startsWith('video')) return Film
    if (type?.startsWith('audio')) return Music
    return FileText
  }

  const selected = data?.media?.find((m) => m.id === selectedMedia)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 text-stone-900">Media Library</h1>
          <p className="text-stone-500 mt-1">Upload and manage images, files, and media.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Upload</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : data?.media && data.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.media.map((media) => {
                    const FileIcon = getFileIcon(media.type)
                    return (
                      <div
                        key={media.id}
                        onClick={() => setSelectedMedia(media.id)}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-fast shadow-sm hover:shadow-md",
                          selectedMedia === media.id
                            ? 'border-forest-500 ring-[3px] ring-forest-500/10'
                            : 'border-transparent hover:border-stone-300'
                        )}
                      >
                        {media.type?.startsWith('image') ? (
                          <img
                            src={getMediaUrl(media.url)}
                            alt={media.alt_text || media.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center gap-2">
                            <FileIcon className="h-8 w-8 text-stone-400" />
                            <span className="text-xs text-stone-500 px-2 text-center truncate w-full">
                              {media.filename}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950/60 to-transparent text-white text-[10px] p-2 pt-4 truncate">
                          {media.filename}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-10 w-10 text-stone-300 mb-3" />
                  <p className="text-stone-500 mb-1">No files yet</p>
                  <p className="text-sm text-stone-400">Upload files to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details sidebar */}
        <div>
          {selected ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">File details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected.type?.startsWith('image') && (
                  <img
                    src={getMediaUrl(selected.url)}
                    alt={selected.alt_text || selected.filename}
                    className="w-full rounded-xl border border-stone-200"
                  />
                )}

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-stone-400 text-xs">Filename</dt>
                    <dd className="font-medium text-stone-900 break-all text-sm">
                      {selected.filename}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 text-xs">Type</dt>
                    <dd className="text-stone-700">{selected.type}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 text-xs">Size</dt>
                    <dd className="text-stone-700">
                      {(selected.size_bytes / 1024).toFixed(1)} KB
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 text-xs">URL</dt>
                    <dd className="font-mono text-[11px] text-stone-500 break-all">
                      {getMediaUrl(selected.url)}
                    </dd>
                  </div>
                </dl>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getMediaUrl(selected.url))}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selected.id, selected.filename)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-8 w-8 text-stone-300 mb-2" />
                <p className="text-sm text-stone-400">Select a file to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

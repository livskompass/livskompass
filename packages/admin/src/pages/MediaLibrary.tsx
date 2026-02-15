import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedia, uploadMedia, deleteMedia } from '../lib/api'

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

  const selected = data?.media?.find((m) => m.id === selectedMedia)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media library</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+ Upload'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : data?.media && data.media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.media.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => setSelectedMedia(media.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedMedia === media.id
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {media.type?.startsWith('image') ? (
                      <img
                        src={media.url}
                        alt={media.alt_text || media.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">
                          {media.type?.startsWith('video')
                            ? '🎬'
                            : media.type?.startsWith('audio')
                            ? '🎵'
                            : '📄'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {media.filename}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No files yet. Upload files to get started.
              </div>
            )}
          </div>
        </div>

        {/* Details sidebar */}
        <div>
          {selected ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">File details</h3>

              {selected.type?.startsWith('image') && (
                <img
                  src={selected.url}
                  alt={selected.alt_text || selected.filename}
                  className="w-full rounded-lg mb-4"
                />
              )}

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Filename</dt>
                  <dd className="font-medium text-gray-900 break-all">
                    {selected.filename}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">{selected.type}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="font-medium text-gray-900">
                    {(selected.size_bytes / 1024).toFixed(1)} KB
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">URL</dt>
                  <dd className="font-mono text-xs text-gray-600 break-all">
                    {selected.url}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => copyToClipboard(selected.url)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(selected.id, selected.filename)}
                  className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              Select a file to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

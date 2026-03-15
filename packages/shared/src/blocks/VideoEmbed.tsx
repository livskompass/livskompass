import { useState, useRef, useEffect, useContext } from 'react'
import { Film, Link as LinkIcon, Play, X, Check, ExternalLink, FolderOpen } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock, InlineMediaPickerContext } from '../context'
import { cn } from '../ui/utils'
import { resolveMediaUrl } from '../helpers'

export interface VideoEmbedProps {
  url: string
  aspectRatio: '16:9' | '4:3' | '1:1'
  caption: string
}

const ratioMap = { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function getEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('youtube.com/watch')) {
    try {
      const videoId = new URL(url).searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch { /* ignore */ }
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } else if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    if (videoId) return `https://player.vimeo.com/video/${videoId}`
  } else if (url.includes('loom.com/share/')) {
    const videoId = url.split('loom.com/share/')[1]?.split('?')[0]
    if (videoId) return `https://www.loom.com/embed/${videoId}`
  }
  return url
}

function getProviderName(url: string): string | null {
  if (!url) return null
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('vimeo.com')) return 'Vimeo'
  if (url.includes('loom.com')) return 'Loom'
  return null
}

function isDirectVideo(url: string): boolean {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
}

export function VideoEmbed({
  url = '',
  aspectRatio = '16:9',
  caption = '',
  id,
}: VideoEmbedProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const captionPuck = useInlineEdit('caption', caption, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const captionEditCtx = useEditableText('caption', caption)
  // Puck takes priority
  const captionEdit = captionPuck || captionEditCtx

  const editCtx = useInlineEditBlock()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlDraft, setUrlDraft] = useState(url)

  const embedUrl = getEmbedUrl(url)
  const ratio = ratioMap[aspectRatio] || 'aspect-video'
  const provider = getProviderName(url)
  const isDirect = isDirectVideo(url)

  const handleSaveUrl = (newUrl: string) => {
    if (editCtx) {
      editCtx.saveBlockProp(editCtx.blockIndex, 'url', newUrl)
    }
    setShowUrlInput(false)
  }

  // Render the video content
  const videoContent = embedUrl ? (
    isDirect ? (
      <video
        src={resolveMediaUrl(url)}
        className="w-full h-full object-cover"
        controls
        preload="metadata"
      />
    ) : (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={caption || 'Video'}
      />
    )
  ) : null

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <figure>
        <div className={cn(ratio, 'w-full rounded-xl overflow-hidden bg-stone-100 relative', editCtx && 'group/video')}>
          {videoContent || (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
              <Film className="h-10 w-10 text-stone-300" />
              <span className="text-sm">Paste a video URL</span>
            </div>
          )}

          {/* Admin overlay — click to edit video */}
          {editCtx && !showUrlInput && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/video:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'var(--overlay-light)' }}
              onClick={(e) => {
                e.stopPropagation()
                setUrlDraft(url)
                setShowUrlInput(true)
              }}
            >
              {url ? (
                <>
                  <Play className="h-8 w-8 text-white" />
                  <span className="text-white text-sm font-medium">Change video</span>
                  {provider && (
                    <span className="text-white/60 text-xs flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {provider}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Film className="h-8 w-8 text-white" />
                  <span className="text-white text-sm font-medium">Add video</span>
                </>
              )}
            </div>
          )}

          {/* Inline URL input */}
          {editCtx && showUrlInput && (
            <VideoUrlInput
              value={urlDraft}
              onChange={setUrlDraft}
              onSave={handleSaveUrl}
              onCancel={() => setShowUrlInput(false)}
            />
          )}
        </div>

        {(caption || captionEdit) && (
          <figcaption
            {...editHandlers(captionEdit)}
            className={cn('text-sm text-stone-500 mt-2 text-center', captionEdit?.className)}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

/** Inline URL input overlay for video blocks */
function VideoUrlInput({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string
  onChange: (v: string) => void
  onSave: (url: string) => void
  onCancel: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaPicker = useContext(InlineMediaPickerContext)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6"
      style={{ background: 'var(--overlay-dark)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-between text-white/80 text-xs mb-2">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5" />
            <span>YouTube, Vimeo, Loom, or direct video URL</span>
          </div>
          {mediaPicker && (
            <button
              onClick={() => mediaPicker.requestMediaPick('video', value, (url) => onSave(url))}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Browse
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none placeholder:text-white/30 focus:border-white/40 focus:bg-white/15"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(value)
              if (e.key === 'Escape') onCancel()
            }}
          />
          <button
            onClick={() => onSave(value)}
            className="px-3 py-2 rounded-lg bg-white text-stone-800 text-sm font-medium hover:bg-stone-100 transition-colors flex items-center gap-1"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-2 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Provider detection preview */}
        {value && getProviderName(value) && (
          <div className="text-xs text-white/50 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Detected: {getProviderName(value)}
          </div>
        )}

        {/* Remove video option */}
        {value && (
          <button
            onClick={() => onSave('')}
            className="text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            Remove video
          </button>
        )}
      </div>
    </div>
  )
}

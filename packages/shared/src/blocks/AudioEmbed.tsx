import { useState, useRef, useEffect, useContext } from 'react'
import { Music, Link as LinkIcon, X, Check, ExternalLink, FolderOpen } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock, InlineMediaPickerContext } from '../context'
import { cn } from '../ui/utils'
import { resolveMediaUrl } from '../helpers'

export interface AudioEmbedProps {
  url: string
  caption: string
  style: 'minimal' | 'card'
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function getAudioEmbedUrl(url: string): string | null {
  if (!url) return null
  // Spotify track/album/playlist
  if (url.includes('open.spotify.com/')) {
    // Convert open.spotify.com/track/xxx → open.spotify.com/embed/track/xxx
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }
  // SoundCloud
  if (url.includes('soundcloud.com/')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
  }
  return null
}

function getAudioProvider(url: string): string | null {
  if (!url) return null
  if (url.includes('spotify.com')) return 'Spotify'
  if (url.includes('soundcloud.com')) return 'SoundCloud'
  return null
}

function isDirectAudio(url: string): boolean {
  if (!url) return false
  return /\.(mp3|wav|ogg|m4a|aac|flac|webm)((\?|#).*)?$/i.test(url)
}

export function AudioEmbed({
  url = '',
  caption = '',
  style = 'minimal',
  id,
}: AudioEmbedProps & { puck?: { isEditing: boolean }; id?: string }) {
  const captionPuck = useInlineEdit('caption', caption, id || '')
  const captionEditCtx = useEditableText('caption', caption)
  const captionEdit = captionPuck || captionEditCtx

  const editCtx = useInlineEditBlock()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlDraft, setUrlDraft] = useState(url)

  const embedUrl = getAudioEmbedUrl(url)
  const provider = getAudioProvider(url)
  const isDirect = isDirectAudio(url)

  const handleSaveUrl = (newUrl: string) => {
    if (editCtx) {
      editCtx.saveBlockProp(editCtx.blockIndex, 'url', newUrl)
    }
    setShowUrlInput(false)
  }

  const cardClass = style === 'card'
    ? 'bg-white rounded-xl border border-stone-200 shadow-sm p-4'
    : ''

  const audioContent = url ? (
    isDirect ? (
      <audio
        src={resolveMediaUrl(url)}
        className="w-full"
        controls
        preload="metadata"
      />
    ) : embedUrl ? (
      provider === 'Spotify' ? (
        <iframe
          src={embedUrl}
          className="w-full rounded-xl"
          style={{ height: 152 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={caption || 'Audio'}
        />
      ) : (
        <iframe
          src={embedUrl}
          className="w-full"
          style={{ height: 166 }}
          allow="autoplay"
          loading="lazy"
          title={caption || 'Audio'}
        />
      )
    ) : (
      // Unknown URL — try as direct audio
      <audio
        src={resolveMediaUrl(url)}
        className="w-full"
        controls
        preload="metadata"
      />
    )
  ) : null

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <figure>
        <div className={cn(cardClass, 'relative', editCtx && 'group/audio')}>
          {audioContent || (
            <div className={cn(
              'w-full flex flex-col items-center justify-center text-stone-400 gap-2 py-8',
              style === 'card' ? '' : 'border-2 border-dashed border-stone-200 rounded-xl',
            )}>
              <Music className="h-10 w-10 text-stone-300" />
              <span className="text-sm">Paste an audio URL</span>
            </div>
          )}

          {/* Admin overlay */}
          {editCtx && !showUrlInput && (
            <div
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/audio:opacity-100 transition-opacity cursor-pointer rounded-xl"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={(e) => {
                e.stopPropagation()
                setUrlDraft(url)
                setShowUrlInput(true)
              }}
            >
              {url ? (
                <>
                  <Music className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Change audio</span>
                  {provider && (
                    <span className="text-white/60 text-xs flex items-center gap-1 ml-2">
                      <ExternalLink className="h-3 w-3" />
                      {provider}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Music className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Add audio</span>
                </>
              )}
            </div>
          )}

          {/* Inline URL input */}
          {editCtx && showUrlInput && (
            <AudioUrlInput
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

/** Inline URL input overlay for audio blocks */
function AudioUrlInput({
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
      className="absolute inset-0 flex items-center justify-center p-6 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-between text-white/80 text-xs mb-2">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Spotify, SoundCloud, or direct audio URL</span>
          </div>
          {mediaPicker && (
            <button
              onClick={() => mediaPicker.requestMediaPick('audio', value, (url) => onSave(url))}
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
            placeholder="https://open.spotify.com/track/..."
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

        {value && getAudioProvider(value) && (
          <div className="text-xs text-white/50 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Detected: {getAudioProvider(value)}
          </div>
        )}

        {value && (
          <button
            onClick={() => onSave('')}
            className="text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            Remove audio
          </button>
        )}
      </div>
    </div>
  )
}

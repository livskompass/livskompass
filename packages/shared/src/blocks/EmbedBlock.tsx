import { useState, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { Code, Link as LinkIcon, X, Check, ExternalLink } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { cn } from '../ui/utils'

function sanitizeEmbed(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'loading', 'title', 'style'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}

export interface EmbedBlockProps {
  url: string
  html: string
  caption: string
  aspectRatio: 'auto' | '16:9' | '4:3' | '1:1'
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

const ratioMap = { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square', auto: '' }

function getEmbedProvider(url: string): string | null {
  if (!url) return null
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X'
  if (url.includes('instagram.com')) return 'Instagram'
  if (url.includes('tiktok.com')) return 'TikTok'
  if (url.includes('codepen.io')) return 'CodePen'
  if (url.includes('figma.com')) return 'Figma'
  if (url.includes('maps.google') || url.includes('google.com/maps')) return 'Google Maps'
  if (url.includes('docs.google.com')) return 'Google Docs'
  if (url.includes('airtable.com')) return 'Airtable'
  if (url.includes('typeform.com')) return 'Typeform'
  return null
}

export function EmbedBlock({
  url = '',
  html = '',
  caption = '',
  aspectRatio = 'auto',
  id,
}: EmbedBlockProps & { puck?: { isEditing: boolean }; id?: string }) {
  const captionPuck = useInlineEdit('caption', caption, id || '')
  const captionEditCtx = useEditableText('caption', caption)
  const captionEdit = captionPuck || captionEditCtx

  const editCtx = useInlineEditBlock()
  const [showInput, setShowInput] = useState(false)
  const [urlDraft, setUrlDraft] = useState(url)
  const [htmlDraft, setHtmlDraft] = useState(html)
  const [inputMode, setInputMode] = useState<'url' | 'html'>('url')

  const ratio = ratioMap[aspectRatio] || ''
  const provider = getEmbedProvider(url)

  const handleSave = () => {
    if (editCtx) {
      if (inputMode === 'url') {
        editCtx.saveBlockProp(editCtx.blockIndex, 'url', urlDraft)
        editCtx.saveBlockProp(editCtx.blockIndex, 'html', '')
      } else {
        editCtx.saveBlockProp(editCtx.blockIndex, 'html', htmlDraft)
        editCtx.saveBlockProp(editCtx.blockIndex, 'url', '')
      }
    }
    setShowInput(false)
  }

  const hasContent = url || html

  const embedContent = hasContent ? (
    html ? (
      <div
        className={cn('w-full overflow-hidden rounded-xl', ratio)}
        dangerouslySetInnerHTML={{ __html: sanitizeEmbed(html) }}
      />
    ) : url ? (
      <div className={cn('w-full overflow-hidden rounded-xl', ratio || 'aspect-video')}>
        <iframe
          src={url}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          title={caption || 'Embed'}
        />
      </div>
    ) : null
  ) : null

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <figure>
        <div className={cn('relative', editCtx && 'group/embed')}>
          {embedContent || (
            <div className="w-full flex flex-col items-center justify-center text-stone-400 gap-2 py-12 border-2 border-dashed border-stone-200 rounded-xl">
              <Code className="h-10 w-10 text-stone-300" />
              <span className="text-sm">Paste a URL or embed code</span>
            </div>
          )}

          {/* Admin overlay */}
          {editCtx && !showInput && (
            <div
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/embed:opacity-100 transition-opacity cursor-pointer rounded-xl"
              style={{ background: 'var(--overlay-light)' }}
              onClick={(e) => {
                e.stopPropagation()
                setUrlDraft(url)
                setHtmlDraft(html)
                setInputMode(html ? 'html' : 'url')
                setShowInput(true)
              }}
            >
              {hasContent ? (
                <>
                  <Code className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Edit embed</span>
                  {provider && (
                    <span className="text-white/60 text-xs flex items-center gap-1 ml-2">
                      <ExternalLink className="h-3 w-3" />
                      {provider}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Code className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Add embed</span>
                </>
              )}
            </div>
          )}

          {/* Inline input */}
          {editCtx && showInput && (
            <EmbedInput
              urlValue={urlDraft}
              htmlValue={htmlDraft}
              mode={inputMode}
              onModeChange={setInputMode}
              onUrlChange={setUrlDraft}
              onHtmlChange={setHtmlDraft}
              onSave={handleSave}
              onCancel={() => setShowInput(false)}
              onRemove={() => {
                if (editCtx) {
                  editCtx.saveBlockProp(editCtx.blockIndex, 'url', '')
                  editCtx.saveBlockProp(editCtx.blockIndex, 'html', '')
                }
                setShowInput(false)
              }}
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

/** Inline embed input overlay */
function EmbedInput({
  urlValue,
  htmlValue,
  mode,
  onModeChange,
  onUrlChange,
  onHtmlChange,
  onSave,
  onCancel,
  onRemove,
}: {
  urlValue: string
  htmlValue: string
  mode: 'url' | 'html'
  onModeChange: (m: 'url' | 'html') => void
  onUrlChange: (v: string) => void
  onHtmlChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'url') {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else {
      textareaRef.current?.focus()
    }
  }, [mode])

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6 rounded-xl"
      style={{ background: 'var(--overlay-dark)', backdropFilter: 'blur(4px)', minHeight: 200 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md space-y-3">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-0.5">
          <button
            className={cn('flex-1 text-xs py-1.5 rounded-md transition-colors', mode === 'url' ? 'bg-white/20 text-white font-medium' : 'text-white/50 hover:text-white/70')}
            onClick={() => onModeChange('url')}
          >
            <LinkIcon className="h-3 w-3 inline mr-1" />
            URL
          </button>
          <button
            className={cn('flex-1 text-xs py-1.5 rounded-md transition-colors', mode === 'html' ? 'bg-white/20 text-white font-medium' : 'text-white/50 hover:text-white/70')}
            onClick={() => onModeChange('html')}
          >
            <Code className="h-3 w-3 inline mr-1" />
            HTML code
          </button>
        </div>

        {mode === 'url' ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="url"
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none placeholder:text-white/30 focus:border-white/40 focus:bg-white/15"
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave()
                if (e.key === 'Escape') onCancel()
              }}
            />
            <button onClick={onSave} className="px-3 py-2 rounded-lg bg-white text-stone-800 text-sm font-medium hover:bg-stone-100 transition-colors">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={onCancel} className="px-2 py-2 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              placeholder='<iframe src="..." ...></iframe>'
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 font-mono resize-y min-h-[80px]"
              rows={4}
              value={htmlValue}
              onChange={(e) => onHtmlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onCancel()
              }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={onCancel} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={onSave} className="px-3 py-1.5 rounded-lg bg-white text-stone-800 text-xs font-medium hover:bg-stone-100 transition-colors">
                Save
              </button>
            </div>
          </div>
        )}

        {urlValue && getEmbedProvider(urlValue) && mode === 'url' && (
          <div className="text-xs text-white/50 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Detected: {getEmbedProvider(urlValue)}
          </div>
        )}

        {(urlValue || htmlValue) && (
          <button onClick={onRemove} className="text-xs text-red-300 hover:text-red-200 transition-colors">
            Remove embed
          </button>
        )}
      </div>
    </div>
  )
}

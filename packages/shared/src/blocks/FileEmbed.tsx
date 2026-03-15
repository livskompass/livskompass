import { useState, useRef, useEffect, useContext } from 'react'
import { FileText, Download, Link as LinkIcon, X, Check, ExternalLink, FolderOpen } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock, InlineMediaPickerContext } from '../context'
import { cn } from '../ui/utils'
import { resolveMediaUrl } from '../helpers'

export interface FileEmbedProps {
  url: string
  fileName: string
  caption: string
  showPreview: boolean
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function getFileExtension(url: string): string {
  if (!url) return ''
  const match = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/)
  return match ? match[1].toUpperCase() : ''
}

function isPdf(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url)
}

export function FileEmbed({
  url = '',
  fileName = '',
  caption = '',
  showPreview = true,
  id,
}: FileEmbedProps & { puck?: { isEditing: boolean }; id?: string }) {
  const captionPuck = useInlineEdit('caption', caption, id || '')
  const captionEditCtx = useEditableText('caption', caption)
  const captionEdit = captionPuck || captionEditCtx

  const fileNamePuck = useInlineEdit('fileName', fileName, id || '')
  const fileNameEditCtx = useEditableText('fileName', fileName)
  const fileNameEdit = fileNamePuck || fileNameEditCtx

  const editCtx = useInlineEditBlock()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlDraft, setUrlDraft] = useState(url)

  const ext = getFileExtension(url)
  const resolvedUrl = resolveMediaUrl(url)
  const canPreview = isPdf(url) && showPreview

  const handleSaveUrl = (newUrl: string) => {
    if (editCtx) {
      editCtx.saveBlockProp(editCtx.blockIndex, 'url', newUrl)
      // Auto-set fileName from URL if empty
      if (!fileName && newUrl) {
        const name = newUrl.split('/').pop()?.split('?')[0] || ''
        if (name) editCtx.saveBlockProp(editCtx.blockIndex, 'fileName', name)
      }
    }
    setShowUrlInput(false)
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <figure>
        <div className={cn('relative', editCtx && 'group/file')}>
          {url ? (
            <div className="space-y-3">
              {/* PDF preview */}
              {canPreview && (
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <iframe
                    src={resolvedUrl}
                    className="w-full h-full"
                    title={fileName || 'Document preview'}
                  />
                </div>
              )}

              {/* File card */}
              <a
                href={resolvedUrl}
                download={fileName || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-colors group/download"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center">
                  {ext ? (
                    <span className="text-[10px] font-bold text-stone-500">{ext}</span>
                  ) : (
                    <FileText className="h-5 w-5 text-stone-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    {...editHandlers(fileNameEdit)}
                    className={cn('text-sm font-medium text-stone-700 block truncate', fileNameEdit?.className)}
                  >
                    {fileName || url.split('/').pop()?.split('?')[0] || 'File'}
                  </span>
                  {ext && (
                    <span className="text-xs text-stone-400">{ext} file</span>
                  )}
                </div>
                <Download className="h-4 w-4 text-stone-400 group-hover/download:text-stone-600 transition-colors flex-shrink-0" />
              </a>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-stone-400 gap-2 py-8 border-2 border-dashed border-stone-200 rounded-xl">
              <FileText className="h-10 w-10 text-stone-300" />
              <span className="text-sm">Paste a file URL</span>
            </div>
          )}

          {/* Admin overlay */}
          {editCtx && !showUrlInput && (
            <div
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/file:opacity-100 transition-opacity cursor-pointer rounded-xl"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={(e) => {
                e.stopPropagation()
                setUrlDraft(url)
                setShowUrlInput(true)
              }}
            >
              {url ? (
                <>
                  <FileText className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Change file</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">Add file</span>
                </>
              )}
            </div>
          )}

          {/* Inline URL input */}
          {editCtx && showUrlInput && (
            <FileUrlInput
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

/** Inline URL input overlay for file blocks */
function FileUrlInput({
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
            <span>PDF, document, or other file URL</span>
          </div>
          {mediaPicker && (
            <button
              onClick={() => mediaPicker.requestMediaPick('document', value, (url) => onSave(url))}
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
            placeholder="https://example.com/document.pdf"
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

        {value && getFileExtension(value) && (
          <div className="text-xs text-white/50 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            File type: {getFileExtension(value)}
          </div>
        )}

        {value && (
          <button
            onClick={() => onSave('')}
            className="text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            Remove file
          </button>
        )}
      </div>
    </div>
  )
}

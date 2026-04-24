import { useContext } from 'react'
import { Camera, X } from 'lucide-react'
import { useInlineEditBlock, InlineImagePickerContext } from '../context'
import { resolveMediaUrl } from '../helpers'
import { cn } from '../ui/utils'

interface InlineImageProps {
  /** Current image URL (may be relative /media/... or absolute) */
  src: string
  /** The block prop name to update (e.g. 'image', 'backgroundImage', 'manualCards[0].image') */
  propName: string
  /** Alt text */
  alt?: string
  /** CSS class for the <img> element */
  className?: string
  /** Additional img attributes */
  loading?: 'lazy' | 'eager'
  /** Fallback when no image is set and not in edit mode */
  fallback?: React.ReactNode
  /** Style for the wrapper */
  style?: React.CSSProperties
  /** Whether to show the remove button */
  allowRemove?: boolean
}

/**
 * Image component that supports inline editing when in admin context.
 * Shows a camera overlay on hover — clicking opens the media picker.
 * Falls back to a regular <img> on the public site.
 */
export function InlineImage({
  src,
  propName,
  alt = '',
  className,
  loading = 'lazy',
  fallback,
  style,
  allowRemove = true,
}: InlineImageProps) {
  const editCtx = useInlineEditBlock()
  const pickerCtx = useContext(InlineImagePickerContext)
  const isEditing = !!editCtx && !!pickerCtx

  const resolvedSrc = src ? resolveMediaUrl(src) : ''

  const handlePick = () => {
    if (!editCtx || !pickerCtx) return
    pickerCtx.requestImagePick(src, (newUrl) => {
      editCtx.saveBlockProp(editCtx.blockIndex, propName, newUrl)
    })
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!editCtx) return
    editCtx.saveBlockProp(editCtx.blockIndex, propName, '')
  }

  // Not in edit mode — render plain image
  if (!isEditing) {
    if (!resolvedSrc) return <>{fallback}</> || null
    return <img src={resolvedSrc} alt={alt} loading={loading} className={className} style={style} />
  }

  // Edit mode — render with overlay
  return (
    <div className="relative group/inline-img w-full" style={style}>
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={alt} loading={loading} className={className} />
      ) : (
        <div
          className={cn('flex flex-col items-center justify-center bg-surface-alt border-2 border-dashed border-strong rounded-xl w-full', className)}
          style={{
            minHeight: style?.maxHeight ? undefined : 200,
            aspectRatio: style?.aspectRatio || (style?.maxHeight ? undefined : '4 / 3'),
            height: style?.maxHeight || undefined,
            maxHeight: style?.maxHeight || undefined,
          }}
        >
          <Camera className="h-10 w-10 text-faint mb-2" />
          <span className="text-body-sm font-medium text-faint">Click to add image</span>
        </div>
      )}

      {/* Hover overlay */}
      <button
        type="button"
        onClick={handlePick}
        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/inline-img:bg-black/30 transition-colors cursor-pointer rounded-[inherit]"
      >
        <div className="opacity-0 group-hover/inline-img:opacity-100 transition-opacity bg-surface-elevated rounded-full p-3 shadow-lg">
          <Camera className="h-5 w-5 text-foreground" />
        </div>
      </button>

      {/* Remove button (top-right) */}
      {allowRemove && resolvedSrc && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 opacity-0 group-hover/inline-img:opacity-100 transition-opacity bg-surface-elevated/90 hover:bg-red-50 text-muted hover:text-red-500 rounded-full p-1.5 shadow-md"
          aria-label="Remove image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

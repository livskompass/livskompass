import { cn } from '../ui/utils'
import { ImageIcon } from 'lucide-react'
import { useInlineEdit, useEditableText, useInlineEditBlock } from '../context'
import { InlineImage } from './InlineImage'

export interface ImageBlockProps {
  src: string
  alt: string
  caption: string
  size: 'small' | 'medium' | 'full'
  alignment: 'left' | 'center' | 'right'
  rounded: 'none' | 'small' | 'large'
  link: string
  shadow?: 'none' | 'small' | 'large'
  border?: 'none' | 'thin'
  /** Optional aspect-ratio hint for the empty-state placeholder. */
  aspectRatio?: 'auto' | '21/9' | '16/9' | '4/3' | '1/1'
  /** Hard ceiling on the rendered height. Accepts any CSS length (`25vh`, `280px`, etc.). */
  maxHeight?: string
}

const sizeMap = {
  small: 'max-w-[50%]',
  medium: 'max-w-[75%]',
  full: 'max-w-full',
} as const

const alignmentMap = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

const roundedMap = {
  none: 'rounded-none',
  small: 'rounded-lg',
  large: 'rounded-2xl',
} as const

const shadowMap = {
  none: '',
  small: 'shadow-md',
  large: 'shadow-xl',
} as const

const borderMap = {
  none: '',
  thin: 'border border-default',
} as const

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function ImageBlock({
  src = '',
  alt = '',
  caption = '',
  size = 'full',
  alignment = 'center',
  rounded = 'none',
  link = '',
  shadow = 'none',
  border = 'none',
  aspectRatio = 'auto',
  maxHeight,
  id,
}: ImageBlockProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const captionPuck = useInlineEdit('caption', caption, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const captionEditCtx = useEditableText('caption', caption)
  // Puck takes priority
  const captionEdit = captionPuck || captionEditCtx

  const editCtx = useInlineEditBlock()

  if (!src && !editCtx) {
    return (
      <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
        <div className="py-12 text-center text-faint border-2 border-dashed border-default rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-faint" />
          <p>Choose an image...</p>
        </div>
      </div>
    )
  }

  // When maxHeight or aspectRatio is set, the image fills its wrapper with object-cover.
  // Pass the constraint as `style` to InlineImage — its own wrapper applies it
  // so the inner <img> can fill reliably via h-full.
  const constrained = Boolean(maxHeight) || (aspectRatio && aspectRatio !== 'auto')
  const constraintStyle: React.CSSProperties = {}
  if (aspectRatio && aspectRatio !== 'auto') constraintStyle.aspectRatio = aspectRatio.replace('/', ' / ')
  if (maxHeight) constraintStyle.maxHeight = maxHeight
  const imgClassName = cn(
    'w-full',
    constrained ? 'h-full object-cover' : 'h-auto',
    roundedMap[rounded],
    shadowMap[shadow || 'none'],
    borderMap[border || 'none'],
  )
  const img = (
    <InlineImage
      src={src}
      propName="src"
      alt={alt}
      className={imgClassName}
      style={constrained ? constraintStyle : undefined}
    />
  )

  const wrappedImg = link && !editCtx ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
      {img}
    </a>
  ) : (
    img
  )

  // Only render the figcaption when there's actual caption text. Rendering
  // it in admin with an empty string leaves a blank clickable line below the
  // image that admins mistake for an unknown text block. Captions can still
  // be added via the settings popover if needed.
  const captionBlock = caption ? (
    <figcaption {...editHandlers(captionEdit)} className={cn('mt-2 text-body-sm text-muted text-center', captionEdit?.className)}>
      {caption}
    </figcaption>
  ) : null

  // In banner mode (maxHeight or aspectRatio set), render at full content
  // width (not viewport) — no vertical padding here; Spacer blocks own the
  // section spacing between this block and siblings.
  if (constrained) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
        <figure className={cn('w-full', alignmentMap[alignment])}>
          {wrappedImg}
          {captionBlock}
        </figure>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
      <figure className={cn(sizeMap[size], alignmentMap[alignment])}>
        {wrappedImg}
        {captionBlock}
      </figure>
    </div>
  )
}

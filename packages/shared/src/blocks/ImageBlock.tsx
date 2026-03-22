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

  const img = (
    <InlineImage
      src={src}
      propName="src"
      alt={alt}
      className={cn('w-full h-auto', roundedMap[rounded], shadowMap[shadow || 'none'], borderMap[border || 'none'])}
    />
  )

  const wrappedImg = link && !editCtx ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  ) : (
    img
  )

  return (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--width-content)' }}>
      <figure className={cn(sizeMap[size], alignmentMap[alignment])}>
        {wrappedImg}
        {(caption || captionEdit) && (
          <figcaption {...editHandlers(captionEdit)} className={cn('mt-2 text-body-sm text-muted text-center', captionEdit?.className)}>
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

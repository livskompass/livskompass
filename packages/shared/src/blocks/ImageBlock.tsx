import { cn } from '../ui/utils'
import { ImageIcon } from 'lucide-react'
import { resolveMediaUrl } from '../helpers'

export interface ImageBlockProps {
  src: string
  alt: string
  caption: string
  size: 'small' | 'medium' | 'full'
  alignment: 'left' | 'center' | 'right'
  rounded: 'none' | 'small' | 'large'
  link: string
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

export function ImageBlock({
  src = '',
  alt = '',
  caption = '',
  size = 'full',
  alignment = 'center',
  rounded = 'none',
  link = '',
}: ImageBlockProps) {
  if (!src) {
    return (
      <div className="py-12 text-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
        <p>Välj en bild...</p>
      </div>
    )
  }

  const img = (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      loading="lazy"
      className={cn('w-full h-auto', roundedMap[rounded])}
    />
  )

  const wrappedImg = link ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  ) : (
    img
  )

  return (
    <figure className={cn(sizeMap[size], alignmentMap[alignment])}>
      {wrappedImg}
      {caption && (
        <figcaption className="mt-2 text-sm text-neutral-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

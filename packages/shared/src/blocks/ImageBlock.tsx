import { cn } from '../ui/utils'
import { ImageIcon } from 'lucide-react'

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
      <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>Välj en bild...</p>
      </div>
    )
  }

  const img = (
    <img
      src={src}
      alt={alt}
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
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

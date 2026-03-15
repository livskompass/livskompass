import { useEditableText } from '../context'
import { cn } from '../ui/utils'
import { InlineImage } from './InlineImage'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

export interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; caption: string }>
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
  rounded?: 'none' | 'medium' | 'large'
  lightbox?: boolean
}

const colMap = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }
const gapMap = { small: 'gap-2', medium: 'gap-4', large: 'gap-6' }
const ratioMap = { square: 'aspect-square', landscape: 'aspect-video', portrait: 'aspect-[3/4]', auto: '' }
const roundedMap = { none: 'rounded-none', medium: 'rounded-xl', large: 'rounded-2xl' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function GalleryImage({ img, index, aspectRatio, rounded = 'medium', totalItems }: { img: { src: string; alt: string; caption: string }; index: number; aspectRatio: string; rounded?: 'none' | 'medium' | 'large'; totalItems: number }) {
  const captionEdit = useEditableText(`images[${index}].caption`, img.caption)

  return (
    <ArrayItemControls fieldName="images" itemIndex={index} totalItems={totalItems}>
    <figure className={cn('overflow-hidden', roundedMap[rounded || 'medium'])}>
      <InlineImage
        src={img.src}
        propName={`images[${index}].src`}
        alt={img.alt || ''}
        className={`w-full object-cover ${ratioMap[aspectRatio as keyof typeof ratioMap] || ''}`}
      />
      {(img.caption || captionEdit) && (
        <figcaption {...editHandlers(captionEdit)} className={cn('text-xs text-stone-500 mt-1', captionEdit?.className)}>
          {img.caption}
        </figcaption>
      )}
    </figure>
    </ArrayItemControls>
  )
}

export function ImageGallery({
  images = [],
  columns = 3,
  gap = 'medium',
  aspectRatio = 'landscape',
  rounded = 'medium',
  lightbox: _lightbox = false,
}: ImageGalleryProps) {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {images.length > 0 ? (
        <ArrayDragProvider fieldName="images">
        <div className={`grid ${colMap[columns] || colMap[3]} ${gapMap[gap] || gapMap.medium}`}>
          {images.map((img, i) => (
            <GalleryImage key={i} img={img} index={i} aspectRatio={aspectRatio} rounded={rounded} totalItems={images.length} />
          ))}
        </div>
        </ArrayDragProvider>
      ) : (
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add images in settings
        </div>
      )}
      <AddItemButton fieldName="images" label="Add image" />
    </div>
  )
}

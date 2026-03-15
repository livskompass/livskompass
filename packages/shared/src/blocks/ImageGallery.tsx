import { useEditableText } from '../context'
import { cn } from '../ui/utils'
import { InlineImage } from './InlineImage'
import { ArrayItemControls } from './ArrayItemControls'

export interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; caption: string }>
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
}

const colMap = { 2: 'grid-cols-2', 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' }
const gapMap = { small: 'gap-2', medium: 'gap-4', large: 'gap-6' }
const ratioMap = { square: 'aspect-square', landscape: 'aspect-video', portrait: 'aspect-[3/4]', auto: '' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function GalleryImage({ img, index, aspectRatio, totalItems }: { img: { src: string; alt: string; caption: string }; index: number; aspectRatio: string; totalItems: number }) {
  const captionEdit = useEditableText(`images[${index}].caption`, img.caption)

  return (
    <ArrayItemControls fieldName="images" itemIndex={index} totalItems={totalItems}>
    <figure className="overflow-hidden rounded-xl">
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
}: ImageGalleryProps) {
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {images.length > 0 ? (
        <div className={`grid ${colMap[columns] || colMap[3]} ${gapMap[gap] || gapMap.medium}`}>
          {images.map((img, i) => (
            <GalleryImage key={i} img={img} index={i} aspectRatio={aspectRatio} totalItems={images.length} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add images in settings
        </div>
      )}
    </div>
  )
}

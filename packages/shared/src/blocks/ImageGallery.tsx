import { resolveMediaUrl } from '../helpers'

export interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; caption: string }>
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
}

const colMap = { 2: 'grid-cols-2', 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' }
const gapMap = { small: 'gap-2', medium: 'gap-4', large: 'gap-6' }
const ratioMap = { square: 'aspect-square', landscape: 'aspect-video', portrait: 'aspect-[3/4]', auto: '' }

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
            <figure key={i} className="overflow-hidden rounded-xl">
              <img
                src={resolveMediaUrl(img.src)}
                alt={img.alt || ''}
                loading="lazy"
                className={`w-full object-cover ${ratioMap[aspectRatio] || ''}`}
              />
              {img.caption && <figcaption className="text-xs text-stone-500 mt-1">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Lägg till bilder i inställningarna
        </div>
      )}
    </div>
  )
}

import { cn } from '../ui/utils'
import { useScrollReveal, resolveMediaUrl } from '../helpers'
import { Heart, Star, Shield, Zap, BookOpen, Users, Target, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'
import { getCardColors } from './cardColors'

export interface FeatureGridProps {
  heading: string
  subheading: string
  columns: 2 | 3 | 4
  items: Array<{ icon: string; title: string; description: string }>
  style: 'cards' | 'minimal'
  iconSize?: 'small' | 'medium' | 'large'
  padding?: 'small' | 'medium' | 'large'
  cardColor?: string
}

const iconSizeMap = {
  small: { container: 'w-10 h-10 rounded-lg', icon: 'h-5 w-5' },
  medium: { container: 'w-12 h-12 rounded-xl', icon: 'h-6 w-6' },
  large: { container: 'w-16 h-16 rounded-xl', icon: 'h-8 w-8' },
} as const

const paddingMap = {
  small: 'var(--section-xs)',
  medium: 'var(--section-md)',
  large: 'var(--section-lg)',
} as const

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  star: Star,
  shield: Shield,
  zap: Zap,
  book: BookOpen,
  users: Users,
  target: Target,
  sparkles: Sparkles,
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function FeatureItem({ item, index, style, iconSize = 'medium', totalItems, cardColor }: { item: { icon: string; title: string; description: string; image?: string }; index: number; style: 'cards' | 'minimal'; iconSize?: 'small' | 'medium' | 'large'; totalItems: number; cardColor?: string }) {
  const IconComponent = item.icon ? iconMap[item.icon.toLowerCase()] : null
  const stagger = `reveal reveal-stagger-${Math.min(index + 1, 5)}`
  const titleEdit = useEditableText(`items[${index}].title`, item.title)
  const descEdit = useEditableText(`items[${index}].description`, item.description)
  const iSize = iconSizeMap[iconSize || 'medium']
  const colors = getCardColors(cardColor)
  const hasImage = !!item.image

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    {style === 'cards' ? (
    <div className={cn('group rounded-[16px] overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300', colors.bg, stagger)}>
      {hasImage && (
        <div className="h-[180px] overflow-hidden">
          <img src={resolveMediaUrl(item.image!)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-6">
        {!hasImage && item.icon && IconComponent && (
        <div className={cn(iSize.container, 'flex items-center justify-center mb-4 transition-colors duration-300', cardColor === 'dark' ? 'bg-amber-300/20 group-hover:bg-amber-300/30' : 'bg-forest-50 group-hover:bg-forest-100')}>
          <IconComponent className={cn(iSize.icon, cardColor === 'dark' ? 'text-amber-300' : 'text-forest-600')} />
        </div>
        )}
        <h3 {...editHandlers(titleEdit)} className={cn('font-semibold mb-2 transition-colors', colors.text, titleEdit?.className)}>{item.title}</h3>
        <p {...editHandlers(descEdit)} className={cn('text-sm leading-relaxed', colors.textMuted, descEdit?.className)}>{item.description}</p>
      </div>
    </div>
  ) : (
    <div className={cn('text-center group', stagger)}>
      {hasImage ? (
        <div className="h-[160px] rounded-[12px] overflow-hidden mb-4 mx-auto">
          <img src={resolveMediaUrl(item.image!)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : item.icon && IconComponent ? (
        <div className={cn(iSize.container, 'rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300', cardColor === 'dark' ? 'bg-amber-300/20 group-hover:bg-amber-300/30' : 'bg-forest-50 group-hover:bg-forest-100')}>
          <IconComponent className={cn(iSize.icon, cardColor === 'dark' ? 'text-amber-300' : 'text-forest-600')} />
        </div>
      ) : null}
      <h3 {...editHandlers(titleEdit)} className={cn('font-semibold mb-2 transition-colors', colors.text, titleEdit?.className)}>{item.title}</h3>
      <p {...editHandlers(descEdit)} className={cn('text-sm leading-relaxed', colors.textMuted, descEdit?.className)}>{item.description}</p>
    </div>
  )}
    </ArrayItemControls>
  )
}

export function FeatureGrid({
  heading = '',
  subheading = '',
  columns = 3,
  items = [],
  style = 'cards',
  iconSize = 'medium',
  padding = 'medium',
  cardColor = 'mist',
  id,
}: FeatureGridProps & { puck?: { isEditing: boolean }; id?: string }) {
  const revealRef = useScrollReveal()
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx

  const blockPadding = paddingMap[padding || 'medium']

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: blockPadding }}>
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Add features in settings...
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: blockPadding }}>
      {(heading || subheading || headingEdit || subheadingEdit) && (
        <div className="text-center mb-12 reveal">
          {(heading || headingEdit) && <h2 {...editHandlers(headingEdit)} className={cn('text-h2 text-stone-800 mb-3', headingEdit?.className)}>{heading}</h2>}
          {(subheading || subheadingEdit) && <p {...editHandlers(subheadingEdit)} className={cn('text-lg text-stone-600 max-w-2xl mx-auto', subheadingEdit?.className)}>{subheading}</p>}
        </div>
      )}
      <ArrayDragProvider fieldName="items">
      <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
        {items.map((item, i) => (
          <FeatureItem key={i} item={item} index={i} style={style} iconSize={iconSize} totalItems={items.length} cardColor={cardColor} />
        ))}
      </div>
      </ArrayDragProvider>
      <AddItemButton fieldName="items" label="Add feature" />
    </div>
  )
}

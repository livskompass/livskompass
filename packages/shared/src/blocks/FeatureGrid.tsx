import { cn } from '../ui/utils'
import { useScrollReveal } from '../helpers'
import { Heart, Star, Shield, Zap, BookOpen, Users, Target, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useInlineEdit, useEditableText } from '../context'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

export interface FeatureGridProps {
  heading: string
  subheading: string
  columns: 2 | 3 | 4
  items: Array<{ icon: string; title: string; description: string }>
  style: 'cards' | 'minimal'
  iconSize?: 'small' | 'medium' | 'large'
  padding?: 'small' | 'medium' | 'large'
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

function FeatureItem({ item, index, style, iconSize = 'medium', totalItems }: { item: { icon: string; title: string; description: string }; index: number; style: 'cards' | 'minimal'; iconSize?: 'small' | 'medium' | 'large'; totalItems: number }) {
  const IconComponent = iconMap[item.icon?.toLowerCase()] || Star
  const stagger = `reveal reveal-stagger-${Math.min(index + 1, 5)}`
  const titleEdit = useEditableText(`items[${index}].title`, item.title)
  const descEdit = useEditableText(`items[${index}].description`, item.description)
  const iSize = iconSizeMap[iconSize || 'medium']

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    {style === 'cards' ? (
    <div className={`group bg-white rounded-xl border border-stone-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ${stagger}`}>
      <div className={cn(iSize.container, 'bg-forest-50 group-hover:bg-forest-100 flex items-center justify-center mb-4 transition-colors duration-300')}>
        <IconComponent className={cn(iSize.icon, 'text-forest-600')} />
      </div>
      <h3 {...editHandlers(titleEdit)} className={cn('font-semibold text-stone-800 mb-2 group-hover:text-forest-700 transition-colors', titleEdit?.className)}>{item.title}</h3>
      <p {...editHandlers(descEdit)} className={cn('text-sm text-stone-500 leading-relaxed', descEdit?.className)}>{item.description}</p>
    </div>
  ) : (
    <div className={`text-center group ${stagger}`}>
      <div className={cn(iSize.container, 'rounded-full bg-forest-50 group-hover:bg-forest-100 flex items-center justify-center mx-auto mb-4 transition-colors duration-300')}>
        <IconComponent className={cn(iSize.icon, 'text-forest-600')} />
      </div>
      <h3 {...editHandlers(titleEdit)} className={cn('font-semibold text-stone-800 mb-2 group-hover:text-forest-700 transition-colors', titleEdit?.className)}>{item.title}</h3>
      <p {...editHandlers(descEdit)} className={cn('text-sm text-stone-500 leading-relaxed', descEdit?.className)}>{item.description}</p>
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
          <FeatureItem key={i} item={item} index={i} style={style} iconSize={iconSize} totalItems={items.length} />
        ))}
      </div>
      </ArrayDragProvider>
      <AddItemButton fieldName="items" label="Add feature" />
    </div>
  )
}

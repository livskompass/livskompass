import { cn } from '../ui/utils'
import { useEditableText } from '../context'
import { ArrayItemControls, AddItemButton } from './ArrayItemControls'

export interface NavigationMenuProps {
  items: Array<{ label: string; link: string }>
  layout: 'horizontal' | 'vertical'
  style: 'pills' | 'underline' | 'buttons' | 'minimal'
  alignment: 'left' | 'center' | 'right'
}

const alignMap = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

const styleMap: Record<string, string> = {
  pills: 'px-4 py-2 rounded-full bg-stone-100 text-stone-700 hover:bg-forest-50 hover:text-forest-600 font-medium text-sm transition-colors',
  underline: 'px-3 py-2 border-b-2 border-transparent hover:border-forest-500 text-stone-700 hover:text-forest-600 font-medium text-sm transition-colors',
  buttons: 'px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-forest-50 hover:border-forest-300 hover:text-forest-600 font-medium text-sm transition-colors',
  minimal: 'px-2 py-1 text-stone-600 hover:text-forest-600 font-medium text-sm transition-colors',
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function NavItem({ item, index, style, totalItems }: { item: { label: string; link: string }; index: number; style: string; totalItems: number }) {
  const labelEdit = useEditableText(`items[${index}].label`, item.label)

  return (
    <ArrayItemControls fieldName="items" itemIndex={index} totalItems={totalItems}>
    <a href={item.link || '#'} className={styleMap[style] || styleMap.pills}>
      <span {...editHandlers(labelEdit)} className={labelEdit?.className}>{item.label}</span>
    </a>
    </ArrayItemControls>
  )
}

export function NavigationMenu({
  items = [],
  layout = 'horizontal',
  style = 'pills',
  alignment = 'center',
}: NavigationMenuProps) {
  const menuItems = items || []
  const isVertical = layout === 'vertical'

  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-sm)' }}>
      <nav>
        <div className={cn(
          'flex',
          isVertical ? 'flex-col gap-1' : `flex-wrap gap-2 ${alignMap[alignment] || 'justify-center'}`
        )}>
          {menuItems.map((item, i) => (
            <NavItem key={i} item={item} index={i} style={style} totalItems={menuItems.length} />
          ))}
          {menuItems.length === 0 && (
            <span className="text-stone-400 text-sm">Add menu items in settings</span>
          )}
        </div>
        <AddItemButton fieldName="items" label="Add menu item" />
      </nav>
    </div>
  )
}

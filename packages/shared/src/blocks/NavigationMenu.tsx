import { cn } from '../ui/utils'

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
            <a key={i} href={item.link || '#'} className={styleMap[style] || styleMap.pills}>
              {item.label}
            </a>
          ))}
          {menuItems.length === 0 && (
            <span className="text-stone-400 text-sm">Lägg till menyalternativ i inställningarna</span>
          )}
        </div>
      </nav>
    </div>
  )
}

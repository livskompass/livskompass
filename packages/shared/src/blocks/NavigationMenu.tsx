import { cn } from '../ui/utils'

export interface NavigationMenuProps {
  items: Array<{ label: string; link: string }>
  layout: 'horizontal' | 'vertical'
  style: 'pills' | 'underline' | 'buttons' | 'minimal'
  alignment: 'left' | 'center' | 'right'
}

const alignMap = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

const styleMap: Record<string, string> = {
  pills: 'px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 font-medium text-sm transition-colors',
  underline: 'px-3 py-2 border-b-2 border-transparent hover:border-primary-500 text-neutral-700 hover:text-primary-600 font-medium text-sm transition-colors',
  buttons: 'px-4 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 font-medium text-sm transition-colors',
  minimal: 'px-2 py-1 text-neutral-600 hover:text-primary-600 font-medium text-sm transition-colors',
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <span className="text-neutral-400 text-sm">Lägg till menyalternativ i inställningarna</span>
          )}
        </div>
      </nav>
    </div>
  )
}

import { DropZone } from '@puckeditor/core'
import { cn } from '../ui/utils'

export interface ColumnsProps {
  layout: '50-50' | '33-33-33' | '66-33' | '33-66'
  gap: 'small' | 'medium' | 'large'
  verticalAlignment: 'top' | 'center' | 'bottom'
  stackOnMobile: boolean
}

const gapMap = {
  small: 'gap-4',
  medium: 'gap-8',
  large: 'gap-12',
} as const

const verticalAlignMap = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
} as const

const layoutGridMap: Record<string, string> = {
  '50-50': 'md:grid-cols-2',
  '33-33-33': 'md:grid-cols-3',
  '66-33': 'md:grid-cols-[2fr_1fr]',
  '33-66': 'md:grid-cols-[1fr_2fr]',
}

function isThreeColumn(layout: string) {
  return layout === '33-33-33'
}

export function Columns({
  layout = '50-50',
  gap = 'medium',
  verticalAlignment = 'top',
}: ColumnsProps) {
  const threeCol = isThreeColumn(layout)

  return (
    <div
      className={cn(
        'grid grid-cols-1',
        layoutGridMap[layout] || layoutGridMap['50-50'],
        gapMap[gap],
        verticalAlignMap[verticalAlignment]
      )}
    >
      <div className="min-h-[60px]">
        <DropZone zone="column-1" disallow={['Columns']} />
      </div>
      <div className="min-h-[60px]">
        <DropZone zone="column-2" disallow={['Columns']} />
      </div>
      {threeCol && (
        <div className="min-h-[60px]">
          <DropZone zone="column-3" disallow={['Columns']} />
        </div>
      )}
    </div>
  )
}

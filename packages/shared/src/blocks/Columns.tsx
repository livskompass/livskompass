import React, { createContext, useContext } from 'react'
import { cn } from '../ui/utils'

export interface ColumnsProps {
  layout: '50-50' | '33-33-33' | '66-33' | '33-66'
  gap: 'small' | 'medium' | 'large'
  verticalAlignment: 'top' | 'center' | 'bottom'
  stackOnMobile: boolean
  id?: string
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

/**
 * Context for rendering zone content.
 * PuckRenderer (web) provides a function that resolves zone data from the Puck JSON.
 * The Puck editor (admin) overrides Columns with a DropZone-based version instead.
 */
export const ZoneRenderContext = createContext<((zoneId: string) => React.ReactNode) | null>(null)

export function Columns({
  layout = '50-50',
  gap = 'medium',
  verticalAlignment = 'top',
  id,
}: ColumnsProps) {
  const renderZone = useContext(ZoneRenderContext)
  const threeCol = layout === '33-33-33'

  return (
    <div
      className={cn(
        'grid grid-cols-1 mx-auto',
        layoutGridMap[layout] || layoutGridMap['50-50'],
        gapMap[gap],
        verticalAlignMap[verticalAlignment]
      )}
      style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}
    >
      <div className="min-h-[60px]">
        {renderZone?.(`${id}:column-1`)}
      </div>
      <div className="min-h-[60px]">
        {renderZone?.(`${id}:column-2`)}
      </div>
      {threeCol && (
        <div className="min-h-[60px]">
          {renderZone?.(`${id}:column-3`)}
        </div>
      )}
    </div>
  )
}

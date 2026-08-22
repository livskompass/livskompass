import React, { createContext, useContext } from 'react'
import { cn } from '../ui/utils'
import { useInlineEditBlock } from '../context'
import { ArrayDragProvider, ArrayItemControls } from './ArrayItemControls'

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

/**
 * Signal that a block is being rendered inside a column. Blocks use this to
 * skip their own full-width / max-width / section-padding wrappers, since the
 * parent Columns component already provides container-level layout.
 */
export const InColumnContext = createContext<boolean>(false)

export function useInColumn(): boolean {
  return useContext(InColumnContext)
}

export function Columns({
  layout = '50-50',
  gap = 'medium',
  verticalAlignment = 'top',
  id,
}: ColumnsProps) {
  const renderZone = useContext(ZoneRenderContext)
  const editCtx = useInlineEditBlock()
  const threeCol = layout === '33-33-33'
  const count = threeCol ? 3 : 2

  // Admin editor provides reorderColumns — enables drag-to-reorder whole columns
  const canReorder = !!(editCtx?.reorderColumns && id)
  const onMove = canReorder
    ? (from: number, to: number) => editCtx!.reorderColumns!(id!, from, to)
    : undefined

  const columns = Array.from({ length: count }, (_, i) => {
    const cell = (
      <div key={i} className="min-h-[60px]">
        {renderZone?.(`${id}:column-${i + 1}`)}
      </div>
    )
    if (!onMove) return cell
    return (
      <ArrayItemControls key={i} fieldName="__columns" itemIndex={i} totalItems={count} onMove={onMove}>
        {cell}
      </ArrayItemControls>
    )
  })

  return (
    <InColumnContext.Provider value={true}>
      <div
        className={cn(
          'grid grid-cols-1 mx-auto',
          layoutGridMap[layout] || layoutGridMap['50-50'],
          gapMap[gap],
          verticalAlignMap[verticalAlignment]
        )}
        style={{
          maxWidth: 'var(--width-content)',
          paddingInline: 'var(--container-px)',
        }}
      >
        {onMove ? (
          <ArrayDragProvider fieldName="__columns" onMove={onMove} horizontal>
            {columns}
          </ArrayDragProvider>
        ) : (
          columns
        )}
      </div>
    </InColumnContext.Provider>
  )
}

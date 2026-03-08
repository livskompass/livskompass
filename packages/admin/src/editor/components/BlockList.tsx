import React, { useCallback, useRef } from 'react'
import { puckConfig } from '@livskompass/shared'
import { useEditor } from '../context'
import { BlockInserter } from './BlockInserter'

interface PuckItem {
  type: string
  props: Record<string, any>
}

const components = puckConfig.components as Record<
  string,
  { render: React.FC<any>; label?: string }
>

export function BlockList() {
  const { state, hoverBlock, selectBlock } = useEditor()
  const { puckData, hoveredBlockId, selectedBlockId } = state
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const items = puckData?.content || []

  const handleMouseEnter = useCallback(
    (blockId: string) => {
      hoverBlock(blockId)
    },
    [hoverBlock],
  )

  const handleMouseLeave = useCallback(() => {
    hoverBlock(null)
  }, [hoverBlock])

  const handleClick = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      selectBlock(blockId)
    },
    [selectBlock],
  )

  const handleDeselectAll = useCallback(() => {
    selectBlock(null)
  }, [selectBlock])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-400">
        <p className="text-lg font-medium mb-2">No content yet</p>
        <p className="text-sm">Add your first block to get started</p>
      </div>
    )
  }

  return (
    <div onClick={handleDeselectAll}>
      {/* Insert point before first block */}
      <BlockInserter insertIndex={0} />

      {items.map((item: PuckItem, index: number) => {
        const comp = components[item.type]
        if (!comp?.render) return null

        const Fn = comp.render
        const blockId = item.props?.id || `${item.type}-${index}`
        const isHovered = hoveredBlockId === blockId
        const isSelected = selectedBlockId === blockId
        const label = comp.label || item.type

        return (
          <React.Fragment key={blockId}>
            <div
              ref={(el) => {
                if (el) blockRefs.current.set(blockId, el)
                else blockRefs.current.delete(blockId)
              }}
              className="relative transition-all"
              style={{
                outline: isSelected
                  ? `2px solid var(--editor-blue)`
                  : isHovered
                    ? '1px dashed rgba(0, 0, 0, 0.15)'
                    : 'none',
                outlineOffset: isSelected ? '2px' : '0',
                transition: 'outline var(--editor-duration-fast, 150ms) var(--editor-ease, ease)',
              }}
              onMouseEnter={() => handleMouseEnter(blockId)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(blockId, e)}
            >
              {/* Block type label — shown on hover */}
              {(isHovered || isSelected) && (
                <div
                  className="absolute -top-6 right-2 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide pointer-events-none"
                  style={{
                    color: isSelected ? 'var(--editor-blue)' : '#9CA3AF',
                    background: isSelected ? 'var(--editor-blue-lightest)' : '#F9FAFB',
                    border: `1px solid ${isSelected ? 'var(--editor-blue-light)' : '#E5E7EB'}`,
                    zIndex: 'var(--z-editor-block-selected)',
                  }}
                >
                  {label}
                </div>
              )}

              <Fn {...item.props} />
            </div>

            {/* Insert point after each block */}
            <BlockInserter insertIndex={index + 1} />
          </React.Fragment>
        )
      })}
    </div>
  )
}

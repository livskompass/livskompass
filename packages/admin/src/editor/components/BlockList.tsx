import React, { useCallback } from 'react'
import { puckConfig } from '@livskompass/shared'
import { useEditor } from '../context'
import { useEditorSelection } from '../hooks/useEditorSelection'
import { EditableBlock } from './EditableBlock'
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
  const { state } = useEditor()
  const { selectBlock } = useEditorSelection()
  const { puckData } = state

  const items = puckData?.content || []

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
        const label = comp.label || item.type

        return (
          <React.Fragment key={blockId}>
            <EditableBlock
              blockId={blockId}
              blockType={item.type}
              blockLabel={label}
              blockIndex={index}
            >
              <Fn {...item.props} />
            </EditableBlock>

            {/* Insert point after each block */}
            <BlockInserter insertIndex={index + 1} />
          </React.Fragment>
        )
      })}
    </div>
  )
}

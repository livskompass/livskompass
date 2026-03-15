import { useCallback } from 'react'
import { InlineArrayOpsContext, puckConfig } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'

/**
 * Provides InlineArrayOpsContext to all blocks rendered inside the editor.
 * Enables inline add/remove/reorder of array items on the canvas.
 */
export function InlineArrayOpsProvider({ children }: { children: React.ReactNode }) {
  const { state, updateData } = useEditor()

  const addItem = useCallback(
    (blockIndex: number, fieldName: string) => {
      if (!state.puckData) return
      const content = [...state.puckData.content]
      if (blockIndex < 0 || blockIndex >= content.length) return
      const block = content[blockIndex]
      if (!block) return

      const items = [...(block.props?.[fieldName] || [])]

      // Create a new item with default values based on the block's field config
      const blockConfig = (puckConfig.components as any)[block.type]
      const arrayField = blockConfig?.fields?.[fieldName]
      const newItem: Record<string, any> = {}
      if (arrayField?.arrayFields) {
        for (const [k, f] of Object.entries(arrayField.arrayFields as Record<string, { type: string }>)) {
          if (f.type === 'number') newItem[k] = 0
          else if (f.type === 'select' || f.type === 'radio') newItem[k] = ''
          else newItem[k] = ''
        }
      }
      // Fallback: copy structure from last item if available
      if (items.length > 0 && Object.keys(newItem).length === 0) {
        const template = items[items.length - 1]
        for (const k of Object.keys(template)) {
          newItem[k] = typeof template[k] === 'string' ? '' : template[k]
        }
      }

      items.push(newItem)

      content[blockIndex] = {
        ...block,
        props: { ...block.props, [fieldName]: items },
      }
      updateData({ ...state.puckData, content } as Data)
    },
    [state.puckData, updateData],
  )

  const removeItem = useCallback(
    (blockIndex: number, fieldName: string, itemIndex: number) => {
      if (!state.puckData) return
      const content = [...state.puckData.content]
      if (blockIndex < 0 || blockIndex >= content.length) return
      const block = content[blockIndex]
      if (!block) return

      const items = [...(block.props?.[fieldName] || [])]
      if (itemIndex < 0 || itemIndex >= items.length) return
      items.splice(itemIndex, 1)

      content[blockIndex] = {
        ...block,
        props: { ...block.props, [fieldName]: items },
      }
      updateData({ ...state.puckData, content } as Data)
    },
    [state.puckData, updateData],
  )

  const moveItem = useCallback(
    (blockIndex: number, fieldName: string, fromIndex: number, toIndex: number) => {
      if (!state.puckData) return
      const content = [...state.puckData.content]
      if (blockIndex < 0 || blockIndex >= content.length) return
      const block = content[blockIndex]
      if (!block) return

      const items = [...(block.props?.[fieldName] || [])]
      if (fromIndex < 0 || fromIndex >= items.length) return
      if (toIndex < 0 || toIndex >= items.length) return

      const [moved] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, moved)

      content[blockIndex] = {
        ...block,
        props: { ...block.props, [fieldName]: items },
      }
      updateData({ ...state.puckData, content } as Data)
    },
    [state.puckData, updateData],
  )

  return (
    <InlineArrayOpsContext.Provider value={{ addItem, removeItem, moveItem }}>
      {children}
    </InlineArrayOpsContext.Provider>
  )
}

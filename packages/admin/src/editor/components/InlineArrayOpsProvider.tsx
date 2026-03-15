import { useCallback } from 'react'
import { InlineArrayOpsContext } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'

/**
 * Provides InlineArrayOpsContext to all blocks rendered inside the editor.
 * Enables inline remove/reorder of array items on the canvas.
 */
export function InlineArrayOpsProvider({ children }: { children: React.ReactNode }) {
  const { state, updateData } = useEditor()

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
    <InlineArrayOpsContext.Provider value={{ removeItem, moveItem }}>
      {children}
    </InlineArrayOpsContext.Provider>
  )
}

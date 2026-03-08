import { useCallback, useEffect } from 'react'
import { useEditor } from '../context'

/**
 * Selection hook — manages block selection with keyboard support.
 * - Click to select
 * - Click outside to deselect
 * - ESC to deselect
 * - Tab / Shift+Tab to cycle blocks
 */
export function useEditorSelection() {
  const { selectBlock, exitEdit, state } = useEditor()
  const { selectedBlockId, puckData, editingBlockId } = state

  const blockIds = (puckData?.content || []).map(
    (item: any, i: number) => item.props?.id || `${item.type}-${i}`,
  )

  const selectByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < blockIds.length) {
        selectBlock(blockIds[index])
      }
    },
    [blockIds, selectBlock],
  )

  // Keyboard handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture keys when editing a field (contentEditable, input, textarea)
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        if (e.key === 'Escape') {
          exitEdit()
          e.preventDefault()
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          if (editingBlockId) {
            exitEdit()
          } else if (selectedBlockId) {
            selectBlock(null)
          }
          e.preventDefault()
          break

        case 'Tab': {
          if (blockIds.length === 0) break
          e.preventDefault()
          const currentIndex = selectedBlockId
            ? blockIds.indexOf(selectedBlockId)
            : -1

          if (e.shiftKey) {
            // Previous block
            const prev = currentIndex <= 0 ? blockIds.length - 1 : currentIndex - 1
            selectByIndex(prev)
          } else {
            // Next block
            const next = currentIndex >= blockIds.length - 1 ? 0 : currentIndex + 1
            selectByIndex(next)
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockId, editingBlockId, blockIds, selectBlock, exitEdit, selectByIndex])

  return {
    selectedBlockId,
    selectBlock,
  }
}

import { useCallback } from 'react'
import { useEditor } from '../context'

/**
 * Editing mode hook — tracks which block and field is being inline-edited.
 */
export function useEditingMode() {
  const { enterEdit, exitEdit, state } = useEditor()

  const startEditing = useCallback(
    (blockId: string, field: string) => {
      enterEdit(blockId, field)
    },
    [enterEdit],
  )

  const stopEditing = useCallback(() => {
    exitEdit()
  }, [exitEdit])

  return {
    editingBlockId: state.editingBlockId,
    editingField: state.editingField,
    isEditing: state.editingBlockId !== null,
    startEditing,
    stopEditing,
  }
}

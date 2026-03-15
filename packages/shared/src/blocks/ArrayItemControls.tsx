import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { useInlineEditBlock, InlineArrayOpsContext } from '../context'

// ── Array drag-and-drop context ──

interface ArrayDragState {
  /** Index of the item being dragged */
  sourceIndex: number
}

interface ArrayDragContextValue {
  /** The array field name this drag context is for */
  fieldName: string
  dragState: ArrayDragState | null
  /** Index where the drop indicator should show (-1 = none, 0 = before first, n = after nth) */
  dropTargetIndex: number
  onDragStart: (itemIndex: number, e: React.DragEvent) => void
  onDragOver: (itemIndex: number, e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
}

const ArrayDragCtx = createContext<ArrayDragContextValue | null>(null)

const ARRAY_DRAG_TYPE = 'application/x-array-item-drag'

/**
 * Wrap around a list/grid of ArrayItemControls items to enable drag-to-reorder.
 * This provides shared drag state so items can coordinate drop indicators.
 */
export function ArrayDragProvider({
  children,
  fieldName,
}: {
  children: React.ReactNode
  fieldName: string
}) {
  const editCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)
  const [dragState, setDragState] = useState<ArrayDragState | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(-1)
  const dragCounterRef = useRef(0)

  const onDragStart = useCallback(
    (itemIndex: number, e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData(ARRAY_DRAG_TYPE, JSON.stringify({ fieldName, index: itemIndex }))
      // Use a tiny transparent image as default drag image (we style the source instead)
      const img = new Image()
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      e.dataTransfer.setDragImage(img, 0, 0)
      setDragState({ sourceIndex: itemIndex })
      dragCounterRef.current = 0
    },
    [fieldName],
  )

  const onDragOver = useCallback(
    (itemIndex: number, e: React.DragEvent) => {
      if (!dragState) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      // Determine drop position based on cursor Y relative to element midpoint
      const rect = e.currentTarget.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const insertBefore = e.clientY < midY

      const targetIdx = insertBefore ? itemIndex : itemIndex + 1

      // Don't show indicator at source position or immediately after it (no-op positions)
      if (targetIdx === dragState.sourceIndex || targetIdx === dragState.sourceIndex + 1) {
        setDropTargetIndex(-1)
      } else {
        setDropTargetIndex(targetIdx)
      }
    },
    [dragState],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!dragState || !editCtx || !arrayOps || dropTargetIndex < 0) {
        setDragState(null)
        setDropTargetIndex(-1)
        return
      }

      const fromIndex = dragState.sourceIndex
      // Calculate effective toIndex: if dropping after the source, adjust for removal
      let toIndex = dropTargetIndex
      if (toIndex > fromIndex) toIndex -= 1

      if (toIndex !== fromIndex && toIndex >= 0) {
        arrayOps.moveItem(editCtx.blockIndex, fieldName, fromIndex, toIndex)
      }

      setDragState(null)
      setDropTargetIndex(-1)
    },
    [dragState, dropTargetIndex, editCtx, arrayOps, fieldName],
  )

  const onDragEnd = useCallback(() => {
    setDragState(null)
    setDropTargetIndex(-1)
    dragCounterRef.current = 0
  }, [])

  // On public site, just render children without drag context
  if (!editCtx || !arrayOps) return <>{children}</>

  return (
    <ArrayDragCtx.Provider
      value={{ fieldName, dragState, dropTargetIndex, onDragStart, onDragOver, onDrop, onDragEnd }}
    >
      {children}
    </ArrayDragCtx.Provider>
  )
}

// ── Drop indicator line ──

function DropIndicator() {
  return (
    <div className="relative h-0 z-20 pointer-events-none">
      <div className="absolute left-0 right-0 -top-px flex items-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 shrink-0" />
        <div className="flex-1 h-0.5 bg-blue-500" />
        <div className="w-2 h-2 rounded-full bg-blue-500 -mr-1 shrink-0" />
      </div>
    </div>
  )
}

// ── ArrayItemControls ──

interface ArrayItemControlsProps {
  /** The array field name (e.g. 'items', 'manualCards') */
  fieldName: string
  /** Index of this item in the array */
  itemIndex: number
  /** Total number of items in the array */
  totalItems: number
  children: React.ReactNode
}

/**
 * Wraps an array item with hover-to-reveal controls (drag handle, remove, move up/down).
 * Only shows controls in admin mode. On public site, renders children directly.
 */
export function ArrayItemControls({ fieldName, itemIndex, totalItems, children }: ArrayItemControlsProps) {
  const editCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)
  const dragCtx = useContext(ArrayDragCtx)

  // On public site, just render children
  if (!editCtx || !arrayOps) return <>{children}</>

  const { blockIndex } = editCtx
  const canMoveUp = itemIndex > 0
  const canMoveDown = itemIndex < totalItems - 1

  const isDragSource = dragCtx?.dragState?.sourceIndex === itemIndex && dragCtx?.fieldName === fieldName
  const showDropBefore = dragCtx?.dropTargetIndex === itemIndex
  const showDropAfter = dragCtx?.dropTargetIndex === itemIndex + 1 && itemIndex === totalItems - 1

  return (
    <>
      {showDropBefore && <DropIndicator />}
      <div
        className={`relative group/array-item transition-opacity duration-150 ${isDragSource ? 'opacity-30 scale-[0.97]' : ''}`}
        onDragOver={
          dragCtx
            ? (e: React.DragEvent) => dragCtx.onDragOver(itemIndex, e)
            : undefined
        }
        onDrop={
          dragCtx
            ? (e: React.DragEvent) => dragCtx.onDrop(e)
            : undefined
        }
      >
        {children}

        {/* Drag handle — left side, visible on hover */}
        {dragCtx && (
          <div
            className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/array-item:opacity-100 transition-opacity z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              draggable
              onDragStart={(e: React.DragEvent) => dragCtx.onDragStart(itemIndex, e)}
              onDragEnd={() => dragCtx.onDragEnd()}
              className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          </div>
        )}

        {/* Item controls — right side, visible on hover */}
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover/array-item:opacity-100 transition-opacity z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {canMoveUp && (
            <button
              onClick={() => arrayOps.moveItem(blockIndex, fieldName, itemIndex, itemIndex - 1)}
              className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors"
              aria-label="Move up"
              title="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={() => arrayOps.moveItem(blockIndex, fieldName, itemIndex, itemIndex + 1)}
              className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors"
              aria-label="Move down"
              title="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => arrayOps.removeItem(blockIndex, fieldName, itemIndex)}
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition-colors"
            aria-label={`Remove item ${itemIndex + 1}`}
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {showDropAfter && <DropIndicator />}
    </>
  )
}

/**
 * "Add item" button shown at the bottom of an array block.
 * Only renders in admin mode.
 */
export function AddItemButton({ fieldName, label = 'Add item' }: { fieldName: string; label?: string }) {
  const editCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)

  if (!editCtx || !arrayOps) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        arrayOps.addItem(editCtx.blockIndex, fieldName)
      }}
      className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-2 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 text-sm font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

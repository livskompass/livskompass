import { useContext } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useInlineEditBlock, InlineArrayOpsContext } from '../context'

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
 * Wraps an array item with hover-to-reveal controls (remove, move up/down).
 * Only shows controls in admin mode. On public site, renders children directly.
 */
export function ArrayItemControls({ fieldName, itemIndex, totalItems, children }: ArrayItemControlsProps) {
  const editCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)

  // On public site, just render children
  if (!editCtx || !arrayOps) return <>{children}</>

  const { blockIndex } = editCtx
  const canMoveUp = itemIndex > 0
  const canMoveDown = itemIndex < totalItems - 1

  return (
    <div className="relative group/array-item">
      {children}

      {/* Item controls — visible on hover */}
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

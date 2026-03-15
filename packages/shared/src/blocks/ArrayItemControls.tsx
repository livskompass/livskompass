import { useContext } from 'react'
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
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

      {/* Hover controls */}
      <div
        className="absolute -right-1 top-1 flex flex-col gap-0.5 opacity-0 group-hover/array-item:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {canMoveUp && (
          <button
            onClick={() => arrayOps.moveItem(blockIndex, fieldName, itemIndex, itemIndex - 1)}
            className="flex items-center justify-center w-5 h-5 rounded bg-white/90 border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-white shadow-sm transition-colors"
            aria-label="Move up"
            title="Move up"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        )}
        {canMoveDown && (
          <button
            onClick={() => arrayOps.moveItem(blockIndex, fieldName, itemIndex, itemIndex + 1)}
            className="flex items-center justify-center w-5 h-5 rounded bg-white/90 border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-white shadow-sm transition-colors"
            aria-label="Move down"
            title="Move down"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={() => arrayOps.removeItem(blockIndex, fieldName, itemIndex)}
          className="flex items-center justify-center w-5 h-5 rounded bg-white/90 border border-stone-200 text-stone-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition-colors"
          aria-label={`Remove item ${itemIndex + 1}`}
          title="Remove"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

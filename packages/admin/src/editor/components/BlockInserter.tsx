import { useState } from 'react'
import { Plus } from 'lucide-react'

interface BlockInserterProps {
  insertIndex: number
}

/**
 * Phase 1: Visual inserter line between blocks.
 * Shows a "+" button on hover. Full block picker UI comes in a later phase.
 */
export function BlockInserter({ insertIndex }: BlockInserterProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-insert-index={insertIndex}
    >
      {/* Hover line */}
      <div
        className="h-px mx-8 transition-all"
        style={{
          background: isHovered ? 'var(--editor-blue)' : 'transparent',
          transitionDuration: 'var(--editor-duration-fast, 150ms)',
        }}
      />

      {/* Center plus button */}
      {isHovered && (
        <button
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-transform"
          style={{
            background: 'var(--editor-blue)',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            animation: 'scale-in 150ms var(--ease-out, ease) forwards',
          }}
          onClick={(e) => {
            e.stopPropagation()
            // TODO Phase 5: Open block picker modal
            console.log('Insert block at index', insertIndex)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

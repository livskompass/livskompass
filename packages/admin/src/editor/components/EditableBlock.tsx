import { useCallback, useRef, type ReactNode } from 'react'
import { useHoverIntent } from '../hooks/useHoverIntent'
import { useEditor } from '../context'

interface EditableBlockProps {
  blockId: string
  blockType: string
  blockLabel: string
  blockIndex: number
  children: ReactNode
}

/**
 * Wraps each block with hover/select/edit state visuals.
 * Does NOT modify the block's own DOM — only adds surrounding overlays.
 *
 * States:
 * - View:     no styles (page looks like production)
 * - Hover:    dashed outline, block label badge
 * - Selected: solid blue outline, blue label badge
 * - Editing:  selection ring at 50% opacity (text takes focus)
 */
export function EditableBlock({
  blockId,
  blockType,
  blockLabel,
  blockIndex,
  children,
}: EditableBlockProps) {
  const { state, selectBlock } = useEditor()
  const { onMouseEnter, onMouseLeave, onMouseMove } = useHoverIntent()
  const blockRef = useRef<HTMLDivElement>(null)

  const isHovered = state.hoveredBlockId === blockId
  const isSelected = state.selectedBlockId === blockId
  const isEditing = state.editingBlockId === blockId

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't select if clicking on a contentEditable element
      const target = e.target as HTMLElement
      if (target.isContentEditable) return

      e.stopPropagation()
      selectBlock(blockId)
    },
    [blockId, selectBlock],
  )

  // Compute outline style based on state
  let outlineStyle: React.CSSProperties = {}
  if (isEditing) {
    outlineStyle = {
      outline: '2px solid var(--editor-blue)',
      outlineOffset: '2px',
      opacity: undefined, // block content visible
    }
  } else if (isSelected) {
    outlineStyle = {
      outline: '2px solid var(--editor-blue)',
      outlineOffset: '2px',
    }
  } else if (isHovered) {
    outlineStyle = {
      outline: '1px dashed rgba(0, 0, 0, 0.15)',
      outlineOffset: '0px',
    }
  }

  return (
    <div
      ref={blockRef}
      className="relative"
      style={{
        ...outlineStyle,
        transition: 'outline var(--editor-duration-fast, 150ms) var(--editor-ease, ease)',
        cursor: isSelected ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => onMouseEnter(blockId, e)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={handleClick}
      data-block-id={blockId}
      data-block-type={blockType}
      data-block-index={blockIndex}
    >
      {/* Block type label — outside the block, top-right */}
      {(isHovered || isSelected) && !isEditing && (
        <div
          className="absolute -top-6 right-2 px-2 py-0.5 rounded pointer-events-none select-none"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isSelected ? 'var(--editor-blue)' : '#9CA3AF',
            background: isSelected ? 'var(--editor-blue-lightest)' : '#F9FAFB',
            border: `1px solid ${isSelected ? 'var(--editor-blue-light)' : '#E5E7EB'}`,
            zIndex: 'var(--z-editor-block-selected, 20)',
            animation: 'scale-in 150ms var(--ease-out, ease) forwards',
          }}
        >
          {blockLabel}
        </div>
      )}

      {/* Inner glow on selection */}
      {isSelected && !isEditing && (
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(37, 99, 235, 0.1)',
            zIndex: 1,
          }}
        />
      )}

      {children}
    </div>
  )
}

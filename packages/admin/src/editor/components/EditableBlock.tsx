import { useCallback, useRef, type ReactNode } from 'react'
import { GripVertical, Pencil, ExternalLink } from 'lucide-react'
import { getEditingSurface } from '@livskompass/shared'
import { useHoverIntent } from '../hooks/useHoverIntent'
import { useEditor } from '../context'

interface EditableBlockProps {
  blockId: string
  blockType: string
  blockLabel: string
  blockIndex: number
  children: ReactNode
  onDragStart?: (blockIndex: number, e: React.PointerEvent) => void
  isDragSource?: boolean
}

/**
 * Wraps each block with hover/select/edit state visuals.
 * Does NOT modify the block's own DOM — only adds surrounding overlays.
 *
 * States:
 * - View:     no styles (page looks like production)
 * - Hover:    dashed outline, block label badge, drag handle
 * - Selected: solid blue outline, blue label badge, drag handle
 * - Editing:  selection ring at 50% opacity (text takes focus)
 * - Dragging: hidden (replaced by ghost + placeholder)
 */
export function EditableBlock({
  blockId,
  blockType,
  blockLabel,
  blockIndex,
  children,
  onDragStart,
  isDragSource,
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Don't intercept if inside an input or contentEditable
        const target = e.target as HTMLElement
        if (target !== blockRef.current) return
        e.preventDefault()
        selectBlock(blockId)
      } else if (e.key === 'Escape' && isSelected) {
        e.stopPropagation()
        selectBlock(null)
      }
    },
    [blockId, isSelected, selectBlock],
  )

  // Compute outline style based on state
  let outlineStyle: React.CSSProperties = {}
  if (isEditing) {
    outlineStyle = {
      outline: '2px solid var(--editor-blue)',
      outlineOffset: '2px',
    }
  } else if (isSelected) {
    outlineStyle = {
      outline: '2px solid var(--editor-blue)',
      outlineOffset: '2px',
    }
  } else if (isHovered) {
    outlineStyle = {
      outline: '1px dashed var(--editor-border-strong)',
      outlineOffset: '0px',
    }
  }

  // When another block is selected, suppress badge + handle on hover — only show dashed outline
  const anotherBlockSelected = !!state.selectedBlockId && !isSelected
  const showChrome = ((isHovered && !anotherBlockSelected) || isSelected) && !isEditing && !isDragSource
  const showHandle = showChrome

  return (
    <div
      ref={blockRef}
      className="relative"
      style={{
        ...outlineStyle,
        transition: 'outline var(--editor-duration-fast) var(--editor-ease)',
        cursor: isSelected ? 'default' : 'pointer',
      }}
      tabIndex={0}
      role="region"
      aria-label={`${blockLabel} block`}
      onMouseEnter={(e) => onMouseEnter(blockId, e)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-block-id={blockId}
      data-block-type={blockType}
      data-block-index={blockIndex}
    >
      {/* Block type label + editing surface badge — outside the block, top-right */}
      {showChrome && (() => {
        const surface = getEditingSurface(blockType)
        const isLinked = surface === 'linked'
        return (
          <div
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded pointer-events-none select-none"
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isSelected ? 'var(--editor-blue)' : 'var(--editor-text-subtle)',
              background: isSelected ? 'var(--editor-blue-lightest)' : 'var(--editor-surface-muted)',
              border: `1px solid ${isSelected ? 'var(--editor-blue-light)' : 'var(--editor-border-input)'}`,
              zIndex: 'var(--z-editor-block-selected)',
              animation: 'scale-in 150ms var(--ease-out, ease) forwards',
            }}
          >
            {isLinked ? <ExternalLink className="h-2.5 w-2.5" /> : <Pencil className="h-2.5 w-2.5" />}
            {blockLabel}
          </div>
        )
      })()}

      {/* Drag handle — left edge */}
      {showHandle && onDragStart && (
        <div
          className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-8 rounded-md cursor-grab active:cursor-grabbing select-none"
          style={{
            color: isSelected ? 'var(--editor-blue)' : 'var(--editor-text-subtle)',
            background: isSelected ? 'var(--editor-blue-lightest)' : 'var(--editor-surface-muted)',
            border: `1px solid ${isSelected ? 'var(--editor-blue-light)' : 'var(--editor-border-input)'}`,
            zIndex: 'var(--z-editor-block-selected)',
            animation: 'scale-in 100ms var(--ease-out, ease) forwards',
          }}
          onPointerDown={(e) => onDragStart(blockIndex, e)}
          title="Drag to reorder"
          role="button"
          aria-roledescription="drag handle"
          aria-label={`Drag ${blockLabel} to reorder`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Inner glow on selection */}
      {isSelected && !isEditing && !isDragSource && (
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            boxShadow: 'var(--editor-shadow-inset-blue)',
            zIndex: 1,
          }}
        />
      )}

      {children}
    </div>
  )
}

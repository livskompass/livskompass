import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Settings, X } from 'lucide-react'
import { useToolbarPosition } from '../hooks/useToolbarPosition'
import { useEditor } from '../context'
import type { Data } from '@puckeditor/core'

interface FloatingToolbarProps {
  blockId: string | null
  blockType: string
  blockIndex: number
  totalBlocks: number
}

export function FloatingToolbar({
  blockId,
  blockType,
  blockIndex,
  totalBlocks,
}: FloatingToolbarProps) {
  const position = useToolbarPosition(blockId)
  const { state, updateData } = useEditor()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const puckData = state.puckData

  const moveBlock = useCallback(
    (direction: -1 | 1) => {
      if (!puckData) return
      const items = [...puckData.content]
      const newIndex = blockIndex + direction
      if (newIndex < 0 || newIndex >= items.length) return

      // Swap
      const temp = items[blockIndex]
      items[blockIndex] = items[newIndex]
      items[newIndex] = temp

      updateData({ ...puckData, content: items } as Data)
    },
    [puckData, blockIndex, updateData],
  )

  const duplicateBlock = useCallback(() => {
    if (!puckData) return
    const items = [...puckData.content]
    const original = items[blockIndex]
    const clone = JSON.parse(JSON.stringify(original))
    // Give clone a new ID
    if (clone.props?.id) {
      clone.props.id = `${clone.props.id}-copy-${Date.now()}`
    }
    items.splice(blockIndex + 1, 0, clone)
    updateData({ ...puckData, content: items } as Data)
  }, [puckData, blockIndex, updateData])

  const deleteBlock = useCallback(() => {
    if (!puckData) return
    const items = [...puckData.content]
    items.splice(blockIndex, 1)
    updateData({ ...puckData, content: items } as Data)
    setConfirmDelete(false)
  }, [puckData, blockIndex, updateData])

  if (!position || !blockId) return null

  const portalRoot = document.getElementById('editor-portals') || document.body

  const toolbar = (
    <div
      className="fixed pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, ${position.placement === 'above' ? '-100%' : '0'})`,
        zIndex: 'var(--z-editor-toolbar, 100)',
        animation: 'editor-bounce-in 150ms var(--ease-out, ease) forwards',
      }}
    >
      <div
        className="flex items-center gap-px rounded-full px-1 py-0.5"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        role="toolbar"
        aria-label={`${blockType} block actions`}
      >
        {confirmDelete ? (
          /* Delete confirmation mode */
          <div className="flex items-center gap-1 px-1">
            <span className="text-xs text-stone-500 px-1">
              Delete {blockType}?
            </span>
            <button
              onClick={deleteBlock}
              className="px-2 py-1 rounded-full text-xs font-medium text-white transition-colors"
              style={{ background: 'var(--editor-red)' }}
              aria-label="Confirm delete"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Cancel delete"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Normal toolbar mode */
          <>
            {/* Drag handle (visual only in Take 1) */}
            <ToolbarButton
              icon={<GripVertical className="h-3.5 w-3.5" />}
              label="Drag to reorder"
              disabled
              style={{ cursor: 'grab', opacity: 0.4 }}
            />

            {/* Block type label */}
            <span className="text-[11px] font-medium text-stone-400 px-1.5 select-none">
              {blockType}
            </span>

            <ToolbarDivider />

            {/* Move up/down */}
            <ToolbarButton
              icon={<ChevronUp className="h-3.5 w-3.5" />}
              label="Move up"
              disabled={blockIndex === 0}
              onClick={() => moveBlock(-1)}
            />
            <ToolbarButton
              icon={<ChevronDown className="h-3.5 w-3.5" />}
              label="Move down"
              disabled={blockIndex >= totalBlocks - 1}
              onClick={() => moveBlock(1)}
            />

            {/* Duplicate */}
            <ToolbarButton
              icon={<Copy className="h-3.5 w-3.5" />}
              label="Duplicate"
              onClick={duplicateBlock}
            />

            <ToolbarDivider />

            {/* Delete */}
            <ToolbarButton
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Delete"
              onClick={() => setConfirmDelete(true)}
              destructive
            />

            <ToolbarDivider />

            {/* Settings (Phase 5) */}
            <ToolbarButton
              icon={<Settings className="h-3.5 w-3.5" />}
              label="Settings"
              onClick={() => {
                // TODO Phase 5: Open settings popover
                console.log('Open settings for block', blockIndex)
              }}
            />
          </>
        )}
      </div>
    </div>
  )

  return createPortal(toolbar, portalRoot)
}

// ── Sub-components ──

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
  destructive,
  style,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  style?: React.CSSProperties
}) {
  return (
    <button
      className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
      style={{
        color: destructive
          ? 'var(--editor-red, #EF4444)'
          : disabled
            ? '#D1D5DB'
            : '#6B7280',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseEnter={(e) => {
        if (!disabled) {
          ;(e.target as HTMLElement).style.background = destructive
            ? 'var(--editor-red-light, #FEE2E2)'
            : '#F3F4F6'
          ;(e.target as HTMLElement).style.color = destructive
            ? 'var(--editor-red, #EF4444)'
            : '#111827'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.target as HTMLElement).style.background = 'transparent'
        ;(e.target as HTMLElement).style.color = destructive
          ? 'var(--editor-red, #EF4444)'
          : disabled
            ? '#D1D5DB'
            : '#6B7280'
      }}
    >
      {icon}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-stone-200 mx-0.5" />
}

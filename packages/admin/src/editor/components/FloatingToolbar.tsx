import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Settings, X } from 'lucide-react'
import { useToolbarPosition } from '../hooks/useToolbarPosition'
import { useEditor } from '../context'
import { SettingsPopover } from './SettingsPopover'
import { InlineVisualControls } from './InlineVisualControls'
import type { Data } from '../types'

interface FloatingToolbarProps {
  blockId: string | null
  blockType: string
  blockLabel?: string
  blockIndex: number
  totalBlocks: number
}

export function FloatingToolbar({
  blockId,
  blockType,
  blockLabel,
  blockIndex,
  totalBlocks,
}: FloatingToolbarProps) {
  const displayName = blockLabel || blockType
  const position = useToolbarPosition(blockId)
  const { state, updateData } = useEditor()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const settingsBtnRef = useRef<HTMLButtonElement>(null)

  const puckData = state.puckData

  // Reset confirmDelete and settings when switching blocks
  useEffect(() => {
    setConfirmDelete(false)
    setShowSettings(false)
  }, [blockId])

  const moveBlock = useCallback(
    (direction: -1 | 1) => {
      if (!puckData) return
      if (blockIndex < 0 || blockIndex >= puckData.content.length) return
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
    if (blockIndex < 0 || blockIndex >= puckData.content.length) return
    const items = [...puckData.content]
    const original = items[blockIndex]
    const clone = JSON.parse(JSON.stringify(original))
    // Give clone a new ID
    if (clone.props?.id) {
      clone.props.id = `${clone.props.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }
    items.splice(blockIndex + 1, 0, clone)
    updateData({ ...puckData, content: items } as Data)
  }, [puckData, blockIndex, updateData])

  const deleteBlock = useCallback(() => {
    if (!puckData) return
    if (blockIndex < 0 || blockIndex >= puckData.content.length) return
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
        zIndex: 'var(--z-editor-toolbar)',
        animation: 'editor-bounce-in 150ms var(--editor-ease) forwards',
      }}
    >
      <div
        className="flex items-center gap-px rounded-full px-1 py-0.5"
        style={{
          background: 'var(--editor-surface-glass)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--editor-border)',
          boxShadow: 'var(--editor-shadow-md)',
        }}
        role="toolbar"
        aria-label={`${displayName} block actions`}
      >
        {confirmDelete ? (
          /* Delete confirmation mode */
          <div className="flex items-center gap-1 px-1">
            <span className="text-xs px-1" style={{ color: 'var(--editor-text-muted)' }}>
              Delete {displayName}?
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
              className="p-1 rounded-full transition-colors"
              style={{ color: 'var(--editor-text-subtle)' }}
              aria-label="Cancel delete"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Normal toolbar mode */
          <>
            {/* Drag handle indicator */}
            <ToolbarButton
              icon={<GripVertical className="h-3.5 w-3.5" />}
              label="Use handle on block edge to drag"
              disabled
              style={{ cursor: 'default', opacity: 0.3 }}
            />

            {/* Block type label */}
            <span
              className="text-[11px] font-medium px-1.5 select-none"
              style={{ color: 'var(--editor-text-subtle)' }}
            >
              {displayName}
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

            {/* Settings */}
            <ToolbarButton
              ref={settingsBtnRef}
              icon={<Settings className="h-3.5 w-3.5" />}
              label="Settings"
              active={showSettings}
              onClick={() => setShowSettings((v) => !v)}
            />
          </>
        )}
      </div>

      {/* Visual controls row */}
      {!confirmDelete && (
        <InlineVisualControls blockType={blockType} blockIndex={blockIndex} />
      )}

      {/* Settings popover */}
      {showSettings && blockId && (
        <SettingsPopover
          blockId={blockId}
          blockType={blockType}
          blockIndex={blockIndex}
          anchorRect={settingsBtnRef.current?.getBoundingClientRect() ?? null}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )

  return createPortal(toolbar, portalRoot)
}

// ── Sub-components ──

import { forwardRef } from 'react'

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    disabled?: boolean
    destructive?: boolean
    active?: boolean
    style?: React.CSSProperties
  }
>(function ToolbarButton({ icon, label, onClick, disabled, destructive, active, style }, ref) {
  return (
    <button
      ref={ref}
      className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
      style={{
        color: destructive
          ? 'var(--editor-red)'
          : active
            ? 'var(--editor-blue)'
            : disabled
              ? 'var(--editor-text-disabled)'
              : 'var(--editor-text-muted)',
        background: active ? 'var(--editor-blue-lightest)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          ;(e.currentTarget as HTMLElement).style.background = destructive
            ? 'var(--editor-red-light)'
            : 'var(--editor-surface-hover)'
          ;(e.currentTarget as HTMLElement).style.color = destructive
            ? 'var(--editor-red)'
            : 'var(--editor-text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = destructive
            ? 'var(--editor-red)'
            : disabled
              ? 'var(--editor-text-disabled)'
              : 'var(--editor-text-muted)'
        }
      }}
    >
      {icon}
    </button>
  )
})

function ToolbarDivider() {
  return <div className="w-px h-4 mx-0.5" style={{ background: 'var(--editor-neutral-200)' }} />
}

import React, { useCallback, useState, useRef } from 'react'
import { puckConfig, InlineEditBlockContext } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'
import { useEditorSelection } from '../hooks/useEditorSelection'
import { useDragReorder } from '../hooks/useDragReorder'
import { EditableBlock } from './EditableBlock'
import { BlockInserter } from './BlockInserter'
import { PANEL_DRAG_TYPE } from './BlockPanel'
import { InlineImagePickerProvider } from './InlineImagePickerProvider'
import { InlineRichTextProvider } from './InlineRichTextProvider'
import { InlineArrayOpsProvider } from './InlineArrayOpsProvider'
import { InlineMediaPickerProvider } from './InlineMediaPickerProvider'

interface PuckItem {
  type: string
  props: Record<string, any>
}

const components = puckConfig.components as Record<
  string,
  { render: React.FC<any>; label?: string; defaultProps?: Record<string, any> }
>

/**
 * Resolves a dotted/bracketed prop path (e.g. "items[0].question") and sets a value.
 * Returns a shallow-cloned props object with the updated value.
 */
function setNestedProp(props: Record<string, any>, path: string, value: string): Record<string, any> {
  // Simple top-level field — fast path
  if (!path.includes('.') && !path.includes('[')) {
    return { ...props, [path]: value }
  }

  // Parse path segments: "items[0].question" → ["items", "0", "question"]
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const result = { ...props }
  let current: any = result

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i]
    const nextKey = segments[i + 1]
    const isArrayIndex = /^\d+$/.test(nextKey)

    if (Array.isArray(current[key])) {
      current[key] = [...current[key]]
    } else if (typeof current[key] === 'object' && current[key] !== null) {
      current[key] = { ...current[key] }
    } else if (current[key] == null) {
      current[key] = isArrayIndex ? [] : {}
    } else {
      return props
    }
    current = current[key]
  }

  current[segments[segments.length - 1]] = value
  return result
}

const BLOCK_SELECTOR = '[data-block-index]'

export function BlockList() {
  const { state, updateData } = useEditor()
  const { selectBlock } = useEditorSelection()
  const { puckData } = state

  const items = puckData?.content || []

  // ── Panel drag-and-drop state ──
  const [panelDropIndex, setPanelDropIndex] = useState<number>(-1)
  const [isPanelDragOver, setIsPanelDragOver] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // saveBlockProp: update a block's prop and trigger auto-save
  const saveBlockProp = useCallback(
    (blockIndex: number, propName: string, value: string) => {
      if (!puckData) return
      if (blockIndex < 0 || blockIndex >= puckData.content.length) return

      const content = [...puckData.content]
      const block = content[blockIndex]
      if (!block) return

      content[blockIndex] = {
        ...block,
        props: setNestedProp(block.props || {}, propName, value),
      }

      updateData({ ...puckData, content } as Data)
    },
    [puckData, updateData],
  )

  // Drag-and-drop reorder (existing blocks)
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!puckData) return
      if (fromIndex < 0 || fromIndex >= puckData.content.length) return
      if (toIndex < 0 || toIndex >= puckData.content.length) return
      if (fromIndex === toIndex) return
      const content = [...puckData.content]
      const [moved] = content.splice(fromIndex, 1)
      content.splice(toIndex, 0, moved)
      updateData({ ...puckData, content } as Data)
    },
    [puckData, updateData],
  )

  const { dragState, dropIndicatorIndex, handleDragStart } = useDragReorder(handleReorder)

  const handleDeselectAll = useCallback(() => {
    selectBlock(null)
  }, [selectBlock])

  // ── Panel drop handlers ──

  const findPanelDropIndex = useCallback((clientY: number): number => {
    const blockEls = containerRef.current?.querySelectorAll(BLOCK_SELECTOR)
    if (!blockEls || blockEls.length === 0) return 0

    for (let i = 0; i < blockEls.length; i++) {
      const rect = blockEls[i].getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (clientY < mid) return i
    }
    return blockEls.length
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      // Only handle drops from the block panel
      if (!e.dataTransfer.types.includes(PANEL_DRAG_TYPE)) return

      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      setIsPanelDragOver(true)

      const idx = findPanelDropIndex(e.clientY)
      setPanelDropIndex(idx)
    },
    [findPanelDropIndex],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset if leaving the container entirely (not entering a child)
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsPanelDragOver(false)
      setPanelDropIndex(-1)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const blockType = e.dataTransfer.getData(PANEL_DRAG_TYPE)
      if (!blockType || !puckData) {
        setIsPanelDragOver(false)
        setPanelDropIndex(-1)
        return
      }

      e.preventDefault()

      const comp = components[blockType]
      const defaultProps = comp?.defaultProps
        ? JSON.parse(JSON.stringify(comp.defaultProps))
        : {}

      defaultProps.id = `${blockType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      const newBlock = { type: blockType, props: defaultProps }
      const insertAt = findPanelDropIndex(e.clientY)
      const content = [...puckData.content]
      content.splice(insertAt, 0, newBlock)

      updateData({ ...puckData, content } as Data)
      setIsPanelDragOver(false)
      setPanelDropIndex(-1)
    },
    [puckData, updateData, findPanelDropIndex],
  )

  // ── Empty state — also a drop target ──

  if (items.length === 0) {
    return (
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center py-32 min-h-[400px] transition-colors rounded-lg mx-4 my-4"
        style={{
          border: isPanelDragOver
            ? '2px dashed var(--editor-blue)'
            : '2px dashed transparent',
          background: isPanelDragOver
            ? 'var(--editor-blue-lightest, #EFF6FF)'
            : 'transparent',
        }}
      >
        <BlockInserter insertIndex={0} />
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 pointer-events-none"
          style={{ background: 'var(--editor-blue-lightest)', color: 'var(--editor-blue)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <p className="text-base font-medium mb-1" style={{ color: 'var(--editor-text-primary)' }}>
          {isPanelDragOver ? 'Drop here to add block' : 'Start building your page'}
        </p>
        <p className="text-sm mb-2" style={{ color: 'var(--editor-text-subtle)' }}>
          {isPanelDragOver ? '' : 'Drag blocks from the panel on the left'}
        </p>
        {!isPanelDragOver && (
          <p className="text-xs" style={{ color: 'var(--editor-text-disabled)' }}>
            Press <kbd className="px-1 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: 'var(--editor-neutral-200)', background: 'var(--editor-surface)' }}>/</kbd> to search
          </p>
        )}
      </div>
    )
  }

  return (
    <InlineImagePickerProvider>
    <InlineMediaPickerProvider>
    <InlineRichTextProvider>
    <InlineArrayOpsProvider>
      <div
        ref={containerRef}
        onClick={(e) => {
          // Intercept link clicks inside blocks — prevent navigating away from editor
          const target = e.target as HTMLElement
          const anchor = target.closest('a[href]') as HTMLAnchorElement | null
          if (anchor && containerRef.current?.contains(anchor)) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          handleDeselectAll()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Insert point before first block */}
        {!dragState && !isPanelDragOver && <BlockInserter insertIndex={0} />}

        {/* Panel drop indicator before first block */}
        {isPanelDragOver && panelDropIndex === 0 && <PanelDropIndicator />}

        {/* Reorder drop indicator before first block */}
        {dragState && dropIndicatorIndex === 0 && <DropIndicator />}

        {items.map((item: PuckItem, index: number) => {
          const comp = components[item.type]
          if (!comp?.render) return null

          const Fn = comp.render
          const blockId = item.props?.id || `${item.type}-${index}`
          const label = comp.label || item.type

          return (
            <React.Fragment key={blockId}>
              <EditableBlock
                blockId={blockId}
                blockType={item.type}
                blockLabel={label}
                blockIndex={index}
                onDragStart={handleDragStart}
                isDragSource={dragState?.sourceIndex === index}
              >
                <InlineEditBlockContext.Provider
                  value={{ isAdmin: true, blockIndex: index, saveBlockProp }}
                >
                  <Fn {...item.props} />
                </InlineEditBlockContext.Provider>
              </EditableBlock>

              {/* Reorder drop indicator after this block */}
              {dragState && dropIndicatorIndex === index + 1 && <DropIndicator />}

              {/* Panel drop indicator after this block */}
              {isPanelDragOver && panelDropIndex === index + 1 && <PanelDropIndicator />}

              {/* Insert point after each block (hidden during any drag) */}
              {!dragState && !isPanelDragOver && <BlockInserter insertIndex={index + 1} />}
            </React.Fragment>
          )
        })}
      </div>
    </InlineArrayOpsProvider>
    </InlineRichTextProvider>
    </InlineMediaPickerProvider>
    </InlineImagePickerProvider>
  )
}

/** Drop indicator for reorder drag */
function DropIndicator() {
  return (
    <div className="relative py-1">
      <div
        className="h-0.5 mx-8 rounded-full"
        style={{
          background: 'var(--editor-blue, #2563EB)',
          boxShadow: 'var(--editor-shadow-blue-glow)',
          animation: 'editor-focus-pulse 1s ease infinite',
        }}
      />
    </div>
  )
}

/** Drop indicator for panel drag — thicker, with label */
function PanelDropIndicator() {
  return (
    <div className="relative py-2">
      <div
        className="h-1 mx-8 rounded-full"
        style={{
          background: 'var(--editor-blue, #2563EB)',
          boxShadow: 'var(--editor-shadow-blue-glow)',
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 px-2 py-0.5 rounded text-[10px] font-medium"
        style={{
          background: 'var(--editor-blue, #2563EB)',
          color: 'white',
        }}
      >
        Drop here
      </div>
    </div>
  )
}

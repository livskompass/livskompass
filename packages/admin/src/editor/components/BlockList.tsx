import React, { useCallback, useState, useRef, useEffect } from 'react'
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
import { TextSizePicker } from './TextSizePicker'
import { ButtonStylePicker } from './ButtonStylePicker'

/** Big + button for empty state that opens block picker inline */
function EmptyStateInsertButton() {
  const [open, setOpen] = useState(false)
  const { state, updateData } = useEditor()
  const components = puckConfig.components as Record<string, any>
  const [search, setSearch] = useState('')

  const categories = (puckConfig as any).categories as Record<string, { title: string; components: string[] }> | undefined
  const allBlocks = categories
    ? Object.values(categories).flatMap((cat) => cat.components.map((name) => ({ name, label: components[name]?.label || name, category: cat.title })))
    : Object.keys(components).map((name) => ({ name, label: components[name]?.label || name, category: '' }))

  const filtered = search
    ? allBlocks.filter((b) => b.label.toLowerCase().includes(search.toLowerCase()) || b.name.toLowerCase().includes(search.toLowerCase()))
    : allBlocks

  const insertBlock = (blockType: string) => {
    const puckData = state.puckData || { content: [], root: { props: {} }, zones: {} }
    const comp = components[blockType]
    const defaultProps = comp?.defaultProps ? JSON.parse(JSON.stringify(comp.defaultProps)) : {}
    defaultProps.id = `${blockType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newBlock = { type: blockType, props: defaultProps }
    const content = [...puckData.content, newBlock]
    updateData({ ...puckData, content } as Data)
    setOpen(false)
    setSearch('')
  }

  // Close on click outside
  const ref = useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on ESC
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer mb-6"
        style={{ background: 'var(--editor-blue-lightest)', color: 'var(--editor-blue)', border: '2px solid var(--editor-blue-light, #93C5FD)' }}
        aria-label="Add first block"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-xl border border-zinc-200 shadow-2xl z-50 max-h-[400px] overflow-hidden flex flex-col" style={{ animation: 'editor-slide-down 150ms ease forwards' }}>
          <div className="p-2.5 border-b border-zinc-100">
            <input
              type="text"
              placeholder="Search blocks..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 outline-none focus:border-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1.5">
            {filtered.map((block) => (
              <button
                key={block.name}
                onClick={() => insertBlock(block.name)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <span className="font-medium text-zinc-800">{block.label}</span>
                <span className="text-[10px] text-zinc-400 ml-auto">{block.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
    (blockIndex: number, propName: string, value: any) => {
      if (!puckData) return
      if (blockIndex < 0 || blockIndex >= puckData.content.length) return

      const content = [...puckData.content]
      const block = content[blockIndex]
      if (!block) return

      // If value is an object (not a string), set it directly as a top-level prop
      if (typeof value === 'object' && value !== null) {
        content[blockIndex] = {
          ...block,
          props: { ...(block.props || {}), [propName]: value },
        }
      } else {
        content[blockIndex] = {
          ...block,
          props: setNestedProp(block.props || {}, propName, value),
        }
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
        className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] transition-colors rounded-lg mx-4"
        style={{
          border: isPanelDragOver
            ? '2px dashed var(--editor-blue)'
            : '2px dashed transparent',
          background: isPanelDragOver
            ? 'var(--editor-blue-lightest, #EFF6FF)'
            : 'transparent',
        }}
      >
        <EmptyStateInsertButton />
        <p className="text-base font-medium mb-1" style={{ color: 'var(--editor-text-primary)' }}>
          {isPanelDragOver ? 'Drop here to add block' : 'Start building your page'}
        </p>
        <p className="text-sm mb-2" style={{ color: 'var(--editor-text-subtle)' }}>
          {isPanelDragOver ? '' : 'Click + or drag blocks from the panel'}
        </p>
        {!isPanelDragOver && (
          <p className="text-xs" style={{ color: 'var(--editor-text-disabled)' }}>
            Press <kbd className="px-1 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: 'var(--editor-neutral-200)', background: 'var(--editor-surface)' }}>/</kbd> to search
          </p>
        )}
      </div>
    )
  }

  // Auto-select block as you scroll — the block crossing viewport center gets selected
  const isUserScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const editorContent = document.getElementById('editor-content')
    const scrollTarget = editorContent || window

    const handleScroll = () => {
      // Mark as user-scrolling to avoid fighting with click-to-select
      isUserScrolling.current = true
      clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => {
        isUserScrolling.current = false
      }, 150)

      // Find block closest to viewport center
      const viewportCenter = window.innerHeight / 2
      let closestId: string | null = null
      let closestDist = Infinity

      const blocks = container.querySelectorAll<HTMLElement>('[data-block-id]')
      blocks.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const blockCenter = rect.top + rect.height / 2
        const dist = Math.abs(blockCenter - viewportCenter)
        // Only consider blocks that are at least partially visible
        if (rect.bottom > 0 && rect.top < window.innerHeight && dist < closestDist) {
          closestDist = dist
          closestId = el.getAttribute('data-block-id')
        }
      })

      if (closestId && closestId !== state.selectedBlockId) {
        selectBlock(closestId)
      }
    }

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer.current)
    }
  }, [items.length, state.selectedBlockId, selectBlock])

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
                  value={{ isAdmin: true, blockIndex: index, saveBlockProp, blockProps: item.props }}
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

        {/* Bottom spacer so last inserter is clearly visible */}
        <div className="pb-16" />
      </div>
      <TextSizePicker puckData={puckData} saveBlockProp={saveBlockProp} />
      <ButtonStylePicker puckData={puckData} saveBlockProp={saveBlockProp} />
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

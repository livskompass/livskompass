import { useState, useCallback, useRef, useEffect } from 'react'

interface DragState {
  isDragging: boolean
  sourceIndex: number
  targetIndex: number
  ghostY: number
  ghostX: number
  ghostHeight: number
  ghostWidth: number
}

const DRAG_THRESHOLD = 5 // px before drag activates (click vs drag)
const BLOCK_SELECTOR = '[data-block-index]'

/**
 * Zero-dependency drag-and-drop reorder for blocks.
 * Uses pointer events for cross-device support.
 *
 * Returns:
 * - dragState: current drag info (null when not dragging)
 * - handleDragStart: call on pointerdown on a drag handle
 * - dropIndicatorIndex: where the blue insertion line should show (-1 = none)
 */
export function useDragReorder(onReorder: (from: number, to: number) => void) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState(-1)

  const startPos = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const sourceIndexRef = useRef(-1)
  const isDraggingRef = useRef(false)
  const blockRectsRef = useRef<{ top: number; bottom: number; mid: number; index: number }[]>([])
  const ghostElRef = useRef<HTMLDivElement | null>(null)
  const placeholderRef = useRef<HTMLDivElement | null>(null)
  const thresholdCleanupRef = useRef<(() => void) | null>(null)

  // Snapshot all block positions at drag start
  const snapshotBlockRects = useCallback(() => {
    const blocks = document.querySelectorAll(BLOCK_SELECTOR)
    const rects: { top: number; bottom: number; mid: number; index: number }[] = []
    blocks.forEach((el) => {
      const idx = parseInt(el.getAttribute('data-block-index') || '-1', 10)
      if (idx === -1) return
      const rect = el.getBoundingClientRect()
      rects.push({
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        mid: rect.top + window.scrollY + rect.height / 2,
        index: idx,
      })
    })
    rects.sort((a, b) => a.index - b.index)
    blockRectsRef.current = rects
  }, [])

  // Find drop target index based on cursor Y
  const findDropTarget = useCallback((clientY: number): number => {
    const y = clientY + window.scrollY
    const rects = blockRectsRef.current
    if (rects.length === 0) return -1

    for (let i = 0; i < rects.length; i++) {
      if (y < rects[i].mid) return i
    }
    return rects.length // after last block
  }, [])

  // Create ghost element (visual clone)
  const createGhost = useCallback((sourceEl: HTMLElement, clientX: number, clientY: number) => {
    const rect = sourceEl.getBoundingClientRect()
    offsetRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }

    const ghost = document.createElement('div')
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.92;
      transform: scale(1.02);
      box-shadow: var(--editor-shadow-drag);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 150ms ease-out, box-shadow 150ms ease-out;
    `

    // Clone the block's visual content
    const clone = sourceEl.cloneNode(true) as HTMLElement
    clone.style.cssText = 'margin: 0; transform: none; outline: none;'
    // Remove interactive elements from ghost to prevent tab/focus issues
    clone.querySelectorAll('button, a, input, textarea, [contenteditable]').forEach((el) => {
      ;(el as HTMLElement).setAttribute('tabindex', '-1')
      ;(el as HTMLElement).removeAttribute('contenteditable')
    })
    ghost.appendChild(clone)

    document.body.appendChild(ghost)
    ghostElRef.current = ghost

    return { width: rect.width, height: rect.height }
  }, [])

  // Create placeholder at source position
  const createPlaceholder = useCallback((sourceEl: HTMLElement) => {
    const rect = sourceEl.getBoundingClientRect()
    const placeholder = document.createElement('div')
    placeholder.style.cssText = `
      height: ${rect.height}px;
      background: var(--editor-drag-placeholder-bg);
      border: 2px dashed var(--editor-drag-placeholder-border);
      border-radius: 8px;
      transition: height 200ms ease-out;
    `
    placeholder.setAttribute('data-drag-placeholder', 'true')

    sourceEl.style.display = 'none'
    sourceEl.parentNode?.insertBefore(placeholder, sourceEl)
    placeholderRef.current = placeholder
  }, [])

  // Clean up ghost and placeholder
  const cleanup = useCallback(() => {
    if (ghostElRef.current) {
      ghostElRef.current.remove()
      ghostElRef.current = null
    }
    if (placeholderRef.current) {
      const sourceEl = placeholderRef.current.nextElementSibling as HTMLElement | null
      if (sourceEl) sourceEl.style.display = ''
      placeholderRef.current.remove()
      placeholderRef.current = null
    }
    isDraggingRef.current = false
    setDragState(null)
    setDropIndicatorIndex(-1)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Pointer move handler
  useEffect(() => {
    if (!dragState?.isDragging) return

    const handleMove = (e: PointerEvent) => {
      e.preventDefault()

      // Move ghost
      if (ghostElRef.current) {
        ghostElRef.current.style.left = `${e.clientX - offsetRef.current.x}px`
        ghostElRef.current.style.top = `${e.clientY - offsetRef.current.y}px`
      }

      // Find drop target
      const target = findDropTarget(e.clientY)
      if (target !== -1) {
        // Adjust: if dragging down, the effective target shifts
        const src = sourceIndexRef.current
        let displayTarget = target
        if (target > src) displayTarget = target
        setDropIndicatorIndex(displayTarget)
        setDragState((prev) =>
          prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY, targetIndex: target } : null,
        )
      }
    }

    const handleUp = (e: PointerEvent) => {
      e.preventDefault()
      const src = sourceIndexRef.current
      const target = findDropTarget(e.clientY)

      // Calculate effective drop index
      let dropIdx = target
      if (dropIdx > src) dropIdx -= 1 // Account for removed source

      if (dropIdx >= 0 && dropIdx !== src) {
        onReorder(src, dropIdx)
      }

      cleanup()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup()
      }
    }

    document.addEventListener('pointermove', handleMove, { passive: false })
    document.addEventListener('pointerup', handleUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dragState?.isDragging, findDropTarget, onReorder, cleanup])

  // Start drag handler — attach to grip handle's onPointerDown
  const handleDragStart = useCallback(
    (blockIndex: number, e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const blockEl = (e.currentTarget as HTMLElement).closest(BLOCK_SELECTOR) as HTMLElement
      if (!blockEl) return

      startPos.current = { x: e.clientX, y: e.clientY }
      sourceIndexRef.current = blockIndex

      // Wait for threshold before committing to drag
      const handleThresholdMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startPos.current.x
        const dy = moveEvent.clientY - startPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
          document.removeEventListener('pointermove', handleThresholdMove)
          document.removeEventListener('pointerup', handleThresholdCancel)

          // Commit to drag
          snapshotBlockRects()
          const { width, height } = createGhost(blockEl, startPos.current.x, startPos.current.y)
          createPlaceholder(blockEl)
          document.body.style.cursor = 'grabbing'
          document.body.style.userSelect = 'none'
          isDraggingRef.current = true

          setDragState({
            isDragging: true,
            sourceIndex: blockIndex,
            targetIndex: blockIndex,
            ghostY: moveEvent.clientY,
            ghostX: moveEvent.clientX,
            ghostHeight: height,
            ghostWidth: width,
          })
        }
      }

      const handleThresholdCancel = () => {
        document.removeEventListener('pointermove', handleThresholdMove)
        document.removeEventListener('pointerup', handleThresholdCancel)
        thresholdCleanupRef.current = null
      }

      // Store cleanup so we can call it on unmount
      thresholdCleanupRef.current = handleThresholdCancel

      document.addEventListener('pointermove', handleThresholdMove)
      document.addEventListener('pointerup', handleThresholdCancel)
    },
    [snapshotBlockRects, createGhost, createPlaceholder],
  )

  // Cleanup threshold listeners and ghost on unmount
  useEffect(() => {
    return () => {
      thresholdCleanupRef.current?.()
      if (ghostElRef.current) {
        ghostElRef.current.remove()
        ghostElRef.current = null
      }
      if (placeholderRef.current) {
        const sourceEl = placeholderRef.current.nextElementSibling as HTMLElement | null
        if (sourceEl) sourceEl.style.display = ''
        placeholderRef.current.remove()
        placeholderRef.current = null
      }
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  return {
    dragState,
    dropIndicatorIndex,
    handleDragStart,
    isDragging: isDraggingRef.current || !!dragState?.isDragging,
  }
}

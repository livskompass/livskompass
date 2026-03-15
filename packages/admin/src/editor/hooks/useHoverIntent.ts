import { useCallback, useRef, useEffect } from 'react'
import { useEditor } from '../context'

const HOVER_DELAY = 150 // ms before registering hover
const VELOCITY_THRESHOLD = 800 // px/s — fast mouse skips hover

/**
 * Hover intent hook — only registers hover after a delay,
 * and ignores fast mouse movements (cursor just passing over).
 */
export function useHoverIntent() {
  const { hoverBlock, state } = useEditor()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastPosRef = useRef<{ x: number; y: number; t: number } | null>(null)

  const onMouseEnter = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      // Calculate velocity from last known position
      const now = performance.now()
      if (lastPosRef.current) {
        const dt = (now - lastPosRef.current.t) / 1000 // seconds
        const dx = e.clientX - lastPosRef.current.x
        const dy = e.clientY - lastPosRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const velocity = dt > 0 ? dist / dt : 0

        if (velocity > VELOCITY_THRESHOLD) {
          // Fast cursor — skip hover
          lastPosRef.current = { x: e.clientX, y: e.clientY, t: now }
          return
        }
      }

      lastPosRef.current = { x: e.clientX, y: e.clientY, t: now }

      // Delayed hover
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        hoverBlock(blockId)
      }, HOVER_DELAY)
    },
    [hoverBlock],
  )

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    hoverBlock(null)
  }, [hoverBlock])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    lastPosRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
  }, [])

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    hoveredBlockId: state.hoveredBlockId,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
  }
}

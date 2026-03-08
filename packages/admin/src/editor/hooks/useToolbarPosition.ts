import { useState, useEffect, useCallback, useRef } from 'react'

interface ToolbarPosition {
  x: number
  y: number
  placement: 'above' | 'below'
}

const TOOLBAR_GAP = 8 // px above/below block
const FLIP_THRESHOLD = 48 // px from viewport top before flipping below

/**
 * Positions the floating toolbar relative to a selected block.
 * Uses ResizeObserver + rAF for smooth updates.
 * CSS transform only — zero layout thrash.
 */
export function useToolbarPosition(blockId: string | null) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const rafRef = useRef<number>()
  const observerRef = useRef<ResizeObserver>()

  const updatePosition = useCallback(() => {
    if (!blockId) {
      setPosition(null)
      return
    }

    const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
    if (!el) {
      setPosition(null)
      return
    }

    const rect = el.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const placement = rect.top < FLIP_THRESHOLD ? 'below' : 'above'
    const y = placement === 'above'
      ? rect.top - TOOLBAR_GAP
      : rect.bottom + TOOLBAR_GAP

    setPosition({ x, y, placement })
  }, [blockId])

  useEffect(() => {
    if (!blockId) {
      setPosition(null)
      return
    }

    // Initial position
    updatePosition()

    // Update on scroll
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updatePosition)
    }

    // Observe block resize
    const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
    if (el) {
      observerRef.current = new ResizeObserver(handleScroll)
      observerRef.current.observe(el)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observerRef.current?.disconnect()
    }
  }, [blockId, updatePosition])

  return position
}

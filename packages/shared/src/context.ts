import { createContext, useContext, useCallback, useRef, useMemo, type KeyboardEvent } from 'react'
import { sendPropUpdate } from './inline-edit-bridge'

export interface CourseContextValue {
  id: number
  slug: string
  title: string
  description: string
  location: string
  start_date: string | null
  end_date: string | null
  price_sek: number | null
  max_participants: number | null
  current_participants: number
  registration_deadline: string | null
  status: 'active' | 'full' | 'completed' | 'cancelled'
  content: string
}

export interface PostContextValue {
  id: number
  slug: string
  title: string
  excerpt: string
  featured_image: string | null
  published_at: string
  content: string
}

export const CourseContext = createContext<CourseContextValue | null>(null)
export const PostContext = createContext<PostContextValue | null>(null)

export function useCourseData(): CourseContextValue | null {
  return useContext(CourseContext)
}

export function usePostData(): PostContextValue | null {
  return useContext(PostContext)
}

// ── Inline editing context ──

export interface InlineEditContextValue {
  /** Whether current user is admin */
  isAdmin: boolean
  /** The block index this component is at in the content array */
  blockIndex: number
  /** Save a prop value for the current block */
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
}

export const InlineEditBlockContext = createContext<InlineEditContextValue | null>(null)

export function useInlineEditBlock(): InlineEditContextValue | null {
  return useContext(InlineEditBlockContext)
}

/**
 * Hook that returns contentEditable props for a text element.
 * Call with the propName that maps to the block's Puck prop.
 * Returns null if inline editing is not available.
 */
export function useEditableText(propName: string, currentValue: string) {
  const ctx = useInlineEditBlock()
  const originalRef = useRef(currentValue)

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (!ctx) return
      const newValue = e.currentTarget.textContent || ''
      if (newValue !== originalRef.current) {
        ctx.saveBlockProp(ctx.blockIndex, propName, newValue)
        originalRef.current = newValue
      }
    },
    [ctx, propName],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        // Restore original
        e.currentTarget.textContent = originalRef.current
        e.currentTarget.blur()
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    [],
  )

  if (!ctx) return null

  // Keep originalRef in sync
  originalRef.current = currentValue

  return {
    contentEditable: true as const,
    suppressContentEditableWarning: true as const,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className: 'outline-none ring-0 hover:ring-1 hover:ring-stone-400/40 hover:ring-offset-2 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-sm transition-shadow cursor-text',
  }
}

// ── Puck inline editing (inside editor iframe) ──

const INLINE_EDIT_CLASS = 'outline-none ring-0 hover:ring-1 hover:ring-stone-400/40 hover:ring-offset-2 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-sm transition-shadow cursor-text'

/**
 * Hook for inline text editing inside the Puck editor iframe.
 * Uses postMessage bridge to send prop updates to the parent frame.
 *
 * @param propName - The block prop name to update (e.g., 'heading', 'description')
 * @param currentValue - The current prop value
 * @param componentId - The Puck component ID (from props.id)
 * @returns ContentEditable props object, or null if not in Puck editor
 */
export function useInlineEdit(propName: string, currentValue: string, componentId: string) {
  const originalRef = useRef(currentValue)

  // Detect if we're inside the Puck iframe
  const isInPuckEditor = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.frameElement !== null
  }, [])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const newValue = e.currentTarget.textContent || ''
      if (newValue !== originalRef.current) {
        sendPropUpdate(componentId, propName, newValue)
        originalRef.current = newValue
      }
    },
    [componentId, propName],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        e.currentTarget.textContent = originalRef.current
        e.currentTarget.blur()
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    [],
  )

  if (!isInPuckEditor || !componentId) return null

  // Keep originalRef in sync
  originalRef.current = currentValue

  return {
    contentEditable: true as const,
    suppressContentEditableWarning: true as const,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className: INLINE_EDIT_CLASS,
    'data-inline-edit': propName,
  }
}

/**
 * Hook for inline HTML editing inside the Puck editor iframe.
 * Similar to useInlineEdit but reads innerHTML instead of textContent.
 */
export function useInlineEditHtml(propName: string, currentValue: string, componentId: string) {
  const originalRef = useRef(currentValue)

  const isInPuckEditor = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.frameElement !== null
  }, [])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const newValue = e.currentTarget.innerHTML
      if (newValue !== originalRef.current) {
        sendPropUpdate(componentId, propName, newValue)
        originalRef.current = newValue
      }
    },
    [componentId, propName],
  )

  if (!isInPuckEditor || !componentId) return null

  originalRef.current = currentValue

  return {
    contentEditable: true as const,
    suppressContentEditableWarning: true as const,
    onBlur: handleBlur,
    className: INLINE_EDIT_CLASS,
    'data-inline-edit': propName,
  }
}

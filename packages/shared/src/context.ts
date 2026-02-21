import { createContext, useContext, useCallback, useRef, type KeyboardEvent } from 'react'

export interface CourseContextValue {
  id: number
  slug: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
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
    className: 'outline-none ring-0 hover:ring-1 hover:ring-forest-300/50 hover:ring-offset-2 focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 rounded-sm transition-shadow cursor-text',
  }
}

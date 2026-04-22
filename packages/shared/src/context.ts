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

export interface ProductContextValue {
  id: string
  slug: string
  title: string
  description: string
  type: string
  price_sek: number | null
  external_url: string | null
  image_url: string | null
  in_stock: boolean
  content: string
}

export const CourseContext = createContext<CourseContextValue | null>(null)
export const PostContext = createContext<PostContextValue | null>(null)
export const ProductContext = createContext<ProductContextValue | null>(null)

export function useCourseData(): CourseContextValue | null {
  return useContext(CourseContext)
}

export function usePostData(): PostContextValue | null {
  return useContext(PostContext)
}

export function useProductData(): ProductContextValue | null {
  return useContext(ProductContext)
}

// ── Inline editing context ──

export type TextSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption'

/** CSS class for each text size value */
export const TEXT_SIZE_CLASS: Record<TextSize, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  'body-lg': 'text-body-lg',
  body: '',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
}

/** Inline style for each text size — used to override hardcoded block classes */
const TEXT_SIZE_STYLE: Record<TextSize, React.CSSProperties> = {
  display: { fontSize: 'var(--type-display)', lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
  h1: { fontSize: 'var(--type-h1)', lineHeight: 'var(--leading-h1)', letterSpacing: 'var(--tracking-h1)' },
  h2: { fontSize: 'var(--type-h2)', lineHeight: 'var(--leading-h2)', letterSpacing: 'var(--tracking-h2)' },
  h3: { fontSize: 'var(--type-h3)', lineHeight: 'var(--leading-h3)', letterSpacing: 'var(--tracking-h3)' },
  h4: { fontSize: 'var(--type-h4)', lineHeight: 'var(--leading-h4)', letterSpacing: 'var(--tracking-h4)' },
  'body-lg': { fontSize: 'var(--type-body-lg)', lineHeight: 'var(--leading-body)' },
  body: {},
  'body-sm': { fontSize: 'var(--type-body-sm)', lineHeight: 'var(--leading-body-sm)' },
  caption: { fontSize: 'var(--type-caption)', lineHeight: 'var(--leading-caption)' },
}

export interface InlineEditContextValue {
  /** Whether current user is admin */
  isAdmin: boolean
  /** The block index this component is at in the content array */
  blockIndex: number
  /** Save a prop value for the current block */
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
  /** Current block props (for reading _textSizes etc.) */
  blockProps?: Record<string, any>
}

export const InlineEditBlockContext = createContext<InlineEditContextValue | null>(null)

export function useInlineEditBlock(): InlineEditContextValue | null {
  return useContext(InlineEditBlockContext)
}

// ── Inline image picker context ──

export interface InlineImagePickerContextValue {
  /** Open image picker. Calls onPick with the selected URL, or null if cancelled. */
  requestImagePick: (currentUrl: string, onPick: (url: string) => void) => void
}

export const InlineImagePickerContext = createContext<InlineImagePickerContextValue | null>(null)

// ── Inline media picker context (generic — all file types) ──

export type MediaPickerType = 'image' | 'video' | 'audio' | 'document' | 'all'

export interface InlineMediaPickerContextValue {
  /** Open media picker with optional type filter. Calls onPick with the selected URL. */
  requestMediaPick: (typeFilter: MediaPickerType, currentUrl: string, onPick: (url: string) => void) => void
}

export const InlineMediaPickerContext = createContext<InlineMediaPickerContextValue | null>(null)

// ── Inline rich text editor context ──

export interface InlineRichTextContextValue {
  /** A Tiptap-based rich text editor component injected by admin */
  Editor: React.ComponentType<{
    content: string
    onSave: (html: string) => void
    onCancel: () => void
    className?: string
    placeholder?: string
  }>
}

export const InlineRichTextContext = createContext<InlineRichTextContextValue | null>(null)

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

  // Read text size and color from block props (works for both admin and public)
  const textSizes = ctx?.blockProps?._textSizes as Record<string, TextSize> | undefined
  const textSize = textSizes?.[propName] as TextSize | undefined
  const sizeStyle = textSize && textSize !== 'body' ? TEXT_SIZE_STYLE[textSize] : {}

  const textColors = ctx?.blockProps?._textColors as Record<string, string> | undefined
  const textColorClass = textColors?.[propName] || ''

  const hasCustom = textSize || textColorClass

  if (!ctx || !ctx.isAdmin) {
    // Public site: only return style/class if custom values are set
    if (!hasCustom) return null
    return {
      style: sizeStyle,
      className: textColorClass || undefined,
    } as any
  }

  // Keep originalRef in sync
  originalRef.current = currentValue

  // Button text fields get a different picker
  const isButtonText = /^cta|button|submit|buy|book|readMore|backLink/i.test(propName)

  return {
    contentEditable: true as const,
    suppressContentEditableWarning: true as const,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className: 'outline-none ring-0 hover:ring-1 hover:ring-stone-400/40 hover:ring-offset-2 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 rounded-sm transition-shadow cursor-text' + (textColorClass ? ' ' + textColorClass : ''),
    style: sizeStyle,
    ...(isButtonText
      ? { 'data-button-style-field': propName }
      : { 'data-text-size-field': propName }),
  }
}

// ── Inline array operations context ──

export interface InlineArrayOpsContextValue {
  /** Add a new item to an array field */
  addItem: (blockIndex: number, fieldName: string) => void
  /** Remove an item from an array field */
  removeItem: (blockIndex: number, fieldName: string, itemIndex: number) => void
  /** Move an item within an array field (reorder) */
  moveItem: (blockIndex: number, fieldName: string, fromIndex: number, toIndex: number) => void
}

export const InlineArrayOpsContext = createContext<InlineArrayOpsContextValue | null>(null)

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

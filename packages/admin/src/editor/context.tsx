import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from 'react'
import type { Data, EditorState, EditorAction, ContentEntity, ContentType, SaveStatus, PublishState } from './types'

// ── Reducer ──

const MAX_HISTORY = 50

const initialState: EditorState = {
  entity: null,
  contentType: 'page',
  puckData: null,
  hoveredBlockId: null,
  selectedBlockId: null,
  editingBlockId: null,
  editingField: null,
  saveStatus: 'idle',
  isDirty: false,
  isPublished: false,
  hasDraftChanges: false,
  publishState: 'draft',
}

function derivePublishState(isPublished: boolean, hasDraftChanges: boolean): PublishState {
  if (!isPublished) return 'draft'
  if (hasDraftChanges) return 'unpublished-changes'
  return 'published'
}

// History stack — mutable ref shared between provider and reducer
// Using a module-level object that gets REPLACED per EditorProvider instance
const history = { stack: [] as Data[], index: -1 }

function resetHistory() {
  history.stack = []
  history.index = -1
}

function pushHistory(data: Data) {
  history.stack = history.stack.slice(0, history.index + 1)
  history.stack.push(JSON.parse(JSON.stringify(data)))
  if (history.stack.length > MAX_HISTORY) history.stack.shift()
  history.index = history.stack.length - 1
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ENTITY': {
      const isPublished = action.entity.status === 'published'

      // Safely parse a JSON string into Puck Data, returning null on failure
      const safeParse = (json: string | null | undefined): Data | null => {
        if (!json) return null
        try {
          const parsed = JSON.parse(json)
          // Validate that the parsed data has a non-empty content array
          if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
            return parsed as Data
          }
          return null
        } catch {
          return null
        }
      }

      // Prefer draft if it has actual content, otherwise fall back to content_blocks
      const draftData = safeParse(action.entity.draft)
      const publishedData = safeParse(action.entity.content_blocks)
      const puckData = draftData || publishedData

      // Migrate legacy Hero props to new arrays
      if (puckData?.content) {
        for (const block of puckData.content) {
          if (block.type === 'Hero' && block.props) {
            const p = block.props
            // Migrate buttons
            if ((!p.buttons || p.buttons.length === 0) && (p.ctaPrimaryText || p.ctaSecondaryText)) {
              const btns: any[] = []
              if (p.ctaPrimaryText && p.ctaPrimaryLink) btns.push({ text: p.ctaPrimaryText, link: p.ctaPrimaryLink, variant: 'primary', showIcon: true })
              if (p.ctaSecondaryText && p.ctaSecondaryLink) btns.push({ text: p.ctaSecondaryText, link: p.ctaSecondaryLink, variant: 'secondary', showIcon: false })
              if (btns.length) p.buttons = btns
            }
            // Migrate subheading
            if ((!p.subheadings || p.subheadings.length === 0) && p.subheading) {
              p.subheadings = [{ text: p.subheading }]
            }
          }
        }
      }

      const hasDraft = draftData !== null
      const hasDraftChanges = hasDraft && isPublished

      return {
        ...state,
        entity: action.entity,
        contentType: action.contentType,
        puckData,
        isDirty: false,
        isPublished,
        hasDraftChanges,
        publishState: derivePublishState(isPublished, hasDraftChanges),
      }
    }
    case 'SET_PUCK_DATA': {
      // Once the user edits, there are always draft changes (relative to published)
      const hasDraftChanges = state.isPublished ? true : state.hasDraftChanges
      return {
        ...state,
        puckData: action.data,
        isDirty: true,
        hasDraftChanges,
        publishState: derivePublishState(state.isPublished, hasDraftChanges),
      }
    }
    case 'SET_HOVERED':
      return { ...state, hoveredBlockId: action.blockId }
    case 'SET_SELECTED':
      return {
        ...state,
        selectedBlockId: action.blockId,
        // Clear editing when deselecting
        editingBlockId: action.blockId === null ? null : state.editingBlockId,
        editingField: action.blockId === null ? null : state.editingField,
      }
    case 'ENTER_EDIT':
      return {
        ...state,
        selectedBlockId: action.blockId,
        editingBlockId: action.blockId,
        editingField: action.field,
      }
    case 'EXIT_EDIT':
      return { ...state, editingBlockId: null, editingField: null }
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.status }
    case 'MARK_DIRTY':
      return { ...state, isDirty: true }
    case 'MARK_CLEAN':
      return { ...state, isDirty: false }
    case 'MARK_PUBLISHED':
      return { ...state, isPublished: true, isDirty: false, hasDraftChanges: false, publishState: 'published' }
    case 'SET_DRAFT_STATE':
      return {
        ...state,
        hasDraftChanges: action.hasDraftChanges,
        publishState: derivePublishState(state.isPublished, action.hasDraftChanges),
      }
    case 'UNDO': {
      if (history.index <= 0) return state
      history.index--
      return { ...state, puckData: JSON.parse(JSON.stringify(history.stack[history.index])), isDirty: true }
    }
    case 'REDO': {
      if (history.index >= history.stack.length - 1) return state
      history.index++
      return { ...state, puckData: JSON.parse(JSON.stringify(history.stack[history.index])), isDirty: true }
    }
    default:
      return state
  }
}

// ── Context ──

interface EditorContextValue {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
  /** Set the entity being edited */
  setEntity: (entity: ContentEntity, contentType: ContentType) => void
  /** Update Puck data (triggers auto-save to draft) */
  updateData: (data: Data) => void
  /** Hover a block */
  hoverBlock: (blockId: string | null) => void
  /** Select a block */
  selectBlock: (blockId: string | null) => void
  /** Enter inline edit mode on a field */
  enterEdit: (blockId: string, field: string) => void
  /** Exit inline edit mode */
  exitEdit: () => void
  /** Set save status */
  setSaveStatus: (status: SaveStatus) => void
  /** Undo last block operation */
  undo: () => void
  /** Redo last undone operation */
  redo: () => void
  /** Whether undo/redo are available */
  canUndo: boolean
  canRedo: boolean
  /** Discard draft and revert to published content */
  discardDraft: () => Promise<void>
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}

export function useEditorState() {
  return useEditor().state
}

// ── Provider ──

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const CONTENT_TYPE_ROUTES: Record<ContentType, string> = {
  page: 'pages',
  post: 'posts',
  course: 'courses',
  product: 'products',
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const savedFeedbackRef = useRef<ReturnType<typeof setTimeout>>()
  const abortControllerRef = useRef<AbortController | null>(null)

  const setEntity = useCallback((entity: ContentEntity, contentType: ContentType) => {
    dispatch({ type: 'SET_ENTITY', entity, contentType })
  }, [])

  const setSaveStatus = useCallback((status: SaveStatus) => {
    dispatch({ type: 'SET_SAVE_STATUS', status })
  }, [])

  // Auto-save: debounced PATCH to /draft endpoint (never touches published content)
  const autoSave = useCallback((data: Data, entity: ContentEntity, contentType: ContentType) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      // Abort any in-flight save request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' })

      try {
        const route = CONTENT_TYPE_ROUTES[contentType]
        const res = await fetch(`${API_BASE}/admin/${route}/${entity.id}/draft`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: data.content,
            root: data.root,
            zones: data.zones,
          }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('Save failed')

        dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' })
        dispatch({ type: 'MARK_CLEAN' })

        // Mark that there are now draft changes (if entity is published)
        if (entity.status === 'published') {
          dispatch({ type: 'SET_DRAFT_STATE', hasDraftChanges: true })
        }

        if (savedFeedbackRef.current) clearTimeout(savedFeedbackRef.current)
        savedFeedbackRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' })
        }, 2000)
      } catch (err) {
        // Ignore aborted requests — a newer save superseded this one
        if (err instanceof DOMException && err.name === 'AbortError') return

        dispatch({ type: 'SET_SAVE_STATUS', status: 'error' })
        if (savedFeedbackRef.current) clearTimeout(savedFeedbackRef.current)
        savedFeedbackRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' })
        }, 3000)
      }
    }, 1000) // 1s debounce
  }, [])

  // Use a ref to track latest state for auto-save
  const stateRef = useRef(state)
  stateRef.current = state

  const updateDataWithSave = useCallback((data: Data) => {
    pushHistory(data)
    dispatch({ type: 'SET_PUCK_DATA', data })
    const { entity, contentType } = stateRef.current
    // Skip auto-save for new entities (no ID yet — will be created on first publish)
    if (entity && entity.id) {
      autoSave(data, entity, contentType)
    }
  }, [autoSave])

  const hoverBlock = useCallback((blockId: string | null) => {
    dispatch({ type: 'SET_HOVERED', blockId })
  }, [])

  const selectBlock = useCallback((blockId: string | null) => {
    dispatch({ type: 'SET_SELECTED', blockId })
  }, [])

  const enterEdit = useCallback((blockId: string, field: string) => {
    dispatch({ type: 'ENTER_EDIT', blockId, field })
  }, [])

  const exitEdit = useCallback(() => {
    dispatch({ type: 'EXIT_EDIT' })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
    // Trigger auto-save for the restored state
    setTimeout(() => {
      const { entity, contentType, puckData } = stateRef.current
      if (entity && entity.id && puckData) {
        autoSave(puckData, entity, contentType)
      }
    }, 0)
  }, [autoSave])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
    setTimeout(() => {
      const { entity, contentType, puckData } = stateRef.current
      if (entity && entity.id && puckData) {
        autoSave(puckData, entity, contentType)
      }
    }, 0)
  }, [autoSave])

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        // Don't intercept when user is typing in an input/textarea/contenteditable
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  // Reset history when entity changes
  useEffect(() => {
    resetHistory()
    if (state.puckData) {
      pushHistory(state.puckData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.entity?.id])

  // Cleanup timers and in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (savedFeedbackRef.current) clearTimeout(savedFeedbackRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  // Warn on tab close/navigation with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (stateRef.current.isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Discard draft: clear draft on server and reload published content
  const discardDraft = useCallback(async () => {
    const { entity, contentType } = stateRef.current
    if (!entity?.id) return

    const token = localStorage.getItem('admin_token')
    if (!token) return

    const route = CONTENT_TYPE_ROUTES[contentType]

    // Clear draft on server by saving null
    await fetch(`${API_BASE}/admin/${route}/${entity.id}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(null),
    })

    // Re-fetch the entity to get clean published content
    const res = await fetch(`${API_BASE}/admin/${route}/${entity.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to reload entity')

    const data = await res.json() as Record<string, any>
    const refreshed = data.page || data.post || data.course || data.product
    if (refreshed) {
      // Force draft to null so SET_ENTITY loads from content_blocks
      refreshed.draft = null
      dispatch({ type: 'SET_ENTITY', entity: refreshed, contentType })
    }
  }, [dispatch])

  const value: EditorContextValue = {
    state,
    dispatch,
    setEntity,
    updateData: updateDataWithSave,
    hoverBlock,
    selectBlock,
    enterEdit,
    exitEdit,
    setSaveStatus,
    undo,
    redo,
    canUndo: history.index > 0,
    canRedo: history.index < history.stack.length - 1,
    discardDraft,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

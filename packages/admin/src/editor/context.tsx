import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from 'react'
import type { Data, EditorState, EditorAction, ContentEntity, ContentType, SaveStatus } from './types'

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
}

// History stack — kept outside reducer for simplicity
let historyStack: Data[] = []
let historyIndex = -1

function pushHistory(data: Data) {
  // Truncate any redo entries
  historyStack = historyStack.slice(0, historyIndex + 1)
  historyStack.push(JSON.parse(JSON.stringify(data)))
  if (historyStack.length > MAX_HISTORY) historyStack.shift()
  historyIndex = historyStack.length - 1
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ENTITY':
      return {
        ...state,
        entity: action.entity,
        contentType: action.contentType,
        puckData: action.entity.content_blocks
          ? JSON.parse(action.entity.content_blocks)
          : null,
        isDirty: false,
        isPublished: action.entity.status === 'published',
      }
    case 'SET_PUCK_DATA':
      return { ...state, puckData: action.data, isDirty: true }
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
      return { ...state, isPublished: true, isDirty: false }
    case 'UNDO': {
      if (historyIndex <= 0) return state
      historyIndex--
      return { ...state, puckData: JSON.parse(JSON.stringify(historyStack[historyIndex])), isDirty: true }
    }
    case 'REDO': {
      if (historyIndex >= historyStack.length - 1) return state
      historyIndex++
      return { ...state, puckData: JSON.parse(JSON.stringify(historyStack[historyIndex])), isDirty: true }
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
  /** Update Puck data (triggers auto-save) */
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

  // Auto-save: debounced PATCH to API with AbortController to prevent race conditions
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
        const res = await fetch(`${API_BASE}/admin/${route}/${entity.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content_blocks: JSON.stringify(data),
            updated_at: entity.updated_at,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          if (res.status === 409) {
            dispatch({ type: 'SET_SAVE_STATUS', status: 'error' })
            return
          }
          throw new Error('Save failed')
        }

        const result = await res.json() as Record<string, any>
        const updated = result.page || result.post || result.course || result.product

        dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' })
        dispatch({ type: 'MARK_CLEAN' })

        // Update entity's updated_at for conflict detection
        if (updated?.updated_at) {
          dispatch({
            type: 'SET_ENTITY',
            entity: { ...entity, updated_at: updated.updated_at, content_blocks: JSON.stringify(data) },
            contentType,
          })
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
          dispatch({ type: 'REDO' })
        } else {
          dispatch({ type: 'UNDO' })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Reset history when entity changes
  useEffect(() => {
    historyStack = []
    historyIndex = -1
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
    canUndo: historyIndex > 0,
    canRedo: historyIndex < historyStack.length - 1,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

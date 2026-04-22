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
      const isPublished = action.entity.status === 'published' || action.entity.status === 'full'

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

      // Draft JSON now stores { content, root, zones, metadata? }. Extract the
      // metadata overlay so the admin UI shows draft metadata (e.g. an
      // auto-saved slug rename) instead of the last-published column values.
      const parseDraftMeta = (json: string | null | undefined): Record<string, any> | null => {
        if (!json) return null
        try {
          const parsed = JSON.parse(json)
          return parsed && typeof parsed.metadata === 'object' ? parsed.metadata : null
        } catch {
          return null
        }
      }
      const draftHasNonEmpty = (json: string | null | undefined): boolean => {
        if (!json) return false
        try {
          const parsed = JSON.parse(json)
          const hasContent = Array.isArray(parsed?.content) && parsed.content.length > 0
          const hasMeta = parsed?.metadata && typeof parsed.metadata === 'object' && Object.keys(parsed.metadata).length > 0
          return hasContent || hasMeta
        } catch {
          return false
        }
      }

      // If we already have puckData in state and the entity ID hasn't changed,
      // this is a metadata-only update (e.g. title, slug, settings) — preserve current blocks
      // Unless forceReload is set (discard draft, version restore, unpublish)
      const isMetadataUpdate = !action.forceReload && state.puckData && state.entity &&
        action.entity.id === state.entity.id &&
        action.contentType === state.contentType

      let puckData: Data | null
      let resolvedEntity: ContentEntity = action.entity

      if (isMetadataUpdate) {
        // Keep the in-memory blocks — don't re-derive from content_blocks
        puckData = state.puckData
      } else {
        // Fresh entity load — overlay any draft.metadata on the entity fields
        const draftMeta = parseDraftMeta(action.entity.draft)
        if (draftMeta) {
          resolvedEntity = { ...action.entity, ...draftMeta } as ContentEntity
        }

        // Fresh entity load — parse from stored data
        // Prefer draft if it has actual content, otherwise fall back to content_blocks
        const draftData = safeParse(action.entity.draft)
        const publishedData = safeParse(action.entity.content_blocks)
        puckData = draftData || publishedData

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
      }

      const hasDraft = isMetadataUpdate ? state.hasDraftChanges : draftHasNonEmpty(action.entity.draft)
      const hasDraftChanges = isMetadataUpdate ? (state.isDirty || state.hasDraftChanges) : (hasDraft && isPublished)

      return {
        ...state,
        entity: resolvedEntity,
        contentType: action.contentType,
        puckData,
        isDirty: isMetadataUpdate ? state.isDirty : false,
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
    case 'MARK_UNPUBLISHED':
      return { ...state, isPublished: false, isDirty: false, hasDraftChanges: false, publishState: 'draft' }
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
  /** Patch entity metadata (slug, title, etc.) — auto-saves into draft */
  updateEntityMeta: (patch: Partial<ContentEntity>) => void
  /** Cancel a pending debounced draft save (call before Publish to prevent
   *  a stale PATCH from re-creating a draft right after the PUT clears it). */
  cancelPendingSave: () => void
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
  /** Unpublish: set status back to draft */
  unpublish: () => Promise<void>
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

/** Metadata fields mirrored into draft JSON so slug/title/etc. auto-save
 *  behind the "Unpublished changes" state until the user clicks Publish.
 *  Keep in sync with columns accepted by the server PUT handlers. */
const METADATA_KEYS_BY_TYPE: Record<ContentType, string[]> = {
  page: ['slug', 'title', 'meta_description', 'parent_slug', 'sort_order'],
  post: ['slug', 'title', 'excerpt', 'featured_image', 'published_at'],
  course: [
    'slug', 'title', 'description', 'location',
    'start_date', 'end_date', 'price_sek', 'max_participants',
    'registration_deadline',
  ],
  product: [
    'slug', 'title', 'description', 'type',
    'price_sek', 'external_url', 'image_url', 'in_stock',
  ],
}

function buildMetadataSnapshot(entity: ContentEntity, contentType: ContentType): Record<string, any> {
  const e = entity as Record<string, any>
  const out: Record<string, any> = {}
  for (const key of METADATA_KEYS_BY_TYPE[contentType]) {
    if (key in e) out[key] = e[key]
  }
  return out
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

  // Track whether we're currently creating a new entity (prevent double-create)
  const creatingRef = useRef(false)

  // Use a ref to track latest state for auto-save
  const stateRef = useRef(state)
  stateRef.current = state

  // Auto-save: debounced PATCH to /draft endpoint (never touches published content).
  // Reads from stateRef so both content edits (updateData) and metadata edits
  // (updateEntityMeta) trigger the same flow. Draft JSON shape:
  //   { content, root, zones, metadata: { slug, title, ... } }
  // For new entities (no ID): auto-creates via POST first, then switches to PATCH.
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      const { entity, contentType, puckData } = stateRef.current
      if (!entity) return

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
        const data: Data = puckData || { content: [], root: { props: {} }, zones: {} }

        // New entity — create it first. Prefer any slug the user typed in the
        // settings drawer over an auto-generated one.
        if (!entity.id) {
          if (creatingRef.current) return // Already creating
          creatingRef.current = true

          const generatedSlug = (entity.title || 'untitled')
            .toLowerCase()
            .replace(/[åä]/g, 'a').replace(/ö/g, 'o')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            || `untitled-${Date.now().toString(36)}`
          const slug = entity.slug || generatedSlug

          const res = await fetch(`${API_BASE}/admin/${route}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: entity.title || 'Untitled',
              slug,
              content_blocks: JSON.stringify(data),
              editor_version: 'puck',
              status: 'draft',
            }),
            signal: controller.signal,
          })

          if (!res.ok) throw new Error('Create failed')
          const result = await res.json() as Record<string, any>
          const created = result.page || result.post || result.course || result.product

          if (created?.id) {
            // Update entity in state with the new ID
            const updatedEntity = { ...entity, id: created.id, slug: created.slug || slug }
            dispatch({ type: 'SET_ENTITY', entity: updatedEntity as ContentEntity, contentType })

            // Replace URL from /pages/new to /pages/:slug — admin URLs mirror public URLs.
            const newPath = `/${route}/${created.slug || slug}`
            window.history.replaceState(null, '', newPath)
          }

          creatingRef.current = false
          dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' })
          dispatch({ type: 'MARK_CLEAN' })

          if (savedFeedbackRef.current) clearTimeout(savedFeedbackRef.current)
          savedFeedbackRef.current = setTimeout(() => {
            dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' })
          }, 2000)
          return
        }

        // Existing entity — save draft via PATCH with metadata snapshot
        const metadata = buildMetadataSnapshot(entity, contentType)
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
            metadata,
          }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('Save failed')

        dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' })
        dispatch({ type: 'MARK_CLEAN' })

        // Mark that there are now draft changes (if entity is published)
        if (entity.status === 'published' || entity.status === 'full') {
          dispatch({ type: 'SET_DRAFT_STATE', hasDraftChanges: true })
        }

        if (savedFeedbackRef.current) clearTimeout(savedFeedbackRef.current)
        savedFeedbackRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' })
        }, 2000)
      } catch (err) {
        creatingRef.current = false
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

  const updateDataWithSave = useCallback((data: Data) => {
    pushHistory(data)
    dispatch({ type: 'SET_PUCK_DATA', data })
    if (stateRef.current.entity) {
      autoSave()
    }
  }, [autoSave])

  const updateEntityMeta = useCallback((patch: Partial<ContentEntity>) => {
    const { entity, contentType } = stateRef.current
    if (!entity) return
    const updated = { ...entity, ...patch }
    dispatch({ type: 'SET_ENTITY', entity: updated as ContentEntity, contentType })
    dispatch({ type: 'MARK_DIRTY' })
    autoSave()
  }, [autoSave])

  const cancelPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = undefined
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

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
      const { entity, puckData } = stateRef.current
      if (entity && entity.id && puckData) {
        autoSave()
      }
    }, 0)
  }, [autoSave])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
    setTimeout(() => {
      const { entity, puckData } = stateRef.current
      if (entity && entity.id && puckData) {
        autoSave()
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
      dispatch({ type: 'SET_ENTITY', entity: refreshed, contentType, forceReload: true })
    }
  }, [dispatch])

  // Unpublish: set status back to draft via PUT
  const unpublish = useCallback(async () => {
    const { entity, contentType } = stateRef.current
    if (!entity?.id) return

    const token = localStorage.getItem('admin_token')
    if (!token) return

    const route = CONTENT_TYPE_ROUTES[contentType]

    const res = await fetch(`${API_BASE}/admin/${route}/${entity.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...entity,
        content_blocks: entity.content_blocks,
        status: 'draft',
      }),
    })

    if (!res.ok) throw new Error('Unpublish failed')

    // Re-fetch entity to get updated state
    const refetch = await fetch(`${API_BASE}/admin/${route}/${entity.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!refetch.ok) throw new Error('Failed to reload entity')

    const data = await refetch.json() as Record<string, any>
    const refreshed = data.page || data.post || data.course || data.product
    if (refreshed) {
      dispatch({ type: 'SET_ENTITY', entity: refreshed, contentType, forceReload: true })
    }
  }, [dispatch])

  const value: EditorContextValue = {
    state,
    dispatch,
    setEntity,
    updateData: updateDataWithSave,
    updateEntityMeta,
    cancelPendingSave,
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
    unpublish,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

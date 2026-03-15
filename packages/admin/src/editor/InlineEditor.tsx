import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EditorProvider, useEditor } from './context'
import { EditorTopBar } from './components/EditorTopBar'
import { BlockList } from './components/BlockList'
import { BlockPanel } from './components/BlockPanel'
import { FloatingToolbar } from './components/FloatingToolbar'
import { SlashMenu } from './components/SlashMenu'
import { SelectedBlockArrayControls } from './components/InlineArrayControls'
import { VersionHistoryPanel } from './components/VersionHistoryPanel'
import { puckConfig } from '@livskompass/shared'
import type { ContentType, ContentEntity } from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const CONTENT_TYPE_ROUTES: Record<ContentType, string> = {
  page: 'pages',
  post: 'posts',
  course: 'courses',
  product: 'products',
}

const ADMIN_LIST_ROUTES: Record<ContentType, string> = {
  page: '/pages',
  post: '/posts',
  course: '/courses',
  product: '/products',
}

interface InlineEditorPageProps {
  contentType: ContentType
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  page: 'New page',
  post: 'New post',
  course: 'New course',
  product: 'New product',
}

function InlineEditorInner({ contentType }: InlineEditorPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setEntity, state, dispatch } = useEditor()
  const [user, setUser] = useState<{ name: string; avatar_url: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  const isNew = id === 'new'
  const toggleHistory = useCallback(() => setHistoryOpen((v) => !v), [])

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/login')
      return
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then((data: any) => {
        if (data.user?.role !== 'admin') throw new Error('Not admin')
        setUser(data.user)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  // Load entity data (or init blank for new)
  useEffect(() => {
    if (isNew) {
      const blankEntity: ContentEntity = {
        id: '',
        slug: '',
        title: CONTENT_TYPE_LABELS[contentType],
        status: 'draft',
        content_blocks: JSON.stringify({ content: [], root: { props: {} }, zones: {} }),
        editor_version: 'puck',
        updated_at: '',
        draft: null,
      }
      setEntity(blankEntity, contentType)
      // Mark dirty so publish button is enabled
      dispatch({ type: 'MARK_DIRTY' })
      setLoading(false)
      return
    }

    if (!id) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setLoading(true)
    setError(null)

    const route = CONTENT_TYPE_ROUTES[contentType]

    fetch(`${API_BASE}/admin/${route}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data: any) => {
        const entity: ContentEntity = data.page || data.post || data.course || data.product
        if (!entity) throw new Error('Entity not found in response')
        setEntity(entity, contentType)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, contentType, setEntity, isNew, dispatch])

  const handlePublish = async () => {
    if (!state.puckData) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const route = CONTENT_TYPE_ROUTES[contentType]

    try {
      if (isNew) {
        // Create new entity
        const slug = (state.entity?.title || CONTENT_TYPE_LABELS[contentType])
          .toLowerCase()
          .replace(/[åä]/g, 'a').replace(/ö/g, 'o')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        const res = await fetch(`${API_BASE}/admin/${route}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: state.entity?.title || CONTENT_TYPE_LABELS[contentType],
            slug,
            content_blocks: JSON.stringify(state.puckData),
            editor_version: 'puck',
            status: 'draft',
          }),
        })

        if (!res.ok) throw new Error('Create failed')
        const result = await res.json() as Record<string, any>
        const newEntity = result.page || result.post || result.course || result.product
        if (newEntity?.id) {
          navigate(`${ADMIN_LIST_ROUTES[contentType]}/${newEntity.id}`, { replace: true })
        }
        return
      }

      // Update existing entity
      const res = await fetch(`${API_BASE}/admin/${route}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...state.entity,
          content_blocks: JSON.stringify(state.puckData),
          editor_version: 'puck',
          status: 'published',
        }),
      })

      if (!res.ok) throw new Error('Publish failed')

      // Refresh entity
      const updated = await fetch(`${API_BASE}/admin/${route}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()) as Record<string, any>

      const entity = updated.page || updated.post || updated.course || updated.product
      if (entity) {
        setEntity(entity, contentType)
      }
    } catch (err) {
      console.error('Publish failed:', err)
    }
  }

  const handleBack = () => {
    navigate(ADMIN_LIST_ROUTES[contentType])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="flex items-center gap-2 text-stone-400">
          <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-50 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={handleBack}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <EditorTopBar user={user} onBack={handleBack} onPublish={handlePublish} onToggleHistory={toggleHistory} isNew={isNew} />

      {/* Left block panel — always visible */}
      <BlockPanel collapsed={panelCollapsed} onToggleCollapsed={() => setPanelCollapsed((v) => !v)} />

      {/* Content area — offset for top bar + left panel */}
      <main
        id="editor-content"
        className="pt-12 transition-[padding-left] duration-200"
        style={{ paddingLeft: panelCollapsed ? 36 : 240 }}
        role="main"
        aria-label="Page content"
      >
        <div
          className="max-w-[1440px] mx-auto"
          style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            backgroundColor: 'var(--surface-primary, #F8F6F2)',
          }}
        >
          <BlockList />
        </div>
      </main>

      {/* Array add controls for selected block */}
      <SelectedBlockArrayControls />

      {/* Floating toolbar for selected block */}
      <SelectedBlockToolbar />

      {/* "/" command for block insertion */}
      <SlashMenu />

      {/* Version history side panel */}
      <VersionHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Portal container for floating toolbar */}
      <div id="editor-portals" />

      {/* Accessibility: live region for save status announcements */}
      <SaveStatusAnnouncer />
    </div>
  )
}

function SaveStatusAnnouncer() {
  const { state } = useEditor()
  const messages: Record<string, string> = {
    saving: 'Saving changes...',
    saved: 'Changes saved',
    error: 'Save failed',
    idle: '',
  }
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {messages[state.saveStatus] || ''}
    </div>
  )
}

const components = puckConfig.components as Record<string, { label?: string }>

function SelectedBlockToolbar() {
  const { state } = useEditor()
  const { selectedBlockId, puckData } = state

  if (!selectedBlockId || !puckData) return null

  const items = puckData.content || []
  const blockIndex = items.findIndex(
    (item: any, i: number) => (item.props?.id || `${item.type}-${i}`) === selectedBlockId,
  )

  if (blockIndex === -1) return null

  const item = items[blockIndex]
  const blockType = components[item.type]?.label || item.type

  return (
    <FloatingToolbar
      blockId={selectedBlockId}
      blockType={blockType}
      blockIndex={blockIndex}
      totalBlocks={items.length}
    />
  )
}

export default function InlineEditorPage({ contentType }: InlineEditorPageProps) {
  return (
    <EditorProvider>
      <InlineEditorInner contentType={contentType} />
    </EditorProvider>
  )
}

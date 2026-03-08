import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EditorProvider, useEditor } from './context'
import { EditorTopBar } from './components/EditorTopBar'
import { BlockList } from './components/BlockList'
import type { ContentType, ContentEntity } from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const CONTENT_TYPE_ROUTES: Record<ContentType, string> = {
  page: 'pages',
  post: 'posts',
  course: 'courses',
  product: 'products',
}

const ADMIN_LIST_ROUTES: Record<ContentType, string> = {
  page: '/sidor',
  post: '/nyheter',
  course: '/utbildningar',
  product: '/material',
}

interface InlineEditorPageProps {
  contentType: ContentType
}

function InlineEditorInner({ contentType }: InlineEditorPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setEntity, state } = useEditor()
  const [user, setUser] = useState<{ name: string; avatar_url: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Load entity data
  useEffect(() => {
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
  }, [id, contentType, setEntity])

  const handlePublish = async () => {
    if (!id || !state.entity || !state.puckData) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const route = CONTENT_TYPE_ROUTES[contentType]

    try {
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
      <EditorTopBar user={user} onBack={handleBack} onPublish={handlePublish} />

      {/* Content area — offset for top bar */}
      <div className="pt-12">
        <div
          className="max-w-[1440px] mx-auto"
          style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            backgroundColor: 'var(--surface-primary, #F8F6F2)',
          }}
        >
          <BlockList />
        </div>
      </div>

      {/* Portal container for floating toolbar (Phase 3) */}
      <div id="editor-portals" />
    </div>
  )
}

export default function InlineEditorPage({ contentType }: InlineEditorPageProps) {
  return (
    <EditorProvider>
      <InlineEditorInner contentType={contentType} />
    </EditorProvider>
  )
}

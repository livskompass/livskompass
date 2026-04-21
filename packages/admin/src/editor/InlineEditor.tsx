import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { EditorProvider, useEditor } from './context'
import { EditorTopBar } from './components/EditorTopBar'
import { BlockList } from './components/BlockList'
import { BlockPanel } from './components/BlockPanel'
import { FloatingToolbar } from './components/FloatingToolbar'
import { SlashMenu } from './components/SlashMenu'
import { SelectedBlockArrayControls } from './components/InlineArrayControls'
import { VersionHistoryPanel } from './components/VersionHistoryPanel'
import { EntitySettingsDrawer } from './components/EntitySettingsDrawer'
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

/** Default block templates per content type */
function getDefaultTemplate(contentType: ContentType) {
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  switch (contentType) {
    case 'course':
      return {
        content: [
          { type: 'CourseInfo', props: { id: `CourseInfo-${uid()}`, sectionBg: 'transparent', showDeadline: true, showEmpty: false, layout: 'grid' } },
          { type: 'RichText', props: { id: `RichText-${uid()}`, content: '<h2>Om kursen</h2><p>Beskriv kursen här...</p>', maxWidth: 'medium', position: 'center', alignment: 'left', fontSize: 'normal', textColor: 'default' } },
          { type: 'BookingForm', props: { id: `BookingForm-${uid()}`, sectionBg: 'transparent', showOrganization: true, showNotes: true } },
        ],
        root: { props: {} },
        zones: {},
      }
    case 'post':
      return {
        content: [
          { type: 'PostHeader', props: { id: `PostHeader-${uid()}`, sectionBg: 'transparent', showBackLink: true, backLinkText: 'Tillbaka till nyheter', backLinkUrl: '/nyheter' } },
          { type: 'RichText', props: { id: `RichText-${uid()}`, content: '<p>Skriv ditt inlägg här...</p>', maxWidth: 'medium', position: 'center', alignment: 'left', fontSize: 'normal', textColor: 'default' } },
        ],
        root: { props: {} },
        zones: {},
      }
    case 'product':
      return {
        content: [
          { type: 'PageHeader', props: { id: `PageHeader-${uid()}`, sectionBg: 'transparent', alignment: 'left', size: 'large', showDivider: true } },
          { type: 'RichText', props: { id: `RichText-${uid()}`, content: '<p>Beskriv produkten här...</p>', maxWidth: 'medium', position: 'center', alignment: 'left', fontSize: 'normal', textColor: 'default' } },
        ],
        root: { props: {} },
        zones: {},
      }
    case 'page':
    default:
      return { content: [], root: { props: {} }, zones: {} }
  }
}

/**
 * Extract legacy HTML content from a WordPress-migrated entity.
 * Pages/posts store HTML in `content`, courses/products in `description`.
 */
function getLegacyHtml(entity: Record<string, any>, contentType: ContentType): string | null {
  if (contentType === 'page' || contentType === 'post') {
    return entity.content || null
  }
  if (contentType === 'course' || contentType === 'product') {
    return entity.description || entity.content || null
  }
  return null
}

/**
 * Convert legacy HTML content to a Puck data structure with a RichText block.
 * Called when content_blocks is null but HTML content exists.
 */
function legacyHtmlToPuckData(html: string): string {
  return JSON.stringify({
    content: [
      {
        type: 'RichText',
        props: {
          id: `RichText-migrated-${Date.now()}`,
          content: html,
          maxWidth: 'medium',
        },
      },
    ],
    root: { props: {} },
    zones: {},
  })
}

function InlineEditorInner({ contentType }: InlineEditorPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setEntity, state, dispatch, unpublish } = useEditor()
  const [user, setUser] = useState<{ name: string; avatar_url: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [legacyConverted, setLegacyConverted] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(() => window.innerWidth < 1024)

  // Auto-collapse block panel on small screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e: MediaQueryListEvent) => setPanelCollapsed(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const [entitySettingsOpen, setEntitySettingsOpen] = useState(false)

  const isNew = id === 'new'

  // EMERGENCY: Force loading false for new entities immediately
  if (isNew && loading) {
    const blankEntity: ContentEntity = {
      id: '', slug: '', title: CONTENT_TYPE_LABELS[contentType],
      status: 'draft',
      content_blocks: JSON.stringify(getDefaultTemplate(contentType)),
      editor_version: 'puck', updated_at: '', draft: null,
    }
    // Use queueMicrotask to set state outside render
    queueMicrotask(() => {
      setEntity(blankEntity, contentType)
      dispatch({ type: 'MARK_DIRTY' })
      setLoading(false)
    })
  }
  const toggleHistory = useCallback(() => setHistoryOpen((v) => !v), [])
  const toggleEntitySettings = useCallback(() => setEntitySettingsOpen((v) => !v), [])

  // Listen for open-entity-settings custom event (from SettingsPopover shortcut button)
  useEffect(() => {
    const handler = () => setEntitySettingsOpen(true)
    window.addEventListener('open-entity-settings', handler)
    return () => window.removeEventListener('open-entity-settings', handler)
  }, [])

  // Auth — get user info (ProtectedRoute already verified auth)
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { navigate('/login'); return }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data: any) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {}) // Don't redirect — ProtectedRoute handles that
  }, [navigate])

  // Safety timeout — if loading takes too long, force-show the editor
  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      if (isNew) {
        console.warn('[Editor] Loading timeout — force-initializing new entity')
        const blankEntity: ContentEntity = {
          id: '',
          slug: '',
          title: CONTENT_TYPE_LABELS[contentType],
          status: 'draft',
          content_blocks: JSON.stringify(getDefaultTemplate(contentType)),
          editor_version: 'puck',
          updated_at: '',
          draft: null,
        }
        setEntity(blankEntity, contentType)
        dispatch({ type: 'MARK_DIRTY' })
        setLoading(false)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [loading, isNew, contentType, setEntity, dispatch])

  // Load entity data (or init blank for new)
  useEffect(() => {
    if (isNew) {
      try {
        const blankEntity: ContentEntity = {
          id: '',
          slug: '',
          title: CONTENT_TYPE_LABELS[contentType],
          status: 'draft',
          content_blocks: JSON.stringify(getDefaultTemplate(contentType)),
          editor_version: 'puck',
          updated_at: '',
          draft: null,
        }
        setEntity(blankEntity, contentType)
        dispatch({ type: 'MARK_DIRTY' })
        setLoading(false)
      } catch (err) {
        console.error('[Editor] Failed to init new entity:', err)
        setLoading(false)
      }
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
        const entity = data.page || data.post || data.course || data.product
        if (!entity) throw new Error('Entity not found in response')

        // Auto-convert legacy HTML to Puck blocks if content_blocks is empty or has no blocks
        const hasValidBlocks = (() => {
          if (!entity.content_blocks) return false
          try {
            const parsed = JSON.parse(entity.content_blocks)
            return Array.isArray(parsed.content) && parsed.content.length > 0
          } catch {
            return false
          }
        })()

        if (!hasValidBlocks) {
          const legacyHtml = getLegacyHtml(entity, contentType)
          if (legacyHtml) {
            entity.content_blocks = legacyHtmlToPuckData(legacyHtml)
            entity.editor_version = 'puck'
            setLegacyConverted(true)
          }
        }

        // Also clear a bad draft that has empty content — prevents draft from hiding valid content_blocks
        if (entity.draft) {
          try {
            const draftParsed = JSON.parse(entity.draft)
            if (!Array.isArray(draftParsed.content) || draftParsed.content.length === 0) {
              entity.draft = null
            }
          } catch {
            entity.draft = null
          }
        }

        setEntity(entity as ContentEntity, contentType)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, contentType, setEntity, isNew, dispatch])

  const handlePublish = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    // For existing entities we require in-memory puckData. For new entities we
    // accept an empty page — the user may want to create the record first and
    // add blocks after.
    if (!isNew && !state.puckData) return
    const puckData = state.puckData || { content: [], root: { props: {} }, zones: {} }

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
            content_blocks: JSON.stringify(puckData),
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
          content_blocks: JSON.stringify(puckData),
          editor_version: 'puck',
          status: 'published',
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Publish response:', res.status, errBody)
        throw new Error(errBody.error || `Publish failed (${res.status})`)
      }

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
      showToast('Publish failed. Please try again.', 'error')
    }
  }

  const handleUnpublish = async () => {
    try {
      await unpublish()
      showToast('Reverted to draft', 'success')
    } catch (err) {
      console.error('Unpublish failed:', err)
      showToast('Unpublish failed. Please try again.', 'error')
    }
  }

  const handleBack = () => {
    const route = CONTENT_TYPE_ROUTES[contentType]
    queryClient.invalidateQueries({ queryKey: [`admin-${route}`] })
    navigate(ADMIN_LIST_ROUTES[contentType])
  }

  if (loading && !isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={handleBack}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <EditorTopBar user={user} onBack={handleBack} onPublish={handlePublish} onUnpublish={handleUnpublish} onToggleHistory={toggleHistory} onToggleEntitySettings={toggleEntitySettings} isNew={isNew} />

      {/* Legacy conversion banner */}
      {legacyConverted && (
        <div className="fixed top-12 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
          <span>This page was converted from legacy content. <strong>Publish to save the migration.</strong></span>
          <button onClick={() => setLegacyConverted(false)} className="ml-2 text-amber-600 hover:text-amber-800 font-medium">Dismiss</button>
        </div>
      )}

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
          className="max-w-[1280px] mx-auto"
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

      {/* Entity settings drawer (slug, metadata, course/product fields) */}
      <EntitySettingsDrawer open={entitySettingsOpen} onClose={() => setEntitySettingsOpen(false)} contentType={contentType} />

      {/* Portal container for floating toolbar */}
      <div id="editor-portals" />

      {/* Accessibility: live region for save status announcements */}
      <SaveStatusAnnouncer />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg flex items-center gap-2"
          style={{
            background: toast.type === 'error' ? 'var(--editor-red, #dc2626)' : 'var(--editor-green, #16a34a)',
            animation: 'editor-bounce-in 200ms ease-out forwards',
          }}
          role="alert"
        >
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

function SaveStatusAnnouncer() {
  const { state } = useEditor()
  const messages: Record<string, string> = {
    saving: 'Saving draft...',
    saved: 'Draft saved',
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
  const blockLabel = components[item.type]?.label || item.type

  return (
    <FloatingToolbar
      blockId={selectedBlockId}
      blockType={item.type}
      blockLabel={blockLabel}
      blockIndex={blockIndex}
      totalBlocks={items.length}
      onOpenEntitySettings={() => window.dispatchEvent(new CustomEvent('open-entity-settings'))}
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
// force-reload 1773588881

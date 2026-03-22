import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { sanitizeHtml } from '../lib/sanitize'
import EditToolbar from './EditToolbar'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface PageEditData {
  pageId: string
  contentType: 'page' | 'post' | 'course' | 'product'
  contentBlocks: string
  updatedAt: string
}

interface InlineEditContextValue {
  isAdmin: boolean
  editUiVisible: boolean
  pageData: PageEditData | null
  /** Update a specific block's prop and save to API */
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
  savingStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isAdmin: false,
  editUiVisible: true,
  pageData: null,
  saveBlockProp: () => {},
  savingStatus: 'idle',
})

export function useInlineEdit() {
  return useContext(InlineEditContext)
}

export function setPageEditData(data: PageEditData | null) {
  _setPageData?.(data)
}

let _setPageData: ((data: PageEditData | null) => void) | null = null

export default function InlineEditProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [toolbarHidden, setToolbarHidden] = useState(false)
  const [overlaysVisible, setOverlaysVisible] = useState(true)
  const [pageData, setPageData] = useState<PageEditData | null>(null)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const tokenRef = useRef<string | null>(null)

  // Expose setter for external use (UniversalPage)
  useEffect(() => {
    _setPageData = setPageData
    return () => { _setPageData = null }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      // Read the session token from localStorage (shared with admin panel on same domain)
      const token = localStorage.getItem('admin_token')
      if (!token) return

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user?.role === 'admin') {
            tokenRef.current = token
            setIsAdmin(true)
          }
        }
      } catch {
        // Not authenticated — normal visitor
      }
    }
    checkAuth()
  }, [])

  const saveBlockProp = useCallback(
    (blockIndex: number, propName: string, value: string) => {
      if (!pageData || !tokenRef.current) return

      try {
        const parsed = JSON.parse(pageData.contentBlocks)
        if (!parsed.content?.[blockIndex]) return

        // Sanitize HTML content before saving
        const sanitizedValue = propName === 'content' ? sanitizeHtml(value) : value

        // Optimistic update — handle nested paths like "items[0].quote"
        const arrayMatch = propName.match(/^(\w+)\[(\d+)\]\.(\w+)$/)
        if (arrayMatch) {
          const [, arrName, idxStr, field] = arrayMatch
          const arr = parsed.content[blockIndex].props[arrName]
          if (Array.isArray(arr) && arr[Number(idxStr)]) {
            arr[Number(idxStr)][field] = sanitizedValue
          }
        } else {
          parsed.content[blockIndex].props[propName] = sanitizedValue
        }
        const newBlocks = JSON.stringify(parsed)

        setPageData((prev) =>
          prev ? { ...prev, contentBlocks: newBlocks } : null,
        )

        setSavingStatus('saving')

        const apiRoute = { page: 'pages', post: 'posts', course: 'courses', product: 'products' }[pageData.contentType] || 'pages'

        fetch(`${API_BASE}/admin/${apiRoute}/${pageData.pageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenRef.current}`,
          },
          body: JSON.stringify({
            content_blocks: newBlocks,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Save failed')
            return res.json()
          })
          .then((data: any) => {
            setSavingStatus('saved')
            // Update updatedAt for conflict detection
            const entity = data.page || data.post || data.course || data.product
            if (entity?.updated_at) {
              setPageData((prev) =>
                prev ? { ...prev, updatedAt: entity.updated_at } : null,
              )
            }
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
            savedTimerRef.current = setTimeout(() => setSavingStatus('idle'), 2000)
          })
          .catch(() => {
            setSavingStatus('error')
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
            savedTimerRef.current = setTimeout(() => setSavingStatus('idle'), 3000)
          })
      } catch {
        setSavingStatus('error')
      }
    },
    [pageData],
  )

  return (
    <InlineEditContext.Provider value={{ isAdmin, editUiVisible: overlaysVisible, pageData, saveBlockProp, savingStatus }}>
      {/* Data attribute for shared components to check overlay visibility */}
      {isAdmin && <style>{overlaysVisible ? '' : '[data-edit-badge], [data-edit-overlay] { display: none !important; }'}</style>}
      {children}
      {isAdmin && !toolbarHidden && (
        <EditToolbar
          onHide={() => setToolbarHidden(true)}
          savingStatus={savingStatus}
          editUiVisible={overlaysVisible}
          onToggleEditUi={() => setOverlaysVisible((v) => !v)}
        />
      )}
    </InlineEditContext.Provider>
  )
}

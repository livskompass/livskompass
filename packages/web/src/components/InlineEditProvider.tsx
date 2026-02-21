import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { sanitizeHtml } from '../lib/sanitize'
import EditToolbar from './EditToolbar'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface PageEditData {
  pageId: string
  contentBlocks: string
  updatedAt: string
}

interface InlineEditContextValue {
  isAdmin: boolean
  pageData: PageEditData | null
  /** Update a specific block's prop and save to API */
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
  savingStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isAdmin: false,
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
  const [hidden, setHidden] = useState(false)
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

        // Optimistic update
        parsed.content[blockIndex].props[propName] = sanitizedValue
        const newBlocks = JSON.stringify(parsed)

        setPageData((prev) =>
          prev ? { ...prev, contentBlocks: newBlocks } : null,
        )

        setSavingStatus('saving')

        fetch(`${API_BASE}/admin/pages/${pageData.pageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenRef.current}`,
          },
          body: JSON.stringify({
            content_blocks: newBlocks,
            updated_at: pageData.updatedAt,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Save failed')
            return res.json()
          })
          .then((data: any) => {
            setSavingStatus('saved')
            // Update updatedAt for conflict detection
            if (data.page?.updated_at) {
              setPageData((prev) =>
                prev ? { ...prev, updatedAt: data.page.updated_at } : null,
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
    <InlineEditContext.Provider value={{ isAdmin, pageData, saveBlockProp, savingStatus }}>
      {children}
      {isAdmin && !hidden && (
        <EditToolbar onHide={() => setHidden(true)} savingStatus={savingStatus} />
      )}
    </InlineEditContext.Provider>
  )
}

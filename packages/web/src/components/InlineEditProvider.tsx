import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import EditToolbar from './EditToolbar'

interface InlineEditContextValue {
  isAdmin: boolean
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isAdmin: false,
})

export function useInlineEdit() {
  return useContext(InlineEditContext)
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function InlineEditProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Check if user has a valid admin session via cookie
    // This only works when both admin and web share the same parent domain
    // (e.g., admin.livskompass.se and livskompass.se with cookie on .livskompass.se)
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.user?.role === 'admin') {
            setIsAdmin(true)
          }
        }
      } catch {
        // Not authenticated — normal visitor
      }
    }

    checkAuth()
  }, [])

  return (
    <InlineEditContext.Provider value={{ isAdmin }}>
      {children}
      {isAdmin && !hidden && (
        <EditToolbar onHide={() => setHidden(true)} />
      )}
    </InlineEditContext.Provider>
  )
}

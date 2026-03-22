import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Newspaper } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResult {
  title: string
  excerpt: string
  url: string
  type: 'page' | 'post' | string
}

// ---------------------------------------------------------------------------
// SiteSearch
// ---------------------------------------------------------------------------

interface SiteSearchProps {
  open: boolean
  onClose: () => void
}

export function SiteSearch({ open, onClose }: SiteSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const navigate = useNavigate()

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      // Small delay to ensure the DOM has rendered
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    // Reset state when closed
    setQuery('')
    setResults([])
    setSearched(false)
    setLoading(false)
  }, [open])

  // Escape key to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Debounced search
  const doSearch = useCallback(
    (q: string) => {
      // Cancel previous debounce
      if (debounceRef.current) clearTimeout(debounceRef.current)

      // If empty, clear results
      if (!q.trim()) {
        setResults([])
        setSearched(false)
        setLoading(false)
        return
      }

      setLoading(true)

      debounceRef.current = setTimeout(async () => {
        // Cancel previous in-flight request
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        try {
          const res = await fetch(
            `${API_BASE}/search?q=${encodeURIComponent(q.trim())}`,
            { signal: controller.signal }
          )
          if (!res.ok) throw new Error('Search failed')
          const data = await res.json()
          setResults(Array.isArray(data) ? data : data.results ?? [])
          setSearched(true)
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setResults([])
          setSearched(true)
        } finally {
          setLoading(false)
        }
      }, 300)
    },
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    doSearch(value)
  }

  const handleResultClick = (url: string) => {
    onClose()
    navigate(url)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  if (!open) return null

  const typeBadge = (type: string) => {
    const isPost = type === 'post'
    const Icon = isPost ? Newspaper : FileText
    const label = isPost ? 'Nyhet' : 'Sida'

    return (
      <span className="inline-flex items-center gap-1 text-overline text-muted shrink-0">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sök på webbplatsen"
    >
      <div className="w-full max-w-[600px] mx-4 bg-surface-elevated rounded-lg shadow-xl overflow-hidden">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-5 border-b border-default">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Sök..."
            className="flex-1 py-4 text-h3 bg-transparent text-foreground placeholder:text-faint outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
            aria-label="Stäng sök"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[calc(70vh-80px)] overflow-y-auto">
          {/* Empty state — no query yet */}
          {!query.trim() && !loading && (
            <div className="px-5 py-10 text-center text-muted text-body-sm">
              Skriv för att söka...
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-5 py-10 text-center text-muted text-body-sm">
              Söker...
            </div>
          )}

          {/* No results */}
          {!loading && searched && results.length === 0 && query.trim() && (
            <div className="px-5 py-10 text-center text-muted text-body-sm">
              Inga resultat för &ldquo;{query.trim()}&rdquo;
            </div>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <ul className="py-2" role="listbox">
              {results.map((result, i) => (
                <li key={`${result.url}-${i}`} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left px-5 py-3 hover:bg-surface-alt transition-colors flex items-start gap-3 group"
                  >
                    <div className="pt-0.5">{typeBadge(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                        {result.title}
                      </p>
                      {result.excerpt && (
                        <p className="text-body-sm text-muted line-clamp-1 mt-0.5">
                          {result.excerpt}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchButton
// ---------------------------------------------------------------------------

export function SearchButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer opacity-75 hover:opacity-100 transition-opacity ${className ?? ''}`}
      aria-label="Sök"
    >
      <Search className="w-5 h-5" />
    </button>
  )
}

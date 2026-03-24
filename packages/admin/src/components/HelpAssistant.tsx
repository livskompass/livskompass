import { useState, useEffect, useRef, useCallback } from 'react'
import {
  HelpCircle, Search, X, ChevronLeft, ChevronDown, ChevronRight, Minimize2, Maximize2,
  Archive, ArchiveRestore, Trash2, Copy, Pencil, Plus, Settings, GripVertical,
  Eye, FileText, Newspaper, GraduationCap, ShoppingBag, Image, Mail, Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { helpArticles, helpCategories } from '../data/help-content'
import type { HelpArticle } from '../data/help-content'

/** Map of icon names to Lucide components for inline rendering in help text */
const ICON_MAP: Record<string, LucideIcon> = {
  archive: Archive, restore: ArchiveRestore, trash: Trash2, copy: Copy,
  pencil: Pencil, plus: Plus, settings: Settings, grip: GripVertical,
  eye: Eye, page: FileText, post: Newspaper, course: GraduationCap,
  product: ShoppingBag, image: Image, mail: Mail, users: Users,
  search: Search,
}

/** Renders text with inline {icon:name} markers replaced by actual icons */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\{icon:[a-zA-Z]+\})/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{icon:([a-zA-Z]+)\}$/)
        if (match) {
          const Icon = ICON_MAP[match[1].toLowerCase()]
          if (Icon) return <Icon key={i} className="inline-block h-3.5 w-3.5 align-text-bottom mx-0.5 text-zinc-500" />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

const STORAGE_KEY = 'cms-help-state'

interface HelpState {
  lastSearch: string
  lastArticleId: string | null
  minimized: boolean
}

function loadState(): HelpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { lastSearch: '', lastArticleId: null, minimized: false }
}

function saveState(state: Partial<HelpState>) {
  try {
    const current = loadState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }))
  } catch {}
}

export default function HelpAssistant() {
  const saved = useRef(loadState())
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(saved.current.minimized)
  const [search, setSearch] = useState(saved.current.lastSearch)
  const [activeArticle, setActiveArticle] = useState<HelpArticle | null>(
    saved.current.lastArticleId
      ? helpArticles.find((a) => a.id === saved.current.lastArticleId) || null
      : null
  )
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Persist state
  useEffect(() => {
    saveState({ lastSearch: search, lastArticleId: activeArticle?.id || null, minimized })
  }, [search, activeArticle, minimized])

  // Focus search on open
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [open, minimized])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeArticle) {
          setActiveArticle(null)
        } else {
          setOpen(false)
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, activeArticle])

  interface SearchResult {
    article: HelpArticle
    score: number
    matchSnippet: string
    matchSource: 'title' | 'keyword' | 'step' | 'setting' | 'tip'
  }

  const searchResults = useCallback((): SearchResult[] | null => {
    const q = search.toLowerCase().trim()
    if (!q) return null

    const words = q.split(/\s+/).filter(Boolean)
    const results: SearchResult[] = []

    for (const article of helpArticles) {
      let bestScore = 0
      let matchSnippet = ''
      let matchSource: SearchResult['matchSource'] = 'title'

      const titleLower = article.title.toLowerCase()

      // Exact title match — highest score
      if (titleLower === q) {
        bestScore = 100
        matchSnippet = article.steps[0] || ''
        matchSource = 'title'
      }
      // Title contains query
      else if (titleLower.includes(q)) {
        bestScore = 80
        matchSnippet = article.steps[0] || ''
        matchSource = 'title'
      }
      // Title contains all words
      else if (words.every((w) => titleLower.includes(w))) {
        bestScore = 70
        matchSnippet = article.steps[0] || ''
        matchSource = 'title'
      }

      // Keyword exact match
      for (const kw of article.keywords) {
        if (kw === q && bestScore < 75) {
          bestScore = 75
          matchSnippet = article.steps[0] || ''
          matchSource = 'keyword'
        } else if (kw.includes(q) && bestScore < 60) {
          bestScore = 60
          matchSnippet = article.steps[0] || ''
          matchSource = 'keyword'
        } else if (words.some((w) => kw.includes(w)) && bestScore < 40) {
          bestScore = 40
          matchSnippet = article.steps[0] || ''
          matchSource = 'keyword'
        }
      }

      // Step content match — show the matching step as snippet
      for (const step of article.steps) {
        const stepLower = step.toLowerCase()
        if (stepLower.includes(q) && bestScore < 50) {
          bestScore = 50
          matchSnippet = step
          matchSource = 'step'
        } else if (words.every((w) => stepLower.includes(w)) && bestScore < 45) {
          bestScore = 45
          matchSnippet = step
          matchSource = 'step'
        } else if (words.some((w) => stepLower.includes(w)) && bestScore < 25) {
          bestScore = 25
          matchSnippet = step
          matchSource = 'step'
        }
      }

      // Settings match
      if (article.settings) {
        for (const s of article.settings) {
          const combined = `${s.name} ${s.description}`.toLowerCase()
          if (combined.includes(q) && bestScore < 45) {
            bestScore = 45
            matchSnippet = `${s.name} — ${s.description}`
            matchSource = 'setting'
          } else if (words.some((w) => combined.includes(w)) && bestScore < 20) {
            bestScore = 20
            matchSnippet = `${s.name} — ${s.description}`
            matchSource = 'setting'
          }
        }
      }

      // Tips match
      if (article.tips) {
        for (const tip of article.tips) {
          if (tip.toLowerCase().includes(q) && bestScore < 35) {
            bestScore = 35
            matchSnippet = tip
            matchSource = 'tip'
          }
        }
      }

      if (bestScore > 0) {
        results.push({ article, score: bestScore, matchSnippet, matchSource })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }, [search])

  const results = searchResults()

  // Highlight matching terms in text
  const highlightMatch = (text: string, maxLen = 100) => {
    const q = search.toLowerCase().trim()
    if (!q || !text) return text.length > maxLen ? text.slice(0, maxLen) + '...' : text

    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) {
      // Try matching individual words
      const words = q.split(/\s+/)
      let result = text.length > maxLen ? text.slice(0, maxLen) + '...' : text
      for (const word of words) {
        if (!word) continue
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        result = result.replace(regex, '**$1**')
      }
      return result
    }

    // Show context around the match
    const start = Math.max(0, idx - 20)
    const end = Math.min(text.length, idx + q.length + 60)
    let snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    snippet = snippet.replace(regex, '**$1**')
    return snippet
  }

  const articlesByCategory = (categoryId: string) =>
    helpArticles.filter((a) => a.category === categoryId)

  const openArticle = (article: HelpArticle) => {
    setActiveArticle(article)
    setMinimized(false)
  }

  const toggleMinimize = () => {
    setMinimized(!minimized)
  }

  // Minimized state — small pill
  if (open && minimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5">
        <button
          onClick={toggleMinimize}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white rounded-xl shadow-lg hover:bg-zinc-800 transition-all text-sm font-medium"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {activeArticle ? activeArticle.title : 'CMS Guide'}
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </div>
    )
  }

  // Closed state — floating button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 bg-zinc-900 text-white rounded-xl shadow-lg hover:bg-zinc-800 hover:scale-105 transition-all flex items-center justify-center"
        title="CMS Guide"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    )
  }

  // Open state — full panel
  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-50 w-[380px] max-h-[min(600px,calc(100vh-80px))] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
      style={{ animation: 'editor-scale-in 150ms ease forwards' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50/80 shrink-0">
        {activeArticle ? (
          <>
            <button
              onClick={() => setActiveArticle(null)}
              className="p-1 -ml-1 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-500" />
            </button>
            <h3 className="text-sm font-semibold text-zinc-900 flex-1 truncate">
              {activeArticle.title}
            </h3>
          </>
        ) : (
          <>
            <HelpCircle className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
            <h3 className="text-sm font-semibold text-zinc-900 flex-1">CMS Guide</h3>
          </>
        )}
        <button
          onClick={toggleMinimize}
          className="p-1 rounded-lg hover:bg-zinc-200 transition-colors"
          title="Minimize"
        >
          <Minimize2 className="h-3.5 w-3.5 text-zinc-400" />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-lg hover:bg-zinc-200 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4 text-zinc-400" />
        </button>
      </div>

      {/* Search — always visible unless viewing an article */}
      {!activeArticle && (
        <div className="px-3 py-2.5 border-b border-zinc-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search help topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-8 pr-8 py-2 rounded-lg border border-zinc-200 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-zinc-100"
              >
                <X className="h-3 w-3 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {activeArticle ? (
          // ── Article detail view ──
          <div className="p-4 space-y-4">
            {/* Category badge */}
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              {helpCategories.find((c) => c.id === activeArticle.category)?.label}
            </span>

            {/* Steps */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                How to use
              </h4>
              <ol className="space-y-2">
                {activeArticle.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-zinc-700 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span><RichText text={step} /></span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Settings */}
            {activeArticle.settings && activeArticle.settings.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Settings
                </h4>
                <div className="space-y-1.5">
                  {activeArticle.settings.map((s, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-zinc-800">{s.name}</span>
                      <span className="text-zinc-400 mx-1.5">&mdash;</span>
                      <span className="text-zinc-600"><RichText text={s.description} /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {activeArticle.tips && activeArticle.tips.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
                  Tips
                </h4>
                <ul className="space-y-1">
                  {activeArticle.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-800 leading-relaxed flex gap-2">
                      <span className="shrink-0 mt-1 text-amber-500">&bull;</span>
                      <span><RichText text={tip} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : results ? (
          // ── Search results with snippets ──
          results.length > 0 ? (
            <div className="py-1">
              {results.map(({ article, matchSnippet, matchSource }) => {
                const snippet = highlightMatch(matchSnippet)
                const sourceLabel = matchSource === 'step' ? 'Step' : matchSource === 'setting' ? 'Setting' : matchSource === 'tip' ? 'Tip' : null

                return (
                  <button
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors group border-b border-zinc-50 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-800 group-hover:text-zinc-900">
                          {article.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {helpCategories.find((c) => c.id === article.category)?.label}
                        </div>
                        {matchSnippet && (
                          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                            {sourceLabel && (
                              <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-100 rounded px-1 py-px mr-1.5 align-middle">
                                {sourceLabel}
                              </span>
                            )}
                            {snippet.split('**').map((part, i) =>
                              i % 2 === 1 ? (
                                <mark key={i} className="bg-amber-100 text-amber-900 rounded-sm px-0.5 font-medium">
                                  {part}
                                </mark>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-400 shrink-0 mt-1" />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Search className="h-8 w-8 text-zinc-200 mb-2" />
              <p className="text-sm text-zinc-400">No results for "{search}"</p>
              <p className="text-xs text-zinc-300 mt-1">Try: block names, "publish", "image", "settings"</p>
            </div>
          )
        ) : (
          // ── Category browsing ──
          <div className="py-1">
            {helpCategories.map((category) => {
              const articles = articlesByCategory(category.id)
              if (articles.length === 0) return null
              const isExpanded = expandedCategory === category.id

              return (
                <div key={category.id}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                  >
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-zinc-400 transition-transform shrink-0',
                        !isExpanded && '-rotate-90'
                      )}
                    />
                    <span className="text-sm font-medium text-zinc-700 flex-1">{category.label}</span>
                    <span className="text-[11px] text-zinc-400 tabular-nums">{articles.length}</span>
                  </button>

                  {isExpanded && (
                    <div className="pb-1">
                      {articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => openArticle(article)}
                          className="w-full text-left pl-10 pr-4 py-2 hover:bg-zinc-50 transition-colors flex items-center gap-2 group"
                        >
                          <span className="text-sm text-zinc-600 group-hover:text-zinc-900 flex-1">
                            {article.title}
                          </span>
                          <ChevronRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
        <p className="text-[10px] text-zinc-400 text-center">
          {helpArticles.length} help topics &middot; Press Esc to close
        </p>
      </div>
    </div>
  )
}

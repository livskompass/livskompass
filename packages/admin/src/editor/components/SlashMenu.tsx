import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Columns,
  Type,
  Image,
  BarChart3,
  Layout,
  MessageSquare,
  Database,
  Clock,
} from 'lucide-react'
import { puckConfig } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'

// ── Block display names ──

const BLOCK_LABELS: Record<string, string> = {
  Columns: 'Columns',
  SeparatorBlock: 'Separator',
  Spacer: 'Spacer',
  Hero: 'Hero Section',
  RichText: 'Text Block',
  ImageBlock: 'Image',
  Accordion: 'Accordion / FAQ',
  PageHeader: 'Page Header',
  PersonCard: 'Person Card',
  FeatureGrid: 'Feature Grid',
  StatsCounter: 'Stats Counter',
  CTABanner: 'CTA Banner',
  CardGrid: 'Card Grid',
  Testimonial: 'Testimonial',
  ButtonGroup: 'Buttons',
  PricingTable: 'Pricing Table',
  ImageGallery: 'Image Gallery',
  VideoEmbed: 'Video',
  AudioEmbed: 'Audio',
  FileEmbed: 'File / Document',
  EmbedBlock: 'Embed',
  CourseList: 'Courses',
  ProductList: 'Products',
  PostGrid: 'Posts',
  PageCards: 'Page Cards',
  NavigationMenu: 'Navigation Menu',
  ContactForm: 'Contact Form',
  BookingForm: 'Booking Form',
  CourseInfo: 'Course Info',
  BookingCTA: 'Booking CTA',
  PostHeader: 'Post Header',
}

// ── Config ──

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  layout: <Columns className="h-3.5 w-3.5" />,
  content: <Type className="h-3.5 w-3.5" />,
  marketing: <BarChart3 className="h-3.5 w-3.5" />,
  media: <Image className="h-3.5 w-3.5" />,
  dynamic: <Layout className="h-3.5 w-3.5" />,
  interactive: <MessageSquare className="h-3.5 w-3.5" />,
  data: <Database className="h-3.5 w-3.5" />,
}

const categories = (puckConfig as any).categories as Record<
  string,
  { title: string; components: string[] }
>

const components = puckConfig.components as Record<
  string,
  { label?: string; defaultProps?: Record<string, any> }
>

const CATEGORY_LABELS: Record<string, string> = {
  layout: 'Layout',
  content: 'Content',
  marketing: 'Marketing',
  media: 'Media',
  dynamic: 'Dynamic',
  interactive: 'Interactive',
  data: 'Data-bound',
}

// ── Recently used (localStorage) ──

const RECENT_KEY = 'editor_recent_blocks'
const MAX_RECENT = 5

function getRecentBlocks(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addRecentBlock(blockType: string) {
  const recent = getRecentBlocks().filter((t) => t !== blockType)
  recent.unshift(blockType)
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

// ── Main component ──

export function SlashMenu() {
  const { state, updateData } = useEditor()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Listen for "/" key on the document (only when not editing text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) return

      // Only trigger on "/" when not in an input/textarea/contenteditable
      if (e.key !== '/') return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.ProseMirror')
      ) {
        return
      }

      e.preventDefault()
      setIsOpen(true)
      setSearch('')
      setSelectedIndex(0)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus search when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on ESC or click outside
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(false)
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen])

  // Build flat list of block options for keyboard navigation
  const getBlockList = useCallback(() => {
    const searchLower = search.toLowerCase()
    const allBlocks: { type: string; label: string; category: string }[] = []

    // Recently used
    if (!search) {
      const recent = getRecentBlocks()
      recent.forEach((type) => {
        if (components[type]) {
          allBlocks.push({
            type,
            label: BLOCK_LABELS[type] || components[type]?.label || type,
            category: '__recent',
          })
        }
      })
    }

    // Categories
    Object.entries(categories).forEach(([catKey, cat]) => {
      cat.components.forEach((name) => {
        const label = BLOCK_LABELS[name] || components[name]?.label || name
        const engLabel = components[name]?.label || name
        if (
          search &&
          !label.toLowerCase().includes(searchLower) &&
          !engLabel.toLowerCase().includes(searchLower) &&
          !name.toLowerCase().includes(searchLower)
        ) {
          return
        }
        // Don't duplicate if already in recent
        if (!search || !allBlocks.some((b) => b.type === name)) {
          allBlocks.push({ type: name, label, category: catKey })
        }
      })
    })

    return allBlocks
  }, [search])

  const blockList = getBlockList()

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, blockList.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const block = blockList[selectedIndex]
        if (block) insertBlock(block.type)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, blockList])

  // Scroll selected item into view
  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const insertBlock = useCallback(
    (blockType: string) => {
      if (!state.puckData) return

      const comp = components[blockType]
      const defaultProps = comp?.defaultProps
        ? JSON.parse(JSON.stringify(comp.defaultProps))
        : {}

      defaultProps.id = `${blockType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      const newBlock = { type: blockType, props: defaultProps }

      // Insert at the end of content
      const content = [...state.puckData.content, newBlock]
      updateData({ ...state.puckData, content } as Data)

      addRecentBlock(blockType)
      setIsOpen(false)
    },
    [state.puckData, updateData],
  )

  if (!isOpen) return null

  const portalRoot = document.getElementById('editor-portals') || document.body

  // Group blocks by category for display
  let currentCategory = ''

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 'var(--z-editor-popover, 1005)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10" onClick={() => setIsOpen(false)} />

      {/* Menu */}
      <div
        ref={menuRef}
        className="absolute left-1/2 top-[20%] -translate-x-1/2"
        style={{
          width: Math.min(360, window.innerWidth - 32),
          maxHeight: '60vh',
          animation: 'editor-slide-down 150ms var(--editor-ease, ease) forwards',
        }}
      >
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            background: 'var(--editor-surface-glass-heavy)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--editor-border-strong)',
            boxShadow: 'var(--editor-shadow-xl)',
            maxHeight: '60vh',
          }}
        >
          {/* Search */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100">
            <span className="text-zinc-300 text-sm font-mono">/</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search blocks..."
              className="flex-1 text-sm text-zinc-700 outline-none bg-transparent placeholder:text-zinc-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              role="combobox"
              aria-expanded="true"
              aria-controls="slash-menu-list"
              aria-activedescendant={blockList.length > 0 ? `slash-option-${selectedIndex}` : undefined}
              aria-label="Search blocks"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-0.5 rounded text-zinc-300 hover:text-zinc-500"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Block list */}
          <div className="overflow-y-auto p-1.5" style={{ maxHeight: 'calc(60vh - 52px)' }} id="slash-menu-list" role="listbox" aria-label="Available blocks">
            {blockList.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No blocks found
              </div>
            ) : (
              blockList.map((block, i) => {
                const showCategory = block.category !== currentCategory
                currentCategory = block.category

                return (
                  <div key={`${block.category}-${block.type}`}>
                    {showCategory && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 mt-1 first:mt-0">
                        <span className="text-zinc-300">
                          {block.category === '__recent' ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : (
                            CATEGORY_ICONS[block.category]
                          )}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {block.category === '__recent'
                            ? 'Recently used'
                            : CATEGORY_LABELS[block.category] || categories[block.category]?.title}
                        </span>
                      </div>
                    )}
                    <button
                      ref={(el) => {
                        if (el) itemRefs.current.set(i, el)
                        else itemRefs.current.delete(i)
                      }}
                      id={`slash-option-${i}`}
                      role="option"
                      aria-selected={i === selectedIndex}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-colors"
                      style={{
                        color: i === selectedIndex ? 'var(--editor-text-primary)' : 'var(--editor-text-muted)',
                        background: i === selectedIndex ? 'var(--editor-surface-hover)' : 'transparent',
                        fontWeight: i === selectedIndex ? 500 : 400,
                      }}
                      onClick={() => insertBlock(block.type)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 flex-shrink-0" />
                      {block.label}
                      {block.category !== '__recent' && BLOCK_LABELS[block.type] && (
                        <span className="ml-auto text-[10px] text-zinc-300">
                          {components[block.type]?.label}
                        </span>
                      )}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-zinc-100 flex items-center gap-3 text-[10px] text-zinc-400">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-zinc-200 bg-zinc-50 font-mono text-[9px]">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-zinc-200 bg-zinc-50 font-mono text-[9px]">↵</kbd> select
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-zinc-200 bg-zinc-50 font-mono text-[9px]">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>,
    portalRoot,
  )
}

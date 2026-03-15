import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, X, Columns, Type, Image, BarChart3, Layout, MessageSquare, Database } from 'lucide-react'
import { puckConfig } from '@livskompass/shared'
import type { Data } from '../types'
import { useEditor } from '../context'

interface BlockInserterProps {
  insertIndex: number
}

// ── Block categories with icons ──

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

export function BlockInserter({ insertIndex }: BlockInserterProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className="relative group py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isOpen) setIsHovered(false)
      }}
      data-insert-index={insertIndex}
    >
      {/* Line — subtle when idle, blue on hover */}
      <div
        className="h-px mx-8 transition-all"
        style={{
          background: isHovered || isOpen
            ? 'var(--editor-blue)'
            : 'var(--editor-neutral-200, #e5e5e5)',
          opacity: isHovered || isOpen ? 1 : 0.5,
          transitionDuration: 'var(--editor-duration-fast, 150ms)',
        }}
      />

      {/* Center plus button — subtle dot when idle, full button on hover */}
      <button
        ref={btnRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all focus:opacity-100 focus:scale-100"
        style={{
          width: isHovered || isOpen ? 24 : 8,
          height: isHovered || isOpen ? 24 : 8,
          borderRadius: '50%',
          background: isHovered || isOpen
            ? isOpen ? 'var(--editor-blue-dark, #1D4ED8)' : 'var(--editor-blue)'
            : 'var(--editor-neutral-300, #d4d4d4)',
          color: 'var(--editor-surface)',
          boxShadow: isHovered || isOpen ? 'var(--editor-shadow-blue)' : 'none',
          opacity: isHovered || isOpen ? 1 : 0.6,
          transform: isOpen ? 'rotate(45deg)' : 'none',
          transition: 'all 150ms ease',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((v) => !v)
        }}
        onFocus={() => setIsHovered(true)}
        onBlur={() => {
          if (!isOpen) setIsHovered(false)
        }}
        aria-label={`Insert block at position ${insertIndex + 1}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {(isHovered || isOpen) && <Plus className="h-3.5 w-3.5" />}
      </button>

      {/* Block picker dropdown */}
      {isOpen && (
        <BlockPicker
          insertIndex={insertIndex}
          anchorRef={btnRef}
          onClose={() => {
            setIsOpen(false)
            setIsHovered(false)
          }}
        />
      )}
    </div>
  )
}


// ── Block picker dropdown ──

function BlockPicker({
  insertIndex,
  anchorRef,
  onClose,
}: {
  insertIndex: number
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  const { state, updateData } = useEditor()
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const pickerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Auto-focus search
  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  // Close on ESC, arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const insertBlock = useCallback(
    (blockType: string) => {
      if (!state.puckData) return

      const comp = components[blockType]
      const defaultProps = comp?.defaultProps
        ? JSON.parse(JSON.stringify(comp.defaultProps))
        : {}

      // Generate a unique ID (timestamp + random suffix to avoid collisions)
      defaultProps.id = `${blockType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      const newBlock = { type: blockType, props: defaultProps }
      const content = [...state.puckData.content]
      content.splice(insertIndex, 0, newBlock)

      updateData({ ...state.puckData, content } as Data)
      onClose()
    },
    [state.puckData, insertIndex, updateData, onClose],
  )

  // Filter blocks by search
  const searchLower = search.toLowerCase()
  const filteredCategories = Object.entries(categories)
    .map(([key, cat]) => ({
      key,
      title: cat.title,
      components: cat.components.filter((name) => {
        const label = components[name]?.label || name
        return (
          label.toLowerCase().includes(searchLower) ||
          name.toLowerCase().includes(searchLower)
        )
      }),
    }))
    .filter((cat) => cat.components.length > 0)

  // Position
  const anchorEl = anchorRef.current
  const pickerWidth = 280
  let left = 0
  let top = 0

  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect()
    left = rect.left + rect.width / 2 - pickerWidth / 2
    left = Math.max(8, Math.min(left, window.innerWidth - pickerWidth - 8))
    top = rect.bottom + 8
  }

  const portalRoot = document.getElementById('editor-portals') || document.body

  return createPortal(
    <div
      ref={pickerRef}
      className="fixed"
      style={{
        left,
        top,
        width: pickerWidth,
        maxHeight: 400,
        zIndex: 'var(--z-editor-popover, 1005)',
        animation: 'editor-slide-down 150ms var(--editor-ease, ease) forwards',
      }}
    >
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{
          background: 'var(--editor-surface-glass-heavy)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--editor-border-strong)',
          boxShadow: 'var(--editor-shadow-lg)',
          maxHeight: 400,
        }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
          <Search className="h-3.5 w-3.5 text-stone-300 flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search blocks..."
            className="flex-1 text-sm text-stone-700 outline-none bg-transparent placeholder:text-stone-300"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setFocusedIndex(-1)
            }}
            onKeyDown={(e) => {
              const allBlocks = filteredCategories.flatMap((c) => c.components)
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setFocusedIndex((i) => Math.min(i + 1, allBlocks.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setFocusedIndex((i) => Math.max(i - 1, -1))
              } else if (e.key === 'Enter' && focusedIndex >= 0) {
                e.preventDefault()
                const block = allBlocks[focusedIndex]
                if (block) insertBlock(block)
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="block-picker-list"
            aria-activedescendant={focusedIndex >= 0 ? `block-option-${focusedIndex}` : undefined}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-0.5 rounded text-stone-300 hover:text-stone-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Block list */}
        <div className="overflow-y-auto p-1.5" style={{ maxHeight: 350 }} id="block-picker-list" role="listbox" aria-label="Available blocks">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              No blocks found
            </div>
          ) : (
            (() => {
              let globalIndex = 0
              return filteredCategories.map((cat) => (
                <div key={cat.key} className="mb-1.5 last:mb-0" role="group" aria-label={cat.title}>
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <span className="text-stone-300">
                      {CATEGORY_ICONS[cat.key]}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {cat.title}
                    </span>
                  </div>
                  {cat.components.map((name) => {
                    const idx = globalIndex++
                    return (
                      <button
                        key={name}
                        id={`block-option-${idx}`}
                        role="option"
                        aria-selected={idx === focusedIndex}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors"
                        style={{
                          color: idx === focusedIndex ? 'var(--editor-text-primary)' : 'var(--editor-text-muted)',
                          background: idx === focusedIndex ? 'var(--editor-surface-hover)' : 'transparent',
                        }}
                        onClick={() => insertBlock(name)}
                        onMouseEnter={() => setFocusedIndex(idx)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
                        {components[name]?.label || name}
                      </button>
                    )
                  })}
                </div>
              ))
            })()
          )}
        </div>
      </div>
    </div>,
    portalRoot,
  )
}

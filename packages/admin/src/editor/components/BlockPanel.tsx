import { useState, useCallback } from 'react'
import { Search, X, GripVertical, Columns, Type, Image, BarChart3, Layout, MessageSquare, Database, ChevronLeft, ChevronRight } from 'lucide-react'
import { puckConfig } from '@livskompass/shared'

// Drag data type — used to identify panel drops vs other drag sources
export const PANEL_DRAG_TYPE = 'application/x-block-type'

// ── Category icons ──

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

interface BlockPanelProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function BlockPanel({ collapsed, onToggleCollapsed }: BlockPanelProps) {
  const [search, setSearch] = useState('')
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData(PANEL_DRAG_TYPE, blockType)
    e.dataTransfer.effectAllowed = 'copy'
    setDraggingBlock(blockType)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingBlock(null)
  }, [])

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

  if (collapsed) {
    return (
      <div
        className="fixed left-0 top-12 bottom-0 flex items-start pt-4 z-10"
        style={{ width: 36 }}
      >
        <button
          onClick={() => onToggleCollapsed()}
          className="w-8 h-8 rounded-r-lg flex items-center justify-center transition-colors"
          style={{
            background: 'var(--editor-surface, white)',
            border: '1px solid var(--editor-border, #e5e5e5)',
            borderLeft: 'none',
            color: 'var(--editor-text-muted, #737373)',
          }}
          aria-label="Show block panel"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed left-0 top-12 bottom-0 flex flex-col z-10"
      style={{
        width: 240,
        background: 'var(--editor-surface, white)',
        borderRight: '1px solid var(--editor-border, #e5e5e5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--editor-border, #e5e5e5)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--editor-text-muted, #737373)' }}>
          Blocks
        </span>
        <button
          onClick={() => onToggleCollapsed()}
          className="p-1 rounded transition-colors hover:bg-stone-100"
          style={{ color: 'var(--editor-text-muted, #737373)' }}
          aria-label="Collapse block panel"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--editor-border, #e5e5e5)' }}>
        <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }} />
        <input
          type="text"
          placeholder="Search blocks..."
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: 'var(--editor-text-primary, #171717)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-0.5 rounded"
            style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Block list — draggable items */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}>
            No blocks found
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.key} className="mb-3 last:mb-0">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}>
                  {CATEGORY_ICONS[cat.key]}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}
                >
                  {cat.title}
                </span>
              </div>
              {cat.components.map((name) => (
                <div
                  key={name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, name)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-1.5 px-1 py-1.5 rounded-md text-left text-sm transition-all cursor-grab active:cursor-grabbing select-none"
                  style={{
                    color: draggingBlock === name ? 'var(--editor-blue)' : 'var(--editor-text-muted, #737373)',
                    background: draggingBlock === name ? 'var(--editor-blue-lightest, #EFF6FF)' : 'transparent',
                    border: '1px solid transparent',
                    opacity: draggingBlock === name ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!draggingBlock) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--editor-surface-hover, #f5f5f5)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--editor-neutral-200, #e5e5e5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!draggingBlock) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                    }
                  }}
                  title={`Drag to add ${components[name]?.label || name}`}
                >
                  <GripVertical
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: 'var(--editor-neutral-300, #d4d4d4)' }}
                  />
                  <span className="truncate">{components[name]?.label || name}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { Search, X, GripVertical, Columns, Type, Image, BarChart3, Layout, MessageSquare, Database, ChevronLeft, ChevronRight, ChevronDown,
  Heading, AlignLeft, ImageIcon, Layers, Star, FileText, List, Grid3x3, SplitSquareHorizontal, Minus, MoveVertical,
  Megaphone, CreditCard, Quote, MousePointerClick, Video, Music, File, Code2, BookOpen, ShoppingCart, Newspaper, Navigation, Mail, CalendarCheck, Info, Tag,
  ExternalLink
} from 'lucide-react'
import { puckConfig, getEditingSurface } from '@livskompass/shared'

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

// Per-block icons for quick visual identification
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  Hero: <Heading className="h-3.5 w-3.5" />,
  RichText: <AlignLeft className="h-3.5 w-3.5" />,
  ImageBlock: <ImageIcon className="h-3.5 w-3.5" />,
  Accordion: <List className="h-3.5 w-3.5" />,
  PageHeader: <Heading className="h-3.5 w-3.5" />,
  PersonCard: <Star className="h-3.5 w-3.5" />,
  FeatureGrid: <Grid3x3 className="h-3.5 w-3.5" />,
  StatsCounter: <BarChart3 className="h-3.5 w-3.5" />,
  CTABanner: <Megaphone className="h-3.5 w-3.5" />,
  CardGrid: <Layers className="h-3.5 w-3.5" />,
  Testimonial: <Quote className="h-3.5 w-3.5" />,
  ButtonGroup: <MousePointerClick className="h-3.5 w-3.5" />,
  PricingTable: <CreditCard className="h-3.5 w-3.5" />,
  ImageGallery: <Grid3x3 className="h-3.5 w-3.5" />,
  VideoEmbed: <Video className="h-3.5 w-3.5" />,
  AudioEmbed: <Music className="h-3.5 w-3.5" />,
  FileEmbed: <File className="h-3.5 w-3.5" />,
  EmbedBlock: <Code2 className="h-3.5 w-3.5" />,
  CourseList: <BookOpen className="h-3.5 w-3.5" />,
  ProductList: <ShoppingCart className="h-3.5 w-3.5" />,
  PostGrid: <Newspaper className="h-3.5 w-3.5" />,
  PageCards: <FileText className="h-3.5 w-3.5" />,
  NavigationMenu: <Navigation className="h-3.5 w-3.5" />,
  ContactForm: <Mail className="h-3.5 w-3.5" />,
  BookingForm: <CalendarCheck className="h-3.5 w-3.5" />,
  BookingCTA: <CalendarCheck className="h-3.5 w-3.5" />,
  CourseInfo: <Info className="h-3.5 w-3.5" />,
  PostHeader: <Tag className="h-3.5 w-3.5" />,
  Columns: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
  Separator: <Minus className="h-3.5 w-3.5" />,
  Spacer: <MoveVertical className="h-3.5 w-3.5" />,
}

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
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({})

  const toggleCategory = useCallback((key: string) => {
    setCollapsedCats((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

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
          className="p-1 rounded transition-colors hover:bg-zinc-100"
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
          aria-label="Search blocks"
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
          filteredCategories.map((cat) => {
            const isCatCollapsed = collapsedCats[cat.key] && !search
            return (
            <div key={cat.key} className="mb-3 last:mb-0">
              <button
                onClick={() => toggleCategory(cat.key)}
                aria-expanded={!isCatCollapsed}
                className="flex items-center gap-1.5 px-2 py-1 w-full text-left group"
              >
                <span style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}>
                  {CATEGORY_ICONS[cat.key]}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider flex-1"
                  style={{ color: 'var(--editor-text-disabled, #a3a3a3)' }}
                >
                  {cat.title}
                </span>
                <ChevronDown
                  className="h-3 w-3 transition-transform"
                  style={{
                    color: 'var(--editor-text-disabled, #a3a3a3)',
                    transform: isCatCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {!isCatCollapsed && cat.components.map((name) => (
                <div
                  key={name}
                  draggable
                  tabIndex={0}
                  role="option"
                  aria-label={`Add ${components[name]?.label || name} block`}
                  onDragStart={(e) => handleDragStart(e, name)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleDragStart({ dataTransfer: { setData: () => {}, effectAllowed: '' } } as any, name)
                      handleDragEnd()
                      // Insert block via click fallback
                      const comp = components[name]
                      if (comp && (window as any).__insertBlockFromPanel) {
                        (window as any).__insertBlockFromPanel(name)
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 px-1 py-1.5 rounded-md text-left text-sm transition-all cursor-grab active:cursor-grabbing select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
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
                  <span className="flex-shrink-0" style={{ color: 'var(--editor-neutral-400, #a3a3a3)' }}>
                    {BLOCK_ICONS[name] || <GripVertical className="h-3.5 w-3.5" />}
                  </span>
                  <span className="truncate flex-1">{components[name]?.label || name}</span>
                  {getEditingSurface(name) === 'linked' && (
                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )})
        )}
      </div>
    </div>
  )
}

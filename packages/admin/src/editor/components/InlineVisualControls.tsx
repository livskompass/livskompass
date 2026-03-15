import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns2,
  Columns3,
  Columns4,
  Maximize2,
  Minimize2,
  Square,
  LayoutTemplate,
  SplitSquareHorizontal,
  Image,
  Minus,
  MoreHorizontal,
  Paintbrush,
} from 'lucide-react'
import type { Data } from '../types'
import { useEditor } from '../context'

// ── Visual field definitions ──
// Maps blockType → visual fields with options and optional icons

interface VisualOption {
  value: string | number | boolean
  label: string
  icon?: React.ReactNode
}

interface VisualFieldDef {
  key: string
  label: string
  options: VisualOption[]
}

const I = 'h-3.5 w-3.5' // icon size class

function buildVisualFields(): Record<string, VisualFieldDef[]> {
  return {
    Hero: [
      {
        key: 'preset',
        label: 'Layout',
        options: [
          { value: 'centered', label: 'Center', icon: <AlignCenter className={I} /> },
          { value: 'split-right', label: 'Split R', icon: <SplitSquareHorizontal className={I} /> },
          { value: 'split-left', label: 'Split L', icon: <SplitSquareHorizontal className={I} style={{ transform: 'scaleX(-1)' }} /> },
          { value: 'full-image', label: 'Full', icon: <Image className={I} /> },
          { value: 'minimal', label: 'Min', icon: <Minus className={I} /> },
        ],
      },
      {
        key: 'bgStyle',
        label: 'Background',
        options: [
          { value: 'gradient', label: 'Gradient', icon: <Paintbrush className={I} /> },
          { value: 'forest', label: 'Forest' },
          { value: 'stone', label: 'Stone' },
        ],
      },
    ],
    ImageBlock: [
      {
        key: 'size',
        label: 'Size',
        options: [
          { value: 'small', label: '50%', icon: <Minimize2 className={I} /> },
          { value: 'medium', label: '75%', icon: <Square className={I} /> },
          { value: 'full', label: '100%', icon: <Maximize2 className={I} /> },
        ],
      },
      {
        key: 'alignment',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left', icon: <AlignLeft className={I} /> },
          { value: 'center', label: 'Center', icon: <AlignCenter className={I} /> },
          { value: 'right', label: 'Right', icon: <AlignRight className={I} /> },
        ],
      },
      {
        key: 'rounded',
        label: 'Corners',
        options: [
          { value: 'none', label: 'None' },
          { value: 'small', label: 'SM' },
          { value: 'large', label: 'LG' },
        ],
      },
    ],
    RichText: [
      {
        key: 'maxWidth',
        label: 'Width',
        options: [
          { value: 'narrow', label: '65ch' },
          { value: 'medium', label: '80ch' },
          { value: 'full', label: 'Full' },
        ],
      },
    ],
    CTABanner: [
      {
        key: 'backgroundColor',
        label: 'Background',
        options: [
          { value: 'primary', label: 'Green' },
          { value: 'gradient', label: 'Grad' },
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      {
        key: 'alignment',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left', icon: <AlignLeft className={I} /> },
          { value: 'center', label: 'Center', icon: <AlignCenter className={I} /> },
        ],
      },
    ],
    PageHeader: [
      {
        key: 'alignment',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left', icon: <AlignLeft className={I} /> },
          { value: 'center', label: 'Center', icon: <AlignCenter className={I} /> },
        ],
      },
      {
        key: 'size',
        label: 'Size',
        options: [
          { value: 'small', label: 'SM' },
          { value: 'large', label: 'LG' },
        ],
      },
    ],
    Columns: [
      {
        key: 'layout',
        label: 'Layout',
        options: [
          { value: '50-50', label: '50/50', icon: <Columns2 className={I} /> },
          { value: '33-33-33', label: '⅓×3', icon: <Columns3 className={I} /> },
          { value: '66-33', label: '⅔+⅓' },
          { value: '33-66', label: '⅓+⅔' },
        ],
      },
      {
        key: 'gap',
        label: 'Gap',
        options: [
          { value: 'small', label: 'S' },
          { value: 'medium', label: 'M' },
          { value: 'large', label: 'L' },
        ],
      },
    ],
    Testimonial: [
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'minimal', label: 'Min' },
          { value: 'featured', label: 'Feat' },
        ],
      },
    ],
    PersonCard: [
      {
        key: 'style',
        label: 'Layout',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'horizontal', label: 'Wide' },
        ],
      },
    ],
    ButtonGroup: [
      {
        key: 'alignment',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left', icon: <AlignLeft className={I} /> },
          { value: 'center', label: 'Center', icon: <AlignCenter className={I} /> },
          { value: 'right', label: 'Right', icon: <AlignRight className={I} /> },
        ],
      },
      {
        key: 'direction',
        label: 'Dir',
        options: [
          { value: 'horizontal', label: 'H' },
          { value: 'vertical', label: 'V' },
        ],
      },
      {
        key: 'size',
        label: 'Size',
        options: [
          { value: 'small', label: 'S' },
          { value: 'medium', label: 'M' },
          { value: 'large', label: 'L' },
        ],
      },
    ],
    Accordion: [
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'bordered', label: 'Border' },
          { value: 'minimal', label: 'Min' },
        ],
      },
    ],
    SeparatorBlock: [
      {
        key: 'variant',
        label: 'Type',
        options: [
          { value: 'line', label: 'Line', icon: <Minus className={I} /> },
          { value: 'dots', label: 'Dots', icon: <MoreHorizontal className={I} /> },
          { value: 'space-only', label: 'Space' },
        ],
      },
      {
        key: 'spacing',
        label: 'Space',
        options: [
          { value: 'small', label: 'S' },
          { value: 'medium', label: 'M' },
          { value: 'large', label: 'L' },
          { value: 'extra-large', label: 'XL' },
        ],
      },
    ],
    Spacer: [
      {
        key: 'size',
        label: 'Size',
        options: [
          { value: 'xs', label: 'XS' },
          { value: 'small', label: 'S' },
          { value: 'medium', label: 'M' },
          { value: 'large', label: 'L' },
          { value: 'xl', label: 'XL' },
        ],
      },
    ],
    FeatureGrid: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'cards', label: 'Cards' },
          { value: 'minimal', label: 'Min' },
        ],
      },
    ],
    CardGrid: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
      {
        key: 'cardStyle',
        label: 'Style',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'bordered', label: 'Border' },
          { value: 'shadow', label: 'Shadow' },
        ],
      },
    ],
    ImageGallery: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
      {
        key: 'aspectRatio',
        label: 'Ratio',
        options: [
          { value: 'square', label: '1:1', icon: <Square className={I} /> },
          { value: 'landscape', label: '4:3', icon: <LayoutTemplate className={I} /> },
          { value: 'portrait', label: '3:4' },
          { value: 'auto', label: 'Auto' },
        ],
      },
    ],
    NavigationMenu: [
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'pills', label: 'Pills' },
          { value: 'underline', label: 'Line' },
          { value: 'buttons', label: 'Btns' },
          { value: 'minimal', label: 'Min' },
        ],
      },
      {
        key: 'alignment',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left', icon: <AlignLeft className={I} /> },
          { value: 'center', label: 'Center', icon: <AlignCenter className={I} /> },
          { value: 'right', label: 'Right', icon: <AlignRight className={I} /> },
        ],
      },
    ],
    StatsCounter: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'bordered', label: 'Border' },
        ],
      },
    ],
    PostGrid: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
    ],
    PageCards: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
          { value: 4, label: '4', icon: <Columns4 className={I} /> },
        ],
      },
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'list', label: 'List' },
          { value: 'minimal', label: 'Min' },
        ],
      },
    ],
    PricingTable: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
        ],
      },
    ],
    BookingCTA: [
      {
        key: 'style',
        label: 'Style',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'inline', label: 'Inline' },
        ],
      },
    ],
    ContactForm: [
      {
        key: 'layout',
        label: 'Layout',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'split', label: 'Split' },
        ],
      },
    ],
    CourseInfo: [
      {
        key: 'layout',
        label: 'Layout',
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'stacked', label: 'Stack' },
        ],
      },
    ],
    VideoEmbed: [
      {
        key: 'aspectRatio',
        label: 'Ratio',
        options: [
          { value: '16:9', label: '16:9' },
          { value: '4:3', label: '4:3' },
          { value: '1:1', label: '1:1', icon: <Square className={I} /> },
        ],
      },
    ],
    CourseList: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
        ],
      },
    ],
    ProductList: [
      {
        key: 'columns',
        label: 'Cols',
        options: [
          { value: 2, label: '2', icon: <Columns2 className={I} /> },
          { value: 3, label: '3', icon: <Columns3 className={I} /> },
        ],
      },
    ],
  }
}

const VISUAL_FIELDS = buildVisualFields()

/** Get the visual field keys for a block type (used by SettingsPopover to exclude them) */
export function getVisualFieldKeys(blockType: string): string[] {
  return (VISUAL_FIELDS[blockType] || []).map((f) => f.key)
}

// ── Component ──

interface InlineVisualControlsProps {
  blockType: string
  blockIndex: number
}

export function InlineVisualControls({ blockType, blockIndex }: InlineVisualControlsProps) {
  const { state, updateData } = useEditor()
  const puckData = state.puckData

  const fields = VISUAL_FIELDS[blockType]
  if (!fields || fields.length === 0) return null

  const block = puckData?.content?.[blockIndex]
  if (!block) return null

  const blockProps = block.props || {}

  const updateProp = (key: string, value: any) => {
    if (!puckData) return
    const content = [...puckData.content]
    const b = content[blockIndex]
    if (!b) return
    content[blockIndex] = { ...b, props: { ...b.props, [key]: value } }
    updateData({ ...puckData, content } as Data)
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 mt-1.5 px-2 py-1.5 rounded-lg"
      style={{
        background: 'var(--editor-surface-glass)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--editor-border)',
        boxShadow: 'var(--editor-shadow-sm)',
      }}
    >
      {fields.map((field) => (
        <SegmentedControl
          key={field.key}
          label={field.label}
          value={blockProps[field.key]}
          options={field.options}
          onChange={(v) => updateProp(field.key, v)}
        />
      ))}
    </div>
  )
}

// ── Segmented control ──

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: any
  options: VisualOption[]
  onChange: (v: any) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-medium text-zinc-400 select-none">{label}</span>
      <div
        className="flex items-center rounded-md overflow-hidden"
        style={{
          border: '1px solid var(--editor-border-strong)',
          background: 'var(--editor-neutral-100)',
        }}
      >
        {options.map((opt) => {
          const isActive = value === opt.value || String(value) === String(opt.value)
          return (
            <button
              key={String(opt.value)}
              className="transition-all"
              style={{
                padding: opt.icon ? '3px 5px' : '3px 7px',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--editor-blue)' : 'var(--editor-text-muted)',
                background: isActive ? 'var(--editor-surface)' : 'transparent',
                boxShadow: isActive ? 'var(--editor-shadow-sm)' : 'none',
                lineHeight: 1.2,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onChange(opt.value)
              }}
              title={opt.label}
              aria-label={`${label}: ${opt.label}`}
            >
              {opt.icon || opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

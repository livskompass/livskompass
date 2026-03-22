import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import type { Data } from '../types'
import { useEditor } from '../context'

/**
 * Overlay controls for adding/removing items in array-type block fields.
 * Renders "Add" button below the block and "Remove" buttons on each array item.
 *
 * Hooks into blocks that have `type: 'array'` fields in their Puck config.
 */

// Map of block types → array field name → default new item factory
const ARRAY_CONFIGS: Record<string, { field: string; addLabel: string; defaultItem: () => Record<string, any> }> = {
  Accordion: {
    field: 'items',
    addLabel: 'Add question',
    defaultItem: () => ({ question: 'New question', answer: 'Answer here...' }),
  },
  FeatureGrid: {
    field: 'items',
    addLabel: 'Add feature',
    defaultItem: () => ({ icon: '', title: 'Feature', description: 'Description' }),
  },
  PricingTable: {
    field: 'items',
    addLabel: 'Add plan',
    defaultItem: () => ({
      name: 'New Plan',
      price: '0 kr',
      description: '',
      features: '',
      highlighted: false,
      ctaText: 'Get started',
      ctaLink: '',
    }),
  },
  StatsCounter: {
    field: 'items',
    addLabel: 'Add stat',
    defaultItem: () => ({ value: '0', label: 'Label', prefix: '', suffix: '' }),
  },
  CardGrid: {
    field: 'manualCards',
    addLabel: 'Add card',
    defaultItem: () => ({ title: 'New Card', description: '', image: '', link: '', badge: '' }),
  },
  ButtonGroup: {
    field: 'buttons',
    addLabel: 'Add button',
    defaultItem: () => ({ text: 'Button', link: '/', variant: 'primary' }),
  },
  ImageGallery: {
    field: 'images',
    addLabel: 'Add image',
    defaultItem: () => ({ src: '', alt: '', caption: '' }),
  },
  NavigationMenu: {
    field: 'items',
    addLabel: 'Add link',
    defaultItem: () => ({ label: 'Link', link: '/' }),
  },
  PageCards: {
    field: 'manualPages',
    addLabel: 'Add page',
    defaultItem: () => ({ title: 'Page', description: '', slug: '', icon: '' }),
  },
  PageHeader: {
    field: 'breadcrumbs',
    addLabel: 'Add breadcrumb',
    defaultItem: () => ({ label: 'Page', href: '/' }),
  },
}

interface InlineArrayControlsProps {
  blockType: string
  blockIndex: number
}

export function InlineArrayControls({ blockType, blockIndex }: InlineArrayControlsProps) {
  const config = ARRAY_CONFIGS[blockType]
  const { state, updateData } = useEditor()

  const addItem = useCallback(() => {
    if (!config || !state.puckData) return

    const content = [...state.puckData.content]
    if (blockIndex < 0 || blockIndex >= content.length) return
    const block = content[blockIndex]
    if (!block) return

    const currentItems = block.props?.[config.field] || []
    content[blockIndex] = {
      ...block,
      props: {
        ...block.props,
        [config.field]: [...currentItems, config.defaultItem()],
      },
    }
    updateData({ ...state.puckData, content } as Data)
  }, [config, state.puckData, blockIndex, updateData])

  if (!config) return null

  const block = state.puckData?.content?.[blockIndex]
  const items = block?.props?.[config.field] || []

  return (
    <div className="mt-1 flex justify-end pr-3">
      <button
        onClick={(e) => {
          e.stopPropagation()
          addItem()
        }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors hover:opacity-90"
        style={{
          color: 'var(--editor-surface, #fff)',
          background: 'var(--editor-blue)',
        }}
        title={`${config.addLabel} to this block (currently ${items.length})`}
      >
        <Plus className="h-3 w-3" />
        {config.addLabel}
      </button>
    </div>
  )
}

/**
 * Remove button for individual array items.
 * Mount this inside block components that render array items,
 * or use it as an overlay positioned over each item.
 */
export function useArrayItemRemove() {
  const { state, updateData } = useEditor()

  const removeItem = useCallback(
    (blockIndex: number, fieldName: string, itemIndex: number) => {
      if (!state.puckData) return
      const content = [...state.puckData.content]
      if (blockIndex < 0 || blockIndex >= content.length) return
      const block = content[blockIndex]
      if (!block) return

      const items = [...(block.props?.[fieldName] || [])]
      if (itemIndex < 0 || itemIndex >= items.length) return
      items.splice(itemIndex, 1)

      content[blockIndex] = {
        ...block,
        props: { ...block.props, [fieldName]: items },
      }
      updateData({ ...state.puckData, content } as Data)
    },
    [state.puckData, updateData],
  )

  return removeItem
}

/**
 * Renders an "Add item" button when the block is selected.
 * Used in BlockList to overlay array controls on selected blocks.
 */
export function SelectedBlockArrayControls() {
  const { state } = useEditor()
  const { selectedBlockId, puckData } = state

  if (!selectedBlockId || !puckData) return null

  const items = puckData.content || []
  const blockIndex = items.findIndex(
    (item: any, i: number) => (item.props?.id || `${item.type}-${i}`) === selectedBlockId,
  )
  if (blockIndex === -1) return null

  const blockType = items[blockIndex].type
  if (!ARRAY_CONFIGS[blockType]) return null

  return <InlineArrayControls blockType={blockType} blockIndex={blockIndex} />
}

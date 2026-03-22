import React from 'react'
import { puckConfig, InlineEditBlockContext, ZoneRenderContext, useScrollReveal } from '@livskompass/shared'
import { useInlineEdit } from './InlineEditProvider'
import EditableBlock from './EditableBlock'

/**
 * Lightweight Puck data renderer that replaces @puckeditor/core's <Render>.
 * Reads the Puck JSON structure and renders each block using the render
 * functions already defined in puckConfig — no Puck runtime needed.
 *
 * When an admin is viewing the page, each block is wrapped in an
 * InlineEditBlockContext so text-bearing blocks can enable contentEditable.
 */

interface PuckItem {
  type: string
  props: Record<string, any>
}

interface PuckData {
  content: PuckItem[]
  root: { props: Record<string, any> }
  zones?: Record<string, PuckItem[]>
}

const components = puckConfig.components as Record<
  string,
  { render: React.FC<any> }
>

/** No-op save for public site — text sizes are read-only */
const noopSave = () => {}

function renderItems(items: PuckItem[]) {
  return items.map((item, i) => {
    const comp = components[item.type]
    if (!comp?.render) return null
    const Fn = comp.render
    // Provide minimal context so useEditableText can read _textSizes
    return (
      <InlineEditBlockContext.Provider
        key={item.props?.id || `${item.type}-${i}`}
        value={{ isAdmin: false, blockIndex: i, saveBlockProp: noopSave, blockProps: item.props }}
      >
        <Fn {...item.props} />
      </InlineEditBlockContext.Provider>
    )
  })
}

function RenderItemWithContext({
  item,
  index,
  saveBlockProp,
}: {
  item: PuckItem
  index: number
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
}) {
  const comp = components[item.type]
  if (!comp?.render) return null
  const Fn = comp.render
  return (
    <EditableBlock blockType={item.type} blockIndex={index}>
      <InlineEditBlockContext.Provider
        value={{ isAdmin: true, blockIndex: index, saveBlockProp, blockProps: item.props }}
      >
        <Fn {...item.props} />
      </InlineEditBlockContext.Provider>
    </EditableBlock>
  )
}

function renderItemsWithContext(
  items: PuckItem[],
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void,
) {
  return items.map((item, i) => (
    <RenderItemWithContext
      key={item.props?.id || `${item.type}-${i}`}
      item={item}
      index={i}
      saveBlockProp={saveBlockProp}
    />
  ))
}

export default function PuckRenderer({ data }: { data: PuckData }) {
  const { isAdmin, saveBlockProp } = useInlineEdit()
  const revealRef = useScrollReveal()

  const RootRender = (puckConfig.root as any)?.render as
    | React.FC<any>
    | undefined

  // Zone renderer: resolves zone content from data.zones
  const renderZone = React.useCallback(
    (zoneId: string): React.ReactNode => {
      const zoneItems = data.zones?.[zoneId] || []
      if (zoneItems.length === 0) return null
      return <>{renderItems(zoneItems)}</>
    },
    [data.zones],
  )

  const content = isAdmin ? (
    <ZoneRenderContext.Provider value={renderZone}>
      {renderItemsWithContext(data.content, saveBlockProp)}
    </ZoneRenderContext.Provider>
  ) : (
    <ZoneRenderContext.Provider value={renderZone}>
      {renderItems(data.content)}
    </ZoneRenderContext.Provider>
  )

  if (RootRender) {
    return (
      <div ref={revealRef}>
        <RootRender {...data.root?.props}>{content}</RootRender>
      </div>
    )
  }
  return <div ref={revealRef}>{content}</div>
}

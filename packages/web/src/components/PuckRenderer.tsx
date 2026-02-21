import React from 'react'
import { puckConfig, InlineEditBlockContext, ZoneRenderContext } from '@livskompass/shared'
import { useInlineEdit } from './InlineEditProvider'

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

function renderItems(items: PuckItem[]) {
  return items.map((item, i) => {
    const comp = components[item.type]
    if (!comp?.render) return null
    const Fn = comp.render
    return <Fn key={item.props?.id || `${item.type}-${i}`} {...item.props} />
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
    <InlineEditBlockContext.Provider
      value={{ isAdmin: true, blockIndex: index, saveBlockProp }}
    >
      <Fn {...item.props} />
    </InlineEditBlockContext.Provider>
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
    return <RootRender {...data.root?.props}>{content}</RootRender>
  }
  return <>{content}</>
}

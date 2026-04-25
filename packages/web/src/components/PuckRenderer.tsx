import React, { useEffect, useState } from 'react'
import { puckConfig, InlineEditBlockContext, ZoneRenderContext, useScrollReveal } from '@livskompass/shared'
import { useInlineEdit } from './InlineEditProvider'
import EditableBlock from './EditableBlock'

/**
 * Fades the rest of the page in once the hero's blur cascade is partway through.
 * Section backgrounds stay opaque — only text, images, buttons, and other content
 * elements fade in (see `.page-content-fade-in` CSS in index.css).
 * Keyed by hero id at the call site so it remounts on navigation.
 */
function PageContentFadeIn({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 1400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`page-content-fade-in ${active ? 'is-active' : ''}`}>
      {children}
    </div>
  )
}

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

function renderBlock(item: PuckItem, index: number) {
  const comp = components[item.type]
  if (!comp?.render) return null
  const Fn = comp.render
  return (
    <InlineEditBlockContext.Provider
      key={item.props?.id || `${item.type}-${index}`}
      value={{ isAdmin: false, blockIndex: index, saveBlockProp: noopSave, blockProps: item.props }}
    >
      <Fn {...item.props} />
    </InlineEditBlockContext.Provider>
  )
}

function renderItems(items: PuckItem[]) {
  if (items[0]?.type !== 'Hero') {
    return items.map((item, i) => renderBlock(item, i))
  }
  const [hero, ...rest] = items
  const heroKey = hero.props?.id || `${hero.type}-0`
  return (
    <>
      {renderBlock(hero, 0)}
      {rest.length > 0 && (
        <PageContentFadeIn key={heroKey}>
          {rest.map((item, i) => renderBlock(item, i + 1))}
        </PageContentFadeIn>
      )}
    </>
  )
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

  // Zone renderer: resolves zone content from data.zones. Stacks nested blocks
  // with vertical spacing so they don't run into each other.
  const renderZone = React.useCallback(
    (zoneId: string): React.ReactNode => {
      const zoneItems = data.zones?.[zoneId] || []
      if (zoneItems.length === 0) return null
      return <div className="flex flex-col gap-4">{renderItems(zoneItems)}</div>
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

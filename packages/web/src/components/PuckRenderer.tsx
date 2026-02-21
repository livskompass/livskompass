import React from 'react'
import { puckConfig } from '@livskompass/shared'
import { ZoneRenderContext } from '../../../shared/src/blocks/Columns'

/**
 * Lightweight Puck data renderer that replaces @puckeditor/core's <Render>.
 * Reads the Puck JSON structure and renders each block using the render
 * functions already defined in puckConfig — no Puck runtime needed.
 *
 * Supports zone-based components (e.g. Columns) by providing zone content
 * via ZoneRenderContext.
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

export default function PuckRenderer({ data }: { data: PuckData }) {
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
    [data.zones]
  )

  const content = (
    <ZoneRenderContext.Provider value={renderZone}>
      {renderItems(data.content)}
    </ZoneRenderContext.Provider>
  )

  if (RootRender) {
    return <RootRender {...data.root?.props}>{content}</RootRender>
  }
  return <>{content}</>
}

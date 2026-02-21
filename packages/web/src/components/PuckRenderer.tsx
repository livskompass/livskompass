import React from 'react'
import { puckConfig } from '@livskompass/shared'

/**
 * Lightweight Puck data renderer that replaces @puckeditor/core's <Render>.
 * Reads the Puck JSON structure and renders each block using the render
 * functions already defined in puckConfig — no Puck runtime needed.
 *
 * This eliminates ~300-400KB of @puckeditor/core from the public bundle.
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

  const content = renderItems(data.content)

  if (RootRender) {
    return <RootRender {...data.root?.props}>{content}</RootRender>
  }
  return <>{content}</>
}

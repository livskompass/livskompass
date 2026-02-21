import type { Config } from '@puckeditor/core'
import { DropZone } from '@puckeditor/core'
import React from 'react'
import { puckConfig } from '@livskompass/shared'

type EditorType = 'page' | 'post' | 'course' | 'product'

/**
 * Editor-only Columns render that uses Puck's DropZone for drag-and-drop.
 * The shared Columns component is a pure render without DropZone to keep
 * @puckeditor/core out of the public web bundle.
 */
const layoutGridMap: Record<string, string> = {
  '50-50': 'md:grid-cols-2',
  '33-33-33': 'md:grid-cols-3',
  '66-33': 'md:grid-cols-[2fr_1fr]',
  '33-66': 'md:grid-cols-[1fr_2fr]',
}
const gapMap: Record<string, string> = { small: 'gap-4', medium: 'gap-8', large: 'gap-12' }
const verticalAlignMap: Record<string, string> = { top: 'items-start', center: 'items-center', bottom: 'items-end' }

function ColumnsEditor({
  layout = '50-50',
  gap = 'medium',
  verticalAlignment = 'top',
}: any) {
  const threeCol = layout === '33-33-33'
  const classes = [
    'grid grid-cols-1',
    layoutGridMap[layout] || layoutGridMap['50-50'],
    gapMap[gap] || gapMap.medium,
    verticalAlignMap[verticalAlignment] || verticalAlignMap.top,
  ].join(' ')

  return React.createElement('div', { className: classes },
    React.createElement('div', { className: 'min-h-[60px]' },
      React.createElement(DropZone, { zone: 'column-1', disallow: ['Columns'] })
    ),
    React.createElement('div', { className: 'min-h-[60px]' },
      React.createElement(DropZone, { zone: 'column-2', disallow: ['Columns'] })
    ),
    threeCol
      ? React.createElement('div', { className: 'min-h-[60px]' },
          React.createElement(DropZone, { zone: 'column-3', disallow: ['Columns'] })
        )
      : null
  )
}

/**
 * Returns a filtered puck config based on editor type.
 * - Page editor: hides data-bound blocks (CourseInfo, BookingCTA, PostHeader) and BookingForm
 * - Course editor: shows CourseInfo, BookingCTA, BookingForm; hides PostHeader
 * - Post editor: shows PostHeader; hides CourseInfo, BookingCTA, BookingForm
 * - Product editor: hides all data-bound and BookingForm
 */
export function getFilteredPuckConfig(editorType: EditorType): Config {
  const hiddenComponents: Record<EditorType, string[]> = {
    page: ['CourseInfo', 'BookingCTA', 'PostHeader', 'BookingForm'],
    course: ['Hero', 'PostHeader'],
    post: ['Hero', 'CourseInfo', 'BookingCTA', 'BookingForm'],
    product: ['Hero', 'CourseInfo', 'BookingCTA', 'PostHeader', 'BookingForm'],
  }

  const hidden = new Set(hiddenComponents[editorType])

  // Filter categories
  const categories: Config['categories'] = {}
  for (const [key, category] of Object.entries(puckConfig.categories || {})) {
    const filtered = (category.components || []).filter((c: string) => !hidden.has(c))
    if (filtered.length > 0) {
      categories[key] = { ...category, components: filtered }
    }
  }

  // Filter components + override Columns with editor version
  const components: Config['components'] = {}
  for (const [key, comp] of Object.entries(puckConfig.components || {})) {
    if (!hidden.has(key)) {
      if (key === 'Columns') {
        components[key] = { ...comp, render: ColumnsEditor as any }
      } else {
        components[key] = comp
      }
    }
  }

  return {
    ...puckConfig,
    categories,
    components,
  }
}

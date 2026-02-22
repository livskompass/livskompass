import React, { useCallback, useRef } from 'react'
import { usePuck } from '@puckeditor/core'
import type { Data } from '@puckeditor/core'
import { colors } from '../design-tokens'

// --- Toolbar field config types ---

export interface ToolbarFieldConfig {
  propName: string
  label: string
  type: 'select' | 'toggle' | 'text' | 'number'
  options?: { label: string; value: string | number | boolean }[]
}

// --- Registry: maps component type → toolbar fields ---

export const toolbarRegistry: Record<string, ToolbarFieldConfig[]> = {
  Hero: [
    { propName: 'preset', label: 'Layout', type: 'select', options: [
      { label: 'Centered', value: 'centered' }, { label: 'Split Right', value: 'split-right' },
      { label: 'Split Left', value: 'split-left' }, { label: 'Full Image', value: 'full-image' },
      { label: 'Minimal', value: 'minimal' },
    ]},
    { propName: 'bgStyle', label: 'Background', type: 'select', options: [
      { label: 'Gradient', value: 'gradient' }, { label: 'Forest', value: 'forest' }, { label: 'Stone', value: 'stone' },
    ]},
    { propName: 'image', label: 'Image URL', type: 'text' },
  ],
  ImageBlock: [
    { propName: 'src', label: 'Image URL', type: 'text' },
    { propName: 'alt', label: 'Alt text', type: 'text' },
    { propName: 'size', label: 'Size', type: 'select', options: [
      { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Full', value: 'full' },
    ]},
    { propName: 'rounded', label: 'Rounded', type: 'select', options: [
      { label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' },
    ]},
  ],
  VideoEmbed: [
    { propName: 'url', label: 'Video URL', type: 'text' },
    { propName: 'aspectRatio', label: 'Ratio', type: 'select', options: [
      { label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' },
    ]},
  ],
  SeparatorBlock: [
    { propName: 'variant', label: 'Style', type: 'select', options: [
      { label: 'Line', value: 'line' }, { label: 'Dots', value: 'dots' }, { label: 'Space only', value: 'space-only' },
    ]},
    { propName: 'spacing', label: 'Spacing', type: 'select', options: [
      { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' },
    ]},
  ],
  Spacer: [
    { propName: 'size', label: 'Size', type: 'select', options: [
      { label: 'XS', value: 'xs' }, { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' }, { label: 'XL', value: 'xl' },
    ]},
  ],
  Columns: [
    { propName: 'layout', label: 'Layout', type: 'select', options: [
      { label: '50/50', value: '50-50' }, { label: '33/33/33', value: '33-33-33' },
      { label: '66/33', value: '66-33' }, { label: '33/66', value: '33-66' },
    ]},
    { propName: 'gap', label: 'Gap', type: 'select', options: [
      { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' },
    ]},
  ],
  CTABanner: [
    { propName: 'backgroundColor', label: 'Background', type: 'select', options: [
      { label: 'Green', value: 'primary' }, { label: 'Gradient', value: 'gradient' },
      { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' },
    ]},
    { propName: 'buttonLink', label: 'Button link', type: 'text' },
  ],
  Testimonial: [
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Card', value: 'card' }, { label: 'Minimal', value: 'minimal' }, { label: 'Featured', value: 'featured' },
    ]},
  ],
  PersonCard: [
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Card', value: 'card' }, { label: 'Horizontal', value: 'horizontal' },
    ]},
    { propName: 'image', label: 'Image URL', type: 'text' },
    { propName: 'email', label: 'Email', type: 'text' },
    { propName: 'phone', label: 'Phone', type: 'text' },
  ],
  BookingCTA: [
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Card', value: 'card' }, { label: 'Inline', value: 'inline' },
    ]},
    { propName: 'buttonText', label: 'Button', type: 'text' },
  ],
  PostGrid: [
    { propName: 'count', label: 'Count', type: 'number' },
    { propName: 'columns', label: 'Columns', type: 'select', options: [
      { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    ]},
    { propName: 'showImage', label: 'Images', type: 'toggle' },
    { propName: 'showExcerpt', label: 'Excerpt', type: 'toggle' },
  ],
  PageCards: [
    { propName: 'parentSlug', label: 'Parent slug', type: 'text' },
    { propName: 'columns', label: 'Columns', type: 'select', options: [
      { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    ]},
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Card', value: 'card' }, { label: 'List', value: 'list' }, { label: 'Minimal', value: 'minimal' },
    ]},
  ],
  FeatureGrid: [
    { propName: 'columns', label: 'Columns', type: 'select', options: [
      { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    ]},
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Cards', value: 'cards' }, { label: 'Minimal', value: 'minimal' },
    ]},
  ],
  Accordion: [
    { propName: 'defaultOpen', label: 'Default open', type: 'select', options: [
      { label: 'None', value: 'none' }, { label: 'First', value: 'first' }, { label: 'All', value: 'all' },
    ]},
    { propName: 'style', label: 'Style', type: 'select', options: [
      { label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal', value: 'minimal' },
    ]},
  ],
  CardGrid: [
    { propName: 'source', label: 'Source', type: 'select', options: [
      { label: 'Manual', value: 'manual' }, { label: 'Posts', value: 'posts' },
      { label: 'Courses', value: 'courses' }, { label: 'Products', value: 'products' },
    ]},
    { propName: 'columns', label: 'Columns', type: 'select', options: [
      { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    ]},
  ],
}

// --- Data patching helper (same pattern as inline-edit-bridge) ---

function patchPuckData(data: Data, componentId: string, propName: string, value: unknown): Data | null {
  const rootIdx = data.content.findIndex((item) => item.props?.id === componentId)
  if (rootIdx !== -1) {
    const newContent = [...data.content]
    newContent[rootIdx] = {
      ...newContent[rootIdx],
      props: { ...newContent[rootIdx].props, [propName]: value },
    }
    return { ...data, content: newContent }
  }

  for (const [zoneName, zoneContent] of Object.entries(data.zones || {})) {
    const idx = zoneContent.findIndex((item) => item.props?.id === componentId)
    if (idx !== -1) {
      const newZoneContent = [...zoneContent]
      newZoneContent[idx] = {
        ...newZoneContent[idx],
        props: { ...newZoneContent[idx].props, [propName]: value },
      }
      return {
        ...data,
        zones: { ...data.zones, [zoneName]: newZoneContent },
      }
    }
  }

  return null
}

// --- Check if a component has array fields (for "Edit items" button) ---

function hasArrayProps(props: Record<string, unknown>): boolean {
  return Object.values(props).some((v) => Array.isArray(v))
}

// --- Inline styles ---

const toolbarBarStyle: React.CSSProperties = {
  position: 'absolute',
  top: -1,
  left: 0,
  right: 0,
  transform: 'translateY(-100%)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  background: '#fff',
  borderRadius: '8px 8px 0 0',
  boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
  border: `1px solid ${colors.stone[200]}`,
  borderBottom: 'none',
  zIndex: 50,
  flexWrap: 'wrap',
  minHeight: 36,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: colors.stone[500],
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

const selectStyle: React.CSSProperties = {
  fontSize: 12,
  height: 26,
  padding: '0 22px 0 6px',
  border: `1px solid ${colors.stone[200]}`,
  borderRadius: 5,
  background: '#fff',
  color: colors.stone[800],
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 6px center',
}

const inputStyle: React.CSSProperties = {
  fontSize: 12,
  height: 26,
  padding: '0 6px',
  border: `1px solid ${colors.stone[200]}`,
  borderRadius: 5,
  background: '#fff',
  color: colors.stone[800],
  outline: 'none',
  width: 120,
}

const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  height: 26,
  padding: '0 8px',
  border: `1px solid ${active ? colors.stone[300] : colors.stone[200]}`,
  borderRadius: 5,
  background: active ? colors.stone[100] : '#fff',
  color: active ? colors.stone[700] : colors.stone[500],
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 120ms ease',
})

const editBtnStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  height: 26,
  padding: '0 10px',
  border: `1px solid ${colors.stone[300]}`,
  borderRadius: 5,
  background: colors.stone[100],
  color: colors.stone[700],
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  marginLeft: 'auto',
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}

// --- Component ---

interface ComponentToolbarProps {
  children: React.ReactNode
  isSelected: boolean
}

export function ComponentToolbar({ children, isSelected }: ComponentToolbarProps) {
  const { appState, dispatch, selectedItem } = usePuck()
  const toolbarRef = useRef<HTMLDivElement>(null)

  const componentType = selectedItem?.type
  const componentId = selectedItem?.props?.id as string | undefined
  const componentProps = selectedItem?.props as Record<string, unknown> | undefined

  const fields = componentType ? toolbarRegistry[componentType] : undefined

  const updateProp = useCallback(
    (propName: string, value: unknown) => {
      if (!componentId) return
      const patched = patchPuckData(appState.data, componentId, propName, value)
      if (patched) {
        dispatch({ type: 'setData', data: patched })
      }
    },
    [appState.data, componentId, dispatch],
  )

  const handleEditItems = useCallback(() => {
    if (!componentId) return
    // Open Puck's right sidebar panel for array prop editing
    dispatch({
      type: 'setUi',
      ui: { rightSideBarVisible: true },
    } as any)
  }, [componentId, dispatch])

  // Prevent toolbar interactions from triggering Puck's drag system
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isSelected) return <>{children}</>

  const showToolbar = fields && fields.length > 0
  const showEditItems = componentProps && hasArrayProps(componentProps)

  return (
    <div style={{ position: 'relative' }}>
      {(showToolbar || showEditItems) && (
        <div
          ref={toolbarRef}
          style={toolbarBarStyle}
          onMouseDown={stopPropagation}
          onClick={stopPropagation}
        >
          {fields?.map((field) => (
            <div key={field.propName} style={fieldGroupStyle}>
              <span style={labelStyle}>{field.label}</span>
              {field.type === 'select' && field.options && (
                <select
                  style={selectStyle}
                  value={String(componentProps?.[field.propName] ?? '')}
                  onChange={(e) => {
                    const opt = field.options!.find((o) => String(o.value) === e.target.value)
                    updateProp(field.propName, opt ? opt.value : e.target.value)
                  }}
                >
                  {field.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'toggle' && (
                <button
                  type="button"
                  style={toggleBtnStyle(!!componentProps?.[field.propName])}
                  onClick={() => updateProp(field.propName, !componentProps?.[field.propName])}
                >
                  {componentProps?.[field.propName] ? 'On' : 'Off'}
                </button>
              )}
              {field.type === 'text' && (
                <input
                  type="text"
                  style={inputStyle}
                  value={String(componentProps?.[field.propName] ?? '')}
                  onChange={(e) => updateProp(field.propName, e.target.value)}
                  placeholder={field.label}
                />
              )}
              {field.type === 'number' && (
                <input
                  type="number"
                  style={{ ...inputStyle, width: 60 }}
                  value={componentProps?.[field.propName] != null ? Number(componentProps[field.propName]) : ''}
                  onChange={(e) => updateProp(field.propName, e.target.value ? Number(e.target.value) : 0)}
                />
              )}
            </div>
          ))}
          {showEditItems && (
            <button
              type="button"
              style={editBtnStyle}
              onClick={handleEditItems}
            >
              Edit items &#9656;
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

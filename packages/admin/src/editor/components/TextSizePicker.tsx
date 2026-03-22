import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { TextSize } from '@livskompass/shared'

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'display', label: 'Aa' },
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'body-lg', label: 'L' },
  { value: 'body', label: 'B' },
  { value: 'body-sm', label: 'S' },
  { value: 'caption', label: 'C' },
]

const TEXT_COLOR_OPTIONS: { value: string; label: string; css: string }[] = [
  { value: '', label: 'Default', css: '' },
  { value: 'text-forest-800', label: 'Dark Green', css: 'rgb(0, 70, 56)' },
  { value: 'text-forest-600', label: 'Green', css: 'rgb(20, 110, 90)' },
  { value: 'text-forest-400', label: 'Light Green', css: 'rgb(75, 160, 138)' },
  { value: 'text-amber-300', label: 'Yellow', css: 'rgb(255, 233, 98)' },
  { value: 'text-stone-950', label: 'Black', css: 'rgb(20, 19, 25)' },
  { value: 'text-stone-600', label: 'Gray', css: 'rgb(105, 103, 110)' },
  { value: 'text-white', label: 'White', css: '#ffffff' },
]

interface Props {
  puckData: { content: Array<{ type: string; props: Record<string, any> }> } | null
  saveBlockProp: (blockIndex: number, propName: string, value: string) => void
}

export function TextSizePicker({ puckData, saveBlockProp }: Props) {
  const [activeField, setActiveField] = useState<{ el: HTMLElement; prop: string; blockIdx: number } | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number>()

  // Read current size/color from puckData (always fresh)
  const block = activeField ? puckData?.content?.[activeField.blockIdx] : null
  const currentSize = (block?.props?._textSizes as Record<string, string> | undefined)?.[activeField?.prop || ''] || ''
  const currentColor = (block?.props?._textColors as Record<string, string> | undefined)?.[activeField?.prop || ''] || ''

  // Listen for focus on editable text fields
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!el.isContentEditable) return
      const prop = el.getAttribute('data-text-size-field')
      if (!prop) return
      const blockEl = el.closest('[data-block-index]') as HTMLElement | null
      if (!blockEl) return
      const idx = parseInt(blockEl.getAttribute('data-block-index') || '-1', 10)
      if (idx < 0) return
      setActiveField({ el, prop, blockIdx: idx })
    }

    const onFocusOut = (_e: FocusEvent) => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null
        const toolbar = document.getElementById('text-style-toolbar')
        if (toolbar?.contains(active)) return
        if (active?.getAttribute('data-text-size-field')) return
        setActiveField(null)
        setPos(null)
      }, 150)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // Position above focused element
  const updatePos = useCallback(() => {
    if (!activeField) { setPos(null); return }
    const r = activeField.el.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.top - 44 })
  }, [activeField])

  useEffect(() => {
    if (!activeField) { setPos(null); return }
    updatePos()
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updatePos)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [activeField, updatePos])

  const setSize = useCallback((size: TextSize) => {
    if (!activeField) return
    saveBlockProp(activeField.blockIdx, `_textSizes.${activeField.prop}`, size === 'body' ? '' : size)
    activeField.el.focus()
  }, [activeField, saveBlockProp])

  const setColor = useCallback((color: string) => {
    if (!activeField) return
    saveBlockProp(activeField.blockIdx, `_textColors.${activeField.prop}`, color)
    activeField.el.focus()
  }, [activeField, saveBlockProp])

  if (!activeField || !pos) return null

  const portal = document.getElementById('editor-portals') || document.body

  return createPortal(
    <div
      id="text-style-toolbar"
      className="fixed pointer-events-auto"
      style={{
        left: Math.max(200, Math.min(pos.x, window.innerWidth - 200)),
        top: Math.max(4, pos.y),
        transform: 'translate(-50%, 0)',
        zIndex: 9999,
        animation: 'editor-bounce-in 120ms ease forwards',
      }}
    >
      <div
        className="flex items-center gap-0.5 rounded-full px-1.5 py-1"
        style={{
          background: 'var(--editor-surface-glass, rgba(255,255,255,0.95))',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--editor-border, #E5E7EB)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Size buttons */}
        {TEXT_SIZE_OPTIONS.map((opt) => {
          const active = opt.value === (currentSize || 'body')
          return (
            <button
              key={opt.value}
              className="flex items-center justify-center h-7 rounded-md text-[11px] font-semibold transition-colors"
              style={{
                color: active ? 'var(--editor-blue)' : 'var(--editor-text-muted, #6B7280)',
                background: active ? 'var(--editor-blue-lightest)' : 'transparent',
                minWidth: 26, paddingInline: 4,
              }}
              onMouseDown={(e) => { e.preventDefault(); setSize(opt.value) }}
              title={opt.value}
            >
              {opt.label}
            </button>
          )
        })}

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--editor-neutral-200, #E5E7EB)' }} />

        {/* Color swatches */}
        {TEXT_COLOR_OPTIONS.map((opt) => {
          const active = opt.value === currentColor
          return (
            <button
              key={opt.value || '_default'}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-all"
              style={{
                outline: active ? '2px solid var(--editor-blue)' : '1px solid var(--editor-neutral-200, #ddd)',
                outlineOffset: 1,
              }}
              onMouseDown={(e) => { e.preventDefault(); setColor(opt.value) }}
              title={opt.label}
            >
              <span
                className="w-4 h-4 rounded-full block"
                style={{
                  background: opt.css || 'conic-gradient(#004638, #FFE962, #C7DDDC, #004638)',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>,
    portal,
  )
}

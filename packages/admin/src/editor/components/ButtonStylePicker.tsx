import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ArrowUpRight, ChevronRight, ExternalLink, Download, Mail, Phone, Play, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon | null }[] = [
  { value: '', label: 'No icon', icon: null },
  { value: 'arrow-right', label: 'Arrow Right', icon: ArrowRight },
  { value: 'arrow-up-right', label: 'Arrow Up Right', icon: ArrowUpRight },
  { value: 'chevron-right', label: 'Chevron Right', icon: ChevronRight },
  { value: 'external-link', label: 'External Link', icon: ExternalLink },
  { value: 'download', label: 'Download', icon: Download },
  { value: 'mail', label: 'Mail', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'play', label: 'Play', icon: Play },
]

const BUTTON_VARIANTS = [
  { value: 'primary', label: 'Primary', preview: 'bg-forest-800 text-white' },
  { value: 'secondary', label: 'Secondary', preview: 'bg-amber-300 text-forest-800' },
  { value: 'outline', label: 'Outline', preview: 'border-2 border-forest-800 text-forest-800 bg-transparent' },
  { value: 'ghost', label: 'Ghost', preview: 'text-forest-800 bg-forest-50' },
  { value: 'primary-inv', label: 'Primary Inv', preview: 'bg-white text-forest-800' },
  { value: 'outline-inv', label: 'Outline Inv', preview: 'border-2 border-white text-white bg-transparent' },
]

interface Props {
  puckData: { content: Array<{ type: string; props: Record<string, any> }> } | null
  saveBlockProp: (blockIndex: number, propName: string, value: any) => void
}

export function ButtonStylePicker({ puckData, saveBlockProp }: Props) {
  const [activeField, setActiveField] = useState<{ el: HTMLElement; prop: string; blockIdx: number } | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number>()

  // Read current values from puckData
  const block = activeField ? puckData?.content?.[activeField.blockIdx] : null

  // Read current variant/icon — from array item or from _buttonStyles map
  const readCurrent = () => {
    if (!activeField || !block) return { variant: 'primary', icon: 'arrow-right' }
    const prop = activeField.prop
    const arrayMatch = prop.match(/^(.+)\[(\d+)\]\.text$/)
    if (arrayMatch) {
      // Read from array item directly (e.g., buttons[0].variant)
      const arr = block.props?.[arrayMatch[1]] as any[]
      const item = arr?.[Number(arrayMatch[2])]
      return { variant: item?.variant || 'primary', icon: item?.icon || (item?.showIcon !== false ? 'arrow-right' : '') }
    }
    // Legacy: read from _buttonStyles map
    const btnStylesRaw = block.props?._buttonStyles as Record<string, any> | undefined
    const rawVal = btnStylesRaw?.[prop]
    const parsed = (() => { try { return typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal } catch { return null } })()
    return { variant: parsed?.variant || 'primary', icon: parsed?.icon || 'arrow-right' }
  }
  const { variant: currentVariant, icon: currentIcon } = readCurrent()

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!el.isContentEditable) return
      const prop = el.getAttribute('data-button-style-field')
      if (!prop) return
      const blockEl = el.closest('[data-block-index]') as HTMLElement | null
      if (!blockEl) return
      const idx = parseInt(blockEl.getAttribute('data-block-index') || '-1', 10)
      if (idx < 0) return
      setActiveField({ el, prop, blockIdx: idx })
    }

    const onFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null
        const toolbar = document.getElementById('button-style-toolbar')
        if (toolbar?.contains(active)) return
        if (active?.getAttribute('data-button-style-field')) return
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

  const updatePos = useCallback(() => {
    if (!activeField) { setPos(null); return }
    const r = activeField.el.getBoundingClientRect()
    // Find the parent button/link element for better positioning
    const btnEl = activeField.el.closest('a, button') as HTMLElement | null
    const targetRect = btnEl?.getBoundingClientRect() || r
    setPos({ x: targetRect.left + targetRect.width / 2, y: targetRect.top - 48 })
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

  const saveVariant = useCallback((variant: string) => {
    if (!activeField || !puckData) return
    const prop = activeField.prop
    // For array button fields like "buttons[0].text", save variant to "buttons[0].variant"
    const arrayMatch = prop.match(/^(.+\[\d+\])\.text$/)
    if (arrayMatch) {
      saveBlockProp(activeField.blockIdx, `${arrayMatch[1]}.variant`, variant)
    } else {
      // Legacy: save to _buttonStyles map
      const block = puckData.content?.[activeField.blockIdx]
      if (!block) return
      const existing = { ...(block.props?._buttonStyles as Record<string, any> || {}) }
      const cur = (() => { try { return typeof existing[prop] === 'string' ? JSON.parse(existing[prop]) : existing[prop] || {} } catch { return {} } })()
      existing[prop] = JSON.stringify({ ...cur, variant })
      saveBlockProp(activeField.blockIdx, '_buttonStyles', existing)
    }
    activeField.el.focus()
  }, [activeField, puckData, saveBlockProp])

  const saveIcon = useCallback((icon: string) => {
    if (!activeField || !puckData) return
    const prop = activeField.prop
    // For array button fields, save icon to "buttons[0].icon"
    const arrayMatch = prop.match(/^(.+\[\d+\])\.text$/)
    if (arrayMatch) {
      saveBlockProp(activeField.blockIdx, `${arrayMatch[1]}.icon`, icon)
      // Also save showIcon based on whether icon is set
      saveBlockProp(activeField.blockIdx, `${arrayMatch[1]}.showIcon`, icon ? true : false)
    } else {
      const block = puckData.content?.[activeField.blockIdx]
      if (!block) return
      const existing = { ...(block.props?._buttonStyles as Record<string, any> || {}) }
      const cur = (() => { try { return typeof existing[prop] === 'string' ? JSON.parse(existing[prop]) : existing[prop] || {} } catch { return {} } })()
      existing[prop] = JSON.stringify({ ...cur, icon })
      saveBlockProp(activeField.blockIdx, '_buttonStyles', existing)
    }
    activeField.el.focus()
  }, [activeField, puckData, saveBlockProp])

  if (!activeField || !pos) return null

  const portal = document.getElementById('editor-portals') || document.body

  return createPortal(
    <div
      id="button-style-toolbar"
      className="fixed pointer-events-auto"
      style={{
        left: Math.max(160, Math.min(pos.x, window.innerWidth - 160)),
        top: Math.max(4, pos.y),
        transform: 'translate(-50%, 0)',
        zIndex: 9999,
        animation: 'editor-bounce-in 120ms ease forwards',
      }}
    >
      <div
        className="flex items-center gap-1 rounded-full px-1.5 py-1"
        style={{
          background: 'var(--editor-surface-glass, rgba(255,255,255,0.95))',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--editor-border, #E5E7EB)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Variant buttons */}
        {BUTTON_VARIANTS.map((v) => (
          <button
            key={v.value}
            className={`flex items-center justify-center h-7 px-2 rounded-md text-[10px] font-semibold transition-all ${v.preview}`}
            style={{
              outline: currentVariant === v.value ? '2px solid var(--editor-blue)' : 'none',
              outlineOffset: 2,
              minWidth: 50,
            }}
            onMouseDown={(e) => { e.preventDefault(); saveVariant(v.value) }}
            title={v.label}
          >
            {v.label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--editor-neutral-200, #E5E7EB)' }} />

        {/* Icon picker */}
        {ICON_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = currentIcon === opt.value
          return (
            <button
              key={opt.value}
              className="flex items-center justify-center w-7 h-7 rounded-md transition-all"
              style={{
                color: active ? 'var(--editor-blue)' : 'var(--editor-text-muted, #6B7280)',
                background: active ? 'var(--editor-blue-lightest)' : 'transparent',
              }}
              onMouseDown={(e) => { e.preventDefault(); saveIcon(opt.value) }}
              title={opt.label}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : <X className="h-3 w-3 opacity-40" />}
            </button>
          )
        })}
      </div>
    </div>,
    portal,
  )
}

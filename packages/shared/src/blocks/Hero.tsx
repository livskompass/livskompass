import { useContext } from 'react'
import { cn } from '../ui/utils'
import { ArrowRight, ChevronDown, Camera } from 'lucide-react'
import { useEditableText, useInlineEdit, useInlineEditBlock, InlineImagePickerContext } from '../context'
import { InlineImage } from './InlineImage'
import { resolveMediaUrl } from '../helpers'
import { resolveButtonIcon, buttonVariantClasses } from './buttonUtils'
import { BlurRevealText, BlurRevealWrap } from './BlurReveal'

const BLUR_DELAY_HEADING = 0
const BLUR_DELAY_SUBHEADING = 0.7
const BLUR_DELAY_CTAS = 1.4

export type HeroPreset = 'centered' | 'split-right' | 'split-left' | 'full-image' | 'minimal' | 'fullscreen'
export type HeroBgStyle = 'gradient' | 'forest' | 'stone'
export type HeroOverlay = 'dark-3' | 'dark-2' | 'dark-1' | 'light-1' | 'light-2' | 'light-3'

// Migrate old values ('light' | 'medium' | 'heavy') to the new 6-step scale.
function normalizeOverlay(v: string | undefined): HeroOverlay {
  if (!v) return 'dark-2'
  if (v === 'light') return 'dark-1'
  if (v === 'medium') return 'dark-2'
  if (v === 'heavy') return 'dark-3'
  return v as HeroOverlay
}
export type HeroContentPosition = 'center' | 'center-left' | 'center-right' | 'top-left' | 'top-center' | 'lower-left' | 'bottom-left' | 'bottom-center'
export type HeroTextAlign = 'left' | 'center'

export type HeroTopOverlay = 'none' | 'dark' | 'light'
export type HeroSubBlur = 'none' | 'light' | 'dark'

export interface HeroProps {
  preset: HeroPreset
  heading: string
  subheading: string
  bgStyle: HeroBgStyle
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  image: string
  backgroundImage: string
  backgroundVideo: string
  overlayDarkness: HeroOverlay
  contentPosition: HeroContentPosition
  showScrollIndicator: boolean
  textAlignment?: HeroTextAlign
  showHeading?: boolean
  showSubheading?: boolean
  showInput?: boolean
  inputPlaceholder?: string
  inputButtonText?: string
  topOverlay?: HeroTopOverlay
  subBlur?: HeroSubBlur
  bottomOverlay?: HeroBottomOverlay
  subheadings?: Array<{ text: string }>
  buttons?: Array<{ text: string; link: string; externalUrl?: string; variant?: string; showIcon?: boolean; icon?: string }>
}

const bgStyles: Record<HeroBgStyle, string> = {
  gradient: '',
  forest: '',
  stone: '',
}

const bgInlineStyles: Record<HeroBgStyle, React.CSSProperties> = {
  gradient: { background: 'var(--gradient-hero)' },
  forest: { background: 'var(--gradient-hero)' },
  stone: { background: 'var(--gradient-hero)' },
}

const overlayPeak: Record<HeroOverlay, number> = {
  'dark-1': 0.30,
  'dark-2': 0.55,
  'dark-3': 0.80,
  'light-1': 0.30,
  'light-2': 0.55,
  'light-3': 0.80,
}

/**
 * Eased gradient generator — creates a smooth multi-stop gradient
 * using an ease-out curve (stays opaque longer, accelerates fade).
 * This avoids the visible banding of 2-3 stop CSS gradients.
 */
function easedGradient(direction: string, color: string, startAlpha: number, endAlpha: number, stops = 12): string {
  const points: string[] = []
  for (let i = 0; i <= stops; i++) {
    const t = i / stops
    // Ease-out cubic: stays opaque longer, then accelerates to transparent
    const eased = 1 - Math.pow(1 - t, 3)
    const alpha = startAlpha + (endAlpha - startAlpha) * eased
    const pct = Math.round(t * 100)
    points.push(`${color.replace('$a', alpha.toFixed(3))} ${pct}%`)
  }
  return `linear-gradient(${direction}, ${points.join(', ')})`
}

/** Eased gradient with CSS var color (space-separated RGB channels) */
function easedVarGradient(direction: string, cssVar: string, startAlpha: number, endAlpha: number, stops = 12): string {
  const points: string[] = []
  for (let i = 0; i <= stops; i++) {
    const t = i / stops
    const eased = 1 - Math.pow(1 - t, 3)
    const alpha = startAlpha + (endAlpha - startAlpha) * eased
    const pct = Math.round(t * 100)
    points.push(`rgb(var(${cssVar}) / ${alpha.toFixed(3)}) ${pct}%`)
  }
  return `linear-gradient(${direction}, ${points.join(', ')})`
}

/** Top gradient overlay — covers the nav zone only (top ~140px) */
function TopOverlay({ type }: { type: string }) {
  if (!type || type === 'none') return null
  const gradient = type === 'dark'
    ? easedVarGradient('180deg', '--forest-950', 0.82, 0)
    : easedGradient('180deg', 'rgba(255,255,255,$a)', 0.85, 0)
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
      style={{ height: '140px', background: gradient }}
    />
  )
}

export type HeroBottomOverlay = 'none' | 'surface' | 'white' | 'forest-800' | 'forest-950'

/** Bottom gradient overlay — melts hero into the next section */
function BottomOverlay({ type }: { type?: string }) {
  if (!type || type === 'none') return null

  // For CSS var colors (space-separated channels), use rgb(var(--x) / alpha)
  // For hex/resolved colors, use rgba
  type ColorDef = { cssVar: string } | { hex: string }
  const colorDefs: Record<string, ColorDef> = {
    'surface':     { hex: '#F8F6F2' },
    'white':       { hex: '#ffffff' },
    'mist':        { cssVar: '--mist' },
    'amber':       { cssVar: '--amber-300' },
    'forest-800':  { cssVar: '--forest-800' },
    'forest-950':  { cssVar: '--forest-950' },
  }
  const def = colorDefs[type] || colorDefs.surface

  const stops: string[] = []
  const numStops = 16
  for (let i = 0; i <= numStops; i++) {
    const t = i / numStops
    // Smooth ease-in-out: gentle start, gradual middle, soft landing
    const alpha = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2
    const pct = Math.round(t * 100)
    if ('cssVar' in def) {
      stops.push(`rgb(var(${def.cssVar}) / ${alpha.toFixed(3)}) ${pct}%`)
    } else {
      const r = parseInt(def.hex.slice(1, 3), 16)
      const g = parseInt(def.hex.slice(3, 5), 16)
      const b = parseInt(def.hex.slice(5, 7), 16)
      stops.push(`rgba(${r},${g},${b},${alpha.toFixed(3)}) ${pct}%`)
    }
  }
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
      style={{ height: '320px', background: `linear-gradient(to bottom, ${stops.join(', ')})` }}
    />
  )
}

/** Build the main hero overlay gradient (covers full area, bottom-heavy).
 *  Single gradient from top to bottom with eased curve:
 *  top = moderate tint → middle = lightest → bottom = peak tint.
 *  Dark variants tint with --forest-950 (use for dark-on-light text contrast pulled UP
 *  toward dark text); light variants tint with white (use for dark-on-light text contrast
 *  needed against a busy/medium image). */
function heroOverlayGradient(overlayDarkness: HeroOverlay): string {
  const peak = overlayPeak[overlayDarkness]
  const isLight = overlayDarkness.startsWith('light')
  const top = peak * 0.55
  const mid = peak * 0.2
  const stops = 16
  const points: string[] = []
  for (let i = 0; i <= stops; i++) {
    const t = i / stops
    let alpha: number
    if (t <= 0.4) {
      const p = t / 0.4
      const eased = 1 - Math.pow(1 - p, 2)
      alpha = top + (mid - top) * eased
    } else {
      const p = (t - 0.4) / 0.6
      const eased = Math.pow(p, 2.5)
      alpha = mid + (peak - mid) * eased
    }
    const pct = Math.round(t * 100)
    if (isLight) {
      points.push(`rgba(255, 255, 255, ${alpha.toFixed(3)}) ${pct}%`)
    } else {
      points.push(`rgb(var(--forest-950) / ${alpha.toFixed(3)}) ${pct}%`)
    }
  }
  return `linear-gradient(to bottom, ${points.join(', ')})`
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

/** Camera button overlay for background images (admin only) */
function BgImageButton({ propName, src }: { propName: string; src: string }) {
  const editCtx = useInlineEditBlock()
  const pickerCtx = useContext(InlineImagePickerContext)
  if (!editCtx || !pickerCtx) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        pickerCtx.requestImagePick(src, (newUrl) => {
          editCtx.saveBlockProp(editCtx.blockIndex, propName, newUrl)
        })
      }}
      className="absolute top-4 right-4 z-20 opacity-0 group-hover/hero-bg:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg"
      aria-label="Change background image"
    >
      <Camera className="h-4 w-4 text-foreground" />
    </button>
  )
}


function HeroButtonItem({ btn, index, variantClasses }: { btn: { text: string; link: string; externalUrl?: string; variant?: string; showIcon?: boolean; icon?: string }; index: number; variantClasses: Record<string, string> }) {
  const textEdit = useEditableText(`buttons[${index}].text`, btn.text)
  const Icon = btn.icon ? resolveButtonIcon(btn.icon) : (btn.showIcon !== false ? ArrowRight : null)
  const href = btn.externalUrl || btn.link
  const isExternal = !!btn.externalUrl
  const { className: _, ...editHandlers } = textEdit || { className: '' }

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', variantClasses[btn.variant || 'primary'])}
    >
      <span {...editHandlers} className={textEdit?.className}>{btn.text}</span>
      {Icon && <Icon className="ml-2 h-4 w-4" />}
    </a>
  )
}

function HeroButtons({ buttons, variantClasses }: { buttons: Array<{text: string; link: string; externalUrl?: string; variant?: string; showIcon?: boolean; icon?: string}>; variantClasses: Record<string, string> }) {
  if (!buttons.length) return null
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10">
      {buttons.map((btn, i) => (
        <HeroButtonItem key={i} btn={btn} index={i} variantClasses={variantClasses} />
      ))}
    </div>
  )
}

function HeroSubheadingItem({ item, index, textClass, centered }: { item: { text: string }; index: number; textClass: string; centered?: boolean }) {
  const textEdit = useEditableText(`subheadings[${index}].text`, item.text)
  const isAdmin = useInlineEditBlock()?.isAdmin ?? false
  const { className: _, ...editHandlers } = textEdit || { className: '' }
  return (
    <BlurRevealText
      as="p"
      text={item.text}
      startDelay={BLUR_DELAY_SUBHEADING + index * 0.25}
      disabled={isAdmin}
      editProps={editHandlers}
      className={cn('text-body-lg mt-3 max-w-[540px] leading-relaxed', centered && 'mx-auto', textClass, textEdit?.className)}
      style={textEdit?.style}
    />
  )
}

function HeroSubheadings({ items, textClass, centered }: { items: Array<{ text: string }>; textClass: string; centered?: boolean }) {
  if (!items.length) return null
  return (
    <>
      {items.map((item, i) => (
        <HeroSubheadingItem key={i} item={item} index={i} textClass={textClass} centered={centered} />
      ))}
    </>
  )
}

function HeroInput({ placeholder, buttonText }: { placeholder: string; buttonText: string }) {
  return (
    <div className="flex items-center bg-white rounded-lg p-1.5 mt-8 max-w-md animate-hero-enter shadow-lg" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
      <input type="email" placeholder={placeholder} className="flex-1 px-4 py-2 bg-transparent text-brand placeholder:text-faint outline-none text-body-sm" />
      <button className="bg-highlight-soft text-brand font-medium px-5 py-2 rounded-md hover:bg-amber-200 transition-colors text-body-sm whitespace-nowrap">{buttonText}</button>
    </div>
  )
}

export function Hero({
  preset = 'centered',
  heading = 'Heading here',
  subheading = '',
  bgStyle = 'gradient',
  ctaPrimaryText = '',
  ctaPrimaryLink = '',
  ctaSecondaryText = '',
  ctaSecondaryLink = '',
  image = '',
  backgroundImage = '',
  backgroundVideo = '',
  overlayDarkness = 'dark-2',
  contentPosition = 'center',
  showScrollIndicator = true,
  textAlignment = 'left',
  showHeading,
  showSubheading,
  showInput,
  inputPlaceholder,
  inputButtonText,
  topOverlay = 'none',
  bottomOverlay = 'none',
  subBlur = 'none',
  subheadings: subheadingsRaw,
  buttons: buttonsRaw,
  id,
}: HeroProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Auto-migrate legacy props into new arrays
  const buttons = (buttonsRaw && buttonsRaw.length > 0) ? buttonsRaw : [
    ...(ctaPrimaryText && ctaPrimaryLink ? [{ text: ctaPrimaryText, link: ctaPrimaryLink, variant: 'primary', showIcon: true }] : []),
    ...(ctaSecondaryText && ctaSecondaryLink ? [{ text: ctaSecondaryText, link: ctaSecondaryLink, variant: 'secondary', showIcon: false }] : []),
  ].filter(b => b.text)
  const subheadings = (subheadingsRaw && subheadingsRaw.length > 0) ? subheadingsRaw : (subheading ? [{ text: subheading }] : [])

  // Determine nav theme: dark hero = light nav text, light hero = dark nav text
  const overlay = normalizeOverlay(overlayDarkness)
  const isLightSideOverlay = overlay.startsWith('light') || overlay === 'dark-1'
  const hasDarkBg = (backgroundImage || backgroundVideo)
    ? !isLightSideOverlay // image/video with dark-2/dark-3 overlay = dark bg
    : false // solid mist bg = light
  const navTheme = hasDarkBg ? 'dark' : 'light'

  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)
  const ctaPrimaryTextEdit = useEditableText('ctaPrimaryText', ctaPrimaryText)
  const ctaSecondaryTextEdit = useEditableText('ctaSecondaryText', ctaSecondaryText)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx

  const hEdit = editHandlers(headingEdit)
  const sEdit = editHandlers(subheadingEdit)
  const hCls = headingEdit?.className
  const sCls = subheadingEdit?.className
  const ctaPEdit = editHandlers(ctaPrimaryTextEdit)
  const ctaSEdit = editHandlers(ctaSecondaryTextEdit)

  // ── Shared style helpers (used by ALL presets) ──
  const textPrimary = 'text-brand'
  const textSecondary = 'text-accent'

  // Read button styles from block data (set by ButtonStylePicker)
  const editBlockCtx = useInlineEditBlock()
  const isAdmin = editBlockCtx?.isAdmin ?? false
  const btnStyles = editBlockCtx?.blockProps?._buttonStyles as Record<string, string> | undefined
  const parseBtnStyle = (propName: string) => {
    try { return btnStyles?.[propName] ? JSON.parse(btnStyles[propName]) : null } catch { return null }
  }
  const primaryStyle = parseBtnStyle('ctaPrimaryText')
  const secondaryStyle = parseBtnStyle('ctaSecondaryText')

  const variantClasses = buttonVariantClasses
  const btnPrimary = variantClasses[primaryStyle?.variant || 'primary']
  const btnSecondary = variantClasses[secondaryStyle?.variant || 'secondary']
  const PrimaryIcon = resolveButtonIcon(primaryStyle?.icon ?? 'arrow-right')
  const SecondaryIcon = resolveButtonIcon(secondaryStyle?.icon ?? '')
  const headingStyle: React.CSSProperties = { fontFamily: "var(--font-display, 'Rubik', sans-serif)", fontSize: 'var(--type-display)', lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)', fontWeight: 460 }

  // Sub-heading shadows temporarily disabled — flip SUB_SHADOWS_ENABLED to restore.
  const SUB_SHADOWS_ENABLED = false
  const subGlowShadow = SUB_SHADOWS_ENABLED && subBlur && subBlur !== 'none'
    ? subBlur === 'light'
      ? '0 0 120px 160px rgba(255,255,255,0.12)'
      : '0 0 120px 160px rgba(0,0,0,0.15)'
    : undefined
  const subTextShadow = SUB_SHADOWS_ENABLED && subBlur && subBlur !== 'none'
    ? subBlur === 'light'
      ? '0 1px 4px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(255,255,255,0.5)'
      : '0 1px 4px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.5)'
    : undefined

  // ── Fullscreen preset ──
  if (preset === 'fullscreen') {
    const positionClasses: Record<HeroContentPosition, string> = {
      'center': 'items-center justify-center text-center',
      'center-left': 'items-start justify-center text-left',
      'center-right': 'items-end justify-center text-right',
      'top-left': 'items-start justify-start text-left pt-24 md:pt-32',
      'top-center': 'items-center justify-start text-center pt-24 md:pt-32',
      'lower-left': 'items-start justify-end text-left pb-[10vh] md:pb-[14vh]',
      'bottom-left': 'items-start justify-end text-left pb-16 md:pb-24',
      'bottom-center': 'items-center justify-end text-center pb-16 md:pb-24',
    }

    return (
      <section data-nav-theme={navTheme} className={cn('relative overflow-hidden group/hero-bg', bgStyles[bgStyle])} style={{ height: '100svh', width: '100vw', marginLeft: 'calc(-50vw + 50%)', ...bgInlineStyles[bgStyle] }}>
        {/* Background video */}
        {backgroundVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={resolveMediaUrl(backgroundVideo)}
          />
        )}
        {/* Background image (fallback when no video) */}
        {!backgroundVideo && backgroundImage && (
          <div className="absolute inset-0" style={{ backgroundImage: `url(${resolveMediaUrl(backgroundImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {/* Placeholder when no background media */}
        {!backgroundVideo && !backgroundImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-faint">
              <Camera className="h-14 w-14 mx-auto mb-3 opacity-50" />
              <span className="text-body-sm font-medium">Click to add background image</span>
            </div>
          </div>
        )}
        <BgImageButton propName="backgroundImage" src={backgroundImage} />
        {/* Overlay — smooth multi-stop eased gradient */}
        {(backgroundImage || backgroundVideo) && <div className="absolute inset-0" style={{ background: heroOverlayGradient(overlay) }} />}
        {/* Top gradient overlay for nav contrast */}
        <TopOverlay type={topOverlay} />
        {/* Bottom gradient overlay — melt into next section */}
        <BottomOverlay type={bottomOverlay} />
        {/* Content — aligned to page container, offset for nav height */}
        <div
          className={cn('relative z-20 flex flex-col h-full mx-auto', positionClasses[contentPosition || 'center'])}
          style={{ maxWidth: 'var(--width-content, 1440px)', paddingInline: 'var(--container-px, 1rem)', paddingTop: '72px' }}
        >
          <div className={cn('max-w-3xl', contentPosition === 'center' ? 'mx-auto text-center' : contentPosition?.includes('right') ? 'text-right' : 'text-left')}>
            {showHeading !== false && (
              <BlurRevealText
                as="h1"
                text={heading}
                startDelay={BLUR_DELAY_HEADING}
                disabled={isAdmin}
                editProps={hEdit}
                className={cn('text-display max-w-[20ch]', textPrimary, hCls)}
                style={{ ...headingStyle, position: 'relative' as const, zIndex: 2, ...hEdit?.style }}
              />
            )}
            {showSubheading !== false && (
              <div className={cn('relative mt-6', contentPosition === 'center' && 'mx-auto')} style={{ maxWidth: 540, isolation: 'isolate' }}>
                {subGlowShadow && (
                  <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: 0, boxShadow: subGlowShadow, borderRadius: '50%', zIndex: -1 }} />
                )}
                <div className="relative" style={{ zIndex: 1, textShadow: subTextShadow }}>
                  {(!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
                    <BlurRevealText
                      as="p"
                      text={subheading}
                      startDelay={BLUR_DELAY_SUBHEADING}
                      disabled={isAdmin}
                      editProps={sEdit}
                      className={cn('text-body-lg leading-relaxed', textSecondary, sCls)}
                    />
                  )}
                  {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={contentPosition === 'center'} />}
                </div>
              </div>
            )}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin}>
                <HeroButtons buttons={buttons} variantClasses={variantClasses} />
              </BlurRevealWrap>
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin} className={cn('flex flex-col sm:flex-row gap-4 mt-8 md:mt-10', contentPosition === 'center' && 'justify-center')}>
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                    {SecondaryIcon && <SecondaryIcon className="ml-2 h-4 w-4" />}
                  </a>
                )}
              </BlurRevealWrap>
            ) : null}
            {/* Email input */}
            {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
          </div>
        </div>
        {/* Scroll indicator */}
        {showScrollIndicator !== false && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-hero-enter" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <ChevronDown className="h-6 w-6 opacity-60 animate-bounce" />
          </div>
        )}
      </section>
    )
  }

  // ── Minimal preset ──
  if (preset === 'minimal') {
    return (
      <section data-nav-theme={navTheme} className={cn('relative overflow-hidden', bgStyles[bgStyle])} style={{ paddingTop: 'var(--section-lg)', paddingBottom: 'var(--section-md)', ...bgInlineStyles[bgStyle] }}>
        {bgStyle === 'gradient' && <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />}
        <div className="relative" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          {showHeading !== false && (
            <BlurRevealText
              as="h1"
              text={heading}
              startDelay={BLUR_DELAY_HEADING}
              disabled={isAdmin}
              editProps={hEdit}
              className={cn('text-display max-w-[20ch]', textPrimary, hCls)}
              style={{ ...headingStyle, position: 'relative' as const, zIndex: 2, ...hEdit?.style }}
            />
          )}
          {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
            <BlurRevealText
              as="p"
              text={subheading}
              startDelay={BLUR_DELAY_SUBHEADING}
              disabled={isAdmin}
              editProps={sEdit}
              className={cn('text-body-lg mt-6 max-w-[540px] leading-relaxed', textSecondary, sCls)}
              style={sEdit?.style}
            />
          )}
          {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} />}
            {/* Buttons */}
          {buttons && buttons.length > 0 ? (
            <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin}>
              <HeroButtons buttons={buttons} variantClasses={variantClasses} />
            </BlurRevealWrap>
          ) : null}
          {/* Email input */}
          {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
        </div>
      </section>
    )
  }

  // ── Full-image preset (with video support + content position) ──
  if (preset === 'full-image') {
    // Grid placement for content position
    const gridPlace: Record<string, React.CSSProperties> = {
      'center':        { alignContent: 'center', textAlign: 'center' as const },
      'center-left':   { alignContent: 'center', textAlign: 'left' as const },
      'center-right':  { alignContent: 'center', textAlign: 'right' as const },
      'lower-left':    { alignContent: 'end', textAlign: 'left' as const, paddingBottom: 'clamp(40px, 9vh, 120px)' },
      'bottom-left':   { alignContent: 'end', textAlign: 'left' as const },
      'bottom-center': { alignContent: 'end', textAlign: 'center' as const },
    }
    const gridPos = gridPlace[contentPosition || 'center'] || gridPlace.center

    return (
      <section data-nav-theme={navTheme} className={cn('relative overflow-hidden group/hero-bg', bgStyles[bgStyle])} style={{ height: 'max(70vh, 560px)', display: 'grid', ...gridPos, ...bgInlineStyles[bgStyle] }}>
        {/* Background video */}
        {backgroundVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={resolveMediaUrl(backgroundVideo)}
          />
        )}
        {/* Background image (fallback when no video) */}
        {!backgroundVideo && backgroundImage && (
          <div className="absolute inset-0" style={{ backgroundImage: `url(${resolveMediaUrl(backgroundImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {/* Placeholder when no media */}
        {!backgroundVideo && !backgroundImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-faint">
              <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <span className="text-body-sm font-medium">Click to add background image</span>
            </div>
          </div>
        )}
        <BgImageButton propName="backgroundImage" src={backgroundImage} />
        {/* Overlay — smooth multi-stop eased gradient */}
        {(backgroundImage || backgroundVideo) && <div className="absolute inset-0" style={{ background: heroOverlayGradient(overlay) }} />}
        {/* Top gradient overlay for nav contrast */}
        <TopOverlay type={topOverlay} />
        {/* Bottom gradient overlay — melt into next section */}
        <BottomOverlay type={bottomOverlay} />
        {/* Content — CSS grid on section handles all positioning */}
        <div
          className="relative z-20 w-full mx-auto"
          style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}
        >
          <div className={cn('max-w-3xl', contentPosition === 'center' || contentPosition === 'bottom-center' ? 'mx-auto text-center' : contentPosition?.includes('right') ? 'text-right' : 'text-left')}>
            {showHeading !== false && (
              <BlurRevealText
                as="h1"
                text={heading}
                startDelay={BLUR_DELAY_HEADING}
                disabled={isAdmin}
                editProps={hEdit}
                className={cn('text-display max-w-[24ch]', textPrimary, contentPosition === 'center' && 'mx-auto', hCls)}
                style={{ ...headingStyle, position: 'relative' as const, zIndex: 2, ...hEdit?.style }}
              />
            )}
            {showSubheading !== false && (
              <div className={cn('relative mt-6', (contentPosition === 'center' || contentPosition === 'bottom-center') && 'mx-auto')} style={{ maxWidth: 540, isolation: 'isolate' }}>
                {subGlowShadow && (
                  <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: 0, boxShadow: subGlowShadow, borderRadius: '50%', zIndex: -1 }} />
                )}
                <div className="relative" style={{ zIndex: 1, textShadow: subTextShadow }}>
                  {(!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
                    <BlurRevealText
                      as="p"
                      text={subheading}
                      startDelay={BLUR_DELAY_SUBHEADING}
                      disabled={isAdmin}
                      editProps={sEdit}
                      className={cn('text-body-lg leading-relaxed', textSecondary, sCls)}
                    />
                  )}
                  {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={contentPosition === 'center' || contentPosition === 'bottom-center'} />}
                </div>
              </div>
            )}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin}>
                <HeroButtons buttons={buttons} variantClasses={variantClasses} />
              </BlurRevealWrap>
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin} className={cn('flex flex-col sm:flex-row gap-4 mt-10', contentPosition === 'center' && 'justify-center')}>
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                  </a>
                )}
              </BlurRevealWrap>
            ) : null}
            {/* Email input */}
            {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
          </div>
        </div>
        {/* Scroll indicator */}
        {showScrollIndicator !== false && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-hero-enter" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <ChevronDown className="h-6 w-6 opacity-60 animate-bounce" />
          </div>
        )}
      </section>
    )
  }

  // ── Split presets ──
  if (preset === 'split-right' || preset === 'split-left') {
    const imageFirst = preset === 'split-left'
    return (
      <section data-nav-theme={navTheme} className={cn('overflow-hidden relative', bgStyles[bgStyle])} style={{ paddingTop: 'var(--section-lg)', paddingBottom: 'var(--section-lg)', ...bgInlineStyles[bgStyle] }}>
        {bgStyle === 'gradient' && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
        )}
        <div className="relative grid grid-cols-1 lg:grid-cols-[2fr_3fr] items-center gap-6 lg:gap-10" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          <div className={cn('flex flex-col justify-center', imageFirst ? 'lg:order-2' : 'lg:order-1', textAlignment === 'center' ? 'items-center text-center' : 'items-start text-left')}>
            {showHeading !== false && (
              <BlurRevealText
                as="h1"
                text={heading}
                startDelay={BLUR_DELAY_HEADING}
                disabled={isAdmin}
                editProps={hEdit}
                className={cn('text-display max-w-[20ch]', textPrimary, hCls)}
                style={{ ...headingStyle, position: 'relative' as const, zIndex: 2, ...hEdit?.style }}
              />
            )}
            {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
              <BlurRevealText
                as="p"
                text={subheading}
                startDelay={BLUR_DELAY_SUBHEADING}
                disabled={isAdmin}
                editProps={sEdit}
                className={cn('text-body-lg mt-5 max-w-[480px] leading-relaxed', textSecondary, sCls)}
                style={sEdit?.style}
              />
            )}
            {showSubheading !== false && subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={textAlignment === 'center'} />}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin}>
                <HeroButtons buttons={buttons} variantClasses={variantClasses} />
              </BlurRevealWrap>
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin} className="flex flex-col sm:flex-row gap-4 mt-8">
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                    {SecondaryIcon && <SecondaryIcon className="ml-2 h-4 w-4" />}
                  </a>
                )}
              </BlurRevealWrap>
            ) : null}
            {/* Email input */}
            {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
          </div>
          <div className={cn('flex items-center justify-center', imageFirst ? 'lg:order-1' : 'lg:order-2')}>
            <InlineImage
              src={image}
              propName="image"
              loading="eager"
              allowRemove
              className="w-full rounded-xl object-cover shadow-lg animate-hero-enter"
              style={{ aspectRatio: '3 / 4', animationDelay: '400ms', animationFillMode: 'both', minHeight: '400px' }}
              fallback={
                <div className="w-full rounded-xl bg-surface-alt border-2 border-dashed border-strong animate-hero-enter flex items-center justify-center" style={{ aspectRatio: '4 / 3', animationDelay: '400ms', animationFillMode: 'both' }}>
                  <div className="text-center text-faint">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <span className="text-body-sm font-medium">Click to add image</span>
                    <span className="text-caption block mt-1 opacity-60">4:3 aspect ratio</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>
    )
  }

  // ── Centered preset (default) ──
  const hasLegacyButtons = ctaPrimaryText || ctaSecondaryText

  return (
    <section data-nav-theme={navTheme} className={cn('relative overflow-hidden text-brand', bgStyles[bgStyle])} style={{ paddingTop: 'var(--section-xl)', paddingBottom: 'var(--section-xl)', ...bgInlineStyles[bgStyle] }}>
      {bgStyle === 'gradient' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      )}
      {bgStyle !== 'gradient' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-shimmer)' }} />
      )}
      <div className="relative flex flex-col items-center text-center" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
        {showHeading !== false && (
          <BlurRevealText
            as="h1"
            text={heading}
            startDelay={BLUR_DELAY_HEADING}
            disabled={isAdmin}
            editProps={hEdit}
            className={cn('text-display max-w-[24ch] mx-auto', hCls)}
            style={{ ...headingStyle, position: 'relative' as const, zIndex: 2, ...hEdit?.style }}
          />
        )}
        {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
          <BlurRevealText
            as="p"
            text={subheading}
            startDelay={BLUR_DELAY_SUBHEADING}
            disabled={isAdmin}
            editProps={sEdit}
            className={cn('text-body-lg mt-6 max-w-[540px] mx-auto leading-relaxed text-accent', sCls)}
            style={sEdit?.style}
          />
        )}
        {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered />}
            {/* Buttons */}
        {buttons && buttons.length > 0 ? (
          <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin}>
            <HeroButtons buttons={buttons} variantClasses={variantClasses} />
          </BlurRevealWrap>
        ) : hasLegacyButtons ? (
          <BlurRevealWrap startDelay={BLUR_DELAY_CTAS} disabled={isAdmin} className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            {ctaPrimaryText && ctaPrimaryLink && (
              <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 bg-brand text-white transition-all">
                <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <a href={ctaSecondaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 bg-highlight-soft text-brand hover:bg-amber-200 transition-all">
                <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
              </a>
            )}
          </BlurRevealWrap>
        ) : null}
        {/* Email input */}
        {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
      </div>
    </section>
  )
}

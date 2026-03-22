import { useContext } from 'react'
import { cn } from '../ui/utils'
import { ArrowRight, ChevronDown, Camera } from 'lucide-react'
import { useEditableText, useInlineEdit, useInlineEditBlock, InlineImagePickerContext } from '../context'
import { InlineImage } from './InlineImage'
import { resolveMediaUrl } from '../helpers'
import { resolveButtonIcon, buttonVariantClasses } from './buttonUtils'

export type HeroPreset = 'centered' | 'split-right' | 'split-left' | 'full-image' | 'minimal' | 'fullscreen'
export type HeroBgStyle = 'gradient' | 'forest' | 'stone'
export type HeroOverlay = 'light' | 'medium' | 'heavy'
export type HeroContentPosition = 'center' | 'center-left' | 'center-right' | 'top-left' | 'top-center' | 'bottom-left' | 'bottom-center'
export type HeroTextAlign = 'left' | 'center'

export type HeroTopOverlay = 'none' | 'dark' | 'light'

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

const overlayOpacity: Record<HeroOverlay, string> = {
  light: '0.35',
  medium: '0.55',
  heavy: '0.75',
}

/** Top gradient overlay — covers the nav zone only (top ~120px) */
function TopOverlay({ type }: { type: string }) {
  if (type === 'none') return null
  const gradient = type === 'dark'
    ? 'linear-gradient(180deg, rgb(var(--forest-950) / 0.6) 0%, rgb(var(--forest-950) / 0.3) 40%, transparent 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 40%, transparent 100%)'
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
      style={{ height: '120px', background: gradient }}
    />
  )
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
    <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10 animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
      {buttons.map((btn, i) => (
        <HeroButtonItem key={i} btn={btn} index={i} variantClasses={variantClasses} />
      ))}
    </div>
  )
}

function HeroSubheadingItem({ item, index, textClass, centered }: { item: { text: string }; index: number; textClass: string; centered?: boolean }) {
  const textEdit = useEditableText(`subheadings[${index}].text`, item.text)
  const { className: _, ...editHandlers } = textEdit || { className: '' }
  return (
    <p {...editHandlers} className={cn('text-body-lg mt-3 max-w-[540px] leading-relaxed animate-hero-enter', centered && 'mx-auto', textClass, textEdit?.className)} style={{ animationDelay: `${350 + index * 100}ms`, animationFillMode: 'both', ...textEdit?.style }}>
      {item.text}
    </p>
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
  overlayDarkness = 'medium',
  contentPosition = 'center',
  showScrollIndicator = true,
  textAlignment = 'left',
  showHeading,
  showSubheading,
  showInput,
  inputPlaceholder,
  inputButtonText,
  topOverlay = 'none',
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
  const hasDarkBg = (backgroundImage || backgroundVideo)
    ? overlayDarkness !== 'light' // image/video with medium+ overlay = dark
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

  // ── Fullscreen preset ──
  if (preset === 'fullscreen') {
    const positionClasses: Record<HeroContentPosition, string> = {
      'center': 'items-center justify-center text-center',
      'center-left': 'items-start justify-center text-left',
      'center-right': 'items-end justify-center text-right',
      'top-left': 'items-start justify-start text-left pt-24 md:pt-32',
      'top-center': 'items-center justify-start text-center pt-24 md:pt-32',
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
        {/* Overlay */}
        {(backgroundImage || backgroundVideo) && <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgb(var(--forest-950) / ${overlayOpacity[overlayDarkness]}), rgb(var(--forest-950) / 0.15), rgb(var(--forest-950) / ${(parseFloat(overlayOpacity[overlayDarkness]) * 0.6).toFixed(2)}))` }} />}
        {/* Top gradient overlay for nav contrast */}
        <TopOverlay type={topOverlay} />
        {/* Content — aligned to page container, offset for nav height */}
        <div
          className={cn('relative flex flex-col h-full mx-auto', positionClasses[contentPosition || 'center'])}
          style={{ maxWidth: 'var(--width-content, 1440px)', paddingInline: 'var(--container-px, 1rem)', paddingTop: '72px' }}
        >
          <div className={cn('max-w-3xl', contentPosition === 'center' ? 'mx-auto text-center' : contentPosition?.includes('right') ? 'text-right' : 'text-left')}>
            {showHeading !== false && (
              <h1 {...hEdit} className={cn('text-display max-w-[20ch] animate-hero-enter', textPrimary, hCls)} style={{ ...headingStyle, animationDelay: '100ms', animationFillMode: 'both', ...hEdit?.style }}>
                {heading}
              </h1>
            )}
            {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg mt-6 max-w-[540px] leading-relaxed animate-hero-enter', textSecondary, contentPosition === 'center' && 'mx-auto', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {showSubheading !== false && subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={contentPosition === 'center'} />}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <HeroButtons buttons={buttons} variantClasses={variantClasses} />
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <div className={cn('flex flex-col sm:flex-row gap-4 mt-8 md:mt-10 animate-hero-enter', contentPosition === 'center' && 'justify-center')} style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                    {SecondaryIcon && <SecondaryIcon className="ml-2 h-4 w-4" />}
                  </a>
                )}
              </div>
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
            <h1 {...hEdit} className={cn('text-display max-w-[20ch] animate-hero-enter', textPrimary, hCls)} style={{ ...headingStyle, animationDelay: '100ms', animationFillMode: 'both', ...hEdit?.style }}>
              {heading}
            </h1>
          )}
          {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
            <p {...sEdit} className={cn('text-body-lg mt-6 max-w-[540px] leading-relaxed animate-hero-enter', textSecondary, sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {subheading}
            </p>
          )}
          {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} />}
            {/* Buttons */}
          {buttons && buttons.length > 0 ? (
            <HeroButtons buttons={buttons} variantClasses={variantClasses} />
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
      'center':        { placeContent: 'center', textAlign: 'center' as const },
      'center-left':   { alignContent: 'center', justifyContent: 'start', textAlign: 'left' as const },
      'center-right':  { alignContent: 'center', justifyContent: 'end', textAlign: 'right' as const },
      'bottom-left':   { alignContent: 'end', justifyContent: 'start', textAlign: 'left' as const },
      'bottom-center': { alignContent: 'end', justifyContent: 'center', textAlign: 'center' as const },
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
        {/* Overlay */}
        {(backgroundImage || backgroundVideo) && <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgb(var(--forest-950) / ${overlayOpacity[overlayDarkness]}), rgb(var(--forest-950) / 0.2), rgb(var(--forest-950) / ${(parseFloat(overlayOpacity[overlayDarkness]) * 0.5).toFixed(2)}))` }} />}
        {/* Top gradient overlay for nav contrast */}
        <TopOverlay type={topOverlay} />
        {/* Content — CSS grid on section handles all positioning */}
        <div
          className="relative w-full mx-auto"
          style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}
        >
          <div className={cn('max-w-3xl', contentPosition === 'center' || contentPosition === 'bottom-center' ? 'mx-auto text-center' : contentPosition?.includes('right') ? 'text-right' : 'text-left')}>
            {showHeading !== false && (
              <h1 {...hEdit} className={cn('text-display max-w-[24ch] animate-hero-enter', textPrimary, contentPosition === 'center' && 'mx-auto', hCls)} style={{ ...headingStyle, animationDelay: '100ms', animationFillMode: 'both', ...hEdit?.style }}>
                {heading}
              </h1>
            )}
            {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg mt-6 max-w-[540px] leading-relaxed animate-hero-enter', textSecondary, contentPosition === 'center' && 'mx-auto', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {showSubheading !== false && subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={contentPosition === 'center' || contentPosition === 'bottom-center'} />}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <HeroButtons buttons={buttons} variantClasses={variantClasses} />
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <div className={cn('flex flex-col sm:flex-row gap-4 mt-10 animate-hero-enter', contentPosition === 'center' && 'justify-center')} style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                  </a>
                )}
              </div>
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
              <h1 {...hEdit} className={cn('text-display max-w-[20ch] animate-hero-enter', textPrimary, hCls)} style={{ ...headingStyle, animationDelay: '100ms', animationFillMode: 'both', ...hEdit?.style }}>
                {heading}
              </h1>
            )}
            {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg mt-5 max-w-[480px] leading-relaxed animate-hero-enter', textSecondary, sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {showSubheading !== false && subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered={textAlignment === 'center'} />}
            {/* Buttons */}
            {buttons && buttons.length > 0 ? (
              <HeroButtons buttons={buttons} variantClasses={variantClasses} />
            ) : ctaPrimaryText && ctaPrimaryLink ? (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all', btnPrimary)}>
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 transition-all', btnSecondary)}>
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                    {SecondaryIcon && <SecondaryIcon className="ml-2 h-4 w-4" />}
                  </a>
                )}
              </div>
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
          <h1 {...hEdit} className={cn('text-display max-w-[24ch] mx-auto animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            {heading}
          </h1>
        )}
        {showSubheading !== false && (!subheadings || subheadings.length === 0) && (subheading || subheadingEdit) && (
          <p {...sEdit} className={cn('text-body-lg mt-6 max-w-[540px] mx-auto leading-relaxed text-accent animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            {subheading}
          </p>
        )}
        {subheadings && subheadings.length > 0 && <HeroSubheadings items={subheadings} textClass={textSecondary} centered />}
            {/* Buttons */}
        {buttons && buttons.length > 0 ? (
          <HeroButtons buttons={buttons} variantClasses={variantClasses} />
        ) : hasLegacyButtons ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            {ctaPrimaryText && ctaPrimaryLink && (
              <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 bg-brand text-white shadow-lg hover:shadow-xl hover:-translate-y-px transition-all">
                <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                {PrimaryIcon && <PrimaryIcon className="ml-2 h-4 w-4" />}
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <a href={ctaSecondaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium h-12 px-7 bg-highlight-soft text-brand hover:bg-amber-200 transition-all">
                <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
              </a>
            )}
          </div>
        ) : null}
        {/* Email input */}
        {showInput && <HeroInput placeholder={inputPlaceholder || 'Din e-postadress'} buttonText={inputButtonText || 'Prenumerera'} />}
      </div>
    </section>
  )
}

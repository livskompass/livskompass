import { useContext } from 'react'
import { cn } from '../ui/utils'
import { ArrowRight, Camera, ChevronDown } from 'lucide-react'
import { useEditableText, useInlineEdit, useInlineEditBlock, InlineImagePickerContext } from '../context'
import { InlineImage } from './InlineImage'
import { resolveMediaUrl } from '../helpers'

export type HeroPreset = 'centered' | 'split-right' | 'split-left' | 'full-image' | 'minimal' | 'fullscreen'
export type HeroBgStyle = 'gradient' | 'forest' | 'stone'
export type HeroOverlay = 'light' | 'medium' | 'heavy'
export type HeroContentPosition = 'center' | 'bottom-left' | 'bottom-center'

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
}

const bgStyles: Record<HeroBgStyle, string> = {
  gradient: 'bg-[image:var(--gradient-hero)]',
  forest: 'bg-forest-800',
  stone: 'bg-stone-900',
}

const overlayOpacity: Record<HeroOverlay, string> = {
  light: '0.35',
  medium: '0.55',
  heavy: '0.75',
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
      <Camera className="h-4 w-4 text-stone-700" />
    </button>
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
  id,
}: HeroProps & { puck?: { isEditing: boolean }; id?: string }) {
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

  // ── Fullscreen preset ──
  if (preset === 'fullscreen') {
    const positionClasses: Record<HeroContentPosition, string> = {
      center: 'items-center justify-center text-center',
      'bottom-left': 'items-start justify-end text-left pb-16 md:pb-24',
      'bottom-center': 'items-center justify-end text-center pb-16 md:pb-24',
    }

    return (
      <section className={cn('relative overflow-hidden group/hero-bg', bgStyles[bgStyle])} style={{ height: '100svh', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
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
        <BgImageButton propName="backgroundImage" src={backgroundImage} />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgb(var(--forest-950) / ${overlayOpacity[overlayDarkness]}), rgb(var(--forest-950) / 0.15), rgb(var(--forest-950) / ${(parseFloat(overlayOpacity[overlayDarkness]) * 0.6).toFixed(2)}))` }} />
        {/* Content */}
        <div className={cn('relative flex flex-col h-full px-6 md:px-12 lg:px-20', positionClasses[contentPosition || 'center'])}>
          <div className={cn('max-w-3xl', contentPosition === 'center' && 'mx-auto')}>
            <h1 {...hEdit} className={cn('text-display text-white max-w-[20ch] animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              {heading}
            </h1>
            {(subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg text-white/80 mt-6 max-w-[540px] leading-relaxed animate-hero-enter', contentPosition === 'center' && 'mx-auto', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {ctaPrimaryText && ctaPrimaryLink && (
              <div className={cn('flex flex-col sm:flex-row gap-4 mt-8 md:mt-10 animate-hero-enter', contentPosition === 'center' && 'justify-center')} style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 md:h-14 px-7 md:px-9 bg-white text-forest-700 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all text-base md:text-lg">
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </a>
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a href={ctaSecondaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 md:h-14 px-7 md:px-9 border-[1.5px] border-white/40 text-white hover:bg-white/10 transition-all text-base md:text-lg">
                    <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Scroll indicator */}
        {showScrollIndicator !== false && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-hero-enter" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <ChevronDown className="h-6 w-6 text-white/70 animate-bounce" />
          </div>
        )}
      </section>
    )
  }

  // ── Minimal preset ──
  if (preset === 'minimal') {
    return (
      <section style={{ paddingTop: 'var(--section-lg)', paddingBottom: 'var(--section-md)' }}>
        <div style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          <h1 {...hEdit} className={cn('text-display text-forest-950 max-w-[20ch] animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            {heading}
          </h1>
          {(subheading || subheadingEdit) && (
            <p {...sEdit} className={cn('text-body-lg text-stone-600 mt-6 max-w-[540px] leading-relaxed animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {subheading}
            </p>
          )}
        </div>
      </section>
    )
  }

  // ── Full-image preset ──
  if (preset === 'full-image') {
    return (
      <section className="relative overflow-hidden min-h-[70vh] flex items-center group/hero-bg" style={{ paddingTop: 'var(--section-xl)', paddingBottom: 'var(--section-xl)' }}>
        {backgroundImage && (
          <div className="absolute inset-0" style={{ backgroundImage: `url(${resolveMediaUrl(backgroundImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <BgImageButton propName="backgroundImage" src={backgroundImage} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgb(var(--forest-950) / ${overlayOpacity[overlayDarkness]}), rgb(var(--forest-950) / 0.2), rgb(var(--forest-950) / ${(parseFloat(overlayOpacity[overlayDarkness]) * 0.5).toFixed(2)}))` }} />
        <div className="relative flex flex-col items-center text-center" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          <h1 {...hEdit} className={cn('text-display text-white max-w-[24ch] mx-auto animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            {heading}
          </h1>
          {(subheading || subheadingEdit) && (
            <p {...sEdit} className={cn('text-body-lg text-white/80 mt-6 max-w-[540px] mx-auto leading-relaxed animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {subheading}
            </p>
          )}
          {ctaPrimaryText && ctaPrimaryLink && (
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
              <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 bg-white text-forest-700 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all">
                <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ── Split presets ──
  if (preset === 'split-right' || preset === 'split-left') {
    const imageFirst = preset === 'split-left'
    return (
      <section className="overflow-hidden" style={{ backgroundColor: 'var(--surface-primary)', paddingTop: 'var(--section-lg)', paddingBottom: 'var(--section-lg)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-10 lg:gap-16" style={{ maxWidth: 'var(--width-wide)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
          <div className={cn('lg:col-span-3 flex flex-col', imageFirst ? 'lg:order-2' : 'lg:order-1')}>
            <h1 {...hEdit} className={cn('text-display text-forest-950 max-w-[20ch] animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              {heading}
            </h1>
            {(subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg text-stone-600 mt-5 max-w-[480px] leading-relaxed animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {ctaPrimaryText && ctaPrimaryLink && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 bg-forest-600 text-white shadow-[--shadow-btn-forest] hover:bg-forest-500 hover:-translate-y-px transition-all">
                  <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}
          </div>
          <div className={cn('lg:col-span-2', imageFirst ? 'lg:order-1' : 'lg:order-2')}>
            <InlineImage
              src={image}
              propName="image"
              loading="eager"
              className="w-full h-auto rounded-xl object-cover shadow-lg animate-hero-enter"
              style={{ aspectRatio: '4 / 3', animationDelay: '400ms', animationFillMode: 'both' }}
              fallback={
                <div className="w-full rounded-xl bg-stone-200 animate-hero-enter flex items-center justify-center" style={{ aspectRatio: '4 / 3', animationDelay: '400ms', animationFillMode: 'both' }}>
                  <div className="text-center text-stone-400">
                    <svg className="h-10 w-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/><path d="M21 15l-5-5L5 21" strokeWidth="1.5"/></svg>
                    <span className="text-xs">4:3 image</span>
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
  const hasButtons = ctaPrimaryText || ctaSecondaryText

  return (
    <section className={cn('relative overflow-hidden text-white', bgStyles[bgStyle])} style={{ paddingTop: 'var(--section-xl)', paddingBottom: 'var(--section-xl)' }}>
      {bgStyle === 'gradient' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      )}
      {bgStyle !== 'gradient' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-shimmer)' }} />
      )}
      <div className="relative flex flex-col items-center text-center" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
        <h1 {...hEdit} className={cn('text-display max-w-[24ch] mx-auto animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {heading}
        </h1>
        {(subheading || subheadingEdit) && (
          <p {...sEdit} className={cn('text-body-lg mt-6 max-w-[540px] mx-auto leading-relaxed text-white/75 animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            {subheading}
          </p>
        )}
        {hasButtons && (
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            {ctaPrimaryText && ctaPrimaryLink && (
              <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 bg-white text-forest-700 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all">
                <span {...ctaPEdit} className={ctaPrimaryTextEdit?.className}>{ctaPrimaryText}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <a href={ctaSecondaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 border-[1.5px] border-white/40 text-white hover:bg-white/10 transition-all">
                <span {...ctaSEdit} className={ctaSecondaryTextEdit?.className}>{ctaSecondaryText}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

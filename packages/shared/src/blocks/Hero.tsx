import { cn } from '../ui/utils'
import { ArrowRight } from 'lucide-react'
import { useEditableText, useInlineEdit } from '../context'

export type HeroPreset = 'centered' | 'split-right' | 'split-left' | 'full-image' | 'minimal'
export type HeroBgStyle = 'gradient' | 'forest' | 'stone'
export type HeroOverlay = 'light' | 'medium' | 'heavy'

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
  overlayDarkness: HeroOverlay
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

export function Hero({
  preset = 'centered',
  heading = 'Rubrik här',
  subheading = '',
  bgStyle = 'gradient',
  ctaPrimaryText = '',
  ctaPrimaryLink = '',
  ctaSecondaryText = '',
  ctaSecondaryLink = '',
  image = '',
  backgroundImage = '',
  overlayDarkness = 'medium',
  id,
}: HeroProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx

  const hEdit = editHandlers(headingEdit)
  const sEdit = editHandlers(subheadingEdit)
  const hCls = headingEdit?.className
  const sCls = subheadingEdit?.className

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
      <section className="relative overflow-hidden min-h-[70vh] flex items-center" style={{ paddingTop: 'var(--section-xl)', paddingBottom: 'var(--section-xl)' }}>
        {backgroundImage && (
          <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(var(--color-forest-950-rgb, 10,26,16), ${overlayOpacity[overlayDarkness]}), rgba(var(--color-forest-950-rgb, 10,26,16), 0.2), rgba(var(--color-forest-950-rgb, 10,26,16), ${(parseFloat(overlayOpacity[overlayDarkness]) * 0.5).toFixed(2)}))` }} />
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
                {ctaPrimaryText}
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
            <h1 {...hEdit} className={cn('text-h1 text-forest-950 max-w-[20ch] animate-hero-enter', hCls)} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              {heading}
            </h1>
            {(subheading || subheadingEdit) && (
              <p {...sEdit} className={cn('text-body-lg text-stone-600 mt-5 max-w-[480px] leading-relaxed animate-hero-enter', sCls)} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                {subheading}
              </p>
            )}
            {ctaPrimaryText && ctaPrimaryLink && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-hero-enter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <a href={ctaPrimaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 bg-forest-600 text-white shadow-[0_1px_3px_rgba(50,102,71,0.2)] hover:bg-forest-500 hover:-translate-y-px transition-all">
                  {ctaPrimaryText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}
          </div>
          <div className={cn('lg:col-span-2', imageFirst ? 'lg:order-1' : 'lg:order-2')}>
            {image ? (
              <img src={image} alt="" loading="lazy" className="w-full h-auto rounded-xl object-cover shadow-lg animate-hero-enter" style={{ aspectRatio: '4 / 3', animationDelay: '400ms', animationFillMode: 'both' }} />
            ) : (
              <div className="w-full rounded-xl bg-stone-200 animate-hero-enter" style={{ aspectRatio: '4 / 3', animationDelay: '400ms', animationFillMode: 'both' }} />
            )}
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
                {ctaPrimaryText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryLink && (
              <a href={ctaSecondaryLink} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium h-12 px-7 border-[1.5px] border-white/40 text-white hover:bg-white/10 transition-all">
                {ctaSecondaryText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

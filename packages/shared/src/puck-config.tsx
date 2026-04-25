import type { Config, Data } from '@puckeditor/core'
import React from 'react'

// Block render components
import { Hero } from './blocks/Hero'
import { RichText } from './blocks/RichText'
import { ImageBlock } from './blocks/ImageBlock'
import { Accordion } from './blocks/Accordion'
import { Columns, useInColumn } from './blocks/Columns'
import { SeparatorBlock } from './blocks/SeparatorBlock'
import { Spacer } from './blocks/Spacer'
import { CTABanner } from './blocks/CTABanner'
import { CardGrid } from './blocks/CardGrid'
import { Testimonial } from './blocks/Testimonial'
import { ButtonGroup } from './blocks/ButtonGroup'
import { PricingTable } from './blocks/PricingTable'
import { ImageGallery } from './blocks/ImageGallery'
import { VideoEmbed } from './blocks/VideoEmbed'
import { AudioEmbed } from './blocks/AudioEmbed'
import { FileEmbed } from './blocks/FileEmbed'
import { EmbedBlock } from './blocks/EmbedBlock'
import { PostGrid } from './blocks/PostGrid'
import { PageCards } from './blocks/PageCards'
import { NavigationMenu } from './blocks/NavigationMenu'
import { CourseList } from './blocks/CourseList'
import { ProductList } from './blocks/ProductList'
import { ContactForm } from './blocks/ContactForm'
import { BookingForm } from './blocks/BookingForm'
import { CourseInfo } from './blocks/CourseInfo'
import { BookingCTA } from './blocks/BookingCTA'
import { PostHeader } from './blocks/PostHeader'
import { CourseHeader } from './blocks/CourseHeader'
import { PageHeader } from './blocks/PageHeader'
import { PersonCard } from './blocks/PersonCard'
import { FeatureGrid } from './blocks/FeatureGrid'
import { StatsCounter } from './blocks/StatsCounter'
import { sectionBgField, sectionBgClass, sectionBgStyle, sectionTextClass } from './blocks/sectionBackground'

/** Wrapper that applies section background color/gradient around a block */
function SectionBgWrap({ bg, children }: { bg?: string; children: React.ReactNode }) {
  if (!bg || bg === 'transparent') return <>{children}</>
  const cls = sectionBgClass(bg)
  const style = sectionBgStyle(bg)
  const textCls = sectionTextClass(bg)
  return (
    <div className={[cls, textCls].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}

/** Centered/padded container for RichText — dropped when the block sits inside
 *  a Columns block so the column's own padding handles layout. */
function RichTextSectionWrap({ children }: { children: React.ReactNode }) {
  const inColumn = useInColumn()
  if (inColumn) return <>{children}</>
  return (
    <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
      {children}
    </div>
  )
}

// Empty Puck data structure for initializing new pages
export const emptyPuckData: Data = {
  content: [],
  root: { props: {} },
  zones: {},
}

// ── Site settings types + hook for Puck preview chrome ──
import { defaultHeader, defaultFooter, type SiteHeaderConfig, type SiteFooterConfig } from './defaults'

let _cachedHeader: SiteHeaderConfig | null = null
let _cachedFooter: SiteFooterConfig | null = null
let _fetchPromise: Promise<void> | null = null
let _cacheTime = 0

function fetchSiteSettings() {
  if (_fetchPromise && Date.now() - _cacheTime < 60000) return _fetchPromise
  const apiBase = (typeof window !== 'undefined' && (window as any).__PUCK_API_BASE__) || '/api'
  _fetchPromise = fetch(`${apiBase}/site-settings`)
    .then((r) => r.json())
    .then((data: any) => {
      if (data.header) _cachedHeader = data.header
      if (data.footer) _cachedFooter = data.footer
      _cacheTime = Date.now()
    })
    .catch(() => { /* use defaults */ })
  return _fetchPromise
}

function useSiteSettings() {
  const [header, setHeader] = React.useState<SiteHeaderConfig>(_cachedHeader || defaultHeader)
  const [footer, setFooter] = React.useState<SiteFooterConfig>(_cachedFooter || defaultFooter)

  React.useEffect(() => {
    fetchSiteSettings().then(() => {
      setHeader(_cachedHeader || defaultHeader)
      setFooter(_cachedFooter || defaultFooter)
    })
  }, [])

  return { header, footer }
}

function SiteHeader() {
  const { header } = useSiteSettings()
  return (
    <header
      className={`sticky top-0 z-50 ${header.navColor || 'text-forest-800'}`}
      style={{
        background: 'transparent',
      }}
    >
      <nav style={{ maxWidth: 'var(--width-content, 1280px)', marginInline: 'auto', paddingInline: 'var(--container-px, 1rem)' }}>
        <div className="flex justify-between h-16 lg:h-[72px]">
          <div className="flex items-center">
            <a href="/">
              <span className="font-display" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em', color: 'inherit' }}>{header.logoText}</span>
            </a>
          </div>
          <div className="hidden lg:flex items-center space-x-7">
            {header.navItems.map((item) => (
              item.children && item.children.length > 0 ? (
                <div key={item.label} className="relative group">
                  <span className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 whitespace-nowrap cursor-default transition-opacity" style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'inherit' }}>
                    {item.label}
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="rounded-lg shadow-lg py-2 min-w-[180px]" style={{ background: 'var(--surface-elevated, #fff)', border: '1px solid var(--surface-glass-border)' }}>
                      {item.children.map((child) => (
                        <a key={child.label} href={child.href} className="block px-4 py-2 text-sm text-forest-700 hover:text-forest-900 hover:bg-forest-50 transition-colors">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a key={item.label} href={item.href} className="opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'inherit' }}>
                  {item.label}
                </a>
              )
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

function SiteFooter() {
  const { footer } = useSiteSettings()
  return (
    <footer className="bg-stone-950 text-white">
      <div style={{ maxWidth: 'var(--width-content, 1280px)', marginInline: 'auto', paddingInline: 'var(--container-px, 1rem)', paddingTop: 'var(--section-md, 4rem)', paddingBottom: 'var(--section-sm, 3rem)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="font-display text-xl text-white block mb-4">{footer.companyName}</span>
            <p className="text-stone-400 leading-relaxed" style={{ fontSize: '0.9375rem' }}>{footer.tagline}</p>
          </div>
          <div>
            <h3 className="text-h4 mb-4">{footer.contactHeading || 'Kontakt'}</h3>
            <p className="text-stone-400 leading-relaxed" style={{ fontSize: '0.9375rem' }}>{footer.contact.email}<br />{footer.contact.phone}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-h4 mb-4">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}><a href={link.href} className="text-stone-400 hover:text-white transition-colors duration-200" style={{ fontSize: '0.9375rem' }}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-stone-500 text-caption">
          <p>{footer.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  )
}

// ── Puck config assembler ──

export const puckConfig: Config = {
  root: {
    fields: {},
    render: (props: any) => {
      const { children } = props
      const isEditor = typeof window !== 'undefined' && window.frameElement !== null
      return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", backgroundColor: 'var(--surface-primary, #F8F6F2)' }}>
          {isEditor && <SiteHeader />}
          <main className="flex-1">{children}</main>
          {isEditor && <SiteFooter />}
        </div>
      )
    },
  },

  categories: {
    layout: { title: 'Layout', components: ['Columns', 'SeparatorBlock', 'Spacer'] },
    content: { title: 'Content', components: ['Hero', 'RichText', 'ImageBlock', 'Accordion', 'PageHeader', 'PersonCard', 'FeatureGrid', 'StatsCounter'] },
    marketing: { title: 'Marketing', components: ['CTABanner', 'CardGrid', 'Testimonial', 'ButtonGroup', 'PricingTable'] },
    media: { title: 'Media', components: ['ImageGallery', 'VideoEmbed', 'AudioEmbed', 'FileEmbed', 'EmbedBlock'] },
    dynamic: { title: 'Dynamic', components: ['CourseList', 'ProductList', 'PostGrid', 'PageCards', 'NavigationMenu'] },
    interactive: { title: 'Interactive', components: ['ContactForm', 'BookingForm'] },
    data: { title: 'Data-bound', components: ['CourseHeader', 'CourseInfo', 'BookingCTA', 'PostHeader'] },
  },

  components: {
    // ── Layout ──
    Columns: {
      label: 'Columns',
      defaultProps: { sectionBg: 'transparent', layout: '50-50', gap: 'medium', verticalAlignment: 'top', stackOnMobile: true },
      fields: {
        sectionBg: sectionBgField,
        layout: { type: 'select', label: 'Layout', options: [{ label: '50/50', value: '50-50' }, { label: '33/33/33', value: '33-33-33' }, { label: '66/33', value: '66-33' }, { label: '33/66', value: '33-66' }] },
        gap: { type: 'select', label: 'Gap', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        verticalAlignment: { type: 'select', label: 'Vertical alignment', options: [{ label: 'Top', value: 'top' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'bottom' }] },
        stackOnMobile: { type: 'radio', label: 'Stack on mobile', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><Columns {...props} /></SectionBgWrap>,
    },
    SeparatorBlock: {
      label: 'Separator',
      defaultProps: { sectionBg: 'transparent', variant: 'line', spacing: 'medium', lineColor: 'light', maxWidth: 'full', gradientType: 'white-light' },
      fields: {
        sectionBg: sectionBgField,
        variant: { type: 'select', options: [{ label: 'Line', value: 'line' }, { label: 'Dots', value: 'dots' }, { label: 'Space only', value: 'space-only' }, { label: 'Gradient', value: 'gradient' }] },
        spacing: { type: 'select', label: 'Height', options: [{ label: 'XS (16px)', value: 'xs' }, { label: 'S (32px)', value: 'small' }, { label: 'M (64px)', value: 'medium' }, { label: 'L (96px)', value: 'large' }, { label: 'XL (128px)', value: 'xl' }, { label: '2XL (192px)', value: '2xl' }, { label: '3XL (256px)', value: '3xl' }] },
        lineColor: { type: 'select', options: [{ label: 'Light', value: 'light' }, { label: 'Medium', value: 'medium' }, { label: 'Dark', value: 'dark' }] },
        maxWidth: { type: 'select', options: [{ label: 'Narrow', value: 'narrow' }, { label: 'Medium', value: 'medium' }, { label: 'Full', value: 'full' }] },
        gradientType: { type: 'select', label: 'Gradient style', options: [
          { label: '↓ White → Light', value: 'white-light' }, { label: '↑ Light → White', value: 'light-white' },
          { label: '↓ Dark green → Transparent', value: 'brand-transparent' }, { label: '↑ Transparent → Dark green', value: 'transparent-brand' },
          { label: '↓ Dark green → White', value: 'brand-white' }, { label: '↑ White → Dark green', value: 'white-brand' },
          { label: '↓ Dark green → Mist', value: 'brand-mist' }, { label: '↑ Mist → Dark green', value: 'mist-brand' },
          { label: '↓ Dark green → Light green', value: 'brand-accent' },
          { label: '↓ Mist → Transparent', value: 'mist-transparent' }, { label: '↑ Transparent → Mist', value: 'transparent-mist' },
          { label: '↓ Mist → White', value: 'mist-white' }, { label: '↑ White → Mist', value: 'white-mist' },
          { label: '↓ Light green → Transparent', value: 'accent-transparent' }, { label: '↓ Light green → White', value: 'accent-white' },
          { label: '↓ Yellow → Transparent', value: 'amber-transparent' }, { label: '↓ Yellow → White', value: 'amber-white' },
          { label: '↓ Darkest green → Transparent', value: 'darkest-transparent' }, { label: '↑ Transparent → Darkest green', value: 'transparent-darkest' },
          { label: '↓ Darkest green → White', value: 'darkest-white' }, { label: '↓ Darkest green → Mist', value: 'darkest-mist' },
          { label: '↓ Darkest green → Yellow', value: 'darkest-amber' },
          { label: '↓ Dark green → Yellow', value: 'brand-amber' }, { label: '↓ Yellow → Mist', value: 'amber-mist' },
          { label: '↓ Mist → Light green', value: 'mist-accent' },
        ] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><SeparatorBlock {...props} /></SectionBgWrap>,
    },
    Spacer: {
      label: 'Spacer',
      defaultProps: { sectionBg: 'transparent', size: 'medium' },
      fields: { sectionBg: sectionBgField, size: { type: 'select', options: [{ label: 'XS', value: 'xs' }, { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'XL', value: 'xl' }] } },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><Spacer {...props} /></SectionBgWrap>,
    },

    // ── Content ──
    Hero: {
      label: 'Hero',
      defaultProps: {
        sectionBg: 'transparent',
        preset: 'centered',
        heading: 'Rubrik här',
        subheading: '',
        bgStyle: 'gradient',
        ctaPrimaryText: '',
        ctaPrimaryLink: '',
        ctaSecondaryText: '',
        ctaSecondaryLink: '',
        image: '',
        backgroundImage: '',
        backgroundVideo: '',
        overlayDarkness: 'dark-2',
        contentPosition: 'center',
        showScrollIndicator: true,
        textAlignment: 'left',
        showHeading: true,
        showSubheading: true,
        showInput: false,
        inputPlaceholder: 'Din e-postadress',
        inputButtonText: 'Prenumerera',
        topOverlay: 'none',
        subheadings: [],
        buttons: [],
      },
      fields: {
        sectionBg: sectionBgField,
        preset: {
          type: 'select',
          label: 'Preset',
          options: [
            { label: 'Centered (text over background)', value: 'centered' },
            { label: 'Split — Image Right', value: 'split-right' },
            { label: 'Split — Image Left', value: 'split-left' },
            { label: 'Full Background Image', value: 'full-image' },
            { label: 'Fullscreen (100vh)', value: 'fullscreen' },
            { label: 'Minimal (text only)', value: 'minimal' },
          ],
        },
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        bgStyle: {
          type: 'select',
          label: 'Background',
          options: [
            { label: 'Gradient', value: 'gradient' },
            { label: 'Forest green', value: 'forest' },
            { label: 'Dark stone', value: 'stone' },
          ],
        },
        image: { type: 'text', label: 'Image URL', metadata: { isImage: true } },
        backgroundImage: { type: 'text', label: 'Background image URL', metadata: { isImage: true } },
        backgroundVideo: { type: 'text', label: 'Background video URL', metadata: { isVideo: true } },
        overlayDarkness: {
          type: 'select',
          label: 'Overlay tint',
          options: [
            { label: 'Darken — heavy', value: 'dark-3' },
            { label: 'Darken — medium', value: 'dark-2' },
            { label: 'Darken — light', value: 'dark-1' },
            { label: 'Lighten — light', value: 'light-1' },
            { label: 'Lighten — medium', value: 'light-2' },
            { label: 'Lighten — heavy', value: 'light-3' },
          ],
        },
        contentPosition: {
          type: 'select',
          label: 'Content position',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Center Left', value: 'center-left' },
            { label: 'Center Right', value: 'center-right' },
            { label: 'Top Left', value: 'top-left' },
            { label: 'Top Center', value: 'top-center' },
            { label: 'Lower Left', value: 'lower-left' },
            { label: 'Bottom Left', value: 'bottom-left' },
            { label: 'Bottom Center', value: 'bottom-center' },
          ],
        },
        showScrollIndicator: { type: 'radio', label: 'Show scroll indicator', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
        textAlignment: { type: 'radio', label: 'Text alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        showHeading: { type: 'radio', label: 'Show heading', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
        showSubheading: { type: 'radio', label: 'Show subheading', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
        showInput: { type: 'radio', label: 'Show email input', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
        inputPlaceholder: { type: 'text', label: 'Input placeholder' },
        inputButtonText: { type: 'text', label: 'Input button text' },
        subheadings: { type: 'array', label: 'Sub-headings', arrayFields: { text: { type: 'textarea', label: 'Text' } } },
        buttons: { type: 'array', label: 'Buttons', arrayFields: { text: { type: 'text', label: 'Text' }, link: { type: 'text', label: 'Page link', metadata: { isPagePicker: true } }, externalUrl: { type: 'text', label: 'External URL (overrides page link)' }, variant: { type: 'select', label: 'Style', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }, { label: 'Primary Inverted', value: 'primary-inv' }, { label: 'Outline Inverted', value: 'outline-inv' }] }, showIcon: { type: 'radio', label: 'Arrow icon', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] } } },
      },
      resolveData: ({ props }: any) => {
        const migrated: any = { ...props }
        // Migrate legacy buttons into buttons array
        if ((!migrated.buttons || migrated.buttons.length === 0) && (migrated.ctaPrimaryText || migrated.ctaSecondaryText)) {
          const btns: any[] = []
          if (migrated.ctaPrimaryText && migrated.ctaPrimaryLink) btns.push({ text: migrated.ctaPrimaryText, link: migrated.ctaPrimaryLink, variant: 'primary', showIcon: true })
          if (migrated.ctaSecondaryText && migrated.ctaSecondaryLink) btns.push({ text: migrated.ctaSecondaryText, link: migrated.ctaSecondaryLink, variant: 'secondary', showIcon: false })
          migrated.buttons = btns
        }
        // Migrate legacy subheading into subheadings array
        if ((!migrated.subheadings || migrated.subheadings.length === 0) && migrated.subheading) {
          migrated.subheadings = [{ text: migrated.subheading }]
        }
        return { props: migrated }
      },
      resolveFields: (data: any) => {
        const p = data.props?.preset || 'centered'
        const presetOptions = [
          { label: 'Centered (text over background)', value: 'centered' },
          { label: 'Split — Image Right', value: 'split-right' },
          { label: 'Split — Image Left', value: 'split-left' },
          { label: 'Full Background Image', value: 'full-image' },
          { label: 'Fullscreen (100vh)', value: 'fullscreen' },
          { label: 'Minimal (text only)', value: 'minimal' },
        ]
        const base = {
          preset: { type: 'select' as const, label: 'Preset', options: presetOptions },
        }
        const modularFields = {
          showHeading: { type: 'radio' as const, label: 'Show heading', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
          showSubheading: { type: 'radio' as const, label: 'Show subheading', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
          subheadings: { type: 'array' as const, label: 'Sub-headings', arrayFields: { text: { type: 'textarea' as const, label: 'Text' } } },
          buttons: { type: 'array' as const, label: 'Buttons', arrayFields: { text: { type: 'text' as const, label: 'Text' }, link: { type: 'text' as const, label: 'Page link', metadata: { isPagePicker: true } }, externalUrl: { type: 'text' as const, label: 'External URL (overrides page link)' }, variant: { type: 'select' as const, label: 'Style', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }, { label: 'Primary Inverted', value: 'primary-inv' }, { label: 'Outline Inverted', value: 'outline-inv' }] }, showIcon: { type: 'radio' as const, label: 'Arrow icon', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] } } },
          showInput: { type: 'radio' as const, label: 'Show email input', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
          inputPlaceholder: { type: 'text' as const, label: 'Input placeholder' },
          inputButtonText: { type: 'text' as const, label: 'Input button text' },
        }
        if (p === 'centered') {
          return {
            ...base,
            bgStyle: {
              type: 'select' as const,
              label: 'Background',
              options: [
                { label: 'Gradient', value: 'gradient' },
                { label: 'Forest green', value: 'forest' },
                { label: 'Dark stone', value: 'stone' },
              ],
            },
            ...modularFields,
          }
        }
        if (p === 'split-right' || p === 'split-left') {
          return {
            ...base,
            image: { type: 'text' as const, label: 'Image URL', metadata: { isImage: true } },
            ...modularFields,
          }
        }
        if (p === 'full-image') {
          return {
            ...base,
            backgroundImage: { type: 'text' as const, label: 'Background image URL', metadata: { isImage: true } },
            backgroundVideo: { type: 'text' as const, label: 'Background video URL', metadata: { isVideo: true } },
            overlayDarkness: {
              type: 'select' as const,
              label: 'Overlay tint',
              options: [
                { label: 'Darken — heavy', value: 'dark-3' },
                { label: 'Darken — medium', value: 'dark-2' },
                { label: 'Darken — light', value: 'dark-1' },
                { label: 'Lighten — light', value: 'light-1' },
                { label: 'Lighten — medium', value: 'light-2' },
                { label: 'Lighten — heavy', value: 'light-3' },
              ],
            },
            contentPosition: {
              type: 'select' as const,
              label: 'Content position',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Center Left', value: 'center-left' },
                { label: 'Center Right', value: 'center-right' },
                { label: 'Lower Left', value: 'lower-left' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Center', value: 'bottom-center' },
              ],
            },
            showScrollIndicator: { type: 'radio' as const, label: 'Scroll indicator', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
            topOverlay: { type: 'select' as const, label: 'Top gradient (nav contrast)', options: [{ label: 'None', value: 'none' }, { label: 'Dark (for light nav)', value: 'dark' }, { label: 'Light (for dark nav)', value: 'light' }] },
            bottomOverlay: { type: 'select' as const, label: 'Bottom gradient (melt into next section)', options: [{ label: 'None', value: 'none' }, { label: 'Surface (page bg)', value: 'surface' }, { label: 'White', value: 'white' }, { label: 'Mist (teal)', value: 'mist' }, { label: 'Yellow (amber)', value: 'amber' }, { label: 'Dark green (forest-800)', value: 'forest-800' }, { label: 'Darkest green (forest-950)', value: 'forest-950' }] },
            subBlur: { type: 'select' as const, label: 'Subheading blur backdrop', options: [{ label: 'None', value: 'none' }, { label: 'Light (frosted white)', value: 'light' }, { label: 'Dark (frosted dark)', value: 'dark' }] },
            ...modularFields,
          }
        }
        if (p === 'fullscreen') {
          return {
            ...base,
            backgroundImage: { type: 'text' as const, label: 'Background image URL', metadata: { isImage: true } },
            backgroundVideo: { type: 'text' as const, label: 'Background video URL', metadata: { isVideo: true } },
            overlayDarkness: {
              type: 'select' as const,
              label: 'Overlay tint',
              options: [
                { label: 'Darken — heavy', value: 'dark-3' },
                { label: 'Darken — medium', value: 'dark-2' },
                { label: 'Darken — light', value: 'dark-1' },
                { label: 'Lighten — light', value: 'light-1' },
                { label: 'Lighten — medium', value: 'light-2' },
                { label: 'Lighten — heavy', value: 'light-3' },
              ],
            },
            contentPosition: {
              type: 'select' as const,
              label: 'Content position',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Center Left', value: 'center-left' },
                { label: 'Center Right', value: 'center-right' },
                { label: 'Top Left', value: 'top-left' },
                { label: 'Top Center', value: 'top-center' },
                { label: 'Lower Left', value: 'lower-left' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Center', value: 'bottom-center' },
              ],
            },
            showScrollIndicator: { type: 'radio' as const, label: 'Scroll indicator', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
            topOverlay: { type: 'select' as const, label: 'Top gradient (nav contrast)', options: [{ label: 'None', value: 'none' }, { label: 'Dark (for light nav)', value: 'dark' }, { label: 'Light (for dark nav)', value: 'light' }] },
            bottomOverlay: { type: 'select' as const, label: 'Bottom gradient (melt into next section)', options: [{ label: 'None', value: 'none' }, { label: 'Surface (page bg)', value: 'surface' }, { label: 'White', value: 'white' }, { label: 'Mist (teal)', value: 'mist' }, { label: 'Yellow (amber)', value: 'amber' }, { label: 'Dark green (forest-800)', value: 'forest-800' }, { label: 'Darkest green (forest-950)', value: 'forest-950' }] },
            subBlur: { type: 'select' as const, label: 'Subheading blur backdrop', options: [{ label: 'None', value: 'none' }, { label: 'Light (frosted white)', value: 'light' }, { label: 'Dark (frosted dark)', value: 'dark' }] },
            ...modularFields,
          }
        }
        // minimal — heading + subheading + modular controls
        return { ...base, ...modularFields }
      },
      render: Hero as any,
    },
    RichText: {
      label: 'Rich Text',
      defaultProps: { sectionBg: 'transparent', content: '<p>Write your content here...</p>', maxWidth: 'medium', position: 'center', alignment: 'left', fontSize: 'normal', textColor: 'default' },
      fields: {
        sectionBg: sectionBgField,
        maxWidth: { type: 'select', label: 'Width', options: [{ label: 'Narrow (65ch)', value: 'narrow' }, { label: 'Medium (80ch)', value: 'medium' }, { label: 'Full', value: 'full' }] },
        position: { type: 'radio', label: 'Position', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        alignment: { type: 'radio', label: 'Text align', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        fontSize: { type: 'radio', label: 'Font size', options: [{ label: 'Small', value: 'small' }, { label: 'Normal', value: 'normal' }, { label: 'Large', value: 'large' }] },
        textColor: { type: 'select', label: 'Text color', options: [{ label: 'Default', value: 'default' }, { label: 'White (on dark bg)', value: 'white' }, { label: 'Light (on dark bg)', value: 'light' }, { label: 'Brand green', value: 'brand' }, { label: 'Accent green', value: 'accent' }, { label: 'Muted', value: 'muted' }] },
      },
      render: ({ sectionBg, content, maxWidth, position, alignment, fontSize, textColor, id }: any) => (
        <SectionBgWrap bg={sectionBg}>
          <RichTextSectionWrap>
            <RichText content={content} maxWidth={maxWidth} position={position} alignment={alignment} fontSize={fontSize} textColor={textColor} id={id} />
          </RichTextSectionWrap>
        </SectionBgWrap>
      ),
    },
    ImageBlock: {
      label: 'Image',
      defaultProps: { sectionBg: 'transparent', src: '', alt: '', caption: '', size: 'full', alignment: 'center', rounded: 'small', link: '', shadow: 'none', border: 'none' },
      fields: {
        sectionBg: sectionBgField,
        src: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, alt: { type: 'text', label: 'Alt text' }, caption: { type: 'text', label: 'Caption' },
        size: { type: 'select', label: 'Size', options: [{ label: 'Small (50%)', value: 'small' }, { label: 'Medium (75%)', value: 'medium' }, { label: 'Full', value: 'full' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        rounded: { type: 'radio', label: 'Corners', options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        shadow: { type: 'radio', label: 'Shadow', options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        border: { type: 'radio', label: 'Border', options: [{ label: 'None', value: 'none' }, { label: 'Thin', value: 'thin' }] },
        link: { type: 'text', label: 'Link URL', metadata: { isPagePicker: true } },
      },
      render: ({ sectionBg, src, alt, caption, size, alignment, rounded, link, shadow, border, aspectRatio, maxHeight, id }: any) => {
        const isBanner = Boolean(maxHeight) || (aspectRatio && aspectRatio !== 'auto')
        const inner = <ImageBlock src={src} alt={alt} caption={caption} size={size} alignment={alignment} rounded={rounded} shadow={shadow} border={border} link={link} aspectRatio={aspectRatio} maxHeight={maxHeight} id={id} />
        return (
          <SectionBgWrap bg={sectionBg}>
            {isBanner ? inner : (
              <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
                {inner}
              </div>
            )}
          </SectionBgWrap>
        )
      },
    },
    Accordion: {
      label: 'Accordion / FAQ',
      defaultProps: { sectionBg: 'transparent', heading: '', items: [{ question: 'Question here', answer: 'Answer here' }], defaultOpen: 'none', style: 'default', iconPosition: 'right' },
      fields: {
        sectionBg: sectionBgField,
        heading: { type: 'text', label: 'Heading' },
        items: { type: 'array', label: 'Questions', arrayFields: { question: { type: 'text', label: 'Question' }, answer: { type: 'textarea', label: 'Answer' } } },
        defaultOpen: { type: 'select', label: 'Initially expanded', options: [{ label: 'None', value: 'none' }, { label: 'First item', value: 'first' }, { label: 'All items', value: 'all' }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal', value: 'minimal' }] },
        iconPosition: { type: 'radio', label: 'Icon position', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
      },
      render: ({ sectionBg, heading, items, defaultOpen, style, iconPosition, id }: any) => (
        <SectionBgWrap bg={sectionBg}>
          <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
            <Accordion heading={heading} items={items} defaultOpen={defaultOpen} style={style} iconPosition={iconPosition} id={id} />
          </div>
        </SectionBgWrap>
      ),
    },
    PageHeader: {
      label: 'Page Header',
      defaultProps: { sectionBg: 'transparent', heading: 'Heading', subheading: '', alignment: 'left', size: 'large', showDivider: false, breadcrumbs: [], breadcrumbHomeText: 'Hem', backgroundColor: 'transparent' },
      fields: {
        sectionBg: sectionBgField,
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        size: { type: 'radio', label: 'Size', options: [{ label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        backgroundColor: { type: 'select', label: 'Background', options: [{ label: 'Transparent', value: 'transparent' }, { label: 'Light', value: 'light' }, { label: 'Primary (green)', value: 'primary' }] },
        showDivider: { type: 'radio', label: 'Show divider', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        breadcrumbs: { type: 'array', label: 'Breadcrumbs', arrayFields: { label: { type: 'text', label: 'Label' }, href: { type: 'text', label: 'Link', metadata: { isPagePicker: true } } } },
        breadcrumbHomeText: { type: 'text', label: 'Home breadcrumb text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PageHeader {...props} /></SectionBgWrap>,
    },
    PersonCard: {
      label: 'Person Card',
      defaultProps: { sectionBg: 'transparent', name: 'Fredrik Livheim', title: 'Licensed psychologist', bio: '', image: '', email: '', phone: '', style: 'horizontal', imageSize: 'medium' },
      fields: {
        sectionBg: sectionBgField,
        name: { type: 'text', label: 'Name' }, title: { type: 'text', label: 'Title / Role' }, bio: { type: 'textarea', label: 'Bio' },
        image: { type: 'text', label: 'Photo URL', metadata: { isImage: true } }, email: { type: 'text', label: 'Email' }, phone: { type: 'text', label: 'Phone' },
        style: { type: 'radio', label: 'Layout', options: [{ label: 'Card', value: 'card' }, { label: 'Horizontal', value: 'horizontal' }] },
        imageSize: { type: 'radio', label: 'Image size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PersonCard {...props} /></SectionBgWrap>,
    },
    FeatureGrid: {
      label: 'Feature Grid',
      defaultProps: { sectionBg: 'transparent', heading: '', subheading: '', columns: 3, items: [{ icon: '', title: 'Feature one', description: 'Description of this feature' }, { icon: '', title: 'Feature two', description: 'Description of this feature' }, { icon: '', title: 'Feature three', description: 'Description of this feature' }], style: 'cards', iconSize: 'medium', padding: 'medium', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        items: { type: 'array', label: 'Features', arrayFields: { image: { type: 'text', label: 'Image', metadata: { isImage: true } }, icon: { type: 'select', label: 'Icon (if no image)', options: [{ label: 'None', value: '' }, { label: 'Heart', value: 'heart' }, { label: 'Star', value: 'star' }, { label: 'Shield', value: 'shield' }, { label: 'Target', value: 'target' }, { label: 'Lightbulb', value: 'lightbulb' }, { label: 'Brain', value: 'brain' }, { label: 'Users', value: 'users' }, { label: 'User', value: 'user' }, { label: 'Handshake', value: 'handshake' }, { label: 'Book Open', value: 'book-open' }, { label: 'Graduation Cap', value: 'graduation-cap' }, { label: 'Message Circle', value: 'message-circle' }, { label: 'Check Circle', value: 'check-circle' }, { label: 'Key', value: 'key' }, { label: 'Puzzle', value: 'puzzle' }, { label: 'Sprout', value: 'sprout' }, { label: 'Leaf', value: 'leaf' }, { label: 'Mountain', value: 'mountain' }, { label: 'Sun', value: 'sun' }, { label: 'Refresh', value: 'refresh-cw' }, { label: 'Bar Chart', value: 'bar-chart-3' }, { label: 'Music', value: 'music' }, { label: 'Video', value: 'video' }, { label: 'Phone', value: 'phone' }, { label: 'Mail', value: 'mail' }, { label: 'Map Pin', value: 'map-pin' }, { label: 'Clock', value: 'clock' }, { label: 'Calendar', value: 'calendar' }, { label: 'Link', value: 'link' }, { label: 'Download', value: 'download' }, { label: 'Arrow Right', value: 'arrow-right' }, { label: 'Sparkles', value: 'sparkles' }, { label: 'Heart Handshake', value: 'heart-handshake' }, { label: 'Activity', value: 'activity' }, { label: 'Bell', value: 'bell' }, { label: 'Home', value: 'home' }, { label: 'Settings', value: 'settings' }, { label: 'Search', value: 'search' }, { label: 'Pen', value: 'pen-line' }, { label: 'Folder', value: 'folder' }] }, title: { type: 'text', label: 'Title' }, description: { type: 'textarea', label: 'Description' } } },
        style: { type: 'radio', label: 'Style', options: [{ label: 'Cards', value: 'cards' }, { label: 'Minimal', value: 'minimal' }] },
        iconSize: { type: 'radio', label: 'Icon size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        padding: { type: 'radio', label: 'Padding', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><FeatureGrid {...props} /></SectionBgWrap>,
    },
    StatsCounter: {
      label: 'Stats Counter',
      defaultProps: { sectionBg: 'transparent', items: [{ value: '100', label: 'Participants', prefix: '', suffix: '+' }, { value: '15', label: 'Years experience', prefix: '', suffix: '' }, { value: '98', label: 'Satisfaction', prefix: '', suffix: '%' }], columns: 3, style: 'default', animation: 'none' },
      fields: {
        sectionBg: sectionBgField,
        items: { type: 'array', label: 'Stats', arrayFields: { value: { type: 'text', label: 'Value' }, label: { type: 'text', label: 'Label' }, prefix: { type: 'text', label: 'Prefix' }, suffix: { type: 'text', label: 'Suffix' } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        style: { type: 'radio', label: 'Style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }] },
        animation: { type: 'radio', label: 'Animation', options: [{ label: 'None', value: 'none' }, { label: 'Count up', value: 'countUp' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><StatsCounter {...props} /></SectionBgWrap>,
    },

    // ── Marketing ──
    CTABanner: {
      label: 'CTA Banner',
      defaultProps: {
        sectionBg: 'transparent',
        heading: 'Ready to start?',
        description: 'Book your spot for the next session',
        buttonText: 'Book now',
        buttonLink: '/utbildningar',
        buttons: [{ text: 'Book now', link: '/utbildningar', variant: 'primary' }],
        backgroundColor: 'primary',
        alignment: 'center',
        width: 'contained',
        padding: 'medium',
      },
      fields: {
        sectionBg: sectionBgField,
        buttonLink: { type: 'text', label: 'Button link (legacy)', metadata: { isPagePicker: true } },
        buttons: { type: 'array', label: 'Buttons', arrayFields: {
          text: { type: 'text', label: 'Label' },
          link: { type: 'text', label: 'Link to', metadata: { isPagePicker: true } },
          variant: { type: 'select', label: 'Style', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }] },
        } },
        backgroundColor: { type: 'select', label: 'Background', options: [{ label: 'Primary (green)', value: 'primary' }, { label: 'Gradient', value: 'gradient' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        width: { type: 'radio', label: 'Width', options: [{ label: 'Full width', value: 'full' }, { label: 'Medium', value: 'contained' }, { label: 'Small', value: 'narrow' }] },
        padding: { type: 'radio', label: 'Padding', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ sectionBg, heading, description, buttonText, buttonLink, buttons, backgroundColor, alignment, width, padding, id }: any) => (
        <SectionBgWrap bg={sectionBg}>
          <CTABanner heading={heading} description={description} buttonText={buttonText} buttonLink={buttonLink} buttons={buttons} backgroundColor={backgroundColor} alignment={alignment} width={width} padding={padding} id={id} />
        </SectionBgWrap>
      ),
    },
    CardGrid: {
      label: 'Card Grid',
      defaultProps: { sectionBg: 'transparent', heading: '', subheading: '', source: 'manual', maxItems: 3, columns: 3, cardStyle: 'default', manualCards: [], fullBadgeText: 'Fullbokat', spotsAvailableText: 'Platser kvar', emptyManualText: 'Add cards in settings...', emptyDynamicText: 'Inget innehåll tillgängligt.', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        source: { type: 'select', label: 'Data source', options: [{ label: 'Manual', value: 'manual' }, { label: 'Posts', value: 'posts' }, { label: 'Courses', value: 'courses' }, { label: 'Products', value: 'products' }] },
        maxItems: { type: 'number', label: 'Max items' },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        manualCards: { type: 'array', label: 'Cards', arrayFields: { title: { type: 'text', label: 'Title' }, description: { type: 'textarea', label: 'Description' }, image: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } }, badge: { type: 'text', label: 'Badge' } } },
        cardStyle: { type: 'select', label: 'Card style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Shadow', value: 'shadow' }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
        fullBadgeText: { type: 'text', label: 'Full badge text' },
        spotsAvailableText: { type: 'text', label: 'Spots available text' },
        emptyManualText: { type: 'text', label: 'Empty text (manual)' },
        emptyDynamicText: { type: 'text', label: 'Empty text (dynamic)' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><CardGrid {...props} /></SectionBgWrap>,
    },
    Testimonial: {
      label: 'Testimonial',
      defaultProps: {
        sectionBg: 'transparent',
        items: [
          { quote: 'ACT-utbildningen förändrade mitt sätt att se på livet. Jag känner mig mer närvarande och engagerad i allt jag gör.', author: 'Maria Lindqvist', role: 'Deltagare, ACT-kurs 2025', avatar: '' },
          { quote: 'Fredrik är en fantastisk utbildare. Hans kombination av vetenskap och personliga berättelser gör materialet verkligt levande.', author: 'Johan Eriksson', role: 'Psykolog, Stockholms kommun', avatar: '' },
          { quote: 'Mindfulness-övningarna har blivit en naturlig del av min vardag. Jag rekommenderar detta varmt till alla.', author: 'Anna Bergström', role: 'Lärare, Göteborg', avatar: '' },
        ],
        style: 'card',
        showQuoteIcon: false,
        displayMode: 'carousel',
        autoPlaySpeed: 5,
      },
      fields: {
        items: {
          type: 'array',
          label: 'Testimonials',
          arrayFields: {
            quote: { type: 'textarea', label: 'Quote' },
            author: { type: 'text', label: 'Author' },
            role: { type: 'text', label: 'Role / Title' },
            avatar: { type: 'text', label: 'Avatar URL', metadata: { isImage: true } },
          },
        },
        sectionBg: sectionBgField,
        autoPlaySpeed: { type: 'number', label: 'Auto-play speed (seconds)', min: 1, max: 30 },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><Testimonial {...props} /></SectionBgWrap>,
    },
    ButtonGroup: {
      label: 'Buttons',
      defaultProps: { sectionBg: 'transparent', buttons: [{ text: 'Primary button', link: '/', variant: 'primary' }], alignment: 'center', direction: 'horizontal', size: 'medium' },
      fields: {
        sectionBg: sectionBgField,
        buttons: { type: 'array', label: 'Buttons', arrayFields: { text: { type: 'text', label: 'Text' }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } }, variant: { type: 'select', label: 'Variant', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }] } } },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        direction: { type: 'radio', label: 'Direction', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        size: { type: 'select', label: 'Size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ sectionBg, buttons, alignment, direction, size }: any) => (
        <SectionBgWrap bg={sectionBg}>
          <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
            <ButtonGroup buttons={buttons} alignment={alignment} direction={direction} size={size} />
          </div>
        </SectionBgWrap>
      ),
    },
    PricingTable: {
      label: 'Pricing Table',
      defaultProps: { sectionBg: 'transparent', heading: '', items: [], columns: 2, highlightLabel: 'Populärt val', emptyText: 'Add pricing plans in settings...', showCurrency: true },
      fields: {
        sectionBg: sectionBgField,
        items: { type: 'array', label: 'Plans', arrayFields: { name: { type: 'text', label: 'Name' }, price: { type: 'text', label: 'Price' }, description: { type: 'textarea', label: 'Description' }, features: { type: 'textarea', label: 'Features (one per line)' }, highlighted: { type: 'radio', label: 'Highlighted', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }, ctaText: { type: 'text', label: 'Button text' }, ctaLink: { type: 'text', label: 'Button link', metadata: { isPagePicker: true } } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        highlightLabel: { type: 'text', label: 'Highlight label' },
        showCurrency: { type: 'radio', label: 'Show currency (kr)', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PricingTable {...props} /></SectionBgWrap>,
    },

    // ── Media ──
    ImageGallery: {
      label: 'Image Gallery',
      defaultProps: { sectionBg: 'transparent', images: [{ src: '', alt: 'Image 1', caption: '' }, { src: '', alt: 'Image 2', caption: '' }, { src: '', alt: 'Image 3', caption: '' }], columns: 3, gap: 'medium', aspectRatio: 'landscape', rounded: 'medium', lightbox: false },
      fields: {
        sectionBg: sectionBgField,
        images: { type: 'array', label: 'Images', arrayFields: { src: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, alt: { type: 'text', label: 'Alt text' }, caption: { type: 'text', label: 'Caption' } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        gap: { type: 'select', label: 'Gap', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: 'Square', value: 'square' }, { label: 'Landscape', value: 'landscape' }, { label: 'Portrait', value: 'portrait' }, { label: 'Auto', value: 'auto' }] },
        rounded: { type: 'radio', label: 'Corners', options: [{ label: 'None', value: 'none' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        lightbox: { type: 'radio', label: 'Lightbox on click', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><ImageGallery {...props} /></SectionBgWrap>,
    },
    VideoEmbed: {
      label: 'Video',
      defaultProps: { sectionBg: 'transparent', url: '', aspectRatio: '16:9', caption: '' },
      fields: {
        sectionBg: sectionBgField,
        url: { type: 'text', label: 'Video URL' },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
        caption: { type: 'text', label: 'Caption' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><VideoEmbed {...props} /></SectionBgWrap>,
    },
    AudioEmbed: {
      label: 'Audio',
      defaultProps: { sectionBg: 'transparent', url: '', caption: '', style: 'minimal' },
      fields: {
        sectionBg: sectionBgField,
        url: { type: 'text', label: 'Audio URL' },
        caption: { type: 'text', label: 'Caption' },
        style: { type: 'select', label: 'Style', options: [{ label: 'Minimal', value: 'minimal' }, { label: 'Card', value: 'card' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><AudioEmbed {...props} /></SectionBgWrap>,
    },
    FileEmbed: {
      label: 'File / Document',
      defaultProps: { sectionBg: 'transparent', url: '', fileName: '', caption: '', showPreview: true },
      fields: {
        sectionBg: sectionBgField,
        url: { type: 'text', label: 'File URL' },
        fileName: { type: 'text', label: 'File name' },
        caption: { type: 'text', label: 'Caption' },
        showPreview: { type: 'radio', label: 'Show preview', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><FileEmbed {...props} /></SectionBgWrap>,
    },
    EmbedBlock: {
      label: 'Embed',
      defaultProps: { sectionBg: 'transparent', url: '', html: '', caption: '', aspectRatio: 'auto' },
      fields: {
        sectionBg: sectionBgField,
        url: { type: 'text', label: 'Embed URL' },
        html: { type: 'textarea', label: 'Embed HTML' },
        caption: { type: 'text', label: 'Caption' },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: 'Auto', value: 'auto' }, { label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><EmbedBlock {...props} /></SectionBgWrap>,
    },

    // ── Dynamic ──
    CourseList: {
      label: 'Course List',
      defaultProps: { sectionBg: 'transparent', heading: '', maxItems: 0, columns: 2, compactMode: false, showLocation: true, showPrice: true, readMoreText: 'Visa kurs', fullLabel: 'Fullbokat', spotsText: 'platser kvar', emptyText: 'Inga utbildningar planerade just nu.', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        maxItems: { type: 'number', label: 'Max items (0 = all)' },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        compactMode: { type: 'radio', label: 'Compact mode', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showLocation: { type: 'radio', label: 'Show location', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showPrice: { type: 'radio', label: 'Show price', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
        readMoreText: { type: 'text', label: 'Link text' },
        fullLabel: { type: 'text', label: 'Full label' },
        spotsText: { type: 'text', label: 'Spots remaining text' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><CourseList {...props} /></SectionBgWrap>,
    },
    ProductList: {
      label: 'Product List',
      defaultProps: { sectionBg: 'transparent', heading: '', filterType: '', columns: 3, maxItems: 0, showImage: true, showPrice: true, buyButtonText: 'Köp', freeLabel: 'Gratis', outOfStockLabel: 'Slut i lager', emptyText: 'Inga produkter hittades.', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        filterType: { type: 'select', label: 'Filter by type', options: [{ label: 'All', value: '' }, { label: 'Books', value: 'book' }, { label: 'CDs', value: 'cd' }, { label: 'Cards', value: 'cards' }, { label: 'Apps', value: 'app' }, { label: 'Downloads', value: 'download' }] },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        maxItems: { type: 'number', label: 'Max items (0 = all)', min: 0 },
        showImage: { type: 'radio', label: 'Show image', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showPrice: { type: 'radio', label: 'Show price', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
        buyButtonText: { type: 'text', label: 'Buy button text' },
        freeLabel: { type: 'text', label: 'Free label' },
        outOfStockLabel: { type: 'text', label: 'Out of stock label' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><ProductList {...props} /></SectionBgWrap>,
    },
    PostGrid: {
      label: 'Post Grid',
      defaultProps: { sectionBg: 'transparent', heading: '', subheading: '', count: 3, columns: 3, showImage: true, showExcerpt: true, showDate: true, emptyText: 'Inga inlägg hittades', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        count: { type: 'number', label: 'Number of posts', min: 1, max: 12 },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showImage: { type: 'radio', label: 'Show image', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showExcerpt: { type: 'radio', label: 'Show excerpt', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showDate: { type: 'radio', label: 'Show date', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PostGrid {...props} /></SectionBgWrap>,
    },
    PageCards: {
      label: 'Page Cards',
      defaultProps: { sectionBg: 'transparent', heading: '', parentSlug: '', manualPages: [], columns: 3, showDescription: true, style: 'card', emptyText: 'Inga undersidor hittades', emptyManualText: 'Add pages manually or specify a parent page', cardColor: 'mist' },
      fields: {
        sectionBg: sectionBgField,
        parentSlug: { type: 'text', label: 'Show child pages of', metadata: { isPagePicker: true } },
        manualPages: { type: 'array', label: 'Or pick pages manually', arrayFields: { slug: { type: 'text', label: 'Page', metadata: { isPagePicker: true } } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showDescription: { type: 'radio', label: 'Show description', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Card', value: 'card' }, { label: 'List', value: 'list' }, { label: 'Minimal', value: 'minimal' }] },
        cardColor: { type: 'select', label: 'Card color', options: [{ label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' }, { label: 'Mist', value: 'mist' }, { label: 'Dark green', value: 'dark' }] },
        emptyText: { type: 'text', label: 'Empty text (with parent)' },
        emptyManualText: { type: 'text', label: 'Empty text (manual)' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PageCards {...props} /></SectionBgWrap>,
    },
    NavigationMenu: {
      label: 'Navigation Menu',
      defaultProps: { sectionBg: 'transparent', items: [{ label: 'Home', link: '/' }], layout: 'horizontal', style: 'pills', alignment: 'center' },
      fields: {
        sectionBg: sectionBgField,
        items: { type: 'array', label: 'Menu items', arrayFields: { label: { type: 'text', label: 'Label' }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } } } },
        layout: { type: 'radio', label: 'Layout', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Pills', value: 'pills' }, { label: 'Underline', value: 'underline' }, { label: 'Buttons', value: 'buttons' }, { label: 'Minimal', value: 'minimal' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><NavigationMenu {...props} /></SectionBgWrap>,
    },

    // ── Interactive ──
    ContactForm: {
      label: 'Contact Form',
      defaultProps: { sectionBg: 'transparent', heading: 'Contact us', description: 'Have questions? Get in touch and we will get back to you as soon as possible.', showPhone: true, showSubject: true, layout: 'full', contactName: 'Fredrik Livheim', contactTitle: 'Licensed psychologist and ACT trainer', contactEmail: 'livheim@gmail.com', contactPhone: '070-694 03 64', submitButtonText: 'Send message', submittingText: 'Sending...', successHeading: 'Thank you for your message!', successMessage: 'We will get back to you as soon as possible.', nameLabel: 'Name *', emailLabel: 'Email *', phoneLabel: 'Phone', subjectLabel: 'Subject', messageLabel: 'Message *' },
      fields: {
        sectionBg: sectionBgField,
        showPhone: { type: 'radio', label: 'Show phone field', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showSubject: { type: 'radio', label: 'Show subject field', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', label: 'Layout', options: [{ label: 'Full', value: 'full' }, { label: 'Split', value: 'split' }] },
        contactName: { type: 'text', label: 'Contact name' }, contactTitle: { type: 'text', label: 'Contact title' }, contactEmail: { type: 'text', label: 'Contact email' }, contactPhone: { type: 'text', label: 'Contact phone' },
        submitButtonText: { type: 'text', label: 'Submit button text' },
        submittingText: { type: 'text', label: 'Submitting text' },
        successHeading: { type: 'text', label: 'Success heading' },
        successMessage: { type: 'text', label: 'Success message' },
        nameLabel: { type: 'text', label: 'Name field label' },
        emailLabel: { type: 'text', label: 'Email field label' },
        phoneLabel: { type: 'text', label: 'Phone field label' },
        subjectLabel: { type: 'text', label: 'Subject field label' },
        messageLabel: { type: 'text', label: 'Message field label' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><ContactForm {...props} /></SectionBgWrap>,
    },
    BookingForm: {
      label: 'Booking Form',
      defaultProps: { sectionBg: 'transparent', showSummary: true, showOrganization: true, showNotes: true, submitButtonText: 'Go to payment', processingText: 'Processing...', fullMessage: 'This course is fully booked.', completedMessage: 'This course has been completed.', totalLabel: 'Total', nameLabel: 'Name *', emailLabel: 'Email *', phoneLabel: 'Phone', organizationLabel: 'Organization', participantsLabel: 'Number of participants *', notesLabel: 'Notes', priceSuffix: 'kr/person' },
      fields: {
        sectionBg: sectionBgField,
        showSummary: { type: 'radio', label: 'Show course summary card', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showOrganization: { type: 'radio', label: 'Show organization field', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showNotes: { type: 'radio', label: 'Show notes field', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        submitButtonText: { type: 'text', label: 'Submit button text' },
        processingText: { type: 'text', label: 'Processing text' },
        fullMessage: { type: 'text', label: 'Full message' },
        completedMessage: { type: 'text', label: 'Completed message' },
        totalLabel: { type: 'text', label: 'Total label' },
        nameLabel: { type: 'text', label: 'Name field label' },
        emailLabel: { type: 'text', label: 'Email field label' },
        phoneLabel: { type: 'text', label: 'Phone field label' },
        organizationLabel: { type: 'text', label: 'Organization field label' },
        participantsLabel: { type: 'text', label: 'Participants field label' },
        notesLabel: { type: 'text', label: 'Notes field label' },
        priceSuffix: { type: 'text', label: 'Price suffix' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><BookingForm {...props} /></SectionBgWrap>,
    },

    // ── Data-bound ──
    CourseInfo: {
      label: 'Course Info',
      defaultProps: { sectionBg: 'transparent', showDeadline: true, showEmpty: false, layout: 'grid', locationLabel: 'Location', dateLabel: 'Date', priceLabel: 'Price', spotsLabel: 'Spots', deadlineLabel: 'Registration deadline', fullLabel: 'Fully booked', spotsOfText: 'of', spotsRemainingText: 'remaining' },
      fields: {
        sectionBg: sectionBgField,
        showDeadline: { type: 'radio', label: 'Show deadline', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showEmpty: { type: 'radio', label: 'Show empty fields', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', label: 'Layout', options: [{ label: 'Grid', value: 'grid' }, { label: 'Stacked', value: 'stacked' }] },
        locationLabel: { type: 'text', label: 'Location label' },
        dateLabel: { type: 'text', label: 'Date label' },
        priceLabel: { type: 'text', label: 'Price label' },
        spotsLabel: { type: 'text', label: 'Spots label' },
        deadlineLabel: { type: 'text', label: 'Deadline label' },
        fullLabel: { type: 'text', label: 'Full label' },
        spotsOfText: { type: 'text', label: 'Spots "of" text' },
        spotsRemainingText: { type: 'text', label: 'Spots "remaining" text' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><CourseInfo {...props} /></SectionBgWrap>,
    },
    BookingCTA: {
      label: 'Booking CTA',
      defaultProps: { sectionBg: 'transparent', style: 'card', buttonText: 'Book spot', heading: 'Interested in joining?', description: 'Book your spot today', completedMessage: 'This course has been completed.', fullMessage: 'This course is fully booked.', fullSubMessage: 'Contact us if you want to be on the waiting list.' },
      fields: {
        sectionBg: sectionBgField,
        style: { type: 'radio', options: [{ label: 'Card', value: 'card' }, { label: 'Inline', value: 'inline' }] },
        buttonText: { type: 'text', label: 'Button text' },
        heading: { type: 'text', label: 'Heading' },
        description: { type: 'text', label: 'Description' },
        completedMessage: { type: 'text', label: 'Completed message' },
        fullMessage: { type: 'text', label: 'Full message' },
        fullSubMessage: { type: 'text', label: 'Full sub-message' },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><BookingCTA {...props} /></SectionBgWrap>,
    },
    PostHeader: {
      label: 'Post Header',
      defaultProps: { sectionBg: 'transparent', showBackLink: true, backLinkText: 'Alla inlägg', backLinkUrl: '/blog' },
      fields: {
        sectionBg: sectionBgField,
        showBackLink: { type: 'radio', label: 'Show back link', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        backLinkText: { type: 'text', label: 'Back link text' }, backLinkUrl: { type: 'text', label: 'Back link URL', metadata: { isPagePicker: true } },
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><PostHeader {...props} /></SectionBgWrap>,
    },
    CourseHeader: {
      label: 'Course Header',
      defaultProps: { sectionBg: 'transparent' },
      fields: {
        sectionBg: sectionBgField,
      },
      render: (props: any) => <SectionBgWrap bg={props.sectionBg}><CourseHeader {...props} /></SectionBgWrap>,
    },
  },
}

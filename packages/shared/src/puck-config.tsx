import type { Config, Data } from '@puckeditor/core'
import React from 'react'

// Block render components
import { Hero } from './blocks/Hero'
import { RichText } from './blocks/RichText'
import { ImageBlock } from './blocks/ImageBlock'
import { Accordion } from './blocks/Accordion'
import { Columns } from './blocks/Columns'
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
import { PageHeader } from './blocks/PageHeader'
import { PersonCard } from './blocks/PersonCard'
import { FeatureGrid } from './blocks/FeatureGrid'
import { StatsCounter } from './blocks/StatsCounter'

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
      className="sticky top-0 z-50"
      style={{
        background: 'var(--surface-glass, rgba(248, 246, 242, 0.72))',
        backdropFilter: 'blur(16px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
        borderBottom: '1px solid var(--surface-glass-border, rgba(200, 196, 188, 0.25))',
      }}
    >
      <nav style={{ maxWidth: 'var(--width-wide, 1440px)', marginInline: 'auto', paddingInline: 'var(--container-px, 1rem)' }}>
        <div className="flex justify-between h-16 lg:h-[72px]">
          <div className="flex items-center">
            <a href="/">
              <span className="font-display text-forest-950" style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}>{header.logoText}</span>
            </a>
          </div>
          <div className="hidden lg:flex items-center space-x-7">
            {header.navItems.map((item) => (
              item.children && item.children.length > 0 ? (
                <div key={item.label} className="relative group">
                  <span className="inline-flex items-center gap-1 text-stone-600 whitespace-nowrap cursor-default" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                    {item.label}
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-lg shadow-lg border border-stone-200 py-2 min-w-[180px]">
                      {item.children.map((child) => (
                        <a key={child.label} href={child.href} className="block px-4 py-2 text-sm text-stone-600 hover:text-forest-600 hover:bg-forest-50 transition-colors">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a key={item.label} href={item.href} className="text-stone-600 hover:text-forest-600 transition-colors duration-200 whitespace-nowrap" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
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
    data: { title: 'Data-bound', components: ['CourseInfo', 'BookingCTA', 'PostHeader'] },
  },

  components: {
    // ── Layout ──
    Columns: {
      label: 'Columns',
      defaultProps: { layout: '50-50', gap: 'medium', verticalAlignment: 'top', stackOnMobile: true },
      fields: {
        layout: { type: 'select', label: 'Layout', options: [{ label: '50/50', value: '50-50' }, { label: '33/33/33', value: '33-33-33' }, { label: '66/33', value: '66-33' }, { label: '33/66', value: '33-66' }] },
        gap: { type: 'select', label: 'Gap', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        verticalAlignment: { type: 'select', label: 'Vertical alignment', options: [{ label: 'Top', value: 'top' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'bottom' }] },
        stackOnMobile: { type: 'radio', label: 'Stack on mobile', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: Columns as any,
    },
    SeparatorBlock: {
      label: 'Separator',
      defaultProps: { variant: 'line', spacing: 'medium', lineColor: 'light', maxWidth: 'full' },
      fields: {
        variant: { type: 'select', options: [{ label: 'Line', value: 'line' }, { label: 'Dots', value: 'dots' }, { label: 'Space only', value: 'space-only' }] },
        spacing: { type: 'select', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'Extra large', value: 'extra-large' }] },
        lineColor: { type: 'select', options: [{ label: 'Light', value: 'light' }, { label: 'Medium', value: 'medium' }, { label: 'Dark', value: 'dark' }] },
        maxWidth: { type: 'select', options: [{ label: 'Narrow', value: 'narrow' }, { label: 'Medium', value: 'medium' }, { label: 'Full', value: 'full' }] },
      },
      render: SeparatorBlock as any,
    },
    Spacer: {
      label: 'Spacer',
      defaultProps: { size: 'medium' },
      fields: { size: { type: 'select', options: [{ label: 'XS', value: 'xs' }, { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'XL', value: 'xl' }] } },
      render: Spacer as any,
    },

    // ── Content ──
    Hero: {
      label: 'Hero',
      defaultProps: {
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
        overlayDarkness: 'medium',
        contentPosition: 'center',
        showScrollIndicator: true,
        textAlignment: 'left',
      },
      fields: {
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
        ctaPrimaryText: { type: 'text', label: 'Primary button text' },
        ctaPrimaryLink: { type: 'text', label: 'Primary button link', metadata: { isPagePicker: true } },
        ctaSecondaryText: { type: 'text', label: 'Secondary button text' },
        ctaSecondaryLink: { type: 'text', label: 'Secondary button link', metadata: { isPagePicker: true } },
        image: { type: 'text', label: 'Image URL', metadata: { isImage: true } },
        backgroundImage: { type: 'text', label: 'Background image URL', metadata: { isImage: true } },
        backgroundVideo: { type: 'text', label: 'Background video URL', metadata: { isVideo: true } },
        overlayDarkness: {
          type: 'select',
          label: 'Overlay darkness',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Medium', value: 'medium' },
            { label: 'Heavy', value: 'heavy' },
          ],
        },
        contentPosition: {
          type: 'select',
          label: 'Content position',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Top Left', value: 'top-left' },
            { label: 'Bottom Left', value: 'bottom-left' },
            { label: 'Bottom Center', value: 'bottom-center' },
          ],
        },
        showScrollIndicator: { type: 'radio', label: 'Show scroll indicator', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
        textAlignment: { type: 'radio', label: 'Text alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
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
            ctaPrimaryText: { type: 'text' as const, label: 'Primary button text' },
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link', metadata: { isPagePicker: true } },
            ctaSecondaryText: { type: 'text' as const, label: 'Secondary button text' },
            ctaSecondaryLink: { type: 'text' as const, label: 'Secondary button link', metadata: { isPagePicker: true } },
          }
        }
        if (p === 'split-right' || p === 'split-left') {
          return {
            ...base,
            image: { type: 'text' as const, label: 'Image URL', metadata: { isImage: true } },
            ctaPrimaryText: { type: 'text' as const, label: 'Primary button text' },
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link', metadata: { isPagePicker: true } },
            ctaSecondaryText: { type: 'text' as const, label: 'Secondary button text' },
            ctaSecondaryLink: { type: 'text' as const, label: 'Secondary button link', metadata: { isPagePicker: true } },
          }
        }
        if (p === 'full-image') {
          return {
            ...base,
            backgroundImage: { type: 'text' as const, label: 'Background image URL', metadata: { isImage: true } },
            overlayDarkness: {
              type: 'select' as const,
              label: 'Overlay darkness',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Medium', value: 'medium' },
                { label: 'Heavy', value: 'heavy' },
              ],
            },
            ctaPrimaryText: { type: 'text' as const, label: 'Primary button text' },
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link', metadata: { isPagePicker: true } },
            ctaSecondaryText: { type: 'text' as const, label: 'Secondary button text' },
            ctaSecondaryLink: { type: 'text' as const, label: 'Secondary button link', metadata: { isPagePicker: true } },
          }
        }
        if (p === 'fullscreen') {
          return {
            ...base,
            backgroundImage: { type: 'text' as const, label: 'Background image URL', metadata: { isImage: true } },
            backgroundVideo: { type: 'text' as const, label: 'Background video URL', metadata: { isVideo: true } },
            overlayDarkness: {
              type: 'select' as const,
              label: 'Overlay darkness',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Medium', value: 'medium' },
                { label: 'Heavy', value: 'heavy' },
              ],
            },
            contentPosition: {
              type: 'select' as const,
              label: 'Content position',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Top Left', value: 'top-left' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Center', value: 'bottom-center' },
              ],
            },
            ctaPrimaryText: { type: 'text' as const, label: 'Primary button text' },
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link', metadata: { isPagePicker: true } },
            ctaSecondaryText: { type: 'text' as const, label: 'Secondary button text' },
            ctaSecondaryLink: { type: 'text' as const, label: 'Secondary button link', metadata: { isPagePicker: true } },
            showScrollIndicator: { type: 'radio' as const, label: 'Scroll indicator', options: [{ label: 'Show', value: true }, { label: 'Hide', value: false }] },
          }
        }
        // minimal — just heading + subheading
        return base
      },
      render: Hero as any,
    },
    RichText: {
      label: 'Rich Text',
      defaultProps: { content: '<p>Write your content here...</p>', maxWidth: 'medium', alignment: 'left', fontSize: 'normal' },
      fields: {
        maxWidth: { type: 'select', label: 'Max width', options: [{ label: 'Narrow (65ch)', value: 'narrow' }, { label: 'Medium (80ch)', value: 'medium' }, { label: 'Full', value: 'full' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        fontSize: { type: 'radio', label: 'Font size', options: [{ label: 'Small', value: 'small' }, { label: 'Normal', value: 'normal' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ content, maxWidth, alignment, fontSize, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <RichText content={content} maxWidth={maxWidth} alignment={alignment} fontSize={fontSize} id={id} />
        </div>
      ),
    },
    ImageBlock: {
      label: 'Image',
      defaultProps: { src: '', alt: '', caption: '', size: 'full', alignment: 'center', rounded: 'small', link: '', shadow: 'none', border: 'none' },
      fields: {
        src: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, alt: { type: 'text', label: 'Alt text' }, caption: { type: 'text', label: 'Caption' },
        size: { type: 'select', label: 'Size', options: [{ label: 'Small (50%)', value: 'small' }, { label: 'Medium (75%)', value: 'medium' }, { label: 'Full', value: 'full' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        rounded: { type: 'radio', label: 'Corners', options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        shadow: { type: 'radio', label: 'Shadow', options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        border: { type: 'radio', label: 'Border', options: [{ label: 'None', value: 'none' }, { label: 'Thin', value: 'thin' }] },
        link: { type: 'text', label: 'Link URL', metadata: { isPagePicker: true } },
      },
      render: ({ src, alt, caption, size, alignment, rounded, link, shadow, border, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <ImageBlock src={src} alt={alt} caption={caption} size={size} alignment={alignment} rounded={rounded} shadow={shadow} border={border} link={link} id={id} />
        </div>
      ),
    },
    Accordion: {
      label: 'Accordion / FAQ',
      defaultProps: { heading: '', items: [{ question: 'Question here', answer: 'Answer here' }], defaultOpen: 'none', style: 'default', iconPosition: 'right' },
      fields: {
        heading: { type: 'text', label: 'Heading' },
        items: { type: 'array', label: 'Questions', arrayFields: { question: { type: 'text', label: 'Question' }, answer: { type: 'textarea', label: 'Answer' } } },
        defaultOpen: { type: 'select', label: 'Initially expanded', options: [{ label: 'None', value: 'none' }, { label: 'First item', value: 'first' }, { label: 'All items', value: 'all' }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal', value: 'minimal' }] },
        iconPosition: { type: 'radio', label: 'Icon position', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
      },
      render: ({ heading, items, defaultOpen, style, iconPosition, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <Accordion heading={heading} items={items} defaultOpen={defaultOpen} style={style} iconPosition={iconPosition} id={id} />
        </div>
      ),
    },
    PageHeader: {
      label: 'Page Header',
      defaultProps: { heading: 'Heading', subheading: '', alignment: 'left', size: 'large', showDivider: false, breadcrumbs: [], breadcrumbHomeText: 'Hem', backgroundColor: 'transparent' },
      fields: {
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        size: { type: 'radio', label: 'Size', options: [{ label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        backgroundColor: { type: 'select', label: 'Background', options: [{ label: 'Transparent', value: 'transparent' }, { label: 'Light', value: 'light' }, { label: 'Primary (green)', value: 'primary' }] },
        showDivider: { type: 'radio', label: 'Show divider', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        breadcrumbs: { type: 'array', label: 'Breadcrumbs', arrayFields: { label: { type: 'text', label: 'Label' }, href: { type: 'text', label: 'Link', metadata: { isPagePicker: true } } } },
        breadcrumbHomeText: { type: 'text', label: 'Home breadcrumb text' },
      },
      render: PageHeader as any,
    },
    PersonCard: {
      label: 'Person Card',
      defaultProps: { name: 'Fredrik Livheim', title: 'Licensed psychologist', bio: '', image: '', email: '', phone: '', style: 'horizontal', imageSize: 'medium' },
      fields: {
        name: { type: 'text', label: 'Name' }, title: { type: 'text', label: 'Title / Role' }, bio: { type: 'textarea', label: 'Bio' },
        image: { type: 'text', label: 'Photo URL', metadata: { isImage: true } }, email: { type: 'text', label: 'Email' }, phone: { type: 'text', label: 'Phone' },
        style: { type: 'radio', label: 'Layout', options: [{ label: 'Card', value: 'card' }, { label: 'Horizontal', value: 'horizontal' }] },
        imageSize: { type: 'radio', label: 'Image size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: PersonCard as any,
    },
    FeatureGrid: {
      label: 'Feature Grid',
      defaultProps: { heading: '', subheading: '', columns: 3, items: [{ icon: 'heart', title: 'Feature one', description: 'Description of this feature' }, { icon: 'star', title: 'Feature two', description: 'Description of this feature' }, { icon: 'shield', title: 'Feature three', description: 'Description of this feature' }], style: 'cards', iconSize: 'medium', padding: 'medium' },
      fields: {
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        items: { type: 'array', label: 'Features', arrayFields: { icon: { type: 'text', label: 'Icon' }, title: { type: 'text', label: 'Title' }, description: { type: 'textarea', label: 'Description' } } },
        style: { type: 'radio', label: 'Style', options: [{ label: 'Cards', value: 'cards' }, { label: 'Minimal', value: 'minimal' }] },
        iconSize: { type: 'radio', label: 'Icon size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        padding: { type: 'radio', label: 'Padding', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: FeatureGrid as any,
    },
    StatsCounter: {
      label: 'Stats Counter',
      defaultProps: { items: [{ value: '100', label: 'Participants', prefix: '', suffix: '+' }, { value: '15', label: 'Years experience', prefix: '', suffix: '' }, { value: '98', label: 'Satisfaction', prefix: '', suffix: '%' }], columns: 3, style: 'default', animation: 'none' },
      fields: {
        items: { type: 'array', label: 'Stats', arrayFields: { value: { type: 'text', label: 'Value' }, label: { type: 'text', label: 'Label' }, prefix: { type: 'text', label: 'Prefix' }, suffix: { type: 'text', label: 'Suffix' } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        style: { type: 'radio', label: 'Style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }] },
        animation: { type: 'radio', label: 'Animation', options: [{ label: 'None', value: 'none' }, { label: 'Count up', value: 'countUp' }] },
      },
      render: StatsCounter as any,
    },

    // ── Marketing ──
    CTABanner: {
      label: 'CTA Banner',
      defaultProps: {
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
        buttonLink: { type: 'text', label: 'Button link (legacy)', metadata: { isPagePicker: true } },
        buttons: { type: 'array', label: 'Buttons', arrayFields: {
          text: { type: 'text', label: 'Label' },
          link: { type: 'text', label: 'Link to', metadata: { isPagePicker: true } },
          variant: { type: 'select', label: 'Style', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }] },
        } },
        backgroundColor: { type: 'select', label: 'Background', options: [{ label: 'Primary (green)', value: 'primary' }, { label: 'Gradient', value: 'gradient' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        width: { type: 'radio', label: 'Width', options: [{ label: 'Full', value: 'full' }, { label: 'Contained', value: 'contained' }, { label: 'Narrow', value: 'narrow' }] },
        padding: { type: 'radio', label: 'Padding', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ heading, description, buttonText, buttonLink, buttons, backgroundColor, alignment, width, padding, id }: any) => (
        <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
          <CTABanner heading={heading} description={description} buttonText={buttonText} buttonLink={buttonLink} buttons={buttons} backgroundColor={backgroundColor} alignment={alignment} width={width} padding={padding} id={id} />
        </div>
      ),
    },
    CardGrid: {
      label: 'Card Grid',
      defaultProps: { heading: '', subheading: '', source: 'manual', maxItems: 3, columns: 3, cardStyle: 'default', manualCards: [], fullBadgeText: 'Fullbokat', spotsAvailableText: 'Platser kvar', emptyManualText: 'Add cards in settings...', emptyDynamicText: 'Inget innehåll tillgängligt.' },
      fields: {
        source: { type: 'select', label: 'Data source', options: [{ label: 'Manual', value: 'manual' }, { label: 'Posts', value: 'posts' }, { label: 'Courses', value: 'courses' }, { label: 'Products', value: 'products' }] },
        maxItems: { type: 'number', label: 'Max items' },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        manualCards: { type: 'array', label: 'Cards', arrayFields: { title: { type: 'text', label: 'Title' }, description: { type: 'textarea', label: 'Description' }, image: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } }, badge: { type: 'text', label: 'Badge' } } },
        cardStyle: { type: 'select', label: 'Card style', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Shadow', value: 'shadow' }] },
        fullBadgeText: { type: 'text', label: 'Full badge text' },
        spotsAvailableText: { type: 'text', label: 'Spots available text' },
        emptyManualText: { type: 'text', label: 'Empty text (manual)' },
        emptyDynamicText: { type: 'text', label: 'Empty text (dynamic)' },
      },
      render: CardGrid as any,
    },
    Testimonial: {
      label: 'Testimonial',
      defaultProps: {
        items: [
          { quote: 'ACT-utbildningen förändrade mitt sätt att se på livet. Jag känner mig mer närvarande och engagerad i allt jag gör.', author: 'Maria Lindqvist', role: 'Deltagare, ACT-kurs 2025', avatar: '' },
          { quote: 'Fredrik är en fantastisk utbildare. Hans kombination av vetenskap och personliga berättelser gör materialet verkligt levande.', author: 'Johan Eriksson', role: 'Psykolog, Stockholms kommun', avatar: '' },
          { quote: 'Mindfulness-övningarna har blivit en naturlig del av min vardag. Jag rekommenderar detta varmt till alla.', author: 'Anna Bergström', role: 'Lärare, Göteborg', avatar: '' },
        ],
        style: 'card',
        showQuoteIcon: true,
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
        displayMode: { type: 'select', label: 'Display mode', options: [{ label: 'Single', value: 'single' }, { label: 'Carousel', value: 'carousel' }, { label: 'Grid', value: 'grid' }] },
        autoPlaySpeed: { type: 'number', label: 'Auto-play speed (seconds)', min: 1, max: 30 },
        style: { type: 'select', label: 'Card style', options: [{ label: 'Card', value: 'card' }, { label: 'Minimal', value: 'minimal' }, { label: 'Featured', value: 'featured' }] },
        showQuoteIcon: { type: 'radio', label: 'Show quote icon', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: Testimonial as any,
    },
    ButtonGroup: {
      label: 'Buttons',
      defaultProps: { buttons: [{ text: 'Primary button', link: '/', variant: 'primary' }], alignment: 'center', direction: 'horizontal', size: 'medium' },
      fields: {
        buttons: { type: 'array', label: 'Buttons', arrayFields: { text: { type: 'text', label: 'Text' }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } }, variant: { type: 'select', label: 'Variant', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }] } } },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        direction: { type: 'radio', label: 'Direction', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        size: { type: 'select', label: 'Size', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ buttons, alignment, direction, size }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <ButtonGroup buttons={buttons} alignment={alignment} direction={direction} size={size} />
        </div>
      ),
    },
    PricingTable: {
      label: 'Pricing Table',
      defaultProps: { heading: '', items: [], columns: 2, highlightLabel: 'Populärt val', emptyText: 'Add pricing plans in settings...', showCurrency: true },
      fields: {
        items: { type: 'array', label: 'Plans', arrayFields: { name: { type: 'text', label: 'Name' }, price: { type: 'text', label: 'Price' }, description: { type: 'textarea', label: 'Description' }, features: { type: 'textarea', label: 'Features (one per line)' }, highlighted: { type: 'radio', label: 'Highlighted', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }, ctaText: { type: 'text', label: 'Button text' }, ctaLink: { type: 'text', label: 'Button link', metadata: { isPagePicker: true } } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        highlightLabel: { type: 'text', label: 'Highlight label' },
        showCurrency: { type: 'radio', label: 'Show currency (kr)', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: PricingTable as any,
    },

    // ── Media ──
    ImageGallery: {
      label: 'Image Gallery',
      defaultProps: { images: [{ src: '', alt: 'Image 1', caption: '' }, { src: '', alt: 'Image 2', caption: '' }, { src: '', alt: 'Image 3', caption: '' }], columns: 3, gap: 'medium', aspectRatio: 'landscape', rounded: 'medium', lightbox: false },
      fields: {
        images: { type: 'array', label: 'Images', arrayFields: { src: { type: 'text', label: 'Image URL', metadata: { isImage: true } }, alt: { type: 'text', label: 'Alt text' }, caption: { type: 'text', label: 'Caption' } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        gap: { type: 'select', label: 'Gap', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: 'Square', value: 'square' }, { label: 'Landscape', value: 'landscape' }, { label: 'Portrait', value: 'portrait' }, { label: 'Auto', value: 'auto' }] },
        rounded: { type: 'radio', label: 'Corners', options: [{ label: 'None', value: 'none' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        lightbox: { type: 'radio', label: 'Lightbox on click', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: ImageGallery as any,
    },
    VideoEmbed: {
      label: 'Video',
      defaultProps: { url: '', aspectRatio: '16:9', caption: '' },
      fields: {
        url: { type: 'text', label: 'Video URL' },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
        caption: { type: 'text', label: 'Caption' },
      },
      render: VideoEmbed as any,
    },
    AudioEmbed: {
      label: 'Audio',
      defaultProps: { url: '', caption: '', style: 'minimal' },
      fields: {
        url: { type: 'text', label: 'Audio URL' },
        caption: { type: 'text', label: 'Caption' },
        style: { type: 'select', label: 'Style', options: [{ label: 'Minimal', value: 'minimal' }, { label: 'Card', value: 'card' }] },
      },
      render: AudioEmbed as any,
    },
    FileEmbed: {
      label: 'File / Document',
      defaultProps: { url: '', fileName: '', caption: '', showPreview: true },
      fields: {
        url: { type: 'text', label: 'File URL' },
        fileName: { type: 'text', label: 'File name' },
        caption: { type: 'text', label: 'Caption' },
        showPreview: { type: 'radio', label: 'Show preview', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: FileEmbed as any,
    },
    EmbedBlock: {
      label: 'Embed',
      defaultProps: { url: '', html: '', caption: '', aspectRatio: 'auto' },
      fields: {
        url: { type: 'text', label: 'Embed URL' },
        html: { type: 'textarea', label: 'Embed HTML' },
        caption: { type: 'text', label: 'Caption' },
        aspectRatio: { type: 'select', label: 'Aspect ratio', options: [{ label: 'Auto', value: 'auto' }, { label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
      },
      render: EmbedBlock as any,
    },

    // ── Dynamic ──
    CourseList: {
      label: 'Course List',
      defaultProps: { heading: '', maxItems: 0, columns: 2, showBookButton: true, compactMode: false, showLocation: true, showPrice: true, readMoreText: 'Läs mer', bookButtonText: 'Boka plats', fullLabel: 'Fullbokat', spotsText: 'platser kvar', emptyText: 'Inga utbildningar planerade just nu.' },
      fields: {
        maxItems: { type: 'number', label: 'Max items (0 = all)' },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        showBookButton: { type: 'radio', label: 'Show book button', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        compactMode: { type: 'radio', label: 'Compact mode', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showLocation: { type: 'radio', label: 'Show location', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showPrice: { type: 'radio', label: 'Show price', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        readMoreText: { type: 'text', label: 'Read more text' },
        bookButtonText: { type: 'text', label: 'Book button text' },
        fullLabel: { type: 'text', label: 'Full label' },
        spotsText: { type: 'text', label: 'Spots remaining text' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: CourseList as any,
    },
    ProductList: {
      label: 'Product List',
      defaultProps: { heading: '', filterType: '', columns: 3, showImage: true, showPrice: true, buyButtonText: 'Köp', freeLabel: 'Gratis', outOfStockLabel: 'Slut i lager', emptyText: 'Inga produkter hittades.' },
      fields: {
        filterType: { type: 'select', label: 'Filter by type', options: [{ label: 'All', value: '' }, { label: 'Books', value: 'book' }, { label: 'CDs', value: 'cd' }, { label: 'Cards', value: 'cards' }, { label: 'Apps', value: 'app' }, { label: 'Downloads', value: 'download' }] },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        showImage: { type: 'radio', label: 'Show image', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showPrice: { type: 'radio', label: 'Show price', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        buyButtonText: { type: 'text', label: 'Buy button text' },
        freeLabel: { type: 'text', label: 'Free label' },
        outOfStockLabel: { type: 'text', label: 'Out of stock label' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: ProductList as any,
    },
    PostGrid: {
      label: 'Post Grid',
      defaultProps: { heading: '', subheading: '', count: 3, columns: 3, showImage: true, showExcerpt: true, showDate: true, emptyText: 'Inga inlägg hittades' },
      fields: {
        count: { type: 'number', label: 'Number of posts', min: 1, max: 12 },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showImage: { type: 'radio', label: 'Show image', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showExcerpt: { type: 'radio', label: 'Show excerpt', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showDate: { type: 'radio', label: 'Show date', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: PostGrid as any,
    },
    PageCards: {
      label: 'Page Cards',
      defaultProps: { heading: '', parentSlug: '', manualPages: [], columns: 3, showDescription: true, style: 'card', emptyText: 'Inga undersidor hittades', emptyManualText: 'Add pages manually or specify a parent page' },
      fields: {
        parentSlug: { type: 'text', label: 'Show child pages of', metadata: { isPagePicker: true } },
        manualPages: { type: 'array', label: 'Or pick pages manually', arrayFields: { slug: { type: 'text', label: 'Page', metadata: { isPagePicker: true } } } },
        columns: { type: 'select', label: 'Columns', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showDescription: { type: 'radio', label: 'Show description', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Card', value: 'card' }, { label: 'List', value: 'list' }, { label: 'Minimal', value: 'minimal' }] },
        emptyText: { type: 'text', label: 'Empty text (with parent)' },
        emptyManualText: { type: 'text', label: 'Empty text (manual)' },
      },
      render: PageCards as any,
    },
    NavigationMenu: {
      label: 'Navigation Menu',
      defaultProps: { items: [{ label: 'Home', link: '/' }], layout: 'horizontal', style: 'pills', alignment: 'center' },
      fields: {
        items: { type: 'array', label: 'Menu items', arrayFields: { label: { type: 'text', label: 'Label' }, link: { type: 'text', label: 'Link', metadata: { isPagePicker: true } } } },
        layout: { type: 'radio', label: 'Layout', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        style: { type: 'select', label: 'Style', options: [{ label: 'Pills', value: 'pills' }, { label: 'Underline', value: 'underline' }, { label: 'Buttons', value: 'buttons' }, { label: 'Minimal', value: 'minimal' }] },
        alignment: { type: 'radio', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      },
      render: NavigationMenu as any,
    },

    // ── Interactive ──
    ContactForm: {
      label: 'Contact Form',
      defaultProps: { heading: 'Contact us', description: 'Have questions? Get in touch and we will get back to you as soon as possible.', showPhone: true, showSubject: true, layout: 'full', contactName: 'Fredrik Livheim', contactTitle: 'Licensed psychologist and ACT trainer', contactEmail: 'livheim@gmail.com', contactPhone: '070-694 03 64', submitButtonText: 'Send message', submittingText: 'Sending...', successHeading: 'Thank you for your message!', successMessage: 'We will get back to you as soon as possible.', nameLabel: 'Name *', emailLabel: 'Email *', phoneLabel: 'Phone', subjectLabel: 'Subject', messageLabel: 'Message *' },
      fields: {
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
      render: ContactForm as any,
    },
    BookingForm: {
      label: 'Booking Form',
      defaultProps: { showOrganization: true, showNotes: true, submitButtonText: 'Go to payment', processingText: 'Processing...', fullMessage: 'This course is fully booked.', completedMessage: 'This course has been completed.', totalLabel: 'Total', nameLabel: 'Name *', emailLabel: 'Email *', phoneLabel: 'Phone', organizationLabel: 'Organization', participantsLabel: 'Number of participants *', notesLabel: 'Notes', priceSuffix: 'kr/person' },
      fields: {
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
      render: BookingForm as any,
    },

    // ── Data-bound ──
    CourseInfo: {
      label: 'Course Info',
      defaultProps: { showDeadline: true, showEmpty: false, layout: 'grid', locationLabel: 'Location', dateLabel: 'Date', priceLabel: 'Price', spotsLabel: 'Spots', deadlineLabel: 'Registration deadline', fullLabel: 'Fully booked', spotsOfText: 'of', spotsRemainingText: 'remaining' },
      fields: {
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
      render: CourseInfo as any,
    },
    BookingCTA: {
      label: 'Booking CTA',
      defaultProps: { style: 'card', buttonText: 'Book spot', heading: 'Interested in joining?', description: 'Book your spot today', completedMessage: 'This course has been completed.', fullMessage: 'This course is fully booked.', fullSubMessage: 'Contact us if you want to be on the waiting list.' },
      fields: {
        style: { type: 'radio', options: [{ label: 'Card', value: 'card' }, { label: 'Inline', value: 'inline' }] },
        buttonText: { type: 'text', label: 'Button text' },
        heading: { type: 'text', label: 'Heading' },
        description: { type: 'text', label: 'Description' },
        completedMessage: { type: 'text', label: 'Completed message' },
        fullMessage: { type: 'text', label: 'Full message' },
        fullSubMessage: { type: 'text', label: 'Full sub-message' },
      },
      render: BookingCTA as any,
    },
    PostHeader: {
      label: 'Post Header',
      defaultProps: { showBackLink: true, backLinkText: 'Alla inlägg', backLinkUrl: '/blog' },
      fields: {
        showBackLink: { type: 'radio', label: 'Show back link', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        backLinkText: { type: 'text', label: 'Back link text' }, backLinkUrl: { type: 'text', label: 'Back link URL', metadata: { isPagePicker: true } },
      },
      render: PostHeader as any,
    },
  },
}

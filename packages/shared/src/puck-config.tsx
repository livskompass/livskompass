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

interface SiteHeaderConfig {
  logoText: string
  navItems: { label: string; href: string; children?: { label: string; href: string }[] }[]
  ctaButton?: { text: string; href: string }
}

interface SiteFooterConfig {
  companyName: string
  tagline: string
  contactHeading?: string
  contact: { email: string; phone: string }
  columns: { heading: string; links: { label: string; href: string }[] }[]
  copyright: string
}

const defaultHeader: SiteHeaderConfig = {
  logoText: 'Livskompass',
  navItems: [
    { label: 'ACT', href: '/act' },
    { label: 'Utbildningar', href: '/utbildningar' },
    { label: 'Material', href: '/material' },
    { label: 'Om oss', href: '#', children: [
      { label: 'Mindfulness', href: '/mindfulness' },
      { label: 'Forskning på metoden', href: '/forskning-pa-metoden' },
      { label: 'Om Fredrik Livheim', href: '/om-fredrik-livheim' },
    ] },
    { label: 'Kontakt', href: '/kontakt' },
    { label: 'Nyheter', href: '/nyhet' },
  ],
}

const defaultFooter: SiteFooterConfig = {
  companyName: 'Livskompass',
  tagline: 'ACT och mindfulness utbildningar med Fredrik Livheim',
  contact: { email: 'livheim@gmail.com', phone: '070-694 03 64' },
  columns: [
    {
      heading: 'Länkar',
      links: [
        { label: 'ACT', href: '/act' },
        { label: 'Utbildningar', href: '/utbildningar' },
        { label: 'Material', href: '/material' },
        { label: 'Mindfulness', href: '/mindfulness' },
        { label: 'Forskning', href: '/forskning-pa-metoden' },
        { label: 'Om Fredrik', href: '/om-fredrik-livheim' },
        { label: 'Kontakt', href: '/kontakt' },
        { label: 'Nyheter', href: '/nyhet' },
      ],
    },
  ],
  copyright: '© {year} Livskompass. Alla rättigheter förbehållna.',
}

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
    render: ({ children }: { children: React.ReactNode }) => {
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
    media: { title: 'Media', components: ['ImageGallery', 'VideoEmbed'] },
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
        layout: { type: 'select', options: [{ label: '50/50', value: '50-50' }, { label: '33/33/33', value: '33-33-33' }, { label: '66/33', value: '66-33' }, { label: '33/66', value: '33-66' }] },
        gap: { type: 'select', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        verticalAlignment: { type: 'select', options: [{ label: 'Top', value: 'top' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'bottom' }] },
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
        subheading: 'Underrubrik här',
        bgStyle: 'gradient',
        ctaPrimaryText: '',
        ctaPrimaryLink: '',
        ctaSecondaryText: '',
        ctaSecondaryLink: '',
        image: '',
        backgroundImage: '',
        overlayDarkness: 'medium',
      },
      fields: {
        preset: {
          type: 'select',
          label: 'Preset',
          options: [
            { label: 'Centered', value: 'centered' },
            { label: 'Split Image Right', value: 'split-right' },
            { label: 'Split Image Left', value: 'split-left' },
            { label: 'Full Image', value: 'full-image' },
            { label: 'Minimal', value: 'minimal' },
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
        ctaPrimaryLink: { type: 'text', label: 'Primary button link' },
        ctaSecondaryText: { type: 'text', label: 'Secondary button text' },
        ctaSecondaryLink: { type: 'text', label: 'Secondary button link' },
        image: { type: 'text', label: 'Image URL' },
        backgroundImage: { type: 'text', label: 'Background image URL' },
        overlayDarkness: {
          type: 'select',
          label: 'Overlay darkness',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Medium', value: 'medium' },
            { label: 'Heavy', value: 'heavy' },
          ],
        },
      },
      resolveFields: (data: any) => {
        const p = data.props?.preset || 'centered'
        const base = {
          preset: {
            type: 'select' as const,
            label: 'Preset',
            options: [
              { label: 'Centered', value: 'centered' },
              { label: 'Split Image Right', value: 'split-right' },
              { label: 'Split Image Left', value: 'split-left' },
              { label: 'Full Image', value: 'full-image' },
              { label: 'Minimal', value: 'minimal' },
            ],
          },
          heading: { type: 'text' as const, label: 'Heading' },
          subheading: { type: 'textarea' as const, label: 'Subheading' },
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
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link' },
            ctaSecondaryText: { type: 'text' as const, label: 'Secondary button text' },
            ctaSecondaryLink: { type: 'text' as const, label: 'Secondary button link' },
          }
        }
        if (p === 'split-right' || p === 'split-left') {
          return {
            ...base,
            image: { type: 'text' as const, label: 'Image URL' },
            ctaPrimaryText: { type: 'text' as const, label: 'Primary button text' },
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link' },
          }
        }
        if (p === 'full-image') {
          return {
            ...base,
            backgroundImage: { type: 'text' as const, label: 'Background image URL' },
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
            ctaPrimaryLink: { type: 'text' as const, label: 'Primary button link' },
          }
        }
        // minimal — just heading + subheading
        return base
      },
      render: Hero as any,
    },
    RichText: {
      label: 'Rich Text',
      defaultProps: { content: '<p>Skriv ditt innehåll här...</p>', maxWidth: 'medium' },
      fields: {
        content: { type: 'textarea' },
        maxWidth: { type: 'select', options: [{ label: 'Narrow (65ch)', value: 'narrow' }, { label: 'Medium (80ch)', value: 'medium' }, { label: 'Full', value: 'full' }] },
      },
      render: ({ content, maxWidth, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <RichText content={content} maxWidth={maxWidth} id={id} />
        </div>
      ),
    },
    ImageBlock: {
      label: 'Image',
      defaultProps: { src: '', alt: '', caption: '', size: 'full', alignment: 'center', rounded: 'small', link: '' },
      fields: {
        src: { type: 'text' }, alt: { type: 'text' }, caption: { type: 'text' },
        size: { type: 'select', options: [{ label: 'Small (50%)', value: 'small' }, { label: 'Medium (75%)', value: 'medium' }, { label: 'Full', value: 'full' }] },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        rounded: { type: 'radio', options: [{ label: 'None', value: 'none' }, { label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        link: { type: 'text' },
      },
      render: ({ src, alt, caption, size, alignment, rounded, link, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <ImageBlock src={src} alt={alt} caption={caption} size={size} alignment={alignment} rounded={rounded} link={link} id={id} />
        </div>
      ),
    },
    Accordion: {
      label: 'Accordion / FAQ',
      defaultProps: { heading: '', items: [{ question: 'Fråga här', answer: 'Svar här' }], defaultOpen: 'none', style: 'default' },
      fields: {
        heading: { type: 'text' },
        items: { type: 'array', arrayFields: { question: { type: 'text' }, answer: { type: 'textarea' } } },
        defaultOpen: { type: 'select', options: [{ label: 'None', value: 'none' }, { label: 'First', value: 'first' }, { label: 'All', value: 'all' }] },
        style: { type: 'select', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal', value: 'minimal' }] },
      },
      render: ({ heading, items, defaultOpen, style, id }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <Accordion heading={heading} items={items} defaultOpen={defaultOpen} style={style} id={id} />
        </div>
      ),
    },
    PageHeader: {
      label: 'Page Header',
      defaultProps: { heading: 'Rubrik', subheading: '', alignment: 'left', size: 'large', showDivider: false, breadcrumbs: [] },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'textarea' },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        size: { type: 'radio', options: [{ label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        showDivider: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        breadcrumbs: { type: 'array', arrayFields: { label: { type: 'text' }, href: { type: 'text' } } },
      },
      render: PageHeader as any,
    },
    PersonCard: {
      label: 'Person Card',
      defaultProps: { name: 'Fredrik Livheim', title: 'Legitimerad psykolog', bio: '', image: '', email: '', phone: '', style: 'horizontal' },
      fields: {
        name: { type: 'text' }, title: { type: 'text' }, bio: { type: 'textarea' },
        image: { type: 'text' }, email: { type: 'text' }, phone: { type: 'text' },
        style: { type: 'radio', options: [{ label: 'Card', value: 'card' }, { label: 'Horizontal', value: 'horizontal' }] },
      },
      render: PersonCard as any,
    },
    FeatureGrid: {
      label: 'Feature Grid',
      defaultProps: { heading: '', subheading: '', columns: 3, items: [], style: 'cards' },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'textarea' },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        items: { type: 'array', arrayFields: { icon: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } } },
        style: { type: 'radio', options: [{ label: 'Cards', value: 'cards' }, { label: 'Minimal', value: 'minimal' }] },
      },
      render: FeatureGrid as any,
    },
    StatsCounter: {
      label: 'Stats Counter',
      defaultProps: { items: [], columns: 4, style: 'default' },
      fields: {
        items: { type: 'array', arrayFields: { value: { type: 'text' }, label: { type: 'text' }, prefix: { type: 'text' }, suffix: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        style: { type: 'radio', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }] },
      },
      render: StatsCounter as any,
    },

    // ── Marketing ──
    CTABanner: {
      label: 'CTA Banner',
      defaultProps: { heading: 'Redo att börja?', description: 'Boka din plats på nästa utbildning', buttonText: 'Boka nu', buttonLink: '/utbildningar', backgroundColor: 'primary', alignment: 'center' },
      fields: {
        heading: { type: 'text' }, description: { type: 'textarea' }, buttonText: { type: 'text' }, buttonLink: { type: 'text' },
        backgroundColor: { type: 'select', options: [{ label: 'Primary (green)', value: 'primary' }, { label: 'Gradient', value: 'gradient' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
      },
      render: ({ heading, description, buttonText, buttonLink, backgroundColor, alignment, id }: any) => (
        <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
          <CTABanner heading={heading} description={description} buttonText={buttonText} buttonLink={buttonLink} backgroundColor={backgroundColor} alignment={alignment} id={id} />
        </div>
      ),
    },
    CardGrid: {
      label: 'Card Grid',
      defaultProps: { heading: '', subheading: '', source: 'manual', maxItems: 3, columns: 3, cardStyle: 'default', manualCards: [] },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'text' },
        source: { type: 'select', options: [{ label: 'Manual', value: 'manual' }, { label: 'Posts', value: 'posts' }, { label: 'Courses', value: 'courses' }, { label: 'Products', value: 'products' }] },
        maxItems: { type: 'number' },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        manualCards: { type: 'array', arrayFields: { title: { type: 'text' }, description: { type: 'textarea' }, image: { type: 'text' }, link: { type: 'text' }, badge: { type: 'text' } } },
        cardStyle: { type: 'select', options: [{ label: 'Default', value: 'default' }, { label: 'Bordered', value: 'bordered' }, { label: 'Shadow', value: 'shadow' }] },
      },
      render: CardGrid as any,
    },
    Testimonial: {
      label: 'Testimonial',
      defaultProps: { quote: 'Ett fantastiskt citat här...', author: '', role: '', avatar: '', style: 'card' },
      fields: {
        quote: { type: 'textarea' }, author: { type: 'text' }, role: { type: 'text' }, avatar: { type: 'text' },
        style: { type: 'select', options: [{ label: 'Card', value: 'card' }, { label: 'Minimal', value: 'minimal' }, { label: 'Featured', value: 'featured' }] },
      },
      render: Testimonial as any,
    },
    ButtonGroup: {
      label: 'Buttons',
      defaultProps: { buttons: [{ text: 'Primär knapp', link: '/', variant: 'primary' }], alignment: 'center', direction: 'horizontal', size: 'medium' },
      fields: {
        buttons: { type: 'array', arrayFields: { text: { type: 'text' }, link: { type: 'text' }, variant: { type: 'select', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Outline', value: 'outline' }] } } },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        direction: { type: 'radio', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        size: { type: 'select', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
      },
      render: ({ buttons, alignment, direction, size }: any) => (
        <div className="max-w-4xl mx-auto" style={{ paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-xs)' }}>
          <ButtonGroup buttons={buttons} alignment={alignment} direction={direction} size={size} />
        </div>
      ),
    },
    PricingTable: {
      label: 'Pricing Table',
      defaultProps: { heading: '', items: [], columns: 2, highlightLabel: 'Populärt val', emptyText: 'Lägg till priser i inställningarna...' },
      fields: {
        heading: { type: 'text' },
        items: { type: 'array', arrayFields: { name: { type: 'text' }, price: { type: 'text' }, description: { type: 'textarea' }, features: { type: 'textarea' }, highlighted: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }, ctaText: { type: 'text' }, ctaLink: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        highlightLabel: { type: 'text', label: 'Highlight label' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: PricingTable as any,
    },

    // ── Media ──
    ImageGallery: {
      label: 'Image Gallery',
      defaultProps: { images: [], columns: 3, gap: 'medium', aspectRatio: 'landscape' },
      fields: {
        images: { type: 'array', arrayFields: { src: { type: 'text' }, alt: { type: 'text' }, caption: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        gap: { type: 'select', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }] },
        aspectRatio: { type: 'select', options: [{ label: 'Square', value: 'square' }, { label: 'Landscape', value: 'landscape' }, { label: 'Portrait', value: 'portrait' }, { label: 'Auto', value: 'auto' }] },
      },
      render: ImageGallery as any,
    },
    VideoEmbed: {
      label: 'Video',
      defaultProps: { url: '', aspectRatio: '16:9', caption: '' },
      fields: {
        url: { type: 'text' },
        aspectRatio: { type: 'select', options: [{ label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
        caption: { type: 'text' },
      },
      render: VideoEmbed as any,
    },

    // ── Dynamic ──
    CourseList: {
      label: 'Course List',
      defaultProps: { heading: '', maxItems: 0, columns: 2, showBookButton: true, compactMode: false, readMoreText: 'Läs mer', bookButtonText: 'Boka plats', fullLabel: 'Fullbokad', emptyText: 'Det finns inga utbildningar planerade just nu.' },
      fields: {
        heading: { type: 'text' },
        maxItems: { type: 'number' },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        showBookButton: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        compactMode: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        readMoreText: { type: 'text', label: 'Read more text' },
        bookButtonText: { type: 'text', label: 'Book button text' },
        fullLabel: { type: 'text', label: 'Full label' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: CourseList as any,
    },
    ProductList: {
      label: 'Product List',
      defaultProps: { heading: '', filterType: '', columns: 3, buyButtonText: 'Köp', freeLabel: 'Gratis', outOfStockLabel: 'Slut i lager', emptyText: 'Inga produkter hittades.' },
      fields: {
        heading: { type: 'text' },
        filterType: { type: 'select', options: [{ label: 'All', value: '' }, { label: 'Books', value: 'book' }, { label: 'CDs', value: 'cd' }, { label: 'Cards', value: 'cards' }, { label: 'Apps', value: 'app' }, { label: 'Downloads', value: 'download' }] },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        buyButtonText: { type: 'text', label: 'Buy button text' },
        freeLabel: { type: 'text', label: 'Free label' },
        outOfStockLabel: { type: 'text', label: 'Out of stock label' },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: ProductList as any,
    },
    PostGrid: {
      label: 'Post Grid',
      defaultProps: { heading: '', subheading: '', count: 3, columns: 3, showImage: true, showExcerpt: true, showDate: true, cardStyle: 'default', emptyText: 'Inga inlägg hittades' },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'text' },
        count: { type: 'number', min: 1, max: 12 },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showImage: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showExcerpt: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showDate: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        emptyText: { type: 'text', label: 'Empty text' },
      },
      render: PostGrid as any,
    },
    PageCards: {
      label: 'Page Cards',
      defaultProps: { heading: '', parentSlug: '', manualPages: [], columns: 3, showDescription: true, style: 'card', emptyText: 'Inga undersidor hittades', emptyManualText: 'Lägg till sidor manuellt eller ange en föräldersida' },
      fields: {
        heading: { type: 'text' }, parentSlug: { type: 'text' },
        manualPages: { type: 'array', arrayFields: { title: { type: 'text' }, description: { type: 'text' }, slug: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showDescription: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        style: { type: 'select', options: [{ label: 'Card', value: 'card' }, { label: 'List', value: 'list' }, { label: 'Minimal', value: 'minimal' }] },
        emptyText: { type: 'text', label: 'Empty text (with parent)' },
        emptyManualText: { type: 'text', label: 'Empty text (manual)' },
      },
      render: PageCards as any,
    },
    NavigationMenu: {
      label: 'Navigation Menu',
      defaultProps: { items: [{ label: 'Home', link: '/' }], layout: 'horizontal', style: 'pills', alignment: 'center' },
      fields: {
        items: { type: 'array', arrayFields: { label: { type: 'text' }, link: { type: 'text' } } },
        layout: { type: 'radio', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        style: { type: 'select', options: [{ label: 'Pills', value: 'pills' }, { label: 'Underline', value: 'underline' }, { label: 'Buttons', value: 'buttons' }, { label: 'Minimal', value: 'minimal' }] },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      },
      render: NavigationMenu as any,
    },

    // ── Interactive ──
    ContactForm: {
      label: 'Contact Form',
      defaultProps: { heading: 'Kontakta oss', description: 'Har du frågor? Hör av dig så återkommer vi så snart vi kan.', showPhone: true, showSubject: true, layout: 'full', contactName: 'Fredrik Livheim', contactTitle: 'Legitimerad psykolog och ACT-utbildare', contactEmail: 'livheim@gmail.com', contactPhone: '070-694 03 64', submitButtonText: 'Skicka meddelande', successHeading: 'Tack för ditt meddelande!', successMessage: 'Vi återkommer så snart vi kan.' },
      fields: {
        heading: { type: 'text' }, description: { type: 'textarea' },
        showPhone: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showSubject: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', options: [{ label: 'Full', value: 'full' }, { label: 'Split', value: 'split' }] },
        contactName: { type: 'text' }, contactTitle: { type: 'text' }, contactEmail: { type: 'text' }, contactPhone: { type: 'text' },
        submitButtonText: { type: 'text', label: 'Submit button text' },
        successHeading: { type: 'text', label: 'Success heading' },
        successMessage: { type: 'text', label: 'Success message' },
      },
      render: ContactForm as any,
    },
    BookingForm: {
      label: 'Booking Form',
      defaultProps: { showOrganization: true, showNotes: true, submitButtonText: 'Gå till betalning', processingText: 'Bearbetar...', fullMessage: 'Denna utbildning är fullbokad.', completedMessage: 'Denna utbildning har genomförts.', totalLabel: 'Totalt' },
      fields: {
        showOrganization: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showNotes: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        submitButtonText: { type: 'text', label: 'Submit button text' },
        processingText: { type: 'text', label: 'Processing text' },
        fullMessage: { type: 'text', label: 'Full message' },
        completedMessage: { type: 'text', label: 'Completed message' },
        totalLabel: { type: 'text', label: 'Total label' },
      },
      render: BookingForm as any,
    },

    // ── Data-bound ──
    CourseInfo: {
      label: 'Course Info',
      defaultProps: { showDeadline: true, layout: 'grid', locationLabel: 'Plats', dateLabel: 'Datum', priceLabel: 'Pris', spotsLabel: 'Platser', deadlineLabel: 'Sista anmälningsdag', fullLabel: 'Fullbokad' },
      fields: {
        showDeadline: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', options: [{ label: 'Grid', value: 'grid' }, { label: 'Stacked', value: 'stacked' }] },
        locationLabel: { type: 'text', label: 'Location label' },
        dateLabel: { type: 'text', label: 'Date label' },
        priceLabel: { type: 'text', label: 'Price label' },
        spotsLabel: { type: 'text', label: 'Spots label' },
        deadlineLabel: { type: 'text', label: 'Deadline label' },
        fullLabel: { type: 'text', label: 'Full label' },
      },
      render: CourseInfo as any,
    },
    BookingCTA: {
      label: 'Booking CTA',
      defaultProps: { style: 'card', buttonText: 'Boka plats', heading: 'Intresserad av att delta?', description: 'Boka din plats redan idag', completedMessage: 'Denna utbildning har genomförts.', fullMessage: 'Denna utbildning är fullbokad.', fullSubMessage: 'Kontakta oss om du vill ställas i kö.' },
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
      defaultProps: { showBackLink: true, backLinkText: 'Alla inlägg', backLinkUrl: '/nyhet' },
      fields: {
        showBackLink: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        backLinkText: { type: 'text' }, backLinkUrl: { type: 'text' },
      },
      render: PostHeader as any,
    },
  },
}

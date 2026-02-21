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

// ── Site chrome for Puck editor preview ──

const navLinks = [
  { name: 'ACT', href: '/act' },
  { name: 'Utbildningar', href: '/utbildningar' },
  { name: 'Material', href: '/material' },
  { name: 'Mindfulness', href: '/mindfulness' },
  { name: 'Forskning på metoden', href: '/forskning-pa-metoden' },
  { name: 'Om Fredrik Livheim', href: '/om-fredrik-livheim' },
  { name: 'Kontakt', href: '/kontakt' },
  { name: 'Nyheter', href: '/nyhet' },
]

function SiteHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-neutral-200/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <a href="/" className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold text-primary-600">Livskompass</span>
            </a>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className="text-sm transition-colors whitespace-nowrap text-neutral-600 hover:text-primary-600">
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Livskompass</h3>
            <p className="text-neutral-400 leading-relaxed">ACT och mindfulness utbildningar med Fredrik Livheim</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Kontakt</h3>
            <p className="text-neutral-400 leading-relaxed">Fredrik Livheim<br />livheim@gmail.com<br />070-694 03 64</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Länkar</h3>
            <ul className="space-y-2">
              {navLinks.map((item) => (
                <li key={item.name}><a href={item.href} className="text-neutral-400 hover:text-white transition-colors text-sm">{item.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Livskompass. Alla rättigheter förbehållna.</p>
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
        <div className="min-h-screen flex flex-col bg-neutral-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
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
      defaultProps: { heading: 'Rubrik här', subheading: 'Underrubrik här', variant: 'gradient', backgroundColor: 'primary', backgroundImage: '', textAlignment: 'center', ctaPrimaryText: '', ctaPrimaryLink: '', ctaSecondaryText: '', ctaSecondaryLink: '', fullHeight: 'auto' },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'textarea' },
        variant: { type: 'select', options: [{ label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }, { label: 'Solid', value: 'solid' }] },
        backgroundColor: { type: 'select', options: [{ label: 'Primary (green)', value: 'primary' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
        backgroundImage: { type: 'text' },
        textAlignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        ctaPrimaryText: { type: 'text' }, ctaPrimaryLink: { type: 'text' }, ctaSecondaryText: { type: 'text' }, ctaSecondaryLink: { type: 'text' },
        fullHeight: { type: 'radio', options: [{ label: 'Full viewport', value: 'full-viewport' }, { label: 'Auto', value: 'auto' }] },
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
      render: ({ content, maxWidth }: any) => (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RichText content={content} maxWidth={maxWidth} />
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
      render: ({ src, alt, caption, size, alignment, rounded, link }: any) => (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ImageBlock src={src} alt={alt} caption={caption} size={size} alignment={alignment} rounded={rounded} link={link} />
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
      render: ({ heading, items, defaultOpen, style }: any) => (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Accordion heading={heading} items={items} defaultOpen={defaultOpen} style={style} />
        </div>
      ),
    },
    PageHeader: {
      label: 'Page Header',
      defaultProps: { heading: 'Rubrik', subheading: '', alignment: 'left', size: 'large', showDivider: false },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'textarea' },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        size: { type: 'radio', options: [{ label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
        showDivider: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
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
      defaultProps: { heading: 'Redo att börja?', description: 'Boka din plats på nästa utbildning', buttonText: 'Boka nu', buttonLink: '/utbildningar', variant: 'primary', backgroundColor: 'primary', alignment: 'center', fullWidth: true },
      fields: {
        heading: { type: 'text' }, description: { type: 'textarea' }, buttonText: { type: 'text' }, buttonLink: { type: 'text' },
        backgroundColor: { type: 'select', options: [{ label: 'Primary (green)', value: 'primary' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
        alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
      },
      render: ({ heading, description, buttonText, buttonLink, variant, backgroundColor, alignment, fullWidth }: any) => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <CTABanner heading={heading} description={description} buttonText={buttonText} buttonLink={buttonLink} variant={variant} backgroundColor={backgroundColor} alignment={alignment} fullWidth={fullWidth} />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ButtonGroup buttons={buttons} alignment={alignment} direction={direction} size={size} />
        </div>
      ),
    },
    PricingTable: {
      label: 'Pricing Table',
      defaultProps: { heading: '', items: [], columns: 2 },
      fields: {
        heading: { type: 'text' },
        items: { type: 'array', arrayFields: { name: { type: 'text' }, price: { type: 'text' }, description: { type: 'textarea' }, features: { type: 'textarea' }, highlighted: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }, ctaText: { type: 'text' }, ctaLink: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
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
      defaultProps: { heading: '', maxItems: 0, columns: 2, showBookButton: true, compactMode: false },
      fields: {
        heading: { type: 'text' },
        maxItems: { type: 'number' },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
        showBookButton: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        compactMode: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: CourseList as any,
    },
    ProductList: {
      label: 'Product List',
      defaultProps: { heading: '', filterType: '', columns: 3 },
      fields: {
        heading: { type: 'text' },
        filterType: { type: 'select', options: [{ label: 'All', value: '' }, { label: 'Books', value: 'book' }, { label: 'CDs', value: 'cd' }, { label: 'Cards', value: 'cards' }, { label: 'Apps', value: 'app' }, { label: 'Downloads', value: 'download' }] },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }] },
      },
      render: ProductList as any,
    },
    PostGrid: {
      label: 'Post Grid',
      defaultProps: { heading: '', subheading: '', count: 3, columns: 3, showImage: true, showExcerpt: true, showDate: true, cardStyle: 'default' },
      fields: {
        heading: { type: 'text' }, subheading: { type: 'text' },
        count: { type: 'number', min: 1, max: 12 },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showImage: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showExcerpt: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showDate: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: PostGrid as any,
    },
    PageCards: {
      label: 'Page Cards',
      defaultProps: { heading: '', parentSlug: '', manualPages: [], columns: 3, showDescription: true, style: 'card' },
      fields: {
        heading: { type: 'text' }, parentSlug: { type: 'text' },
        manualPages: { type: 'array', arrayFields: { title: { type: 'text' }, description: { type: 'text' }, slug: { type: 'text' } } },
        columns: { type: 'select', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }] },
        showDescription: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        style: { type: 'select', options: [{ label: 'Card', value: 'card' }, { label: 'List', value: 'list' }, { label: 'Minimal', value: 'minimal' }] },
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
      defaultProps: { heading: 'Kontakta oss', description: 'Har du frågor? Hör av dig så återkommer vi så snart vi kan.', showPhone: true, showSubject: true, layout: 'full', contactName: 'Fredrik Livheim', contactTitle: 'Legitimerad psykolog och ACT-utbildare', contactEmail: 'livheim@gmail.com', contactPhone: '070-694 03 64' },
      fields: {
        heading: { type: 'text' }, description: { type: 'textarea' },
        showPhone: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showSubject: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', options: [{ label: 'Full', value: 'full' }, { label: 'Split', value: 'split' }] },
        contactName: { type: 'text' }, contactTitle: { type: 'text' }, contactEmail: { type: 'text' }, contactPhone: { type: 'text' },
      },
      render: ContactForm as any,
    },
    BookingForm: {
      label: 'Booking Form',
      defaultProps: { showOrganization: true, showNotes: true },
      fields: {
        showOrganization: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        showNotes: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      render: BookingForm as any,
    },

    // ── Data-bound ──
    CourseInfo: {
      label: 'Course Info',
      defaultProps: { showDeadline: true, layout: 'grid' },
      fields: {
        showDeadline: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        layout: { type: 'radio', options: [{ label: 'Grid', value: 'grid' }, { label: 'Stacked', value: 'stacked' }] },
      },
      render: CourseInfo as any,
    },
    BookingCTA: {
      label: 'Booking CTA',
      defaultProps: { style: 'card' },
      fields: {
        style: { type: 'radio', options: [{ label: 'Card', value: 'card' }, { label: 'Inline', value: 'inline' }] },
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

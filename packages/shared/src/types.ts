// Block prop interfaces for Puck components

export interface HeroProps {
  heading: string
  subheading: string
  variant: 'gradient' | 'image' | 'solid'
  backgroundColor: string
  backgroundImage?: string
  textAlignment: 'left' | 'center' | 'right'
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  fullHeight: 'full-viewport' | 'auto'
}

export interface RichTextProps {
  content: string
  maxWidth: 'narrow' | 'medium' | 'full'
}

export interface ImageBlockProps {
  src: string
  alt: string
  caption: string
  size: 'small' | 'medium' | 'full'
  alignment: 'left' | 'center' | 'right'
  rounded: 'none' | 'small' | 'large'
  link: string
}

export interface CardGridProps {
  heading: string
  subheading: string
  source: 'courses' | 'products' | 'manual'
  maxItems: number
  columns: 2 | 3 | 4
  manualCards: Array<{
    title: string
    description: string
    image: string
    link: string
    badge: string
  }>
  showBadge: boolean
  cardStyle: 'default' | 'bordered' | 'shadow'
}

export interface AccordionProps {
  heading: string
  items: Array<{
    question: string
    answer: string
  }>
  defaultOpen: 'none' | 'first' | 'all'
  style: 'default' | 'bordered' | 'minimal'
}

export interface CTABannerProps {
  heading: string
  description: string
  buttonText: string
  buttonLink: string
  variant: 'primary' | 'secondary' | 'outline'
  backgroundColor: string
  alignment: 'left' | 'center'
  fullWidth: boolean
}

export interface ColumnsProps {
  layout: '50-50' | '33-33-33' | '66-33' | '33-66' | '25-50-25'
  gap: 'small' | 'medium' | 'large'
  verticalAlignment: 'top' | 'center' | 'bottom'
  stackOnMobile: boolean
}

export interface SeparatorBlockProps {
  variant: 'line' | 'dots' | 'space-only'
  spacing: 'small' | 'medium' | 'large' | 'extra-large'
  lineColor: 'light' | 'medium' | 'dark'
  maxWidth: 'narrow' | 'medium' | 'full'
}

export interface ButtonGroupProps {
  buttons: Array<{
    text: string
    link: string
    variant: 'primary' | 'secondary' | 'outline'
  }>
  alignment: 'left' | 'center' | 'right'
  direction: 'horizontal' | 'vertical'
  size: 'small' | 'medium' | 'large'
}

export interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar: string
  style: 'card' | 'minimal' | 'featured'
}

export interface VideoEmbedProps {
  url: string
  aspectRatio: '16:9' | '4:3' | '1:1'
  caption: string
}

export interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption: string
  }>
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
}

export interface ContactFormBlockProps {
  heading: string
  description: string
  showPhone: boolean
  showSubject: boolean
}

export interface PostGridProps {
  heading: string
  subheading: string
  count: number
  columns: 2 | 3 | 4
  showImage: boolean
  showExcerpt: boolean
  showDate: boolean
  cardStyle: 'default' | 'minimal' | 'featured'
}

export interface PageCardsProps {
  heading: string
  parentSlug: string
  manualPages: Array<{
    title: string
    description: string
    slug: string
    icon: string
  }>
  columns: 2 | 3 | 4
  showDescription: boolean
  style: 'card' | 'list' | 'minimal'
}

export interface NavigationMenuProps {
  items: Array<{
    label: string
    link: string
  }>
  layout: 'horizontal' | 'vertical'
  style: 'pills' | 'underline' | 'buttons' | 'minimal'
  alignment: 'left' | 'center' | 'right'
}

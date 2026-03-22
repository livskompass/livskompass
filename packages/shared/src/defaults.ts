// ── Single source of truth for default site header/footer config ──
// Previously triplicated in:
//   - packages/web/src/components/Layout.tsx (lines 13-53)
//   - packages/shared/src/puck-config.tsx (lines 58-94)
//   - packages/admin/src/pages/Settings.tsx (lines 37-77)

export type LogoSize = 'small' | 'medium' | 'large'

export interface SiteHeaderConfig {
  logoText: string
  logoUrl?: string         // URL to logo image/SVG — if set, renders image instead of text
  logoSize?: LogoSize      // small (h-6), medium (h-8, default), large (h-10)
  logoDynamic?: boolean    // SVG follows nav color (filter-based, like text does)
  navItems: { label: string; href: string; children?: { label: string; href: string }[] }[]
  ctaButton?: { text: string; href: string }
  navColor?: string        // Tailwind text color class (e.g., 'text-forest-800', 'text-white')
  dynamicNavColor?: boolean // Auto-switch nav color based on content below
  showSearch?: boolean     // Show search icon in header
}

export interface SiteFooterConfig {
  companyName: string
  logoUrl?: string         // URL to footer logo image/SVG
  tagline: string
  contactHeading?: string
  contact: { email: string; phone: string }
  columns: { heading: string; links: { label: string; href: string }[] }[]
  copyright: string
}

export const defaultHeader: SiteHeaderConfig = {
  logoText: 'Livskompass',
  navItems: [
    { label: 'ACT', href: '/act' },
    { label: 'Utbildningar', href: '/utbildningar' },
    { label: 'Material', href: '/material' },
    {
      label: 'Om oss',
      href: '#',
      children: [
        { label: 'Mindfulness', href: '/mindfulness' },
        { label: 'Forskning på metoden', href: '/forskning-pa-metoden' },
        { label: 'Om Fredrik Livheim', href: '/om-fredrik-livheim' },
      ],
    },
    { label: 'Kontakt', href: '/kontakt' },
    { label: 'Nyheter', href: '/nyhet' },
  ],
}

export const defaultFooter: SiteFooterConfig = {
  companyName: 'Livskompass',
  tagline: 'ACT och mindfulnessträning med Fredrik Livheim',
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

// Default homepage slug — used by the router to resolve "/" to a page
export const DEFAULT_HOMEPAGE_SLUG = 'home-2'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSiteSettings, type SiteHeaderConfig, type SiteFooterConfig } from '../lib/api'

interface NavItem {
  name: string
  href: string
  children?: { name: string; href: string }[]
}

// Fallback values used when no site settings are saved in the DB
const defaultHeaderConfig: SiteHeaderConfig = {
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

const defaultFooterConfig: SiteFooterConfig = {
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

function configToNavItems(config: SiteHeaderConfig): NavItem[] {
  return config.navItems.map((item) => ({
    name: item.label,
    href: item.href,
    children: item.children?.map((child) => ({ name: child.label, href: child.href })),
  }))
}

// ---------------------------------------------------------------------------
// Desktop dropdown
// ---------------------------------------------------------------------------

function DesktopDropdown({ item, isActive }: { item: NavItem; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const linkActiveClass = isActive(item.href)
    ? 'text-forest-600 font-medium'
    : 'text-stone-600 hover:text-forest-600'

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        className={`text-[0.9375rem] transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-[0.9375rem] transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.name}
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-64 bg-white rounded-[14px] shadow-lg border border-stone-200 p-2 z-50 animate-scale-in origin-top"
          role="menu"
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              role="menuitem"
              className={`block px-3 py-2 text-sm rounded-[10px] transition-colors duration-150 ${
                isActive(child.href)
                  ? 'text-forest-600 bg-forest-50 font-medium'
                  : 'text-stone-700 hover:text-forest-600 hover:bg-stone-50'
              }`}
              onClick={() => setOpen(false)}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile dropdown
// ---------------------------------------------------------------------------

function MobileDropdown({ item, isActive, onNavigate }: { item: NavItem; isActive: (href: string) => boolean; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false)

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={`block px-3 py-2.5 text-base rounded-[10px] transition-colors ${
          isActive(item.href) ? 'text-forest-600 bg-forest-50 font-medium' : 'text-stone-700 hover:text-forest-600 hover:bg-stone-50'
        }`}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <Link
          to={item.href}
          onClick={onNavigate}
          className={`flex-1 px-3 py-2.5 text-base rounded-l-[10px] transition-colors ${
            isActive(item.href) ? 'text-forest-600 bg-forest-50 font-medium' : 'text-stone-700 hover:text-forest-600 hover:bg-stone-50'
          }`}
        >
          {item.name}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2.5 rounded-r-[10px] transition-colors ${
            expanded ? 'text-forest-600 bg-forest-50' : 'text-stone-400 hover:text-forest-600 hover:bg-stone-50'
          }`}
          aria-expanded={expanded}
          aria-label={`Visa undersidor för ${item.name}`}
        >
          <svg className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="pl-4 border-l-2 border-forest-100 ml-3 mt-1 mb-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className={`block px-3 py-1.5 text-sm rounded-[10px] transition-colors ${
                isActive(child.href) ? 'text-forest-600 bg-forest-50 font-medium' : 'text-stone-500 hover:text-forest-600 hover:bg-stone-50'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })

  const headerConfig = siteData?.header || defaultHeaderConfig
  const footerConfig = siteData?.footer || defaultFooterConfig
  const navigation = configToNavItems(headerConfig)

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-primary)' }}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Hoppa till innehåll
      </a>

      {/* Frosted glass sticky header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(16px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
          borderBottom: '1px solid var(--surface-glass-border)',
        }}
      >
        <nav
          aria-label="Huvudnavigering"
          className="mx-auto"
          style={{ maxWidth: 'var(--width-wide)', paddingInline: 'var(--container-px)' }}
        >
          <div className="flex justify-between h-16 lg:h-[72px]">
            <div className="flex">
              <Link to="/" className="flex items-center hover:opacity-75 transition-opacity">
                <span
                  className="font-display text-forest-950"
                  style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}
                >
                  {headerConfig.logoText}
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-5 xl:space-x-7">
              {navigation.map((item) => (
                <DesktopDropdown key={item.name} item={item} isActive={isActive} />
              ))}
            </div>

            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-[10px] text-stone-700 hover:text-forest-600 hover:bg-stone-100 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Visa navigeringsmeny"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div
              className="lg:hidden border-t py-3 pb-4 animate-fade-up"
              style={{ borderColor: 'var(--surface-glass-border)' }}
            >
              {navigation.map((item) => (
                <MobileDropdown
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          )}
        </nav>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-white mt-auto" role="contentinfo">
        <div
          className="mx-auto"
          style={{
            maxWidth: 'var(--width-content)',
            paddingInline: 'var(--container-px)',
            paddingTop: 'var(--section-md)',
            paddingBottom: 'var(--section-sm)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <div>
              <span className="font-display text-xl text-white block mb-4">{footerConfig.companyName}</span>
              <p className="text-stone-400 leading-relaxed text-[0.9375rem]">
                {footerConfig.tagline}
              </p>
            </div>
            <div>
              <h3 className="text-h4 mb-4">Kontakt</h3>
              <p className="text-stone-400 leading-relaxed text-[0.9375rem]">
                {footerConfig.contact.email}<br />
                {footerConfig.contact.phone}
              </p>
            </div>
            {footerConfig.columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-h4 mb-4">{col.heading}</h3>
                <ul className="space-y-2" aria-label={col.heading}>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-stone-400 hover:text-white transition-colors duration-200 text-[0.9375rem]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center text-stone-500 text-caption">
            <p>{footerConfig.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

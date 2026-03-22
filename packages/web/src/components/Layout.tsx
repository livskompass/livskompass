import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSiteSettings, getMediaUrl } from '../lib/api'
import { defaultHeader, defaultFooter, type SiteHeaderConfig } from '@livskompass/shared'
import { SiteSearch, SearchButton } from './SiteSearch'
import { Search } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  children?: { name: string; href: string }[]
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

function DesktopDropdown({ item, isActive, onSearchClick }: { item: NavItem; isActive: (href: string) => boolean; onSearchClick?: () => void }) {
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
    ? 'font-medium opacity-100'
    : 'opacity-75 hover:opacity-100'

  // Special #search nav item → render search button
  if (item.href === '#search' && onSearchClick) {
    return <SearchButton onClick={onSearchClick} />
  }

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        className={`font-normal transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 font-normal transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}
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
          className="absolute left-0 top-full mt-2 w-64 bg-surface-elevated rounded-[14px] shadow-lg border border-default p-2 z-50 animate-scale-in origin-top"
          role="menu"
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              role="menuitem"
              className={`block px-3 py-2 text-body-sm rounded-[10px] transition-colors duration-150 ${
                isActive(child.href)
                  ? 'text-accent bg-accent-soft font-medium'
                  : 'text-brand hover:text-accent hover:bg-surface'
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

function MobileDropdown({ item, isActive, onNavigate, onSearchClick }: { item: NavItem; isActive: (href: string) => boolean; onNavigate: () => void; onSearchClick?: () => void }) {
  const [expanded, setExpanded] = useState(false)

  // Special #search nav item
  if (item.href === '#search' && onSearchClick) {
    return (
      <button
        type="button"
        onClick={() => { onNavigate(); onSearchClick() }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-brand hover:text-accent hover:bg-surface transition-colors w-full text-left"
      >
        <Search className="w-4 h-4" />
        {item.name}
      </button>
    )
  }

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={`block px-3 py-2.5 rounded-[10px] transition-colors ${
          isActive(item.href) ? 'text-accent bg-accent-soft font-medium' : 'text-brand hover:text-accent hover:bg-surface'
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
          className={`flex-1 px-3 py-2.5 rounded-l-[10px] transition-colors ${
            isActive(item.href) ? 'text-accent bg-accent-soft font-medium' : 'text-brand hover:text-accent hover:bg-surface'
          }`}
        >
          {item.name}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2.5 rounded-r-[10px] transition-colors ${
            expanded ? 'text-accent bg-accent-soft' : 'text-faint hover:text-accent hover:bg-surface'
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
              className={`block px-3 py-1.5 text-body-sm rounded-[10px] transition-colors ${
                isActive(child.href) ? 'text-accent bg-accent-soft font-medium' : 'text-muted hover:text-accent hover:bg-surface'
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
  const [dynamicColor, setDynamicColor] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })

  const headerConfig = siteData?.header || defaultHeader
  const footerConfig = siteData?.footer || defaultFooter
  const navigation = configToNavItems(headerConfig)

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  // Dynamic nav color — read data-nav-theme from the first section (set by Hero)
  useEffect(() => {
    if (!headerConfig.dynamicNavColor) {
      setDynamicColor(null)
      return
    }
    const detect = () => {
      // Find the first section with data-nav-theme
      const themed = document.querySelector('[data-nav-theme]') as HTMLElement | null
      if (!themed) {
        setDynamicColor(null) // no hero → keep manual color
        return
      }

      const theme = themed.getAttribute('data-nav-theme') // 'dark' or 'light'
      const manualColor = headerConfig.navColor || 'text-forest-800'
      const isManualLight = manualColor.includes('white') || manualColor.includes('amber')

      if (theme === 'dark' && !isManualLight) {
        // Dark hero but manual color is dark → override to white
        setDynamicColor('text-white')
      } else if (theme === 'light' && isManualLight) {
        // Light hero but manual color is light → override to dark
        setDynamicColor('text-forest-800')
      } else {
        // Manual color already has good contrast → keep it
        setDynamicColor(null)
      }
    }

    const timer = setTimeout(detect, 200)
    return () => clearTimeout(timer)
  }, [location.pathname, headerConfig.dynamicNavColor, headerConfig.navColor])

  const navColorClass = dynamicColor || headerConfig.navColor || 'text-forest-800'

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-primary)' }}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-body-sm focus:font-medium"
      >
        Hoppa till innehåll
      </a>

      {/* Transparent overlapping header */}
      <header
        className={`absolute top-0 left-0 right-0 z-50 ${navColorClass}`}
        style={{
          background: 'transparent',
        }}
      >
        <nav
          aria-label="Huvudnavigering"
          className="mx-auto"
          style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}
        >
          <div className="flex justify-between h-16 lg:h-[72px]">
            <div className="flex">
              <Link to="/" className="flex items-center hover:opacity-75 transition-opacity">
                {headerConfig.logoUrl ? (
                  <img
                    src={getMediaUrl(headerConfig.logoUrl)}
                    alt={headerConfig.logoText || 'Logo'}
                    className="h-8 lg:h-9 w-auto"
                  />
                ) : (
                  <span
                    className="font-display"
                    style={{ fontSize: '1.375rem', letterSpacing: '-0.01em', color: 'inherit' }}
                  >
                    {headerConfig.logoText}
                  </span>
                )}
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-5 xl:space-x-7">
              {navigation.map((item) => (
                <DesktopDropdown key={item.name} item={item} isActive={isActive} onSearchClick={() => setSearchOpen(true)} />
              ))}
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-[10px] text-brand hover:text-accent hover:bg-surface-alt transition-colors"
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
                  onSearchClick={() => setSearchOpen(true)}
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
              {footerConfig.logoUrl ? (
                <img
                  src={getMediaUrl(footerConfig.logoUrl)}
                  alt={footerConfig.companyName}
                  className="h-8 w-auto mb-4 brightness-0 invert"
                />
              ) : (
                <span className="font-display text-h4 text-white block mb-4">{footerConfig.companyName}</span>
              )}
              <p className="text-faint leading-relaxed font-normal">
                {footerConfig.tagline}
              </p>
            </div>
            <div>
              <h3 className="text-h4 mb-4">{footerConfig.contactHeading || 'Kontakt'}</h3>
              <p className="text-faint leading-relaxed font-normal">
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
                      {link.href === '#search' ? (
                        <button
                          type="button"
                          onClick={() => setSearchOpen(true)}
                          className="text-faint hover:text-white transition-colors duration-200 font-normal flex items-center gap-1.5"
                        >
                          <Search className="w-3.5 h-3.5" />
                          {link.label}
                        </button>
                      ) : (
                      <Link
                        to={link.href}
                        className="text-faint hover:text-white transition-colors duration-200 font-normal"
                      >
                        {link.label}
                      </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center text-muted text-caption">
            <p>{footerConfig.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
          </div>
        </div>
      </footer>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

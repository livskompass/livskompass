import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPages, type Page } from '../lib/api'

interface NavItem {
  name: string
  href: string
  parentSlug?: string
  children?: { name: string; href: string }[]
}

const baseNavigation: NavItem[] = [
  { name: 'ACT', href: '/act', parentSlug: 'act' },
  { name: 'Utbildningar', href: '/utbildningar', parentSlug: 'utbildningar' },
  { name: 'Material', href: '/material', parentSlug: 'material' },
  { name: 'Mindfulness', href: '/mindfulness', parentSlug: 'mindfulness' },
  { name: 'Forskning på metoden', href: '/forskning-pa-metoden', parentSlug: 'forskning-pa-metoden' },
  { name: 'Om Fredrik Livheim', href: '/om-fredrik-livheim' },
  { name: 'Kontakt', href: '/kontakt' },
  { name: 'Nyheter', href: '/nyhet' },
]

const footerNavigation = baseNavigation.map(({ name, href }) => ({ name, href }))

function buildNavigation(pages: Page[]): NavItem[] {
  return baseNavigation.map((item) => {
    if (!item.parentSlug) return item
    const children = pages
      .filter((p) => p.parent_slug === item.parentSlug)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p) => ({ name: p.title, href: `/${p.slug}` }))
    return children.length > 0 ? { ...item, children } : item
  })
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

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        className={`text-sm transition-colors whitespace-nowrap ${
          isActive(item.href)
            ? 'text-primary-600 font-medium'
            : 'text-neutral-600 hover:text-primary-600'
        }`}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <Link
        to={item.href}
        className={`inline-flex items-center gap-1 text-sm transition-colors whitespace-nowrap ${
          isActive(item.href) ? 'text-primary-600 font-medium' : 'text-neutral-600 hover:text-primary-600'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.name}
        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Link>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg ring-1 ring-neutral-200/50 py-2 z-50" role="menu">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              role="menuitem"
              className={`block px-4 py-2 text-sm transition-colors ${
                isActive(child.href)
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
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
        className={`block px-3 py-2 text-base rounded-lg transition-colors ${
          isActive(item.href) ? 'text-primary-600 bg-primary-50 font-medium' : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
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
          className={`flex-1 px-3 py-2 text-base rounded-l-lg transition-colors ${
            isActive(item.href) ? 'text-primary-600 bg-primary-50 font-medium' : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
          }`}
        >
          {item.name}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2 rounded-r-lg transition-colors ${
            expanded ? 'text-primary-600 bg-primary-50' : 'text-neutral-400 hover:text-primary-600 hover:bg-neutral-50'
          }`}
          aria-expanded={expanded}
          aria-label={`Visa undersidor för ${item.name}`}
        >
          <svg className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="pl-4 border-l-2 border-primary-100 ml-3 mt-1 mb-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isActive(child.href) ? 'text-primary-600 bg-primary-50 font-medium' : 'text-neutral-500 hover:text-primary-600 hover:bg-neutral-50'
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

  const { data: pagesData } = useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    staleTime: 5 * 60 * 1000,
  })

  const navigation = pagesData?.pages ? buildNavigation(pagesData.pages) : baseNavigation

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-neutral-200/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold text-primary-600">Livskompass</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              {navigation.map((item) => (
                <DesktopDropdown key={item.name} item={item} isActive={isActive} />
              ))}
            </div>

            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
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
            <div className="lg:hidden border-t border-neutral-200 py-2 pb-4 animate-menu-enter">
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

      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Livskompass</h3>
              <p className="text-neutral-400 leading-relaxed">
                ACT och mindfulness utbildningar med Fredrik Livheim
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-neutral-400 leading-relaxed">
                Fredrik Livheim<br />
                livheim@gmail.com<br />
                070-694 03 64
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Länkar</h3>
              <ul className="space-y-2">
                {footerNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Livskompass. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

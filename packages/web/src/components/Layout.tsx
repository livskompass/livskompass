import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPages, type Page } from '../lib/api'

/**
 * Navigation item with optional children for dropdown menus.
 * Children are populated dynamically from the pages API based on parent_slug.
 */
interface NavItem {
  name: string
  href: string
  /** Slug used to match children from the DB (parent_slug field) */
  parentSlug?: string
  children?: { name: string; href: string }[]
}

/**
 * Static navigation structure. The parentSlug field is used to look up
 * child pages from the API. Items without parentSlug have no dropdown.
 *
 * Dedicated routes (utbildningar, material, kontakt, nyhet) link to their
 * custom components. Everything else links to /:slug which is handled
 * by the generic Page component.
 */
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

/** Flat list of nav items for the footer (no dropdowns needed there) */
const footerNavigation = baseNavigation.map(({ name, href }) => ({ name, href }))

/**
 * Merge child pages from the API into the static nav structure.
 * Pages with a parent_slug that matches a nav item's parentSlug
 * become dropdown children of that nav item.
 */
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
// Desktop dropdown component
// ---------------------------------------------------------------------------

function DesktopDropdown({
  item,
  isActive,
}: {
  item: NavItem
  isActive: (href: string) => boolean
}) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const openMenu = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!item.children || item.children.length === 0) {
    // Simple link, no dropdown
    return (
      <Link
        to={item.href}
        className={`transition-colors whitespace-nowrap ${
          isActive(item.href)
            ? 'text-primary-600 font-medium'
            : 'text-gray-600 hover:text-primary-600'
        }`}
      >
        {item.name}
      </Link>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <Link
        to={item.href}
        className={`inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
          isActive(item.href)
            ? 'text-primary-600 font-medium'
            : 'text-gray-600 hover:text-primary-600'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.name}
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Link>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-2 z-50"
          role="menu"
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              role="menuitem"
              className={`block px-4 py-2 text-sm transition-colors ${
                isActive(child.href)
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
// Mobile dropdown component
// ---------------------------------------------------------------------------

function MobileDropdown({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem
  isActive: (href: string) => boolean
  onNavigate: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={`block px-3 py-2 text-base rounded-md transition-colors ${
          isActive(item.href)
            ? 'text-primary-600 bg-primary-50 font-medium'
            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
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
          className={`flex-1 px-3 py-2 text-base rounded-l-md transition-colors ${
            isActive(item.href)
              ? 'text-primary-600 bg-primary-50 font-medium'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          {item.name}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2 rounded-r-md transition-colors ${
            expanded
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'
          }`}
          aria-expanded={expanded}
          aria-label={`Visa undersidor för ${item.name}`}
        >
          <svg
            className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
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
              className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive(child.href)
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
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
// Main Layout component
// ---------------------------------------------------------------------------

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Fetch pages to build the hierarchy for dropdown menus
  const { data: pagesData } = useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const navigation = pagesData?.pages
    ? buildNavigation(pagesData.pages)
    : baseNavigation

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm relative z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">Livskompass</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navigation.map((item) => (
                <DesktopDropdown
                  key={item.name}
                  item={item}
                  isActive={isActive}
                />
              ))}
            </div>

            {/* Mobile hamburger button */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
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

          {/* Mobile navigation menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-2 pb-4">
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Livskompass</h3>
              <p className="text-gray-400">
                ACT och mindfulness utbildningar med Fredrik Livheim
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-gray-400">
                Fredrik Livheim<br />
                livheim@gmail.com<br />
                070-694 03 64
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Länkar</h3>
              <ul className="space-y-2">
                {footerNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Livskompass. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSiteSettings, getMediaUrl } from '../lib/api'
import { defaultHeader, type SiteHeaderConfig } from '@livskompass/shared'
import { SearchButton } from './SiteSearch'
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

  if (item.href === '#search' && onSearchClick) {
    return <SearchButton onClick={onSearchClick} />
  }

  if (!item.children || item.children.length === 0) {
    return (
      <Link to={item.href} className={`font-normal transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}>
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
        <div className="absolute left-0 top-full mt-2 w-64 bg-surface-elevated rounded-[14px] shadow-lg border border-default p-2 z-50 animate-scale-in origin-top" role="menu">
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

function MobileDropdown({ item, isActive, onNavigate, onSearchClick }: { item: NavItem; isActive: (href: string) => boolean; onNavigate: () => void; onSearchClick?: () => void }) {
  const [expanded, setExpanded] = useState(false)

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

interface SiteHeaderProps {
  onSearchOpen: () => void
  /** When true, renders position:relative instead of absolute (for design-system isolated preview). */
  staticPosition?: boolean
}

export function SiteHeader({ onSearchOpen, staticPosition = false }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dynamicColor, setDynamicColor] = useState<string | null>(null)
  const location = useLocation()

  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })

  const headerConfig = siteData?.header || defaultHeader
  const navigation = configToNavItems(headerConfig)

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!headerConfig.dynamicNavColor) {
      setDynamicColor(null)
      return
    }
    const detect = () => {
      const themed = document.querySelector('[data-nav-theme]') as HTMLElement | null
      if (!themed) {
        const manualColor = headerConfig.navColor || 'text-forest-800'
        const isManualLight = manualColor.includes('white') || manualColor.includes('amber')
        setDynamicColor(isManualLight ? 'text-forest-800' : null)
        return
      }
      const theme = themed.getAttribute('data-nav-theme')
      const manualColor = headerConfig.navColor || 'text-forest-800'
      const isManualLight = manualColor.includes('white') || manualColor.includes('amber')
      if (theme === 'dark' && !isManualLight) setDynamicColor('text-white')
      else if (theme === 'light' && isManualLight) setDynamicColor('text-forest-800')
      else setDynamicColor(null)
    }
    const timer = setTimeout(detect, 200)
    return () => clearTimeout(timer)
  }, [location.pathname, headerConfig.dynamicNavColor, headerConfig.navColor])

  const navColorClass = dynamicColor || headerConfig.navColor || 'text-forest-800'
  const isNavLight = navColorClass.includes('white') || navColorClass.includes('amber')

  const logoSizeMap = {
    xs:     'h-4 lg:h-5',
    small:  'h-6 lg:h-7',
    medium: 'h-8 lg:h-9',
    large:  'h-10 lg:h-12',
  }
  const logoSizeClass = logoSizeMap[headerConfig.logoSize || 'medium']

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const positionClass = staticPosition ? 'relative' : 'absolute top-0 left-0 right-0 z-50'

  return (
    <header className={`${positionClass} ${navColorClass}`} style={{ background: 'transparent' }}>
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
                  className={`${logoSizeClass} w-auto transition-[filter] duration-200`}
                  style={headerConfig.logoDynamic ? {
                    filter: isNavLight ? 'brightness(0) invert(1)' : 'brightness(0)',
                  } : undefined}
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
              <DesktopDropdown key={item.name} item={item} isActive={isActive} onSearchClick={onSearchOpen} />
            ))}
            {headerConfig.showSearch && <SearchButton onClick={onSearchOpen} />}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            {headerConfig.showSearch && <SearchButton onClick={onSearchOpen} />}
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
                onSearchClick={onSearchOpen}
              />
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
